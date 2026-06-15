# CLAUDE.md

All instructions are in the file `AGENTS.md`.

## Quick Reference

**CodeGraph-first (OBRIGATÓRIO)**: Every exploration task MUST use `codegraph explore` **BEFORE** `Read`/`Grep`/`Glob`.

```bash
# Step 1: Explore with CodeGraph
codegraph explore "how does X work"

# Step 2: Only if needed, read specific files
```

**Verify before commit**: `pnpm --filter akasha-portal typecheck`

**No static export**: `output: 'export'` is incompatible with authenticated routes using `cookies()`.
