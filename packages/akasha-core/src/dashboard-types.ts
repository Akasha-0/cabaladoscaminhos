/**
 * Dashboard Types for Akasha OS v0.0.14
 */

/**
 * Estatísticas gerais do dashboard do usuário
 */
export interface DashboardStats {
  userId: string;
  totalRituals: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;        // Percentual 0-100
  lastRitualDate: string | null;
  weeklyProgress: number[];       // [seg, ter, qua, qui, sex, sáb, dom]
  monthlyProgress: number[];      // 30 dias
}

/**
 * Um dia no calendário de streak
 */
export interface StreakDay {
  date: string;                  // ISO date string (YYYY-MM-DD)
  completed: boolean;
  ritualType?: string;           // Opcional: tipo do ritual completado
}

/**
 * Item no histórico de rituais
 */
export interface RitualHistoryItem {
  id: string;
  date: string;                  // ISO date string
  ritualName: string;
  ritualLevel: 'shadow' | 'gift' | 'siddhi';
  completedAt: string;            // ISO datetime string
  duration?: number;              // segundos
  grimoireId?: string;
}

/**
 * Dados para completar um ritual (POST body)
 */
export interface RitualCompletionData {
  ritualName: string;
  ritualLevel: 'shadow' | 'gift' | 'siddhi';
  grimoireId?: string;
  duration?: number;
}

/**
 * Resposta da API de completude de ritual
 */
export interface RitualCompletionResponse {
  success: boolean;
  stats: DashboardStats;
  streakUpdated: {
    current: number;
    longest: number;
  };
}

/**
 * Configuração de visualização do dashboard
 */
export interface DashboardViewConfig {
  showWeeklyChart: boolean;
  showMonthlyChart: boolean;
  showStreakCalendar: boolean;
  showHistoryList: boolean;
  historyLimit: number;          // Quantos itens mostrar no histórico
}
