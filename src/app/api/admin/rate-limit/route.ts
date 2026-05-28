import type { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/error-handling";
import { rateLimitMonitor } from "@/lib/rate-limit-monitor";

 
export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const windowMs = Number(searchParams.get("window")) || 3600000;

  const stats = rateLimitMonitor.getStats(windowMs);
  const health = rateLimitMonitor.getHealth();

  return Response.json({ stats, health });
});
