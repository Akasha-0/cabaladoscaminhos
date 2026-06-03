#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Hourly Cycle ==="
echo "Git: $(git status --short | wc -l) files"
echo "Daemon: $(ps aux | grep -c 'claude.*daemon' || echo 0) processes"
echo "TypeScript errors: $(npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo 0)"
