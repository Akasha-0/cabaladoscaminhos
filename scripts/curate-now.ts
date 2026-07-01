#!/usr/bin/env tsx
/**
 * CLI — manually trigger the curation engine.
 *
 * Usage:
 *   pnpm curate                              # run all default sources
 *   pnpm curate --source=pubmed-meditation   # run one source
 *   pnpm curate --include-review             # also persist REVIEW articles
 *   pnpm curate --dry-run                    # fetch + score, don't persist
 *   pnpm curate --list                       # list registered sources
 *   pnpm curate --help
 *
 * Requires the same env vars as the cron route (OPENAI_API_KEY or the
 * minimax module loaded). Output is JSON to stdout, suitable for piping
 * to `jq` or capturing in CI.
 */

// tsx runs this directly via `pnpm curate` (see package.json bin entry)
import { curateDaily, curateSource, listSources } from "../src/lib/curation/engine";
import type { CurationSource } from "../src/lib/curation/engine";

// ---------------------------------------------------------------------------
// Tiny argv parser — no deps, just enough for this CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out["dry-run"] = true;
    else if (arg === "--include-review") out["include-review"] = true;
    else if (arg === "--list") out.list = true;
    else if (arg.startsWith("--")) {
      const [k, v] = arg.slice(2).split("=");
      out[k] = v ?? true;
    }
  }
  return out;
}

function printHelp() {
  console.log(`cabala-dos-caminhos — curate-now

Usage:
  pnpm curate                              Run all default sources
  pnpm curate --source=<name>              Run a single source
  pnpm curate --include-review             Persist REVIEW articles too
  pnpm curate --dry-run                    Fetch + score, don't persist
  pnpm curate --list                       List registered sources
  pnpm curate --help                       Show this help

Environment:
  OPENAI_API_KEY         Required if the minimax wrapper is not configured.
  CURATION_MODEL         Optional model override (default: gpt-4o-mini).
  CURATION_LEDGER_PATH   Where to append the JSONL ledger when DB is offline.
  CRON_SECRET            Not required for the CLI (no auth needed locally).
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    const sources = listSources();
    console.log(JSON.stringify({ count: sources.length, sources }, null, 2));
    process.exit(0);
  }

  const includeReview = Boolean(args["include-review"]);
  const dryRun = Boolean(args["dry-run"]);
  const sourceName = typeof args.source === "string" ? args.source : undefined;

  console.error(`[curate-now] starting`);
  console.error(`  source:       ${sourceName ?? "(all)"}`);
  console.error(`  includeReview: ${includeReview}`);
  console.error(`  dryRun:        ${dryRun}`);

  const start = Date.now();

  let results;
  if (sourceName) {
    const r = await curateSource(sourceName, {
      includeReview,
      logger: {
        info: (msg, meta) =>
          console.error(`[curate-now] ${msg}`, JSON.stringify(meta ?? {})),
        error: (msg, meta) =>
          console.error(`[curate-now:error] ${msg}`, JSON.stringify(meta ?? {})),
      },
    });
    results = r ? [r] : [];
  } else {
    results = await curateDaily({
      includeReview,
      logger: {
        info: (msg, meta) =>
          console.error(`[curate-now] ${msg}`, JSON.stringify(meta ?? {})),
        error: (msg, meta) =>
          console.error(`[curate-now:error] ${msg}`, JSON.stringify(meta ?? {})),
      },
    });
  }

  const summary = {
    durationMs: Date.now() - start,
    sourceName: sourceName ?? "(all)",
    includeReview,
    dryRun,
    totalFetched: results.reduce((s, r) => s + r.fetched, 0),
    totalCurated: results.reduce((s, r) => s + r.curated, 0),
    totalRejected: results.reduce((s, r) => s + r.rejected, 0),
    totalReview: results.reduce((s, r) => s + r.review, 0),
    totalErrors: results.reduce((s, r) => s + r.errors.length, 0),
    results,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.error(`[curate-now] done in ${summary.durationMs}ms`);

  // Non-zero exit if any source errored (useful for CI)
  const fatal = results.some((r) => r.errors.length > 0 && r.fetched === 0);
  process.exit(fatal ? 1 : 0);
}

main().catch((e) => {
  console.error("[curate-now] fatal:", e);
  process.exit(2);
});