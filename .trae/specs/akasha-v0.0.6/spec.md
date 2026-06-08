# Akasha v0.0.6 — Limpeza Arquitetural + Curadoria Pendente da v0.0.5 — Spec

> **Versão:** 0.0.6
> **Status:** Proposta (aguardando aprovação)
> **Sucessor de:** `akasha-v0.0.5` (Fase 1 ✅ I-Ching 5º sistema released, Fases 2/3 ⏸ deferred — gate AD-20.8 curador humano)

---

## Why

O `akasha-v0.0.5` fechou a Fase 1 (I-Ching como 5º sistema oracular) e marcou o release com a tag `v0.0.5` (era `v0.0.5-fase-1`, renumerada). As Fases 2 (Expansão do Grimório — 4 Odu + 20 ervas + 4 corpos) e 3 (Correlações Enriquecidas) ficaram **deferidas** por governança: a regra **Doc 20 AD-20.8 ("rejeitar sem fonte")** exige curador humano especializado (babalaô/ioláxi, raizeiro, teosofista) para confirmar proveniência das tradições religiosas/indígenas. O release `8f9f4dd7` deixou isso explícito: *"Bloqueios remanescentes (curadoria humana — regra AD-20.8): Fase 2 (T11-T13...) e Fase 3 (T18-T21...)"*.

Em paralelo, o auto-claude agents (subtasks 1-x, 2-x) produziram três deliverables críticos que precisam ser integrados no v0.0.6:

1. **`docs/architecture.md`** (218L) — layout limpo-alvo do monorepo: 5 camadas em `apps/akasha-portal/src/lib/` (domain/application/infrastructure/interface/shared) + dependency rules estritos + lista de "Files NOT to Touch".
2. **`docs/audit/file-classification.md`** (2499L) — classificação individual de cada arquivo do repo em uma das camadas.
3. **`docs/audit/baseline-fallow.json`** (9365L) — baseline de dead-code (Fallow) antes da refatoração arquitetural.

A v0.0.6 é a **primeira release pós-conteúdo da v0.0.5** e foca em **dois eixos paralelos**:

1. **Eixo A — Refatoração arquitetural** (engenharia pura, sem curadoria): aplicar o layout proposto em `docs/architecture.md`. Move `apps/akasha-portal/tests/` → `tests/` (raiz), move `src/lib/prisma.ts` → `src/lib/infrastructure/prisma.ts`, splita `src/lib/` em 5 camadas, adiciona `tests/architecture/` com 2 testes-guardião (clean-architecture + package-boundaries).
2. **Eixo B — Curadoria pendente** (engenharia + curadoria): carregar T11/T12/T13/T15/T16/T17 da v0.0.5 Fase 2 que **não exigem** curador humano (T16 = teste-guardião consolidado, T17 = quality gates + tag), e marcar T11/T12/T13 explicitamente como **DEFERRED to v0.0.7 — awaiting curador humano per AD-20.8**.

**Premissa operacional:** v0.0.6 **não fecha** o ciclo de curadoria da v0.0.5 (essa é a v0.0.7). v0.0.6 fecha o ciclo de **engenharia + arquitetura** e prepara o terreno para a v0.0.7 (que será 100% curadoria + correlações).

**Tese mantida:** "Akasha vira enciclopédia viva" — rigor de curadoria (Doc 20) inegociável, e o v0.0.6 reconhece explicitamente que algumas tasks da v0.0.5 só podem fechar com curador humano (não com engenharia).

---

## Decisões de Alinhamento (12 — baseadas nos 3 deliverables do auto-claude + audit-fase-2)

| # | Decisão | Escolha | Fonte |
|---|---------|---------|-------|
| 1 | Eixo central da v0.0.6 | (a) **Dual**: arquitetura + curadoria pendente (engenharia) | Audit-fase-2 §10 |
| 2 | Escopo da refatoração arquitetural | (b) **Aplicar layout `docs/architecture.md` §1-§6 verbatim** | `d24104b2` |
| 3 | Localização dos testes | (a) Mover `apps/akasha-portal/tests/` → `tests/` (raiz do monorepo) | `docs/architecture.md` §3 |
| 4 | `src/lib/prisma.ts` | (a) Mover para `src/lib/infrastructure/prisma.ts` (preservar lazy proxy) | `docs/architecture.md` §6.1 |
| 5 | Vitest projects | (a) **Manter 5** (core-logic, core-api, core-ui, integration, e2e) — explicitamente NÃO reduzir para 4 | `docs/architecture.md` §6.2 |
| 6 | `pnpm-workspace.yaml onlyBuiltDependencies` | (a) **Não tocar** (preservar `@prisma/engines` + demais) | `docs/architecture.md` §6.3 |
| 7 | T11 (4 Odu de nascimento) | (c) **DEFERRED to v0.0.7** — AD-20.8 gate | Audit-fase-2 §11 |
| 8 | T12 (20 ervas) | (c) **DEFERRED to v0.0.7** — AD-20.8 gate | Audit-fase-2 §11 |
| 9 | T13 (4 corpos clássicos) | (c) **DEFERRED to v0.0.7** — AD-20.8 gate | Audit-fase-2 §11 |
| 10 | T14 (exibição Odu nascimento Mandala/daily) | (b) **Ship com placeholder** (`calculateBirthOdu` day+month já existe, sem as 4 sub-classes) | Audit-fase-2 §10 |
| 11 | T15 (IDEIA.md 60 novas entradas) | (b) **Ship com 16 I-Ching + estrutura §7.4-§7.6 vazia** (placeholders para curadoria) | Audit-fase-2 §10 |
| 12 | T16 (teste-guardião curadoria) | (a) **Consolidar** 5 files em 1 (`curatorship-guardian.test.ts`) + adicionar `grimoire:audit` script | Audit-fase-2 §10 |

---

## What Changes

### Eixo A — Refatoração Arquitetural

- **`apps/akasha-portal/tests/` → `tests/` (raiz)** — mover 215+ test files de dentro do app para a raiz do monorepo, alinhando com a convenção `tests/` em `packages/*`. Atualizar `vitest.config.ts` (5 projects mantidos) e `tsconfig.json` (paths).
- **`src/lib/prisma.ts` → `src/lib/infrastructure/prisma.ts`** — mover (verbatim, só o path) o lazy proxy Prisma para a nova camada de infraestrutura.
- **`src/lib/` em 5 camadas** — criar `src/lib/{domain,application,infrastructure,interface,shared}/` e mover arquivos existentes:
  - `domain/` (puro, sem I/O): `grimoire/`, `mapa/`, `oracle/`, `iching/`, divination pure types
  - `application/`: `auth/`, `reading/`, `payments/`, use-cases
  - `infrastructure/` (novo): `prisma.ts`, `redis.ts`, `supabase/`, push, ioredis, vapid
  - `interface/`: route handlers (`api/`), server actions
  - `shared/`: `logging.ts`, `error-handling.ts`, `utils.ts`, `constants/`
- **`tests/architecture/` (novo)** — 2 testes-guardião:
  - `clean-architecture.test.ts` — grep `src/lib/domain/` por imports proibidos (next/*, @prisma/*, @supabase/*, pg, ioredis, process.env)
  - `package-boundaries.test.ts` — assert que nenhum outro workspace importa de `packages/core-*/src/<internal>/`
- **`docs/architecture.md` integrado** — referência em `AGENTS.md` (1 linha) + checklist de auditoria arquitetural no `tests/architecture/`
- **`PROGRESS.md` §3.1** — nova linha `v0.0.6` (entregas do Eixo A + Eixo B, +X testes, qualidade)

### Eixo B — Curadoria Pendente da v0.0.5

- **T16 — `tests/lib/grimoire/curatorship-guardian.test.ts` (consolidado)** — 5 files (`iching-completeness` + `curatorship-guardian-iching` + `odus-validation` + `herbs-validation` novo + `bodies-validation` novo) em 1 orquestrador. Gating: 16 I-Ching + 16 Odus + 4 Odu nascimento (placeholders) + 20 ervas (placeholders) + 4 corpos (placeholders) = **60 entries**.
- **T16.2 — `package.json` script `grimoire:audit`** — script `tsx scripts/grimoire-audit.ts` que roda os 5 testes-guardião e agrega resultado (✅/❌ + count por categoria).
- **T15 — IDEIA.md 60+ entradas** — estrutura §7.1-§7.6 pré-criada (vazia), com:
  - §7.1 Algoritmo Provisório Odu Nascimento (existente, manter)
  - §7.2 D4 Odu slots (existente, manter)
  - §7.3 Ledger I-Ching (existente, **16 entries ✅**)
  - §7.4 Odu Nascimento (placeholder, 4 entries para curador)
  - §7.5 Ervas (placeholder, 20 entries para curador)
  - §7.6 Corpos Clássicos (placeholder, 4 entries para curador)
- **T17 — Quality gates Fase 2 (parcial)**:
  - prisma valid ✅ (herdado Fase 1)
  - tsc 0 erros ✅ (herdado Fase 1)
  - 8500+ testes passing ✅ (8481 já passando + 25-50 novos do Eixo A)
  - build OK ✅ (herdado Fase 1)
  - lint clean ✅ (herdado Fase 1)
  - fallow ≥ 0.91 ✅ (preservar baseline de `docs/audit/baseline-fallow.json`)
  - **`grimoire:audit` ✅** (novo)
  - **PROGRESS.md §3.1 atualizado com v0.0.6 ✅** (novo)
  - **Tag `v0.0.7` ✅** (novo — v0.0.6 fecha, v0.0.7 será após curadoria)

### O que NÃO muda

- Nenhuma feature de produto é alterada. v0.0.6 é **refatoração + housekeeping**.
- Schemas Prisma intactos (nenhum campo novo).
- APIs intactas (routes em `src/lib/interface/api/` mantêm os mesmos paths).
- I-Ching 5º sistema (v0.0.5) intacto.
- 16 hexagramas curados, 16 Odus canônicos, 51 ervas v0.0.4-T1.5, 11 corpos v0.0.4-T1.5: **intactos**.

---

## Impact

### Affected specs (`docs/`)

- `docs/04_data-model.md` — sem mudanças (nenhum schema novo)
- `docs/06_ai-engine-spec.md` — sem mudanças (PromptBuilder e theme-router intactos)
- `docs/08_roadmap.md` — bumpar para v3.3 → v3.4; Onda 7 ✅
- `docs/14_extensibilidade-oracular.md` — sem mudanças (5 AD-14.x já ✅ da v0.0.5)
- `docs/15_glossario-oracular.md` — bump v2.3 → v2.4; incluir §X "Camadas do src/lib" cross-ref `docs/architecture.md` §2
- `docs/19_qualidade-processos.md` — AD-19.4 #5 (NOVO) — teste-guardião arquitetural (`tests/architecture/clean-architecture.test.ts` + `package-boundaries.test.ts`)
- `docs/20_governanca-conteudo-oracular.md` — `IDEIA.md` §7.4-§7.6 placeholders + nota explícita "AD-20.8 gate — curador humano"
- `docs/25_visao-akasha.md` — sem mudanças (v0.0.5 já marca 10 tradições + 5º hub)

### Affected code (resumo)

- **215+ test files** movidos de `apps/akasha-portal/tests/` → `tests/`
- **~50 lib files** re-ogranizados em `apps/akasha-portal/src/lib/{domain,application,infrastructure,interface,shared}/`
- **2 new architecture tests** em `tests/architecture/`
- **1 new orchestrator test** em `tests/lib/grimoire/curatorship-guardian.test.ts`
- **1 new audit script** em `apps/akasha-portal/scripts/grimoire-audit.ts`
- **1 new package.json script** `grimoire:audit`
- **~3 docs files** atualizados (IDEIA.md, PROGRESS.md, 08_roadmap.md, 19_qualidade-processos.md)
- **AGENTS.md** — 1 linha de cross-ref para `docs/architecture.md` (já feito pelo auto-claude em `d24104b2`)

### Affected infrastructure

- **`vitest.config.ts`** — atualizar `include`/`exclude` paths (5 projects mantidos, paths atualizados)
- **`tsconfig.json` (raiz)** — atualizar paths (workspace aliases mantidos)
- **`tsconfig.json` (apps/akasha-portal)** — atualizar `include`/`exclude` (tests movidos)
- **`pnpm-workspace.yaml`** — sem mudanças (`onlyBuiltDependencies` preservado)

---

## Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Quebrar imports ao mover 215+ test files | Alta | Alto | Mover em batches + rodar typecheck/test após cada batch; usar `git mv` para preservar histórico |
| `vitest.config.ts` quebrar test discovery | Média | Alto | Manter 5 projects, atualizar apenas `include`/`exclude` globs; smoke-test cada project isoladamente |
| Mover `prisma.ts` quebrar build | Baixa | Crítico | Preservar lazy proxy verbatim (apenas path muda); testar `next build` antes de commitar |
| Fallow baseline mudar após refatoração | Média | Baixo | Capturar baseline ANTES (`docs/audit/baseline-fallow.json` já existe); comparar DEPOIS; documentar deltas intencionais |
| `prisma validate` falhar após mover schema paths | Baixa | Médio | `prisma.config.ts` aponta para `apps/akasha-portal/prisma/schema.prisma` — NÃO mover; mover `prisma.ts` (o client) é separado |
| Falta de curador humano bloquear T11/T12/T13 | Alta | — | **Já deferida para v0.0.7** — v0.0.6 não bloqueia nisso |

---

## Não-Objetivos (v0.0.6 explicitamente NÃO faz)

- ❌ Adicionar 4 Odu de nascimento reais (DEFERRED to v0.0.7)
- ❌ Adicionar 20 ervas brasileiras/afro-brasileiras (DEFERRED to v0.0.7)
- ❌ Adicionar 4 corpos clássicos reais (DEFERRED to v0.0.7)
- ❌ T18-T21 (Fase 3 — correlações) da v0.0.5 (DEFERRED to v0.0.7)
- ❌ Adicionar 5º sistema oracular (já feito na v0.0.5)
- ❌ Migrar de Next.js para outro framework
- ❌ Adicionar banco de dados novo
- ❌ Reescrever engines `core-*`

---

## Cross-References (input do auto-claude)

- **Audit Fase 0+1** (subtask 2-1, working notes gitignored): "11/11 DONE" para T0-T10 da v0.0.5; 8 PARTIAL caveats documentados
- **Audit Fase 2** (`c04007a3`, 400L): "1/7 🔵 PARTIAL + 6/7 ❌ OPEN"; carry-over priority T11→T14→T12→T13→T15→T16→T17
- **Audit Fase 3** (subtask 2-3, working notes gitignored): T18-T21 da v0.0.5 — TUDO OPEN, requer decisões editoriais
- **Carry-over list** (subtask 2-4, working notes gitignored): disposition explícito de cada OPEN task
- **Architecture doc** (`d24104b2`, 218L): 5 camadas + dependency rules + Files NOT to Touch + Preservation rules
- **File classification** (`74588e21`, 2499L): classificação individual de cada arquivo do repo
- **Baseline fallow** (`cbd31f04`, 9365L): baseline de dead-code ANTES da refatoração
- **Baseline knip** (`cbd31f04`, 1L): baseline de Knip (TypeScript unused exports)
- **Constraints summary** (subtask 1-3, working notes gitignored): 5 extension points + AD-20.1-9 + 3-layer AI + ~9k tests + 14-rule agent constitution + LGPD
- **Git history evidence** (subtask 1-4, working notes gitignored): v0.0.4..v0.0.5-fase-1 (2257 commits) + release body 8f9f4dd7 + v0.0.3 anomaly + v0.0.1 recovery + subagent revert

---

## Source of Truth

- **`docs/architecture.md`** (committed em `d24104b2` durante o auto-claude Phase 1) — layout limpo-alvo
- **`docs/audit/baseline-fallow.json`** (committed em `cbd31f04`) — baseline pré-refatoração
- **`docs/audit/file-classification.md`** (committed em `74588e21`) — guia de movimento de cada arquivo
- **`PROGRESS.md §3.1`** (atual `8f9f4dd7` + `10d13ead` post-merge) — métricas atuais: 8481 testes passing, 0 falhas, prisma valid, tsc 0 erros
- **`.trae/specs/akasha-v0.0.5/tasks.md`** (Fase 2 T11-T17) — source para carry-over
