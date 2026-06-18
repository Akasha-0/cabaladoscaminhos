#!/usr/bin/env bash
# pre-bash-sudo-migration.sh — PreToolUse hook for Bash
# Requires explicit human confirmation for sudo or prisma migrate operations.
# stdin: full tool input JSON; stdout: {} (allow) or {"decision":"block","reason":"..."}
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

# ── Check 1: sudo ────────────────────────────────────────────────────────────
if echo "$COMMAND" | grep -qE '^\s*sudo\s'; then
  cat <<EOF
{"decision":"block","reason":"TTSR HOOK: Comando com 'sudo' detectado: '${COMMAND:0:120}'.
Este é um ambiente controlado. Confirmação humana explícita é necessária para operações com sudo.
Por favor, confirme ou forneça justificativa."}
EOF
  exit 0
fi

# ── Check 2: prisma migrate / db push / db execute ───────────────────────────
if echo "$COMMAND" | grep -qE 'prisma\s+(migrate|db\s+push|db\s+execute|studio)'; then
  cat <<EOF
{"decision":"block","reason":"TTSR HOOK: Operation 'prisma migrate/push/execute/studio' detectada: '${COMMAND:0:120}'.
Migrations alteram o banco de dados em produção. Produza um PROPOSAL e aguarde aprovação humana antes de executar.
Não rode migrations sem aprovação explícita."}
EOF
  exit 0
fi

# ── Check 3: Direct schema.prisma editing (via bash sed/awk/perl/etc) ────────
if echo "$COMMAND" | grep -qE '(sed|awk|perl|tee|cat\s+>)\s+.*schema\.prisma'; then
  cat <<EOF
{"decision":"block","reason":"TTSR HOOK: Edição direta de schema.prisma detectada via bash: '${COMMAND:0:120}'.
Use o fluxo de PROPOSAL: descreva a mudança, justifique, e aguarde aprovação humana.
Edições diretas de schema sem proposta são bloqueadas."}
EOF
  exit 0
fi

echo '{}'
exit 0
