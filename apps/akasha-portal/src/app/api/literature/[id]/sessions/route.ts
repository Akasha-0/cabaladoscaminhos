/**
 * API Route: GET /api/literature/[id]/sessions
 *
 * Wave 27.5 — Literature Cross-Reference.
 *
 * Retorna a lista de Sessoes (Zelador-atendimento) que usaram este
 * paper como referência. Caso de uso: o Zelador abre um paper e quer
 * ver **em quais atendimentos** ele já apareceu — a evidência aplicada
 * (ADR-013: consciência viva, papers sustentam a prática).
 *
 * Response shape: envelope padronizado
 *   {
 *     paperId: string,
 *     total: number,
 *     sessions: Array<{
 *       id, caminhanteLabel, tipo, abertoEm, fechadoEm, status, excerpt
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
 *   - Response NÃO inclui PII direta do consulente (sem nomeCompleto,
 *     contato, saudeRelevante — apenas label público tipo "Caminhante #N").
 *   - Apenas contexto derivado (sessão metadata pública).
 *
 * Source-of-truth (Wave 21.1 / 24.2): tabela `LiteraturePaper` join
 * `SessaoChunk` via `metadata.paperIds` (Wave 24.2 — SessaoChunk.metadata
 * é Json, estrutura `{ paperIds: string[], ... }`). Hoje mock determinístico
 * (USE_REAL_DB = false) — quando schemas/payloads forem promovidos,
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
//           LiteraturePaper/SessaoChunk.metadata.paperIds estruturado).
// `true`  = usar Prisma real (depois que Wave 21.1 / 24.2 mergearem).
//
// Quando virar `true`, basta:
//   1. Implementar `loadFromDatabase()` abaixo (queries reais).
//   2. Trocar a constante `USE_REAL_DB` para `true`.
//   3. Adicionar tests de integração com mock Prisma.
const USE_REAL_DB = false;

// ─── Public types ─────────────────────────────────────────────────────────

/**
 * Status efetivo da Sessao para esta view-model.
 *
 * No schema (Wave 24.2) é `StatusSessao = aberta | fechada`. Expor
 * tipo dedicado aqui desacopla o contrato HTTP do enum Prisma.
 */
export type SessionRefStatus = 'aberta' | 'fechada';

/** Tipo da Sessao (Wave 24.2 — enum TipoSessao). */
export type SessionRefTipo =
  | 'Apresentacao'
  | 'Leitura'
  | 'Ritual'
  | 'Aconselhamento'
  | 'Integracao';

/** View-model de uma Sessao que usou o paper (Wave 27.5). */
export interface PaperSessionRef {
  id: string;
  /** Label público do caminhante (sem nome real — LGPD). */
  caminhanteLabel: string;
  tipo: SessionRefTipo;
  status: SessionRefStatus;
  /** ISO date de abertura. */
  abertoEm: string;
  /** ISO date de fechamento (null = ainda aberta). */
  fechadoEm: string | null;
  /** Trecho curto do chunk onde o paper apareceu (≤ 120 chars). */
  excerpt: string;
}

/** Response envelope. */
export interface PaperSessionsResponse {
  paperId: string;
  total: number;
  sessions: PaperSessionRef[];
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

const MOCK_TIPOS: readonly SessionRefTipo[] = [
  'Apresentacao',
  'Leitura',
  'Ritual',
  'Aconselhamento',
  'Integracao',
] as const;

const MOCK_STATUS: readonly SessionRefStatus[] = ['aberta', 'fechada'] as const;

const MOCK_EXCERPTS = [
  'Caminhante traz dúvida sobre meditação; paper ancora Pilar Tantra no Corpo 1.',
  'Paper Wave 21.1 sustenta a cross-tradição Cabala ↔ Tantra no chunk.',
  'Zelador cita paper para grounded a recomendação de prática diária.',
  'Excerto do chunk: "o paper mostra que…" (truncado para 120 chars).',
  'Paper aparece no reasoning da sessão como evidência do Pilar Astrologia.',
  'Paper grounding do insight de Pilar 4 (consentimento + terreiro aplicado).',
];

const MOCK_CAMINHANTE_LABELS = [
  'Caminhante #1',
  'Caminhante #2',
  'Caminhante #3',
  'Caminhante #4',
  'Caminhante #5',
];

/**
 * Pick determinístico baseado no id + slot.
 */
function pickFromId<T>(id: string, slot: number, items: readonly T[]): T {
  const h = stableHash(`${id}:${slot}`);
  const idx = Math.floor(h * items.length) % items.length;
  return items[idx]!;
}

function buildMockSessions(paperId: string): PaperSessionRef[] {
  // 0..2 sessões determinísticas por paper
  const count = Math.floor(stableHash(`${paperId}:scount`) * 3); // 0..2
  if (count === 0) return [];

  const items: PaperSessionRef[] = [];
  // ISO date fixa determinística por slot (não new Date() — hydration-safe)
  const baseTimestamp = Date.parse('2026-06-15T10:00:00Z');
  for (let i = 0; i < count; i++) {
    const offsetDays = i * 3 + Math.floor(stableHash(`${paperId}:${i}:day`) * 4);
    const abertoEm = new Date(baseTimestamp + offsetDays * 86400000).toISOString();
    const status = pickFromId(paperId, i + 200, MOCK_STATUS);
    const fechadoEm =
      status === 'fechada'
        ? new Date(baseTimestamp + (offsetDays + 1) * 86400000).toISOString()
        : null;
    items.push({
      id: `sess_${paperId.slice(0, 8)}_${i}`,
      caminhanteLabel: pickFromId(paperId, i + 300, MOCK_CAMINHANTE_LABELS),
      tipo: pickFromId(paperId, i, MOCK_TIPOS),
      status,
      abertoEm,
      fechadoEm,
      excerpt: pickFromId(paperId, i + 400, MOCK_EXCERPTS),
    });
  }
  return items;
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Lista as sessoes que usaram o paper.
 *
 * @param paperId ID do LiteraturePaper (DOI slug, pmid, ou cuid).
 *               Wave 21.1 unifica — aceitar string 1..128 chars.
 * @returns Array vazio se paper não tem sessoes; null se paper não existe.
 */
async function loadSessionsForPaper(
  paperId: string
): Promise<PaperSessionRef[] | null> {
  if (!USE_REAL_DB) {
    return buildMockSessions(paperId);
  }

  // ─── TODO Wave 21.1 / 24.2 — implementar quando schemas/payloads mergearem ───
  //
  // Pseudocódigo (NÃO executar até USE_REAL_DB = true):
  //
  // const paper = await prisma.literaturePaper.findUnique({
  //   where: { id: paperId },
  //   select: { id: true },
  // });
  // if (!paper) return null;
  //
  // // Wave 24.2: SessaoChunk.metadata é Json com shape
  // //   { paperIds?: string[], ... }. Query via raw SQL para JSONB
  // //   containment (Prisma Json filters são limitados).
  // const chunks = await prisma.$queryRaw<Array<{
  //   sessaoId: string;
  //   tipo: TipoSessao;
  //   status: StatusSessao;
  //   abertoEm: Date;
  //   fechadoEm: Date | null;
  //   caminhanteId: string;
  //   texto: string;
  //   metadata: unknown;
  // }>>`
  //   SELECT s.id AS "sessaoId",
  //          s.tipo,
  //          s.status,
  //          s.aberto_em AS "abertoEm",
  //          s.fechado_em AS "fechadoEm",
  //          ca.id AS "caminhanteId",
  //          sc.texto,
  //          sc.metadata
  //     FROM sessao_chunks sc
  //     JOIN sessoes s ON s.id = sc.sessao_id
  //     JOIN caminhantes ca ON ca.id = s.caminhada_id
  //    WHERE sc.metadata -> 'paperIds' ?| ARRAY[${paperId}]::text[]
  //      AND s.zelador_id = ${currentUserId}   -- tenant isolation (Wave 3)
  //    ORDER BY sc.created_at DESC
  //    LIMIT 20
  // `;
  //
  // return chunks.map((row) => ({
  //   id: row.sessaoId,
  //   // LGPD: NÃO expor nome do caminhante. Usar label público.
  //   caminhanteLabel: `Caminhante #${row.caminhanteId.slice(-4)}`,
  //   tipo: row.tipo,
  //   status: row.status,
  //   abertoEm: row.abertoEm.toISOString(),
  //   fechadoEm: row.fechadoEm ? row.fechadoEm.toISOString() : null,
  //   excerpt: row.texto.slice(0, 120),
  // });
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

  const sessions = await loadSessionsForPaper(id);
  if (sessions === null) {
    return NextResponse.json({ error: 'paper_not_found' }, { status: 404 });
  }

  const response: PaperSessionsResponse = {
    paperId: id,
    total: sessions.length,
    sessions,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      // 30s — user pode re-renderizar. Privado (LGPD — auth-gated).
      'Cache-Control': 'private, max-age=30',
    },
  });
}
