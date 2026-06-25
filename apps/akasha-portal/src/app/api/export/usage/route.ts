/**
 * /api/export/usage — LGPD Art. 18 (V)
 *
 * Retorna o histórico de uso do sistema pelo usuário autenticado:
 * CreditEntry ledger + metadados de Subscription (plano, quota, status).
 *
 * Suporta dois formatos via query string:
 *   - ?format=csv (default) — RFC 4180
 *   - ?format=json — payload estruturado
 *
 * LGPD: apenas dados do próprio usuário; sem PII de terceiros.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// RFC 4180 escaping: envolver em aspas se contém vírgula, aspas ou quebra de linha
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(entries: Array<{
  id: string;
  delta: number;
  reason: string;
  balance: number;
  createdAt: Date;
}>): string {
  const header = ['id', 'createdAt', 'delta', 'reason', 'balance'];
  const rows = entries.map((e) =>
    [e.id, e.createdAt.toISOString(), e.delta, e.reason, e.balance]
      .map(csvEscape)
      .join(','),
  );
  // BOM para Excel reconhecer UTF-8 corretamente
  return '\uFEFF' + [header.join(','), ...rows].join('\n');
}

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'csv').toLowerCase();

  if (format !== 'csv' && format !== 'json') {
    return NextResponse.json(
      { error: 'Format inválido — use csv (default) ou json' },
      { status: 400 },
    );
  }

  const [entries, subscription, aggregate] = await Promise.all([
    prisma.creditEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        delta: true,
        reason: true,
        balance: true,
        createdAt: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        status: true,
        monthlyCreditQuota: true,
        currentPeriodEnd: true,
      },
    }),
    prisma.creditEntry.aggregate({
      where: { userId },
      _sum: { delta: true },
      _count: { _all: true },
    }),
  ]);

  if (format === 'csv') {
    const csv = toCsv(entries);
    const filename = `akasha-usage-${userId.slice(0, 8)}-${Date.now()}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // format === 'json'
  const payload = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    userId,
    summary: {
      totalEntries: aggregate._count._all,
      totalCreditsDelta: aggregate._sum.delta ?? 0,
      currentBalance:
        entries.length > 0 ? entries[entries.length - 1].balance : 0,
      plan: subscription?.plan ?? 'FREEMIUM',
      status: subscription?.status ?? null,
      monthlyCreditQuota: subscription?.monthlyCreditQuota ?? 0,
    },
    entries: entries.map((e: typeof entries[number]) => ({
      id: e.id,
      createdAt: e.createdAt.toISOString(),
      delta: e.delta,
      reason: e.reason,
      balance: e.balance,
    })),
  };

  const filename = `akasha-usage-${userId.slice(0, 8)}-${Date.now()}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}