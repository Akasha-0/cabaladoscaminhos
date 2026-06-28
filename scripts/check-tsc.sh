#!/bin/bash
# TypeScript check wrapper — defensive against hung env
cd /workspace/cabaladoscaminhos
echo "=== TSC START $(date) ==="
timeout 80 ./node_modules/.bin/tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt | tail -100
echo "=== TSC EXIT $? ==="
echo "=== TOTAL LINES: $(wc -l < /tmp/tsc-output.txt) ==="
