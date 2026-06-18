---
name: codegraph-first
description: Structural code questions must use codegraph instead of blind file scanning — saves tokens and API calls.
condition:
  - '\bgrep\s+-r'
  - '\brg\s'
  - '\bfind\s+\.\s'
  - '\bls\s+-R'
interruptMode: tool-only
---
Structural question detected. Instead of scanning files blindly, use codegraph:

- `codegraph_explore` — how X works / call flow
- `codegraph_search` — locate a symbol
- `codegraph_callers`/`codegraph_callees` — call graph
- `codegraph_impact` — before editing

Treat the returned snippet as already read — do not re-read with grep to confirm.
