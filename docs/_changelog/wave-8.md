---
title: Wave 8 — Changelog
sidebar_label: Wave 8
---

# Wave 8 — Changelog Auto-Gerado

> Página gerada por `scripts/generate-changelog.sh` a partir do git log.
> Período: **2026-06-24 → 2026-06-24**.
> **4 merge(s)** Wave 8.x.

## Resumo

Wave 8 agrupa 4 entregas:

- **Wave 8.Wave 8** (2 commits) — Front A — LGPD/DPA blockers (DELETE profile + DPA Anthropic + Conexoes disclaimer)
- **Wave 8.Wave 8** (1 commits) — Front B — MCP server skeleton + Mentor route integration (7/7 tests passing)
- **Wave 8.Wave 8** (2 commits) — Front C-b — remaining test errors (29→17 failures closed, -12)
- **Wave 8.Wave 8** (1 commits) — Front C-a — 62→29 test failures closed (-33)

## Estatísticas agregadas

```
 10 files changed, 3 insertions(+), 305 deletions(-)
```

## Commits por merge

### Wave 8 — Front A — LGPD/DPA blockers (DELETE profile + DPA Anthropic + Conexoes disclaimer)

_Merge: [`8c559cc`](https://github.com/Akasha-0/cabaladoscaminhos/commit/8c559cc27a7e2dc9e1137bda34c2591d5a6a98ee)_

| SHA | Mensagem |
|-----|----------|
| [`c4b4f9e`](https://github.com/Akasha-0/cabaladoscaminhos/commit/c4b4f9e8742d13613a783e374abbac3c40ba9794) | feat(portal): Wave 8.3 A.3 — disclaimer de terceiros em Conexões (LGPD Art. 37) |
| [`e0b470b`](https://github.com/Akasha-0/cabaladoscaminhos/commit/e0b470b829f16d19319a1afed79f90d91aee9a36) | docs(legal): Wave 8.3 A.2 — DPA Anthropic template + auditoria rotas LLM (LGPD Art. 33) |

### Wave 8 — Front B — MCP server skeleton + Mentor route integration (7/7 tests passing)

_Merge: [`a422d63`](https://github.com/Akasha-0/cabaladoscaminhos/commit/a422d634d027d8ece68a1d4b9ecef3d17c992441)_

| SHA | Mensagem |
|-----|----------|
| [`9971b7d`](https://github.com/Akasha-0/cabaladoscaminhos/commit/9971b7d6815fb67288c76f8d709f6ba7d4d26e0a) | feat(mentor): Wave 8.4 B.2 — lazy @akasha/mcp import + graceful fallback to direct LLM |

### Wave 8 — Front C-b — remaining test errors (29→17 failures closed, -12)

_Merge: [`c054cb4`](https://github.com/Akasha-0/cabaladoscaminhos/commit/c054cb4e30fb0bffe24af448f9308c3794194c5d)_

| SHA | Mensagem |
|-----|----------|
| [`65da823`](https://github.com/Akasha-0/cabaladoscaminhos/commit/65da823f4628806af05ab30be90b5ba6d02912d2) | fix(portal/test): workaround Vitest 4 + Object.freeze no prisma proxy (partial) |
| [`5835570`](https://github.com/Akasha-0/cabaladoscaminhos/commit/5835570729e63b5712eab7afa5aad206b7d68a69) | fix(portal/auth): fallback get('set-cookie') quando getSetCookie ausente (middleware-auth) |

### Wave 8 — Front C-a — 62→29 test failures closed (-33)

_Merge: [`ec635ee`](https://github.com/Akasha-0/cabaladoscaminhos/commit/ec635eedcb4d6a46863637642f2a365f0f853ae9)_

| SHA | Mensagem |
|-----|----------|
| [`6f3bc59`](https://github.com/Akasha-0/cabaladoscaminhos/commit/6f3bc592291652a136ee2410761ca62f95318936) | fix(portal): Wave 8.1 Front C-a — test fixtures migrated to TooltipKey shape (62→29 failures, -33) |

