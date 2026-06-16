#!/usr/bin/env bash
# sacred-protocol-check.sh — valida CodeGraph + Headroom antes de qualquer tarefa.
#
# Uso:  source scripts/sacred-protocol-check.sh
#        (deve ser SOURCED, não executado, para exportar vars no shell atual)
#
# Exit 0 = ambos OK. Exit 1 = problema.
# Sem output = tudo funcionando.

set -euo pipefail

PROXY_PORT="${HEADROOM_PROXY_PORT:-8787}"
PROXY_URL="http://127.0.0.1:${PROXY_PORT}"
CG_INDEX=".codegraph"

echo "[sacred-protocol] verificando CodeGraph..." >&2
if [[ ! -d "$CG_INDEX" ]]; then
    echo "[sacred-protocol] ERRO: CodeGraph index ausente em $CG_INDEX" >&2
    echo "[sacred-protocol] Rode: codegraph index" >&2
    exit 1
fi

echo "[sacred-protocol] verificando Headroom proxy (porta $PROXY_PORT)..." >&2
if ! curl -fsS --connect-timeout 3 "$PROXY_URL/healthz" >/dev/null 2>&1; then
    # Tenta subir o proxy
    if [[ -x ".headroom-venv/bin/headroom" ]]; then
        echo "[sacred-protocol] proxy down — iniciando..." >&2
        ".headroom-venv/bin/headroom" proxy \
            --port "$PROXY_PORT" \
            --backend anthropic \
            --anthropic-api-url "https://api.minimax.io/anthropic" \
            >/dev/null 2>&1 &
        sleep 2
        if ! curl -fsS --connect-timeout 5 "$PROXY_URL/healthz" >/dev/null 2>&1; then
            echo "[sacred-protocol] ERRO: proxy nao subiu" >&2
            exit 1
        fi
    else
        echo "[sacred-protocol] ERRO: proxy inacessivel e headroom nao encontrado" >&2
        exit 1
    fi
fi

echo "[sacred-protocol] OK — CodeGraph + Headroom operacionais" >&2
echo "[sacred-protocol] HEADROOM_PROXY_URL=http://127.0.0.1:${PROXY_PORT}" >&2
export HEADROOM_PROXY_URL="http://127.0.0.1:${PROXY_PORT}"
