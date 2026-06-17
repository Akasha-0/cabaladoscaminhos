# CLAUDE.md

All instructions are in the file `AGENTS.md`.

## Sacred Protocol (non-negotiable)

Before **ANY** task — coding, design, research, planning, architecture:

```bash
# ATIVAÇÃO OBRIGATÓRIA — rode isto ANTES de qualquer trabalho
source scripts/sacred-protocol-check.sh

# Ou manualmente:
# 1. CodeGraph: mcp__codegraph_explore para inteligência de código
# 2. Headroom: http://localhost:8787 para outputs >5k tokens
```
## Quick Reference

**CodeGraph-first (OBRIGATÓRIO)**: Every exploration task MUST use `codegraph_explore` **BEFORE** `Read`/`Grep`/`Glob`.

```bash
# Step 1: Explore with CodeGraph
codegraph explore "how does X work"

# Step 2: Only if needed, read specific files
```

**Verify before commit**: `pnpm --filter akasha-portal typecheck`

**No static export**: `output: 'export'` is incompatible with authenticated routes using `cookies()`.
