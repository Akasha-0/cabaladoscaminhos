#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Weekly Quality ==="
npm run quality 2>&1 | tail -5
echo "Tests:"
npm run test:run 2>&1 | tail -3
echo "Commits this week: $(git log --since='7 days ago' --oneline | wc -l)"
