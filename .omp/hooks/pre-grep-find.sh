#!/usr/bin/env bash
# pre-grep-find.sh — PreToolUse hook for Grep/Find
# Warns if codegraph could answer instead of blind grep/find.
# stdin: full tool input JSON; stdout: {} (allow) or {"decision":"warn","reason":"..."}
set -euo pipefail

INPUT=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | sed 's/"tool_name":"//;s/"$//')

# Only guard Grep and Find tools
if [[ "$TOOL_NAME" != "Grep" && "$TOOL_NAME" != "Find" ]]; then
  echo '{}'
  exit 0
fi

# Extract pattern or glob
PATTERN=$(echo "$INPUT" | grep -o '"pattern":"[^"]*"' | head -1 | sed 's/"pattern":"//;s/"$//' || true)
GLOB=$(echo "$INPUT" | grep -o '"glob":"[^"]*"' | head -1 | sed 's/"glob":"//;s/"$//' || true)

# Check if codegraph is available (workspace indexed)
CODEGRAPH_AVAILABLE=false
if [[ -d ~/cabala-dos-caminhos/.codegraph ]]; then
  CODEGRAPH_AVAILABLE=true
fi

# Trivial patterns that are always fine (no codegraph needed)
TRIVIAL_PATTERNS='^(true|false|null|undefined|none|any)$'
if [[ -n "$PATTERN" ]] && echo "$PATTERN" | grep -qE "$TRIVIAL_PATTERNS"; then
  echo '{}'
  exit 0
fi

# If codegraph is available and pattern looks structural, warn
if [[ "$CODEGRAPH_AVAILABLE" == true ]] && [[ -n "$PATTERN" ]]; then
  # Heuristic: structural queries (function names, imports, types, AST patterns)
  STRUCTURAL_PATTERNS='^(function |const |class |interface |type |import |export |async |await |def |fn |pub fn|module |package )'
  if echo "$PATTERN" | grep -qE "$STRUCTURAL_PATTERNS"; then
    cat <<EOF
{"decision":"warn","reason":"CODEGRAPH DISPONÍVEL: padrão '$PATTERN' parece estrutural. Use codegraph_explore ou codegraph_node antes de grep cego — é mais preciso e respeita o AST."}
EOF
    exit 0
  fi
fi

echo '{}'
exit 0
