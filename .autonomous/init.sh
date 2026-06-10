#!/usr/bin/env bash
# init.sh — Bootstrap dev environment for Cabala dos Caminhos
# Uso: .autonomous/init.sh [--no-db] [--no-llm]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

NO_DB=false
NO_LLM=false
for arg in "$@"; do
  case "$arg" in
    --no-db)  NO_DB=true ;;
    --no-llm) NO_LLM=true ;;
    *) echo "Unknown arg: $arg" >&2; exit 1 ;;
  esac
done

log() { echo "[init.sh $(date +%H:%M:%S)] $*"; }

log "1/6 — Verificar Node + pnpm"
if ! command -v node >/dev/null 2>&1; then
  log "ERRO: node não encontrado. Instale Node 20+."; exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
  log "Instalando pnpm..."
  npm install -g pnpm@latest
fi
log "node $(node --version) | pnpm $(pnpm --version)"

log "2/6 — Instalar deps (pnpm install --frozen-lockfile)"
pnpm install --frozen-lockfile --prefer-offline 2>&1 | tail -20

log "3/6 — Prisma generate"
pnpm db:generate 2>&1 | tail -5

if [ "$NO_DB" = false ]; then
  log "4/6 — Postgres + Redis (docker compose up -d)"
  if command -v docker >/dev/null 2>&1; then
    docker compose up -d postgres redis 2>&1 | tail -5 || \
      log "Aviso: docker compose falhou, pulando."
  else
    log "Docker não disponível, pulando."
  fi
  log "    Aguardando Postgres ficar pronto (max 30s)..."
  for i in {1..30}; do
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
      log "    Postgres OK."
      break
    fi
    sleep 1
  done
  pnpm db:push 2>&1 | tail -5 || log "db:push falhou (rode manual)."
else
  log "4/6 — (--no-db) Pulando Postgres."
fi

if [ "$NO_LLM" = false ]; then
  log "5/6 — Verificar Ollama (embeddings)"
  if command -v ollama >/dev/null 2>&1; then
    if ! pgrep -x ollama >/dev/null; then
      log "    Iniciando Ollama..."
      ollama serve >/tmp/ollama.log 2>&1 &
      sleep 3
    fi
    log "    Ollama rodando."
  else
    log "    Ollama não instalado (RAG desabilitado)."
  fi
else
  log "5/6 — (--no-llm) Pulando Ollama."
fi

log "6/6 — Resumo"
cat <<EOF

╔══════════════════════════════════════════════════════════════╗
║  Cabala dos Caminhos — ready                                 ║
╠══════════════════════════════════════════════════════════════╣
║  App Portal:    pnpm dev:portal   (http://localhost:3000)    ║
║  Mentor agent:  pnpm dev:mentor   (CLI)                     ║
║  Quality:       pnpm quality                                ║
║  Tests:         pnpm test:run                               ║
║  Typecheck:     pnpm typecheck                              ║
║  Grimoire sync: pnpm grimoire:sync                          ║
║                                                              ║
║  Spec atual:     .autonomous/app_spec.txt                   ║
║  Feature list:   .autonomous/feature_list.json              ║
║  Próxima task:   .claude/TODO.md                            ║
║  Launch:         .autonomous/launch.sh [--init|--resume]    ║
╚══════════════════════════════════════════════════════════════╝
EOF
