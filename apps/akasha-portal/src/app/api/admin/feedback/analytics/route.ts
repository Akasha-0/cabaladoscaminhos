/**
 * GET /api/admin/feedback/analytics
 *
 * Wave 18.3 — Admin feedback analytics (Wave 13.5 FeedbackEntry dashboard).
 *
 * Endpoint ADMIN-only que agrega FeedbackEntry para alimentar o dashboard
 * `/admin/feedback`. Tudo server-side, derivado por queries Prisma — não
 * expõe PII (sem nome/email de quem votou, sem `comment` completo; apenas
 * `messageId` opaco + snippet do comment truncado a 100 chars).
 *
 * Query params:
 *   days — janela para o trend (default 30, range 1..365)
 *
 * Response shape:
 *   {
 *     avgRating:    { up: number, down: number },           // proporção 0..1
 *     totalFeedback: number,
 *     trendLast30Days: Array<{
 *       date: 'YYYY-MM-DD',
 *       upCount: number,
 *       downCount: number,
 *       ratio: number,         // up / (up+down), 0 se sem votos no dia
 *     }>,
 *     topDownMessages: Array<{
 *       messageId: string,
 *       downCount: number,
 *       lastOccurredAt: string (ISO),
 *       snippet: string,       // até 100 chars do comment mais recente
 *     }>,
 *     byPilar: Record<string, number>,  // ratio up/(up+down), 0..1
 *   }
 *
 * Segurança:
 *   - requireAkashaAdmin → 401 sem auth, 403 se não-ADMIN.
 *   - LGPD: nunca retornamos `userId`, `comment` completo, `email`, ou
 *     `name`. Apenas agregados + messageId opaco + snippet truncado.
 *   - `days` é validado por clamp (1..365) — não confiamos no client.
 *
 * Performance:
 *   - 4 queries Prisma (counts + groupBy day + groupBy message + groupBy pilar).
 *   - Tudo index-friendly (createdAt index já existente em FeedbackEntry
 *     pelo Wave 13.5 schema proposal).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaAdmin } from '@/lib/application/auth/akasha-guard';

export const dynamic = 'force-dynamic';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Snippet máximo (chars) para `topDownMessages[].snippet` — LGPD-safe. */
const SNIPPET_MAX_CHARS = 100;

/** Janela default (dias) para o trend. */
const DEFAULT_DAYS = 30;

/** Limites para clamp do query param. */
const MIN_DAYS = 1;
const MAX_DAYS = 365;

/**
 * Chaves de Pilar reconhecidas a partir do prefixo do `messageId`.
 *
 * Convenção Wave 18.3 (cliente pode emitir messageIds no formato
 *   `<pilarKey>:<resto>`)
 * onde `<pilarKey>` ∈ {cabala, astrologia, numerologia, tantrica, odu, iching}.
 * Qualquer messageId sem prefixo reconhecido cai em `global`.
 */
const PILAR_KEYS = [
  'cabala',
  'astrologia',
  'numerologia',
  'tantrica',
  'odu',
  'iching',
] as const;
type PilarKey = (typeof PILAR_KEYS)[number] | 'global';

function derivePilarFromMessageId(messageId: string): PilarKey {
  const head = messageId.split(/[:_-]/, 1)[0]?.toLowerCase() ?? '';
  return (PILAR_KEYS as readonly string[]).includes(head) ? (head as PilarKey) : 'global';
}

function clampDays(raw: string | null): number {
  if (!raw) return DEFAULT_DAYS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULT_DAYS;
  return Math.max(MIN_DAYS, Math.min(MAX_DAYS, n));
}

function snippetFromComment(comment: string | null): string {
  if (!comment) return '';
  // LGPD: trunca SEM expor PII. Não fazemos regex de email/nome — apenas
  // limite de tamanho + trim. Comentários já são ≤ 500 chars no schema.
  const trimmed = comment.trim();
  if (trimmed.length <= SNIPPET_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, SNIPPET_MAX_CHARS).trimEnd()}…`;
}

function toIsoDate(d: Date): string {
  // YYYY-MM-DD em UTC (consistente com agregação por dia)
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Handler ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // 1. Auth ADMIN
  const auth = await requireAkashaAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const days = clampDays(request.nextUrl.searchParams.get('days'));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    // 2. Counts globais (up/down) + total
    const [upAgg, downAgg] = await Promise.all([
      prisma.feedbackEntry.count({ where: { rating: 'up' } }),
      prisma.feedbackEntry.count({ where: { rating: 'down' } }),
    ]);
    const totalFeedback = upAgg + downAgg;
    const avgRating = {
      up: totalFeedback === 0 ? 0 : upAgg / totalFeedback,
      down: totalFeedback === 0 ? 0 : downAgg / totalFeedback,
    };

    // 3. Trend diário (janela `days`). Limitamos a `days` itens por
    //    classificação (up/down). Prisma groupBy retorna só dias COM votos,
    //    então depois preenchemos dias vazios com zeros.
    const [upByDay, downByDay] = await Promise.all([
      prisma.feedbackEntry.groupBy({
        by: ['createdAt'],
        where: { rating: 'up', createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.feedbackEntry.groupBy({
        by: ['createdAt'],
        where: { rating: 'down', createdAt: { gte: since } },
        _count: { _all: true },
      }),
    ]);

    // Bucket por dia UTC
    const dayBuckets = new Map<string, { upCount: number; downCount: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dayBuckets.set(toIsoDate(d), { upCount: 0, downCount: 0 });
    }
    for (const row of upByDay) {
      const key = toIsoDate(row.createdAt);
      const bucket = dayBuckets.get(key);
      if (bucket) bucket.upCount += row._count._all;
    }
    for (const row of downByDay) {
      const key = toIsoDate(row.createdAt);
      const bucket = dayBuckets.get(key);
      if (bucket) bucket.downCount += row._count._all;
    }
    // Ordem cronológica ASC (oldest → today)
    const trendLast30Days = Array.from(dayBuckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, b]) => {
        const total = b.upCount + b.downCount;
        return {
          date,
          upCount: b.upCount,
          downCount: b.downCount,
          ratio: total === 0 ? 0 : b.upCount / total,
        };
      });

    // 4. Top mensagens com mais `down`. GROUP BY messageId, ordena por
    //    count DESC, limita a 5. Não expomos userId — apenas messageId +
    //    snippet do último comment.
    //
    //    Os tipos do `groupBy` são derivados do Prisma client. Em
    //    worktrees onde o `FeedbackEntry` ainda não foi gerado no client
    //    (schema proposal only — Wave 13.5), tipamos manualmente para
    //    evitar implicit-any em `(r) => r.messageId`.
    type TopDownRow = {
      messageId: string;
      _count: { _all: number };
      _max: { createdAt: Date | null };
    };
    const topDownRaw = (await prisma.feedbackEntry.groupBy({
      by: ['messageId'],
      where: { rating: 'down' },
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: { _count: { messageId: 'desc' } },
      take: 5,
    })) as TopDownRow[];

    // Para pegar o snippet, buscamos o comment mais recente por messageId.
    // Como `take` é pequeno (5), um `findMany` por IDs é aceitável.
    let topDownMessages: Array<{
      messageId: string;
      downCount: number;
      lastOccurredAt: string;
      snippet: string;
    }> = [];
    if (topDownRaw.length > 0) {
      const ids = topDownRaw.map((r) => r.messageId);
      // Para cada messageId, pegamos o comment mais recente (down).
      const recentPerMessage = await prisma.feedbackEntry.findMany({
        where: { messageId: { in: ids }, rating: 'down' },
        select: {
          messageId: true,
          comment: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      // Indexamos apenas o mais recente por messageId
      const latestByMessage = new Map<string, (typeof recentPerMessage)[number]>();
      for (const row of recentPerMessage) {
        if (!latestByMessage.has(row.messageId)) {
          latestByMessage.set(row.messageId, row);
        }
      }
      topDownMessages = topDownRaw.map((row) => {
        const latest = latestByMessage.get(row.messageId);
        return {
          messageId: row.messageId,
          downCount: row._count._all,
          lastOccurredAt: (row._max.createdAt ?? new Date(0)).toISOString(),
          snippet: snippetFromComment(latest?.comment ?? null),
        };
      });
    }

    // 5. byPilar — derivamos o pilar a partir do prefixo do messageId.
    //    Carregamos tudo (não é enorme — feedback é baixo volume) e
    //    bucketeamos em memória. Se `feedbackEntry` ficar muito grande,
    //    trocar por `groupBy({ by: ['messageId'] })` + classificação JS.
    const allForPilar = await prisma.feedbackEntry.findMany({
      select: { messageId: true, rating: true },
    });
    const pilarBuckets = new Map<PilarKey, { up: number; down: number }>();
    for (const k of [...PILAR_KEYS, 'global'] as PilarKey[]) {
      pilarBuckets.set(k, { up: 0, down: 0 });
    }
    for (const row of allForPilar) {
      const k = derivePilarFromMessageId(row.messageId);
      const b = pilarBuckets.get(k)!;
      if (row.rating === 'up') b.up += 1;
      else b.down += 1;
    }
    const byPilar: Record<string, number> = {};
    for (const [k, b] of pilarBuckets.entries()) {
      const total = b.up + b.down;
      byPilar[k] = total === 0 ? 0 : b.up / total;
    }

    return NextResponse.json({
      avgRating,
      totalFeedback,
      trendLast30Days,
      topDownMessages,
      byPilar,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[admin/feedback/analytics] DB error:', message);
    return NextResponse.json(
      { error: 'db_error', details: message },
      { status: 500 }
    );
  }
}