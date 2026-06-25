/**
 * API Route: GET /api/akasha/discoveries/related/[id]
 *
 * Wave 31.1 — GraphRAG MVP (knowledge extraction).
 *
 * Retorna top-K related discoveries via hybrid retrieval (vector
 * cosine + graph traversal, fused via RRF). Uses
 * `@akasha/graphrag` (Postgres + pgvector backend).
 *
 * Auth:
 *   - `requireAkashaApi` enforces authenticated user.
 *   - 401 if not authed, 400 if id invalid, 200 with `{ related }`
 *     array otherwise.
 *
 * LGPD:
 *   - Não retorna dados pessoais — apenas nodes canônicos
 *     (Pilar, Odu, Sefira, Hexagrama, Medicina, Discovery).
 *   - Aceita `mode` (vector|graph|hybrid) para debugging Zelador.
 *
 * Graceful degradation:
 *   - Se `kg_nodes`/`kg_edges` não existem ou DB indisponível,
 *     retorna `{ related: [], available: false, reason: ... }`
 *     com HTTP 200 — UI mostra "grafo indisponível" sem quebrar.
 *
 * Query params:
 *   - `mode`    = 'hybrid' | 'vector' | 'graph' (default 'hybrid')
 *   - `limit`   = 1..20 (default 5)
 *   - `labels`  = comma-sep: discovery|pilar|odu|sefira|hexagrama|medicina
 */

import { NextRequest, NextResponse } from "next/server";

import { requireAkashaApi } from "@/lib/application/auth/akasha-guard";
import {
  HashEmbedder,
  HybridRetriever,
  PgGraphBackend,
  type KgNodeLabel,
  type RelatedCandidate,
  type RetrievalMode,
} from "@akasha/graphrag";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_MODES = new Set<RetrievalMode>(["hybrid", "vector", "graph"]);
const VALID_LABELS = new Set<KgNodeLabel>([
  "discovery",
  "pilar",
  "odu",
  "hexagrama",
  "sefira",
  "planeta",
  "signo",
  "conceito",
  "medicina",
  "zelador",
  "consulente",
]);

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  if (!id || typeof id !== "string" || id.length === 0 || id.length > 256) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const sp = request.nextUrl.searchParams;
  const modeRaw = sp.get("mode") ?? "hybrid";
  const mode: RetrievalMode = VALID_MODES.has(modeRaw as RetrievalMode)
    ? (modeRaw as RetrievalMode)
    : "hybrid";

  const limit = Math.max(1, Math.min(20, Number.parseInt(sp.get("limit") ?? "5", 10) || 5));

  const labelsRaw = sp.get("labels");
  let labels: KgNodeLabel[] | undefined;
  if (labelsRaw) {
    const candidates = labelsRaw.split(",").map((s) => s.trim().toLowerCase());
    labels = candidates.filter((c): c is KgNodeLabel => VALID_LABELS.has(c as KgNodeLabel));
    if (labels.length === 0) labels = undefined;
  }

  // Backend: tenta Postgres. Se indisponível → graceful empty.
  const embedder = new HashEmbedder();
  const url = process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"];
  if (!url) {
    return NextResponse.json(
      { related: [], available: false, reason: "DATABASE_URL not set" },
      { status: 200 }
    );
  }

  let backend: PgGraphBackend;
  try {
    backend = PgGraphBackend.fromEnv(embedder);
  } catch (err) {
    return NextResponse.json(
      { related: [], available: false, reason: `backend init failed: ${String(err)}` },
      { status: 200 }
    );
  }

  const retriever = new HybridRetriever(backend, embedder, { topK: limit, mode });
  let related: RelatedCandidate[] = [];
  let available = true;
  let reason: string | undefined;
  try {
    related = await retriever.findRelated(id, { topK: limit, mode, labels });
    if (related.length === 0) {
      // Verifica se node existe — se não, id inválido.
      const node = await backend.getNode(id);
      if (!node) {
        reason = "node_not_found";
      }
    }
  } catch (err) {
    available = false;
    reason = `retrieval failed: ${String(err)}`;
  } finally {
    await backend.close().catch(() => undefined);
  }

  return NextResponse.json({
    related: related.map((r) => ({
      id: r.node.id,
      label: r.node.label,
      name: r.node.name,
      description: r.node.description,
      rrfScore: r.rrfScore,
      vectorScore: r.vectorScore ?? null,
      graphDepth: r.graphDepth ?? null,
      source: r.source,
      requiresConsent: Boolean(r.node.metadata["requiresConsent"]),
    })),
    available,
    reason: reason ?? null,
    mode,
    limit,
  });
}
