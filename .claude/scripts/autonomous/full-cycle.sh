#!/usr/bin/env bash
# Full test + build cycle
cd /home/skynet/cabala-dos-caminhos
echo "=== Full Cycle ==="
echo "Git status: $(git status --short | wc -l) files modified"
echo "Test suite:"
npm run test:run 2>&1 | grep -E "Tests:|Test Suites:" | tail -2
echo "Build:"
npm run build 2>&1 | tail -3
