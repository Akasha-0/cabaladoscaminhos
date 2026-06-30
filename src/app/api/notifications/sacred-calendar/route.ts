// ============================================================================
// API /api/notifications/sacred-calendar — calendário de datas sagradas (W30)
// ============================================================================
// GET /api/notifications/sacred-calendar?days=30&tradition=CANDOMBLE&region=BR
//
// Retorna eventos sagrados nos próximos N dias (default 30, max 365),
// filtráveis por tradição e região.
//
// Sem auth obrigatória — é conteúdo público/consultivo. Se o user estiver
// autenticado, anotamos suas preferências (tradição principal) na resposta.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ============================================================================
// Schema
// ============================================================================

const QuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  tradition: z
    .enum(['CANDOMBLE', 'UMBANDA', 'IFA', 'ESOTERICA', 'ECUMENICA', 'WICCA', 'UNIVERSAL'])
    .optional(),
  region: z.string().max(10).optional(), // ex: "BR-SP", "BR-RJ"
  minWeight: z.coerce.number().int().min(1).max(5).default(1),
});

// ============================================================================
// Helper — ocorrências recorrentes
// ============================================================================

/**
 * Gera ocorrências de eventos recorrentes anuais dentro do range.
 * Ex: Equinócio de Outono (recorrente) gera 1 evento/ano.
 */
function expandRecurring(
  base: { id: string; date: Date; endDate: Date | null; name: string; tradition: string; weight: number; regions: unknown; description: string | null; suggestedTone: string; messageTemplate: string | null; recurring: boolean },
  startUtc: Date,
  endUtc: Date
): Array<{ date: Date; base: typeof base }> {
  if (!base.recurring) {
    return base.date >= startUtc && base.date <= endUtc ? [{ date: base.date, base }] : [];
  }
  const occurrences: Array<{ date: Date; base: typeof base }> = [];
  // Itera ano a ano de start.year até end.year.
  const startYear = startUtc.getUTCFullYear();
  const endYear = endUtc.getUTCFullYear();
  for (let y = startYear; y <= endYear; y++) {
    const occ = new Date(base.date);
    occ.setUTCFullYear(y);
    if (occ >= startUtc && occ <= endUtc) {
      occurrences.push({ date: occ, base });
    }
  }
  return occurrences;
}

// ============================================================================
// GET
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = QuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { days, tradition, region, minWeight } = parsed.data;

    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Carrega base do DB
    const rows = await prisma.sacredCalendar.findMany({
      where: {
        ...(tradition ? { tradition } : {}),
        weight: { gte: minWeight },
        // Pega eventos base cuja date cai dentro de ±1 ano do range
        // (recorrentes serão expandidos em código).
        date: {
          gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          lte: new Date(end.getTime() + 365 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: [{ date: 'asc' }, { weight: 'desc' }],
    });

    // Expande recorrentes e filtra por range
    const expanded: Array<{
      id: string;
      date: string;
      name: string;
      tradition: string;
      weight: number;
      description: string | null;
      suggestedTone: string;
      messageTemplate: string | null;
      daysFromNow: number;
    }> = [];

    for (const row of rows) {
      // Filtra por região se especificado
      if (region && row.regions) {
        const regions = row.regions as string[];
        if (Array.isArray(regions) && !regions.includes(region)) continue;
      }
      const occs = expandRecurring(row, now, end);
      for (const occ of occs) {
        const daysFromNow = Math.ceil(
          (occ.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );
        expanded.push({
          id: `${row.id}:${occ.date.getUTCFullYear()}`,
          date: occ.date.toISOString().slice(0, 10),
          name: row.name,
          tradition: row.tradition,
          weight: row.weight,
          description: row.description,
          suggestedTone: row.suggestedTone,
          messageTemplate: row.messageTemplate,
          daysFromNow,
        });
      }
    }

    // Ordena por proximidade + peso
    expanded.sort((a, b) => a.daysFromNow - b.daysFromNow || b.weight - a.weight);

    return NextResponse.json({
      rangeStart: now.toISOString().slice(0, 10),
      rangeEnd: end.toISOString().slice(0, 10),
      count: expanded.length,
      events: expanded,
    });
  } catch (err) {
    console.error('[api/notifications/sacred-calendar][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao listar calendário sagrado' },
      { status: 500 }
    );
  }
}
