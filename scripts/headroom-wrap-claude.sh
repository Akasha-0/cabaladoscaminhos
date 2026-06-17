#!/usr/bin/env bash
# headroom-wrap-claude.sh — inicia o proxy headroom e roda Claude Code através dele.
#
# Uso:  ./scripts/headroom-wrap-claude.sh
#
# O que faz:
#   1. Sobe `headroom proxy` em background (porta 8787)
#   2. Espera o proxy responder em /healthz
#   3. Exporta ANTHROPIC_BASE_URL=http://127.0.0.1:8787
#   4. Executa `claude` em foreground
#   5. Ao sair, mata o proxy
#
# IMPORTANTE: NÃO use `--memory` (conflita com claude-mem que já está instalado).
#             Headroom + claude-mem são complementares: headroom comprime em voo,
#             claude-mem guarda memória cross-session.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$ROOT/.headroom-venv"
HEADROOM="$VENV/bin/headroom"
PROXY_PORT="${HEADROOM_PROXY_PORT:-8787}"
PROXY_LOG="$ROOT/.headroom-venv/proxy.log"
PROXY_PID=""

cleanup() {
  if [[ -n "$PROXY_PID" ]] && kill -0 "$PROXY_PID" 2>/dev/null; then
    echo "[headroom-wrap] parando proxy (pid=$PROXY_PID)..." >&2
    kill "$PROXY_PID" 2>/dev/null || true
    wait "$PROXY_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

if [[ ! -x "$HEADROOM" ]]; then
  echo "ERRO: $HEADROOM não encontrado. Rode o setup primeiro." >&2
  exit 1
fi

echo "[headroom-wrap] iniciando proxy na porta $PROXY_PORT..." >&2
"$HEADROOM" proxy \
  --port "$PROXY_PORT" \
  --backend anthropic \
  --anthropic-api-url "https://api.minimax.io/anthropic" \
  >"$PROXY_LOG" 2>&1 &
PROXY_PID=$!

# Aguarda o proxy responder
for i in {1..30}; do
  if curl -fsS "http://127.0.0.1:$PROXY_PORT/livez" >/dev/null 2>&1; then
    echo "[headroom-wrap] proxy pronto (pid=$PROXY_PID)" >&2
    break
  fi
  sleep 0.5
  if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    echo "[headroom-wrap] ERRO: proxy morreu. Veja $PROXY_LOG" >&2
    tail -20 "$PROXY_LOG" >&2 || true
    exit 1
  fi
done

echo "[headroom-wrap] rodando Claude Code via proxy..." >&2
export ANTHROPIC_BASE_URL="http://127.0.0.1:$PROXY_PORT"
exec claude "$@"
