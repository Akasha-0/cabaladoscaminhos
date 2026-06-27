# ADR-0003: Use pgvector para embeddings (RAG da Akasha IA)

## Status

Accepted

Data: 2026-06-26
Autor: time Akasha Portal
Relacionado a: [VISION.md §2, §3, §8](../../VISION.md), [ADR-0002](0002-use-supabase-as-backend.md)

## Contexto

A Akasha IA (Fase 3) precisa responder perguntas sobre espiritualidade, tradições e práticas correlacionando com **biblioteca de artigos, papers científicos e experiências da comunidade**. O approach é RAG (Retrieval-Augmented Generation):

1. Ao receber pergunta, **buscar contexto relevante** em base de conhecimento
2. Passar contexto + pergunta para o LLM (OpenAI, MiniMax ou Anthropic)
3. LLM gera resposta fundamentada, **citando fontes**

Para a **etapa 1 (busca)** precisamos:
- Vetorizar cada documento (artigo, paper, relato) em **embedding** (vetor denso de 1536 dimensões para OpenAI `text-embedding-3-small`)
- Indexar esses embeddings para **busca por similaridade semântica**
- Combinar busca semântica + filtros estruturados (tradição, nível de evidência, idioma)
- Atualizar índice de forma **incremental** (não rebuild a cada post novo)

Restrições:
- Precisamos manter **Postgres como banco único** (decisão do [ADR-0002](0002-use-supabase-as-backend.md)) — não introduzir Elasticsearch/Pinecone/Weaviate como serviço separado
- Volume esperado: **~10k artigos** + **~50k relatos de comunidade** + **~1k papers** na Fase 3
- Latência da busca: **< 200ms** (p99) para manter a sensação de "consciência viva"
- Custo: zero ou marginal — não podemos pagar Pinecone ($70/mês mínimo) na Fase 3

Drivers:
- **Co-evolução** (VISION.md §2.4): cada post novo vira embedding e melhora a IA
- **Tradução universalista** (§2.3): busca semântica permite "ayahuasca" encontrar "psicodélicos amazônicos" sem keyword matching
- **Citação obrigatória** (§9): RAG permite ao LLM citar artigo específico com link

## Decisão

Adotamos a extensão **`pgvector`** rodando dentro do **mesmo Postgres do Supabase** (não um vector store separado).

**Configuração:**
- Extensão: `vector` (versão 0.7+)
- Coluna de embedding: `vector(1536)` (compatível com OpenAI `text-embedding-3-small`)
- Índice: **HNSW** (Hierarchical Navigable Small Worlds) com `vector_cosine_ops` — melhor recall/latência que IVFFlat
- Geração de embeddings: job em batch via Vercel Cron (artigos) + on-write (posts novos)
- Modelo de embedding: **OpenAI `text-embedding-3-small`** ($0.02/1M tokens — barato)
- Distância: **cosine** (padrão para embeddings normalizados)
- Hybrid search: pgvector (semântica) + tsvector (full-text) + filtros WHERE estruturados

**Schema (resumo):**
```sql
-- Habilita extensão
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de embeddings por chunk
CREATE TABLE document_chunk (
  id            text PRIMARY KEY,
  document_id   text NOT NULL,
  document_type text NOT NULL, -- 'article' | 'paper' | 'post' | 'tradition'
  chunk_index   int  NOT NULL,
  content       text NOT NULL,
  embedding     vector(1536) NOT NULL,
  metadata      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

-- Índice HNSW para busca rápida
CREATE INDEX document_chunk_embedding_idx
  ON document_chunk
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Função RPC para busca híbrida
CREATE FUNCTION search_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb
) RETURNS TABLE (...);
```

**Decisões correlatas:**
- [ADR-0002](0002-use-supabase-as-backend.md): pgvector roda dentro do Supabase Postgres
- [ADR-0004](0004-akasha-ia-as-translator-not-curator.md): embeddings alimentam o retrieval do LLM
- ADR interno `/adr/0008-openai-as-primary-llm`: define o modelo de embedding também

## Consequências

### Positivas

- **Sem serviço extra** — embeddings no mesmo DB que o resto; zero nova infra, zero novo custo de vendor
- **Transações ACID** — ao criar post, podemos criar embedding na mesma transação (consistência forte)
- **Hybrid search nativo** — combinar `tsvector @@ plainto_tsquery(...)` com `<=> embedding` no mesmo SQL é trivial; outras soluções exigiriam federated query
- **Custo marginal** — pgvector é extensão open-source, sem cobrança por query/vetor armazenado. $25/mês do Supabase Pro cobre
- **SQL familiar** — debugar busca, ajustar thresholds, criar filtros complexos: tudo SQL
- **Open source** — se um dia precisarmos migrar do Supabase, pgvector migra junto (Postgres + pgvector é combo portável)
- **Backup unificado** — backup do Supabase inclui embeddings; nada para sincronizar
- **Supabase Studio** — mostra dados, permite queries ad-hoc direto no dashboard

### Negativas

- **Performance vs Pinecone/Weaviate** — pgvector é ~2-3x mais lento que Pinecone em escala massiva (>10M vetores). Para nosso volume (60k chunks), irrelevante. Mas se explodir para 10M+, sentiremos
- **HNSW consome RAM** — índice HNSW com 60k vetores de 1536 dim = ~3-5GB RAM. Cabe no Supabase Pro (8GB), mas aperta
- **Cold start do projeto free** — primeira query após inatividade (7 dias) demora 5-10s; embeddings são particularmente lentos no cold start
- **Limitado a 2000 dimensões** — se OpenAI lançar modelo com mais dims (improvável), temos que atualizar schema
- **Sem sharding nativo** — se DB ficar > 50GB, sharding é manual. Supabase Pro vai até 32GB no momento da escrita
- **HNSW não pode ser reindexado online trivialmente** — recriar índice com parâmetros melhores exige downtime pequeno ou lock contention
- **Backup/restore com HNSW** — restaurar backup demora mais que Postgres puro (índice precisa ser reconstruído)

### Neutras

- pgvector não tem "metadata filtering nativo" como Pinecone — implementamos via WHERE clauses (suficiente)
- Não temos dashboard de exploração de vetores (tipo Weaviate Console) — usamos queries SQL ad-hoc
- Suporte a multi-tenancy (separar embeddings por comunidade se um dia virar multi-tenant) precisa ser planejado, não vem de fábrica

## Alternativas consideradas

### 1. Pinecone (vector DB gerenciado)

- **Prós:** Performance excelente (escala para bilhões de vetores); SLA forte; console bonito; metadata filtering nativo; hybrid search próprio
- **Contras:** Custo ($70/mês mínimo no plano Standard, sobe rápido); vendor lock-in; não é Postgres; precisa ETL para manter sincronizado
- **Por que não:** Custo injustificável na Fase 3. Performance não é gargalo no nosso volume. ETL adiciona complexidade

### 2. Weaviate (self-hosted)

- **Prós:** Open source, performance excelente, hybrid search nativo, schema flexível, suporta multi-modal
- **Contras:** Serviço separado para operar (Docker, monitoramento, backup); não é Postgres; pequena curva de aprendizado; comunidade menor que Postgres
- **Por que não:** Introduz nova peça de infra. Para 60k vetores é overkill operacional

### 3. Qdrant

- **Prós:** Rust, super rápido; open source; bom API; cloud gerenciado disponível
- **Contras:** Mesmo problema do Weaviate — serviço separado; custo de operar; não-SQL-familiar
- **Por que não:** Mesma justificativa

### 4. Elasticsearch + dense_vector

- **Prós:** Já tem busca full-text madura; dense_vector nativo; ecossistema enorme
- **Contras:** Pesadíssimo em RAM (precisa 16GB+ para ficar feliz); operacionalmente complexo; custo alto no Elastic Cloud; over-engineering
- **Por que não:** Complexidade e custo não justificados. Postgres + tsvector + pgvector cobre nosso caso

### 5. OpenAI Assistants API (com file_search built-in)

- **Prós:** Zero código de infra; OpenAI gerencia embeddings + retrieval + storage; rápido de prototipar
- **Contras:** Vendor lock-in total com OpenAI; sem controle sobre indexação/retrieval; custo por query (não por embedding armazenado); sem hybrid search customizado; dados vão pra infra OpenAI (LGPD)
- **Por que não:** LGPD é problema sério (precisamos de DPA e controle). Lock-in e custo imprevisível

### 6. PostgreSQL full-text apenas (sem embeddings)

- **Prós:** Zero extensão; super rápido; trivial de usar
- **Contras:** Busca por keyword, não semântica — "ayahuasca" não acha "psicodélico amazônico"; sem compreensão de sinonímia; limitadíssimo para tradução universalista
- **Por que não:** Mata o coração da proposta da Akasha IA (correlação semântica entre tradições). Usamos tsvector **junto** com pgvector, não no lugar

### 7. Embeddings armazenados como JSONB + cálculo manual no app

- **Prós:** Sem extensão; flexibilidade total; SQL familiar
- **Contras:** Sem índice — busca vira `O(n)` scan completo na tabela. Para 60k chunks, cada query demora minutos. Absurdamente inviável
- **Por que não:** Não é alternativa real. pgvector existe justamente para resolver isso

## Referências

- [pgvector GitHub](https://github.com/pgvector/pgvector) — referência oficial
- [Supabase Vector docs](https://supabase.com/docs/guides/ai/vector-columns) — guia específico Supabase
- [HNSW paper](https://arxiv.org/abs/1603.09320) — algoritmo por trás do índice
- [OpenAI Embeddings guide](https://platform.openai.com/docs/guides/embeddings) — modelo usado
- [VISION.md §2 Capacidades da IA](../../VISION.md)
- [VISION.md §8 Fase 3 — Akasha IA](../../VISION.md)
- [ADR-0002: Use Supabase as Backend](0002-use-supabase-as-backend.md)
- [ADR-0004: Akasha IA as Translator](0004-akasha-ia-as-translator-not-curator.md)
- Benchmarks internos: Notion `/docs/vector-store-benchmark-2026-q2`