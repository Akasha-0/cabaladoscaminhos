---
name: cycle-209
description: hourly — 2026-06-03 — security gate on notifications PATCH + dead-code custos.ts + fallowrc baseline
metadata:
  type: project
  cycle: 209
  mode: hourly
---

# Cycle 209 — Security gate + dead-code + config

**Date:** 2026-06-03
**Mode:** hourly
**Duration:** ~5 min

## Mudanças (3 commits, 4 files, +18/-25)

| Commit | Tipo | Descrição |
|--------|------|-----------|
| `9d3730ee` | fix(security) | PATCH /api/notifications gated with `requireOperator()` |
| `251f1ae9` | chore(dead-code) | rm `src/lib/credits/custos.ts` (no callers) |
| `3df3d6f8` | chore(config) | .fallowrc.json baseline 0→44 + 8 new ignored entry points |

## Verificação

- `tsc --noEmit`: 0 errors
- `npm run lint`: 0 errors, 672 warnings (pre-existing noise)
- `npm run test:run`: **1874 passed | 17 skipped** (5 test files skipped, +42 vs cycle 207 baseline of 1832)

## Por que essas mudanças

1. **Notifications PATCH auth**: PATCH handler mutates notification state (mark read/dismiss). Was the only mutations route in the file unauthenticated. Sibling POST already gated. Standard server-side auth pattern (instinto `server-side-auth-gate-mandatory-not-client-only`).
2. **custos.ts deletion**: orphan, no callers anywhere in src/ or tests/. Sibling `service.ts` is canonical.
3. **.fallowrc.json**: fallow baseline of 0/0/0 was fiction — accumulated intentional type-only exports, public API surface, and untracked dynamic imports. New baseline reflects reality (44 issues, breakdown documented in config).

## Pré-existentes (NÃO escopo)

- 672 lint warnings — pre-existing autoformat/import noise
- Build fail `/_global-error` (untracked)
- Fallow 44 baseline issues (intentional, documented)

## Próximas fases sugeridas

- **Fase 12** (data drift `mesa-real-data.ts` vs tests) — 28 failures pré-existentes, dedicated cleanup
- **T6.1–T6.4** (PDF dossier generation) — P2, ready when sprint activates
- Audit other API routes for missing auth (checklist: POST/PATCH/DELETE all gated?)
