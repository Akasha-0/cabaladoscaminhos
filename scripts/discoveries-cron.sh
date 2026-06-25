#!/usr/bin/env bash
# discoveries-cron.sh - Wave 24.1
# Wrapper CLI for /api/discoveries/cron.
# LGPD: does not touch PII. Does not log CRON_SECRET.
#
# Usage:
#   BASE_URL=https://akasha.example.com ./discoveries-cron.sh
#   MAX_INSIGHTS=5 BASE_URL=... ./discoveries-cron.sh
#
# Exit codes:
#   0 = HTTP 200 (job ran — see body for status)
#   1 = missing CRON_SECRET
#   2 = HTTP non-200
#   3 = curl failure
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/discoveries/cron"

# Build Authorization header value WITHOUT leaking secret into process listing.
# We resolve secret first, then use --header "@-" style via heredoc to feed curl.
SECRET_VALUE=""
if [[ -n "${VERCEL_CRON_SECRET:-}" ]]; then
  SECRET_VALUE="${VERCEL_CRON_SECRET}"
elif [[ -n "${CRON_SECRET:-}" ]]; then
  SECRET_VALUE="${CRON_SECRET}"
else
  echo "missing-secret" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl-missing" >&2
  exit 1
fi

# Build optional body JSON
BODY=""
if [[ -n "${MAX_INSIGHTS:-}" ]]; then
  BODY="{\"maxInsights\":${MAX_INSIGHTS}}"
fi

echo "[cron] POST ${ENDPOINT}"

# Use a header file to keep the secret out of 'ps' output.
HDR_FILE="$(mktemp)"
printf 'Authorization: Bearer %s\nContent-Type: application/json\n' "${SECRET_VALUE}" > "${HDR_FILE}"
trap 'rm -f "${HDR_FILE}"' EXIT

HTTP_CODE=$(curl -sS -o /tmp/r.json -w '%{http_code}' \
  -X POST \
  -H "@${HDR_FILE}" \
  ${BODY:+-d "${BODY}"} \
  --max-time 300 \
  "${ENDPOINT}" 2>/dev/null) || { echo "curl-fail"; exit 3; }

if [[ -f /tmp/r.json ]]; then
  # Print summary (insightsGenerated + status) but NOT the full body
  # (contains potential errors that may include technical detail).
  if command -v jq >/dev/null 2>&1; then
    SUMMARY=$(jq -c '{ok, insightsGenerated, papersCited, status, errors: (.errors | length)}' /tmp/r.json 2>/dev/null || cat /tmp/r.json)
    echo "[cron] result: ${SUMMARY}"
  else
    echo "[cron] result saved to /tmp/r.json"
  fi
  rm -f /tmp/r.json
fi

if [[ "${HTTP_CODE}" != "200" ]]; then
  exit 2
fi

exit 0
