/**
 * GET /api/daily-reflection — Daily reflection prompt (Wave 25)
 * ============================================================================
 * Retorna o convite de reflexão do dia para o usuário autenticado.
 *
 * FLUXO:
 *   1. Identifica viewer (auth.getViewer ou dev header)
 *   2. Se anônimo → 401 (a reflexão é pessoal — exige login)
 *   3. Lê tradição ativa do SpiritualProfile (se houver); fallback 'universal'
 *   4. Lê reflexão de hoje (idempotente via @@unique[userId, date])
 *   5. Se já existe → retorna
 *   6. Se não existe:
 *      a. Coleta últimos 7 dias de promptIds (anti-repetição)
 *      b. Seleciona novo prompt via algoritmo determinístico
 *      c. Persiste em DailyReflection (caminhoDeVida do profile em cache)
 *      d. Retorna
 *
 * ANTI-REPETIÇÃO: 7 dias de janela. Com 10 universais + 5 por tradição,
 * o algoritmo percorre até 5 candidatos antes do fallback.
 *
 * CACHE: o endpoint é determinístico por (userId, date), então faz sentido
 * cachear no client (HTTP cache 1h stale-while-revalidate 24h). Como cada
 * usuário só vê a sua, o cache é per-user via cookie/localStorage.
 *
 * MOBILE-FIRST: payload < 1KB, JSON simples, sem dependências externas.
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/community/auth";
import { selectDailyPrompt } from "@/lib/daily-reflection/select";
import { logger } from "@/lib/logging";
import { withLogging } from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// Query schema
// ============================================================================
//
// A data é OPCIONAL: se o client omitir, usamos a data de hoje UTC.
// Isso facilita o uso no SSR sem precisar de client-side state.
//
const QuerySchema = z.object({
  /** YYYY-MM-DD. Opcional. Default: hoje UTC. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date deve ser YYYY-MM-DD")
    .optional(),
});

// ============================================================================
// Helpers
// ============================================================================

function todayUtcDateString(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateString(s: string): Date {
  // YYYY-MM-DD → Date em UTC 00:00:00 (idempotente)
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Anti-repetição: IDs dos últimos N dias (inclusive hoje). */
async function getRecentPromptIds(userId: string, daysBack: number): Promise<string[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const rows = await prisma.dailyReflection.findMany({
    where: { userId, date: { gte: since } },
    select: { promptId: true },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => r.promptId);
}

// ============================================================================
// Handler
// ============================================================================

async function handler(request: NextRequest): Promise<NextResponse> {
  // 1. Viewer
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json(
      { error: "Autenticação necessária para acessar reflexão diária." },
      { status: 401 },
    );
  }

  // 2. Parse query
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const dateStr = parsed.data.date ?? todayUtcDateString();
  const date = parseDateString(dateStr);

  // 3. Já existe? (idempotência)
  const existing = await prisma.dailyReflection.findUnique({
    where: { userId_date: { userId: viewer.id, date } },
  });

  if (existing) {
    return NextResponse.json(
      {
        id: existing.id,
        date: existing.date.toISOString().slice(0, 10),
        tradition: existing.tradition,
        promptId: existing.promptId,
        locale: existing.locale,
        source: existing.source,
        caminhoDeVida: existing.caminhoDeVida,
        cached: true,
      },
      {
        headers: {
          // Cache por 1h no client; SWR por 24h (já que amanhã = outro prompt)
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  }

  // 4. Coletar tradição + histórico
  const [profile, recentIds] = await Promise.all([
    prisma.spiritualProfile.findUnique({
      where: { userId: viewer.id },
      select: { caminhoDeVida: true, oduNascimento: true, orixaRegente: true },
    }),
    getRecentPromptIds(viewer.id, 7),
  ]);

  const tradition = profile?.orixaRegente ? "universal" : "universal";
  // ^ placeholder: espiritualProfile não tem campo "tradição ativa" canônico
  // ainda. Mantemos 'universal' por enquanto. Quando tivermos o campo
  // `tradiçãoAtiva` no profile, trocamos aqui.
  // TODO: substituir por `profile.traditionAtiva` quando existir.

  // 5. Selecionar prompt
  const selected = selectDailyPrompt({
    date: dateStr,
    userId: viewer.id,
    tradition,
    recentPromptIds: recentIds,
  });

  // 6. Persistir (best-effort: se der conflito de race, lê o existente)
  try {
    const created = await prisma.dailyReflection.create({
      data: {
        userId: viewer.id,
        date,
        tradition: selected.tradition,
        promptId: selected.id,
        locale: selected.locale,
        source: "CURATED",
        caminhoDeVida: profile?.caminhoDeVida ?? null,
        context: {
          tone: selected.tone,
          skippedCount: selected.skippedCount,
          odu: profile?.oduNascimento ?? null,
          orixa: profile?.orixaRegente ?? null,
        },
      },
    });

    logger.info("[daily-reflection] created", {
      userId: viewer.id,
      promptId: selected.id,
      tradition: selected.tradition,
      skipped: selected.skippedCount,
    });

    return NextResponse.json(
      {
        id: created.id,
        date: dateStr,
        tradition: created.tradition,
        promptId: created.promptId,
        text: selected.text,
        locale: created.locale,
        source: created.source,
        caminhoDeVida: created.caminhoDeVida,
        cached: false,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    // Race condition: outro request criou no mesmo instante.
    // Lê o que ficou persistido e retorna.
    const raced = await prisma.dailyReflection.findUnique({
      where: { userId_date: { userId: viewer.id, date } },
    });
    if (raced) {
      return NextResponse.json(
        {
          id: raced.id,
          date: dateStr,
          tradition: raced.tradition,
          promptId: raced.promptId,
          locale: raced.locale,
          source: raced.source,
          cached: true,
        },
        { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400" } },
      );
    }
    logger.error("[daily-reflection] failed to persist", {
      userId: viewer.id,
      error: String(err),
    });
    return NextResponse.json(
      { error: "Falha ao persistir reflexão diária" },
      { status: 500 },
    );
  }
}

export const GET = withLogging(handler, { path: "/api/daily-reflection" });