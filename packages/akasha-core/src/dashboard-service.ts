/**
 * Dashboard Service - Gerencia estatísticas e histórico do usuário
 */
import type {
  DashboardStats,
  StreakDay,
  RitualHistoryItem,
  RitualCompletionData,
  RitualCompletionResponse,
} from './dashboard-types';

// ─── Date Helpers ───────────────────────────────────────────────────────────────

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function getWeekDates(): Date[] {
  const dates: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

/**
 * Calcula o streak atual a partir de uma lista de datas de rituais completados
 */
export function calculateStreak(completedDates: Date[]): {
  current: number;
  longest: number;
} {
  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Ordena datas decrescente (mais recente primeiro)
  const sorted = [...completedDates].sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verifica se o streak atual está ativo (ritual hoje ou ontem)
  const mostRecent = sorted[0];
  const daysSinceLast = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLast > 1) {
    // Streak quebrado
    currentStreak = 0;
  } else {
    // Conta streak atual
    currentStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.floor(
        (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calcula longest streak
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor(
      (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
}

// ─── Dashboard Service ─────────────────────────────────────────────────────────

export class DashboardService {
  private prisma: any;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  /**
   * Obtém estatísticas do dashboard para um usuário
   */
  async getStats(userId: string): Promise<DashboardStats> {
    // Buscar completudes de rituais
    const completions = await this.prisma.ritualCompletion.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
    });

    const completedDates = completions.map((c: any) => new Date(c.date));
    const streakData = calculateStreak(completedDates);

    // Calcular progresso semanal
    const weekDates = getWeekDates();
    const weeklyProgress = weekDates.map((date) => {
      const dateStr = getDateString(date);
      return completions.some((c: any) => getDateString(new Date(c.date)) === dateStr) ? 1 : 0;
    });

    // Calcular progresso mensal (últimos 30 dias)
    const monthlyProgress: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = getDaysAgo(i);
      const dateStr = getDateString(date);
      monthlyProgress.push(
        completions.some((c: any) => getDateString(new Date(c.date)) === dateStr) ? 1 : 0
      );
    }

    // Calcular taxa de completude (últimos 30 dias)
    const last30Days = completions.filter((c: any) => {
      const cDate = new Date(c.date);
      return cDate >= getDaysAgo(30);
    });
    const completionRate = (monthlyProgress.filter((v) => v === 1).length / 30) * 100;

    return {
      userId,
      totalRituals: completions.length,
      currentStreak: streakData.current,
      longestStreak: streakData.longest,
      completionRate: Math.round(completionRate * 10) / 10,
      lastRitualDate: completions[0] ? getDateString(completions[0].date) : null,
      weeklyProgress,
      monthlyProgress,
    };
  }

  /**
   * Obtém dias de streak para o calendário (últimos 60 dias)
   */
  async getStreak(userId: string): Promise<StreakDay[]> {
    const completions = await this.prisma.ritualCompletion.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 60,
    });

    const completedDates = new Set(completions.map((c: any) => getDateString(new Date(c.date))));

    const days: StreakDay[] = [];
    for (let i = 59; i >= 0; i--) {
      const date = getDaysAgo(i);
      const dateStr = getDateString(date);
      days.push({
        date: dateStr,
        completed: completedDates.has(dateStr),
      });
    }

    return days;
  }

  /**
   * Obtém histórico de rituais completados
   */
  async getHistory(userId: string, limit: number = 20): Promise<RitualHistoryItem[]> {
    const completions = await this.prisma.ritualCompletion.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return completions.map((c: any, index: number) => ({
      id: c.id,
      date: getDateString(new Date(c.date)),
      ritualName: `Ritual ${index + 1}`,
      ritualLevel: 'gift' as const,
      completedAt: c.date.toISOString(),
      grimoireId: c.grimoireId,
    }));
  }

  /**
   * Salva completude de ritual e atualiza estatísticas
   */
  async saveRitualCompletion(
    userId: string,
    data: RitualCompletionData
  ): Promise<RitualCompletionResponse> {
    // Salvar completude
    const completion = await this.prisma.ritualCompletion.create({
      data: {
        userId,
        grimoireId: data.grimoireId || 'daily-ritual',
        date: new Date(),
      },
    });

    // Atualizar ou criar DashboardStats
    const existingStats = await this.prisma.dashboardStats.findUnique({
      where: { userId },
    });

    const currentStats = await this.getStats(userId);

    if (existingStats) {
      await this.prisma.dashboardStats.update({
        where: { userId },
        data: {
          totalRituals: currentStats.totalRituals,
          currentStreak: currentStats.currentStreak,
          longestStreak: currentStats.longestStreak,
          completionRate: currentStats.completionRate,
          lastRitualAt: new Date(),
        },
      });
    } else {
      await this.prisma.dashboardStats.create({
        data: {
          userId,
          totalRituals: 1,
          currentStreak: 1,
          longestStreak: 1,
          completionRate: currentStats.completionRate,
          lastRitualAt: new Date(),
          weeklyProgress: JSON.stringify(currentStats.weeklyProgress),
          monthlyProgress: JSON.stringify(currentStats.monthlyProgress),
        },
      });
    }

    return {
      success: true,
      stats: currentStats,
      streakUpdated: {
        current: currentStats.currentStreak,
        longest: currentStats.longestStreak,
      },
    };
  }
}
