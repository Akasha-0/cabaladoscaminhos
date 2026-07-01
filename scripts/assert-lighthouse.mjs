#!/usr/bin/env node
// ============================================================================
// assert-lighthouse.mjs — CI gate for Lighthouse CI runs (Wave 36)
// ============================================================================
// Reads the LHCI manifest.json emitted by `treosh/lighthouse-ci-action`
// and asserts that every category score meets the configured minimum.
// Used by .github/workflows/lighthouse.yml to fail the PR if Lighthouse
// regresses on any of the audited routes.
//
// Usage:
//   node scripts/assert-lighthouse.mjs \
//     --input=.lighthouseci/manifest.json \
//     --min-perf=95 \
//     --min-a11y=95 \
//     --min-best=95 \
//     --min-seo=95 \
//     --url-suffix=/feed \
//     --profile=mobile
//
// Exit codes:
//   0 = all assertions pass
//   1 = at least one assertion failed
//   2 = input file missing or malformed
// ============================================================================

import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.slice(2).split("=");
      return [k, rest.join("=")];
    }),
);

const INPUT = args.input ?? ".lighthouseci/manifest.json";
const MIN_PERF = Number(args["min-perf"] ?? "95");
const MIN_A11Y = Number(args["min-a11y"] ?? "95");
const MIN_BEST = Number(args["min-best"] ?? "95");
const MIN_SEO = Number(args["min-seo"] ?? "95");
const URL_SUFFIX = args["url-suffix"] ?? "";
const PROFILE = args.profile ?? "mobile";

// ---------------------------------------------------------------------------
// Read manifest
// ---------------------------------------------------------------------------

let manifest;
try {
  manifest = JSON.parse(readFileSync(INPUT, "utf8"));
} catch (err) {
  console.error(`[assert-lighthouse] failed to read ${INPUT}:`, err.message);
  process.exit(2);
}

// LHCI manifest format: array of {url, isRepresentativeRun, jsonPath, ...}
const runs = Array.isArray(manifest) ? manifest : [manifest];

// ---------------------------------------------------------------------------
// Assert
// ---------------------------------------------------------------------------

const failures = [];
const checks = [
  { name: "performance", min: MIN_PERF, score: "performance" },
  { name: "accessibility", min: MIN_A11Y, score: "accessibility" },
  { name: "best-practices", min: MIN_BEST, score: "best-practices" },
  { name: "seo", min: MIN_SEO, score: "seo" },
];

for (const run of runs) {
  const url = run.url ?? run.finalDisplayedUrl ?? "unknown";
  if (URL_SUFFIX && !url.endsWith(URL_SUFFIX)) continue;

  // Read the actual lhr.json file pointed to by jsonPath.
  let lhr;
  try {
    lhr = JSON.parse(readFileSync(run.jsonPath, "utf8"));
  } catch (err) {
    failures.push({ url, error: `could not read ${run.jsonPath}: ${err.message}` });
    continue;
  }

  const categories = lhr.categories ?? {};
  for (const c of checks) {
    const score100 = (categories[c.score]?.score ?? 0) * 100;
    if (score100 < c.min) {
      failures.push({
        url,
        profile: PROFILE,
        category: c.name,
        score: score100.toFixed(1),
        minRequired: c.min,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (failures.length === 0) {
  console.log(`[assert-lighthouse] ✅ all checks pass (${PROFILE}${URL_SUFFIX})`);
  process.exit(0);
}

console.error(`[assert-lighthouse] ❌ ${failures.length} check(s) failed:`);
for (const f of failures) {
  if (f.error) {
    console.error(`  - ${f.url}: ${f.error}`);
  } else {
    console.error(
      `  - ${f.url} (${f.profile}) :: ${f.category} = ${f.score} < ${f.minRequired}`,
    );
  }
}
process.exit(1);
