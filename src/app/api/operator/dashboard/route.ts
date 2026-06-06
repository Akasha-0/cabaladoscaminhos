// ============================================================
// API ROUTE — Dashboard B2B (Onda E / Doc 05 §3)
// ============================================================
// GET /api/operator/dashboard
// Autenticação via requireOperator (JWT cookie ou dev-header).
// Devolve métricas e últimas 5 leituras do operador.

import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operatorId = operatorOrResponse.id;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Métricas em paralelo
  const [readingsThisMonth, totalClients, readingsToday, recentReadings] = await Promise.all([
    prisma.reading.count({
      where: { operatorId, createdAt: { gte: startOfMonth } },
    }),
    prisma.client.count(),
    prisma.reading.count({
      where: { operatorId, createdAt: { gte: startOfToday } },
    }),
    prisma.reading.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: { select: { id: true, fullName: true } } },
    }),
  ]);

  return NextResponse.json({
    metrics: {
      readingsThisMonth,
      totalClients,
      readingsToday,
    },
    recentReadings: recentReadings.map((r) => ({
      id: r.id,
      clientId: r.client.id,
      clientName: r.client.fullName,
      date: r.createdAt,
      status: r.status,
    })),
  });
}
