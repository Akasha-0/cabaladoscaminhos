import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/auth/operator-session';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const DashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
  includeMetrics: z.enum(['all', 'spiritual', 'system']).optional(),
});

const MetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  namePt: z.string(),
  value: z.number(),
  unit: z.string(),
  trend: z.enum(['up', 'down', 'stable']),
  changePercent: z.number().optional(),
});

const DashboardDataSchema = z.object({
  systemStatus: z.object({
    status: z.enum(['operational', 'degraded', 'maintenance']),
    uptime: z.string(),
    activeConnections: z.number(),
    lastUpdate: z.string(),
  }),
  spiritualMetrics: z.object({
    totalUsers: z.number(),
    activeMeditations: z.number(),
    readingsToday: z.number(),
    ritualsCompleted: z.number(),
  }),
  metrics: z.array(MetricSchema),
});

// ─── Dashboard Data ────────────────────────────────────────────────────────

const ADMIN_DASHBOARD: z.infer<typeof DashboardDataSchema> = {
  systemStatus: {
    status: 'operational',
    uptime: '99.97%',
    activeConnections: 142,
    lastUpdate: new Date().toISOString(),
  },
  spiritualMetrics: {
    totalUsers: 2847,
    activeMeditations: 89,
    readingsToday: 156,
    ritualsCompleted: 43,
  },
  metrics: [
    { id: 'meditations', name: 'Meditations', namePt: 'Meditações', value: 8934, unit: 'sessões', trend: 'up', changePercent: 12.4 },
    { id: 'readings', name: 'Divinations', namePt: 'Leituras', value: 4521, unit: 'leituras', trend: 'up', changePercent: 8.7 },
    { id: 'rituals', name: 'Rituals', namePt: 'Rituais', value: 1876, unit: 'rituais', trend: 'stable', changePercent: 0.3 },
    { id: 'orixa-consultations', name: 'Orixá Consultations', namePt: 'Consultas Orixá', value: 2341, unit: 'consultas', trend: 'up', changePercent: 15.2 },
    { id: 'udu-readings', name: 'Odu Ifá Readings', namePt: 'Leituras Odu Ifá', value: 1243, unit: 'leituras', trend: 'down', changePercent: -2.1 },
    { id: 'nazarene-encounters', name: 'Jesus Encounters', namePt: 'Encontros Nazaré', value: 567, unit: 'encontros', trend: 'up', changePercent: 22.8 },
    { id: 'energy-harmonizations', name: 'Energy Harmonizations', namePt: 'Harmonizações', value: 3210, unit: 'harmonizações', trend: 'up', changePercent: 6.3 },
    { id: 'karmic-resolutions', name: 'Karmic Resolutions', namePt: 'Resoluções Cármicas', value: 445, unit: 'resoluções', trend: 'stable', changePercent: 0.1 },
  ],
};

export async function GET(request: NextRequest) {
  const authResult = await requireOperator(request);
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const parseResult = DashboardQuerySchema.safeParse({
    period: searchParams.get('period'),
    includeMetrics: searchParams.get('includeMetrics'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { includeMetrics } = parseResult.data;

  let dashboard = { ...ADMIN_DASHBOARD };
  if (includeMetrics === 'spiritual') {
    dashboard = { ...dashboard, metrics: dashboard.metrics.filter(m => ['meditations', 'readings', 'rituals', 'orixa-consultations', 'udu-readings'].includes(m.id)) };
  } else if (includeMetrics === 'system') {
    dashboard = { ...dashboard, metrics: dashboard.metrics.filter(m => ['energy-harmonizations', 'karmic-resolutions'].includes(m.id)) };
  }

  return NextResponse.json({
    success: true,
    dashboard,
    timestamp: new Date().toISOString(),
  });
}
