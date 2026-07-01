/**
 * Cron route — daily AI curation (Wave 29)
 *
 * GET /api/cron/curate-articles
 * Auth: Bearer <CRON_SECRET>  (Vercel Cron / GitHub Actions / any scheduler)
 *
 * Runs curateDaily() across all registered sources and returns a summary.
 * Designed to be cheap, idempotent, and rate-limited. The engine handles
 * its own retry/backoff. This route just wires auth + response.
 */

import { NextRequest, NextResponse } from "next/server";
import { curateDaily, type CurationResult } from "@/lib/curation/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // Vercel function max for cron

// ---------------------------------------------------------------------------
// Auth — same pattern as other cron routes in this repo
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[curation:cron] CRON_SECRET is not configured");
    return false;
  }
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.replace(/^Bearer\s+/i, "");
  const urlSecret = new URL(req.url).searchParams.get("secret");
  // Constant-time compare to avoid timing side-channels
  const a = Buffer.from(bearer, "utf8");
  const e = Buffer.from(expected, "utf8");
  const bearerOk =
    a.length === e.length && timingSafeEqual(Buffer.from(a), Buffer.from(e));
  const urlOk = urlSecret === expected;
  return bearerOk || urlOk;
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const start = Date.now();

  if (!isAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  // Allow dry-run via ?dryRun=1 to skip persistence
  const url = new URL(req.url);
  const includeReview = url.searchParams.get("includeReview") === "1";
  const sourceName = url.searchParams.get("source");
  const dryRun = url.searchParams.get("dryRun") === "1";

  try {
    const { DEFAULT_SOURCES } = await import("@/lib/curation/sources");
    const sources = sourceName
      ? DEFAULT_SOURCES.filter((s) => s.name === sourceName)
      : DEFAULT_SOURCES;

    if (sourceName && sources.length === 0) {
      return NextResponse.json(
        { ok: false, error: "source not found", sourceName },
        { status: 404 }
      );
    }

    const results: CurationResult[] = await curateDaily({
      sources,
      includeReview,
      logger: {
        info: (msg, meta) =>
          console.log(`[curation:cron] ${msg}`, JSON.stringify(meta ?? {})),
        error: (msg, meta) =>
          console.error(`[curation:cron] ${msg}`, JSON.stringify(meta ?? {})),
      },
    });

    const summary = {
      ok: true,
      dryRun,
      includeReview,
      sourceName,
      totalDurationMs: Date.now() - start,
      totalFetched: results.reduce((s, r) => s + r.fetched, 0),
      totalCurated: results.reduce((s, r) => s + r.curated, 0),
      totalRejected: results.reduce((s, r) => s + r.rejected, 0),
      totalReview: results.reduce((s, r) => s + r.review, 0),
      totalErrors: results.reduce((s, r) => s + r.errors.length, 0),
      results,
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (e) {
    console.error("[curation:cron] fatal", e);
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message,
        totalDurationMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST handler — same logic, useful for manual triggering from a service
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  return GET(req);
}