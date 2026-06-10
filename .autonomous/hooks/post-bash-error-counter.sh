#!/usr/bin/env bash
# post-bash-error-counter.sh — PostToolUse hook para Bash
# Conta erros consecutivos do mesmo tipo. Após 3x, escreve stop signal.
set -euo pipefail

INPUT=$(cat)

TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | sed 's/"tool_name":"//;s/"$//')
if [[ "$TOOL" != "Bash" ]]; then
  echo '{}'
  exit 0
fi

# Tenta extrair tool_response (truncado)
RESPONSE=$(echo "$INPUT" | grep -o '"tool_response":"[^"]\{1,500\}"' | head -1)
if [[ -z "$RESPONSE" ]]; then
  echo '{}'
  exit 0
fi

ERROR_PATTERNS=(
  'TypeError:'
  'ReferenceError:'
  'SyntaxError:'
  'ECONNREFUSED'
  'command not found'
  'Permission denied'
  'EACCES'
  'ENOENT'
  'panic:'
  'fatal:'
  'error TS[0-9]'
  'FAIL '
  'pnpm test.*failed'
  'Test Suites Failed'
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$SCRIPT_DIR/../state"
mkdir -p "$STATE_DIR"
ERROR_LOG="$STATE_DIR/error.log"
STOP_SIGNAL="$STATE_DIR/stop.signal"

for pat in "${ERROR_PATTERNS[@]}"; do
  if echo "$RESPONSE" | grep -qE "$pat"; then
    HASH=$(echo "$RESPONSE" | grep -oE "$pat[^\\\"]*" | head -1 | md5sum | cut -c1-8)
    TS=$(date +%s)
    echo "$TS $HASH $pat" >> "$ERROR_LOG"

    # Conta ocorrências do mesmo hash nos últimos 5 min
    RECENT=$(awk -v cutoff=$((TS - 300)) -v h="$HASH" '$1 > cutoff && $2 == h' "$ERROR_LOG" | wc -l)

    if [[ $RECENT -ge 3 ]]; then
      cat > "$STOP_SIGNAL" <<EOF
AUTO-STOP: mesmo erro ($pat) detectado $RECENT vezes em 5 min.
Última resposta: ${RESPONSE:0:200}
Agente deve parar e pedir intervenção humana.
EOF
      cat <<EOF
{"decision":"block","reason":"STOP SIGNAL ATIVADO: $pat repetido $RECENT vezes. Orchestrator vai encerrar. Verifique .autonomous/state/stop.signal"}
EOF
      exit 0
    fi
    break
  fi
done

# Truncar log
if [[ -f "$ERROR_LOG" ]] && [[ $(wc -l < "$ERROR_LOG") -gt 1000 ]]; then
  tail -500 "$ERROR_LOG" > "$ERROR_LOG.tmp" && mv "$ERROR_LOG.tmp" "$ERROR_LOG"
fi

echo '{}'
exit 0
