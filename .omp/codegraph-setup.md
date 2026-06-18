# Codegraph Setup — AKASHA / cabala-dos-caminhos

> One-time initialization only. After setup, the MCP server connects automatically via `.mcp.json`.

---

## Prerequisites

- `codegraph` CLI installed and on `$PATH`
- Project root: `~/cabala-dos-caminhos`

---

## One-Time Initialization

```bash
cd ~/cabala-dos-caminhos
codegraph init
codegraph sync
```

### What each command does

| Command | Effect |
|---------|--------|
| `codegraph init` | Creates `.codegraph/` index directory; performs initial static analysis of all supported languages (TypeScript, JavaScript, Python, Go, Rust, C/C++, Java, Ruby, etc.) |
| `codegraph sync` | Increments or refreshes the index after file changes; run again when new packages/dirs are added |

### Expected output

```
$ codegraph init
  → .codegraph/ created
  → indexing apps/akasha-portal ...
  → indexing packages/core-cabala ...
  → indexing packages/core-iching ...
  → indexing packages/core-astrology ...
  → indexing packages/core-odus ...
  → indexing packages/core-tantra ...
  → indexing packages/akasha-core ...
  → indexing packages/mentor ...
  → indexing packages/akasha-cli ...
  → done

$ codegraph sync
  → syncing incremental changes ...
  → done
```

---

## MCP Tool Reference

After initialization, these tools are available via the codegraph MCP server:

### `codegraph_explore`

```
codegraph_explore(query: string) → relevant symbols + verbatim source + call paths
```

Use for: open-ended questions about code structure, architecture, duplicated concerns.

**Example prompt that triggers it:**
> "Find all places that touch the auth token, and trace how it flows from storage to the API layer."

### `codegraph_node`

```
codegraph_node(symbol_or_file: string) → source + callers
```

Use for: "show me this function and everywhere it's called."

**Example:**
> "Give me `processAuthToken` — its implementation and every call site."

### `codegraph_query`

```
codegraph_query(query: string, language?: string) → structured results
```

Use for: raw structured queries when `explore`/`node` are insufficient.

---

## Adding to `.mcp.json`

After `codegraph init` succeeds, merge this entry into the `mcpServers` object in `.mcp.json`:

```json
{
  "codegraph": {
    "type": "stdio",
    "command": "codegraph",
    "args": ["mcp", "serve"]
  }
}
```

Combined with the existing `headroom` entry, the full target `.mcp.json` is documented in `.omp/mcp-config.md`.

---

## Index Maintenance

| Event | Action |
|-------|--------|
| New package added to monorepo | `codegraph sync` |
| Large refactor merged | `codegraph sync` |
| Tools return stale data | `codegraph sync` |
| `codegraph_explore` says "workspace not indexed" | `codegraph init` from project root |

The index is stored in `.codegraph/` — **gitignore it** (runtime artifact):

```gitignore
.codegraph/
```

---

## Verification

After setup, confirm the MCP server is reachable:

```bash
cd ~/cabala-dos-caminhos
codegraph --version   # should print version, confirming CLI is on PATH
codegraph init && codegraph sync   # idempotent; second run is a no-op if already indexed
```

Then in any omp session, the `codegraph_explore`, `codegraph_node`, and `codegraph_query`
tools will be available automatically when the MCP handshake occurs.

---

## Per Constitution §5 Contract

> "Recuperação via codegraph (MCP), compressão via headroom (MCP) — ambos plugam nativo no omp
> (stdio/HTTP MCP). **Pergunta estrutural → codegraph, nunca grep cego.**"

This means:
- Before reaching for `grep`/`rg`/`find` on structural code questions, use `codegraph_explore`
- The `codegraph` MCP tools replace `grep`/`find`/`rg` for architecture, symbol, and call-path queries
- `headroom` MCP tools handle compression/analysis/headroom queries (separate concern)
