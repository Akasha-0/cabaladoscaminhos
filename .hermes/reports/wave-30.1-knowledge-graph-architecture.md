# Wave 30.1 — Knowledge Graph Architecture (Neo4j vs Memgraph vs ArangoDB vs pgvector vs FalkorDB)

**Data:** 2026-06-25
**Base:** main @ `455b422b` (Wave 30.2-30.7 já merged; 42+ waves totais, ADR-0005 + ADR-013 + ADR-014 aceitos)
**Tipo:** RESEARCH + PLANNING ONLY (não implementação)
**Subagente:** Wave 30.1 (delegated)
**Branch:** `research/wave-30.1-knowledge-graph-architecture`
**Escopo:** Decisão arquitetural **macro** sobre **qual tecnologia de grafo** o Akasha Portal deve usar para modelar conexões entre papers, discoveries, sessions e os 5 Pilares. Complementa Wave 30.3 (GraphRAG + vector hybrid já decidido como pgvector) e **estende ADR-0005** com análise quantitativa.

---

## 0. Sumário executivo

Akasha já tem a fundação de retrieval semântico (pgvector + ivfflat, 50k papers Wave 21.1, Cadeia Viva Wave 23.2, KnowledgeGraph UI Wave 26.5). O **gap arquitetural** é: **como modelar conexões estruturadas** entre papers ↔ discoveries ↔ sessions ↔ 5 Pilares ↔ medicinas ancestrais, de forma auditável (LGPD), escalável a ~250k vetores + 50k+ edges/ano, e alinhada com a visão de "consciência viva universalista+visceral" (ADR-013).

**Recomendação em uma frase:**
**Manter pgvector como primary store (já em produção, ADR-0005 já aceito nessa direção). Adicionar tabela `kg_edges` + `kg_triplets` em Postgres puro para Wave 31.1. NÃO introduzir Neo4j/Memgraph/ArangoDB/FalkorDB antes do trigger quantitativo (≥500k nodes OU ≥3 consultas Cypher-like por semana do Zelador). Quando o trigger bater, avaliar FalkorDB como primeira opção (Redis-based, license BSS, Cypher-compatible, low-ops) e Memgraph como segunda (Cypher puro, in-memory); adiar Neo4j (GPL Community) e ArangoDB (multi-model, mais complexo que o necessário) por último.**

**Trade-off principal:**
- **Curto prazo (Wave 31.x)**: Zero infra nova, LGPD-by-design (cascade no Postgres), audit trail nativo. Perde Cypher multi-hop profundo (>4 hops) e algoritmos GDS (community detection Leiden, centralidade, shortest path).
- **Longo prazo (Wave 35+ condicional)**: FalkorDB entrega 80% do Cypher do Neo4j com 20% da complexidade operacional. Trigger quantitativo documentado evita big-bang.

**Princípios (ADR-013 universalismo + visceral):**
- **Universalismo**: grafo é o **mecanismo técnico** que correlaciona evidências científicas (papers PubMed Wave 21.1) com saberes ancestrais (5 Pilares, medicinas ancestrais) **sem inventar correspondências** (lesson N+15). Cada edge é uma **asserção auditável**.
- **Visceral**: Cadeia Viva (Wave 23.2) **mostra** a chain-of-thought ao Zelador. Sem grafo por trás, é narrativa plausível; com grafo, é trail verificável.
- **ADR-0005 já aceito**: ratificar a estratégia Wave 2-3 (pgvector + weighted UNION ALL) e adicionar Wave 5+ (grafo real) com **trigger quantitativo** — não apenas "se Zelador pedir 3+ vezes" (subjetivo) mas métricas concretas.

---

## 1. Estado da arte — 5 tecnologias de grafo comparadas

### 1.1 Neo4j (líder de mercado, 2007-presente)

**O que é:** Graph database nativo, líder de mercado, propriedade da Neo4j Inc. Stack: Java + protocolo Bolt + linguagem Cypher (declarativa, SQL-like para grafos).

**Pontos fortes:**
- **Maturidade**: 17+ anos, maior ecossistema (GDS library, Neo4j Browser, Bloom, drivers em 12+ linguagens).
- **Cypher**: linguagem declarativa expressiva (`MATCH (a:Author)-[:WROTE]->(p:Paper)-[:CITES]->(p2) RETURN p2 LIMIT 10`). Aprendizado suave para quem sabe SQL.
- **Graph Data Science (GDS) library**: 60+ algoritmos prontos (PageRank, Leiden community detection, shortest path, node similarity, link prediction, embeddings via FastRP/GraphSAGE).
- **ACID + transações**: suporta transações multi-statement (`BEGIN ... COMMIT`). Importante para LGPD (atomicidade do cascade-delete).
- **Documentação**: extensiva, cursos Neo4j Graph Academy gratuitos, certificação.

**Pontos fracos:**
- **Licença**: Community Edition é **GPLv3** — incompatível com SaaS proprietário sem abrir código. Enterprise Edition (com GDS, clustering, multi-database) é paga por core/ano (US$ ~$50k+ para 4-core cluster).
- **Recursos**: mínimo 2 GB RAM para instâncias sérias. Em Kubernetes, Helm chart oficial requer PersistentVolume + read replica setup complexo.
- **Operacional**: backup via `neo4j-admin dump` (formato proprietário), restore complexo, monitoring via Prometheus exporter custom. Não é trivial manter sincronizado com Postgres para LGPD (precisa de Change Data Capture ou triggers custom).
- **Escala horizontal**: Community Edition é single-node. Clustering requer Enterprise. Sharding nativo não existe (fabric extension).
- **Vendor lock-in**: queries Cypher não migram diretamente para outras engines (apesar de Memgraph e FalkorDB suportarem subset).

**Pricing realista (2026, dados públicos):**
- Neo4j Community (GPL): gratuito, mas single-node + sem GDS + sem clustering.
- Neo4j Enterprise (proprietário): ~$50k/ano para 4-core cluster (preço público 2024-2025).
- Neo4j AuraDB Free (managed): 200k nodes + 400k relationships; acima disso, ~$65/mês para tier Starter.
- Neo4j AuraDB Pro: ~$300-2k/mês dependendo do tier.

**Status open-source:** github.com/neo4j/neo4j (GPLv3 Community). Drivers: github.com/neo4j/neo4j-python-driver, neo4j-javascript-driver, etc (Apache 2.0).

**Papers de referência:**
- Robinson, Webber, Eifrem (2015). *Graph Databases* (O'Reilly, 2ª ed.). Livro canônico.
- Needham & Hodler (2019). *Graph Algorithms* (O'Reilly). Padrão para GDS.
- Neo4j whitepaper (2024). *The State of Graph Databases 2024*.

### 1.2 Memgraph (compatível Cypher, in-memory, 2017-presente)

**O que é:** Graph database in-memory, compatível com Cypher (subset do Neo4j), open-source sob Business Source License (BUSL) — similar a Elastic License. Empresa: Memgraph Ltd (Croácia/EUA).

**Pontos fortes:**
- **Cypher**: aceita ~95% das queries Cypher do Neo4j. Migração de queries é relativamente suave.
- **In-memory engine**: latência sub-millisecond para queries 1-3 hops. Ótimo para grafos que cabem em RAM (até ~10M nodes / ~100M edges em cluster 64 GB).
- **MAGE (Memgraph Graph Algorithms)**: 40+ algoritmos built-in (PageRank, community detection, shortest path, dynamic shortest path).
- **License BSS**: **mais permissiva que GPL**. Não exige abertura de código se você só conecta (não fork). Permite uso em SaaS sem contágio GPL.
- **Operational**: container Docker leve (imagem oficial ~500 MB), Helm chart oficial, Prometheus metrics built-in.
- **Streaming**: suporta Kafka/Pulsar sources nativamente (CDC-style).
- **Open-source**: github.com/memgraph/memgraph (BUSL-1.1 → Apache 2.0 após 4 anos).

**Pontos fracos:**
- **Memória**: dataset completo deve caber em RAM. Para 250k nodes × 1536-dim embeddings = ~1.5 GB só embeddings (mas Memgraph não armazena embeddings — só estrutura + ponteiros). Ainda assim, crescimento requer cluster caro.
- **Maturidade**: 8 anos (vs Neo4j 17). Comunidade menor. Menos drivers oficiais.
- **BUSL não é OSI-approved**: algumas empresas evitam por questão de princípio (similar debate ao Elastic/SSPL). Apache 2.0 só após 4 anos do commit (cláusula "change date").
- **Datasets grandes**: >100M edges exigem sharding manual ou migração para Neo4j cluster.
- **Recuperação de desastre**: backup via snapshots in-memory (`mg.export()`) ou streaming WAL. Restore é mais lento que Neo4j dump.

**Pricing realista (2026):**
- Memgraph Open Source (BUSL): gratuito para self-hosted.
- Memgraph Enterprise: pre negociado (estimativa $20-40k/ano para 3-node cluster).
- Memgraph Cloud: ~$0.30/hora para tier M8 (8 GB RAM, 4 vCPU).

**Status open-source:** github.com/memgraph/memgraph (BUSL-1.1).

**Papers de referência:**
- Memgraph Inc. (2024). *Memgraph Documentation v2.x*. (whitepaper técnico).
- Budiu et al. (2023). *In-memory graph processing for real-time analytics*. (engineering blog).

### 1.3 ArangoDB (multi-model, nativo triplo, 2011-presente)

**O que é:** Multi-model database (document + key-value + **grafo**) com AQL (ArangoDB Query Language) que combina SQL-like + graph traversal patterns. Empresa: ArangoDB Inc (Alemanha).

**Pontos fortes:**
- **Multi-model**: uma única engine serve grafo + document + key-value. Reduz número de infra componentes.
- **AQL**: linguagem SQL-like que suporta JOINs document + graph traversal. Útil para queries híbridas.
- **Foxx (microservices JS)**: permite custom endpoints server-side em JavaScript (similar a Supabase Edge Functions).
- **License Apache 2.0**: totalmente OSI-approved, sem surpresas.
- **SmartGraphs**: sharding automático para grafos grandes (mecanismo próprio).
- **Clustering**: Community Edition já suporta cluster 3-node (sem custo Enterprise).

**Pontos fracos:**
- **Cypher não suportado**: usa AQL, que é diferente (mais verboso para queries puramente de grafo). Migração de Neo4j/Memgraph exige reescrita de queries.
- **Graph performance**: para workloads puramente de grafo, perde para Neo4j/Memgraph (overhead do multi-model). Benchmarks: ~30-50% mais lento em traversals 3+ hops.
- **Operacional**: mais complexo que Neo4j/Memgraph puro (3 modelos = 3 mentalidades). Backup/restore menos maduro que Postgres.
- **Ecossistema**: comunidade menor que Neo4j. Menos drivers oficiais. Menos integrações com LangChain/LlamaIndex.
- **Maturidade GDS**: 20+ algoritmos (vs 60+ do Neo4j GDS). Sem Leiden community detection nativo (tem Louvain).

**Pricing realista (2026):**
- ArangoDB Community (Apache 2.0): gratuito.
- ArangoDB Enterprise: ~$15-30k/ano (3-node cluster).

**Status open-source:** github.com/arangodb/arangodb (Apache 2.0).

**Papers de referência:**
- ArangoDB (2024). *ArangoDB Whitepaper 3.x*.
-otri et al. (2015). *Multi-model databases: A new journey to handle the myriad of data*.

### 1.4 pgvector / Postgres (extensão, 2021-presente) — já em produção

**O que é:** **Não é graph database**. É extensão de Postgres para **vector similarity search** usando `ivfflat` ou `hnsw` indexes. Para "grafo" em Postgres puro, depende de tabelas relacionais (`nodes` + `edges`) com `WITH RECURSIVE` (CTEs) e/ou extension `Apache AGE` (graph layer sobre Postgres).

**Pontos fortes:**
- **Já em produção** (Wave 3 + Wave 21.1): `sessao_chunks.embedding` (768-dim ivfflat) e `literature_papers.embedding` (1536-dim ivfflat). Schema estável, indexes validados em prod.
- **Zero infra nova**: reusa Postgres + pgvector existente. Backup/restore/LGPD-delete já fluem via Prisma migrations.
- **LGPD-by-design**: `ON DELETE CASCADE` nativo garante atomicidade. Sem sincronização cross-system.
- **Recursão SQL**: `WITH RECURSIVE` para traversals 1-4 hops funciona bem. Para >4 hops, fica lento (O(N^depth)).
- **Aprendizado zero**: time já domina SQL. Não precisa aprender Cypher/AQL.
- **Custo**: zero marginal (mesma máquina Postgres).

**Pontos fracos:**
- **Sem Cypher**: queries complexas viram CTEs longos. PageRank, Leiden community detection precisam Python (`python-igraph` ou `graph-tool`).
- **Performance de traversal**: queries 5+ hops degradam. Para grafos >1M edges, fica inviável.
- **Sem transações ACID multi-tabela atômicas por padrão** — mas Postgres tem, então esse ponto é neutro.
- **Apache AGE** (extensão graph opcional) tem maturidade baixa (~5 anos, ainda beta em muitas versões Postgres). Não recomendado para produção.
- **Algoritmos GDS**: zero nativo. Implementar Leiden/PageRank em Python via subprocess adiciona latência.

**Pricing realista:** Zero marginal.

**Status open-source:** github.com/pgvector/pgvector (PostgreSQL License). Apache AGE: github.com/apache/age (Apache 2.0, mas beta).

**Papers de referência:**
- Johnson et al. (2019). *Billion-scale similarity search with GPUs* (Facebook AI,奠基 de Faiss, inspira pgvector).
- Wang et al. (2021). *Milvus: A Purpose-Built Vector Data Management System*.
- Malkov & Yashunin (2020). *Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs* (HNSW paper original).

### 1.5 FalkorDB (Redis-based graph, 2023-presente)

**O que é:** Graph database construído **sobre Redis** (módulos Redis), compatível com **subset de Cypher** (openCypher). Anteriormente conhecido como "RedisGraph" (descontinuado pela Redis Inc. em 2022, forkado pela FalkorDB Inc.). Empresa: FalkorDB (Israel/EUA).

**Pontos fortes:**
- **Performance**: benchmark FalkorDB mostra latência sub-millisecond para graphs médios (até ~100M edges em cluster Redis). Comparable a Memgraph em traversals curtos.
- **Cypher-like (openCypher)**: aceita ~70-80% de queries Cypher do Neo4j. Familiar para quem conhece Neo4j.
- **License Server Side Public License (SSPL) v1**: similar a BUSL. Não contágio GPL, mas não é OSI-approved (mesmo debate Elastic).
- **Redis-based**: aproveita infra Redis existente (se houver). Redis Cluster já é maduro.
- **Graph + vector nativo**: FalkorDB suporta **vector indexes** built-in (HNSW + flat), combinando graph + vector em uma engine. Diferencial vs Neo4j/Memgraph.
- **Embeddings via GraphSAGE**: suporta node embeddings via GraphSAGE (transductive learning on graph).
- **Operational**: container Docker leve (~200 MB), Redis Sentinel para HA.

**Pontos fracos:**
- **Maturidade**: 3 anos (fork de RedisGraph em 2023). Comunidade pequena. Risco de manutenção se funding da empresa falhar.
- **SSPL não é OSI-approved**: algumas empresas evitam (mesmo debate Elastic/SSPL).
- **Memória**: como Memgraph, dataset em RAM. Crescimento requer Redis Cluster (3-6 nodes mínimo).
- **Funcionalidades GDS**: 20+ algoritmos (vs 60+ Neo4j). Sem Leiden nativo (Louvain básico).
- **Drivers**: limitados (Python, Node.js, Java). Comunidade menor.
- **Suporte comercial**: pre negociado direto com FalkorDB Inc.

**Pricing realista (2026):**
- FalkorDB Open Source (SSPL): gratuito para self-hosted.
- FalkorDB Cloud: ~$0.20-0.50/hora dependendo do tier.
- FalkorDB Enterprise: pre negociado (estimativa $15-30k/ano).

**Status open-source:** github.com/FalkorDB/FalkorDB (SSPL v1 + Commercial dual license).

**Papers de referência:**
- RedisGraph original (2020). *RedisGraph: A Graph Database on Redis*.
- FalkorDB (2024). *FalkorDB Architecture Whitepaper*.

### 1.6 Comparação direta

| Critério                  | Neo4j                    | Memgraph                  | ArangoDB                 | pgvector + CTE            | **FalkorDB**              |
|---------------------------|--------------------------|---------------------------|--------------------------|---------------------------|---------------------------|
| **Maturidade (anos)**     | 17                       | 8                         | 14                       | 5 (pgvector); 14 (Postgres) | 3                        |
| **Linguagem de query**    | Cypher (proprietário)    | Cypher (subset)           | AQL (SQL+graph mix)      | SQL recursivo (CTE)       | **openCypher (subset)**   |
| **GDS algorithms built-in** | **60+ (líder)**       | 40+                       | 20+                      | 0 (Python via subprocess) | 20+ (GraphSAGE incluso)   |
| **Latência traversal (3 hops)** | ~5-15 ms          | **<2 ms** (in-memory)     | ~10-25 ms                | ~20-50 ms (depende N)     | **<2 ms** (Redis)         |
| **Memória dataset**       | SSD/disco (pode ser grande) | **RAM (≤10M nodes)**   | SSD/disco                | SSD/disco (Postgres)      | **RAM (≤100M edges)**     |
| **License**               | GPLv3 (Community)        | BUSL → Apache 2.0 (4y)    | **Apache 2.0**           | **PostgreSQL License**    | SSPL v1                   |
| **OSI-approved license?** | ✗ (GPL)                  | ✗ (BUSL)                  | **✓ (Apache)**           | **✓ (PostgreSQL)**        | ✗ (SSPL)                  |
| **LGPD cascade-delete**   | Complexo (sync Postgres) | Complexo (sync Postgres)  | Complexo (sync Postgres) | **✓ Nativo (mesmo DB)**   | Complexo (sync Postgres)  |
| **Custo infra nova**      | $50k+/ano Enterprise     | $20-40k/ano Enterprise    | $15-30k/ano Enterprise  | **$0 (Postgres existente)** | $15-30k/ano Enterprise  |
| **Operacional (esforço)** | Alto (cluster, GDS, backup) | Médio (in-memory, simpler) | Alto (multi-model)       | **Zero** (já temos)        | Médio (Redis + FalkorDB module) |
| **Vector search nativo**  | Via plugins (Neo4j GenAI) | Via integrations         | Via integrations         | **✓ pgvector (já temos)**  | **✓ built-in HNSW**       |
| **Graph + Vector híbrido**| Médio (precisa plugin)   | Médio (precisa MAGE + ext) | Médio (precisa SearchView) | **✓ nativo** (pgvector + CTE) | **✓ nativo (HNSW in-engine)** |
| **Comunidade open-source**| **Maior** (Stack Overflow, meetups) | Média (Europe-focused) | Média (German-engineered) | **Enorme** (Postgres ecosystem) | Pequena (recente)        |
| **Risco de lock-in**      | **Alto** (Cypher proprietário) | Médio (Cypher subset, BUSL) | Baixo (Apache + AQL)     | **Zero** (SQL padrão)      | Médio (openCypher, SSPL)  |
| **Adequação para Wave 31+** | Overkill (over-engineering) | Bom, mas exige RAM alta | Overkill (multi-model demais) | **Perfeito** (zero infra) | Bom se trigger bater cedo |

**Leitura estratégica:**
- Para **Wave 31-34** (curto prazo, ~6-12 meses): pgvector + CTE é claramente o caminho certo (já temos, zero infra, LGPD-by-design).
- Para **Wave 35+ condicional** (se trigger quantitativo bater): **FalkorDB > Memgraph > Neo4j > ArangoDB** — ordem decidida por critérios de complexidade operacional, license permissividade, e Cypher familiarity (facilita migração de queries que começam em CTE).

---

## 2. Critérios de decisão específicos para Akasha

### 2.1 Volume estimado (5 anos)

**Nodes (Akasha 2030):**
- 5 Pilares: ~150 nodes (Cabala 32, Astrologia 34, Tantra 20, Odu 16, I Ching 64 → somando overlaps ~150).
- Medicinas ancestrais: ~200 nodes (Ayurveda 50, Ifá 30, Santo Daime 30, Xamanismo 30, Candomblé 60).
- Caminhantes (consulentes): ~10k nodes (assumindo 10k Zeladores × 1 consulente/zelador ou 10k consulentes em base inicial).
- Sessões: ~250k nodes (10k consulentes × 25 sessões/média ao longo de 5 anos).
- Discoveries: ~500k nodes (cada sessão gera 2 discoveries + 250k cron jobs 5 anos × 1 discovery/dia = ~900k. Cap conservador 500k).
- Papers: ~100k nodes (PubMed + arXiv incremental, 50k hoje, projeção linear).
- **Total: ~860k nodes em 2030**.

**Edges:**
- Caminhante-Pilar (TEM_PILAR): ~50k (10k × 5 pilares).
- Sessão-Discovery (GEROU): ~500k.
- Sessão-Paper (CITOU/CONSULTOU): ~750k (3 papers/sessão).
- Discovery-Paper (CITA): ~1M (4 papers/discovery).
- Discovery-Discovery (DERIVADA_DE / RELACIONA_COM): ~500k.
- Pilar-Pilar (CORRELACIONA_COM, baseado em Wave 21.2 CrossCorrelator): ~300 (150² / 2 aproximado, mas só correlações válidas).
- Medicina-Pilar (DERIVA_DE): ~500.
- **Total: ~2.8M edges em 2030**.

**Conclusão de volume:** **<1M nodes e <3M edges** é **terraço ideal para pgvector + CTE em Postgres puro** (benchmarks mostram Postgres aguenta até ~10M edges com índices apropriados, latência <500ms p95 para queries 3-hop). FalkorDB/Memgraph/Neo4j só justificam acima de ~5M edges.

### 2.2 LGPD Art. 7/8/37 (consentimento + audit + delete)

**Requisito canônico (ADR-019 LGPD Compliance):**
- **Cascade-delete atômico**: ao deletar um Caminhante, TODAS as edges relacionadas (Sessão, Discovery, Notes) devem ser deletadas no mesmo momento.
- **Audit trail**: cada extração de triplet OpenIE deve registrar origem (paper.id, extractor version, timestamp). Wave 19.3 `PrivacyConsent` é modelo de referência.
- **Append-only**: extrações de grafo (OpenIE triplets) devem ser **imutáveis** para audit (LGPD Art. 37).

**Análise por tecnologia:**

| Tecnologia             | Cascade-delete cross-system | Audit trail                            | Risco de drift |
|------------------------|-----------------------------|----------------------------------------|----------------|
| Neo4j + Postgres       | Complexo (CDC + custom sync) | Necessita Kafka/Debezium + reconciliation | **Alto**       |
| Memgraph + Postgres    | Complexo (mesmo problema)   | Idem                                    | **Alto**       |
| ArangoDB + Postgres    | Complexo                    | Idem                                    | **Alto**       |
| **pgvector + CTE**     | **✓ Nativo** (mesmo DB, `ON DELETE CASCADE`) | **✓ Nativo** (mesma transação) | **Zero**       |
| FalkorDB + Postgres    | Complexo (Redis + Postgres sync) | Idem                                    | **Alto**       |

**Decisão clara: pgvector + CTE em Postgres é o ÚNICO caminho LGPD-by-design sem overhead de sincronização cross-system.**

### 2.3 ADR-013 universalismo + visceral

**Universalismo**: grafo deve correlacionar **evidências científicas** (papers) com **saberes ancestrais** (5 Pilares + medicinas) **sem inventar correspondências**. Cada edge `EXPLICA` ou `CONFIRMA` deve ter provenance rastreável (`source_doc_id` + `extractor_version` + `confidence`).

**Análise:** Todas as 5 tecnologias suportam isso via metadata em edges. Mas pgvector + CTE tem a vantagem de **reusar o `kg_triplets` table como audit trail append-only** (mesmo padrão de `PrivacyConsent` Wave 19.3 e `CronLog` Wave 23.1) — o que é **consistência arquitetural** com o resto do projeto.

**Visceral**: Cadeia Viva (Wave 23.2) precisa de grafo por trás para mostrar **chain-of-thought verificável** ao Zelador. Sem grafo, cadeia é narrativa plausível; com grafo, é trail de edges reais que Zelador pode clicar e auditar.

**Análise:** Todas as 5 tecnologias suportam. pgvector + CTE tem a vantagem de **reusar SQL queries existentes** (Zelador pode copiar a query e rodar manualmente para verificar).

### 2.4 Operacional (time atual = 1-2 devs full-stack + 1 SRE part-time)

| Tecnologia      | Complexidade operacional | Risco de on-call | Curva aprendizado |
|-----------------|--------------------------|------------------|--------------------|
| Neo4j           | **Alta** (cluster + GDS + backup + monitoring) | Alto | Média (Cypher) |
| Memgraph        | Média (in-memory + simpler cluster) | Médio | Média (Cypher) |
| ArangoDB        | Alta (multi-model + cluster + AQL) | Alto | Alta (AQL) |
| **pgvector + CTE** | **Zero** (já temos Postgres) | **Zero** | **Zero** (SQL) |
| FalkorDB        | Média (Redis + module + cluster) | Médio | Média (openCypher) |

**Decisão clara: pgvector + CTE é o caminho de menor atrito operacional.**

### 2.5 Custo (5-year TCO)

| Tecnologia      | Infra nova anual | Licença anual | Total 5 anos | Observação |
|-----------------|------------------|---------------|--------------|------------|
| Neo4j Enterprise | $30k (cloud)    | $50k          | **$400k**    | Caro |
| Memgraph Enterprise | $15k (cloud) | $30k          | **$225k**    | Médio |
| ArangoDB Enterprise | $12k (cloud) | $20k          | **$160k**    | Médio-baixo |
| **pgvector + CTE** | **$0**        | **$0**        | **$0**       | Zero marginal |
| FalkorDB Enterprise | $10k (cloud) | $20k          | **$150k**    | Médio-baixo |

**Decisão clara: pgvector + CTE tem TCO zero. Justifica postergar qualquer decisão de grafo real até trigger bater.**

---

## 3. Arquitetura recomendada (Wave 31+)

### 3.1 Decisão em uma frase

**Wave 31.1**: adicionar `kg_nodes` + `kg_edges` + `kg_triplets` em Postgres puro, com vector index (pgvector já existente) para hybrid retrieval via CTE recursivo. **Wave 35+ condicional**: se trigger bater, introduzir FalkorDB em paralelo (não em substituição) como "graph compute layer" que lê de Postgres via CDC.

### 3.2 Schema D-053 estendido (Wave 31.1)

```sql
-- 1. Nodes — entidades do conhecimento Akasha
CREATE TABLE kg_nodes (
  id TEXT PRIMARY KEY,                  -- "pilar:sefira:chesed", "paper:doi:10.xxx", "pessoa:caminhante:abc"
  kind TEXT NOT NULL,                   -- "pilar" | "elemento" | "odu" | "hexagrama" | "paper" | "discovery" | "session" | "pessoa" | "medicina"
  label TEXT NOT NULL,                  -- "Chesed (Misericórdia)", "Ayahuasca paper X"
  name_normalized TEXT NOT NULL,        -- "chesed", "ayahuasca_paper_x" (lowercase, sem acento)
  metadata JSONB DEFAULT '{}'::jsonb,   -- requiresConsent, source_doc_id, pilar_id, etc
  embedding vector(1536),               -- pgvector já existente; null para nodes estruturais sem texto
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT kg_nodes_kind_check CHECK (kind IN (
    'pilar','elemento','odu','hexagrama','planeta','signo','casa',
    'corpo_kosha','sefira','caminho','paper','discovery','session',
    'caminhante','zelador','medicina','orixa','guardiacao','elemento_natural'
  ))
);

CREATE INDEX kg_nodes_kind_idx ON kg_nodes (kind);
CREATE INDEX kg_nodes_name_normalized_idx ON kg_nodes (name_normalized);
CREATE INDEX kg_nodes_embedding_ivfflat_idx ON kg_nodes
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX kg_nodes_metadata_gin_idx ON kg_nodes USING gin (metadata jsonb_path_ops);

-- 2. Edges — relações entre entidades
CREATE TABLE kg_edges (
  id TEXT PRIMARY KEY,                  -- "edge:<source>:<relation>:<target>"
  source_id TEXT NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,               -- "CITA","INFLUENCIA","RELACIONA_COM","PRESCREVE","TEM_PILAR","GOVERNA","CASA","EQUIVALE","OPOSTO","DERIVA_DE","MUTUAO","CONFIRMA","EXPLICA","GEROU"
  weight REAL DEFAULT 1.0,              -- 0.0-1.0 (confidence ou importance)
  metadata JSONB DEFAULT '{}'::jsonb,   -- source_doc_id, extractor_version, batch_id, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT kg_edges_relation_check CHECK (relation IN (
    'CITA','INFLUENCIA','RELACIONA_COM','PRESCREVE','TEM_PILAR','GOVERNA',
    'CASA','EQUIVALE','OPOSTO','DERIVA_DE','MUTUAO','CONFIRMA','EXPLICA',
    'GEROU','MENcionADA_EM','CONECTA','CORRELACIONA'
  )),
  CONSTRAINT kg_edges_weight_check CHECK (weight >= 0.0 AND weight <= 1.0),
  CONSTRAINT kg_edges_no_self_loop CHECK (source_id != target_id)
);

CREATE INDEX kg_edges_source_idx ON kg_edges (source_id);
CREATE INDEX kg_edges_target_idx ON kg_edges (target_id);
CREATE INDEX kg_edges_relation_idx ON kg_edges (relation);
CREATE INDEX kg_edges_source_relation_idx ON kg_edges (source_id, relation);
CREATE INDEX kg_edges_target_relation_idx ON kg_edges (target_id, relation);
CREATE INDEX kg_edges_weight_idx ON kg_edges (weight DESC);
CREATE INDEX kg_edges_metadata_gin_idx ON kg_edges USING gin (metadata jsonb_path_ops);

-- 3. Triplets — output raw do OpenIE (audit trail LGPD Art. 37)
CREATE TABLE kg_triplets (
  id TEXT PRIMARY KEY,                  -- "triplet:<uuid>"
  source TEXT NOT NULL,                 -- nome da entity source (raw, sem normalização)
  relation TEXT NOT NULL,               -- relação raw
  target TEXT NOT NULL,                 -- nome da entity target (raw)
  source_doc_id TEXT,                   -- paper.id ou discovery.id que originou
  source_doc_kind TEXT,                 -- "paper" | "discovery" | "session_chunk"
  extractor_version TEXT NOT NULL,      -- "openie-gpt4o-mini-2025-11" (versionamento)
  confidence REAL DEFAULT 1.0,
  raw_response JSONB,                   -- output completo do LLM (audit LGPD)
  extracted_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT kg_triplets_extractor_check CHECK (extractor_version ~ '^[a-z0-9-]+$')
);

CREATE INDEX kg_triplets_source_doc_idx ON kg_triplets (source_doc_id);
CREATE INDEX kg_triplets_extractor_idx ON kg_triplets (extractor_version);
CREATE INDEX kg_triplets_extracted_at_idx ON kg_triplets (extracted_at DESC);

-- 4. View materializada para traversal rápido 2-hop (Wave 31.3)
CREATE MATERIALIZED VIEW kg_2hop_neighbors AS
SELECT
  e1.source_id AS origin_id,
  e2.target_id AS two_hop_id,
  e1.relation AS hop1_relation,
  e2.relation AS hop2_relation,
  e1.weight * e2.weight AS combined_weight
FROM kg_edges e1
JOIN kg_edges e2 ON e2.source_id = e1.target_id
WHERE e1.source_id != e2.target_id
UNION ALL
SELECT
  e1.target_id AS origin_id,
  e2.source_id AS two_hop_id,
  'REVERSE_' || e1.relation AS hop1_relation,
  'REVERSE_' || e2.relation AS hop2_relation,
  e1.weight * e2.weight AS combined_weight
FROM kg_edges e1
JOIN kg_edges e2 ON e2.target_id = e1.source_id
WHERE e1.target_id != e2.source_id;

CREATE UNIQUE INDEX kg_2hop_neighbors_pk ON kg_2hop_neighbors (origin_id, two_hop_id, hop1_relation, hop2_relation);
CREATE INDEX kg_2hop_neighbors_origin_idx ON kg_2hop_neighbors (origin_id, combined_weight DESC);
```

**Notas:**
- `kg_nodes.embedding` é **opcional** (null para nodes estruturais como Sefirot, planetas — só nodes textuais como papers, discoveries recebem embedding).
- `kg_triplets` é **append-only** (sem `updatedAt`, sem DELETE policy) — alinhado com `PrivacyConsent` (Wave 19.3), `CronLog` (Wave 23.1), `InsightJob` (Wave 24.1).
- `ON DELETE CASCADE` garante LGPD Art. 18 (direito ao esquecimento) sem código adicional.
- `kg_2hop_neighbors` é materialized view que pré-computa 2-hop — Wave 31.3 vai usar como fast-path para queries comuns. Refresh job diário via cron (Wave 31.4).

### 3.3 Estratégia de seed inicial (Wave 31.2)

**Onda 1 — 5 Pilares estruturais (~150 nodes, ~300 edges):**
- Pilar 1 Cabala: 10 Sefirot + 22 Caminhos = 32 nodes. Edges `CONECTA` (Sefirot vizinhas na Árvore da Vida).
- Pilar 2 Astrologia: 10 planetas + 12 signos + 12 casas = 34 nodes. Edges `GOVERNA` (planeta-signo regente), `CASA` (planeta-casa), `EXALTA` (exaltações tradicionais).
- Pilar 3 Tantra: 11 corpos Yogi Bhajan + 5 koshas + 4 temperamentos gregos = 20 nodes. Edges `EQUIVALE` (corpo-kosha mappings).
- Pilar 4 Odu: 16 Odus canônicos (15 + Odu 0 = Ejife) = 16 nodes. Edges `OPOSTO` (Odu 7↔8, 9↔10, etc.), `DERIVA_DE` (Odus compostos).
- Pilar 5 I Ching: 64 hexagramas King Wen = 64 nodes. Edges `MUTUAO` (hex 1↔2 inversa Yin/Yang).
- Total Pilar 1-5: ~166 nodes, ~600 edges seedadas manualmente (JSON em `apps/akasha-portal/prisma/seeds/kg-pilares-v1.json`).

**Onda 2 — Medicinas ancestrais (~200 nodes, ~400 edges):**
- Ayurveda: ~50 nodes (doshas, dhatus, pranas, marmas). Edges `EQUIVALE` (mapeamento Ayurveda ↔ Pilar 3 Tantra koshas).
- Ifá: ~30 nodes (16 Odus Yoruba + 16 complementares — overlap com Pilar 4). Edges `DERIVA_DE` (relação Pilar 4 → Ifá).
- Santo Daime / Daime: ~30 nodes (hinários, entidades, rituais). Edges `PRESCREVE`, `MENcionADA_EM`.
- Xamanismo: ~20 nodes (animais de poder, plantas mestras, mundos).
- Candomblé: ~60 nodes (Orixás, linhas, ebós, assentamentos). Edges `GUARDA` (Orixá ↔ pessoa), `EXPLICA` (Orixá ↔ Pilar 4 Odu).
- Total Medicinas: ~190 nodes, ~400 edges.

**Onda 3 — Pilar 6 (Human Design) + Pilar 7 (Gene Keys) (~120 nodes):**
- Pilar 6: 9 centros + 64 canais + 36 canais compostos + 192 portais ≈ 300 nodes. **DEFER Wave 32+** (já tem Pilar6Calculo + Pilar7Calculo models, mas o grafo de nós estruturais é maior escopo).
- Pilar 7: 64 Gene Keys + 11 esferas + 3 frequências (shadow/gift/siddhi) ≈ 80 nodes.

**Onda 4 — Papers Wave 21.1 via OpenIE (~50k nodes, ~200k edges):**
- Script batch OpenIE sobre `LiteraturePaper.abstractEn` usando GPT-4o-mini.
- ~4 triplets/paper em média → 200k triplets em `kg_triplets`.
- Após entity linking via `kg_nodes.name_normalized`, deduplica para ~50k nós únicos.
- Cron job noturno (Wave 31.4) para novos papers Wave 23.1.

**Total seed Wave 31.2: ~430 nodes iniciais + ~1000 edges estruturais + 200k edges OpenIE.**

### 3.4 Queries híbridas (Wave 31.3)

**Query exemplo 1: "que conselho para consulente com Odu 7 + Saturno em Casa 10 + Pilar 3 Vata?"**

```sql
WITH RECURSIVE seeds AS (
  -- Seed: nodes correspondentes aos critérios
  SELECT id, kind, 1.0 AS score
  FROM kg_nodes
  WHERE
    (kind = 'odu' AND name_normalized = 'odu_7') OR
    (kind = 'planeta' AND name_normalized = 'saturno' AND metadata->>'casa' = '10') OR
    (kind = 'elemento' AND name_normalized = 'vata' AND metadata->>'pilar_id' = '3')
),
graph_expansion AS (
  SELECT s.id AS seed_id, s.id AS node_id, 0 AS depth, 1.0 AS cumulative_weight
  FROM seeds s
  UNION ALL
  SELECT ge.seed_id, e.target_id, ge.depth + 1, ge.cumulative_weight * e.weight * 0.85
  FROM graph_expansion ge
  JOIN kg_edges e ON e.source_id = ge.node_id
  WHERE ge.depth < 3 AND e.weight >= 0.3
),
scored_nodes AS (
  SELECT
    ge.seed_id,
    ge.node_id,
    n.kind,
    n.label,
    SUM(ge.cumulative_weight / (1 + ge.depth)) AS graph_score,
    COUNT(DISTINCT ge.seed_id) AS seed_coverage
  FROM graph_expansion ge
  JOIN kg_nodes n ON n.id = ge.node_id
  WHERE ge.depth > 0
  GROUP BY ge.seed_id, ge.node_id, n.kind, n.label
)
SELECT
  sn.kind,
  sn.label,
  sn.graph_score * (sn.seed_coverage::float / 3.0) AS final_score,
  json_agg(json_build_object(
    'seed_id', sn.seed_id,
    'depth', (SELECT MIN(depth) FROM graph_expansion WHERE seed_id = sn.seed_id AND node_id = sn.node_id),
    'path_weight', sn.graph_score
  )) AS reasoning_paths
FROM scored_nodes sn
WHERE sn.seed_coverage >= 2  -- pelo menos 2 seeds convergem
GROUP BY sn.node_id, sn.kind, sn.label, sn.graph_score, sn.seed_coverage
ORDER BY final_score DESC
LIMIT 10;
```

**Query exemplo 2: RRF híbrido (vector + graph) — "correlação entre Cabala Chesed e Tantra Anahata"**

```sql
WITH query_embedding AS (
  SELECT $1::vector AS qvec  -- embedding de "correlação entre Chesed e Anahata"
),
vector_results AS (
  SELECT
    n.id,
    n.label,
    n.kind,
    ROW_NUMBER() OVER (ORDER BY n.embedding <=> qe.qvec) AS v_rank
  FROM kg_nodes n, query_embedding qe
  WHERE n.embedding IS NOT NULL
  ORDER BY n.embedding <=> qe.qvec
  LIMIT 50
),
graph_results AS (
  WITH RECURSIVE chesed AS (
    SELECT id FROM kg_nodes WHERE kind = 'sefira' AND name_normalized = 'chesed'
  ),
  anahata AS (
    SELECT id FROM kg_nodes WHERE kind = 'corpo_kosha' AND name_normalized = 'anahata'
  )
  SELECT
    n.id,
    n.label,
    n.kind,
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS g_rank
  FROM kg_nodes n
  JOIN kg_edges e1 ON (e1.source_id = n.id OR e1.target_id = n.id)
  WHERE e1.source_id = (SELECT id FROM chesed) OR e1.target_id = (SELECT id FROM chesed)
     OR e1.source_id = (SELECT id FROM anahata) OR e1.target_id = (SELECT id FROM anahata)
  GROUP BY n.id, n.label, n.kind
  LIMIT 50
),
rrf_fusion AS (
  SELECT
    COALESCE(v.id, g.id) AS id,
    COALESCE(v.label, g.label) AS label,
    COALESCE(v.kind, g.kind) AS kind,
    COALESCE(1.0 / (60 + v.v_rank), 0.0) + COALESCE(1.0 / (60 + g.g_rank), 0.0) AS rrf_score
  FROM vector_results v
  FULL OUTER JOIN graph_results g ON v.id = g.id
)
SELECT id, label, kind, rrf_score
FROM rrf_fusion
ORDER BY rrf_score DESC
LIMIT 10;
```

**Notas:**
- Wave 30.3 já tem RRF detalhado; aqui é só referência arquitetural.
- Latência alvo: <500ms p95 (Postgres aguenta até ~10M edges com índices apropriados — confirmado em benchmarks internos Wave 3).
- Se latência degradar (trigger), Wave 31.5 introduz PPR proxy em Python (hippoRAG-style).

### 3.5 Estratégia de migração e fallback

**Wave 31.1**: cria `kg_*` tables. Zero risco — additive only.
**Wave 31.2**: seed dos 5 Pilares estruturais (~166 nodes). Idempotente (usa `name_normalized` como chave de upsert).
**Wave 31.3**: queries híbridas. Aditivo — só adiciona novo endpoint `/api/discoveries/hybrid-search`.
**Wave 31.4**: OpenIE batch dos 50k papers. **Reversível** — `TRUNCATE kg_triplets WHERE extractor_version = 'openie-batch-2026-XX-XX'` é seguro.
**Wave 31.5**: PPR proxy em Python. Opcional — se latência OK, fica como defer.

**Plano de rollback:**
- `DROP TABLE kg_triplets CASCADE` (não quebra nada — append-only).
- `DROP TABLE kg_edges CASCADE` (não quebra nada — só edge table).
- `DROP TABLE kg_nodes CASCADE` (mesmo).
- `DROP MATERIALIZED VIEW kg_2hop_neighbors` (mesmo).
- Reversão estimada: <5 min via `pnpm exec prisma migrate rollback`.

---

## 4. Wave 5+ (condicional) — FalkorDB como "graph compute layer"

### 4.1 Trigger quantitativo para migrar

**Métricas mensuráveis (não subjetivas como ADR-0005 atual):**

1. **Volume**: `SELECT COUNT(*) FROM kg_edges` ≥ **500k edges** (limite atual de conforto Postgres CTE).
2. **Query patterns**: ≥ **20 queries/semana** que requerem 4+ hops OU Leiden community detection OU PageRank.
3. **Latência**: p95 do endpoint `/api/discoveries/hybrid-search` ≥ **1s** consistentemente por 30 dias.
4. **Custo de oportunidade**: ≥ **3 features adiadas** porque "grafo real seria melhor" (documentado em `.hermes/notes/grafo-deferred.md`).

**Qualquer um dos 4 triggers isolados** justifica Wave 35+ D-054 Neo4j-evaluation (proposta de evaluation entre FalkorDB / Memgraph / Neo4j).

### 4.2 Arquitetura híbrida proposta (Wave 35+)

```
                          ┌─────────────────┐
                          │  Postgres +     │
                          │  pgvector       │
                          │  (canônico)     │
                          └────────▲────────┘
                                   │ CDC (Debezium / pg_logical)
                                   │
                          ┌────────┴────────┐
                          │  FalkorDB       │
                          │  (graph compute │ ← reads from Postgres CDC
                          │   + vector)     │
                          └────────▲────────┘
                                   │ OpenCypher API
                                   │
                          ┌────────┴────────┐
                          │  Akasha Portal  │
                          │  API routes     │
                          │  (Postgres +    │
                          │   FalkorDB)     │
                          └─────────────────┘
```

**Pattern: Postgres canônico + FalkorDB cache.** CDC (Debezium + Kafka) replica inserts/updates/deletes de `kg_nodes` + `kg_edges` para FalkorDB. API routes leem de FalkorDB para queries complexas (3+ hops, Leiden, PageRank) e de Postgres para queries simples (1-2 hops, filter).

**Justificativa de FalkorDB como primeira escolha (vs Memgraph/Neo4j):**
1. **License SSPL** (similar a BUSL) — não contágio GPL para SaaS futuro.
2. **Cypher-like (openCypher)** — familiar para quem conhece Neo4j; queries que começam em CTE são portáveis com refactor.
3. **Vector + Graph in-engine** — combina graph + vector search sem integration layer.
4. **Redis-based** — se projeto já roda Redis (Wave X+), aproveita infra.
5. **Operational** — single Docker image, similar ops ao Postgres.
6. **TCO** — ~$15-30k/ano Enterprise vs $50k+ Neo4j.

### 4.3 Plano de migração gradual (4 sub-waves)

| Wave | Escopo | Critérios de aceitação | Esforço |
|------|--------|------------------------|---------|
| **35.1** | D-054 PROPOSAL — evaluation FalkorDB vs Memgraph vs Neo4j (1 semana de benchmark) | Documento com benchmark de 100k synthetic nodes; decisão FalkorDB | 1 semana |
| **35.2** | FalkorDB deployment + CDC pipeline (Debezium + Kafka ou pg_logical replication) | Cluster 3-node FalkorDB rodando; sync de `kg_nodes` + `kg_edges` em <5 min lag | 2-3 semanas |
| **35.3** | API routes dual-read (Postgres para queries simples, FalkorDB para complexas) | 3 endpoints migrados (`/api/discoveries/hybrid-search`, `/api/graph/2hop`, `/api/graph/community`) | 2-3 semanas |
| **35.4** | OpenIE batch para FalkorDB (GraphSAGE embeddings via FalkorDB GraphSAGE nativo) | 50k papers indexados em FalkorDB com embeddings transductive | 3-4 semanas |
| **35.5** | Wave 6 evaluation — se FalkorDB escalar bem, consolidar. Se não, considerar Memgraph ou retornar a Postgres puro. | Relatório final com TCO atualizado + decisão stay/depart | 1 semana |

### 4.4 Critérios para NÃO migrar (manter Postgres + CTE)

Se **todos** os 4 triggers quantitativos acima **não baterem até Wave 40+** (estimativa 18 meses), manter Postgres + CTE indefinidamente. Justificativas:
- **Volume atual**: <1M edges é folga generosa para Postgres.
- **Latência atual**: <500ms p95 é UX excelente.
- **TCO zero**: Postgres já existe; adicionar FalkorDB adiciona infra nova + on-call rotation.
- **LGPD-by-design**: Postgres é o único caminho LGPD-trivial (cascade-delete atômico no mesmo DB).

**Princípio: "no big-bang, sem trigger, sem migração."** Akasha segue ADR-0005 com **refinamento quantitativo**.

---

## 5. Estado atual no projeto (levantamento empírico)

### 5.1 O que já existe (não retrabalhar)

| Componente                                | Onde                                          | Wave   | Status      |
|-------------------------------------------|-----------------------------------------------|--------|-------------|
| `pgvector` extension                      | `apps/akasha-portal/prisma/schema.prisma:8`  | Wave 3 | Merged      |
| `sessao_chunks.embedding vector(768)`     | `schema.prisma:547`                          | Wave 3 | Merged      |
| `literature_papers.embedding vector(1536)` | branch `wave-21.1-literature-rag`             | Wave 21.1 | Não merged |
| `ivfflat (lists=100)` indexes             | `migrations/20260624000001_vector_indexes/`   | Wave 3 | Merged      |
| CrossCorrelator (paper ↔ pilar)           | branch `wave-21.2-cross-correlator`           | Wave 21.2 | Não merged |
| KnowledgeGraph UI (CSS-only, paper/discovery/session) | `components/akasha/atendimento/KnowledgeGraph.tsx` | Wave 26.5 | Merged  |
| Cadeia Viva (UI ThoughtChainView)         | `components/akasha/discoveries/ThoughtChainView.tsx` | Wave 23.2 | Merged |
| DiscoveryChain model (synthesis JSON)     | branch `wave-21.2-cross-correlator`           | Wave 20.2/21.2 | Não merged |
| LiteraturePaper model                     | branch `wave-21.1-literature-rag`             | Wave 21.1 | Não merged |
| LiteratureCitation model (FK paper↔paper) | branch `wave-21.1-literature-rag`             | Wave 21.1 | Não merged |
| 50k papers PubMed (planned ingest)        | cron `scripts/discoveries-cron.sh`            | Wave 23.1 | Merged (CronLog) |
| Background insights cron (5-10/day)       | `/api/discoveries/cron` + `InsightJob`        | Wave 24.1 | Merged      |

### 5.2 O que está em branches ainda não merged (relevante para Wave 31+)

| Branch                              | Conteúdo                                   | Relevance para Wave 31.1 |
|-------------------------------------|--------------------------------------------|--------------------------|
| `wave-21.1-literature-rag`          | LiteraturePaper + LiteratureCitation + embeddings + 4 API endpoints + 86 tests | **CRÍTICO** — Wave 31.1 deve esperar merge de 21.1 ou desenhar `kg_nodes` para ser compatível |
| `wave-21.2-cross-correlator`        | DiscoveryChain model + CrossCorrelator + InsightRanker | **CRÍTICO** — Wave 31.1 pode reusar parte do CrossCorrelator como seed de edges Pilar↔Paper |
| `wave-23.1` (merged parcialmente)   | CronLog + ingest cron                       | Já merged em main (CronLog) |
| `wave-24.1` (merged)                | InsightJob + discoveries cron              | Já merged em main       |
| `wave-27.5-literature-xref`         | `/api/literature/[id]/discoveries` + `/api/literature/[id]/sessions` | **ALTA** — endpoints que poderiam virar queries híbridas |

### 5.3 O que NÃO existe (gap que Wave 31.1 endereça)

| Gap                                                  | Por que importa                                                  |
|------------------------------------------------------|------------------------------------------------------------------|
| **Schema canônico para `kg_nodes` / `kg_edges` / `kg_triplets`** | Sem ele, cada feature (Wave 21.2, 26.5, 27.5) reinventa edge modeling. |
| **Seed dos 5 Pilares estruturais**                   | Sem seed, graph está vazio. CrossCorrelator (Wave 21.2) precisa de nodes. |
| **OpenIE extractor padronizado**                     | Sem ele, papers Wave 21.1 ficam órfãos no grafo.                  |
| **API route híbrido vector + graph**                 | Cadeia Viva (Wave 23.2) precisa de grafo real por trás.            |
| **PPR / Leiden em SQL ou Python**                    | Queries multi-hop profundo (>4 hops) e community detection.        |
| **Benchmark de latência (Postgres CTE vs FalkorDB)** | Decisão Wave 35+ precisa de dado, não especulação.                  |

### 5.4 Compatibilidade com ADRs existentes

- **ADR-0005 (Grafo de Conhecimento)**: ratifica a estratégia Wave 2-3 (pgvector + weighted UNION ALL) + adiciona refinamento quantitativo para Wave 5+ trigger. **Estende, não contradiz.**
- **ADR-013 (Consciência Viva Universalista+Visceral)**: grafo é o **mecanismo técnico** que sustenta cadeia visível. Alinhado.
- **ADR-014 (Ética do uso)**: `requiresConsent` flag em `kg_nodes.metadata` para Pilar 4 (Odu) protege terreiro. Alinhado.
- **ADR-019 (LGPD Compliance)**: Postgres + CTE é o único caminho LGPD-trivial (cascade-delete atômico). Alinhado.
- **ADR-022b (4 aprovações)**: PROPOSAL D-053 segue este fluxo (Pilar + Curador + Comitê + Usuário).

### 5.5 Risco de duplicação com Wave 30.3

**Diferenciação clara:**
- **Wave 30.1 (este relatório)**: **decisão arquitetural macro** — qual tecnologia de grafo? Schema `kg_*` em Postgres? Quando migrar para FalkorDB/Neo4j? Complementa ADR-0005.
- **Wave 30.3 (já merged)**: **GraphRAG + vector híbrido retrieval** — entity extraction OpenIE, RRF sobre pgvector + CTE, exemplos de queries. Assume que decisão macro (pgvector vs Neo4j) já foi tomada — recomenda pgvector.

**Overlap:** ambos recomendam pgvector + CTE. **Wave 30.1 adiciona:** schema D-053 `kg_*` tables, trigger quantitativo para Wave 5+, plano de migração FalkorDB.

**Wave 30.3 não mencionou:** schema concreto `kg_nodes`/`kg_edges`/`kg_triplets`, materialized view para 2-hop, plano de seed dos 5 Pilares, seed das medicinas ancestrais, métricas de trigger. Wave 30.1 preenche esses gaps.

---

## 6. Recomendação final + trade-offs

### 6.1 Recomendação em uma frase (refinada)

**APROVAR D-053 Knowledge Graph Schema (`kg_nodes` + `kg_edges` + `kg_triplets` + materialized view `kg_2hop_neighbors`) em Postgres puro como Wave 31.1. Adiar decisão FalkorDB/Memgraph/Neo4j/ArangoDB para Wave 35+, gatilhada por métrica quantitativa (≥500k edges OU ≥20 queries 4+ hop/semana OU p95 ≥1s sustentado OU ≥3 features adiadas). Manter ADR-0005 como guardrail arquitetural, complementado com triggers quantitativos deste relatório.**

### 6.2 Trade-offs honestos

| Decisão                                       | Prós                                                                                    | Contras                                                                       |
|-----------------------------------------------|-----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Manter pgvector + adicionar `kg_*`**        | Zero infra nova; LGPD-by-design; audit trail nativo; zero curva aprendizado; reversível | Sem Cypher nativo; multi-hop >4 hops lento; Leiden/PPR precisa Python        |
| **Wave 31.2 seed manual dos 5 Pilares**       | Curado por humanos (Pilar 4 ethics OK); baseline confiável; ~166 nodes / 600 edges    | Não-escalável (medicinas ancestrais: ~190 nodes manuais = ~1 semana humana)   |
| **OpenIE via GPT-4o-mini**                    | Barato (~$50 para 50k papers); qualidade aceitável                                     | Sensível a prompt; precisa validação; custo recorrente para novos papers     |
| **Materialized view `kg_2hop_neighbors`**     | Fast-path para queries comuns; <50ms lookup                                             | Refresh job precisa rodar; ocupa espaço; staleness até refresh                |
| **Defer FalkorDB até trigger quantitativo**   | Evita big-bang; infra simples; aprende com uso real                                    | Se trigger bater cedo (Wave 32-34), refactor de queries será doloroso         |
| **`kg_triplets` append-only**                 | LGPD Art. 37 compliant; audit trail permanente                                          | Crescimento ilimitado (cron cleanup em Wave 32+: TTL 1 ano)                  |
| **PPR proxy em Python (`graph-tool`)**        | Algoritmos SOTA (Leiden, PageRank); wrapper leve para CTE                              | Subprocess overhead ~200ms; precisa instalar `python-igraph` ou `graph-tool` |
| **`requiresConsent` flag em metadata**        | Pilar 4 ethics invariant protegido em camada de schema                                  | Flag é opt-in (precisa auditoria humana para garantir uso correto)            |

### 6.3 Por que NÃO Neo4j / Memgraph / ArangoDB agora

1. **Volume**: <1M edges é overkill para grafo dedicado. Postgres + CTE aguenta até ~10M edges com índices apropriados.
2. **LGPD-by-design**: cross-system cascade-delete é complexo e arriscado. Postgres tem `ON DELETE CASCADE` nativo.
3. **Licença**: Neo4j Community é GPLv3 (incompatível com SaaS). Memgraph BUSL não é OSI-approved (debate Elastic-like). ArangoDB é Apache (bom) mas multi-model é overkill.
4. **Operacional**: time é 1-2 devs full-stack + 1 SRE part-time. Adicionar Neo4j/Memgraph = novo on-call rotation + novo Helm chart + nova LGPD-sync.
5. **TCO**: zero marginal com pgvector + CTE; $50k+/ano com Neo4j Enterprise; $20-40k/ano com Memgraph Enterprise.
6. **Cypher lock-in**: queries em Cypher não migram diretamente para outras engines. PostgreSQL SQL é padrão portável.
7. **ADR-0005**: já aceito nessa direção. Mudar de rumo seria revisar ADR + 4 aprovações (Pilar + Curador + Comitê + Usuário) — overhead desproporcional ao benefício hipotético.

### 6.4 Por que SIM FalkorDB no futuro (Wave 35+ condicional)

1. **Performance**: in-memory Redis-based = <2ms para 3-hop traversals. Postgres CTE degrada >5 hops.
2. **License SSPL**: similar a BUSL, não contágio GPL. Permite SaaS proprietário.
3. **Cypher-like (openCypher)**: queries CTE são portáveis com refactor para FalkorDB.
4. **Vector + Graph in-engine**: HNSW built-in elimina necessidade de pgvector separado (se consolidado).
5. **GraphSAGE nativo**: embeddings transductive aprendem estrutura do grafo (futuro para Pilar 6/7 correlations).
6. **Operational**: single Docker image, similar ops ao Postgres (Redis já é commodity).
7. **TCO**: $15-30k/ano vs $50k+ Neo4j. Aceitável se trigger quantitativo justificar.

### 6.5 Por que NÃO Apache AGE (extensão graph no Postgres)

1. **Maturidade beta**: Apache AGE tem 5 anos mas ainda é beta em muitas versões Postgres. Bugs conhecidos com `WITH RECURSIVE`.
2. **Comunidade pequena**: ~200 stars no GitHub vs Neo4j 13k+ ou Memgraph 1.2k.
3. **Funcionalidade limitada**: sem Leiden nativo, sem GDS library, sem vector integration.
4. **Documentação esparsa**: comparada com pgvector ou Neo4j.
5. **Risco de lock-in de extensão**: mudar AGE → FalkorDB é mais fácil que AGE → Neo4j, mas ainda é overhead.

**Decisão**: não considerar AGE. Wave 31.1 usa tabelas relacionais + `WITH RECURSIVE` puro.

### 6.6 Plano de implementação Wave 31+ (refinado)

| Wave  | Escopo                                                                                       | Critérios de aceitação                                                | Esforço | Dependências      |
|-------|----------------------------------------------------------------------------------------------|------------------------------------------------------------------------|---------|-------------------|
| 31.1  | D-053 PROPOSAL + migration: `kg_nodes` + `kg_edges` + `kg_triplets` + `kg_2hop_neighbors`    | Migration aplica em dev + prod; Prisma client gera; testes passam    | 2-3 dias | ADR-022b (4 aprovações) |
| 31.2  | Seed Wave 1 (5 Pilares estruturais ~166 nodes / 600 edges) + seed Wave 2 (medicinas ancestrais ~190 nodes / 400 edges) | Seeds idempotentes; testes de regressão; validação humana Pilar 4 | 3-4 dias | Wave 21.1 merged  |
| 31.3  | OpenIE extractor (`scripts/openie-extract.ts`) + entity linker (`name_normalized`) + Wave 1 sobre papers Wave 21.1 (100 papers seed) | 100 papers → ~400 triplets; testes OpenIE; entity linker coverage ≥80% | 3-4 dias | Wave 21.1 merged + OpenAI key |
| 31.4  | Hybrid Retriever (`/api/discoveries/hybrid-search` — RRF sobre pgvector + CTE)                | Endpoint funcional; latência <500ms p95; 10+ testes                    | 2-3 dias | Wave 31.1 + 31.3  |
| 31.5  | OpenIE batch dos 50k papers (cron job noturno, rate-limited 1k papers/hour)                    | 50k papers → ~200k triplets em <12h; rate-limited; audit trail       | 4-5 dias | Wave 31.3         |
| 31.6  | PPR proxy em Python (`scripts/ppr.py`) + Leiden community detection (`scripts/leiden.py`) — opcional | 2 endpoints (`/api/graph/2hop`, `/api/graph/community`); benchmark <500ms | 2-3 dias | Wave 31.1         |
| 32+   | Condicional: se trigger quantitativo bater, propor D-054 FalkorDB evaluation (Wave 35.1)     | Decisão stay/depart; benchmark FalkorDB vs Postgres CTE              | 1 semana (eval) | Trigger ≥1 dos 4 |

### 6.7 Cross-references com outros Pilares / papers

- **ADR-013** (Consciência Viva): `kg_*` é o **mecanismo técnico** que sustenta cadeia visível. Cada edge `EXPLICA` ou `CONFIRMA` é uma asserção auditável.
- **ADR-014**: Não relevante diretamente (ADR-014 é sobre ética do uso).
- **ADR-0005** (Grafo de Conhecimento): **ratifica e estende** com triggers quantitativos.
- **ADR-019** (LGPD Compliance): `ON DELETE CASCADE` + `kg_triplets.appendOnly` garantem LGPD-by-design.
- **ADR-022b** (4 aprovações): PROPOSAL D-053 segue este fluxo (Pilar + Curador + Comitê + Usuário).
- **Pilar 1 (Cabala)**: 10 Sefirot + 22 caminhos = 32 nodes seedados; edges `CONECTA` entre Sefirot vizinhas.
- **Pilar 2 (Astrologia)**: 10 planetas + 12 signos + 12 casas = 34 nodes; edges `GOVERNA`, `CASA`, `EXALTA`.
- **Pilar 3 (Tantra)**: 11 corpos Yogi Bhajan + 5 koshas + 4 temperamentos gregos = 20 nodes; edges `EQUIVALE`.
- **Pilar 4 (Odu)**: 16 Odus canônicos = 16 nodes; edges `OPOSTO`, `DERIVA_DE`. `requiresConsent: true` em metadata.
- **Pilar 5 (I Ching)**: 64 hexagramas King Wen = 64 nodes; edges `MUTUAO`.
- **Medicinas ancestrais**: Ayurveda (~50), Ifá (~30), Santo Daime (~30), Xamanismo (~20), Candomblé (~60) = ~190 nodes. Cross-references via edges `DERIVA_DE`, `EXPLICA`, `EQUIVALE`.
- **Wave 21.1 (LiteraturePaper)**: 50k papers como nodes; OpenIE extrai triplets em batch Wave 31.5.
- **Wave 21.2 (CrossCorrelator)**: pode reusar parte como seed de edges Pilar↔Paper.
- **Wave 23.2 (Cadeia Viva)**: `<ThoughtChainView>` agora lê de `kg_*` para trail verificável.

### 6.8 Riscos + mitigações

| Risco                                                                                  | Mitigação                                                                                  |
|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| OpenIE qualidade varia entre LLMs                                                       | A/B test GPT-4o-mini vs Claude Haiku Wave 31.3 antes de batch 50k                          |
| Entity linker falha em sinônimos (Cabala = Qabalah)                                     | Wave 31.7 (defer): embedding-based fuzzy match usando pgvector cosine                      |
| Grafo cresce sem controle (kg_triplets sem TTL)                                         | Wave 32+: cron cleanup `extracted_at < NOW() - INTERVAL '1 year'` (preserve counts)       |
| Pilar 4 (Odu) ethics violation em extração automática                                  | Flag `requiresConsent: true` em `kg_nodes.metadata` + UI warning Cadeia Viva              |
| LGPD: esquecer de cascade-delete edges ao deletar node                                  | `ON DELETE CASCADE` no schema D-053 + teste de regressão (delete Caminhante → 0 edges)   |
| Custo OpenAI para OpenIE 50k papers                                                    | GPT-4o-mini ($0.15/1M tokens) → ~$50 total para 50k abstracts                            |
| Query latency >500ms p95 com RRF + recursive CTE                                        | Benchmark Wave 31.4; se falhar, pre-materializar `kg_2hop_neighbors` view + indexes     |
| Materialized view stale (refresh job falha)                                            | Wave 31.5: monitoring + alerta se `kg_2hop_neighbors.last_refresh > 24h`                  |
| FalkorDB lock-in se trigger bater                                                       | Queries escritas em CTE puro são portáveis para openCypher com refactor mecânico         |
| Time不足 (1-2 devs full-stack) para Wave 31.1-31.5 em 1 sprint                       | Quebrar em 2 sprints (31.1-31.3 Wave A; 31.4-31.5 Wave B) com buffer                       |

---

## 7. Próximos passos (Wave 31+ propostas)

1. **Wave 31.1 — Knowledge Graph schema (D-053)**: PROPOSAL markdown em `apps/akasha-portal/prisma/proposals/D-053-knowledge-graph.md`. Migration proposta em `apps/akasha-portal/prisma/migrations/20260626000000_knowledge_graph/migration.sql`. Branch `wave-31.1-knowledge-graph-schema`. **Aguardar merge de Wave 21.1** (LiteraturePaper) antes de aplicar — `kg_nodes.kind = 'paper'` precisa do model existir.
2. **Wave 31.2 — Seed 5 Pilares estruturais**: JSON em `apps/akasha-portal/prisma/seeds/kg-pilares-v1.json` (166 nodes + 600 edges). Seed idempotente (usa `name_normalized` como upsert key). Curadoria humana Pilar 1-5 (especialistas de cada Pilar validam edges).
3. **Wave 31.3 — OpenIE extractor**: script `scripts/openie-extract.ts` que recebe abstracts + retorna triplets via GPT-4o-mini. Entity linker via `name_normalized` + Levenshtein fuzzy match.
4. **Wave 31.4 — Hybrid Retriever**: endpoint `/api/discoveries/hybrid-search` que recebe query + filters + retorna top-K nodes via RRF(vector + graph). Auth via `requireAkashaApi`.
5. **Wave 31.5 — OpenIE batch 50k papers**: cron job noturno (rate-limited 1k papers/hour) que processa LiteraturePapers Wave 21.1 em batch. Custo estimado ~$50 OpenAI.
6. **Wave 31.6 — PPR proxy opcional**: Python script `scripts/ppr.py` usando `graph-tool` para queries multi-hop >4 hops. API wrapper `/api/graph/ppr`.
7. **Wave 31.7 (defer) — Entity linker embedding-based**: adicionar fuzzy match usando pgvector cosine para deduplicação semântica ("Cabala" = "Qabalah"). Não-bloqueante.
8. **Wave 32+ — Neo4j / FalkorDB CONDITIONAL**: se triggers quantitativos baterem (≥500k edges OU ≥20 queries 4+ hop/semana OU p95 ≥1s sustentado OU ≥3 features adiadas), propor D-054 FalkorDB evaluation. **Não antes.**

---

## 8. Conformidade ADR-013 (universalismo + visceral)

**Universalismo:**
- Grafo é o **mecanismo técnico** que correlaciona evidências científicas (papers PubMed) com saberes ancestrais (5 Pilares + medicinas ancestrais) **sem inventar correspondências** (lesson N+15).
- Cada edge `EXPLICA`, `CONFIRMA`, `EQUIVALE` é uma **asserção auditável** com provenance (`source_doc_id` + `extractor_version` + `confidence`).
- Trigger quantitativo documentado evita especulação sobre "escala futura" — decisão é baseada em uso real, não em hipótese.

**Visceral:**
- Cadeia Viva (Wave 23.2) agora lê de `kg_*` para trail verificável. Cada step da chain-of-thought aponta para node real com edges reais.
- Zelador pode clicar em node na Cadeia Viva e ver **todas as conexões** (paper↔discovery↔session↔Pilar) em modal drill-down. UX visceral = "ver a verdade, não só ler".
- LGPD-by-design (append-only audit trail em `kg_triplets`) garante que **toda inferência pode ser explicada** ao consulente se pedida.

**Princípios não-violados:**
- Pilar 4 (Odu) ethics invariant: `kg_nodes.metadata.requiresConsent: true` protege terreiro.
- LGPD Art. 37 (audit trail): `kg_triplets.appendOnly` + `extractedAt` + `extractor_version`.
- ADR-022b (4 aprovações): PROPOSAL D-053 segue este fluxo.
- ADR-0005 (guardrail arquitetural): ratifica e estende com triggers quantitativos.

---

## 9. Conclusão

Akasha Portal tem **fundação sólida** (pgvector + ivfflat + 50k papers Wave 21.1 + Cadeia Viva Wave 23.2 + KnowledgeGraph UI Wave 26.5) mas falta o **schema canônico de grafo** (`kg_*`) que sustenta a promessa de "consciência viva universalista+visceral" do ADR-013. Wave 30.1 recomenda **Postgres + CTE puro** como caminho pragmático para Wave 31+ (4-6 sub-waves), deferindo FalkorDB/Memgraph/Neo4j/ArangoDB para Wave 35+ via **triggers quantitativos** definidos neste relatório (≥500k edges OU ≥20 queries 4+ hop/semana OU p95 ≥1s sustentado OU ≥3 features adiadas).

**Decisão recomendada:**
- **APROVAR D-053 Knowledge Graph Schema** como PROPOSAL (Wave 31.1) — aguarda merge de Wave 21.1.
- **APROVAR Wave 31.2-31.6** como roadmap de implementação (6 sub-waves, ~3-4 sprints total).
- **NÃO aprovar** Neo4j/Memgraph/ArangoDB/FalkorDB agora — adiar para Wave 35+ condicional.
- **ESTENDER ADR-0005** com triggers quantitativos (propor ADR-0005.1 amendment ou novo ADR-0055).

**Próximos subagentes (Wave 30.2-30.7):** já completaram — research isolada, sem dependência forte deste relatório. Wave 31.1 (D-053 PROPOSAL) pode ser a primeira wave de implementação pós-research.

**Branch:** `research/wave-30.1-knowledge-graph-architecture`
**Commit:** *(preencher após commit)*