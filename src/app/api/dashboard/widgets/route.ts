// ============================================================
// DASHBOARD WIDGETS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const WidgetTypeSchema = z.enum(['quick-stats', 'recent-activity', 'daily-affirmation', 'upcoming-rituals']);
const WidgetQuerySchema = z.object({
  type: WidgetTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(10).optional(),
});
interface WidgetData {
  id: string;
  type: string;
  title: string;
  data: Record<string, unknown>;
  updatedAt: string;
}
interface QuickStats {
  totalSessions: number;
  streakDays: number;
  totalCredits: number;
  activeRituals: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface DailyAffirmation {
  text: string;
  theme: string;
  source: string;
}

interface UpcomingRitual {
  id: string;
  name: string;
  date: string;
  time: string;
  category: string;
}

const AFFIRMATIONS: DailyAffirmation[] = [
  { text: "Eu sou a luz que ilumina meu caminho interior.", theme: "iluminação", source: "Cabala" },
  { text: "As sementes da minha intenção germinam no tempo divino.", theme: "intenção", source: "Meditação" },
  { text: "Cada respiração conecta-me à energia universal.", theme: "energia", source: "Respiração" },
  { text: "Minha árvore cresce através das águas da sabedoria.", theme: "sabedoria", source: "Árvore da Vida" },
  { text: "O universo conspira a meu favor em cada momento.", theme: "abundância", source: "Manifestação" },
];

function getQuickStats(): QuickStats {
  return {
    totalSessions: 47,
    streakDays: 12,
    totalCredits: 850,
    activeRituals: 3,
  };
}

function getRecentActivity(): ActivityItem[] {
  return [
    { id: "1", type: "meditation", description: "Sessão de meditação guiada - 15min", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "2", type: "ritual", description: "Ritual de proteção completado", timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: "3", type: "tarot", description: "Leitura tarot do dia", timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: "4", type: "breathwork", description: "Prática de respiração 4-7-8", timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];
}

function getDailyAffirmation(): DailyAffirmation {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

function getUpcomingRituals(): UpcomingRitual[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { id: "1", name: "Ritual da Lua Cheia", date: nextWeek.toISOString().split("T")[0], time: "20:00", category: "celestial" },
    { id: "2", name: "Purificação Energética", date: tomorrow.toISOString().split("T")[0], time: "18:00", category: "limpeza" },
    { id: "3", name: "Meditação Sefirot", date: tomorrow.toISOString().split("T")[0], time: "07:00", category: "cabala" },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = WidgetQuerySchema.safeParse({
      type: searchParams.get('type') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type: widgetType, limit } = parseResult.data;
    let widgets: WidgetData[] = [];
    if (!widgetType) {
      widgets = [
        { id: 'quick-stats', type: 'quick-stats', title: 'Estatísticas Rápidas', data: getQuickStats() as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() },
        { id: 'recent-activity', type: 'recent-activity', title: 'Atividade Recente', data: { items: getRecentActivity() } as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() },
        { id: 'daily-affirmation', type: 'daily-affirmation', title: 'Afirmação do Dia', data: getDailyAffirmation() as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() },
        { id: 'upcoming-rituals', type: 'upcoming-rituals', title: 'Próximos Rituais', data: { rituals: getUpcomingRituals() } as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() },
      ];
    } else {
      switch (widgetType) {
        case 'quick-stats':
          widgets = [{ id: 'quick-stats', type: 'quick-stats', title: 'Estatísticas Rápidas', data: getQuickStats() as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() }];
          break;
        case 'recent-activity':
          widgets = [{ id: 'recent-activity', type: 'recent-activity', title: 'Atividade Recente', data: { items: getRecentActivity() } as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() }];
          break;
        case 'daily-affirmation':
          widgets = [{ id: 'daily-affirmation', type: 'daily-affirmation', title: 'Afirmação do Dia', data: getDailyAffirmation() as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() }];
          break;
        case 'upcoming-rituals':
          widgets = [{ id: 'upcoming-rituals', type: 'upcoming-rituals', title: 'Próximos Rituais', data: { rituals: getUpcomingRituals() } as unknown as Record<string, unknown>, updatedAt: new Date().toISOString() }];
          break;
        default:
          return NextResponse.json({ error: 'Widget type not found' }, { status: 404 });
      }
    }
    if (limit && limit < widgets.length) {
      widgets = widgets.slice(0, limit);
    }
    return NextResponse.json({ widgets, timestamp: new Date().toISOString() }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
