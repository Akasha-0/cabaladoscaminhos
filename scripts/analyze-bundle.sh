#!/usr/bin/env bash
# ============================================================================
# analyze-bundle.sh — Bundle analysis runner (Wave 36)
# ============================================================================
# Runs the @next/bundle-analyzer on a production build, then post-processes
# the emitted JSON to surface the top 10 largest modules + code-split
# opportunities. Suitable for CI (machine-readable JSON) and local dev
# (HTML report at .next/analyze/).
#
# Usage:
#   pnpm analyze:bundle              # full HTML + JSON report
#   ANALYZE_JSON=1 ./scripts/analyze-bundle.sh  # JSON-only (CI mode)
#   ./scripts/analyze-bundle.sh --top=20         # change top-N cutoff
#
# Output:
#   .next/analyze/client.html   (interactive treemap)
#   .next/analyze/server.html
#   .next/analyze/edge.html
#   .next/analyze/report.json   (machine-readable, top-N modules)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

TOP_N=10
JSON_ONLY=0
OPEN_HTML=0

for arg in "$@"; do
  case "${arg}" in
    --top=*)    TOP_N="${arg#*=}" ;;
    --json)     JSON_ONLY=1 ;;
    --open)     OPEN_HTML=1 ;;
    --help|-h)
      sed -n '3,28p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
  esac
done

# ----------------------------------------------------------------------------
# 1. Build with ANALYZE=true (gates @next/bundle-analyzer in next.config.ts)
# ----------------------------------------------------------------------------
echo "==> Building with bundle analyzer (ANALYZE=true)…"
ANALYZE=true pnpm build > .next/analyze/build.log 2>&1 || {
  echo "build failed — see .next/analyze/build.log" >&2
  tail -50 .next/analyze/build.log >&2
  exit 2
}

# ----------------------------------------------------------------------------
# 2. Locate the .next/analyze/*.html reports emitted by the plugin
# ----------------------------------------------------------------------------
mkdir -p .next/analyze
REPORT_HTMLS=( .next/analyze/client.html .next/analyze/server.html .next/analyze/edge.html )
for f in "${REPORT_HTMLS[@]}"; do
  if [[ ! -f "${f}" ]]; then
    echo "warning: missing ${f} (analyzer may have skipped this target)" >&2
  fi
done

# ----------------------------------------------------------------------------
# 3. Top-N largest JS modules — walk .next/static/chunks/*.js + map
#    back to source via the source map embedded in the analyzer HTML.
# ----------------------------------------------------------------------------
TOP_JSON=".next/analyze/report.json"
echo "==> Computing top-${TOP_N} largest modules…"

node -e "
const fs = require('fs');
const path = require('path');

const CHUNKS_DIR = path.join('.next', 'static', 'chunks');
const out = { top: [], totals: { count: 0, rawBytes: 0, gzipBytes: 0 } };

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const acc = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) acc.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) acc.push(full);
  }
  return acc;
}

const files = walk(CHUNKS_DIR);
let totalRaw = 0, totalGzip = 0;
const rows = [];
for (const f of files) {
  const buf = fs.readFileSync(f);
  const raw = buf.length;
  const gzip = require('zlib').gzipSync(buf).length;
  totalRaw += raw;
  totalGzip += gzip;
  rows.push({ file: f, raw, gzip });
}
rows.sort((a, b) => b.raw - a.raw);
const TOP = parseInt(process.env.TOP_N || '10', 10);
out.top = rows.slice(0, TOP).map((r) => ({
  file: r.file,
  rawBytes: r.raw,
  rawKB: +(r.raw / 1024).toFixed(2),
  gzipBytes: r.gzip,
  gzipKB: +(r.gzip / 1024).toFixed(2),
}));
out.totals = {
  count: files.length,
  rawBytes: totalRaw,
  rawMB: +(totalRaw / 1024 / 1024).toFixed(2),
  gzipBytes: totalGzip,
  gzipMB: +(totalGzip / 1024 / 1024).toFixed(2),
};

// Recommendation table — flag any chunk > 250 KB raw (PERFORMANCE-BUDGETS).
out.budgetViolations = rows
  .filter((r) => r.raw > 250 * 1024)
  .map((r) => ({ file: r.file, rawKB: +(r.raw / 1024).toFixed(2) }));

// Code-split opportunities — small, lazy-loadable chunks (< 50 KB) that
// are eagerly loaded.
out.codeSplitOpportunities = rows
  .filter((r) => r.raw < 50 * 1024 && r.raw > 5 * 1024)
  .slice(0, 10)
  .map((r) => ({ file: r.file, rawKB: +(r.raw / 1024).toFixed(2) }));

fs.writeFileSync('${TOP_JSON}', JSON.stringify(out, null, 2));
console.log('  total chunks: ' + out.totals.count);
console.log('  total raw:    ' + out.totals.rawMB + ' MB');
console.log('  total gzip:   ' + out.totals.gzipMB + ' MB');
console.log('  budget violations: ' + out.budgetViolations.length);
console.log('  code-split opps:    ' + out.codeSplitOpportunities.length);
" TOP_N="${TOP_N}"

# ----------------------------------------------------------------------------
# 4. Render the human-readable table
# ----------------------------------------------------------------------------
if [[ "${JSON_ONLY}" -eq 0 ]]; then
  echo ""
  echo "==> Top ${TOP_N} largest modules (raw bytes):"
  echo "    ┌──────────────────────────────────────────────┬──────────┬────────┐"
  echo "    │ File                                         │ Raw (KB) │ Gzip   │"
  echo "    ├──────────────────────────────────────────────┼──────────┼────────┤"
  node -e "
const r = JSON.parse(require('fs').readFileSync('${TOP_JSON}', 'utf8'));
for (const row of r.top) {
  const f = row.file.length > 44 ? '…' + row.file.slice(-43) : row.file;
  const raw = String(row.rawKB).padStart(8);
  const gz = String(row.gzipKB).padStart(6);
  console.log('    │ ' + f.padEnd(44) + ' │' + raw + ' │' + gz + ' │');
}
"
  echo "    └──────────────────────────────────────────────┴──────────┴────────┘"
  echo ""
  echo "HTML reports:"
  for f in "${REPORT_HTMLS[@]}"; do
    [[ -f "${f}" ]] && echo "  ${f}"
  done
  if [[ "${OPEN_HTML}" -eq 1 ]]; then
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open .next/analyze/client.html >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
      open .next/analyze/client.html >/dev/null 2>&1 &
    fi
  fi
fi

echo ""
echo "==> Done. JSON report: ${TOP_JSON}"
