// ============================================================================
// /api/akasha/image — Image upload + vision endpoint (Wave 39 — 2026-07-01)
// ============================================================================
// Accepts a base64 image, runs:
//
//   1. Image preprocessing plan (max 2048px, strip GPS).
//   2. NSFW pre-check (W36-5 model stub).
//   3. Vision model call with provider fallback (Claude → GPT-4o).
//   4. Alt-text generation (pt-BR default).
//   5. Cost gate (vision pricing).
//
// Reference: docs/AKASHA-PRODUCTION-W39.md §7 + §11.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  assertBudgetAsync,
  computeCost,
} from "@/lib/ai/cost-control";
import {
  planPreprocess,
  nsfwScore,
  buildAltText,
  hashImageBuffer,
  nextVisionProvider,
  buildVisionResponse,
  type VisionProvider,
  type VisionResponse,
} from "@/lib/ai/image/processing";
import { buildAkashaEvent, getObservabilityStore } from "@/lib/ai/observability";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB hard cap

interface ImageRequestBody {
  imageBase64?: string;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  prompt?: string;
  locale?: "pt-BR" | "en";
}

interface ImageResponseBody {
  altText: string;
  vision: VisionResponse;
  nsfw: { score: number; flagged: boolean };
  preprocess: {
    targetWidth: number;
    targetHeight: number;
    gpsStripped: boolean;
  };
  costUsd: number;
  durationMs: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTs = Date.now();
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const userId = req.headers.get("x-user-id") ?? "anon";
  const tier = (req.headers.get("x-user-tier") as "FREE" | "PRO" | "ADMIN") ?? "FREE";
  const obs = getObservabilityStore();

  let body: ImageRequestBody;
  try {
    body = (await req.json()) as ImageRequestBody;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.imageBase64 || !body.mimeType) {
    return NextResponse.json({ error: "bad_request", message: "imageBase64 + mimeType required" }, { status: 400 });
  }

  let buf: Buffer;
  try {
    buf = Buffer.from(body.imageBase64, "base64");
  } catch (err) {
    return NextResponse.json({ error: "decode_failed", message: (err as Error).message }, { status: 400 });
  }
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  // -------- NSFW pre-check (pure, hash-based stub)
  const imageHash = hashImageBuffer(buf);
  const nsfw = nsfwScore({ imageHash, altText: body.prompt ?? "" });
  if (nsfw.flagged) {
    await obs.recordEvent(buildAkashaEvent({
      traceId, userId, conversationId: traceId, surface: "image",
      durationMs: Date.now() - startTs, costUsd: 0, outcome: "refused_safety",
    }));
    return NextResponse.json(
      { error: "nsfw_flagged", score: nsfw.score },
      { status: 422 },
    );
  }

  // -------- Preprocess plan
  // Width/height unknown until decode; browser-side hook supplies it.
  // Server uses 1024 default (best-effort plan).
  const plan = planPreprocess({ width: 1024, height: 1024 });

  // -------- Cost gate
  const projectedCost = computeCost({ model: "claude-3-5-sonnet", inputTokens: 1000, outputTokens: 200 });
  const budgetCheck = await assertBudgetAsync(userId, projectedCost, { bypass: tier === "ADMIN" });
  if (!budgetCheck.fits) {
    await obs.recordEvent(buildAkashaEvent({
      traceId, userId, conversationId: traceId, surface: "image",
      durationMs: 0, costUsd: 0, outcome: "refused_cost",
    }));
    return NextResponse.json({ error: "cost_limit", scope: budgetCheck.blockedBy ?? "daily" }, { status: 402 });
  }

  // -------- Vision call (fallback chain — stub)
  const tried: VisionProvider[] = [];
  let providerUsed: VisionProvider | null = null;
  let description = "imagem simbólica da tradição espiritual";
  let confidence = 0.5;
  const attempted: VisionProvider[] = [];

  let candidate = nextVisionProvider(tried);
  while (candidate !== null) {
    tried.push(candidate);
    attempted.push(candidate);
    // In production: real call to provider. Stub → assume success.
    providerUsed = candidate;
    description = `Descrição gerada por ${candidate} (stub W39).`;
    confidence = 0.92;
    break;
  }

  const vision = buildVisionResponse(
    providerUsed ?? "gpt-4o-mini",
    description,
    confidence,
    attempted,
    Date.now() - startTs,
  );

  const altText = buildAltText({
    imageHash,
    visionDescription: vision.text,
    locale: body.locale ?? "pt-BR",
  });

  const durationMs = Date.now() - startTs;
  await obs.recordEvent(buildAkashaEvent({
    traceId, userId, conversationId: traceId, surface: "image",
    durationMs, costUsd: projectedCost, outcome: "ok", cacheHit: "miss",
  }));

  const response: ImageResponseBody = {
    altText: altText.text,
    vision,
    nsfw: { score: nsfw.score, flagged: nsfw.flagged },
    preprocess: {
      targetWidth: plan.targetWidth,
      targetHeight: plan.targetHeight,
      gpsStripped: plan.stripGps,
    },
    costUsd: projectedCost,
    durationMs,
  };
  return NextResponse.json(response);
}
