#!/usr/bin/env bash
# ============================================================
# Cabala dos Caminhos — Spiritual Correlation Monitor
# Schedule: 0 8 * * 1-5 (8 AM weekdays)
# Pattern: Sequential Pipeline (autonomous-loops skill)
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/cabala-dos-caminhos/memory"
SPIRITUAL_DIR="$MEMORY_DIR/spiritual-monitor"
TODAY=$(date +%Y-%m-%d)
REPORT="$SPIRITUAL_DIR/monitor-$TODAY.md"

mkdir -p "$SPIRITUAL_DIR"

echo "🔮 Spiritual Correlation Monitor — $TODAY"
echo "=========================================="

cd "$PROJECT_DIR"

# Step 1: Check IDEIA.md for TODO/FIXME/XXX/quizila
echo "📖 Scanning IDEIA.md for pending items..."
IDEIA_TODOS=$(grep -n "TODO\|FIXME\|XXX\|quizila\|QUIZILA" IDEIA.md 2>/dev/null | head -20 || echo "")
IDEIA_COUNT=$(echo "$IDEIA_TODOS" | grep -c "." || echo "0")
echo "   Found: $IDEIA_COUNT pending items"

# Step 2: Check engines for unvalidated correlations
echo "🔍 Checking spiritual engines..."
ENGINE_TODOS=$(grep -rn "TODO\|FIXME\|XXX" \
  src/lib/divination/ \
  src/lib/lenormand/ \
  src/lib/numerology/ \
  src/lib/astrologia/ \
  2>/dev/null | grep -v "node_modules" | head -20 || echo "")
ENGINE_COUNT=$(echo "$ENGINE_TODOS" | grep -c "." || echo "0")
echo "   Found: $ENGINE_COUNT pending items in engines"

# Step 3: Check GOAL.md for unmapped correlations
echo "🎯 Checking GOAL.md for unmapped correlations..."
GOAL_SECTIONS=$(grep -c "^##" GOAL.md 2>/dev/null || echo "0")
echo "   Sections: $GOAL_SECTIONS"

# Step 4: Scan for recently added correlations
echo "📊 Recent correlation changes..."
RECENT_CORR=$(git log --since="7 days ago" --oneline --all \
  -- "IDEIA.md" "src/lib/divination/" "src/lib/lenormand/" \
  -- "src/lib/numerology/" "src/lib/astrologia/" 2>/dev/null | head -10 || echo "None")
RECENT_COUNT=$(echo "$RECENT_CORR" | grep -c "." || echo "0")
echo "   Recent correlation commits: $RECENT_COUNT"

# Step 5: Validate GOAL.md exists and is non-empty
GOAL_SIZE=$(wc -c < GOAL.md 2>/dev/null || echo "0")
echo "   GOAL.md size: $GOAL_SIZE bytes"

# Step 6: Write report
cat > "$REPORT" << EOF
# Spiritual Monitor — $TODAY

## Correlation Status
- IDEIA.md TODOs/FIXMEs: $IDEIA_COUNT
- Engine TODOs/FIXMEs: $ENGINE_COUNT
- GOAL.md sections: $GOAL_SECTIONS
- GOAL.md size: $GOAL_SIZE bytes
- Recent correlation commits: $RECENT_COUNT

## Pending Items in IDEIA.md
$(if [ -n "$IDEIA_TODOS" ]; then
  echo "\`\`\`"
  echo "$IDEIA_TODOS"
  echo "\`\`\`"
else
  echo "✅ No TODOs/FIXMEs found in IDEIA.md"
fi)

## Pending Items in Engines
$(if [ -n "$ENGINE_TODOS" ]; then
  echo "\`\`\`"
  echo "$ENGINE_TODOS"
  echo "\`\`\`"
else
  echo "✅ No TODOs/FIXMEs found in engines"
fi)

## Recent Correlation Changes
$(if [ "$RECENT_COUNT" -gt 0 ]; then
  echo "\`\`\`"
  echo "$RECENT_CORR"
  echo "\`\`\`"
else
  echo "No recent correlation changes"
fi)

## Alerts
$(if [ "$IDEIA_COUNT" -gt 10 ]; then
  echo "⚠️  Many pending items in IDEIA.md — review for validation"
fi)
$(if [ "$GOAL_SIZE" -lt 10000 ]; then
  echo "⚠️  GOAL.md suspiciously small — check if mappings are complete"
fi)
$(if [ "$RECENT_COUNT" -eq 0 ]; then
  echo "ℹ️  No recent correlation changes — consider adding new mappings"
fi)
$(if [ "$IDEIA_COUNT" -eq 0 ] && [ "$ENGINE_COUNT" -eq 0 ] && [ "$RECENT_COUNT" -gt 0 ]; then
  echo "✅ Correlations validated and clean"
fi)

---
Checked: $(date -Iseconds)
EOF

echo ""
echo "📝 Report: $REPORT"
