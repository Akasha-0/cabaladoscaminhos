#!/usr/bin/env bash
# session-start-budget.sh — SessionStart hook
# Verifica cost-tracker e budget antes de iniciar sessão.
set -euo pipefail

INPUT=$(cat)

MAX_BUDGET="${AUTONOMOUS_MAX_BUDGET_USD:-50.00}"
COST_FILE="$HOME/.claude/cost-tracker.log"

if [[ -f "$COST_FILE" ]]; then
  TODAY=$(date +%Y-%m-%d)
  TODAY_COST=$(awk -v d="$TODAY" '$1 ~ d {sum += $NF} END {print sum+0}' "$COST_FILE" 2>/dev/null || echo 0)

  # Comparação via bc se disponível, senão awk
  OVER=false
  if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$TODAY_COST > $MAX_BUDGET" | bc -l) )); then
      OVER=true
    fi
  else
    if (( $(awk "BEGIN {print ($TODAY_COST > $MAX_BUDGET)}") )); then
      OVER=true
    fi
  fi

  # 2026-06-11: $0 = no cap, negative = no cap (explicit override)
  if [[ "$MAX_BUDGET" == "0" || "$MAX_BUDGET" == "-1" ]]; then
    OVER=false
  fi

  if [[ "$OVER" == true ]]; then
    cat <<EOF
{"decision":"block","reason":"Budget diário atingido: \$${TODAY_COST} > \$${MAX_BUDGET}. Se quiser continuar, defina AUTONOMOUS_MAX_BUDGET_USD=0 no env ou aumente o limite."}
EOF
    exit 0
  fi
fi

# Injeta contexto extra
cat <<EOF
{"additional_context":"🤖 AUTONOMOUS MODE ATIVO. .claude/TODO.md é a fila viva. .autonomous/feature_list.json é o backlog. Max budget: \$${MAX_BUDGET}/dia. Pare e notifique se custo > limite."}
EOF
exit 0
