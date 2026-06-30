#!/usr/bin/env bash
# ============================================================================
# run-smoke.sh — Run the TTS smoke test (W72-D)
# ============================================================================
# Usage: bash src/lib/tts/__tests__/run-smoke.sh
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

cd "$ROOT_DIR"

echo "── Akasha W72-D TTS smoke ──"
node --experimental-strip-types --no-warnings \
  src/lib/tts/__tests__/smoke.ts
