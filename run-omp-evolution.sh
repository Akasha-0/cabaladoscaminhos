#!/bin/bash
#===============================================================================
# CABALA DOS CAMINHOS - AUTO EVOLUTION LOOP
#===============================================================================
# Purpose: Executa ciclos infinitos de evolução da plataforma
# Usage:   bash run-omp-evolution.sh [OPTIONS]
# Options:
#   --iterations=N   Número de ciclos (default: infinite)
#   --focus=AREA     Focar em área específica (correlations|widgets|insights|tests)
#   --dry-run        Não fazer mudanças, só analisar
#   --verbose        Mostrar logs detalhados
#===============================================================================

set -euo pipefail

# --- CONFIGURAÇÕES -------------------------------------------------------
PROJECT_DIR="$HOME/cabala-dos-caminhos"
LOG_FILE="$PROJECT_DIR/logs/evolution-$(date +%Y%m%d-%H%M%S).log"
ITERATIONS="${ITERATIONS:-infinite}"
FOCUS="${FOCUS:-all}"
DRY_RUN=false
VERBOSE=false

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- HELPERS ------------------------------------------------------------
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    echo "$msg" >> "$LOG_FILE"
}

log_step() {
    log "${BLUE}[$1]${NC} $2"
}

log_success() {
    log "${GREEN}✓${NC} $1"
}

log_warn() {
    log "${YELLOW}⚠${NC} $1"
}

log_error() {
    log "${RED}✗${NC} $1"
}

# --- INICIALIZAÇÃO ------------------------------------------------------
init() {
    mkdir -p "$PROJECT_DIR/logs"
    
    log "=========================================="
    log "  CABALA DOS CAMINHOS - AUTO EVOLUTION"
    log "=========================================="
    log "Project: $PROJECT_DIR"
    log "Mode: focus=$FOCUS, iterations=$ITERATIONS"
    log "Log: $LOG_FILE"
    log "=========================================="
    
    cd "$PROJECT_DIR"
    
    # Verificar estado do projeto
    if [ ! -f "package.json" ]; then
        log_error "package.json não encontrado em $PROJECT_DIR"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log_error "npm não está instalado"
        exit 1
    fi
    
    log_success "Ambiente inicializado"
}

# --- VERIFICAÇÕES -------------------------------------------------------
check_git_status() {
    if git diff --quiet HEAD 2>/dev/null; then
        return 0  # Clean
    else
        return 1  # Dirty
    fi
}

check_for_failures() {
    local test_output="$1"
    
    if grep -q "failed" "$test_output" 2>/dev/null; then
        return 1  # Has failures
    fi
    return 0  # Clean
}

# --- CICLO DE EVOLUÇÃO --------------------------------------------------
run_cycle() {
    local cycle_num=$1
    local improvements=0
    
    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "  CICLO #$cycle_num - $(date '+%Y-%m-%d %H:%M:%S')"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # ASSESS: Leitura de contexto
    log_step "ASSESS" "Lendo contexto do projeto..."
    
    # Ler estado atual
    if [ -f "PROGRESS.md" ]; then
        local sprints=$(grep "Sprints completados" PROGRESS.md | grep -oP '\d+' || echo "0")
        local tests=$(grep "^Tests:" PROGRESS.md | grep -oP '\d+' || echo "0")
        log "  Estado: $sprints sprints, $tests tests"
    fi
    
    # Verificar worktree
    if check_git_status; then
        log "  Worktree: limpo ✓"
    else
        log_warn "  Worktree: contém mudanças pendentes"
        log "  Fazendo commit das mudanças anteriores..."
        git add -A
        git commit -m "wip: trabalho pendente $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
    fi
    
    # THINK: Identificar trabalho significativo
    log_step "THINK" "Analisando oportunidades de evolução..."
    
    local work_areas=""
    
    # Analisar áreas de trabalho
    case "$FOCUS" in
        "correlations")
            work_areas="Nova correlação espiritual faltando"
            ;;
        "widgets")
            work_areas="Widget sem significado profundo"
            ;;
        "insights")
            work_areas="Insight quebrado ou ausente"
            ;;
        "tests")
            work_areas="Test coverage baixo"
            ;;
        *)
            # Todas as áreas
            work_areas=" múltiplas áreas"
            ;;
    esac
    
    log "  Áreas identificadas: $work_areas"
    
    # PLAN + EXECUTE: Identificar e executar tarefa mais importante
    log_step "EXECUTE" "Executando tarefa mais impactante..."
    
    # Aqui você pode adicionar lógica para identificar tarefa
    # Por enquanto, o script é um template - o usuário ou OMP roda o prompt
    # Este script serve como scaffold para automação
    
    # Simular verificação de qualidade
    log "  Verificando qualidade do código..."
    
    # Executar verificações em background
    local build_result="pending"
    local lint_result="pending"
    local test_result="pending"
    
    # Build check
    log "  - Executando build..."
    if npm run build > /tmp/build-$cycle_num.log 2>&1; then
        build_result="PASS"
        log_success "  Build: OK"
    else
        build_result="FAIL"
        log_error "  Build: FALHOU"
        if [ "$VERBOSE" = true ]; then
            cat /tmp/build-$cycle_num.log | tail -50
        fi
    fi
    
    # Lint check
    log "  - Executando lint..."
    if npm run lint > /tmp/lint-$cycle_num.log 2>&1; then
        lint_result="PASS"
        log_success "  Lint: OK"
    else
        lint_result="FAIL"
        log_warn "  Lint:有一些 avisos"
    fi
    
    # Test check
    log "  - Executando testes..."
    if npm run test:run > /tmp/test-$cycle_num.log 2>&1; then
        test_result="PASS"
        log_success "  Tests: OK"
    else
        test_result="FAIL"
        log_error "  Tests: FALHOU"
        if [ "$VERBOSE" = true ]; then
            cat /tmp/test-$cycle_num.log | tail -50
        fi
    fi
    
    # VERIFY: Reportar métricas
    log_step "VERIFY" "Verificando qualidade..."
    
    local quality_score=0
    if [ "$build_result" = "PASS" ]; then
        quality_score=$((quality_score + 33))
    fi
    if [ "$lint_result" = "PASS" ]; then
        quality_score=$((quality_score + 33))
    fi
    if [ "$test_result" = "PASS" ]; then
        quality_score=$((quality_score + 34))
    fi
    
    log "  Quality Score: $quality_score%"
    
    # EVOLVE: Documentar progresso
    if [ "$build_result" = "PASS" ] && [ "$test_result" = "PASS" ]; then
        log_success "  Ciclo #$cycle_num: SUCESSO ✓"
        log "  Próximo passo: revisar output e iniciar novo ciclo"
    else
        log_error "  Ciclo #$cycle_num: FALHOU"
        log "  Ação necessária: corrigir problemas antes de continuar"
    fi
    
    return 0
}

# --- LOOP PRINCIPAL ------------------------------------------------------
main() {
    init
    
    local cycle=1
    local max_cycles=999999
    
    if [ "$ITERATIONS" != "infinite" ]; then
        max_cycles=$ITERATIONS
    fi
    
    log "Iniciando loop de evolução (máx: $max_cycles ciclos)"
    
    while [ $cycle -le $max_cycles ]; do
        run_cycle $cycle
        
        if [ "$ITERATIONS" != "infinite" ]; then
            log "Ciclo $cycle/$max_cycles completo"
        else
            log "Ciclo $cycle completo - aguardando próximo..."
        fi
        
        cycle=$((cycle + 1))
        
        # Pausa entre ciclos para não sobrecarregar
        sleep 2
    done
    
    log ""
    log "=========================================="
    log "  EVOLUÇÃO COMPLETA"
    log "  Total de ciclos: $((cycle - 1))"
    log "=========================================="
}

# --- EXECUÇÃO -----------------------------------------------------------
main "$@"