/**
 * GET /api/health — Health check (Wave 11)
 * ============================================================================
 * Endpoint usado por uptime checks externos (UptimeRobot, Cronitor, etc).
 *
 * Verificacoes executadas em paralelo:
 *   1. database   — Prisma `SELECT 1` (timeout 2s)
 *   2. openai     — list models (timeout 3s) OU ping por env key presence
 *   3. supabase   — getUser() anon ou ping REST /health (timeout 2s)
 *   4. posthog    — fetch /_health (timeout 3s)
 *
 * Response shape:
 *   {
 *     status: 'ok' | 'degraded',
 *     timestamp: 'ISO',
 *     version: 'git-sha-or-version',
 *     uptime: number (seconds),
 *     checks: {
 *       database: { ok, latencyMs, error? },
 *       openai:   { ok, latencyMs, error? },
 *       supabase: { ok, latencyMs, error? },
 *       posthog:  { ok, latencyMs, error? },
 *     }
 *   }
 *
 * HTTP status:
 *   - 200: ok (todos os checks passam ou sao opcionais)
 *   - 503: degraded (algum check CRITICO falhou — database, openai)
 *
 * Configuracao (env):
 *   - HEALTH_REQUIRE_ALL=true  → 503 se QUALQUER check falhar
 *   - HEALTH_REQUIRE_ALL=false (default) → 503 so' se database ou openai falharem
 *
 * Sem autenticacao (necessario para UptimeRobot), mas com rate-limit interno.
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { checkPostHogHealth } from "@/lib/monitoring/posthog";
import { snapshot } from "@/lib/monitoring/metrics";
import { logger } from "@/lib/logging";
import { withLogging } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckResult {
  ok: boolean;
  latencyMs: number;
  error?: string;
  /** Optional metadata (e.g. model, region). */
  meta?: Record<string, unknown>;
}

const START_TIME = Date.now();

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  if (!process.env.DATABASE_URL) {
    return { ok: false, latencyMs: 0, error: "DATABASE_URL not set" };
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    try {
      // Prisma nao expoe AbortSignal nativo, entao usamos uma Promise.race
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]);
      return { ok: true, latencyMs: Date.now() - start };
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: String(err) };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const start = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, latencyMs: 0, error: "OPENAI_API_KEY not set" };
  }
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      return { ok: false, latencyMs: Date.now() - start, error: `HTTP ${response.status}` };
    }
    return {
      ok: true,
      latencyMs: Date.now() - start,
      meta: { model: process.env.OPENAI_MODEL ?? "gpt-4o" },
    };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: String(err) };
  }
}

async function checkSupabase(): Promise<CheckResult> {
  const start = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return { ok: false, latencyMs: 0, error: "NEXT_PUBLIC_SUPABASE_URL not set" };
  }
  try {
    // Ping simples no endpoint REST do Supabase
    const response = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) {
      return { ok: false, latencyMs: Date.now() - start, error: `HTTP ${response.status}` };
    }
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const requireAll = process.env.HEALTH_REQUIRE_ALL === "true";

async function handler(request: NextRequest): Promise<NextResponse> {
  // Executa checks em paralelo
  const [database, openai, supabase, posthog] = await Promise.all([
    checkDatabase(),
    checkOpenAI(),
    checkSupabase(),
    checkPostHogHealth(),
  ]);

  const checks = { database, openai, supabase, posthog };

  // Determina status geral
  const criticalDown = !database.ok || !openai.ok;
  const anyDown = Object.values(checks).some((c) => !c.ok);
  const status: "ok" | "degraded" = requireAll ? (anyDown ? "degraded" : "ok") : criticalDown ? "degraded" : "ok";

  const body = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? process.env.SENTRY_RELEASE ?? "unknown",
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    checks,
    /** Pequeno subset de metric snapshot (top 10). */
    metrics: snapshot().slice(0, 10),
  };

  if (status === "degraded") {
    logger.warn("[health] degraded", {
      database: database.ok,
      openai: openai.ok,
      supabase: supabase.ok,
      posthog: posthog.ok,
    });
  }

  return NextResponse.json(body, {
    status: status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const GET = withLogging(handler as unknown as (request: Request) => Promise<Response>, { path: "/api/health" });