#!/usr/bin/env bash
#
# run-24-7.sh — Akasha 24/7 Autonomous Evolution Engine (canonical)
# =========================================================
#
# Full 24/7 operation with Guardian + Loop Daemon (canonical, evolved from v9).
# Implements: Phase timeout, crash-resilient execution, ContextEngineV2, PromptEngineV2,
#             ReasoningChainV2, MemoryManagerV2, SkillDiscovererV2, IntelligenceV2,
#             SelfHealerV2, ProjectScannerV2, AgentOrchestratorV2.
#
# Usage:
#   ./run-24-7.sh start       — Start 24/7 operation
#   ./run-24-7.sh stop        — Graceful stop
#   ./run-24-7.sh restart     — Restart
#   ./run-24-7.sh status      — Check status
#   ./run-24-7.sh health      — Health check
#   ./run-24-7.sh telemetry   — Show telemetry summary
#   ./run-24-7.sh project-map — Project area intelligence
#   ./run-24-7.sh reasoning   — Reasoning chain status
#   ./run-24-7.sh context      — Context engine summary
#   ./run-24-7.sh validate    — Run validation suite
#
# Flow:
#   run-24-7.sh → run-loop-supervised.sh → akasha-loop-daemon.py
#
set -euo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
DAEMON="$MA/akasha-loop-daemon.py"
SUPERVISOR="$MA/run-loop-supervised.sh"
PID_FILE="$MA/loop-daemon.pid"
STATE_FILE="$MA/state.json"
MEMORY_FILE="$MA/memory.json"
METRICS_FILE="$MA/metrics.json"
PACER_FILE="$MA/pacer-state.json"
TELEMETRY_FILE="$MA/telemetry.json"
CONTINUITY_FILE="$MA/memory-warm.json"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log(){ echo -e "[$(date +%H:%M:%S)] $1"; }
log_ok(){ echo -e "[$(date +%H:%M:%S)]$GREEN OK $1$NC"; }
log_warn(){ echo -e "[$(date +%H:%M:%S)]$YELLOW WARN $1$NC"; }
log_err(){ echo -e "[$(date +%H:%M:%S)]$RED ERR $1$NC"; }

preflight(){
    log "Pre-flight checks..."
    if [[ ! -f "$$DAEMON" ]]; then log_err "v9 daemon not found"; exit 1; fi
    local missing=()
    for mod in adaptive_pacer self_healer_v2 predictive_engine skill_discoverer_v2 \
               continuity_manager memory_manager_v2 guardian telemetry \
               project_scanner_v2 reasoning_chain_v2 context_engine_v2 evolver \
               prompt_engine_v2 agent_orchestrator_v2 intelligence_v2; do
        [[ ! -f "$MA/${mod}.py" ]] && missing+=("$mod")
    done
    [[ ${#missing[@]} -gt 0 ]] && { log_err "Missing: ${missing[*]}"; exit 1; }
    log_ok "Pre-flight passed — v9 ready"
}

get_status(){
    if [[ ! -f "$PID_FILE" ]]; then echo "No PID file"; return 1; fi
    local pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
    [[ -z "$pid" ]] && { echo "PID file empty"; return 1; }
    kill -0 "$pid" 2>/dev/null && echo "Running PID=$pid" || { echo "PID $pid dead"; return 1; }
}

detailed_status(){
    echo "=== Akasha 24/7 Status ==="
    get_status || true
    echo ""
    if [[ -f "$STATE_FILE" ]]; then
        python3 -c "
import json
d=json.load(open('$STATE_FILE'))
print(f'Phase:     {d.get(\"phase\",\"?\")}')
print(f'Iteration: {d.get(\"iteration\",0)}')
print(f'Running:   {d.get(\"running\",False)}')
print(f'Quality:   {d.get(\"quality_snapshot\",0.0):.1f}')
" 2>/dev/null || echo "(state parse error)"
    fi
    echo ""
    if [[ -f "$PACER_FILE" ]]; then
        python3 -c "
import json
d=json.load(open('$PACER_FILE'))
print(f'Pacer state:    {d.get(\"state\",\"?\")}')
print(f'Quality EMA:     {d.get(\"quality_ema\",0.0):.1f}')
print(f'Failure rate:   {d.get(\"failure_rate\",0.0):.1%}')
print(f'Multiplier:     {d.get(\"multiplier\",1.0)}')
" 2>/dev/null
        echo ""
    fi
    echo "Modules:"
    for mod in adaptive_pacer self_healer predictive_engine skill_discoverer \
               continuity_manager memory_manager guardian telemetry; do
        if [[ -f "$MA/${mod}.py" ]]; then
            echo -e "  $GREEN$mod$NC OK"
        else
            echo -e "  $RED$mod$NC MISSING"
        fi
    done
}

health_check(){
    echo "=== Health Check ==="
    local issues=0
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo -e "$GREEN daemon alive$NC"
    else
        echo -e "$RED daemon not alive$NC"; ((issues++))
    fi
    [[ -S "$MA/loop-daemon.sock" ]] && echo -e "$GREEN socket exists$NC" \
        || echo -e "$YELLOW socket missing$NC"
    [[ -f "$MEMORY_FILE" ]] && echo -e "$GREEN memory file OK$NC" \
        || { echo -e "$RED no memory file$NC"; ((issues++)); }
    [[ -f "$STATE_FILE" ]] && python3 -c "import json; json.load(open('$STATE_FILE'))" \
        2>/dev/null && echo -e "$GREEN state.json valid$NC" \
        || { echo -e "$RED state.json corrupt$NC"; ((issues++)); }
    echo ""
    [[ $issues -eq 0 ]] && log_ok "All checks passed" || log_err "$issues issue(s)"
}

telemetry_summary(){
    echo "=== Telemetry Summary ==="
    if [[ -f "$TELEMETRY_FILE" ]]; then
        python3 -c "
import json
d=json.load(open('$TELEMETRY_FILE'))
pd=d.get('phase_durations',{})
print('Phase durations (avg seconds):')
for ph in ['RESEARCH','PLANNING','IMPLEMENTATION','QA','VALIDATION','RELEASE']:
    vals=pd.get(ph,[])
    if vals: print(f'  {ph}: {sum(vals)/len(vals):.1f}s ({len(vals)} samples)')
out=d.get('iteration_outcomes',{})
total=sum(out.values())
if total:
    print(f'\nOutcomes (total={total}):')
    for k,v in out.items():
        print(f'  {k}: {v} ({v/total*100:.1f}%)')
qs=d.get('quality_scores',[])
if qs: print(f'\nQuality: latest={qs[-1]:.1f}, last10avg={sum(qs[-10:])/len(qs[-10:]):.1f}')
" 2>/dev/null
    else
        echo "No telemetry data yet"
    fi
    if [[ -f "$METRICS_FILE" ]]; then
        python3 -c "
import json
d=json.load(open('$METRICS_FILE'))
h=d.get('history',[])
if h:
    print(f'\nEvals iterations: {len(h)}')
    for r in h[-3:]:
        print(f'  iter {r.get(\"iteration\",\"?\")}: q={r.get(\"loop_quality\",0):.3f}')
" 2>/dev/null
    fi
}

validate(){
    log "Running validation..."
    local errors=0
    for mod in adaptive_pacer self_healer predictive_engine skill_discoverer \
               continuity_manager memory_manager guardian telemetry \
               project_map reasoning_chain context_engine evolver \
               prompt_engine agent_orchestrator \
               akasha-loop-daemon-v5 akasha-evolution-loop-v2; do
        [[ -f "$MA/${mod}.py" ]] || continue
        python3 -m py_compile "$MA/${mod}.py" 2>/dev/null \
            && echo -e "  $GREEN${mod}.py$NC syntax OK" \
            || { echo -e "  $RED${mod}.py$NC SYNTAX ERROR"; ((errors++)); }
    done
    for f in state.json memory.json; do
        [[ -f "$MA/${f}" ]] || continue
        python3 -c "import json; json.load(open('$MA/${f}'))" 2>/dev/null \
            && echo -e "  $GREEN${f}$NC valid" \
            || { echo -e "  $RED${f}$NC CORRUPT"; ((errors++)); }
    done
    echo ""
    [[ $errors -eq 0 ]] && log_ok "Validation passed" || log_err "$errors error(s)"
    return $errors
}

do_start(){
    preflight
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        log_err "Already running PID=$(cat "$PID_FILE")"
        exit 1
    fi
    log "Starting Akasha 24/7..."
    bash "$SUPERVISOR" start
}

do_stop(){
    log "Stopping..."
    bash "$SUPERVISOR" stop 2>/dev/null || true
    log_ok "Stop sent"
}

CMD="${1:-status}"
case "$CMD" in
    start)   do_start ;;
    stop)    do_stop ;;
    restart) do_stop; sleep 3; do_start ;;
    status)  get_status ;;
    detailed|info) detailed_status ;;
    health|check) health_check ;;
    telemetry|telem) telemetry_summary ;;
    project-map|pmap)
        python3 -c "
import sys; sys.path.insert(0,'$MA')
from project_map import ProjectMap
pm = ProjectMap()
print('ProjectMap v5 — 9 areas scanned:')
stats = pm.get_project_stats()
for a in stats.get('areas', {}).values():
    print(f\"  {a.get('name','?')}: quality={a.get('quality_score',0):.0f} potential={a.get('improvement_potential',0):.0f}\")
print()
print('High potential:', [a.get('area') for a in pm.get_high_potential_areas(top_n=3)])
print('Neglected (>30d):', pm.get_neglected_areas(threshold_days=30))
" 2>/dev/null || echo "ProjectMap not available"
        ;;
    reasoning)
        python3 -c "
import sys; sys.path.insert(0,'$MA')
from reasoning_chain import ReasoningChain
rc = ReasoningChain()
result = rc.think('What should Akasha evolve next?', {})
print('ReasoningChain v5:')
for step in (result.reasoning_steps if hasattr(result, 'reasoning_steps') else []):
    print(f\"  Step {step.step_number}: {step.observation[:80]}\")
print(f\"  Conclusion: {result.conclusion[:120] if hasattr(result, 'conclusion') else '?'}\")
print(f\"  Confidence: {result.confidence:.2f}\" if hasattr(result, 'confidence') else '')
" 2>/dev/null || echo "ReasoningChain not available"
        ;;
    context)
        python3 -c "
import sys; sys.path.insert(0,'$MA')
from context_engine import ContextEngine
ce = ContextEngine()
summary = ce.get_context_summary()
print('ContextEngine v5:')
for k,v in summary.items():
    print(f'  {k}: {str(v)[:80]}')
print(f\"  Hash: {ce.get_context_hash()[:16]}\")
" 2>/dev/null || echo "ContextEngine not available"
        ;;
    validate|check) validate ;;
    *) echo "Usage: $0 {start|stop|restart|status|detailed|health|telemetry|project-map|reasoning|context|validate}" ;;
esac
