#!/usr/bin/env bash
# literature-ingest-cron.sh - Wave 23.1
# Wrapper CLI for /api/literature/ingest/cron.
# LGPD: does not touch PII. Does not log CRON_SECRET.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/literature/ingest/cron"

# Get CRON_SECRET (priority: VERCEL_CRON_SECRET > CRON_SECRET)
SECRET_VALUE=""
if [[ -n "${VERCEL_CRON_SECRET:-}" ]]; then
  SECRET_VALUE="${VERCEL_CRON_SECRET}"
elif [[ -n "${CRON_SECRET:-}" ]]; then
  SECRET_VALUE="${CRON_SECRET}"
else
  echo "missing-secret" >&2
  exit 1
fi

# Build Authorization header value (Bearer prefix)
AUTH_VALUE="Bearer ${SECRET_VALUE}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl-missing" >&2
  exit 1
fi

BODY=""
if [[ -n "${QUERIES:-}" ]]; then
  # Build JSON array manually
  IFS=',' read -ra _ARR <<< "${QUERIES}"
  _Q="["
  for _i in "${_ARR[@]}"; do
    _Q="${_Q%[,]}"  # strip trailing comma from previous
    _Q="${_Q}"${_i}","
  done
  _Q="${_Q%,}"  # strip final trailing comma
  _Q="${_Q}]"
  BODY="{"queries":${_Q}}"
fi

echo "[cron] POST ${ENDPOINT}"

# Use -H with variable expansion (no literal "***" pattern)
HTTP_CODE=$(curl -sS -o /tmp/r.json -w '%{http_code}' \
  -X POST \
  -H "Authorization: ${AUTH_VALUE}" \
  -H "Content-Type: application/json" \
  ${BODY:+-d "${BODY}"} \
  --max-time 300 \
  "${ENDPOINT}" 2>/dev/null) || { echo "curl-fail"; exit 3; }

rm -f /tmp/r.json

if [[ "${HTTP_CODE}" != "200" ]]; then
  exit 2
fi

exit 0
