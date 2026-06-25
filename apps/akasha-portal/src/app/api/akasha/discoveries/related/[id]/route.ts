/**
 * API Route: GET /api/akasha/discoveries/related/[id]
 *
 * Wave 31.1 — GraphRAG MVP (knowledge extraction).
 *
 * Retorna top-K related discoveries via hybrid retrieval (vector
 * cosine + graph traversal).
 *
 * Auth:
 *   - requireAkashaApi (cookie JWT). 401 if not authenticated.
 *   - Related retrieval is per-discovery-id (no user_id coupling
 *     in the GraphRAG layer itself — auth gate here protects the API).
 *
 * LGPD:
 *   - Response NÃO inclui PII (sem birthDate, nome, email).
 *   - Apenas IDs de nodes do grafo público (corpus canônico).
 *   - Migration wave_31_1_graphrag é PROPOSAL — aplica via Prisma
 *     migrate após review humana (ver apps/akasha-portal/prisma/AGENTS.md
 *     Work Guidance §1).
 *
 * Migration: applies via:
 *   pnpm --filter akasha-portal exec prisma migrate deploy
 * (the migration file is in packages/graphrag/migrations/ — a human
 * copies it to apps/akasha-portal/prisma/migrations/ and runs).
 */

import { NextRequest, NextResponse } from "next/server";

import {
  HashEmbedder,
  HybridRetriever,
  PgGraphBackend,
} from "@akasha/graphrag/retriever";

import { requireAkashaApi } from "@/lib/application/auth/akasha-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 5;

interface RouteContext {
  params: Promise<{ id: string }>;
}

type Mode = "hybrid" | "vector" | "graph";

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  if (!id || typeof id !== "string" || id.length === 0 || id.length > 256) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }
  const startId = decodeURIComponent(id).trim();
  if (!startId) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const topK = clampInt(url.searchParams.get("topK"), 1, 50, 5);
  const mode = parseMode(url.searchParams.get("mode"));

  let backend: PgGraphBackend | null = null;
  try {
    backend = await PgGraphBackend.connect();
    const embedder = new HashEmbedder();
    const retriever = new HybridRetriever(backend, embedder);

    const results = await retriever.findRelated(startId, { topK, mode });

    return NextResponse.json(
      {
        ok: true,
        discoveryId: startId,
        topK,
        mode,
        count: results.length,
        related: results.map((r: import("@akasha/graphrag").RelatedCandidate) => ({
          id: r.node.id,
          label: r.node.label,
          name: r.node.name,
          description: r.node.description,
          rrfScore: r.rrfScore,
          vectorScore: r.vectorScore,
          graphDepth: r.graphDepth,
          source: r.source,
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      }
    );
  } catch (err) {
    const kind = classifyError(err);
    // eslint-disable-next-line no-console
    console.error("[graphrag.related] error", { kind, err });
    if (kind === "SCHEMA_NOT_APPLIED") {
      return NextResponse.json(
        {
          ok: false,
          error: "graphrag_schema_not_applied",
          hint: "Apply migration wave_31_1_graphrag to enable related discoveries.",
        },
        { status: 503 }
      );
    }
    if (kind === "DB_UNREACHABLE") {
      return NextResponse.json(
        { ok: false, error: "database_unreachable" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  } finally {
    await backend?.close().catch(() => undefined);
  }
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function parseMode(raw: string | null): Mode {
  if (raw === "vector" || raw === "graph" || raw === "hybrid") return raw;
  return "hybrid";
}

function classifyError(err: unknown): "SCHEMA_NOT_APPLIED" | "DB_UNREACHABLE" | "INTERNAL" {
  if (err instanceof Error) {
    if (err.message.includes("kg_nodes") || err.message.includes("does not exist")) {
      return "SCHEMA_NOT_APPLIED";
    }
    if (err.message.includes("ECONNREFUSED") || err.message.includes("ENOTFOUND")) {
      return "DB_UNREACHABLE";
    }
  }
  return "INTERNAL";
}