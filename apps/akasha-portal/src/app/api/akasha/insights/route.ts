/**
 * GET /api/akasha/insights
 *
 * Wave 31.5 — Long-term Memory Distillation.
 *
 * Retorna top-N insights consolidados do (userId, workspaceId).
 * Default N=10, máximo 50.
 *
 * Auth: requer AKASHA_TOKEN (cookie httpOnly). Reusa o mesmo guard
 * do endpoint /api/akasha/mandato-do-dia.
 *
 * Query params:
 *   - workspaceId: string (obrigatório)
 *   - limit:       number (default 10, max 50)
 *
 * Response 200:
 *   { insights: [{ id, theme, content, confidence, pilarCounts,
 *                  sources, anchorMonth, createdAt, generatedBy }],
 *     count: number }
 *
 * Response 401: auth ausente.
 * Response 400: workspaceId ausente ou limit inválido.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import { PrismaStorage } from '@/lib/infrastructure/memory/prisma-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Auth — mesmo padrão do /api/akasha/mandato-do-dia
  const token = request.cookies.get(AKASHA_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Akasha token ausente' },
      { status: 401 }
    );
  }
  const auth = await verifyAkashaToken(token);
  if (!auth) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Token inválido ou expirado' },
      { status: 401 }
    );
  }

  // 2. Parse + valida query params
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json(
      { error: 'bad_request', message: 'workspaceId é obrigatório' },
      { status: 400 }
    );
  }

  const limitParam = url.searchParams.get('limit');
  let limit = DEFAULT_LIMIT;
  if (limitParam != null) {
    const parsed = Number.parseInt(limitParam, 10);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > MAX_LIMIT) {
      return NextResponse.json(
        {
          error: 'bad_request',
          message: `limit deve ser entre 1 e ${MAX_LIMIT}`,
        },
        { status: 400 }
      );
    }
    limit = parsed;
  }

  // 3. Lê top-N insights (multi-tenant isolation L4 — filtra por workspaceId)
  try {
    const storage = new PrismaStorage(
      prisma as unknown as ConstructorParameters<typeof PrismaStorage>[0]
    );
    const insights = await storage.listTop({
      userId: auth.sub,
      workspaceId,
      limit,
    });

    return NextResponse.json(
      {
        insights: insights.map((i) => ({
          id: i.id,
          theme: i.theme,
          content: i.content,
          confidence: i.confidence,
          pilarCounts: i.pilarCounts,
          sources: i.sources,
          anchorMonth: i.anchorMonth.toISOString(),
          createdAt: i.createdAt.toISOString(),
          generatedBy: i.generatedBy,
        })),
        count: insights.length,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'erro desconhecido';
    return NextResponse.json(
      { error: 'internal_error', message },
      { status: 500 }
    );
  }
}