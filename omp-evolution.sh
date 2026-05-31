#!/bin/bash
#===============================================================================
# OMP SMART EVOLUTION ORCHESTRATOR v3.0
# Cabala dos Caminhos - Auto-Evolution Loop
#===============================================================================

set -euo pipefail

PROJECT_DIR="$HOME/cabala-dos-caminhos"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/orchestrator-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_header() {
    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "  $1"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

log_step() {
    log "${BLUE}[$1]${NC} $2"
}

log_success() {
    log "${GREEN}✓${NC} $1"
}

log_error() {
    log "${RED}✗${NC} $1"
}

init() {
    cd "$PROJECT_DIR"
    log_header "OMP AUTO-EVOLUTION ENGINE v3.0"
    log "Project: $PROJECT_DIR"
    log "Log: $LOG_FILE"
    log "Started: $(date)"
}

analyze_state() {
    log_header "ESTADO ATUAL"
    
    # Contadores
    local sprints=$(grep -oP "Sprints completados:\s*\K\d+" PROGRESS.md 2>/dev/null || echo "?")
    local tests=$(grep -oP "Tests:\s*✅\s*\K\d+" PROGRESS.md 2>/dev/null || echo "?")
    local correlations=$(find src/lib/correlation -name "*.ts" -not -name "*.test.ts" 2>/dev/null | wc -l || echo "0")
    
    log "  Sprints: $sprints"
    log "  Tests: $tests"
    log "  Correlações: $correlations"
    
    # Git status
    if git diff --quiet HEAD 2>/dev/null; then
        log "  Worktree: limpo ✓"
    else
        log "  Worktree: com mudanças pendentes"
        git add -A && git commit -m "wip: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
    fi
    
    # Quality check
    log_header "QUALIDADE"
    
    if npm run build > /tmp/build.log 2>&1; then
        log_success "Build: PASS"
    else
        log_error "Build: FALHOU"
        tail -20 /tmp/build.log | grep -E "error|Error" | head -5
    fi
    
    if npm run lint > /tmp/lint.log 2>&1; then
        log_success "Lint: PASS"
    else
        log "Lint:有一些 avisos"
    fi
    
    if npm run test:run > /tmp/test.log 2>&1; then
        local test_count=$(grep -oP "\d+(?= passing)" /tmp/test.log | tail -1 || echo "?")
        log_success "Tests: PASS ($test_count)"
    else
        log_error "Tests: FALHOU"
        grep -E "FAIL|failed" /tmp/test.log | head -5
    fi
}

identify_gaps() {
    log_header "GAP ANALYSIS"
    
    local gaps=()
    
    # Verificar correlações faltando
    log_step "CORRELAÇÕES" "Analisando..."
    
    # Lista de correlações que deveriam existir
    local needed_correlations=(
        "chakra-sound"
        "orixa-herb"
        "zodiac-chakra"
        "element-chakra"
    )
    
    for corr in "${needed_correlations[@]}"; do
        if [ ! -f "src/lib/correlation/${corr}.ts" ]; then
            log "  Missing: $corr"
            gaps+=("$corr")
        fi
    done
    
    log "  Total de gaps: ${#gaps[@]}"
    
    return 0
}

execute_evolution() {
    log_header "EXECUÇÃO DE EVOLUÇÃO"
    
    # Aqui você pode adicionar lógica específica
    # Por agora, apenas verificamos quality
    
    log "  Modo: Auto-Evolution Loop"
    log "  Objetivo: Aumentar significado e correlações"
    
    # Criar uma nova correlação se faltar
    if [ ! -f "src/lib/correlation/chakra-sound.ts" ]; then
        log_step "CREATE" "chakra-sound correlation"
        # O OMP agent vai criar isso
    fi
    
    log_success "Ciclo de evolução completado"
}

main() {
    init
    
    local cycle=1
    local max_cycles="${1:-500000}"
    
    log_header "INICIANDO LOOP DE EVOLUÇÃO"
    log "Máximo de ciclos: $max_cycles"
    log "Pressione Ctrl+C para parar"
    
    while [ $cycle -le $max_cycles ]; do
        echo ""
        log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log "  CICLO #$cycle - $(date '+%Y-%m-%d %H:%M:%S')"
        log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        analyze_state
        identify_gaps
        execute_evolution
        
        cycle=$((cycle + 1))
        
        # Pausa entre ciclos (não sobrecarregar)
        sleep 3
    done
    
    log_header "EVOLUÇÃO COMPLETA"
    log "Total de ciclos: $((cycle - 1))"
    log "Log: $LOG_FILE"
}

main "$@"