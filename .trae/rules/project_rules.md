# Project Rules — CodeGraph-First

> **SUPREME RULE (OBRIGATÓRIO)**: CodeGraph is the primary research tool. **Every** exploration task MUST use `codegraph explore` before `Read`/`Grep`/`Glob`. This saves tokens and ensures accurate blast-radius analysis.

## CodeGraph

CodeGraph is installed and indexed for this project (923 files, 6.078 nodes, 17.174 edges).

### ⚡MANDATORY Workflow

```
Pergunta de arquitetura/dependência?
  └─ YES → codegraph explore "sua pergunta aqui"
  └─ NO  → Read/Grep/Glob (pode usar diretamente)
```

### When to use `codegraph explore`

| Scenario | Example Query |
|----------|---------------|
| Architecture | "how does mandala API route work" |
| Dependencies | "what imports findAspects" |
| Callers | "where is buildKabalisticMap called" |
| Impact analysis | "what files use MandalaData" |
| Refactoring | "what would break if I rename X" |
| Discovery | "what handles astrology calculations" |

### How to use

```bash
# EXPLORAÇÃO (sempre primeiro)
codegraph explore "sua pergunta em linguagem natural"

# BUSCA DE SÍMBOLOS
codegraph query "getBirthChart"

# STATUS DO ÍNDICE
codegraph status
codegraph sync       # após mudanças no código
```

### Why CodeGraph first?

- **Blast radius preciso**: mostra exatamente quem chama o que
- **Zero file reads** para consultas de exploração
- **Import chain completo**: ver caminho exato de dependências
- **Economia de tokens**: evita ler 10 arquivos quando 1 consulta responde

### Fallback (only if codegraph fails)

Se `codegraph explore` não retornar informação útil:
```
1. Try: codegraph query "symbolName"
2. If still empty: THEN use Read/Grep/Glob
```

## Verification Commands

```bash
pnpm --filter akasha-portal typecheck  # must exit 0 before any commit
pnpm --filter akasha-portal test:run   # run after typecheck
```

## No Static Export

The portal uses `cookies()` from `next/headers` in authenticated routes. `output: 'export'` is incompatible — do not re-enable it.

## Headroom (Context Compression MCP)

Headroom 0.25.0 is installed at `.headroom-venv/` and registered as an MCP server via the project-local `.mcp.json`. It exposes the following tools to any MCP-aware agent (TRAE or Claude Code) in this project:

| MCP Tool | When to call it |
|---|---|
| `mcp__headroom__headroom_compress` | Pre-compress a large text/dump before pasting into the LLM (saves tokens on the current turn) |
| `mcp__headroom__headroom_retrieve` | Expand a previously-compressed block by hash (CCR reverse-lookup against the local proxy cache) |
| `mcp__headroom__headroom_stats` | Show current savings, cache hit rate, transforms applied |

### Where Headroom ACTUALLY wins

- Tool outputs from Grep/Glob/Read that return >5k tokens
- JSON dumps, log tails, RAG chunks, search-result lists
- Code-search result batches (e.g. 100 file matches)

### Where Headroom is a no-op (don't bother)

- Already-concise narrative markdown (handoff docs, ADRs, planning notes) — measured 0% on `/tmp/handoff-mandala-fase2-planning.md`
- Single source files (the AST compressor leaves dense code untouched — measured 0% on `synthesis-engine.ts` at 30k tokens)
- Pure prose with low redundancy

### Workflow: TRAE plan → Claude Code implement

1. Plan and analyze in TRAE (uses `codegraph_explore` per the SUPREME RULE above).
2. When handing off, the user can run `./scripts/headroom-wrap-claude.sh` which boots the headroom proxy on port 8787 and launches Claude Code with `ANTHROPIC_BASE_URL` pointed at it — every large tool output Claude Code produces is auto-compressed before reaching the LLM.
3. After the session, `headroom perf` shows the savings.

### Compatibility with claude-mem

`claude-mem` (already installed, ~8k uses) and headroom are **complementary**, not redundant:
- **claude-mem**: hook lifecycle (`PostToolUse`, `SessionStart`, `Stop`) → cross-session memory
- **headroom**: HTTP transport / MCP layer → in-flight compression within a session

DO NOT use `headroom wrap claude --memory` — it would install a second memory system and fight with claude-mem. Plain `headroom wrap claude` is correct.

### Useful one-liners

```bash
# Check status
.headroom-venv/bin/headroom mcp status

# Compress a file manually (e.g. before pasting)
./scripts/headroom-handoff.sh <input> [output]

# Run Claude Code through the compression proxy
./scripts/headroom-wrap-claude.sh

# See savings after a session
.headroom-venv/bin/headroom perf
```

> Note: this section teaches the agent about headroom; the MCP tools themselves register per-session. A new TRAE/Claude Code session opened in this project will pick up the MCP server from `.mcp.json` automatically.

## Lessons (cross-session memory)

Past autonomous sessions captured learnings in `.autonomous/lessons/`.
Start each new session by skimming the [lessons INDEX](../../.autonomous/lessons/INDEX.md)
to find what's relevant to your work — each lesson is ~50-100 lines
and avoids re-discovering the same gotchas.

The INDEX is organized by theme (Typecheck, Refactor, Pilar 4 ethics,
i18n, Multi-session, DOX, Loop discipline) with a quick-reference
table mapping "I'm working on X" → "read N+Y first".
