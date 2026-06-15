# Lessons INDEX

Memória de longo prazo cross-session. Cada lesson captura um aprendizado
**não-óbvio** que custou tempo para descobrir, e que a próxima sessão
deve ler ANTES de tentar trabalho similar.

**Como usar:** antes de cada feature nova, passe o olho no tema mais
próximo. Se a lesson soa relevante, leia inteira.

**Total:** 21 lessons (Jun 11 – Jun 15, 2026).

---

## 1. Cross-cutting / Process (3 lessons)

Lessons sobre o loop autonomous em si — recovery, sudo policy, baseline errors.

- **`loop-sudo-policy.md`** (Jun 11) — Política de uso de `sudo` no loop
  ralph: quando OK, quando bloqueia, workarounds.
- **`pre-existing-errors.md`** (Jun 11) — Padrão de "pre-existing errors"
  no typecheck/lint: 242 warnings / 8 errors eram baseline, não regressão.
- **`session-n-plus-9-recovery-uncommitted-code.md`** (Jun 11) —
  Recovering from respawn com working tree half-staged. Como re-estabilizar
  sem perder WIP.

## 2. Typecheck & build infrastructure (5 lessons)

Lessons sobre o build pipeline — erros de tipo, mocks, refactors ESM.

- **`session-n-plus-8-typecheck-fixes.md`** (Jun 11) — typecheck 106→8 errors
  em 1 sessão. Padrão de fix incremental + test:run entre batches.
- **`session-n-plus-10-typecheck-unblock.md`** (Jun 11) — Unblocking
  typecheck via `framer-motion` ambient stub quando import quebra
  transitive deps.
- **`session-n-plus-13-mock-path-vs-import-path.md`** (Jun 11) — vitest
  `mock()` path MUST match import path exactly. Diferença entre
  `vi.mock('@/lib/...')` e `vi.mock('../../lib/...')` quebra o test
  silenciosamente.
- **`session-n-plus-14-f-218-require-to-esm.md`** (Jun 11) — Refactor
  `require('node:fs')` → ESM `import` em test files. Remove
  `eslint-disable @typescript-eslint/no-require-imports`.
- **`session-n-plus-18-f-231-grimoire-path-pollution.md`** (Jun 15) —
  Test pollution mascarou bug real. `findGrimoireRoot()` tinha `4 ..`
  quando deveria ter `3 ..`. Spec diagnosis estava errada (filter
  AGENTS.md), o problema era path resolution.

## 3. Refactor & architecture (4 lessons)

Lessons sobre refactor cirúrgico, batch commits, stubs.

- **`session-n-plus-6-f-203-mandala-colors.md`** (Jun 11) — MandalaChart
  unique Pilar colors via `PLANET_COLORS` const + `<title>` mapping.
- **`session-n-plus-11-fase6-batch-commit.md`** (Jun 11) — FASE 6
  lib+UI+API+test batch commit (4 commits, 2703 lines). Quando batch
  funciona vs quando separar.
- **`session-n-plus-12-f-216-stale-prisma-stub.md`** (Jun 11) — Stale
  Prisma stub mitigation: surgical dup em vez de delete.
- **`session-n-plus-17-f-206-tooltip-mandala.md`** (Jun 12) — Tooltip
  Mandala via SVG `<title>` nativo (5 Pilares) com mapping layer→Pilar
  via grimoire. `resolveSig()` reused de F-221.

## 4. Pilar 4 ethics / content curation (3 lessons)

Lessons sobre Pilar 4 (Odu) ethics invariant + curadoria de conteúdo.

- **`session-n-plus-7-f-200-429-crisis.md`** (Jun 11) — 429 Token Plan
  crisis + F-200 real engine integration. Rate limit, backoff, circuit
  breaker.
- **`session-n-plus-15-f-219-pilar4-truth-base.md`** (Jun 12) — Pilar 4
  (Odu) truth-base: canonical whitelist de 15 nomes derivados de D-044.
  NUNCA inventar correspondência esotérica.
- **`session-n-plus-16-f-221-significados-curados.md`** (Jun 12) —
  Significados Curados: Camada de Significado centralizada em
  `significados-curados.ts` para evitar fragmentação entre
  `traducao-areas.ts`, `pilar-meanings.ts`, etc.

## 5. F-231 i18n quality (3 lessons)

Lessons do spec `qualidade-i18n-en` (F-231), todas Jun 15.

- **`session-n-plus-19-f-231-mentor-grimoire-coverage.md`** — coverage
  ≠ consistency. Test cobre 4 categorias, NÃO `mentor/`. Fiz trabalho
  de consistência mesmo assim, disclosed no commit.
- **`session-n-plus-20-f-231-discover-dont-invent.md`** — "discover-don't-
  invent" beats prescribed work. Specs go stale fast. Sempre
  `grep`/`cat` target antes de aplicar prescribed work.

## 6. Multi-session coordination (3 lessons)

Lessons sobre coordenar com outras sessões autonomous no mesmo branch.

- **`session-n-plus-21-multisession-stale-wip.md`** — Working tree
  compartilhado. STEP 0 deve ler `git status --short | wc -l` PRIMEIRO.
  F-100/F-101 restrito a non-overlapping files quando tree é shared.
- **`session-n-plus-23-multisession-spec-isolation.md`** — `??` untracked
  files são safe to commit quando diretório é isolado do WIP de outros.
  Use `git add <path>` (não `-A`). Verifique com `git status --short <dir>`.
- **`session-n-plus-24-known-pre-existing-typecheck.md`** — Pre-existing
  typecheck failures em multi-session são sinais valiosos, NÃO bugs para
  consertar. Documente em AGENTS.md Verification, não esconda.

## 7. DOX framework (1 lesson)

- **`session-n-plus-22-d-040-dox-rail-prerequisite.md`** — DOX chain é
  TODO generator. Chain gaps (AGENTS.md faltando) são trabalho autônomo
  safe. "Awaiting human approval" ≠ "blocked" — pre-conditions são.

---

## Quick reference: "I'm doing X, which lessons should I read?"

| Se vou trabalhar em... | Ler primeiro |
|---|---|
| Typecheck / build infra | N+8, N+10, N+13, N+14, N+18, N+24 |
| Mocks / vitest | N+13 |
| ESM refactor | N+14 |
| Refactor / batch commit | N+11, N+12 |
| Mandala / SVG | N+6, N+17 |
| Pilar 4 (Odu) | N+15, N+16 |
| i18n / locale | N+18, N+19, N+20 |
| Multi-session same branch | N+21, N+23, N+24 |
| DOX / AGENTS.md | N+22 |
| Recovery / respawn | N+9 |
| Loop ralph infra | loop-sudo-policy, pre-existing-errors |
