# Checklist — Akasha v0.0.6

> **Estado atual:** Proposta (aguardando aprovação)
> **Versão almejada:** v0.0.6 (Eixo A: Refatoração Arquitetural + Eixo B: Curadoria Pendente da v0.0.5)
> **Test count esperado:** 8481 (v0.0.5 baseline) + ~50 (Eixo A + Eixo B novos) = **~8530** passing
> **Quality esperada:** prisma valid, tsc 0 erros, build OK, lint clean, fallow ≥ 0.91, grimoire:audit verde
> **Tag almejada:** `v0.0.7` (v0.0.6 fecha; v0.0.7 será após curadoria humana)

---

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

> **Esta fase NÃO é executada pelo v0.0.6.** É a confirmação de que o v0.0.5 fechou corretamente.

- [x] **Confirmar v0.0.5 released e métricas baseline** (9 itens)

> **Gate de entrada da Fase 1:** todos os 9 itens acima verdes. v0.0.6 começa.

---

## Fase 1 — EIXO A: REFATORAÇÃO ARQUITETURAL  [HEADLINE]

### Task 1 — Mover `apps/akasha-portal/tests/` → `tests/` (raiz)

- [ ] Mapear 215+ test files atualmente em `apps/akasha-portal/tests/`
- [ ] Mover test files preservando estrutura de subpastas via `git mv`
- [ ] Mover `apps/akasha-portal/tests/setup.ts` → `tests/setup.ts`
- [ ] Atualizar `vitest.config.ts` — `include`/`exclude` globs de cada um dos 5 projects
- [ ] Atualizar `tsconfig.json` (raiz) — `include` patterns
- [ ] Atualizar `tsconfig.json` (apps/akasha-portal) — `exclude` inclui `../../tests`
- [ ] Rodar `pnpm install`
- [ ] Verificar: `pnpm vitest run --project core-logic` → 8100+ testes passing (zero regressão)
- [ ] **Commit:** `chore(monorepo): move apps/akasha-portal/tests → tests/ (raiz)`

### Task 2 — Mover `src/lib/prisma.ts` → `src/lib/infrastructure/prisma.ts`

- [ ] Ler `apps/akasha-portal/src/lib/prisma.ts` e documentar o lazy proxy
- [ ] Criar `apps/akasha-portal/src/lib/infrastructure/` directory
- [ ] `git mv apps/akasha-portal/src/lib/prisma.ts apps/akasha-portal/src/lib/infrastructure/prisma.ts`
- [ ] Ajustar imports relativos se necessário
- [ ] Atualizar todos os imports de `@/lib/prisma` no app
- [ ] Verificar build: `pnpm --filter akasha-portal build` → 0 erros
- [ ] Verificar runtime: test suite verde
- [ ] **Commit:** `refactor(akasha): move prisma client to infrastructure/ (preserva lazy proxy per architecture.md §6.1)`

### Task 3 — Split `src/lib/` em 5 camadas

#### SubTask 3.1 — Criar estrutura de diretórios

- [ ] Criar `apps/akasha-portal/src/lib/{domain,application,infrastructure,interface,shared}/` (vazio, com `.gitkeep`)
- [ ] Atualizar `docs/15_glossario-oracular.md` §X com cross-ref (bump v2.3 → v2.4)
- [ ] **Commit:** `chore(akasha): create src/lib/{domain,application,infrastructure,interface,shared}/ skeleton (architecture.md §2)`

#### SubTask 3.2 — Mover arquivos para `shared/`

- [ ] Identificar candidatos via `docs/audit/file-classification.md` (utils, logging, error-handling, constants)
- [ ] Mover + atualizar imports
- [ ] Verify: tests verdes
- [ ] **Commit:** `refactor(akasha): move lib/{utils,logging,error-handling,constants} → lib/shared/ (architecture.md §2)`

#### SubTask 3.3 — Mover arquivos para `domain/`

- [ ] Identificar candidatos puros via `file-classification.md` (grimoire, mapa, oracle, iching, divination pure types)
- [ ] Mover + atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): move lib/{grimoire,mapa,oracle,iching,...} → lib/domain/ (architecture.md §2)`

#### SubTask 3.4 — Mover arquivos para `infrastructure/`

- [ ] Identificar candidatos via `file-classification.md` (redis, supabase, push, vapid)
- [ ] Mover + atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): move lib/{redis,supabase,push,vapid} → lib/infrastructure/ (architecture.md §2)`

#### SubTask 3.5 — Mover arquivos para `interface/` e `application/`

- [ ] Identificar `interface/` (route handlers, server actions, DTOs) e `application/` (use-cases, auth, reading, payments)
- [ ] Mover + atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): split lib/{api,actions} → lib/interface/, lib/{auth,reading,payments} → lib/application/ (architecture.md §2)`

### Task 4 — Testes-guardião arquiteturais (`tests/architecture/`)

- [ ] Criar `tests/architecture/` directory
- [ ] Criar `tests/architecture/clean-architecture.test.ts` — grep `src/lib/domain/` por imports proibidos
- [ ] Criar `tests/architecture/package-boundaries.test.ts` — assert que nenhum outro workspace importa de `packages/core-*/src/<internal>/`
- [ ] Adicionar `tests/architecture/` ao `vitest.config.ts` project `core-logic` `include`
- [ ] Verificar 2 testes PASSAM após T1-T3 (verde = arquitetura correta)
- [ ] Adicionar a `docs/19_qualidade-processos.md` AD-19.4 #5 (NOVO): "Teste-guardião arquitetural"
- [ ] Verify: 2 novos testes verdes; suite total **8483** passing
- [ ] **Commit:** `test(architecture): add clean-architecture + package-boundaries guardian tests (architecture.md §4)`

---

## Fase 2 — EIXO B: CURADORIA PENDENTE DA v0.0.5  [ENABLE]

### Task 5 — `tests/lib/grimoire/curatorship-guardian.test.ts` (consolidado)

- [ ] Identificar os 5 test files de curadoria (3 existentes + 2 placeholders)
- [ ] Criar `tests/lib/grimoire/curatorship-guardian.test.ts` orquestrador
- [ ] Adicionar 2 describes para herbs/bodies (placeholders)
- [ ] Adicionar gating assertion final: `expect(totalEntriesGated).toBeGreaterThanOrEqual(60)`
- [ ] Decisão: **manter os 5 files** + orquestrador importa (DRY)
- [ ] Verify: 8483 → 8485+ testes passing
- [ ] **Commit:** `test(grimoire): consolidate 5 curatorship-guardian tests into 1 orchestrator (v0.0.6 T16)`

### Task 6 — IDEIA.md 60+ entradas (estrutura + 16 I-Ching + placeholders)

- [ ] Verificar estado atual: §7.1, §7.2, §7.3 presentes
- [ ] Adicionar §7.4 — "Odu Nascimento" (placeholder, 4 linhas)
- [ ] Adicionar §7.5 — "Ervas" (placeholder, 20 linhas)
- [ ] Adicionar §7.6 — "Corpos Clássicos" (placeholder, 4 linhas)
- [ ] Cada placeholder nota explícita: "**Placeholder** — v0.0.7 (AD-20.8)"
- [ ] Atualizar `docs/20_governanca-conteudo-oracular.md` com cross-ref
- [ ] **Commit:** `docs(ideia): add §7.4-§7.6 placeholder tables (Odu nascimento, ervas, corpos — awaiting v0.0.7 curator)`

### Task 7 — `grimoire:audit` script

- [ ] Criar `apps/akasha-portal/scripts/grimoire-audit.ts`
- [ ] Adicionar `"grimoire:audit": "tsx scripts/grimoire-audit.ts"` em `apps/akasha-portal/package.json`
- [ ] Adicionar mesmo script em `package.json` (raiz)
- [ ] Smoke-test: `pnpm grimoire:audit` → tabela verde
- [ ] **Commit:** `feat(grimoire): add grimoire:audit script (orchestrates curatorship-guardian tests)`

### Task 8 — Quality gates Fase 2 (parcial) + tag v0.0.7

- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npx prisma validate` → valid
- [ ] `pnpm test:run` → 8481+ testes passing
- [ ] `pnpm grimoire:audit` → tabela verde (60+ entries gated)
- [ ] `pnpm fallow > docs/audit/baseline-fallow-post-arch.json` (capturar baseline pós)
- [ ] Comparar deltas Fallow; documentar em `docs/audit/baseline-delta.md`
- [ ] Atualizar `PROGRESS.md` §3.1 com nova linha `v0.0.6-Fase 1`
- [ ] Atualizar `docs/08_roadmap.md` — bumpar v3.3 → v3.4; Onda 7 ✅
- [ ] Commit release consolidado
- [ ] `git tag -a v0.0.7 -m "v0.0.6 — Refatoração Arquitetural + Curadoria Pendente"`
- [ ] `git push origin --tags`
- [ ] **Commit + Tag:** `v0.0.7`

---

## Fase 3 — CLEANUP  [SHIPPED]

### Task 9 — Limpar branches temporárias

- [ ] Confirmar 3 deliverables do auto-claude merged em main (`d24104b2`, `74588e21`, `cbd31f04`, `c04007a3`)
- [ ] Deletar branches `temp/analyze-001-plan` e `temp/analyze-002-arch`: `git branch -D temp/analyze-001-plan temp/analyze-002-arch`
- [ ] Verificar origin sem `auto-claude/*` (já deletadas)
- [ ] Limpar `.auto-claude/` se gitignored
- [ ] Verify: 0 branches temp/*

---

## Quality Gates (Target Final)

- [ ] `npx tsc --noEmit` → **0 erros**
- [ ] `npx prisma validate` + `npx prisma generate` → **valid** 🚀
- [ ] `pnpm test:run` → **8530+ testes passing**, 0 falhas, 26 skipped
- [ ] `pnpm vitest run --project core-logic` → **8190+ testes passing**
- [ ] `pnpm vitest run --project core-api` → **290+ testes passing**
- [ ] `pnpm vitest run --project core-ui` → **115+ testes passing**
- [ ] `pnpm vitest run --project integration` → **125+ testes passing**
- [ ] `pnpm vitest run --project e2e` → smoke tests
- [ ] `pnpm build` → **OK**
- [ ] `pnpm lint` → **sem novos warnings** (480 pré-existentes OK)
- [ ] `pnpm grimoire:audit` → **tabela verde** (60+ entries gated: 16 I-Ching + 16 Odus + 4+20+4 placeholders)
- [ ] `pnpm fallow` (Fallow) → **QUALITY_SCORE ≥ 0.91**
- [ ] `pnpm fallow > docs/audit/baseline-fallow-post-arch.json` (capturado)
- [ ] `PROGRESS.md` §3.1 → **atualizado com v0.0.6**
- [ ] `docs/08_roadmap.md` → **v3.4, Onda 7 ✅**
- [ ] `docs/19_qualidade-processos.md` → **AD-19.4 #5 (NOVO)**
- [ ] Commit + tag intermediária `v0.0.7` → **OK**
- [ ] Push tag `v0.0.7` para origin → **OK**

> **Gate de release v0.0.6:** todos os 17 itens acima verdes. Após isso, v0.0.6 está oficialmente released.

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

## Carry-Over Tracking → v0.0.7

| Task | Owner | Status | AD-20.8 gate |
|------|-------|--------|---------------|
| 4 Odu de nascimento | babalaô/ioláxi | 🔴 DEFERRED | sim |
| 20 ervas brasileiras/afro-brasileiras | raizeiro | 🔴 DEFERRED | sim |
| 4 corpos clássicos | teosofista | 🔴 DEFERRED | sim (AD-20.7) |
| IDEIA.md §7.4-§7.6 preenchidas | curadores acima | 🔴 DEFERRED | sim |
| T18-T21 (Fase 3 correlações) | editorial Gabriel | 🔴 DEFERRED | sim |
| 250+ correlações densificadas | editorial Gabriel | 🔴 DEFERRED | sim |

> **v0.0.7 será 100% curadoria + correlações, sem refatoração arquitetural (essa já foi feita na v0.0.6).**

---

## Cross-References

- `docs/architecture.md` (218L) — layout limpo-alvo, reference canônica
- `docs/audit/baseline-fallow.json` (9365L) — baseline pré-refatoração
- `docs/audit/file-classification.md` (2499L) — guia de movimento de cada arquivo
- `docs/audit/baseline-fallow-post-arch.json` (T8.5) — baseline pós-refatoração
- `docs/audit/baseline-delta.md` (T8.6) — deltas intencionais vs acidentais
- `docs/19_qualidade-processos.md` — AD-19.4 #5 (NOVO) para testes-guardião arquiteturais
- `docs/20_governanca-conteudo-oracular.md` — cross-ref para §7.4-§7.6 placeholders
- `PROGRESS.md` §3.1 — linha `v0.0.6-Fase 1`
- `.trae/specs/akasha-v0.0.5/tasks.md` — source para carry-over T11-T17
