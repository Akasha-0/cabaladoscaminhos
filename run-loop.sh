#!/usr/bin/env bash
# run-loop.sh — mantém o Akasha evoluindo por horas no oh-my-pi (omp)
# Uso: ./run-loop.sh [horas]   (padrão: 8 horas)
# Pré-requisitos:
#   1. Rodar de dentro da pasta do projeto Akasha (onde está o AGENTS.md)
#   2. Compactação automática habilitada (ver config.yml sugerido no README)
#   3. Primeira sessão já iniciada com: omp @KICKOFF.md  (ou este script cuida disso)

set -u

HOURS="${1:-8}"
END=$(( $(date +%s) + HOURS * 3600 ))
LOG_DIR=".omp/loop-logs"
mkdir -p "$LOG_DIR"

CONTINUE_PROMPT='Continue o loop autônomo do Akasha. Leia STATE.md e CHANGELOG.md para retomar exatamente de onde parou e execute o próximo ciclo da FASE 3 do KICKOFF.md (selecionar → planejar → implementar → testar → versionar → atualizar STATE.md). Não pare e não faça perguntas.'

echo "[loop] Rodando por ${HOURS}h. Logs em ${LOG_DIR}/"

# Primeira execução: se não existe STATE.md, dispara o kickoff completo
if [ ! -f STATE.md ]; then
  echo "[loop] STATE.md não encontrado — iniciando kickoff..."
  omp -p @KICKOFF.md 2>&1 | tee "${LOG_DIR}/$(date +%Y%m%d-%H%M%S)-kickoff.log"
fi

while [ "$(date +%s)" -lt "$END" ]; do
  TS=$(date +%Y%m%d-%H%M%S)
  echo "[loop] ${TS} — novo ciclo (omp -c)"
  # -c continua a sessão mais recente; -p roda não-interativo e sai ao fim do turno.
  # O while reinicia imediatamente, criando o loop de horas.
  omp -c -p "$CONTINUE_PROMPT" 2>&1 | tee "${LOG_DIR}/${TS}.log"
  EXIT=$?
  if [ $EXIT -ne 0 ]; then
    echo "[loop] omp saiu com código ${EXIT}; aguardando 30s antes de tentar de novo..."
    sleep 30
  else
    sleep 5
  fi
done

echo "[loop] Tempo encerrado. Último estado em STATE.md / CHANGELOG.md."
