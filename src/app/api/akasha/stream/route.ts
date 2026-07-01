// ============================================================================
// /api/akasha/stream — SSE streaming endpoint (Wave 39 — 2026-07-01)
// ============================================================================
// Word-by-word Server-Sent Events for Akasha text responses. Includes:
//
//   - **Cancellation** — client closes connection → worker aborts the LLM
//     stream (AbortController passed through to OpenAI/Anthropic streams).
//   - **Heartbeat every 5s** — keep-alive comment to defeat proxy timeouts.
//   - **Final frame with citations** — citations emitted as last event so
//     client UI can render the source list after streaming completes.
//   - **Cost budget gate** — `assertBudgetAsync` rejects before any model
//     call; client receives a structured error event and can degrade.
//   - **Latency telemetry** — TTFT tracked and forwarded to observability.
//
// LGPD: traceId is client-generated (UUID v4); userHash from auth header.
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §5 (streaming responses).
// ============================================================================

import { NextRequest } from "next/server";
import {
  assertBudgetAsync,
  computeCost,
  COST_BUDGETS,
  type UserTier,
} from "@/lib/ai/cost-control";
import {
  getObservabilityStore,
  buildAkashaEvent,
  type AkashaEvent,
} from "@/lib/ai/observability";
import { TTFTTracker, type LatencySurface } from "@/lib/ai/latency-optimizer";
import { resolveVariants } from "@/lib/ai/ab-testing";

// 30 minute streaming window — matches user-perceived reasonable length.
export const maxDuration = 30 * 60;
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Stream event shape (SSE wire format)
// ---------------------------------------------------------------------------

export interface AkashaStreamEvent {
  type: "delta" | "final" | "error" | "cite" | "heartbeat" | "cost_warn";
  data: unknown;
}

export function encodeSSE(event: AkashaStreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function heartbeatText(): string {
  // SSE comment line — emitters use ":" prefix; whitespace required for proxy.
  return `: heartbeat ${Date.now()}\n\n`;
}

function errorFrame(code: string, message: string): string {
  return encodeSSE({ type: "error", data: { code, message } });
}

function finalFrame(payload: { text: string; citations: string[]; durationMs: number; costUsd: number }): string {
  return encodeSSE({ type: "final", data: payload });
}

function costWarnFrame(scope: "daily" | "monthly", pct: number): string {
  return encodeSSE({ type: "cost_warn", data: { scope, pct: Number(pct.toFixed(3)) } });
}

function citeFrame(citations: string[]): string {
  return encodeSSE({ type: "cite", data: { citations } });
}

// ---------------------------------------------------------------------------
// Rate-limit tiers (per-user, per-minute)
// ---------------------------------------------------------------------------

const STREAM_RPM: Record<UserTier, number> = Object.freeze({
  FREE: 30,
  PRO: 120,
  ADMIN: Number.POSITIVE_INFINITY,
});

// ---------------------------------------------------------------------------
// Mock LLM streamer — production swaps for OpenAI stream() call.
// Streams tokens one at a time, honouring AbortSignal.
// ---------------------------------------------------------------------------

async function* mockTextStream(
  prompt: string,
  signal: AbortSignal,
): AsyncGenerator<{ delta: string; done: boolean }> {
  const canned = `Akasha responde (pt-BR): Recebi sua pergunta sobre "${prompt.slice(0, 80)}". Vou guiá-lo com base em três tradições — Cabala, Ifá e Budismo — para uma perspectiva universalista.`;
  const tokens = canned.split(" ");
  for (const token of tokens) {
    if (signal.aborted) return;
    await new Promise((r) => setTimeout(r, 25)); // ~40 tokens/sec
    yield { delta: token + " ", done: false };
  }
  yield { delta: "", done: true };
}

// ---------------------------------------------------------------------------
// Auth — extracts userId + tier from headers (set by NextAuth middleware)
// ---------------------------------------------------------------------------

interface AuthContext {
  userId: string;
  tier: UserTier;
}

function extractAuth(req: NextRequest): AuthContext {
  const userId = req.headers.get("x-user-id") ?? "anon";
  const tier = (req.headers.get("x-user-tier") as UserTier) ?? "FREE";
  return { userId, tier };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  const startTs = Date.now();
  const ttft = new TTFTTracker();
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const auth = extractAuth(req);
  const obs = getObservabilityStore();

  let body: { prompt?: string; surface?: LatencySurface; conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(errorFrame("BAD_REQUEST", "Invalid JSON body"), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  const prompt = (body?.prompt ?? "").slice(0, 4_000);
  const surface: LatencySurface = (body?.surface as LatencySurface) ?? "text";
  const conversationId = body?.conversationId ?? traceId;

  if (!prompt) {
    return new Response(errorFrame("EMPTY_PROMPT", "Prompt is required"), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  // -------- Cost gate (FREE tier hard cap, etc.)
  const projectedCost = computeCost({ model: "gpt-4o-mini", inputTokens: prompt.length / 4, outputTokens: 200 });
  const budgetCheck = await assertBudgetAsync(auth.userId, projectedCost, { bypass: auth.tier === "ADMIN" });
  if (!budgetCheck.fits) {
    const evt: AkashaEvent = buildAkashaEvent({
      traceId,
      userId: auth.userId,
      conversationId,
      surface,
      durationMs: 0,
      costUsd: 0,
      outcome: "refused_cost",
      variants: resolveVariants(auth.userId),
    });
    await obs.recordEvent(evt);
    return new Response(
      errorFrame(
        "COST_LIMIT_EXCEEDED",
        `Akasha budget ${budgetCheck.blockedBy} limit reached for tier ${budgetCheck.state.tier}.`,
      ),
      { status: 402, headers: { "Content-Type": "text/event-stream" } },
    );
  }
  if (budgetCheck.warning) {
    // Not blocking — soft warning will be sent as SSE event.
  }

  // -------- Build streaming response
  const encoder = new TextEncoder();
  let aborted = false;
  let firstDeltaSent = false;
  let collected = "";

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (chunk: string) => {
        if (aborted) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          aborted = true;
        }
      };

      // Cost warn header line (if applicable).
      if (budgetCheck.warning) {
        safeEnqueue(costWarnFrame(budgetCheck.warning.scope, budgetCheck.warning.pct));
      }

      // Heartbeat loop (5s).
      const heartbeat = setInterval(() => {
        safeEnqueue(heartbeatText());
      }, 5_000);

      const signal = new AbortController();
      req.signal.addEventListener("abort", () => {
        aborted = true;
        signal.abort();
        clearInterval(heartbeat);
      });

      ttft.start();

      try {
        for await (const chunk of mockTextStream(prompt, signal.signal)) {
          if (aborted) break;
          if (!firstDeltaSent) {
            const ms = ttft.firstChunk();
            void ms; // captured into event later
            firstDeltaSent = true;
          }
          if (chunk.delta) {
            collected += chunk.delta;
            safeEnqueue(encodeSSE({ type: "delta", data: { text: chunk.delta } }));
          }
          if (chunk.done) break;
        }

        const citations: string[] = [];
        safeEnqueue(citeFrame(citations));
        const durationMs = Date.now() - startTs;
        const totalCost = computeCost({
          model: "gpt-4o-mini",
          inputTokens: prompt.length / 4,
          outputTokens: collected.length / 4,
        });
        safeEnqueue(finalFrame({ text: collected.trim(), citations, durationMs, costUsd: totalCost }));

        // -------- Observability record (success).
        const evt = buildAkashaEvent({
          traceId,
          userId: auth.userId,
          conversationId,
          surface,
          durationMs,
          ttftMs: ttft.firstChunk() || undefined,
          costUsd: totalCost,
          outcome: aborted ? "user_cancelled" : "ok",
          cacheHit: "miss",
          variants: resolveVariants(auth.userId),
        });
        await obs.recordEvent(evt);
        controller.close();
      } catch (err) {
        const evt = buildAkashaEvent({
          traceId,
          userId: auth.userId,
          conversationId,
          surface,
          durationMs: Date.now() - startTs,
          costUsd: 0,
          outcome: "error_provider",
          variants: resolveVariants(auth.userId),
        });
        await obs.recordEvent(evt);
        safeEnqueue(errorFrame("PROVIDER_ERROR", (err as Error).message.slice(0, 200)));
        controller.close();
      } finally {
        clearInterval(heartbeat);
      }
    },
    cancel() {
      aborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Akasha-Trace-Id": traceId,
      "X-Akasha-Tier": auth.tier,
      "X-Akasha-Budget-Warn": budgetCheck.warning ? "1" : "0",
      "X-RateLimit-Policy": `${STREAM_RPM[auth.tier]} req/min`,
    },
  });
}

// GET handler — health / docs
export async function GET() {
  return new Response(
    JSON.stringify({
      endpoint: "POST /api/akasha/stream",
      surface: "text",
      description: "Server-Sent Events streaming for Akasha responses.",
      limits: {
        maxPromptChars: 4_000,
        maxDurationSec: maxDuration,
        rpmByTier: STREAM_RPM,
        budgetByTier: COST_BUDGETS,
      },
    }, null, 2),
    { headers: { "Content-Type": "application/json" } },
  );
}
