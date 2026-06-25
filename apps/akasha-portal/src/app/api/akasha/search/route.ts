/**
 * GET /api/akasha/search?q=&type=chat|diario|manifesto|mapa|all&limit=20
 *
 * Wave 13.2 — Global search (Cmd+K) for the authenticated user's data.
 *
 * NOTE: This route lives under /api/akasha/ to avoid colliding with the
 * existing public grimoire search at /api/search (which searches Odús,
 * Orixás, rituals, tarot from the static spiritual dataset). The two
 * have different consumers: this one is per-user (auth required) and
 * lives in the authenticated /api/akasha/ namespace.
 *
 * Scope: search the *current user's* data across:
 *   - chat   → ChatMessage (Mentor conversations) joined via Consultation
 *   - diario → DailyReading (climate + alert columns)
 *   - manifesto → Manifesto.content (stringified JSON)
 *   - mapa   → BirthChart (astrologyMap / kabalisticMap / tantricMap / oduBirth — stringified JSON)
 *   - all    → union of all of the above
 *
 * SECURITY:
 *   - requireAkashaApi enforces cookie auth. UserId ALWAYS comes from the
 *     authenticated token (NOT from query/body) — same pattern as /api/mentor/ask.
 *   - All queries filter by userId explicitly; a SQL injection on `q` cannot
 *     leak other users' rows because every Prisma call has `where: { userId }`.
 *   - We use Prisma's `contains` operator with case-insensitive mode
 *     (`mode: 'insensitive'`) — equivalent to PostgreSQL `ILIKE`.
 *
 * PERFORMANCE:
 *   - LIMIT applied per type; total response capped by `limit` arg (default 20,
 *     max 50).
 *   - `take` per type = limit (we may return up to 4×limit results, then trim).
 *   - Snippets are computed in JS from `content` (no extra DB roundtrip).
 *   - p95 target: < 200ms with userId index hits. Existing indexes:
 *       - Consultation.userId (btree)
 *       - ChatMessage.consultationId (btree)
 *       - DailyReading.userId (btree, unique on (userId,date))
 *       - Manifesto.userId (unique)
 *       - BirthChart.userId (unique)
 *     For ILIKE on text columns, Postgres will seq-scan without a trigram
 *     index. Volume per user is small (≤ a few hundred ChatMessages), so
 *     seq-scan is acceptable for the v1. If we observe > 1k messages/user
 *     in prod we can add `pg_trgm` GIN indexes on `content` / `climate`.
 *
 * RESPONSE SHAPE:
 *   { results: SearchResult[], tookMs: number, query: string, types: SearchType[] }
 *   SearchResult = { type, id, title, snippet, score, href, meta? }
 */
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'A busca precisa de ao menos 2 caracteres')
    .max(200, 'A busca não pode passar de 200 caracteres'),
  type: z
    .enum(['all', 'chat', 'diario', 'manifesto', 'mapa'])
    .default('all'),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type SearchType = 'chat' | 'diario' | 'manifesto' | 'mapa';

export interface SearchResult {
  type: SearchType;
  /** Stable identifier (cuid) of the underlying row. */
  id: string;
  /** Human-readable title for the result row (already translated where possible). */
  title: string;
  /** ≤ 200 chars excerpt around the first match. */
  snippet: string;
  /** Rough relevance score (0-100). Higher = better. */
  score: number;
  /** Client-side route to navigate to on activation. */
  href: string;
  /** Created timestamp (ISO). Used for ordering + display. */
  createdAt: string;
  /** Optional extra metadata (e.g. consultation title, pilar). */
  meta?: Record<string, string | number | boolean | null>;
}

export interface SearchResponse {
  results: SearchResult[];
  tookMs: number;
  query: string;
  types: SearchType[];
}

/**
 * Build a snippet around the first match (case-insensitive) in `text`.
 * Returns up to `maxLen` chars centered on the match.
 */
function buildSnippet(text: string, q: string, maxLen = 200): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) {
    // No match — return prefix (likely the beginning of the content).
    return text.length > maxLen ? `${text.slice(0, maxLen).trimEnd()}…` : text;
  }
  const half = Math.floor((maxLen - q.length) / 2);
  const start = Math.max(0, idx - half);
  const end = Math.min(text.length, idx + q.length + half);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/**
 * Score a single match. Stronger matches (exact word boundary, shorter
 * content) score higher. Returns 0-100.
 */
function scoreMatch(text: string, q: string): number {
  if (!text || !q) return 0;
  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  // Exact substring = 60; word-boundary = +25; prefix = +15.
  let score = 60;
  if (new RegExp(`\\b${qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)) {
    score += 25;
  }
  if (lower.startsWith(qLower)) score += 15;
  // Shorter content with the match is more relevant — clamp.
  const lengthFactor = Math.max(0, 1 - text.length / 4000);
  score += Math.round(lengthFactor * 10);
  return Math.min(100, score);
}

export async function GET(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // 2. Parse query
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get('q') ?? '',
    type: searchParams.get('type') ?? 'all',
    limit: searchParams.get('limit') ?? '20',
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.errors[0];
    return NextResponse.json(
      {
        error: firstIssue?.message ?? 'Parâmetros inválidos',
        details: parsed.error.errors,
      },
      { status: 400 }
    );
  }
  const { q, type, limit } = parsed.data;
  const t0 = Date.now();

  try {
    const results: SearchResult[] = [];
    const typesToQuery: SearchType[] =
      type === 'all' ? ['chat', 'diario', 'manifesto', 'mapa'] : [type];

    // Run the requested searches in parallel for latency.
    await Promise.all(
      typesToQuery.map(async (t) => {
        if (t === 'chat') {
          const rows = await prisma.chatMessage.findMany({
            where: {
              content: { contains: q, mode: 'insensitive' },
              consultation: { userId },
            },
            include: {
              consultation: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
          });
          for (const m of rows) {
            results.push({
              type: 'chat',
              id: m.id,
              title:
                m.consultation.title ??
                `Conversa com o Mentor — ${new Date(m.createdAt).toLocaleDateString('pt-BR')}`,
              snippet: buildSnippet(m.content, q),
              score: scoreMatch(m.content, q),
              href: `/pt-BR/oraculo?consultationId=${m.consultation.id}#msg-${m.id}`,
              createdAt: m.createdAt.toISOString(),
              meta: {
                role: m.role,
                consultationId: m.consultation.id,
              },
            });
          }
        } else if (t === 'diario') {
          // DailyReading: search in `climate` and `alert` (the two string
          // columns). `ritual`, `tensionPoint`, `hexagramLines` are Json
          // and skipped here — they would require a JSON-path search which
          // is out of scope for v1.
          const rows = await prisma.dailyReading.findMany({
            where: {
              userId,
              OR: [
                { climate: { contains: q, mode: 'insensitive' } },
                { alert: { contains: q, mode: 'insensitive' } },
              ],
            },
            orderBy: { date: 'desc' },
            take: limit,
          });
          for (const r of rows) {
            const text = `${r.climate}\n${r.alert}`;
            results.push({
              type: 'diario',
              id: r.id,
              title: `Diário de ${new Date(r.date).toLocaleDateString('pt-BR')}`,
              snippet: buildSnippet(text, q),
              score: scoreMatch(text, q),
              href: `/pt-BR/diario?data=${r.date.toISOString().slice(0, 10)}`,
              createdAt: r.createdAt.toISOString(),
              meta: {
                date: r.date.toISOString().slice(0, 10),
                hasAlert: r.alert.length > 0,
              },
            });
          }
        } else if (t === 'manifesto') {
          // Manifesto.content is Json — stringify for substring search.
          const rows = await prisma.manifesto.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
          for (const m of rows) {
            const text = JSON.stringify(m.content);
            if (!text.toLowerCase().includes(q.toLowerCase())) continue;
            results.push({
              type: 'manifesto',
              id: m.id,
              title: 'Manifesto Akáshico',
              snippet: buildSnippet(text, q),
              score: scoreMatch(text, q),
              href: '/pt-BR/conta/manifesto',
              createdAt: m.createdAt.toISOString(),
              meta: { tokensUsed: m.tokensUsed ?? null },
            });
          }
        } else if (t === 'mapa') {
          // BirthChart: search the 4 Pilar Json fields. We only fetch the
          // row(s) belonging to this user (BirthChart is unique on userId).
          const charts = await prisma.birthChart.findMany({
            where: { userId },
            take: limit,
          });
          for (const c of charts) {
            const pieces = [
              c.astrologyMap ? JSON.stringify(c.astrologyMap) : '',
              c.kabalisticMap ? JSON.stringify(c.kabalisticMap) : '',
              c.tantricMap ? JSON.stringify(c.tantricMap) : '',
              c.oduBirth ? JSON.stringify(c.oduBirth) : '',
            ];
            const text = pieces.join('\n');
            if (!text.toLowerCase().includes(q.toLowerCase())) continue;
            // Identify which pilar matched (cheap heuristic — first one).
            const matchedPilar = pieces.findIndex((p) =>
              p.toLowerCase().includes(q.toLowerCase())
            );
            const pilarName = ['Astrologia', 'Cabala', 'Tântrica', 'Odu'][
              matchedPilar
            ];
            results.push({
              type: 'mapa',
              id: c.id,
              title: `Mapa Akáshico — ${pilarName ?? 'Visão geral'}`,
              snippet: buildSnippet(text, q),
              score: scoreMatch(text, q),
              href: '/pt-BR/mandala',
              createdAt: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
              meta: { pilar: pilarName ?? null },
            });
          }
        }
      })
    );

    // Sort: score desc, then createdAt desc. Cap at `limit`.
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.createdAt.localeCompare(a.createdAt);
    });
    const trimmed = results.slice(0, limit);

    const response: SearchResponse = {
      results: trimmed,
      tookMs: Date.now() - t0,
      query: q,
      types: typesToQuery,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('[search] Erro:', err);
    return NextResponse.json(
      {
        error: 'Erro ao buscar',
        details: err instanceof Error ? err.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}