#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Daily Standup ==="
echo "Test suite:"
npm run test:run 2>&1 | grep -E "Tests:|passing|failure" | tail -3
echo "Build:"
npm run build 2>&1 | tail -3
