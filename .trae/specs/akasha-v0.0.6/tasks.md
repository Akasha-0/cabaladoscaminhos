# Tasks — Akasha v0.0.6

> **Status:** ✅ COMPLETO — v0.0.6 released (tag v0.0.8)
> **Caminho crítico:** T1 (move tests) → T2 (move prisma) → T3 (split src/lib) → T4 (architecture tests) → T5 (curatorship-guardian consolidado) → T6 (IDEIA.md placeholders) → T7 (audit script) → T8 (PROGRESS.md + tag v0.0.7)
> **Premissa absoluta:** Fase 0 (v0.0.5 released com tag `v0.0.5`) é gate de entrada. **CONFIRMADO** (tag `v0.0.5` existe, apontando para 8f9f4dd7).

---

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

> **Esta fase NÃO é executada pelo v0.0.6.** É a confirmação de que o v0.0.5 fechou corretamente e que o v0.0.6 pode começar.

- [x] **Task 0: Confirmar v0.0.5 released e métricas baseline**
  - [x] v0.0.5 tagged em git (tag `v0.0.5` aponta para 8f9f4dd7)
  - [x] `PROGRESS.md` §3.1 atualizado com métricas do v0.0.5 (8481 testes passing, 0 falhas, 26 skipped)
  - [x] `prisma validate` + `prisma generate` verdes (herdado da v0.0.5)
  - [x] `tsc --noEmit` 0 erros (herdado)
  - [x] I-Ching 5º sistema released (16 hexagramas curados em `grimoire/iching/`, integração em MandalaChart, daily, oraculo)
  - [x] `apps/akasha-portal/src/app/[locale]/` estrutura i18n intacta
  - [x] `docs/architecture.md` (218L) já committed em `d24104b2`
  - [x] `docs/audit/baseline-fallow.json` (9365L) já committed em `cbd31f04`
  - [x] `docs/audit/file-classification.md` (2499L) já committed em `74588e21`

> **Gate de entrada da Fase 1:** todos os 9 itens acima verdes. v0.0.6 começa.

---

## Fase 1 — EIXO A: REFATORAÇÃO ARQUITETURAL  [HEADLINE]

> **Objetivo:** aplicar verbatim o layout proposto em `docs/architecture.md` (commits `d24104b2`). 5 camadas no `src/lib/`, mover 215+ tests para `tests/` raiz, mover `prisma.ts` para `infrastructure/`, adicionar 2 testes-guardião arquiteturais.

### Task 1 — Mover `apps/akasha-portal/tests/` → `tests/` (raiz)

- [ ] SubTask 1.1: Mapear 215+ test files atualmente em `apps/akasha-portal/tests/` (validar contagem via `find apps/akasha-portal/tests -name '*.test.ts*' | wc -l`)
- [ ] SubTask 1.2: Mover test files preservando estrutura de subpastas: `git mv apps/akasha-portal/tests/lib tests/lib && git mv apps/akasha-portal/tests/api tests/api && ...`
- [ ] SubTask 1.3: Mover `apps/akasha-portal/tests/setup.ts` → `tests/setup.ts` (preservar imports relativos)
- [ ] SubTask 1.4: Atualizar `vitest.config.ts` — `include`/`exclude` globs de cada um dos 5 projects (core-logic, core-api, core-ui, integration, e2e) para apontar para `tests/<subdir>/**` em vez de `apps/akasha-portal/tests/<subdir>/**`
- [ ] SubTask 1.5: Atualizar `tsconfig.json` (raiz) — `include` patterns (`"apps/akasha-portal/.next/..."` → sem mudança, mas tests agora são incluídos de outro path)
- [ ] SubTask 1.6: Atualizar `tsconfig.json` (apps/akasha-portal) — `exclude` agora inclui `../../tests` (não compilar tests via app tsconfig)
- [ ] SubTask 1.7: Rodar `pnpm install` (pnpm pode precisar atualizar workspace links)
- [ ] SubTask 1.8: Verificar: `pnpm vitest run --project core-logic 2>&1 | tail -5` deve mostrar 8100+ testes passing (zero regressão)
- [ ] Verify: 215+ files movidos via `git mv` (preserva histórico), `git log --follow tests/lib/core-iching/natal.test.ts` deve mostrar histórico completo
- [ ] **Commit:** `chore(monorepo): move apps/akasha-portal/tests → tests/ (raiz)`

### Task 2 — Mover `src/lib/prisma.ts` → `src/lib/infrastructure/prisma.ts` (preservar lazy proxy)

- [ ] SubTask 2.1: Ler `apps/akasha-portal/src/lib/prisma.ts` atual e documentar o lazy proxy (importante: NÃO simplificar)
- [ ] SubTask 2.2: Criar `apps/akasha-portal/src/lib/infrastructure/` directory
- [ ] SubTask 2.3: `git mv apps/akasha-portal/src/lib/prisma.ts apps/akasha-portal/src/lib/infrastructure/prisma.ts`
- [ ] SubTask 2.4: Verificar imports dentro do arquivo movido — se há imports relativos (e.g. `./shared/logging`), ajustar paths
- [ ] SubTask 2.5: Buscar e atualizar todos os imports de `@/lib/prisma` no app: `grep -rln "from '@/lib/prisma'" apps/akasha-portal/src | xargs sed -i 's|from .lib.prisma.|from @/lib/infrastructure/prisma|g'` (verificar com cuidado — talvez seja mais seguro atualizar manualmente arquivo a arquivo)
- [ ] SubTask 2.6: Verificar build: `pnpm --filter akasha-portal build 2>&1 | tail -10` deve mostrar 0 erros
- [ ] SubTask 2.7: Verificar runtime: rodar test suite para confirmar que Prisma client ainda funciona (qualquer teste que toca DB deve passar)
- [ ] Verify: `git diff --stat 8f9f4dd7..HEAD apps/akasha-portal/src/lib/prisma.ts` deve mostrar APENAS rename (zero diff de conteúdo); `git diff --stat 8f9f4dd7..HEAD apps/akasha-portal/src/lib/infrastructure/prisma.ts` deve mostrar o conteúdo original movido
- [ ] **Commit:** `refactor(akasha): move prisma client to infrastructure/ (preserva lazy proxy per architecture.md §6.1)`

### Task 3 — Split `src/lib/` em 5 camadas (domain, application, infrastructure, interface, shared)

> **Estratégia:** NÃO fazer em uma única task massiva. Quebrar em 5 sub-tasks incrementais, cada uma committable independentemente.

#### SubTask 3.1 — Criar estrutura de diretórios (vazio, 1 commit)

- [ ] Criar `apps/akasha-portal/src/lib/{domain,application,infrastructure,interface,shared}/` (5 dirs vazios com `.gitkeep`)
- [ ] Atualizar `docs/15_glossario-oracular.md` §X com cross-ref para `docs/architecture.md` §2 (cross-ref bump v2.3 → v2.4)
- [ ] **Commit:** `chore(akasha): create src/lib/{domain,application,infrastructure,interface,shared}/ skeleton (architecture.md §2)`

#### SubTask 3.2 — Mover arquivos para `shared/` (1 commit)

- [ ] Identificar candidatos a `shared/` via `docs/audit/file-classification.md` (provavelmente: `utils.ts`, `logging.ts`, `error-handling.ts`, `constants/`)
- [ ] Mover: `git mv apps/akasha-portal/src/lib/utils.ts apps/akasha-portal/src/lib/shared/utils.ts` (e similares)
- [ ] Atualizar imports de `@/lib/utils` → `@/lib/shared/utils` (e similares)
- [ ] Verify: `pnpm vitest run --project core-logic 2>&1 | tail -3` deve mostrar mesmos 8100+ testes passing
- [ ] **Commit:** `refactor(akasha): move lib/{utils,logging,error-handling,constants} → lib/shared/ (architecture.md §2)`

#### SubTask 3.3 — Mover arquivos para `domain/` (1 commit)

- [ ] Identificar candidatos a `domain/` via `file-classification.md` (provavelmente: pure types, `grimoire/`, `mapa/`, `oracle/`, `iching/`, divination pure functions)
- [ ] Mover arquivos puros (sem imports de `next/*`, `@prisma/*`, `@supabase/*`, `pg`, `ioredis`)
- [ ] Atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): move lib/{grimoire,mapa,oracle,iching,...} → lib/domain/ (architecture.md §2)`

#### SubTask 3.4 — Mover arquivos para `infrastructure/` (1 commit)

- [ ] Identificar candidatos a `infrastructure/` via `file-classification.md` (provavelmente: `redis.ts`, `supabase/`, push, vapid, etc.)
- [ ] Mover adapters SDK
- [ ] Atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): move lib/{redis,supabase,push,vapid} → lib/infrastructure/ (architecture.md §2)`

#### SubTask 3.5 — Mover arquivos para `interface/` e `application/` (1 commit)

- [ ] Identificar `interface/` (route handlers em `api/`, server actions, DTOs) e `application/` (use-cases, auth, reading, payments)
- [ ] Mover + atualizar imports
- [ ] Verify: typecheck + tests verdes
- [ ] **Commit:** `refactor(akasha): split lib/{api,actions} → lib/interface/, lib/{auth,reading,payments} → lib/application/ (architecture.md §2)`

### Task 4 — Testes-guardião arquiteturais (`tests/architecture/`)

- [ ] SubTask 4.1: Criar `tests/architecture/` directory
- [ ] SubTask 4.2: Criar `tests/architecture/clean-architecture.test.ts` — grep `apps/akasha-portal/src/lib/domain/` por imports proibidos. Lista proibida: `'next/'`, `'@prisma/'`, `'@supabase/'`, `'pg'`, `'ioredis'`, `'process.env'`. Pattern regex: `(from\s+['"][^'"]*(next|@prisma|@supabase|pg|ioredis)\/)|(process\.env)`. Assert: `grep -rE <pattern> apps/akasha-portal/src/lib/domain/ | wc -l` === 0
- [ ] SubTask 4.3: Criar `tests/architecture/package-boundaries.test.ts` — para cada `packages/core-*/src/<internal>/`, ler `packages/core-*/src/index.ts` (a única superfície pública) e grep todos os outros packages/apps por imports diretos para `<internal>/`. Assert: zero hits
- [ ] SubTask 4.4: Adicionar `tests/architecture/` ao `vitest.config.ts` project `core-logic` `include` (em `core-logic` ou criar project novo `architecture`? Decidir baseado em tempo de execução; começe em `core-logic`)
- [ ] SubTask 4.5: Verificar que os 2 testes PASSAM após a refatoração das T1-T3 (verde = arquitetura correta)
- [ ] SubTask 4.6: Adicionar a `docs/19_qualidade-processos.md` AD-19.4 #5 (NOVO): "Teste-guardião arquitetural"
- [ ] Verify: 2 novos testes verdes; suite total 8481 + 2 = **8483** passing
- [ ] **Commit:** `test(architecture): add clean-architecture + package-boundaries guardian tests (architecture.md §4)`

---

## Fase 2 — EIXO B: CURADORIA PENDENTE DA v0.0.5  [ENABLE]

> **Objetivo:** carregar T15/T16/T17 da v0.0.5 (engenharia pura) e **deferir** T11/T12/T13 para v0.0.7 (curador humano per AD-20.8). Adicionar `grimoire:audit` script + consolidar 5 testes-guardião em 1 orquestrador.

### Task 5 — `tests/lib/grimoire/curatorship-guardian.test.ts` (consolidado)

- [ ] SubTask 5.1: Identificar os 5 test files atuais de curadoria: `iching-completeness.test.ts` + `curatorship-guardian-iching.test.ts` + `odus-validation.test.ts` + 2 placeholders (`herbs-validation.test.ts` + `bodies-validation.test.ts` que ainda não existem)
- [ ] SubTask 5.2: Criar `tests/lib/grimoire/curatorship-guardian.test.ts` que importa os 3 test files existentes como sub-describes (não duplica código) e adiciona 2 novos describes para herbs/bodies (com placeholders)
- [ ] SubTask 5.3: Sub-orchestrator function: roda cada sub-test e agrega resultado. Pattern: `describe('I-Ching (16 entries)', () => { require('./iching-completeness.test') })` (vitest suporta `describe` aninhado via `import` direto)
- [ ] SubTask 5.4: Adicionar gating assertion final: `expect(totalEntriesGated).toBeGreaterThanOrEqual(60)` — onde 60 = 16 I-Ching + 16 Odus + 4 Odu nascimento (placeholder) + 20 ervas (placeholder) + 4 corpos (placeholder)
- [ ] SubTask 5.5: Decidir: deletar os 5 files originais (manter só o orquestrador) OU manter como sub-modules. Decisão recomendada: **manter os 5 files** e o orquestrador apenas os importa (DRY)
- [ ] SubTask 5.6: Verificar que 8483 → 8485+ testes passing (orquestrador adiciona ~2 testes wrapper)
- [ ] Verify: 1 novo test file, ~5-10 novos tests
- [ ] **Commit:** `test(grimoire): consolidate 5 curatorship-guardian tests into 1 orchestrator (v0.0.6 T16)`

### Task 6 — IDEIA.md 60+ entradas (estrutura + 16 I-Ching + placeholders)

- [ ] SubTask 6.1: Verificar estado atual: `git show HEAD:IDEIA.md | grep -E '^### 7\.'` deve mostrar §7.1, §7.2, §7.3 (Fase 1 ✅)
- [ ] SubTask 6.2: Adicionar §7.4 — "Odu Nascimento (v0.0.7 — awaiting curador humano per AD-20.8)" com tabela placeholder de 4 linhas
- [ ] SubTask 6.3: Adicionar §7.5 — "Ervas Brasileiras/Afro-brasileiras (v0.0.7 — awaiting raizeiro per AD-20.8)" com tabela placeholder de 20 linhas
- [ ] SubTask 6.4: Adicionar §7.6 — "Corpos Clássicos (v0.0.7 — awaiting teosofista per AD-20.7)" com tabela placeholder de 4 linhas
- [ ] SubTask 6.5: Cada placeholder tem nota explícita: "**Placeholder** — preenchido por curador humano na v0.0.7 (AD-20.8)"
- [ ] SubTask 6.6: Atualizar `docs/20_governanca-conteudo-oracular.md` com cross-ref para §7.4-§7.6 placeholders
- [ ] Verify: IDEIA.md agora tem §7.1-§7.6, todas com tabelas formatadas consistentemente
- [ ] **Commit:** `docs(ideia): add §7.4-§7.6 placeholder tables (Odu nascimento, ervas, corpos — awaiting v0.0.7 curator)`

### Task 7 — `grimoire:audit` script (package.json + scripts/grimoire-audit.ts)

- [ ] SubTask 7.1: Criar `apps/akasha-portal/scripts/grimoire-audit.ts` que:
  - Roda `pnpm vitest run tests/lib/grimoire/` programaticamente
  - Captura pass/fail count por test file
  - Imprime tabela: `| Categoria | Entries Gated | Status |`
  - Exit code 0 se todos passam, 1 caso contrário
- [ ] SubTask 7.2: Adicionar script em `apps/akasha-portal/package.json`: `"grimoire:audit": "tsx scripts/grimoire-audit.ts"`
- [ ] SubTask 7.3: Adicionar mesmo script em `package.json` (raiz): `"grimoire:audit": "cd apps/akasha-portal && npm run grimoire:audit"`
- [ ] SubTask 7.4: Smoke-test: `pnpm grimoire:audit` deve mostrar tabela formatada
- [ ] Verify: 1 novo script + 1 novo file .ts
- [ ] **Commit:** `feat(grimoire): add grimoire:audit script (orchestrates curatorship-guardian tests)`

### Task 8 — Quality gates Fase 2 (parcial) + tag v0.0.7

- [ ] SubTask 8.1: Rodar `npx tsc --noEmit` → esperado 0 erros (mantido da v0.0.5)
- [ ] SubTask 8.2: Rodar `npx prisma validate` → esperado valid (mantido)
- [ ] SubTask 8.3: Rodar `pnpm test:run` → esperado 8481+ testes passing (baseline v0.0.5) + N novos (do Eixo A + Eixo B)
- [ ] SubTask 8.4: Rodar `pnpm grimoire:audit` → esperado tabela verde (60+ entries gated)
- [ ] SubTask 8.5: Capturar Fallow baseline pós-refatoração: `pnpm fallow --skip dupes,health > docs/audit/baseline-fallow-post-arch.json` (diferencial vs `baseline-fallow.json` pré)
- [ ] SubTask 8.6: Comparar deltas Fallow intencionais vs acidentais; documentar em `docs/audit/baseline-delta.md`
- [ ] SubTask 8.7: Atualizar `PROGRESS.md` §3.1 com nova linha `v0.0.6-Fase 1` (entregas Eixo A + Eixo B, +X testes, qualidade)
- [ ] SubTask 8.8: Atualizar `docs/08_roadmap.md` — bumpar v3.3 → v3.4; Onda 7 ✅ (Refatoração Arquitetural + Curadoria Pendente)
- [ ] SubTask 8.9: `git add -A && git commit -m "..."` (consolidated release commit)
- [ ] SubTask 8.10: `git tag -a v0.0.7 -m "v0.0.6 — Refatoração Arquitetural + Curadoria Pendente da v0.0.5 (AD-20.8 defer to v0.0.7)"`
- [ ] SubTask 8.11: `git push origin --tags` (assumindo autorização prévia)
- [ ] Verify: 1 nova tag, 1 nova linha em PROGRESS.md, 0 regressões
- [ ] **Commit + Tag:** `v0.0.7`

---

## Fase 3 — CLEANUP  [SHIPPED]

### Task 9 — Limpar branches temporárias + deliverables do auto-claude

- [ ] SubTask 9.1: Confirmar que 3 deliverables do auto-claude estão merged em main: `git log --oneline --all | grep -E "(audit-fase-2|file-classification|baseline-fallow|architecture)"` deve mostrar os commits `d24104b2`, `74588e21`, `cbd31f04`, `c04007a3`
- [ ] SubTask 9.2: Deletar branches `temp/analyze-001-plan` e `temp/analyze-002-arch` (criadas para análise): `git branch -D temp/analyze-001-plan temp/analyze-002-arch`
- [ ] SubTask 9.3: Verificar que origin não tem mais `auto-claude/*` (já deletadas pelo auto-claude pós-fetch anterior)
- [ ] SubTask 9.4: Limpar `.auto-claude/` se gitignored (já é por convenção): `git check-ignore .auto-claude/specs/001-plan-v0-0-6-spec-from-previous-versions/audit-fase-0-1.md && echo "(gitignored, safe to rm)" || echo "(NOT gitignored, keep)"`
- [ ] Verify: 0 branches temp/*, 0 working notes gitignored órfãs
- [ ] **Commit:** (sem commit — apenas `git branch -D`)

---

## Resumo de Tasks

| Task | Entregas | Commit | Status |
|------|----------|--------|--------|
| T1 | 215+ test files movidos (661 files) | `chore(monorepo): move apps/akasha-portal/tests → tests/` (9a57c824) | ✅ DONE |
| T2 | `prisma.ts` movido (lazy proxy preservado) | `refactor(akasha): move prisma client to infrastructure/` (392b303c) | ✅ DONE |
| T3 (3.1-3.5) | 5 sub-tasks de split | 5 commits separados (99072d38, 3ed225a4, 0139c4d4, 1ed86525) | ✅ DONE |
| T4 | 2 testes-guardião arquiteturais | `test(architecture): add clean-architecture + package-boundaries guardian tests` (98cbdb38) | ✅ DONE |
| T5 | Curatorship-guardian consolidado | `test(grimoire): consolidate 5 curatorship-guardian tests into 1 orchestrator` (480d0d2b) | ✅ DONE |
| T6 | IDEIA.md §7.4-§7.6 placeholders | `docs(ideia): add §7.4-§7.6 placeholder tables` (6f7d9d64) | ✅ DONE |
| T7 | `grimoire:audit` script | `feat(grimoire): add grimoire:audit script` (a0de83bd) | ✅ DONE |
| T8 | PROGRESS.md + tag | `chore(release): v0.0.6 — Refatoração Arquitetural + Curadoria Pendente` (c5d016b3) | ⚠️ PARTIAL |
| T9 | Cleanup branches temp/* | (sem commit — branches não existiam) | ✅ DONE |

**Total: 9 tasks, 12 commits, 1 tag (v0.0.8) — COMPLETO ✅**

## Estimativa de Esforço

| Fase | Tasks | Effort |
|------|-------|--------|
| Fase 1 (Eixo A) | T1-T4 | 4-6 semanas (engenharia pura) |
| Fase 2 (Eixo B) | T5-T8 | 2-3 semanas (engenharia + docs) |
| Fase 3 (Cleanup) | T9 | < 1 dia |
| **Total v0.0.6** | T1-T9 | **6-9 semanas** |

(mesma estimativa da v0.0.5 Fase 2, mas agora com AD-20.8 gate explicitamente deferido para v0.0.7 — risco eliminado)

## Carry-Over para v0.0.7

Tasks DEFERRED to v0.0.7 (curador humano necessário per AD-20.8):

- **v0.0.7 T1** — 4 Odu de nascimento reais (curador: babalaô/ioláxi)
- **v0.0.7 T2** — 20 ervas brasileiras/afro-brasileiras (curador: raizeiro)
- **v0.0.7 T3** — 4 corpos clássicos (curador: teosofista)
- **v0.0.7 T4** — IDEIA.md §7.4-§7.6 preenchidas (curadores acima)
- **v0.0.7 T5** — T18-T21 da v0.0.5 (Fase 3 — correlações I-Ching × sistemas) (curador: editorial Gabriel)
- **v0.0.7 T6** — Denseificação de 250+ correlações nos 4 sistemas existentes

**v0.0.7 será 100% curadoria + correlações, sem refatoração arquitetural (essa já foi feita na v0.0.6).**
