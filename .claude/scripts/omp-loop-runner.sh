#!/usr/bin/env bash
# ============================================================
# OMP Loop Runner — Executa loops autônomos para Cabala dos Caminhos
# Usado por cron jobs para execução periódica
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
SCRIPT_DIR="$PROJECT_DIR/.claude/scripts"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/-home-skynet-cabala-dos-caminhos/memory"
OMP_DIR="$PROJECT_DIR/.omp"
CYCLE_TYPE="${1:-quick}"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)

mkdir -p "$MEMORY_DIR/omp-loops"
mkdir -p "$SCRIPT_DIR/autonomous"

echo "🔄 OMP Loop Runner — $CYCLE_TYPE — $TIMESTAMP"
echo "=============================================="

cd "$PROJECT_DIR"

# Mapear ciclo para script
case "$CYCLE_TYPE" in
  "quick")
    SCRIPT="$SCRIPT_DIR/autonomous/quick-cycle.sh"
    ;;
  "hourly")
    SCRIPT="$SCRIPT_DIR/autonomous/hourly-cycle.sh"
    ;;
  "daily"|"standup")
    SCRIPT="$SCRIPT_DIR/autonomous/daily-standup.sh"
    ;;
  "weekly")
    SCRIPT="$SCRIPT_DIR/autonomous/weekly-quality.sh"
    ;;
  "pr-review"|"pr")
    SCRIPT="$SCRIPT_DIR/autonomous/pr-gate.sh"
    ;;
  "spiritual")
    SCRIPT="$SCRIPT_DIR/autonomous/spiritual-monitor.sh"
    ;;
  "heal"|"test-heal")
    SCRIPT="$SCRIPT_DIR/autonomous/test-healer.sh"
    ;;
  *)
    echo "⚠️  Unknown cycle: $CYCLE_TYPE"
    exit 1
    ;;
esac

# Criar scripts de ciclo se não existirem
create_default_scripts() {
  mkdir -p "$SCRIPT_DIR/autonomous"
  
  # Quick Cycle
  cat > "$SCRIPT_DIR/autonomous/quick-cycle.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Quick Cycle ==="
echo "Git status: $(git status --short | wc -l) files"
npm run test:run 2>&1 | tail -5
echo "Build: $(npm run build 2>&1 | grep -c "compiled successfully\|Build complete\|✓" || echo 0)"
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/quick-cycle.sh"
  
  # Hourly Cycle  
  cat > "$SCRIPT_DIR/autonomous/hourly-cycle.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Hourly Cycle ==="
git status --short
echo "Checking daemon..."
ps aux | grep -c "claude.*daemon" || echo 0
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/hourly-cycle.sh"
  
  # Daily Standup
  cat > "$SCRIPT_DIR/autonomous/daily-standup.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Daily Standup ==="
echo "Test Suite:"
npm run test:run 2>&1 | grep -E "passing|failure" | tail -1
echo "Build:"
npm run build 2>&1 | tail -3
echo "Git:"
git status --short | head -10
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/daily-standup.sh"
  
  # Weekly Quality
  cat > "$SCRIPT_DIR/autonomous/weekly-quality.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Weekly Quality ==="
npm run quality 2>&1 | tail -10
echo "Tests:"
npm run test:run 2>&1 | tail -5
echo "Commits this week:"
git log --since="7 days ago" --oneline | wc -l
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/weekly-quality.sh"
  
  # PR Gate
  cat > "$SCRIPT_DIR/autonomous/pr-gate.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== PR Gate ==="
echo "TypeScript:"
npx tsc --noEmit 2>&1 | grep -c "error" || echo 0
echo "Tests:"
npm run test:run 2>&1 | tail -3
echo "Build:"
npm run build 2>&1 | tail -3
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/pr-gate.sh"
  
  # Spiritual Monitor
  cat > "$SCRIPT_DIR/autonomous/spiritual-monitor.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Spiritual Monitor ==="
echo "GOAL.md size: $(wc -c < GOAL.md) bytes"
echo "IDEIA.md TODOs: $(grep -c "TODO\|FIXME" IDEIA.md || echo 0)"
echo "Engine TODOs: $(grep -r "TODO\|FIXME" src/lib/ 2>/dev/null | wc -l)"
echo "Recent correlations:"
git log --since="7 days ago" --oneline -- "IDEIA.md" "src/lib/divination/" | head -5
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/spiritual-monitor.sh"
  
  # Test Healer
  cat > "$SCRIPT_DIR/autonomous/test-healer.sh" << 'SCRIPT'
#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Test Healer ==="
FAILURES=$(npm run test:run 2>&1 | grep -oP '\d+(?= failure)' | head -1 || echo 0)
echo "Current failures: $FAILURES"
if [ "$FAILURES" -gt 80 ]; then
  echo "⚠️  Failures above baseline, running diagnostics..."
  npm run test:run 2>&1 | grep "FAIL" | head -10
else
  echo "✅ Within baseline"
fi
SCRIPT
  chmod +x "$SCRIPT_DIR/autonomous/test-healer.sh"
}

# Criar scripts se necessário
if [ ! -f "$SCRIPT" ]; then
  echo "📝 Creating default scripts..."
  create_default_scripts
fi

# Output file
OUTPUT="$MEMORY_DIR/omp-loops/loop-$CYCLE_TYPE-$TIMESTAMP.md"

# Executar ciclo
{
  echo "# OMP Loop — $CYCLE_TYPE — $TIMESTAMP"
  echo ""
  echo "## Started"
  date -Iseconds
  echo ""
  echo "## Git Status"
  git status --short | head -10
  echo ""
  echo "## Cycle Output"
  if [ -x "$SCRIPT" ]; then
    bash "$SCRIPT" 2>&1 || echo "⚠️  Script failed"
  else
    echo "⚠️  Script not executable: $SCRIPT"
  fi
  echo ""
  echo "## Finished"
  date -Iseconds
} > "$OUTPUT"

echo ""
echo "📝 Report: $OUTPUT"
echo "✅ Loop completed"

# Cleanup old logs
find "$MEMORY_DIR/omp-loops" -name "loop-*" -mtime +7 -delete 2>/dev/null || true
