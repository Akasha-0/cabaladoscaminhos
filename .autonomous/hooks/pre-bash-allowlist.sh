#!/usr/bin/env bash
# pre-bash-allowlist.sh — PreToolUse hook para Bash
# Lê tool_input.command via stdin, valida contra allowlist.
# Stdout: {} (allow) ou {"decision":"block","reason":"..."} (block)
# Exit 0 sempre (decisão no stdout).
set -euo pipefail

INPUT=$(cat)

# Extract command
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | sed 's/"command":"//;s/"$//')
if [[ -z "$COMMAND" ]]; then
  COMMAND=$(echo "$INPUT" | grep -o '"command": "[^"]*"' | head -1 | sed "s/\"command\": \"//;s/\"$//")
fi

if [[ -z "$COMMAND" ]]; then
  echo '{}'
  exit 0
fi

# Allowlist (regex no primeiro token)
ALLOWED='^(pnpm|npm|node|npx|tsx|ts-node|esbuild|vite|next|playwright|vitest|jest|eslint|prettier|prisma|turbo|tsc|pg_isready|psql|docker|ls|cat|head|tail|wc|grep|find|file|tree|stat|which|echo|printf|date|sleep|git|init\.sh|chmod|cp|mv|mkdir|touch|jq|cargo|rustc|go|python|python3|curl|wget|ollama|redis-cli|ps|lsof|pkill|true|false|test|\[)'

# Forbidden patterns (mesmo se na allowlist) — defense-in-depth
# sudo é HARD BLOCKED — usuário roda manualmente quando precisar
# (ver .autonomous/lessons/loop-sudo-policy.md)
FORBIDDEN_PATTERNS=(
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \.$'
  'sudo '
  ':(){:|:&};:'
  'dd if='
  'mkfs'
  'shutdown'
  'reboot'
  'git push --force'
  'git push -f'
  'git push.*origin.*--force'
  'git reset --hard'
  'chmod 777'
  'chmod -R 777'
)

for pat in "${FORBIDDEN_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pat"; then
    cat <<EOF
{"decision":"block","reason":"Padrão bloqueado por segurança: '$pat'. Comando: ${COMMAND:0:120}"}
EOF
    exit 0
  fi
done

# Allowlist check
FIRST=$(echo "$COMMAND" | awk '{print $1}')
if echo "$FIRST" | grep -qE "$ALLOWED"; then
  echo '{}'
  exit 0
fi

# Default: block (fail-safe)
cat <<EOF
{"decision":"block","reason":"Comando '$FIRST' não está na allowlist. Comando completo: ${COMMAND:0:120}. Adicione '$FIRST' ao pre-bash-allowlist.sh se necessário."}
EOF
exit 0
