/**
 * GET /api/akasha/search
 *   ?q=           required, 2-200 chars
 *   &type=        chat | diario | manifesto | mapa | all (default all)
 *   &since=       ISO date (YYYY-MM-DD), lower bound on createdAt
 *   &until=       ISO date (YYYY-MM-DD), upper bound on createdAt
 *   &pilar=       astrologia | cabala | tantrica | odu (filter mapa only)
 *   &limit=       1-50 (default 20)
 *
 * Wave 13.2 — Original global search (Cmd+K) for the authenticated user's data.
 * Wave 18.4 — Full-text search via Postgres tsvector + advanced filters
 *             (type, date range, pilar). Language detection from Accept-Language
 *             (pt-BR → 'portuguese' dictionary; otherwise 'english').
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
 *   - For FTS we use Prisma's tagged-template $queryRaw with `:param` placeholders,
 *     which is fully parameterized — no user input ever concatenated into SQL.
 *   - We use Prisma's `contains` operator with case-insensitive mode
 *     (`mode: 'insensitive'`) — equivalent to PostgreSQL `ILIKE` — as the
 *     fallback path when FTS is skipped (e.g. JSON-stringified manifesto/mapa).
 *
 * PERFORMANCE:
 *   - LIMIT applied per type; total response capped by `limit` arg (default 20,
 *     max 50).
 *   - `take` per type = limit (we may return up to 4×limit results, then trim).
 *   - FTS uses `to_tsvector(...) @@ websearch_to_tsquery(...)` + `ts_rank` for
 *     ranking. No GIN index added in Wave 18.4 (runtime FTS, no schema change);
 *         v2 should add `CREATE INDEX ... USING GIN (to_tsvector('portuguese', content))`
 *     for chat_messages.content + daily_readings.climate/alert.
 *   - p95 target: < 200ms with userId index hits. Existing indexes:
 *       - Consultation.userId (btree)
 *       - ChatMessage.consultationId (btree)
 *       - DailyReading.userId (btree, unique on (userId,date))
 *       - Manifesto.userId (unique)
 *       - BirthChart.userId (unique)
 *     For runtime tsvector on text columns, Postgres will seq-scan per user.
 *     Volume per user is small (≤ a few hundred ChatMessages), so seq-scan
 *     is acceptable for the v1.
 *
 * RESPONSE SHAPE:
 *   { results: SearchResult[], tookMs: number, query: string, types: SearchType[],
 *     lang: 'portuguese' | 'english' }
 *   SearchResult = { type, id, title, snippet, score, href, createdAt, meta? }
 *   - `score` is `ts_rank` (0..1, higher = better match) normalized to 0-100
 *     for UI consumption. The original rank is preserved in `meta.rank`.
 */
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
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
  since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'since deve ser YYYY-MM-DD')
    .optional(),
  until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'until deve ser YYYY-MM-DD')
    .optional(),
  pilar: z
    .enum(['astrologia', 'cabala', 'tantrica', 'odu'])
    .optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type SearchType = 'chat' | 'diario' | 'manifesto' | 'mapa';
export type SearchLang = 'portuguese' | 'english';
export type SearchPilar = 'astrologia' | 'cabala' | 'tantrica' | 'odu';

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
  /** Postgres FTS dictionary used to rank results. */
  lang: SearchLang;
}

/**
 * Resolve which Postgres text-search dictionary to use based on the
 * `Accept-Language` request header. Defaults to 'portuguese' (PT-BR
 * is the primary locale per the project DOX).
 */
function resolveLang(acceptLanguage: string | null): SearchLang {
  if (!acceptLanguage) return 'portuguese';
  const primary = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? '';
  if (primary.startsWith('en')) return 'english';
  return 'portuguese';
}

/**
 * Normalize a Postgres ts_rank (typically 0..0.6) to a 0-100 integer.
 * Caps the source at 0.5 (anything above is rare and saturates the scale).
 */
function rankToScore(rank: number): number {
  const normalized = Math.max(0, Math.min(1, rank / 0.5));
  return Math.round(normalized * 100);
}

/**
 * Build a snippet around the first match (case-insensitive) in `text`.
 * Falls back to a prefix when no match is found.
 */
function buildSnippet(text: string, q: string, maxLen = 200): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) {
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
 * Heuristic JS-side score (used for manifesto + mapa, which are Json and
 * cannot easily use Postgres FTS without a generated column). Mirrors the
 * Wave 13.2 behavior so existing clients see no regression.
 */
function scoreMatch(text: string, q: string): number {
  if (!text || !q) return 0;
  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  let score = 60;
  if (new RegExp(`\\b${qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)) {
    score += 25;
  }
  if (lower.startsWith(qLower)) score += 15;
  const lengthFactor = Math.max(0, 1 - text.length / 4000);
  score += Math.round(lengthFactor * 10);
  return Math.min(100, score);
}

const PILAR_FIELD_MAP: Record<SearchPilar, string> = {
  astrologia: 'astrologyMap',
  cabala: 'kabalisticMap',
  tantrica: 'tantricMap',
  odu: 'oduBirth',
};

const PILAR_DISPLAY_NAME: Record<SearchPilar, string> = {
  astrologia: 'Astrologia',
  cabala: 'Cabala',
  tantrica: 'Tântrica',
  odu: 'Odu',
};

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
    since: searchParams.get('since') ?? undefined,
    until: searchParams.get('until') ?? undefined,
    pilar: searchParams.get('pilar') ?? undefined,
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
  const { q, type, since, until, pilar, limit } = parsed.data;
  const lang = resolveLang(request.headers.get('accept-language'));
  const t0 = Date.now();

  // Build the FTS date range (half-open, in UTC) for the typed timestamps.
  const sinceDate = since ? new Date(`${since}T00:00:00.000Z`) : undefined;
  const untilExclusive = until
    ? new Date(`${until}T00:00:00.000Z`)
    : undefined;
  // Note: we use exclusive upper bound by adding 1 day for "until" inclusive semantics.
  const untilDate = untilExclusive
    ? new Date(untilExclusive.getTime() + 24 * 60 * 60 * 1000)
    : undefined;

  try {
    const results: SearchResult[] = [];
    const typesToQuery: SearchType[] =
      type === 'all' ? ['chat', 'diario', 'manifesto', 'mapa'] : [type];

    await Promise.all(
      typesToQuery.map(async (t) => {
        if (t === 'chat') {
          // FTS: tsvector(content) @@ websearch_to_tsquery(dictionary, q)
          // + ts_rank. Uses Prisma's tagged template — `:userId`, `:q`, `:limit`,
          // `:since`, `:until` are sent as parameterized values, NEVER interpolated
          // into the SQL string. SQL injection on `q` cannot escape the query.
          const rows = await prisma.$queryRaw<
            Array<{
              id: string;
              content: string;
              role: string;
              createdAt: Date;
              consultation_id: string;
              consultation_title: string | null;
              rank: number;
            }>
          >(Prisma.sql`
            SELECT
              m.id,
              m.content,
              m.role::text AS role,
              m."createdAt",
              c.id AS consultation_id,
              c.title AS consultation_title,
              ts_rank(
                to_tsvector(${lang}::regconfig, m.content),
                websearch_to_tsquery(${lang}::regconfig, ${q})
              ) AS rank
            FROM "chat_messages" m
            INNER JOIN "consultations" c ON c.id = m."consultationId"
            WHERE c."userId" = ${userId}
              AND to_tsvector(${lang}::regconfig, m.content)
                  @@ websearch_to_tsquery(${lang}::regconfig, ${q})
              ${sinceDate ? Prisma.sql`AND m."createdAt" >= ${sinceDate}` : Prisma.empty}
              ${untilDate ? Prisma.sql`AND m."createdAt" < ${untilDate}` : Prisma.empty}
            ORDER BY rank DESC, m."createdAt" DESC
            LIMIT ${limit}
          `);
          for (const m of rows) {
            results.push({
              type: 'chat',
              id: m.id,
              title:
                m.consultation_title ??
                `Conversa com o Mentor — ${new Date(m.createdAt).toLocaleDateString('pt-BR')}`,
              snippet: buildSnippet(m.content, q),
              score: rankToScore(m.rank),
              href: `/pt-BR/oraculo?consultationId=${m.consultation_id}#msg-${m.id}`,
              createdAt: m.createdAt.toISOString(),
              meta: {
                role: m.role,
                consultationId: m.consultation_id,
                rank: Number(m.rank.toFixed(4)),
              },
            });
          }
        } else if (t === 'diario') {
          // FTS over climate || ' ' || alert. date range filters on the
          // canonical `date` column (which is a date, not a timestamp).
          const rows = await prisma.$queryRaw<
            Array<{
              id: string;
              climate: string;
              alert: string;
              date: Date;
              createdAt: Date;
              rank: number;
            }>
          >(Prisma.sql`
            SELECT
              id,
              climate,
              alert,
              date,
              "createdAt",
              ts_rank(
                to_tsvector(${lang}::regconfig, climate || ' ' || alert),
                websearch_to_tsquery(${lang}::regconfig, ${q})
              ) AS rank
            FROM "daily_readings"
            WHERE "userId" = ${userId}
              AND to_tsvector(${lang}::regconfig, climate || ' ' || alert)
                  @@ websearch_to_tsquery(${lang}::regconfig, ${q})
              ${sinceDate ? Prisma.sql`AND date >= ${sinceDate}` : Prisma.empty}
              ${untilDate ? Prisma.sql`AND date < ${untilDate}` : Prisma.empty}
            ORDER BY rank DESC, date DESC
            LIMIT ${limit}
          `);
          for (const r of rows) {
            const text = `${r.climate}\n${r.alert}`;
            results.push({
              type: 'diario',
              id: r.id,
              title: `Diário de ${new Date(r.date).toLocaleDateString('pt-BR')}`,
              snippet: buildSnippet(text, q),
              score: rankToScore(r.rank),
              href: `/pt-BR/diario?data=${r.date.toISOString().slice(0, 10)}`,
              createdAt: r.createdAt.toISOString(),
              meta: {
                date: r.date.toISOString().slice(0, 10),
                hasAlert: r.alert.length > 0,
                rank: Number(r.rank.toFixed(4)),
              },
            });
          }
        } else if (t === 'manifesto') {
          // Manifesto.content is Json — FTS over Json is not directly available
          // without a generated column. We fetch the user's single manifesto
          // and apply a substring + date filter in JS. (Manifesto is 1:1 per
          // user; the dataset is tiny.)
          const m = await prisma.manifesto.findUnique({
            where: { userId },
            select: {
              id: true,
              content: true,
              tokensUsed: true,
              createdAt: true,
            },
          });
          if (m) {
            if (sinceDate && m.createdAt < sinceDate) return;
            if (untilDate && m.createdAt >= untilDate) return;
            const text = JSON.stringify(m.content);
            if (!text.toLowerCase().includes(q.toLowerCase())) return;
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
          // BirthChart: 4 Pilar Json fields. When `pilar` is given, only
          // search that column; otherwise search all 4. BirthChart is
          // unique on userId (at most 1 row per user).
          const c = await prisma.birthChart.findUnique({
            where: { userId },
            select: {
              id: true,
              astrologyMap: true,
              kabalisticMap: true,
              tantricMap: true,
              oduBirth: true,
              updatedAt: true,
            },
          });
          if (!c) return;
          if (sinceDate && c.updatedAt < sinceDate) return;
          if (untilDate && c.updatedAt >= untilDate) return;
          const pilarsToCheck: SearchPilar[] = pilar
            ? [pilar]
            : (['astrologia', 'cabala', 'tantrica', 'odu'] as SearchPilar[]);
          const matchedPilar = pilarsToCheck.find((p) => {
            const raw = c[PILAR_FIELD_MAP[p] as keyof typeof c] as
              | unknown
              | null
              | undefined;
            if (!raw) return false;
            return JSON.stringify(raw).toLowerCase().includes(q.toLowerCase());
          });
          if (!matchedPilar) return;
          const text = pilarsToCheck
            .map((p) => {
              const raw = c[PILAR_FIELD_MAP[p] as keyof typeof c] as
                | unknown
                | null
                | undefined;
              return raw ? JSON.stringify(raw) : '';
            })
            .join('\n');
          results.push({
            type: 'mapa',
            id: c.id,
            title: `Mapa Akáshico — ${PILAR_DISPLAY_NAME[matchedPilar]}`,
            snippet: buildSnippet(text, q),
            score: scoreMatch(text, q),
            href: '/pt-BR/mandala',
            createdAt: c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
            meta: { pilar: PILAR_DISPLAY_NAME[matchedPilar] },
          });
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
      lang,
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
