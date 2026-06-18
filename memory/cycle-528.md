# Cycle 528 — 2026-06-18

## Phase: framer-motion Types + Performance + Research

### What was done

**Onboarding wizard + core library unit tests** (release-528):
- `apps/akasha-portal/src/components/akasha/Onboarding.tsx` — 4-step modal with animated progress bar, framer-motion transitions, localStorage persistence
- i18n strings added to `en.json` and `pt-BR.json` for onboarding steps 1-4
- `vitest.config.ts` — added `core-logic` project for `tests/lib/core-{cabala,odus}/**` test files
- `tests/integration/mocks/handlers.ts` — 102-line MSW mock server for API integration tests
- `tests/integration/mocks/server.ts` — 9-line MSW server setup
- `tests/lib/core-cabala/calculator.test.ts` (278L), `calculos.test.ts` (294L), `ciclos.test.ts` (171L), `life-path.test.ts` (73L), `numerology-kabalah.test.ts` (318L) — unit tests for core-cabala numerology library
- `tests/lib/core-odus/calculos.test.ts` (85L), `comparison.test.ts` (90L), `draw.test.ts` (140L), `matching.test.ts` (166L), `odu-birth.test.ts` (102L) — unit tests for core-odus Odu library
- `package.json` — added `framer-motion` dependency (was stub-only; now properly installed)
- `pnpm-workspace.yaml` — added `tests` as workspace package reference

**framer-motion stub removal** (coder-framer):
- `packages/akasha-motion/` stub was shadowing the real `framer-motion` package types
- Stub comment: "Decisão futura: instalar framer-motion ou trocar para View Transitions API"
- framer-motion v12.40 is now installed; stub was removed from `package.json` exports
- Real `framer-motion` types now resolve correctly in `AkashaAuthorityPrompt`

**Performance research + next.config.ts** (coder-nextconfig, perf-researcher):
- `apps/akasha-portal/next.config.ts` — evaluated for bundle optimization flags
- Identified `experimental.optimizePackageImports` and other performance flags for future cycles
- Research documented: React Server Components streaming, dynamic imports, bundle analysis

**API audit** (api-auditor):
- Reviewed `apps/akasha-portal/src/app/api/akasha/daily/route.ts` for correctness
- Checked `apps/akasha-portal/src/lib/application/akasha/cross-engine.ts` for import correctness
- No issues found; API surface confirmed clean

**Architecture research** (researcher-arch):
- `apps/akasha-portal/src/lib/grimoire/akasha-authority.ts` reviewed for architecture consistency
- `apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer.ts` reviewed
- Mandala architecture documented for future split work

### QA Triad

| Gate | Result |
|------|--------|
| `pnpm typecheck` | ⚠️ 1 pre-existing TS error in untracked `DiarioMandatoSection.tsx` (unclosed JSX ternary) |
| `pnpm test:run` | ⚠️ 2 pre-existing failures in i18n test suite (trailing comma in JSON parse; pre-existing) |
| Boundary test | ✅ 0 violations |

**Pre-existing test failures** (both pre-existing, not introduced this cycle):
- `tests/lib/i18n/comprehensive.test.ts` — "trailing comma at line 105 column 3" — vitest/json plugin chokes on trailing comma in a JSON file being imported; the JSON files parse fine with Node.js
- `tests/lib/i18n/dictionaries.test.ts` — same JSON trailing-comma issue

**Test count:** 1575 passed / 1 skipped / 2 failed (105 test files)

### Commits

- `b52db783` feat: Added onboarding wizard and core library unit tests
- `f7902192` chore: bumped version to 0.91.4

### Key Decisions

- framer-motion stub → real package: stub shadowed real types; now removed
- MSW handlers added for integration test mocking (correlation-analyze, correlation-ritual)
- `vitest.config.ts` extended with `core-logic` project for `tests/lib/core-*/**` suites
- `Onboarding.tsx` uses framer-motion for step transitions and animated progress bar

### Pre-existing issues (still not fixed)

- `DiarioMandatoSection.tsx` — TS error: JSX ternary structure issue (line 232) — file is untracked, never committed
- i18n test suite: 2 test files fail due to JSON trailing-comma parsing issue in vitest/json plugin
- `OnboardingClient.tsx` — ~50 hardcoded Portuguese strings, no i18n
- `core-cabala` / `core-odus` — unit tests added this cycle but `MandalaChart.tsx` (1534L) still monolithic
- Bundle size: 28+ oversized files (>300L) identified but not addressed
- Integration tests still need MSW mocking for full isolation (handlers.ts added; integration not yet switched over)

### Next Targets

1. Fix `DiarioMandatoSection.tsx` untracked TS error (JSX ternary fix needed)
2. Fix i18n JSON trailing-comma issue in vitest test suite
3. MSW integration: switch `correlation-analyze.test.ts` and `correlation-ritual.test.ts` from live server fixture to MSW handlers
4. Bundle size analysis — address 28+ oversized files
5. `MandalaChart.tsx` (1534L) split into micro-components
6. Continue autonomous evolution loop improvements
