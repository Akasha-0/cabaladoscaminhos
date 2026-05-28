#!/bin/bash
export JWT_SECRET='test-secret-key-that-is-at-least-32-bytes-long'
timeout 30 npx vitest run -c vitest.jwt.config.ts 2>&1 | tail -10
echo "Exit: $?"
