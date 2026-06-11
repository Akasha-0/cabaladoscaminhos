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
ALLOWED='^(pnpm|npm|node|npx|tsx|ts-node|esbuild|vite|next|playwright|vitest|jest|eslint|prettier|prisma|turbo|tsc|pg_isready|psql|docker|ls|cat|head|tail|wc|grep|find|file|tree|stat|which|echo|printf|date|sleep|git|init\.sh|chmod|cp|mv|mkdir|touch|jq|cargo|rustc|go|python|python3|curl|wget|ollama|redis-cli|ps|lsof|pkill|true|false|test|sed|awk|tr|sort|uniq|diff|tee|basename|dirname|realpath|readlink|xargs|env|export|cd|pwd|kill|killall|du|df|free|uname|whoami|id|hostname|uptime|tar|gzip|gunzip|zip|unzip|openssl|md5sum|sha256sum|column|kill|killall|column|du|df|free|uname|whoami|id|hostname|uptime|xargs|\[)'

# Forbidden patterns (mesmo se na allowlist) — defense-in-depth
# 2026-06-11 UPDATE: sudo UNBLOCKED (per user authorization in session).
# Authorized operations: DB peer-auth, service restart, env-preserved pnpm.
# Defense-in-depth: rm -rf of /, ~, .; dd to /dev/(zero|urandom|random); mkfs;
# fork bomb; force-push to origin main; git reset --hard; chmod 777 stay blocked.
# Stale lesson .autonomous/lessons/loop-sudo-policy.md will be updated.

FORBIDDEN_PATTERNS=(
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \.$'
  ':(){:|:&};:'
  'dd if=/dev/(zero|urandom|random)'
  'mkfs'
  'shutdown'
  'reboot'
  'git push.*--force.*origin'
  'git push.*-f.*origin'
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
