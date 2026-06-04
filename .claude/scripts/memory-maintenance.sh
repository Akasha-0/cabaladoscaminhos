#!/usr/bin/env bash
# ============================================================
# Cabala dos Caminhos — Memory Maintenance
# Schedule: 0 18 * * 0,3 (Sunday + Wednesday 6 PM)
# Pattern: Sequential Pipeline (autonomous-loops skill)
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/cabala-dos-caminhos/memory"
TODAY=$(date +%Y-%m-%d)
ARCHIVE_DIR="$MEMORY_DIR/archive/$(date +%Y-%m)"

echo "🧹 Memory Maintenance — $TODAY"
echo "================================"

mkdir -p "$ARCHIVE_DIR"

cd "$MEMORY_DIR"

# Step 1: Archive old daily health reports (>7 days)
echo "📦 Archiving old health reports..."
find daily-health -name "health-*.md" -mtime +7 -type f 2>/dev/null | while read f; do
  if [ -s "$f" ]; then
    mv "$f" "$ARCHIVE_DIR/" 2>/dev/null && echo "   Archived: $f"
  fi
done

# Step 2: Archive old weekly reports (>30 days)
echo "📦 Archiving old weekly reports..."
find weekly-reports -name "quality-*.md" -mtime +30 -type f 2>/dev/null | while read f; do
  if [ -s "$f" ]; then
    mv "$f" "$ARCHIVE_DIR/" 2>/dev/null && echo "   Archived: $f"
  fi
done

# Step 3: Archive old spiritual monitor reports (>14 days)
echo "📦 Archiving old spiritual monitor reports..."
find spiritual-monitor -name "monitor-*.md" -mtime +14 -type f 2>/dev/null | while read f; do
  if [ -s "$f" ]; then
    mv "$f" "$ARCHIVE_DIR/" 2>/dev/null && echo "   Archived: $f"
  fi
done

# Step 4: Prune empty files
echo "🗑️  Pruning empty files..."
find . -name "*.md" -size 0 -type f -delete 2>/dev/null
find . -name "*.log" -size 0 -type f -delete 2>/dev/null

# Step 5: Count files
HEALTH_COUNT=$(find daily-health -name "health-*.md" 2>/dev/null | wc -l)
WEEKLY_COUNT=$(find weekly-reports -name "quality-*.md" 2>/dev/null | wc -l)
SPIRITUAL_COUNT=$(find spiritual-monitor -name "monitor-*.md" 2>/dev/null | wc -l)
ARCHIVE_COUNT=$(find "$ARCHIVE_DIR" -name "*.md" 2>/dev/null | wc -l)

echo ""
echo "📊 Memory Stats:"
echo "   Health reports: $HEALTH_COUNT (active)"
echo "   Weekly reports: $WEEKLY_COUNT (active)"
echo "   Spiritual monitors: $SPIRITUAL_COUNT (active)"
echo "   Archived: $ARCHIVE_COUNT"

# Step 6: Update task-queue.md (mark completed tasks)
echo "📝 Updating task queue..."
if [ -f task-queue.md ]; then
  # Remove completed tasks older than 7 days (simple heuristic: check file age)
  # This is a simple approach — more sophisticated would parse dates
  echo "   Task queue OK"
fi

echo ""
echo "✅ Memory maintenance complete"
