/**
 * @akasha/portal — Dashboard Mocks
 *
 * Dados mockados realistas para desenvolvimento e fallback.
 */
import type { DashboardStats, StreakDay, RitualHistoryItem } from '@akasha/core';

// ─── Mock Stats ─────────────────────────────────────────────────────────────

export const mockStats: DashboardStats = {
  userId: 'user_akasha_dev_001',
  totalRituals: 42,
  currentStreak: 7,
  longestStreak: 14,
  completionRate: 87,
  lastRitualDate: '2026-06-08',
  weeklyProgress: [1, 1, 1, 1, 1, 1, 1], // Semana completa
  monthlyProgress: [
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1, // Dias 1-10
    1,
    0,
    1,
    1,
    1,
    0,
    1,
    1,
    1,
    0, // Dias 11-20
    1,
    1,
    0,
    1,
    1,
    1,
    0,
    1,
    1,
    0, // Dias 21-30
  ],
};

// ─── Mock Streak Calendar ────────────────────────────────────────────────────

function generateStreakDays(): StreakDay[] {
  const days: StreakDay[] = [];
  const today = new Date('2026-06-09');

  // Padrão: dias alternados com mais completados na semana
  const completionPattern = [
    // Semanas: seg, ter, qua, qui, sex, sáb, dom
    [1, 1, 1, 1, 1, 1, 1], // semana 1
    [1, 0, 1, 1, 1, 0, 1], // semana 2
    [1, 1, 1, 0, 1, 1, 1], // semana 3
    [1, 1, 1, 1, 1, 1, 0], // semana 4
    [1, 1, 0, 1, 1, 0, 1], // semana 5
    [1, 1, 1, 1, 1, 1, 1], // semana 6
    [1, 1, 1, 1, 1, 1, 0], // semana 7
    [1, 0, 1, 1, 0, 1, 0], // semana 8
    [0, 0, 0, 0, 0, 0, 0], // semana 9 (futuro)
  ];

  const ritualTypes = ['oracao-manha', 'meditacao', 'leitura-grimorio', 'ritual-completo'];

  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const weekIndex = Math.floor((59 - i) / 7);
    const dayOfWeek = (59 - i) % 7;

    const completed = weekIndex < 8 && completionPattern[weekIndex]?.[dayOfWeek] === 1;

    days.push({
      date: date.toISOString().split('T')[0],
      completed,
      ritualType: completed
        ? ritualTypes[Math.floor(Math.random() * ritualTypes.length)]
        : undefined,
    });
  }

  return days;
}

export const mockStreak: StreakDay[] = generateStreakDays();

// ─── Mock History ────────────────────────────────────────────────────────────

export const mockHistory: RitualHistoryItem[] = [
  {
    id: 'ritual_001',
    date: '2026-06-08',
    ritualName: 'Ritual Matinal de Ori',
    ritualLevel: 'siddhi',
    completedAt: '2026-06-08T06:30:00Z',
    duration: 2700,
    grimoireId: 'grimorio_ifa_01',
  },
  {
    id: 'ritual_002',
    date: '2026-06-07',
    ritualName: 'Meditação I Ching',
    ritualLevel: 'gift',
    completedAt: '2026-06-07T21:00:00Z',
    duration: 1800,
  },
  {
    id: 'ritual_003',
    date: '2026-06-06',
    ritualName: 'Oração aos Orixás',
    ritualLevel: 'shadow',
    completedAt: '2026-06-06T06:15:00Z',
    duration: 1200,
  },
  {
    id: 'ritual_004',
    date: '2026-06-05',
    ritualName: 'Leitura do Grimório',
    ritualLevel: 'gift',
    completedAt: '2026-06-05T20:30:00Z',
    duration: 3600,
    grimoireId: 'grimorio_cabala_02',
  },
  {
    id: 'ritual_005',
    date: '2026-06-04',
    ritualName: 'Ritual de Transformação',
    ritualLevel: 'siddhi',
    completedAt: '2026-06-04T07:00:00Z',
    duration: 5400,
  },
  {
    id: 'ritual_006',
    date: '2026-06-03',
    ritualName: 'Prática de Separação',
    ritualLevel: 'shadow',
    completedAt: '2026-06-03T18:00:00Z',
    duration: 900,
  },
  {
    id: 'ritual_007',
    date: '2026-06-02',
    ritualName: 'Meditação Akáshica',
    ritualLevel: 'gift',
    completedAt: '2026-06-02T20:00:00Z',
    duration: 2400,
  },
  {
    id: 'ritual_008',
    date: '2026-06-01',
    ritualName: 'Ritual do Hexagrama',
    ritualLevel: 'siddhi',
    completedAt: '2026-06-01T06:45:00Z',
    duration: 3000,
  },
  {
    id: 'ritual_009',
    date: '2026-05-31',
    ritualName: 'Oração Noturna',
    ritualLevel: 'shadow',
    completedAt: '2026-05-31T22:00:00Z',
    duration: 600,
  },
  {
    id: 'ritual_010',
    date: '2026-05-30',
    ritualName: 'Estudo da Tradição',
    ritualLevel: 'gift',
    completedAt: '2026-05-30T19:00:00Z',
    duration: 4500,
    grimoireId: 'grimorio_ifa_01',
  },
];

// ─── Combined Mock Data ───────────────────────────────────────────────────────

export const mockDashboardData = {
  stats: mockStats,
  streak: mockStreak,
  history: mockHistory,
};
