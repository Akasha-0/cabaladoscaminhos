import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { getRedisClient } from '@/lib/infrastructure/redis';
import { getUptimeSeconds } from '@/lib/shared/uptime';

// ─── Constants ──────────────────────────────────────────────────────────────

const APP_VERSION = process.env.npm_package_version ?? '0.1.0';

// Per-check time budget. Health checks must be fast — they sit on
// the hot path of every load balancer probe. 1.5s is generous enough
// for cold Prisma connections but still keeps the overall response
// under the 5s ceiling required by the Wave 12 plan.
const CHECK_TIMEOUT_MS = 1500;

/**
 * Resolve build metadata from environment variables.
 *
 * Vercel/GitHub Actions inject these at deploy time. We resolve
 * fresh on each request (instead of capturing at module load) so
 * tests can stub env vars without reloading the module.
 */
function resolveBuildInfo(): BuildInfo {
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    process.env.BUILD_COMMIT ??
    'unknown';
  const timestamp =
    process.env.VERCEL_GIT_COMMIT_DATE ??
    process.env.BUILD_TIMESTAMP ??
    new Date(0).toISOString();
  const env = process.env.NODE_ENV ?? 'development';
  return { commit, timestamp, env };
}

// ─── Types ──────────────────────────────────────────────────────────────────

type ServiceStatus = 'ok' | 'error' | 'unknown';

interface ServiceCheck {
  status: ServiceStatus;
  latencyMs?: number;
  /** Human-readable detail — safe for monitoring tools, NOT for users. */
  detail?: string;
}

interface BuildInfo {
  commit: string;
  timestamp: string;
  env: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  build: BuildInfo;
  services: {
    db: ServiceCheck;
    redis: ServiceCheck;
    llm: ServiceCheck;
    mcp: ServiceCheck;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Race a promise against a timeout. Used so that a slow Prisma or
 * network call can never block the health endpoint past the budget.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Wraps a check so it always resolves (never rejects). Failures
 * become `{ status: 'error', detail: <message> }` so a single broken
 * dependency can't cascade into a 500 from the route itself.
 */
async function safeCheck(
  label: string,
  run: () => Promise<ServiceCheck>
): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const result = await withTimeout(run(), CHECK_TIMEOUT_MS, label);
    return { ...result, latencyMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 'error',
      latencyMs: Date.now() - start,
      detail: message,
    };
  }
}

// ─── Individual checks ─────────────────────────────────────────────────────

async function checkDb(): Promise<ServiceCheck> {
  await prisma.$queryRaw`SELECT 1`;
  return { status: 'ok' };
}

async function checkRedis(): Promise<ServiceCheck> {
  const client = await getRedisClient();
  await client.ping();
  return { status: 'ok' };
}

/**
 * LLM provider probe — runs `createProvider()` which auto-detects the
 * configured provider. We don't make a full inference call (would cost
 * tokens + take seconds); instead we verify the factory returns a
 * real provider and capture which one was selected.
 *
 * Provider selection priority (mirrors `packages/mentor/src/llm/index.ts`):
 *   1. Ollama (local)   — if reachable on its port
 *   2. MiniMax M3 (F-236) — if MINIMAX_API_TOKEN is set
 *   3. OpenAI           — if OPENAI_API_KEY is set
 *   4. Mock             — dev/test fallback (always succeeds)
 */
async function checkLlm(): Promise<ServiceCheck> {
  // Lazy import so the health endpoint never pulls in the LLM client
  // graph during cold start if it isn't used by anything else.
  const { createProvider } = await import('@akasha/mentor/llm');
  const provider = await createProvider({
    openaiApiKey: process.env.OPENAI_API_KEY,
    ollamaUrl: process.env.OLLAMA_URL,
    minimaxApiKey: process.env.MINIMAX_API_TOKEN,
    minimaxModel: process.env.MENTOR_MODEL,
  });
  return {
    status: 'ok',
    detail: `${provider.name}/${provider.model}`,
  };
}

/**
 * MCP server probe — verifies the MCP package can construct a server
 * instance and reports the registered tool count. MCP is optional in
 * Wave 12.2 (types-only package; runtime came in Wave 8). We treat
 * "package not yet initialized" as `unknown`, NOT as an error, so
 * the endpoint stays green on environments that haven't enabled MCP.
 */
async function checkMcp(): Promise<ServiceCheck> {
  try {
    const mcpModule = await import('@akasha/mcp');
    const server = await mcpModule.getMcpServer();
    const registry = server.getRegistry();
    return {
      status: 'ok',
      detail: `${registry.serverName}@${registry.serverVersion} (tools=${registry.tools.size})`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // MCP is optional — distinguish "not configured" from real failure.
    if (/not implemented|not configured|ENOTFOUND/i.test(message)) {
      return { status: 'unknown', detail: message };
    }
    return { status: 'error', detail: message };
  }
}

// ─── Handler ───────────────────────────────────────────────────────────────

export async function GET() {
  // Run all checks concurrently. Each is bounded by CHECK_TIMEOUT_MS,
  // so the whole response is bounded by that ceiling + scheduling jitter.
  const [db, redis, llm, mcp] = await Promise.all([
    safeCheck('db', checkDb),
    safeCheck('redis', checkRedis),
    safeCheck('llm', checkLlm),
    safeCheck('mcp', checkMcp),
  ]);

  // Roll-up rule:
  //   any `error`  → top-level `error`   (HTTP 503)
  //   any `unknown` → top-level `degraded` (HTTP 200, flag for ops)
  //   all `ok`     → top-level `ok`     (HTTP 200)
  let rollup: HealthResponse['status'] = 'ok';
  const serviceStatuses = [db.status, redis.status, llm.status, mcp.status];
  if (serviceStatuses.some((s) => s === 'error')) {
    rollup = 'error';
  } else if (serviceStatuses.some((s) => s === 'unknown')) {
    rollup = 'degraded';
  }

  const body: HealthResponse = {
    status: rollup,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    uptime: getUptimeSeconds(),
    build: resolveBuildInfo(),
    services: { db, redis, llm, mcp },
  };

  return NextResponse.json(body, {
    status: rollup === 'error' ? 503 : 200,
    headers: {
      // Monitoring endpoints must always reflect current state — no
      // cache anywhere (browser, CDN, proxy).
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}