#!/usr/bin/env bash
# cabala-loop-infinite.sh — Loop infinito: 1 ciclo por vez, esperanado terminar
# Uso: ./cabala-loop-infinite.sh [quick|hourly|night]
MODE="${1:-quick}"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
CLAUDE_BIN="${HOME}/.local/bin/claude"
SCRIPT="$PROJECT_DIR/.claude/scripts/cabala-loop-runner.sh"
MIN_LOAD=20  # sobe pra 20 se load > 20
INTERVAL=60   # segundos entre verificacoes
export MAX_CONCURRENT=1
export CLAUDE_MODEL="MiniMax-M2.7"
export CLAUDE_BIN
export HOME

echo "[$(date)] INFINITE LOOP START — mode=$MODE"
echo "Proximo ciclo lancado automaticamente quando anterior terminar."

while true; do
  # Limpa locks velhos
  rm -rf "$PROJECT_DIR/.claude/state/locks/cabala-loop"/*.lock 2>/dev/null

  # Conta processos
  RUNNING=$(ps aux 2>/dev/null | grep -F "$CLAUDE_BIN -p" 2>/dev/null | grep -v grep | grep -v "cabala-loop" | wc -l | tr -d ' \n' || echo 0)
  
  if [ "$RUNNING" -lt 1 ]; then
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | tr -d ' ')
    LOAD_INT=$(printf '%.0f' "$LOAD")
    
    if [ "$LOAD_INT" -lt "$MIN_LOAD" ]; then
      echo "[$(date '+%H:%M:%S')] Load=$LOAD < $MIN_LOAD — Lancando ciclo $MODE"
      (cd "$PROJECT_DIR" && bash "$SCRIPT" "$MODE" >> "$PROJECT_DIR/.claude/scripts/loop-infinite.log" 2>&1) &
      sleep 5  # da tempo pro processo subir
    else
      echo "[$(date '+%H:%M:%S')] Load=$LOAD >= $MIN_LOAD — Aguardando..."
    fi
  else
    echo "[$(date '+%H:%M:%S')] Ciclo ja rodando (pid count=$RUNNING)"
  fi
  
  sleep "$INTERVAL"
done
