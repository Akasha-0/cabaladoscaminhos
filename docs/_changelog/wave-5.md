---
title: Wave 5 — Changelog
sidebar_label: Wave 5
---

# Wave 5 — Changelog Auto-Gerado

> Página gerada por `scripts/generate-changelog.sh` a partir do git log.
> Período: **2026-06-24 → 2026-06-24**.
> **3 merge(s)** Wave 5.x.

## Resumo

Wave 5 agrupa 3 entregas:

- **Wave 5.Wave 5** (0 commits) — merge: Wave 5 hygiene — 9 LOW fixes from 3 reviewers
- **Wave 5.Wave 5** (0 commits) — merge: Wave 5 prep — Synthesis Engine corpus (352 textos terapêuticos + fixes)
- **Wave 5.Wave 5** (5 commits) — merge: Wave 5 implementation — Synthesis Engine (engine + API + UI)

## Estatísticas agregadas

```
 11 files changed, 121 insertions(+), 30 deletions(-)
```

## Commits por merge

### Wave 5 — merge: Wave 5 hygiene — 9 LOW fixes from 3 reviewers

_Merge: [`52366da`](https://github.com/Akasha-0/cabaladoscaminhos/commit/52366daf57cd8ad50b1ac2f2a196b33712216145)_

| SHA | Mensagem |
|-----|----------|

### Wave 5 — merge: Wave 5 prep — Synthesis Engine corpus (352 textos terapêuticos + fixes)

_Merge: [`9f5b1e4`](https://github.com/Akasha-0/cabaladoscaminhos/commit/9f5b1e4f5966f765693e5c525c821de616075254)_

| SHA | Mensagem |
|-----|----------|

### Wave 5 — merge: Wave 5 implementation — Synthesis Engine (engine + API + UI)

_Merge: [`c85d483`](https://github.com/Akasha-0/cabaladoscaminhos/commit/c85d4838e82ecfcfa9603980552fbef9a521ca7a)_

| SHA | Mensagem |
|-----|----------|
| [`a9008d2`](https://github.com/Akasha-0/cabaladoscaminhos/commit/a9008d2ff2f08913b771b22c68610ceb19518724) | fix(portal): remove duplicate useTranslation import in OduInfoPanel\n\nNext.js 16 / Turbopack rejects duplicate binding imports in the same\nmodule, breaking the build of the Mandala page. The import on line 6\nwas a leftover duplicate of line 2; removing it resolves the build\nerror:\n\n  the name \\`useTranslation\\` is defined multiple times\n    at apps/akasha-portal/src/components/akasha/OduInfoPanel.tsx:6:10\n\nAlso normalize pnpm-workspace.yaml protobufjs build-script entry\n(placeholder -> true) so pnpm install succeeds on this worktree. |
| [`53f754d`](https://github.com/Akasha-0/cabaladoscaminhos/commit/53f754d9ef370465a0974eb35fb57ebd0fd6c539) | feat(ui): Tratamento Dashboard + page + i18n |
| [`4015f83`](https://github.com/Akasha-0/cabaladoscaminhos/commit/4015f83db8ee9c1d3eb84e0914d95e635b311cb7) | feat(api): /api/akasha/tratamento/calcular + schemas + logger |
| [`b295712`](https://github.com/Akasha-0/cabaladoscaminhos/commit/b295712ab81fd40cd0d56de383442ebe2e00c2c7) | test(tratamento): engine integration tests + corpus-loader fix |
| [`bbf2ce0`](https://github.com/Akasha-0/cabaladoscaminhos/commit/bbf2ce07a613873cd224d1b203e0288b28f88986) | feat(tratamento): corpus loader + camadas |

