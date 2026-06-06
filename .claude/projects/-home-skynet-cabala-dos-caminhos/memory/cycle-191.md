---
name: cycle-191
description: quick — 2026-06-03 — chore(refactor): remove 7 dead files (no consumers)
metadata:
  type: project
  cycle: 191
  mode: quick
  duration_s: ~360
  originSessionId: cabala-quick-loop
---

# Cycle 191 — quick — 2026-06-03

## Mudanças

- **Commit `a1d202f8`**: `chore(refactor): remove 7 dead files (no consumers)`
- **7 arquivos removidos, -1086 LOC**:
  - `src/components/ui/select.tsx` (196) — @base-ui select wrapper, 0 importers
  - `src/components/ui/separator.tsx` (25) — @base-ui separator wrapper, 0 importers
  - `src/components/ui/skeleton.tsx` (25) — loading skeleton, 0 importers
  - `src/components/ui/tabs.tsx` (81) — @base-ui tabs wrapper, 0 importers
  - `src/lib/astrology/v2/astrology-v2-data.ts` (685) — v2 astrology data, 0 importers
  - `src/lib/theme.ts` (58) — zustand theme store, 0 importers (chain)
  - `src/lib/dependency-stubs.ts` (7) — fallow-only artifact (chain: theme.ts)
- **`.fallowrc.json`** cleaned: 6 ignorePatterns + 1 entry removidos

## Verificação

| Gate | Result |
|------|--------|
| `npm run build` | ❌ **PRE-EXISTING** — `/_global-error` useContext null (cycle-188/189/190) |
| `npm run lint` | ✅ 0 errors, 1421 warnings (pre-existing) |
| `npm run test:run` | ✅ 1772 passed, 17 skipped (82 files), 23.24s — **0 regressões vs cycle-190** |

## Pré-existentes registrados (NÃO mexer)

- Build error em `/_global-error` — reproduz em HEAD limpo. Sem consumidores.

## Próximas fases sugeridas

- Mais dead-file sweep: candidates restantes (knip list: cockpit/dashboard/MetricsCards + RecentReadings, operator/auth/ForgotPasswordForm + ResetPasswordForm, styles/tokens.css)
- T7.2 keyboard shortcuts (~4h) — UX polish
- Fase 14 Operator.sessions (3h, P0) — token revocation

## Lições

- knip sem config gera 254 false-positives (orixa/* e correlation/* são LIVE mas não resolvidos via path alias). Filtrar por diretórios conhecidos + verificar com grep manual de basename.
- `.fallowrc.json` já lista ignorePatterns para ~40 arquivos dead. Sweep cirúrgico: deletar arquivo + remover entry correspondente (cycle-190 pattern).
