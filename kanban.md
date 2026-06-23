# Kanban Akasha (Zelador-Tool)

> **Visão canonica:** [`docs/25_visao-akasha.md`](docs/25_visao-akasha.md) (revisada 2026-06-23).
> **Modelo de trabalho:** Spec-Driven Development. Specs e ADRs ANTES de código. Subagentes sob demanda via `delegate_task`. Tu delega a mim, eu delego pros subagentes.
> **Status:** Living document. Movido por mim (orchestrator) com base nas tuas decisoes no grill. Tu revisa + ajusta.

---

## Legenda

- **[ ]** — a fazer (backlog)
- **[~]** — em andamento (subagente trabalhando)
- **[x]** — feito (commit feito ou PR aberto)
- **[!]** — bloqueado (decisao tua pendente)
- **Wave N** — ordem sugerida (Wave 1 = agora)

---

## Wave 1 — Documentacao + Research (esta semana)

> Bloqueador: nenhuma. Posso executar agora.

### Documentos canonicos

- [x] Atualizar `docs/25_visao-akasha.md` com nova visao (Zelador-tool + 7 Pilares)
- [x] Criar `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md` (reverte rejeicao do Pilar 6, adiciona 7 Pilares)
- [x] Criar `docs/adrs/0003-mentor-mestre-sacerdote.md` (redefine persona do Mentor)
- [x] Criar `docs/adrs/0004-multi-tenant-consulente-mcp.md` (arquitetura multi-tenant)
- [x] Criar este `kanban.md`
- [ ] Criar `docs/adrs/0005-grafo-conhecimento.md` (Wave 2 — apos research)

### Research (delegar a subagentes)

- [~] **Subagente 1**: Research sobre RAG multi-tenant open-source (delegate_task)
- [~] **Subagente 2**: Research sobre licensing de Human Design + Gene Keys (sistemas comerciais) (delegate_task)

---

## Wave 2 — Design proposals (proxima semana)

> Bloqueador: conclusao da Wave 1. **Status: COMPLETO 2026-06-23 (proposals aceitos, aguardando revisao tua antes de Wave 3).**

### Schemas / proposals

- [x] Proposal D-XXX: Schemas `Sessao`, `MapaCalculo`, `GrimorioPessoal`, `MapaRelacional` (estende D-041/Caminhante) — `apps/akasha-portal/prisma/designs/D-XXX-schema-multitenant-consulente.md`
- [x] Proposal D-YYY: Mapeamento Pilar 6 (Human Design traduzido) — nomenclatura, regras, limites — `apps/akasha-portal/prisma/designs/D-YYY-pilar-6-mapa-energetico-traduzido.md`
- [x] Proposal D-ZZZ: Mapeamento Pilar 7 (Gene Keys traduzido) — nomenclatura, espectro sombra-dom-siddhi — `apps/akasha-portal/prisma/designs/D-ZZZ-pilar-7-espectro-transformacao-traduzido.md`
- [ ] Proposal D-WWW: ADR 0005 (Grafo de Conhecimento) — **JA DECIDIDO em Wave 1** (ADR 0005 written, accepted). Marcar como done.

### System prompts / templates

- [ ] Reescrita do system prompt do Mentor em `packages/mentor/` (tom Mestre/Sacerdote/Terapeuta)
- [ ] Template de cadeia de pensamento (chain-of-thought) visivel ao Zelador

---

## Wave 3 — Implementacao (depois da Wave 2)

> Bloqueador: conclusao da Wave 2. **Status: EM EXECUCAO 2026-06-23 (3 subagentes em paralelo, branch `wave-3-multi-tenant`).**

### Schema migrations (Task 1 — Coder A)

- [~] Migration `20260624000000_XXX_001_multitenant_core` (5 tabelas: sessoes, sessao_chunks, grimorios_pessoais, notas_consulentes, mapas_calculo + indexes) — **em paralelo**
- [~] Migration `20260624000001_XXX_002_vector_indexes` (ivfflat index para sessao_chunks.embedding) — **em paralelo**

### Application layer (Task 1 + 2 — Coder A + B)

- [~] Helper `withCaminhanteContext(zeladorId, caminhanteId)` (AsyncLocalStorage + Prisma `$extends`) — **em paralelo**
- [ ] Suite de testes de regressao multi-tenant (Task 4 — QA)
- [~] Reescrita do Mentor em `packages/mentor/` (tom Mestre/Sacerdote/Terapeuta + chain-of-thought explicito + Vercel AI SDK streamUI) — **em paralelo**

### Chat MCP API routes (Task 3 — Coder C)

- [~] `GET /api/akasha/caminhantes/:id/sessoes` — **em paralelo**
- [~] `POST /api/akasha/caminhantes/:id/sessoes` — **em paralelo**
- [~] `PATCH /api/akasha/sessoes/:id/fechar` — **em paralelo**
- [~] `GET /api/akasha/caminhantes/:id/notas` — **em paralelo**
- [~] `POST /api/akasha/caminhantes/:id/notas` — **em paralelo**
- [~] `GET /api/akasha/caminhantes/:id/mapa` — **em paralelo**

### Frontend (Wave 3.5 — nao incluido nesta wave)

- [ ] Frontend: chat unico estilo ChatGPT/Gemini (Wave 3.5)
- [ ] Frontend: lista de consulentes (sidebar) (Wave 3.5)
- [ ] Frontend: clique no consulente = "ativa MCP" no chat (Wave 3.5)

### Branch + Merge

- [x] Branch `wave-3-multi-tenant` criado a partir de `main` (commit `ceb6f82d`)
- [ ] PR aberto quando os 3 subagentes terminarem
- [ ] Merge no `main` apos review do Zelador + verificacao juridica P0

### Estimativa

- **Wave 3 completa:** ~78h (~10 dias uteis, 14 com margem)
- **Wave 3.5 (frontend):** ~40h (~5 dias uteis)

---

## Wave 4 — Pilares 6 e 7 (depois da Wave 3)

> Bloqueador: conclusao da Wave 3.

### Human Design traduzido (Pilar 6)

- [ ] Implementar Tipo (Iniciador/Projetor/Respondedor/Manifestador) — nomenclatura universalista
- [ ] Implementar Estrategia
- [ ] Implementar Autoridade (Emocional/Sagrada/Esplenica/Mental — ja temos em D-041!)
- [ ] Implementar Centros (traduzido)

### Gene Keys traduzido (Pilar 7)

- [ ] Implementar espectro sombra → dom → siddhi
- [ ] Implementar 64 chaves (1 por hexagrama do I Ching — sinergie natural)

### Grafo de Conhecimento

- [ ] Implementar correlacao automatica entre os 7 Pilares
- [ ] Implementar RAG com embeddings por consulente

---

## Wave 5 — Hardening (futuro)

- [ ] Guardrails de psicanalise (LGPD + CVV quando detecta sofrimento emocional)
- [ ] MCP real (Anthropic Model Context Protocol) — quando sistema estiver maduro
- [ ] White paper anual (referenciar todos os ADRs ativos)
- [ ] Migracao de features legadas (Mandala visual, dashboards) para "modo secundario"

---

## Decisoes tomadas no grill (2026-06-23)

1. **Publico primario:** Zelador (tu) + consulentes. Usuario comum vira secundario. **[DEFINITIVO]**
2. **Pilares 6 e 7:** SIM, adicionar (traduzidos, nao copias literais). **[DEFINITIVO]**
3. **Mentor persona:** Mestre/Sacerdote/Terapeuta (Akashico com chain-of-thought, psicanalise). **[DEFINITIVO]**
4. **Cadastro consulentes:** Reusar D-041 (Caminhante) como modelo. **[DEFINITIVO]**
5. **Interface:** Chat unico estilo GPT, consulente como MCP logico. **[DEFINITIVO]**
6. **Refatoracao:** Nao criar codigo morto (analisar base, deletar ao refatorar). **[REGRA PERMANENTE]**

---

## Decisoes Aprovadas (2026-06-23)

**4 ADRs aceitos + 1 ADRs em research** — todos baseados em research consolidada:

| ADR | Titulo | Status | Stack/Decisao |
|---|---|---|---|
| **0002** | Pilares 6 e 7 (Human Design + Gene Keys) | **accepted** | 4 guardrails: renomear termos, textos do zero, visualizacao propria, disclaimer legal. Validacao juridica P0 antes de lancamento (~R$ 2-5k) |
| **0003** | Mentor Mestre/Sacerdote/Terapeuta | **accepted** | Tom direto + socratico + reverente + chain-of-thought explicito. Influencias teologicas de Cumino/Saraceni/Camargo por tras da voz |
| **0004** | Multi-tenant consulente-MCP | **accepted** | Stack: pgvector + `@xenova/transformers` (self-hosted) + `withCaminhanteContext()` proxy + Vercel AI SDK `streamUI` + weighted UNION ALL |
| **0005** | Grafo de Conhecimento | **accepted** | Wave 2-3 = weighted UNION ALL sobre pgvector (simples). Wave 5+ = Neo4j/Memgraph (se necessario) |

**Research basis:**
- `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-rag-multitenant-2026-06-23.md`
- `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md`

---

## Anti-patterns (evitar)

- ❌ Implementar feature sem ADR/proposal previo
- ❌ Deletar feature sem analise de impacto (regra 6)
- ❌ Auto-commitar sem review do Zelador
- ❌ Recriar daemon 24/7 (causou 5000+ commits vazios em 2026-04 a 2026-06)
- ❌ Tratar conversa-gemini.md como spec ativa (ja marcada como deferred pelo proprio Gemini)

---

## Ferramentas Hermes em uso

- **Skill `grilling` / `grill-with-docs`** — para decisoes macro
- **Skill `domain-modeling`** — para criar/validar ADRs
- **Skill `plan`** — para planos detalhados de implementacao (em `.hermes/plans/`)
- **`delegate_task`** — para chamar subagentes em paralelo
- **`cronjob`** — para tarefas agendadas (research diario, grill periodico, etc)
- **Skill `handoff`** — para passar contexto entre sessoes
- **Skill `vision-realignment-grilling`** — para detectar pivots futuros

---

**Owner:** Hermes (eu) + Gabriel (tu, revisao).
**Ultima atualizacao:** 2026-06-23 (apos vision realignment session).
**Status:** Wave 1 em execucao (3 ADRs feitos, kanban criado, visao atualizada; research pendente).
