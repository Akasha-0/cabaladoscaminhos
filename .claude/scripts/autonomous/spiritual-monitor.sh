#!/usr/bin/env bash
cd /home/skynet/cabala-dos-caminhos
echo "=== Spiritual Monitor ==="
echo "GOAL.md: $(wc -c < GOAL.md) bytes, $(grep -c '^##' GOAL.md) sections"
echo "IDEIA TODOs: $(grep -c 'TODO\|FIXME' IDEIA.md || echo 0)"
echo "Engine TODOs: $(grep -r 'TODO\|FIXME' src/lib/ 2>/dev/null | wc -l)"
