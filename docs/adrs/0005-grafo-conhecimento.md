# 0005 — Grafo de Conhecimento (Knowledge Graph)

**Status:** accepted (2026-06-23, vision realignment + research consolidation)

**Research basis:**
- `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-rag-multitenant-2026-06-23.md` (Research 1 — RAG multi-tenant)
- `/home/skynet/cabala-dos-caminhos/docs/25_visao-akasha.md` (visao revisada)

## Context

A visao revisada (2026-06-23) define que o Akasha precisa de um **grafo de conhecimento** que correlacione os 7 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching, Human Design traduzido, Gene Keys traduzido) automaticamente. O Zelador nao tem tempo de ler cada mapa individualmente — precisa de uma **tese sintetica** + **cadeia de pensamento visivel**.

A pergunta arquitetural: **como implementar a correlacao?**

Opcoes:
1. **Grafo real** (Neo4j, Memgraph) com nodes por Pilar e edges por correlacao.
2. **Embeddings + pgvector** com weighted retrieval (ja descrito em ADR 0004).
3. **Hibrido**: pgvector para retrieval + Neo4j para regras de correlacao estruturadas.

## Decision

**Implementacao em 2 waves, nao big-bang:**

### Wave 2-3: **Weighted UNION ALL sobre pgvector** (ja descrito em ADR 0004)

**Por que comecar simples:**
- pgvector ja em producao, escala adequada (≤250k vetores)
- UNION ALL com pesos (1.0 pessoal, 0.8 sessoes, 0.4 global) captura 80% do valor de "correlacionar"
- Implementacao mais rapida (~10 dias vs ~30 dias pra grafo real)
- LGPD-deletion sincronizada com Postgres

**Limitacoes aceitas:**
- Correlacoes sao **estatisticas** (similaridade semantica), nao **logicas** (regras "se Pilar 1 X e Pilar 4 Y entao Pilar 6 Z")
- Impossivel fazer queries estruturadas tipo "todos os consulentes com Odu 7 e Saturno em Casa 10"
- Nao captura regras de dominio complexas (ex: "se Exu Tranca Ruas e Maria Padilha sao guardioes, firmezas de esquerda sao recomendadas")

### Wave 5+: **Grafo real (Neo4j ou Memgraph)** se necessario

Quando o uso real do Zelador mostrar que correlacoes logicas sao criticas (e weighted UNION ALL nao basta), implementar grafo real:
- Neo4j ou Memgraph (graph DB)
- Nodes: Caminhante, Pilar, Elemento, Orixa, Mapa, Sessao, Prescricao
- Edges: `TEM_PILAR`, `INFLUENCIADO_POR`, `GUARDADO_POR`, `PRESCREVE`
- Queries Cypher para correlacoes complexas

**Trigger para migrar:** se Zelador pedir "correlacoes que nao consigo expressar em busca semantica" 3+ vezes em sessoes reais, justifica Wave 5.

## Consequence

**Positivo:**
- Wave 2-3 entrega valor rapido (correlacao estatistica ja e poderosa)
- Sem big-bang refactor (Neo4j seria infra nova + LGPD-sync complexa)
- Trigger claro para Wave 5+ (baseado em uso real, nao especulacao)

**Negativo:**
- Correlacoes logicas (regra de dominio) nao capturadas na Wave 2-3
- Zelador pode pedir queries estruturadas que weighted UNION ALL nao responde
- Se Wave 5+ for necessario, alguma migracao de dados/correlacao sera inevitavel

## Alternatives Considered

- **Neo4j desde o inicio**: rejeitado — custo operacional + LGPD-sync.
- **Memgraph embedded em Postgres (pgvector + grafo)**: rejeitado — limitado em escala para grafos complexos.
- **Reuse RAGFlow/AnythingLLM como dependencia externa**: rejeitado — adiciona dependencia externa + licenca complexa.

## Open Follow-ups

- **Wave 2**: Design proposal D-XXX com schema das 3 tabelas (Sessao, SessaoChunk, GrimorioPessoal) + weighted UNION ALL
- **Wave 3**: Implementacao + testes de regressao multi-tenant
- **Wave 5+ (condicional)**: Decidir Neo4j vs Memgraph baseado em uso real

## Reversibility

**Medium hard to reverse:** Wave 2-3 entrega valor real + Wave 5+ seria expansao (nao reversao). Mas se Zelador precisar de correlacoes logicas **antes** de Wave 5+ ficar disponivel, frustracao.

**Pode ser mitigado:** Documentar no Wave 3 entrega que correlacoes logicas sao limitacao conhecida + coletar feedback do Zelador em sessoes reais.
