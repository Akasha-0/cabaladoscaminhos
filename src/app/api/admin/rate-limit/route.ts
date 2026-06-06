import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/error-handling";
import { rateLimitMonitor } from "@/lib/rate-limit-monitor";
import { requireOperator } from "@/lib/auth/operator-session";
export const dynamic = "force-dynamic";
export const GET = withErrorHandler(async (req: NextRequest) => {
  const authResult = await requireOperator(req);
  if (authResult instanceof Response) {
    return authResult;
  }
  const { searchParams } = req.nextUrl;
  const windowMs = Number(searchParams.get("window")) || 3600000;
  const stats = rateLimitMonitor.getStats(windowMs);
  const health = rateLimitMonitor.getHealth();
  return Response.json({ stats, health });
});