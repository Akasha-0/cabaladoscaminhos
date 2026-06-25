/**
 * API Route: GET /api/literature/[id]/discoveries
 *
 * Wave 27.5 — Literature Cross-Reference.
 *
 * Retorna a lista de DiscoveryChains que citaram este paper.
 * Caso de uso: o Zelador abre um paper (drill-down) e quer ver
 * **quais descobertas** o Akasha gerou a partir dele — a evidência
 * viva (ADR-013: consciência que evolui via papers).
 *
 * Response shape: envelope padronizado
 *   {
 *     paperId: string,
 *     total: number,
 *     discoveries: Array<{
 *       id, verdadeUniversal, akashaType, feedback, citedAt, citationContext
 *     }>
 *   }
 *
 * Auth:
 *   - User autenticado via `requireAkashaApi` (cookie JWT).
 *   - 401 se não autenticado.
 *   - 400 se id vazio ou > 128 chars.
 *   - 404 se paper não encontrado (mock determinístico — papers "conhecidos"
 *     retornam lista; papers "desconhecidos" retornam [] com total=0).
 *   - 200 com envelope caso contrário.
 *
 * LGPD:
 *   - Response NÃO inclui PII (sem email, nome, birthDate).
 *   - Apenas contexto derivado (chain-of-thought público).
 *
 * Source-of-truth (Wave 21.1 / 20.2): tabela `LiteraturePaper` join
 * `DiscoveryChain` via `DiscoveryCitation`. Hoje mock determinístico
 * (USE_REAL_DB = false) — quando os schemas mergearem em main,
 * trocar a constante e implementar `loadFromDatabase()`.
 */
import { NextRequest, NextResponse } from 'next/server';

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── Toggle de implementação ──────────────────────────────────────────────
//
// `false` = usar MOCK determinístico (Wave 27.5 atual — sem schema
//           LiteraturePaper/DiscoveryChain mergeado no main).
// `true`  = usar Prisma real (depois que Wave 21.1 / 20.2 / 21.2 mergearem).
//
// Quando virar `true`, basta:
//   1. Implementar `loadFromDatabase()` abaixo (queries reais).
//   2. Trocar a constante `USE_REAL_DB` para `true`.
//   3. Adicionar tests de integração com mock Prisma.
const USE_REAL_DB = false;

// ─── Public types ─────────────────────────────────────────────────────────

/** View-model de uma Discovery que citou o paper (Wave 27.5). */
export interface PaperDiscoveryRef {
  id: string;
  /** Verdade universal da chain (≤ 15 palavras, visceral). */
  verdadeUniversal: string;
  /** Tipo Akasha (ex: 'O Iluminador', 'O Arquiteto'). */
  akashaType: string | null;
  /** Feedback acumulado: 'up' | 'down' | 'neutral'. */
  feedback: 'up' | 'down' | 'neutral';
  /** ISO date da citation (não da criação da chain). */
  citedAt: string;
  /** Trecho curto de onde o paper apareceu na reasoning (≤ 80 chars). */
  citationContext: string;
}

/** Response envelope. */
export interface PaperDiscoveriesResponse {
  paperId: string;
  total: number;
  discoveries: PaperDiscoveryRef[];
}

// ─── MOCK determinístico (Wave 27.5 — atual) ──────────────────────────────

/**
 * Hash determinístico de string → número 0..1. Usado pra mock estável
 * baseado em paperId (mesmo id sempre devolve mesma lista).
 */
function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

const MOCK_TRUTHS = [
  'Propósito emerge onde o corpo sente medo de crescer.',
  'A travessia já começou antes do plano.',
  'Onde os opostos se abraçam, a verdade nasce.',
  'Construir é o fruto — não a espera do fruto.',
  'Sombra é o portal, não o muro.',
  'Direção supera destino quando o corpo anui.',
];

const MOCK_TYPES = [
  'O Iluminador',
  'O Arquiteto',
  'O Curador',
  'O Sábio',
  'O Andarilho',
  null,
] as const;

const MOCK_CONTEXTS = [
  'paper ancora Pilar Tantra na chain',
  'evidência experimental citada na reasoning',
  'paper Wave 21.1 sustenta a cross-tradição',
  'DOI confirmou hipótese da cadeia',
  'abstract grounding da verdade universal',
  'paper RAG ranqueado no topo por relevance',
];

/**
 * Pick determinístico baseado no id + slot.
 */
function pickFromId<T>(id: string, slot: number, items: readonly T[]): T {
  const h = stableHash(`${id}:${slot}`);
  const idx = Math.floor(h * items.length) % items.length;
  return items[idx]!;
}

function buildMockDiscoveries(paperId: string): PaperDiscoveryRef[] {
  // 0..3 discoveries determinísticas por paper
  const count = Math.floor(stableHash(`${paperId}:count`) * 4); // 0..3
  if (count === 0) return [];

  const items: PaperDiscoveryRef[] = [];
  // ISO date fixa determinística por slot (não new Date() — hydration-safe)
  const baseTimestamp = Date.parse('2026-06-20T09:00:00Z');
  for (let i = 0; i < count; i++) {
    const offsetDays = i * 2 + Math.floor(stableHash(`${paperId}:${i}:day`) * 5);
    const citedAt = new Date(baseTimestamp + offsetDays * 86400000).toISOString();
    const feedbackRoll = stableHash(`${paperId}:${i}:fb`);
    const feedback: 'up' | 'down' | 'neutral' =
      feedbackRoll < 0.6 ? 'up' : feedbackRoll < 0.85 ? 'neutral' : 'down';
    items.push({
      id: `disc_${paperId.slice(0, 8)}_${i}`,
      verdadeUniversal: pickFromId(paperId, i, MOCK_TRUTHS),
      akashaType: pickFromId(paperId, i + 100, MOCK_TYPES),
      feedback,
      citedAt,
      citationContext: pickFromId(paperId, i + 50, MOCK_CONTEXTS),
    });
  }
  return items;
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Lista as discoveries que citaram o paper.
 *
 * @param paperId ID do LiteraturePaper (DOI slug, pmid, ou cuid).
 *               Wave 21.1 unifica — aceitar string 1..128 chars.
 * @returns Array vazio se paper não tem citations; null se paper não existe.
 */
async function loadDiscoveriesForPaper(
  paperId: string
): Promise<PaperDiscoveryRef[] | null> {
  if (!USE_REAL_DB) {
    return buildMockDiscoveries(paperId);
  }

  // ─── TODO Wave 21.1 / 20.2 — implementar quando schemas mergearem ───
  //
  // Pseudocódigo (NÃO executar até USE_REAL_DB = true):
  //
  // const paper = await prisma.literaturePaper.findUnique({
  //   where: { id: paperId },
  //   select: { id: true },
  // });
  // if (!paper) return null;
  //
  // const citations = await prisma.discoveryCitation.findMany({
  //   where: { paperId },
  //   include: {
  //     chain: {
  //       select: {
  //         id: true,
  //         synthesis: true,        // JSON { verdadeUniversal, akashaType }
  //         createdAt: true,
  //         feedback: {             // opcional — Wave 22.1
  //           where: { targetType: 'DISCOVERY' },
  //           select: { rating: true },
  //         },
  //       },
  //     },
  //   },
  //   orderBy: { createdAt: 'desc' },
  //   take: 20,
  // });
  //
  // return citations.map((c) => {
  //   const synth = c.chain.synthesis as unknown as {
  //     verdadeUniversal?: string;
  //     akashaType?: string | null;
  //   };
  //   const ratings = c.chain.feedback.map((f) => f.rating);
  //   const avg = ratings.length
  //     ? ratings.reduce((a, b) => a + b, 0) / ratings.length
  //     : 3;
  //   const feedback: 'up' | 'down' | 'neutral' =
  //     avg > 3.5 ? 'up' : avg < 2.5 ? 'down' : 'neutral';
  //   return {
  //     id: c.chain.id,
  //     verdadeUniversal: synth.verdadeUniversal ?? '',
  //     akashaType: synth.akashaType ?? null,
  //     feedback,
  //     citedAt: c.createdAt.toISOString(),
  //     citationContext: c.context ?? '',
  //   };
  // });
  //
  // eslint-disable-next-line @typescript-eslint/no-unreachable-code
  return null;
}

// ─── Route handler ───────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;
  if (!id || typeof id !== 'string' || id.length === 0 || id.length > 128) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const discoveries = await loadDiscoveriesForPaper(id);
  if (discoveries === null) {
    return NextResponse.json({ error: 'paper_not_found' }, { status: 404 });
  }

  const response: PaperDiscoveriesResponse = {
    paperId: id,
    total: discoveries.length,
    discoveries,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      // 30s — user pode re-renderizar. Privado (LGPD — auth-gated).
      'Cache-Control': 'private, max-age=30',
    },
  });
}
