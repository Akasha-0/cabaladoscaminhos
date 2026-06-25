---
title: Wave 11 â€” Changelog
sidebar_label: Wave 11
---

# Wave 11 â€” Changelog Auto-Gerado

> PÃ¡gina gerada por `scripts/generate-changelog.sh` a partir do git log.
> PerÃ­odo: **2026-06-25 â†’ 2026-06-25**.
> **5 merge(s)** Wave 11.x.

## Resumo

Wave 11 agrupa 5 entregas:

- **Wave 11.Wave 11** (4 commits) â€” €” dead code elimination
- **Wave 11.Wave 11** (2 commits) â€” €” test coverage (+rate-limit + push + llm-router tests)
- **Wave 11.Wave 11** (4 commits) â€” €” i18n completion (migrate hardcoded strings)
- **Wave 11.Wave 11** (4 commits) â€” €” accessibility WCAG 2.1 fixes (StatePicker + PwaInstallPrompt + BreathOrb + MentorChat + BottomNav)
- **Wave 11.Wave 11** (1 commits) â€” €” TypeScript strict cleanup

## EstatÃ­sticas agregadas

```
 133 files changed, 1389 insertions(+), 14009 deletions(-)
```

## Commits por merge

### Wave 11 â€” €” dead code elimination

_Merge: [`0f69756`](https://github.com/Akasha-0/cabaladoscaminhos/commit/0f69756cfd2be9d5c72dc267dbd7bd3ae87e6245)_

| SHA | Mensagem |
|-----|----------|
| [`fa5558f`](https://github.com/Akasha-0/cabaladoscaminhos/commit/fa5558f38a6e180fe6f0e9b374bab8642ba6c94d) | chore(dead-code): Wave 11.5 â€” remove unused exports in live files |
| [`9f2200a`](https://github.com/Akasha-0/cabaladoscaminhos/commit/9f2200a17a81403d9cc380d1df7c04961309e5a6) | chore(dead-code): Wave 11.5 â€” remove dead lib/ modules (38 files) |
| [`7841003`](https://github.com/Akasha-0/cabaladoscaminhos/commit/7841003252de94da83425546c6fc30f2e4500cd6) | chore(dead-code): Wave 11.5 â€” remove inlined subcomponents and dead ManifestoPDF helpers |
| [`750dd96`](https://github.com/Akasha-0/cabaladoscaminhos/commit/750dd963a70c7e3049afb581c8061b307b48b181) | chore(dead-code): Wave 11.5 â€” remove dead dashboard/ shared/ and ui/ components |

### Wave 11 â€” €” test coverage (+rate-limit + push + llm-router tests)

_Merge: [`2704617`](https://github.com/Akasha-0/cabaladoscaminhos/commit/2704617eb777bccd536502b2ff783351e3d6fed1)_

| SHA | Mensagem |
|-----|----------|
| [`12771e1`](https://github.com/Akasha-0/cabaladoscaminhos/commit/12771e13021da25e77b7b1a8650d3f77d9b81d41) | test(mentor/mcp-client): add coverage for Wave 9.3 MCP wrapper |
| [`498e895`](https://github.com/Akasha-0/cabaladoscaminhos/commit/498e8953f1f46399cb3f331da1f35b48e74a7b1e) | test(audit-log + credit-reconciliation): add coverage for LGPD and admin reconciliation |

### Wave 11 â€” €” i18n completion (migrate hardcoded strings)

_Merge: [`8bb630d`](https://github.com/Akasha-0/cabaladoscaminhos/commit/8bb630d7af604c50d20bc9a71686ca7e40e6ecbb)_

| SHA | Mensagem |
|-----|----------|
| [`1479a41`](https://github.com/Akasha-0/cabaladoscaminhos/commit/1479a410aecf74d0519df9483f2916b5cba8b65b) | feat(i18n): add mentor.chat namespace + remove MentorChat hardcoded fallbacks (Wave 11.4) |
| [`7ccb1fd`](https://github.com/Akasha-0/cabaladoscaminhos/commit/7ccb1fdf583fb8507f7cb40f93c3454b2cb1bb7e) | feat(i18n): migrate PwaInstallPrompt to useTranslation (Wave 11.4) |
| [`1e85347`](https://github.com/Akasha-0/cabaladoscaminhos/commit/1e853478f61cc522a24b42e22b82878a93acc116) | feat(i18n): migrate 4 AdaptiveContent views to useTranslation (Wave 11.4) |
| [`57df9a8`](https://github.com/Akasha-0/cabaladoscaminhos/commit/57df9a894dc88a6301a2246dcab7c8bfda9a151f) | feat(i18n): migrate BottomNav to useTranslation (Wave 11.4) |

### Wave 11 â€” €” accessibility WCAG 2.1 fixes (StatePicker + PwaInstallPrompt + BreathOrb + MentorChat + BottomNav)

_Merge: [`a45cfab`](https://github.com/Akasha-0/cabaladoscaminhos/commit/a45cfab16c1f1ce3b1b8a645a9dfaf60b3cb0c7f)_

| SHA | Mensagem |
|-----|----------|
| [`c2ea262`](https://github.com/Akasha-0/cabaladoscaminhos/commit/c2ea262f317b86a9fba2736b24f106009cf3cc4b) | fix(a11y): BreathOrb â€” sr-only live region for breathing phase |
| [`374a357`](https://github.com/Akasha-0/cabaladoscaminhos/commit/374a35788ec12b54e647427e34a3c63a33606e4d) | fix(a11y): PwaInstallPrompt â€” focus trap, auto-focus, Escape, distinct labels |
| [`73b8e39`](https://github.com/Akasha-0/cabaladoscaminhos/commit/73b8e39d5de81b066d9abb49179336322e7ed3d5) | fix(a11y): MentorChat â€” sr-only live region for streaming + dynamic input label |
| [`a6e48fd`](https://github.com/Akasha-0/cabaladoscaminhos/commit/a6e48fdc56976f2c898dabbaba8d84323253fa90) | fix(a11y): BottomNav â€” visible focus ring (2px violet) on keyboard nav |

### Wave 11 â€” €” TypeScript strict cleanup

_Merge: [`a4dbae7`](https://github.com/Akasha-0/cabaladoscaminhos/commit/a4dbae739f691737a084c8824f48dbf42cd0a000)_

| SHA | Mensagem |
|-----|----------|
| [`c718224`](https://github.com/Akasha-0/cabaladoscaminhos/commit/c71822460f02ce290eb4bdde5c55e8d4d27f11a3) | fix(tests): align test fixtures with engine type contracts (Wave 11.1) |

