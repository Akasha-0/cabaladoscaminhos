// ============================================================================
// /api/admin/ai/metrics — Akasha observability metrics (Wave 39 — 2026-07-01)
// ============================================================================
// GET → aggregate metrics across surfaces (latency, cost, SLO, refusals).
// Admin-only (role-gated). No PII in response (LGPD Art. 18).
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §11 (admin metrics endpoint).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getObservabilityStore } from "@/lib/ai/observability";
import { LATENCY_TARGETS } from "@/lib/ai/latency-optimizer";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = new Set(["ADMIN", "OWNER", "CURATION_LEAD"]);

interface AdminContext {
  isAdmin: boolean;
  userId: string;
}

function extractAdminContext(req: NextRequest): AdminContext {
  const role = req.headers.get("x-user-role") ?? "";
  const userId = req.headers.get("x-user-id") ?? "anon";
  return { isAdmin: ADMIN_ROLES.has(role), userId };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = extractAdminContext(req);
  if (!ctx.isAdmin) {
    return NextResponse.json(
      { error: "forbidden", message: "Admin role required" },
      { status: 403 },
    );
  }
  const store = getObservabilityStore();
  const url = new URL(req.url);
  const includeRecent = url.searchParams.get("recent") === "1";

  const agg = store.aggregate();
  const histograms = {
    text: store.histogram("text"),
    voice: store.histogram("voice"),
    image: store.histogram("image"),
  };

  return NextResponse.json({
    timeframe: "24h",
    generatedAt: new Date().toISOString(),
    metrics: agg,
    histograms,
    sloTargets: LATENCY_TARGETS,
    recentEvents: includeRecent ? store.recentEvents(50) : undefined,
    recentFeedback: includeRecent ? store.recentFeedback(50) : undefined,
  });
}
