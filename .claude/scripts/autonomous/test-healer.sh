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
