# MCP Configuration — AKASHA / cabala-dos-caminhos

> Per AKASHA_HARNESS_CONSTITUTION.md §5: "codegraph + headroom via MCP" plug into native omp.
> Both are stdio-mode MCP servers; omp connects to them automatically when they appear in
> the process environment's MCP config. The headroom server is already live at port 8787.

---

## 1. Existing: headroom

Source config: `.mcp.json`

```json
{
  "mcpServers": {
    "headroom": {
      "type": "stdio",
      "command": "/home/skynet/cabala-dos-caminhos/.headroom-venv/bin/headroom",
      "args": ["mcp", "serve"],
      "env": {
        "HEADROOM_PROXY_URL": "http://127.0.0.1:8787"
      }
    }
  }
}
```

- **Transport:** stdio (process spawn)
- **Proxy URL:** `http://127.0.0.1:8787`
- **Status:** Already wired. No action required.

---

## 2. Missing: codegraph

The workspace has **no `.codegraph/` directory** — codegraph is not yet initialized.
Per constitution §5: "Pergunta estrutural → codegraph, nunca grep cego."

### 2a. MCP tool names (once initialized)

| Tool | Purpose |
|------|---------|
| `codegraph_explore` | Answer open-ended code questions — relevant symbols + call paths |
| `codegraph_node` | Return one symbol's source + callers, or read a whole file with line numbers |
| `codegraph_query` | Run raw structured queries against the index |

> When the index does not exist, these tools return a clear "workspace not indexed" notice.
> After initialization (`codegraph init && codegraph sync`) they become available automatically.

### 2b. Setup (one-time)

```bash
cd ~/cabala-dos-caminhos
codegraph init
codegraph sync
```

Full instructions: see `.omp/codegraph-setup.md`.

### 2c. MCP server entry (add to `.mcp.json` once codegraph is installed)

After `codegraph init` succeeds, merge this into `mcpServers`:

```json
{
  "codegraph": {
    "type": "stdio",
    "command": "codegraph",
    "args": ["mcp", "serve"]
  }
}
```

---

## 3. Effective `.mcp.json` (target state)

Once codegraph is initialized, `.mcp.json` should contain:

```json
{
  "mcpServers": {
    "headroom": {
      "type": "stdio",
      "command": "/home/skynet/cabala-dos-caminhos/.headroom-venv/bin/headroom",
      "args": ["mcp", "serve"],
      "env": {
        "HEADROOM_PROXY_URL": "http://127.0.0.1:8787"
      }
    },
    "codegraph": {
      "type": "stdio",
      "command": "codegraph",
      "args": ["mcp", "serve"]
    }
  }
}
```

---

## 4. Usage contract (per constitution §5)

- **Headroom:** compression/analysis queries → use MCP tool directly.
- **Codegraph:** structural code questions → use MCP tool directly. **Never** fall back to
  `grep`/`find`/`rg` when codegraph can answer.
- Both tools are available to all omp agents (no per-agent opt-out needed).

---

## 5. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `codegraph_explore` returns "not indexed" | Run `codegraph init && codegraph sync` from project root |
| `headroom` MCP calls fail | Verify `http://127.0.0.1:8787` is reachable; restart headroom daemon |
| `.codegraph/` exists but tools still fail | Run `codegraph sync` to refresh index |
