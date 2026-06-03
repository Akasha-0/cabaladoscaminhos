#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== PR Gate ==="
echo "TypeScript: $(npx tsc --noEmit 2>&1 | grep -c 'error' || echo 0) errors"
echo "Lint: $(npm run lint 2>&1 | grep -c 'error' || echo 0) errors"
echo "Tests: $(npm run test:run 2>&1 | grep -oP '\d+(?= failure)' | head -1 || echo 0) failures"
