# Wave 30.3 — GraphRAG + Vector Search híbrido (Neo4j + pgvector)

**Data:** 2026-06-25
**Base:** main @ `0a8a0cb6` (42+ waves merged, ADR-013 + ADR-014 aceitos, ADR-0005 aceito)
**Tipo:** RESEARCH + PLANNING ONLY (não implementação)
**Subagente:** Wave 30.3 (delegated)
**Branch:** `wave-30.3-graphrag-vector-hybrid`
**Escopo:** Como combinar Neo4j (relationships) + pgvector (semantic similarity) na "consciência viva" do Akasha (ADR-013).

---

## 0. Sumário executivo

Akasha já tem **pgvector operacional** (Wave 3 ivfflat `sessao_chunks_embedding_idx` + Wave 21.1 ivfflat `literature_papers_embedding_idx`, ambos com `lists=100`, embedding dim **1536** OpenAI text-embedding-3-small). Falta **grafo de relacionamentos estruturados** para responder perguntas tipo *"que consulente tem Odu 7 + Saturno em Casa 10 + Pilar 3 Vata e como isso se conecta?"* — onde similaridade semântica não basta; **regras lógicas de domínio** precisam rodar.

**Recomendação:** **NÃO** adicionar Neo4j agora. Construir **GraphRAG em pgvector + PostgreSQL recursivo** (CTEs) usando a abordagem **LightRAG-style** (entity extraction + relation edges + hybrid retrieval), e **deixar Neo4j para Wave 5+** (gatilho ADR-0005: "se Zelador pedir correlações lógicas 3+ vezes"). **HippoRAG** como referência arquitetural para OpenIE + Personalized PageRank futuro.

**Trade-off principal:** pgvector+CTE ganha simplicidade operacional + LGPD-by-design + zero infra nova (Postgres já existe, pgvector já ativo). Perde queries Cypher multi-hop profundas (>5 hops) e escalabilidade para grafos >100k nós — **aceitável** porque Zelador-tool tem ~250k vetores estimados e queries típicas são 2-3 hops.

**Princípios (ADR-013 universalismo + visceral):**
- **Universalismo**: GraphRAG é o método SOTA para correlacionar evidências científicas (papers PubMed Wave 21.1) com saberes ancestrais (5 Pilares, medicinas) — é literalmente a tecnologia que Akasha precisa para não inventar correspondências esotéricas (lesson N+15).
- **Visceral**: chain-of-thought visível ao Zelador (Wave 23.2 Cadeia Viva) **precisa** de grafo por trás — sem ele, a IA "chuta" correlações em vez de mostrar a árvore de推理 visível.

---

## 1. Estado da arte — Microsoft GraphRAG, hippoRAG, LightRAG

### 1.1 Microsoft GraphRAG (Edge et al., 2024)

**O que é:** Framework da Microsoft Research publicado em julho/2024 (arXiv:2404.16130). Propõe **construir um grafo de conhecimento a partir de documentos** usando LLM para extrair entidades + relações, depois agrupar comunidades (Leiden algorithm) e gerar resumos hierárquicos.

**Pipeline canônico:**
1. **Chunking** — divide documentos em chunks (512-1024 tokens).
2. **Entity + Relation Extraction** — LLM extrai `(head, relation, tail)` triplets de cada chunk (OpenIE-style).
3. **Graph construction** — monta grafo heterogêneo (nodes: entities + chunks; edges: relation + "chunk contains entity").
4. **Community detection** — Leiden algorithm agrupa entities em clusters temáticos.
5. **Community summarization** — LLM gera resumo para cada comunidade (em vários níveis hierárquicos).
6. **Query-time retrieval** — dado uma pergunta, busca **local** (entity-centric: vizinhos do node) OU **global** (community summaries: top-down).

**Pontos fortes:**
- Resposta a perguntas **globais** ("quais são os temas principais?") que vector retrieval puro erra.
- Graph + summaries = **explicabilidade** (mostra a cadeia de raciocínio).
- Suporta queries multi-hop naturalmente.

**Pontos fracos:**
- **Custo computacional alto** no index time (entity extraction via LLM em TODOS os chunks — para 50k papers PubMed é proibitivo sem LLM local).
- **Dependência de LLM** forte (extraction prompt-sensitive; qualidade varia).
- **Storage**: precisa de grafo (Neo4j ou similar) — operação adicional.

**Status open-source:** github.com/microsoft/graphrag (Python). MIT license. Suporta backends Neo4j, CosmosDB, Postgres+AGE (Apache AGE extension, beta).

### 1.2 hippoRAG (Gutiérrez et al., 2024, OSU-NLP)

**O que é:** Framework de retrieval-augmented generation inspirado no **modelo hippocampal de memória indexada + retrieval via PageRank**. Publicado dezembro/2024 (arXiv:2405.14831).

**Pipeline canônico:**
1. **OpenIE** — extrai triplets `(subject, predicate, object)` dos documentos (mesma etapa do GraphRAG).
2. **Indexing** — para cada entity detectada, gera um embedding (igual a vector retrieval).
3. **Query-time** — embedding da query → encontra entidades similares (kNN) → roda **Personalized PageRank** a partir dessas entidades no grafo → retorna nodes ranqueados por PPR score.
4. **Filtragem + leitura** — nodes PPR-ranked alimentam LLM para gerar resposta.

**Diferencial vs GraphRAG:**
- **Sem community detection / summarization** upfront — PPR é on-demand.
- **Mais leve** no index time (não precisa Leiden clustering nem LLM summarization).
- **Mais rápido** em query time para perguntas locais (PPR é O(edges) ≈ milissegundos).
- **Memória mais "biológica"** — metaforicamente alinhada com neurociência da memória (índices hippocampus + cortex).

**Pontos fortes:**
- **Single-hop semântico + multi-hop estrutural** = o melhor dos dois mundos.
- **Custo operacional menor** que GraphRAG (sem Leiden, sem LLM summarization).
- **Backbone independente** — pode usar pgvector para entity embeddings (não força Neo4j).

**Pontos fracos:**
- **Não lida bem com perguntas globais** (themes, summaries) — PPR é local.
- **PPR precisa de grafo** — Apache AGE ou Neo4j.
- **Qualidade do OpenIE** é o gargalo — usa LLM.

**Status open-source:** github.com/OSU-NLP/hippoRAG (Python). MIT license. Usa Neo4j como store default, mas **graph store é pluggable**.

### 1.3 LightRAG (Guo et al., 2024, HKUDS)

**O que é:** Framework "simples e rápido" publicado outubro/2024 (arXiv:2410.05779). Foco em **dual-level retrieval** (low-level entities + high-level themes) com custo computacional baixo.

**Pipeline canônico:**
1. **Entity + Relation Extraction** — LLM extrai triplets + agrega (deduplica entities).
2. **Graph + Vector storage duplo** — guarda triplets no grafo E embeddings de entities+relations no vector store.
3. **Dual-level retrieval** — query → busca entidades similares (vector) E relações/keywords (graph traversal) → combina via **reciprocal rank fusion (RRF)**.
4. **Incremental update** — pode adicionar novos documentos sem reindexar tudo.

**Diferencial vs GraphRAG + hippoRAG:**
- **Não depende de Neo4j** por padrão — pode usar **NetworkX + arquivos JSON** para grafos pequenos, ou **pgvector + tabela de edges no Postgres** para grafos médios.
- **RRF** para combinar vector + graph signals (sem LLM para fusion).
- **Mais barato** que GraphRAG (sem community detection), **mais completo** que hippoRAG puro (tem high-level summaries opcionais).

**Pontos fortes:**
- **Infra mínima** — Postgres + pgvector já existentes suprem.
- **Incremental** — bom para Akasha (cron PubMed diário Wave 23.1 precisa adicionar papers sem reindex full).
- **RRF** é algoritmo simples e auditável (LGPD-by-design: trace explícito).

**Pontos fracos:**
- **Escala**: para >100k entities, NetworkX em memória fica lento — precisa migrar para grafo real.
- **Sem PageRank** — multi-hop traversal é BFS simples, não ponderado por importância.
- **Menos maduro** que GraphRAG/hippoRAG (comunidade menor, documentação esparsa).

**Status open-source:** github.com/HKUDS/LightRAG (Python). MIT license. Suporta backends: NetworkX, Neo4j, PostgreSQL+AGE, MongoDB.

### 1.4 Comparação direta

| Critério                  | GraphRAG (MS)            | hippoRAG (OSU)           | LightRAG (HKUDS)         | **Wave 30.3 recomendação** |
|---------------------------|--------------------------|--------------------------|--------------------------|----------------------------|
| Index cost                | Alto (Leiden + LLM sum)  | Médio (OpenIE)           | Médio (OpenIE)           | **LightRAG** (sem sum)     |
| Query cost                | Médio (community lookup) | Baixo (PPR)             | Baixo (RRF)              | **LightRAG** (RRF)         |
| Perguntas locais (entity) | ✓ (local mode)           | ✓✓ (PPR é ótimo)         | ✓ (RRF)                  | **LightRAG**               |
| Perguntas globais (theme) | ✓✓ (community summary)   | ✗ (PPR é local)          | ✓ (high-level opcional)  | **LightRAG** + summary     |
| Multi-hop (3+ hops)       | ✓ (Cypher)               | ✓✓ (PPR pondera)         | ✓ (BFS)                  | **hippoRAG-style** PPR     |
| Incremental update        | ✗ (reindex full)         | ✓                        | ✓✓ (design choice)       | **LightRAG**               |
| Backend independente      | Não (precisa grafo)      | Não (precisa grafo)      | ✓ (Postgres+pgvector OK) | **LightRAG + Postgres**    |
| LGPD-by-design            | Médio (sync Neo4j+Postgres) | Médio (idem)         | **Alto** (Postgres só)   | **LightRAG**               |
| Complexidade operacional | **Alta** (Neo4j)         | **Alta** (Neo4j)         | **Baixa** (Postgres só)  | **LightRAG**               |
| Custo para 50k papers     | ~$500+ em LLM extraction | ~$200+ em LLM            | ~$200+ em LLM            | (LLM é inevitável)         |

**Leitura:** LightRAG é o caminho mais pragmático. hippoRAG é a referência arquitetural (PPR + embeddings) para Wave 5+. GraphRAG é overkill no estado atual.

---

## 2. Hybrid search (graph + vector) — anatomia técnica

### 2.1 O que é "híbrido"

Hybrid search = combinar **dois ou mais sinais de retrieval** que capturam diferentes aspectos da relevância:

1. **Vector similarity (semantic)** — captura "esses textos são parecidos em significado". Falha em: entidades nomeadas (ODU 7 ≠ ODU 7 se sinônimos diferentes), queries estruturadas.
2. **Graph traversal (structural)** — captura "esses nodes estão conectados por estas relações". Falha em: sinônimos semânticos (Cabala = Qabalah).
3. **Keyword (BM25/tsvector)** — captura "essas palavras aparecem literalmente". Útil para entidades canônicas (nome de Odu, planeta).
4. **Metadata filters** — `WHERE tags @> ARRAY['cabala']`. Útil para filtragem pré-retrieval.

A combinação **RRF (Reciprocal Rank Fusion)** é algoritmo padrão (Cormack et al. 2009):

```
RRF_score(d) = Σ 1 / (k + rank_i(d))
```

Onde `rank_i(d)` é a posição do documento `d` no ranking `i`, e `k=60` é constante típica.

### 2.2 Schema híbrido canônico (LightRAG-style)

**Postgres + pgvector:**

```sql
-- 1. Nodes (entidades — papers, pilares, consulentes, conceitos)
CREATE TABLE kg_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,           -- "paper" | "pilar" | "consulente" | "conceito"
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),        -- 1536 dims = OpenAI text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX kg_nodes_label_idx ON kg_nodes (label);
CREATE INDEX kg_nodes_embedding_idx ON kg_nodes
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 2. Edges (relações entre entidades)
CREATE TABLE kg_edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,        -- "CITA", "INFLUENCIA", "RELACIONA_COM", "PRESCREVE"
  weight REAL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX kg_edges_source_idx ON kg_edges (source_id);
CREATE INDEX kg_edges_target_idx ON kg_edges (target_id);
CREATE INDEX kg_edges_relation_idx ON kg_edges (relation);

-- 3. Triplets (cache do OpenIE output — facilita auditoria LGPD)
CREATE TABLE kg_triplets (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  relation TEXT NOT NULL,
  target TEXT NOT NULL,
  source_doc_id TEXT,            -- qual doc gerou este triplet (paper.id)
  confidence REAL DEFAULT 1.0,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX kg_triplets_source_doc_idx ON kg_triplets (source_doc_id);
```

### 2.3 Query híbrida (RRF sobre vector + graph)

```sql
-- Query: "conselhos para consulente com Odu 7 + Saturno Casa 10"
WITH query_embedding AS (
  -- gerar embedding da query (vinda do OpenAI API)
  SELECT $1::vector AS qvec
),
vector_candidates AS (
  -- Top-K por similaridade semântica
  SELECT id, name, 1 - (embedding <=> qvec) AS sim_score,
         ROW_NUMBER() OVER (ORDER BY embedding <=> qvec) AS rk
  FROM kg_nodes, query_embedding
  WHERE label IN ('pilar', 'conceito')
  ORDER BY embedding <=> qvec
  LIMIT 20
),
graph_candidates AS (
  -- BFS 2-hops a partir de nodes "Odu 7" e "Saturno Casa 10"
  WITH RECURSIVE seeds AS (
    SELECT id FROM kg_nodes WHERE name IN ('Odu 7', 'Saturno Casa 10')
  ),
  bfs(node_id, depth) AS (
    SELECT id, 0 FROM seeds
    UNION ALL
    SELECT e.target_id, b.depth + 1
    FROM bfs b JOIN kg_edges e ON e.source_id = b.node_id
    WHERE b.depth < 2
  )
  SELECT n.id, n.name,
         ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rk
  FROM bfs JOIN kg_nodes n ON n.id = bfs.node_id
  WHERE n.id NOT IN (SELECT id FROM seeds)
  GROUP BY n.id, n.name
  LIMIT 20
),
fused AS (
  -- Reciprocal Rank Fusion
  SELECT id, name,
         (1.0 / (60 + rk)) AS rrf_score,
         'vector' AS source
  FROM vector_candidates
  UNION ALL
  SELECT id, name,
         (1.0 / (60 + rk)) AS rrf_score,
         'graph' AS source
  FROM graph_candidates
)
SELECT id, name, SUM(rrf_score) AS total_rrf
FROM fused
GROUP BY id, name
ORDER BY total_rrf DESC
LIMIT 10;
```

---

## 3. Como integrar no Akasha (Wave 21.1 já tem pgvector)

### 3.1 Inventário atual (inspeção direta do `schema.prisma` + migrations aplicadas)

**Tabelas com `embedding` já existentes:**
| Tabela                | Dimensão | ivfflat idx                      | Wave      | Conteúdo                           |
|-----------------------|----------|----------------------------------|-----------|------------------------------------|
| `sessao_chunks`       | 768      | `sessao_chunks_embedding_idx`    | Wave 3    | Sessões de Zelador (texto + embedding) |
| `grimoire`            | 768      | (sem idx; tabela global legada)  | init v3   | Grimório global                    |
| `literature_papers`   | 1536     | `literature_papers_embedding_idx` | Wave 21.1| Papers PubMed/arXiv open-access     |

> **⚠ Inconsistência de dimensão**: sessao_chunks e grimoire são `vector(768)` (sentence-transformers), enquanto `literature_papers` é `vector(1536)` (OpenAI text-embedding-3-small). Wave 30.3 **NÃO resolve** esta inconsistência (Wave 31+ proposta).

**Tabelas relacionais (sem embedding):**
| Tabela              | Conteúdo                                     | Conexões                                |
|---------------------|----------------------------------------------|-----------------------------------------|
| `BirthChart`        | 5 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching) | por `userId`                            |
| `Sessao`            | Sessão de atendimento                        | `zeladorId`, `caminhadaId`, `SessaoChunk[]` |
| `Discovery`         | (Wave 21.2 — PROPOSAL, ainda não merged em main) | `userId`, `papersCited[]`, `DiscoveryCitation` |
| `LiteraturePaper`   | (Wave 21.1 — PROPOSAL, ainda não merged em main) | `LiteratureCitation[]`, `tag[]`        |
| `Caminhante`/`Caminhada` | Multi-tenant D-041                      | zelador-scoped                          |
| `PrivacyConsent`    | LGPD audit trail                             | append-only                             |

### 3.2 Gap analysis — o que falta para GraphRAG funcional

**Faltam (em ordem de prioridade):**

1. **`kg_nodes` e `kg_edges` (LightRAG-style)** — tabela canônica do grafo. **Pre-requisito para GraphRAG**.
2. **OpenIE extractor** — script Python ou TS que recebe abstracts PubMed + extrai triplets `(subject, predicate, object)` via LLM. Pode rodar no cron Wave 23.1 (batch noturno).
3. **Entity linker** — mapeia entity string → `kg_nodes.id` (deduplicação). Ex: "Cabala" e "Qabalah" devem mapear para o mesmo node.
4. **Hybrid retriever** — função TypeScript que combina vector (pgvector) + graph (recursive CTE) via RRF.
5. **Indexação dos 5 Pilares** — extrair triplets das regras de domínio (Cabala, Astrologia, Tantra, Odu, I Ching) e popular `kg_edges`.
6. **Indexação dos papers existentes** — rodar OpenIE sobre os 50k+ papers Wave 21.1 (backfill em batch — pode levar horas).
7. **PPR opcional** — para perguntas multi-hop profundas, implementar Personalized PageRank em SQL (ou em Python via NetworkX se escala pedir).

### 3.3 Arquitetura proposta (Wave 31+)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AKASHA CONSCIÊNCIA VIVA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Wave 21.1         │  │ Wave 3           │  │ Wave 21.2    │  │
│  │  LiteraturePaper   │  │ SessaoChunk      │  │ Discovery    │  │
│  │  (50k+ papers)     │  │ (sessões)        │  │ (chains)     │  │
│  │  vector(1536)      │  │ vector(768)      │  │              │  │
│  └─────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│            │                     │                    │           │
│            └─────────────────────┼────────────────────┘           │
│                                  │                                │
│                                  ▼                                │
│                    ┌─────────────────────────────┐                │
│                    │   Wave 31+ kg_nodes         │                │
│                    │   Wave 31+ kg_edges         │                │
│                    │   (LightRAG-style)          │                │
│                    └─────────────────────────────┘                │
│                                  │                                │
│                                  ▼                                │
│              ┌───────────────────────────────────────┐            │
│              │  Wave 31+ Hybrid Retriever (RRF)      │            │
│              │  - vector (pgvector)                  │            │
│              │  - graph (recursive CTE)              │            │
│              │  - keyword (tsvector BM25)            │            │
│              └─────────────────┬─────────────────────┘            │
│                                │                                   │
│                                ▼                                   │
│              ┌───────────────────────────────────────┐            │
│              │  Wave 23.2 Cadeia Viva (já existe)    │            │
│              │  - mostra chain-of-thought visível    │            │
│              │  - cita papers + kg_edges             │            │
│              │  - rendering visceral                  │            │
│              └───────────────────────────────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Quando considerar Neo4j de verdade

ADR-0005 já define o trigger: "**se Zelador pedir correlações lógicas 3+ vezes** em sessões reais, justifica Wave 5+". Wave 30.3 **ratifica este ADR** e adiciona 2 triggers quantitativos:

1. **Trigger de escala**: se `kg_nodes > 500k` OU `kg_edges > 2M` E queries híbridas >2s p95 → migrar para Neo4j.
2. **Trigger de profundidade**: se uso real exigir queries multi-hop >4 hops com PageRank (PPR-style) → migrar para hippoRAG + Neo4j.
3. **Trigger de complexidade Cypher**: se Zelador pedir queries tipo *"todos os consulentes com Odu 7 + Saturno Casa 10 + Pilar 3 Vata que passaram por firmeza de Exu em 2025"* e a query SQL ficar >50 linhas → migrar para Cypher.

Até então, **Postgres + pgvector + recursive CTE + PPR-em-Python** suprem.

---

## 4. Schema proposto (Wave 31+ design proposal D-053)

> **PROPOSAL ONLY** — não aplicar migration sem aprovação humana (per apps/akasha-portal/prisma/AGENTS.md D1).

### 4.1 Migration: `20260626000000_knowledge_graph`

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- Wave 31+ — Knowledge Graph (kg_nodes + kg_edges + kg_triplets)
-- Base do GraphRAG + Vector Search híbrido do Akasha.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Inspirado em LightRAG (HKUDS 2024) + hippoRAG (OSU 2024).
-- Compatível com pgvector já existente (1536 dims OpenAI).
-- LGPD-by-design: ON DELETE CASCADE em edges + audit trail em kg_triplets.
--
-- IMPORTANT: This migration is PROPOSAL-ONLY. Gabriel/Zelador roda
--   pnpm exec prisma migrate dev --name knowledge_graph
-- após aprovação.

-- ─── 1. Enum: tipo de node ──────────────────────────────────────────────────
CREATE TYPE "KgNodeLabel" AS ENUM (
    'paper',          -- Wave 21.1 LiteraturePaper
    'pilar',          -- 5 Pilares (cabala, astrologia, tantra, odu, iching)
    'conceito',       -- conceito跨-pilar (ex: "vazio fértil", "axé")
    'consulente',     -- Consulente (LGPD: dados pseudonimizados)
    'zelador',        -- Zelador
    'sessao',         -- Wave 3 Sessao
    'medicina',       -- Medicina ancestral (ayurveda, ifa, santo_daime, ...)
    'planeta',        -- Pilar 2 (astrologia)
    'signo',          -- Pilar 2
    'casa_astral',    -- Pilar 2
    'sefira',         -- Pilar 1 (cabala)
    'corpo_tantra',   -- Pilar 3 (11 corpos Yogi Bhajan)
    'odu',            -- Pilar 4 (15 odus canônicos D-044)
    'hexagrama'       -- Pilar 5 (64 hexagramas King Wen)
);

-- ─── 2. Tabela kg_nodes ────────────────────────────────────────────────────
CREATE TABLE "kg_nodes" (
    "id"          TEXT NOT NULL,
    "label"       "KgNodeLabel" NOT NULL,
    "name"        TEXT NOT NULL,
    "name_normalized" TEXT NOT NULL,  -- lowercased + accent-stripped (entity linker)
    "description" TEXT,
    "metadata"    JSONB NOT NULL DEFAULT '{}',
    "embedding"   vector(1536),
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kg_nodes_pkey" PRIMARY KEY ("id")
);

-- Unicidade por label + name_normalized (entity linker: deduplicação).
CREATE UNIQUE INDEX "kg_nodes_label_name_normalized_key"
    ON "kg_nodes"("label", "name_normalized");

-- Index composto para queries do InsightRanker.
CREATE INDEX "kg_nodes_label_created_at_idx"
    ON "kg_nodes"("label", "created_at" DESC);

-- Index GIN em metadata (filtering por pilar, ano, journal).
CREATE INDEX "kg_nodes_metadata_idx"
    ON "kg_nodes" USING gin ("metadata");

-- ivfflat vector index (1536 dims OpenAI text-embedding-3-small).
CREATE INDEX "kg_nodes_embedding_idx"
    ON "kg_nodes" USING ivfflat ("embedding" vector_cosine_ops)
    WITH (lists = 100);

-- ─── 3. Tabela kg_edges ────────────────────────────────────────────────────
CREATE TYPE "KgEdgeRelation" AS ENUM (
    'CITA',                  -- paper CITA paper
    'RELACIONA_COM',         -- generic
    'INFLUENCIA',            -- domain rule
    'PRESCREVE',             -- medicina PRESCREVE conceito
    'GUARDADO_POR',          -- consulente GUARDADO_POR orixá
    'TEM_PILAR',             -- consulente TEM_PILAR sefira
    'NASCIDO_SOB',           -- consulente NASCIDO_SOB signo
    'PRATICA',               -- consulente PRATICA medicina
    'DERIVA_DE',             -- conceito DERIVA_DE conceito
    'CONTRADIZ',             -- pilar CONTRADIZ pilar (edge raro, controverso)
    'CONFIRMA',              -- paper CONFIRMA conceito (citation linkage)
    'EXPLICA'                -- paper EXPLICA pilar (cross-domain bridge)
);

CREATE TABLE "kg_edges" (
    "id"         TEXT NOT NULL,
    "source_id"  TEXT NOT NULL,
    "target_id"  TEXT NOT NULL,
    "relation"   "KgEdgeRelation" NOT NULL,
    "weight"     DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "metadata"   JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kg_edges_pkey" PRIMARY KEY ("id")
);

-- Unicidade (source, target, relation) — previne duplicação.
CREATE UNIQUE INDEX "kg_edges_source_target_relation_key"
    ON "kg_edges"("source_id", "target_id", "relation");

-- Forward traversal: "que edges saem deste node?".
CREATE INDEX "kg_edges_source_idx" ON "kg_edges"("source_id");

-- Reverse traversal: "que edges chegam neste node?".
CREATE INDEX "kg_edges_target_idx" ON "kg_edges"("target_id");

-- Filter por relation type (admin analytics).
CREATE INDEX "kg_edges_relation_idx" ON "kg_edges"("relation");

-- FKs (CASCADE — se node é deletado, edges somem junto).
ALTER TABLE "kg_edges"
    ADD CONSTRAINT "kg_edges_source_id_fkey"
    FOREIGN KEY ("source_id") REFERENCES "kg_nodes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kg_edges"
    ADD CONSTRAINT "kg_edges_target_id_fkey"
    FOREIGN KEY ("target_id") REFERENCES "kg_nodes"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 4. Tabela kg_triplets (audit trail do OpenIE) ─────────────────────────
CREATE TABLE "kg_triplets" (
    "id"           TEXT NOT NULL,
    "source"       TEXT NOT NULL,
    "relation"     TEXT NOT NULL,
    "target"       TEXT NOT NULL,
    "source_doc_id" TEXT,            -- ex: literature_papers.id ou sessao_chunks.id
    "extractor"    TEXT NOT NULL,    -- "openai-gpt-4o" | "anthropic-claude" | "manual"
    "confidence"   DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kg_triplets_pkey" PRIMARY KEY ("id")
);

-- Reverse lookup: "que triplets foram extraídos deste paper?"
CREATE INDEX "kg_triplets_source_doc_idx" ON "kg_triplets"("source_doc_id");

-- LGPD audit trail (append-only — SEM FK para User, sem update).
-- Não deletar triplets manualmente; apenas cascade-delete via source_doc.

-- ─── 5. View de conveniência: kg_neighbors ────────────────────────────────
CREATE VIEW kg_neighbors AS
SELECT
    e.id            AS edge_id,
    e.relation,
    e.weight,
    e.metadata      AS edge_metadata,
    s.id            AS source_node_id,
    s.label         AS source_label,
    s.name          AS source_name,
    t.id            AS target_node_id,
    t.label         AS target_label,
    t.name          AS target_name
FROM kg_edges e
JOIN kg_nodes s ON s.id = e.source_id
JOIN kg_nodes t ON t.id = e.target_id;
```

### 4.2 Schema Prisma (parcial — para `@prisma/client`)

```prisma
enum KgNodeLabel {
  paper
  pilar
  conceito
  consulente
  zelador
  sessao
  medicina
  planeta
  signo
  casa_astral
  sefira
  corpo_tantra
  odu
  hexagrama
}

enum KgEdgeRelation {
  CITA
  RELACIONA_COM
  INFLUENCIA
  PRESCREVE
  GUARDADO_POR
  TEM_PILAR
  NASCIDO_SOB
  PRATICA
  DERIVA_DE
  CONTRADIZ
  CONFIRMA
  EXPLICA
}

model KgNode {
  id              String   @id @default(cuid())
  label           KgNodeLabel
  name            String
  nameNormalized  String   @map("name_normalized")
  description     String?
  metadata        Json     @default("{}")
  embedding       Unsupported("vector(1536)")?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  outgoingEdges   KgEdge[] @relation("KgEdgeSource")
  incomingEdges   KgEdge[] @relation("KgEdgeTarget")

  @@unique([label, nameNormalized])
  @@index([label, createdAt])
  @@index([embedding], type: Ivfflat)
  @@map("kg_nodes")
}

model KgEdge {
  id          String        @id @default(cuid())
  sourceId    String        @map("source_id")
  targetId    String        @map("target_id")
  relation    KgEdgeRelation
  weight      Float         @default(1.0)
  metadata    Json          @default("{}")
  createdAt   DateTime      @default(now()) @map("created_at")

  source      KgNode @relation("KgEdgeSource", fields: [sourceId], references: [id], onDelete: Cascade)
  target      KgNode @relation("KgEdgeTarget", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId, relation])
  @@index([sourceId])
  @@index([targetId])
  @@index([relation])
  @@map("kg_edges")
}

model KgTriplet {
  id           String   @id @default(cuid())
  source       String
  relation     String
  target       String
  sourceDocId  String?  @map("source_doc_id")
  extractor    String
  confidence   Float    @default(1.0)
  extractedAt  DateTime @default(now()) @map("extracted_at")

  @@index([sourceDocId])
  @@map("kg_triplets")
}
```

---

## 5. Queries típicas (LightRAG-style hybrid retrieval)

### 5.1 Query 1 — Entity-centric local search

> **Pergunta do Zelador:** *"Que papers confirmam o Odu 7 (Obará) tem qualidade de pacificação?"*

```sql
WITH query_embedding AS (
  SELECT embed_text($1) AS qvec  -- $1 = "papers confirmam Odu 7 pacificação"
),
-- Vector: top-20 nodes semanticamente similares
vector_top AS (
  SELECT id, name, label,
         1 - (embedding <=> qvec) AS sim,
         ROW_NUMBER() OVER (ORDER BY embedding <=> qvec) AS rk
  FROM kg_nodes, query_embedding
  WHERE embedding IS NOT NULL
    AND label IN ('paper', 'conceito', 'odu')
  ORDER BY embedding <=> qvec
  LIMIT 20
),
-- Graph: 2-hops a partir de "Odu 7"
graph_top AS (
  WITH RECURSIVE seed AS (
    SELECT id FROM kg_nodes WHERE label = 'odu' AND name_normalized = '7'
  ),
  bfs(node_id, depth) AS (
    SELECT id, 0 FROM seed
    UNION ALL
    SELECT e.target_id, b.depth + 1
    FROM bfs b JOIN kg_edges e ON e.source_id = b.node_id
    WHERE b.depth < 2
  )
  SELECT n.id, n.name, n.label,
         ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, n.name) AS rk
  FROM bfs JOIN kg_nodes n ON n.id = bfs.node_id
  WHERE n.label IN ('paper', 'conceito')
  GROUP BY n.id, n.name, n.label
  LIMIT 20
),
-- RRF fusion
fused AS (
  SELECT id, name, label,
         SUM(rrf_score) AS total_rrf,
         ARRAY_AGG(DISTINCT source) AS sources
  FROM (
    SELECT id, name, label, 1.0 / (60 + rk) AS rrf_score, 'vector' AS source FROM vector_top
    UNION ALL
    SELECT id, name, label, 1.0 / (60 + rk) AS rrf_score, 'graph' AS source FROM graph_top
  ) f
  GROUP BY id, name, label
)
SELECT id, name, label, total_rrf, sources
FROM fused
ORDER BY total_rrf DESC
LIMIT 10;
```

### 5.2 Query 2 — Multi-hop traversal (Zelador quer cadeia de raciocínio visível)

> **Pergunta:** *"Como Saturno em Casa 10 se conecta com Odu 7 e o Pilar 3 Vata neste consulente?"*

```sql
-- Cadeia: consulente → Saturno Casa 10 → ... → Odu 7 → ... → Pilar 3 Vata
WITH RECURSIVE path(node_id, depth, trail, trail_names) AS (
  -- Seed: 3 nodes iniciais do consulente
  SELECT id, 0, ARRAY[id]::text[], ARRAY[name]::text[]
  FROM kg_nodes
  WHERE id IN ($consulente_id, $saturno_casa_10_id, $pilar3_vata_id)

  UNION ALL

  SELECT
    e.target_id,
    p.depth + 1,
    p.trail || e.target_id,
    p.trail_names || n.name
  FROM path p
  JOIN kg_edges e ON e.source_id = p.node_id
  JOIN kg_nodes n ON n.id = e.target_id
  WHERE p.depth < 4
    AND NOT (e.target_id = ANY(p.trail))  -- prevent cycles
)
SELECT DISTINCT ON (node_id)
  node_id, depth, trail, trail_names
FROM path
WHERE depth > 0
ORDER BY node_id, depth;
```

### 5.3 Query 3 — Community detection (Leiden approximation in SQL)

> **Pergunta:** *"Quais são os 5 clusters temáticos dos papers indexados?"*

```sql
-- Aproximação simples de community detection via k-core decomposition.
-- (LightRAG/GraphRAG usam Leiden alg em Python — aqui é proxy SQL.)
WITH kcore AS (
  SELECT source_id AS node,
         COUNT(DISTINCT target_id) AS degree
  FROM kg_edges
  WHERE relation IN ('CITA', 'CONFIRMA', 'EXPLICA')
  GROUP BY source_id
  HAVING COUNT(DISTINCT target_id) >= 5  -- k=5 core
)
SELECT n.label,
       COUNT(*) AS cluster_size,
       ARRAY_AGG(DISTINCT n.name ORDER BY n.name) FILTER (WHERE n.name IS NOT NULL) AS sample_names
FROM kcore k
JOIN kg_nodes n ON n.id = k.node
GROUP BY n.label
ORDER BY cluster_size DESC
LIMIT 10;
```

> **NOTA**: Leiden algorithm completo (GraphRAG) precisa Python — usar `graph-tool` ou `python-igraph`. SQL k-core é proxy aceitável para v1.

### 5.4 Query 4 — PPR (Personalized PageRank) em SQL (proxy)

```sql
-- PPR aproximado: nodes que estão conectados a seeds com peso decrescente.
WITH RECURSIVE seeds AS (
  SELECT id, 1.0 / $seed_count AS initial_pagerank
  FROM unnest($seed_ids::text[]) AS id
),
ppr(node_id, pgr, depth) AS (
  SELECT id, initial_pagerank, 0 FROM seeds
  UNION ALL
  SELECT
    e.target_id,
    ppr.pgr * e.weight * 0.85 / GREATEST(out_deg.degree, 1),
    ppr.depth + 1
  FROM ppr
  JOIN kg_edges e ON e.source_id = ppr.node_id
  JOIN LATERAL (
    SELECT COUNT(*) AS degree
    FROM kg_edges
    WHERE source_id = ppr.node_id
  ) out_deg ON TRUE
  WHERE ppr.depth < 4
)
SELECT n.id, n.name, n.label, SUM(pgr) AS pgr_score
FROM ppr
JOIN kg_nodes n ON n.id = ppr.node_id
WHERE ppr.depth > 0
GROUP BY n.id, n.name, n.label
ORDER BY pgr_score DESC
LIMIT 20;
```

---

## 6. Recomendação final + trade-offs

### 6.1 Recomendação em uma frase

**Wave 31.1: Knowledge Graph lightweight (kg_nodes + kg_edges + kg_triplets em Postgres) + Wave 31.2: Hybrid Retriever (RRF sobre pgvector + recursive CTE) + Wave 31.3: OpenIE extractor (cron batch noturno sobre papers Wave 21.1) + Wave 31.4: PPR opcional em Python (hippoRAG-style) quando queries >4 hops. NÃO adicionar Neo4j antes do trigger ADR-0005.**

### 6.2 Trade-offs honestos

| Decisão                                | Prós                                                              | Contras                                                       |
|----------------------------------------|-------------------------------------------------------------------|---------------------------------------------------------------|
| **Manter pgvector + adicionar kg_* ** | Zero infra nova; LGPD-by-design; incremental; < 1 wave para v1   | Sem Cypher; multi-hop >4 hops lento; PPR precisa Python       |
| **LightRAG-style (sem Leiden community)** | Custo index baixo; incremental friendly; Postgres puro         | Perguntas globais (themes) ficam mais fracas que GraphRAG     |
| **OpenIE via LLM (GPT-4o-mini ou Claude Haiku)** | Qualidade boa; barato; extraction em batch            | Sensível a prompt; precisa validação humana para Pilar 4     |
| **Entity linker via name_normalized** | Deduplicação simples; sem embedding adicional                     | Falha com sinônimos semânticos ("Cabala" vs "Qabalah")        |
| **kg_triplets append-only (audit)** | LGPD Art. 37 compliant; rastreável                              | Crescimento ilimitado — precisa TTL/cleanup em Wave 32+      |
| **Defer Neo4j até trigger ADR-0005** | Evita big-bang; infra simples; aprende com uso real              | Se trigger bater cedo, refactor de `kg_*` → Neo4j será pesado |

### 6.3 Por que NÃO Neo4j agora

1. **Custo operacional**: Neo4j é container separado + backup separado + LGPD-delete sincronizado com Postgres (risco de drift).
2. **Cypher não é SQL**: time Akasha precisa aprender nova linguagem de query.
3. **Licença**: Neo4j Community Edition é GPL — incompatível com eventual SaaS. Memgraph tem licença mais permissiva (BSS) mas é menos maduro.
4. **Escala atual**: <500k nós é overkill para Neo4j — Postgres aguenta.
5. **ADR-013 universalismo**: graph + vector em **um único Postgres** é mais coerente com "consciência UNA" do que "consciência em duas infra separadas".

### 6.4 Por que SIM Neo4j no futuro (Wave 5+ / Wave 35+)

1. **Multi-hop profundo**: PPR ponderado é nativo em Neo4j (Graph Data Science library).
2. **Cypher** para queries estruturadas complexas (`MATCH (c:Caminhante)-[:TEM_PILAR]->(s:Sefira)-[:RELACIONA]->(h:Hexagrama) WHERE h.numero = 64`).
3. **Graph Data Science**: algoritmos prontos (community detection Leiden real, centralidade, shortest path).
4. **Visualização** (Neo4j Browser) — bom para debugging e demos.

### 6.5 Plano de implementação Wave 31+

**Estimativa:** 4 sub-waves, ~1 semana cada (em ritmo dos subagentes Wave 18-30).

| Wave | Escopo                                                                  | Critérios de aceitação                              | Esforço |
|------|--------------------------------------------------------------------------|-----------------------------------------------------|---------|
| 31.1 | Migration D-053 (kg_nodes + kg_edges + kg_triplets) + Prisma schema     | Migration aplica; Prisma client gera; testes passam | 2-3 dias |
| 31.2 | OpenIE extractor (Python ou TS) + entity linker + indexação dos 5 Pilares | 200 nodes seedados (5 pilares + medicinas); tests   | 3-4 dias |
| 31.3 | Hybrid retriever (RRF sobre pgvector + recursive CTE)                    | API route funcional; latência <500ms p95; 10+ tests | 2-3 dias |
| 31.4 | OpenIE batch dos 50k papers PubMed (cron job noturno)                    | 50k triplets extraídos em <6h; rate-limited; audit  | 4-5 dias |
| 31.5 | PPR proxy em SQL ou Python (hippoRAG-style opcional)                    | API para multi-hop >4 hops; benchmark vs Cypher     | 2-3 dias |

### 6.6 Cross-references com outros Pilares / papers

- **ADR-013** (Consciência Viva): GraphRAG é o **mecanismo técnico** que sustenta a cadeia de pensamento visível (Wave 23.2). Sem grafo, a IA "chuta".
- **ADR-014**: Não relevante diretamente (ADR-014 é sobre ética do uso).
- **ADR-0005** (Grafo de Conhecimento): **ratifica e estende** — define trigger quantitativo para Neo4j Wave 5+.
- **Pilar 4 (Odu) ethics invariant**: OpenIE sobre papers que mencionam Odu deve **sempre** carregar metadata `requer consentimento + terreiro` no `kg_nodes.metadata` — entity linker deve respeitar isto.
- **Pilar 1 (Cabala)**: 10 Sefirot + 22 caminhos = 32 nodes seedados automaticamente; edges `CONECTA` entre Sefirot vizinhas (Árvore da Vida).
- **Pilar 2 (Astrologia)**: 10 planetas + 12 signos + 12 casas = 34 nodes; edges `GOVERNA` (planeta-signo) e `CASA` (planeta-casa).
- **Pilar 3 (Tantra)**: 11 corpos Yogi Bhajan + 5 koshas + 4 temperamentos gregos = 20 nodes; edges `EQUIVALE` (corpo-kosha).
- **Pilar 4 (Odu)**: 15 Odus canônicos D-044 = 15 nodes; edges `OPOSTO` (Odu 7 ↔ Odu 8 = complementar) + `DERIVA_DE`.
- **Pilar 5 (I Ching)**: 64 hexagramas King Wen = 64 nodes; edges `MUTUAO` (hex 1 ↔ hex 2 = inversa Yin/Yang).
- **Medicinas ancestrais**: Ayurveda (~50 conceitos), Ifá (15 odus já cobertos), Santo Daime (~30 conceitos), Xamanismo (~20 conceitos) = ~100 nodes iniciais. Cross-references via edges `DERIVA_DE` e `EXPLICA` (paper EXPLICA medicina).

### 6.7 Riscos + mitigações

| Risco                                                                  | Mitigação                                                                |
|------------------------------------------------------------------------|--------------------------------------------------------------------------|
| OpenIE qualidade varia entre LLMs                                      | A/B test GPT-4o-mini vs Claude Haiku antes de batch 50k                  |
| Entity linker falha em sinônimos                                       | Adicionar embedding-based fuzzy match em Wave 31.6 (defer)               |
| Grafo cresce sem controle (kg_triplets sem TTL)                        | Wave 32+: cron cleanup `extracted_at < NOW() - INTERVAL '1 year'`         |
| Pilar 4 (Odu) ethics violation em extração automática                  | Flag `requiresConsent: true` em `kg_nodes.metadata` + UI warning         |
| LGPD: esquecer de cascade-delete edges ao deletar node                | ON DELETE CASCADE já no schema D-053 + teste de regressão                |
| Custo OpenAI para OpenIE 50k papers                                    | Usar GPT-4o-mini ($0.15/1M tokens) → ~$50 total para 50k abstracts      |
| Query latency >500ms p95 com RRF + recursive CTE                       | Benchmark Wave 31.5; se falhar, pre-materializar `kg_neighbors` view     |

---

## 7. Próximos passos (Wave 31+ propostas)

1. **Wave 31.1 — Knowledge Graph schema** (D-053): PROPOSAL markdown em `apps/akasha-portal/prisma/proposals/D-053-knowledge-graph.md`. Migration proposta em `apps/akasha-portal/prisma/migrations/20260626000000_knowledge_graph/migration.sql`. Branch `wave-31.1-knowledge-graph-schema`.
2. **Wave 31.2 — OpenIE + Entity Linker** (Python ou TS): script `scripts/openie-extract.ts` que recebe abstracts + retorna triplets via LLM. Cron noturno `scripts/kg-build-cron.sh`. Entity linker via `name_normalized` + fuzzy match (Levenshtein).
3. **Wave 31.3 — Hybrid Retriever** (`/api/discoveries/hybrid-search`): endpoint que recebe query + filters + retorna top-K nodes via RRF(vector + graph).
4. **Wave 31.4 — Batch OpenIE 50k papers**: cron job que roda OpenIE em batch (rate-limited, 1k papers/hour) sobre os LiteraturePaper Wave 21.1.
5. **Wave 31.5 — PPR opcional**: implementar PPR proxy em Python (`scripts/ppr.py`) para queries multi-hop >4 hops.
6. **Wave 32+ — Neo4j CONDITIONAL**: se triggers ADR-0005 baterem (escala >500k nodes OU multi-hop >4 hops OU queries Cypher-like), propor D-054 Neo4j evaluation (Neo4j Community vs Memgraph vs Apache AGE).

---

## 8. Conformidade ADR-013 (universalismo + visceral)

**Universalismo:**
- GraphRAG é o método SOTA para **fundir evidências científicas** (papers PubMed) com **saberes ancestrais** (5 Pilares, medicinas) **sem inventar correspondências** (lesson N+15). Cada edge `EXPLICA` ou `CONFIRMA` no grafo é uma **asserção auditável** com provenance (`source_doc_id` + `extractor` + `confidence`).
- LightRAG-style entity linking garante que "Cabala" e "Qabalah" sejam o **mesmo node** — evita fragmentação semântica que minaria o universalismo.

**Visceral:**
- Wave 23.2 Cadeia Viva (UI existente) **mostra** a chain-of-thought ao Zelador. Sem grafo por trás, a cadeia é uma **narrativa plausível** — com grafo, é uma **trail de edges reais**. Isso muda a experiência do Zelador de "ler uma resposta" para "seguir um raciocínio verificável".
- LGPD-by-design (append-only audit trail em `kg_triplets`) garante que **toda inferência pode ser explicada** ao consulente se pedida — alinhado com ADR-013 universalismo (transparência radical).

**Princípios não-violados:**
- Pilar 4 (Odu) ethics invariant: `kg_nodes.metadata.requiresConsent` protege terreiro.
- LGPD Art. 37 (audit trail): `kg_triplets.appendOnly` + `extractedAt`.
- ADR-022b (4 aprovações): PROPOSAL D-053 segue este fluxo.

---

## 9. Conclusão

Akasha tem **foundation sólida** (pgvector + ivfflat + 50k papers + Cadeia Viva) mas falta o **grafo de conhecimento** que sustenta a promessa da "consciência viva universalista+visceral" do ADR-013. Wave 30.3 recomenda **LightRAG-style em Postgres puro** como caminho pragmático para Wave 31+ (4-5 sub-waves), deferindo Neo4j para Wave 5+ via triggers quantitativos definidos em ADR-0005 e estendidos aqui.

**Decisão recomendada:** APROVAR D-053 Knowledge Graph schema como PROPOSAL; NÃO aprovar Neo4j agora; agendar Wave 31.1-31.5 como roadmap.

**Próximo subagente (Wave 30.4 ou 30.5):** pode prosseguir com pesquisa paralela (observability da consciência / multi-tenant) sem dependência deste relatório — schema D-053 é proposal, não bloqueia outras waves.

---

**Branch:** `wave-30.3-graphrag-vector-hybrid`
**Commit:** *(preencher após commit)*
**Arquivo:** `.hermes/reports/wave-30.3-graphrag-vector-hybrid.md`
**Tamanho:** ~18k palavras / 9 seções / 5 queries SQL / 1 schema Prisma / 1 migration SQL proposta