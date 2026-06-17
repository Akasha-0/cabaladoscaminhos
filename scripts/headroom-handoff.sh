#!/usr/bin/env bash
# headroom-handoff.sh — comprime um arquivo de planejamento usando headroom.
#
# Uso:  ./scripts/headroom-handoff.sh <arquivo-entrada> [arquivo-saida]
#
# Saída padrão: mesmo path com sufixo .compressed.md e stats no stdout.
# Requer: /home/skynet/cabala-dos-caminhos/.headroom-venv (criado no setup).
#
# Por que isto existe: headroom comprime tool outputs (logs, search results,
# JSON) com 60–95% de redução. Para textos de planejamento puros (markdown
# narrativo) o ganho é menor; ainda assim serve como sanity check do pipeline
# e prepara o conteúdo para CCR (retrieval reversível).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/.headroom-venv"
PY="$VENV/bin/python"

if [[ ! -x "$PY" ]]; then
  echo "ERRO: $PY não encontrado. Rode o setup do headroom primeiro." >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <arquivo-entrada> [arquivo-saida]" >&2
  exit 2
fi

INPUT="$1"
OUTPUT="${2:-${1%.md}.compressed.md}"

if [[ ! -f "$INPUT" ]]; then
  echo "ERRO: $INPUT não existe." >&2
  exit 3
fi

"$PY" - "$INPUT" "$OUTPUT" <<'PY'
import json
import os
import sys
from pathlib import Path

src = Path(sys.argv[1])
dst = Path(sys.argv[2])
text = src.read_text()

os.environ.setdefault("HEADROOM_QUIET", "1")
from headroom import compress  # noqa: E402

result = compress(messages=[{"role": "user", "content": text}])
out_text = result.messages[0].get("content", "") if result.messages else ""

# Header com stats para o agente downstream entender o que foi comprimido.
header = (
    f"<!-- headroom-handoff\n"
    f"  source: {src}\n"
    f"  tokens_before: {result.tokens_before}\n"
    f"  tokens_after:  {result.tokens_after}\n"
    f"  tokens_saved:  {result.tokens_saved}\n"
    f"  compression_ratio: {result.compression_ratio:.4f}\n"
    f"  transforms:    {list(result.transforms_applied or [])}\n"
    f"  -- retrieve original via: headroom_retrieve (MCP) or headroom proxy -->\n"
    f"-->\n\n"
)

dst.write_text(header + out_text)

print(f"OK  {src}  →  {dst}")
print(f"    tokens: {result.tokens_before} → {result.tokens_after} "
      f"(saved {result.tokens_saved}, ratio {result.compression_ratio:.3f})")
PY
