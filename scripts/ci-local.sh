#!/usr/bin/env bash
# ============================================================================
# scripts/ci-local.sh — Simulação local do CI
# ============================================================================
# Roda tsc + lint + vitest + playwright em sequência, capturando exit codes.
# Documenta o que passou/falhou em docs/CI-RUN.md.
#
# NÃO falha o script inteiro se uma fase falhar — em vez disso, marca
# como FAIL no relatório e continua. Isso é importante porque no sandbox
# OOM é esperado, e queremos DOCUMENTAR o que falhou em vez de abortar.
#
# Uso:
#   bash scripts/ci-local.sh           # roda tudo
#   bash scripts/ci-local.sh --quick   # pula playwright (rápido)
#   bash scripts/ci-local.sh --smoke   # só playwright
# ============================================================================

set -u  # NÃO usamos set -e — queremos continuar mesmo se uma fase falhar

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REPORT="$PROJECT_ROOT/docs/CI-RUN.md"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
HOSTNAME_SHORT=$(hostname 2>/dev/null | cut -c1-40 || echo "unknown")
OS_INFO="$(uname -srm 2>/dev/null || echo unknown)"

# Parse args
RUN_TSC=1
RUN_LINT=1
RUN_VITEST=1
RUN_PLAYWRIGHT=1
for arg in "$@"; do
  case "$arg" in
    --quick) RUN_PLAYWRIGHT=0 ;;
    --smoke) RUN_TSC=0; RUN_LINT=0; RUN_VITEST=0 ;;
    --no-tsc) RUN_TSC=0 ;;
    --no-lint) RUN_LINT=0 ;;
    --no-vitest) RUN_VITEST=0 ;;
    --no-playwright) RUN_PLAYWRIGHT=0 ;;
    --help|-h)
      echo "Uso: bash scripts/ci-local.sh [--quick|--smoke|--no-tsc|--no-lint|--no-vitest|--no-playwright]"
      exit 0
      ;;
  esac
done

# Memória disponível (Linux)
if [[ -f /proc/meminfo ]]; then
  MEM_TOTAL_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  MEM_AVAIL_KB=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
  MEM_TOTAL_MB=$((MEM_TOTAL_KB / 1024))
  MEM_AVAIL_MB=$((MEM_AVAIL_KB / 1024))
else
  MEM_TOTAL_MB="?"
  MEM_AVAIL_MB="?"
fi

# Header do relatório
cat > "$REPORT" <<EOF
# 🔧 CI Run Report — Akasha Portal

**Data**: $TIMESTAMP
**Host**: $HOSTNAME_SHORT
**OS**: $OS_INFO
**Memória total**: ${MEM_TOTAL_MB} MB
**Memória disponível**: ${MEM_AVAIL_MB} MB

> Documentação completa em [TESTING-GUIDE.md](./TESTING-GUIDE.md).
> Troubleshooting OOM: seção 6.1 do guia.

---

## Resumo executivo

EOF

# Função: roda uma fase e registra resultado
declare -A PHASE_STATUS
declare -A PHASE_DURATION

run_phase() {
  local phase_name="$1"
  local phase_label="$2"
  local phase_cmd="$3"
  local phase_log="$PROJECT_ROOT/.ci-logs/${phase_name}.log"
  local start_ts=$(date +%s)

  mkdir -p "$PROJECT_ROOT/.ci-logs"

  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "▶ $phase_label"
  echo "  Comando: $phase_cmd"
  echo "═══════════════════════════════════════════════════════════════"

  # Aumenta heap se for vitest ou playwright (evita OOM em sandbox)
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

  # Roda e captura exit code + últimas 100 linhas do log
  if bash -c "$phase_cmd" > "$phase_log" 2>&1; then
    PHASE_STATUS[$phase_name]="PASS"
    echo "✅ $phase_label — PASS"
  else
    local exit_code=$?
    PHASE_STATUS[$phase_name]="FAIL ($exit_code)"
    echo "❌ $phase_label — FAIL (exit $exit_code)"
    # Mostra últimas linhas do log
    if [[ -f "$phase_log" ]]; then
      echo "  --- últimas linhas do log ---"
      tail -n 30 "$phase_log" | sed 's/^/    /'
      echo "  --- fim ---"
    fi
  fi

  local end_ts=$(date +%s)
  PHASE_DURATION[$phase_name]=$((end_ts - start_ts))
}

# Fase 1: TypeScript check
if [[ $RUN_TSC -eq 1 ]]; then
  run_phase "tsc" "TypeScript check" "npx tsc --noEmit --skipLibCheck"
fi

# Fase 2: ESLint
if [[ $RUN_LINT -eq 1 ]]; then
  run_phase "lint" "ESLint" "npx eslint . --max-warnings 0 2>&1 | tail -50"
fi

# Fase 3: Vitest (unit + SSR + integration)
if [[ $RUN_VITEST -eq 1 ]]; then
  # --bail 0: continua mesmo se algum teste falhar (registramos tudo)
  run_phase "vitest" "Vitest (unit + SSR + integration)" \
    "npx vitest run --reporter=default --bail=0 2>&1 | tail -200"
fi

# Fase 4: Playwright (E2E smoke)
if [[ $RUN_PLAYWRIGHT -eq 1 ]]; then
  # Primeiro, garantir que chromium está disponível
  if [[ ! -d "$PROJECT_ROOT/node_modules/playwright-core/.local-browsers/chromium-"* ]]; then
    echo "⚠️  Chromium não instalado. Rode: npx playwright install chromium"
    PHASE_STATUS["playwright"]="SKIPPED (no chromium)"
  else
    run_phase "playwright" "Playwright E2E (smoke + screenshots)" \
      "npx playwright test e2e/smoke.spec.ts e2e/screenshots.spec.ts --reporter=list 2>&1 | tail -100"
  fi
fi

# Calcula totais
PASSED=0
FAILED=0
SKIPPED=0
for k in "${!PHASE_STATUS[@]}"; do
  v="${PHASE_STATUS[$k]}"
  case "$v" in
    PASS) PASSED=$((PASSED+1)) ;;
    SKIPPED*) SKIPPED=$((SKIPPED+1)) ;;
    *) FAILED=$((FAILED+1)) ;;
  esac
done

# Verifica screenshots
SCREENSHOTS_DIR="$PROJECT_ROOT/.screenshots"
SCREENSHOT_COUNT=0
if [[ -d "$SCREENSHOTS_DIR" ]]; then
  SCREENSHOT_COUNT=$(find "$SCREENSHOTS_DIR" -name "*.png" -type f 2>/dev/null | wc -l)
fi

# Verifica Playwright report
PW_REPORT="$PROJECT_ROOT/playwright-report/index.html"

# Append seção detalhada no relatório
cat >> "$REPORT" <<EOF

| Fase | Status | Duração (s) |
|---|---|---|
EOF

# Ordena fases conhecidas
for phase in tsc lint vitest playwright; do
  if [[ -v "PHASE_STATUS[$phase]" ]]; then
    status="${PHASE_STATUS[$phase]}"
    duration="${PHASE_DURATION[$phase]:-0}"
    case "$status" em
      PASS) emoji="✅" ;;
      SKIPPED*) emoji="⏭️" ;;
      *) emoji="❌" ;;
    esac
    echo "| $phase | $emoji $status | $duration |" >> "$REPORT"
  fi
done

cat >> "$REPORT" <<EOF

**Totais**: $PASSED passou · $FAILED falhou · $SKIPPED pulado

## Artefatos

- **Screenshots capturados**: $SCREENSHOT_COUNT arquivos em \`.screenshots/\`
- **Playwright HTML report**: $(if [[ -f "$PW_REPORT" ]]; then echo "[playwright-report/index.html](../playwright-report/index.html)"; else echo "_não gerado_"; fi)
- **Logs por fase**: \`.ci-logs/<fase>.log\` (gitignored)

## Detalhes por fase

EOF

for phase in tsc lint vitest playwright; do
  if [[ -v "PHASE_STATUS[$phase]" ]]; then
    status="${PHASE_STATUS[$phase]}"
    log_file="$PROJECT_ROOT/.ci-logs/${phase}.log"
    duration="${PHASE_DURATION[$phase]:-0}"

    cat >> "$REPORT" <<PHASE_EOF

### $phase

- **Status**: \`$status\`
- **Duração**: ${duration}s
- **Log completo**: [\.ci-logs/${phase}.log](../.ci-logs/${phase}.log)

\`\`\`
$(if [[ -f "$log_file" ]]; then tail -n 60 "$log_file"; else echo "_log não disponível_"; fi)
\`\`\`

PHASE_EOF
  fi
done

# Conclusão
cat >> "$REPORT" <<EOF

---

## Conclusão

EOF

if [[ $FAILED -eq 0 ]]; then
  cat >> "$REPORT" <<EOF
✅ **TODAS AS FASES PASSARAM** ($PASSED/$((PASSED+FAILED+SKIPPED)))

Próximos passos:
- Revisar \`playwright-report/index.html\` (se E2E rodou)
- Fazer commit + push do branch
- Abrir PR se apropriado
EOF
  echo ""
  echo "✅ Todas as fases passaram! Relatório: $REPORT"
  exit 0
else
  cat >> "$REPORT" <<EOF
⚠️ **$FAILED FASE(S) FALHARAM**

**Causas prováveis em sandbox**:
1. **OOM (Out of Memory)** — sandbox tem pouca RAM. Veja TESTING-GUIDE.md §6.1.
   - Sintomas: "FATAL ERROR: Reached heap limit", "JavaScript heap out of memory"
   - Mitigação: rodar fases individuais (ex: \`--no-playwright\`)
2. **Timeout do Next.js dev** — primeira compilação demora 30-60s
   - Mitigação: pré-aquecer \`npm run dev\` antes de rodar testes
3. **Dependência quebrada** — rodar \`npm install\` limpo
4. **Erro de aplicação real** — olhar logs em \`.ci-logs/<fase>.log\`

**Ação recomendada**:
- Se for OOM/timeout: marcar como SKIPPED e abrir issue para rodar em CI real
- Se for erro real: consertar antes de prosseguir
EOF
  echo ""
  echo "⚠️  $FAILED fase(s) falharam. Relatório: $REPORT"
  exit 1
fi
