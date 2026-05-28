// ============================================================
// STREAK ALERT SYSTEM - CABALA DOS CAMINHOS
// ============================================================
// Notification system for streak preservation
// Warns users before streaks break with spiritual motivation
// ============================================================

import { Streak, getStreak } from '@/lib/gamification/streaks';

// ============================================================
// TYPES
// ============================================================

export type AlertUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface StreakAlert {
  id: string;
  userId: string;
  streak: number;
  urgency: AlertUrgency;
  title: string;
  message: string;
  motivation: string;
  scheduledFor: Date;
  triggered: boolean;
  createdAt: Date;
}

export interface ScheduleAlertInput {
  userId: string;
  hoursBeforeBreak?: number; // default 24
  customMessage?: string;
}

// ============================================================
// MOTIVATIONAL MESSAGES BY STREAK LENGTH
// ============================================================

const STREAK_MOTIVATIONS: Record<string, { title: string; message: string; motivation: string }> = {
  // First week
  '1': {
    title: 'Primeiro Dia Conquistado',
    message: 'Você começou sua jornada espiritual. Continue construindo sua prática.',
    motivation: 'Cada grande caminhada começa com um único passo. Seu compromisso com a luz interior já faz diferença.',
  },
  '3': {
    title: 'Início do Momentum',
    message: 'Três dias de prática consistente. Você está criando um novo hábito.',
    motivation: 'A energia que você cultiva agora reverbera através do tempo. Seu terceiro dia é a semente de uma jornada transformadora.',
  },
  '7': {
    title: 'Uma Semana de Compromisso',
    message: 'Sete dias de dedicação. Sua prática está ganhando força.',
    motivation: 'Uma semana de luz interior é como uma semente plantada no jardim da alma. Continue regando seu crescimento.',
  },
  '14': {
    title: 'Duas Semanas de Foco',
    message: 'Duas semanas demonstram sua determinação. O universo reconhece seu esforço.',
    motivation: 'A frequência vibrational que você estabeleceu começa a ressoar em todos os aspectos de sua vida.',
  },
  '21': {
    title: 'Três Semanas - Hábito Formado',
    message: '21 dias de prática criam um transformação real. Você está no caminho certo.',
    motivation: 'Como a árvore que cria raízes profundas, sua prática espiritual agora se enraíza em seu ser.',
  },
  '30': {
    title: 'Um Mês de Evolução',
    message: '30 dias de compromisso mostram sua verdadeira dedicação ao caminho.',
    motivation: 'Um mês de prática é um marco que poucos alcançam. Sua jornada está criando mudanças permanentes.',
  },
  '60': {
    title: 'Dois Meses de transformação',
    message: '60 dias de trabalho espiritual. Sua vida está mudando profundamente.',
    motivation: 'A luz que você irradia agora ilumina não apenas sua vida, mas a de aqueles ao seu redor.',
  },
  '90': {
    title: 'Três Meses - Mestre Iniciante',
    message: '90 dias de prática consistente. Você desenvolveu verdadeira disciplina.',
    motivation: 'O tempo investido em sua prática espiritual retorna multiplicado. Continue seu trabalho sagrado.',
  },
  '180': {
    title: 'Seis Meses de Disciplina',
    message: 'Meio ano de dedicação. Você está entre os poucos que persistem.',
    motivation: 'Sua prática agora é parte de quem você é. Continue evoluindo neste caminho iluminado.',
  },
  '365': {
    title: 'Um Ano de Jornada Completa',
    message: '365 dias de compromisso. Sua transformação é visível.',
    motivation: 'Um ano de prática é uma declaração de amor à sua própria alma. Você se tornou um farol de luz.',
  },
};

// ============================================================
// DEFAULT ALERT MESSAGES
// ============================================================

const DEFAULT_ALERT_MESSAGES: Record<AlertUrgency, { title: string; message: string }> = {
  low: {
    title: 'Lembrete de Prática',
    message: 'Mantenha sua prática espiritual ativa hoje.',
  },
  medium: {
    title: 'Aviso: Sua Sequência Está em Risco',
    message: 'Pratique hoje para não perder seu progresso.',
  },
  high: {
    title: 'Urgente: Último Dia Para Salvar Sua Sequência',
    message: 'Você perderá tudo se não praticar hoje.',
  },
  critical: {
    title: 'CRÍTICO: Sequência Será Perdida Hoje',
    message: 'A última chance de manter sua sequência sagrada.',
  },
};

// ============================================================
// ALERT CALCULATIONS
// ============================================================

function calculateUrgency(streak: number, hoursRemaining: number): AlertUrgency {
  if (hoursRemaining <= 4) return 'critical';
  if (hoursRemaining <= 12) return 'high';
  if (hoursRemaining <= 20) return 'medium';
  return 'low';
}

function getMotivationForStreak(streak: number): { title: string; message: string; motivation: string } {
  // Exact match first
  if (STREAK_MOTIVATIONS[String(streak)]) {
    return STREAK_MOTIVATIONS[String(streak)];
  }

  // Find the closest milestone below
  const milestones = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];
  let closest = 1;

  for (const milestone of milestones) {
    if (streak >= milestone) {
      closest = milestone;
    } else {
      break;
    }
  }

  const base = STREAK_MOTIVATIONS[String(closest)];

  // Add streak-specific encouragement
  return {
    ...base,
    motivation: `${base.motivation} Você está no dia ${streak} de sua jornada. Continue firme!`,
  };
}

function generateAlertId(): string {
  return `streak_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================
// IN-MEMORY STORE
// ============================================================

const alertStore = new Map<string, StreakAlert>();

// ============================================================
// SCHEDULE STREAK ALERT
// ============================================================

export interface ScheduleStreakAlertOptions {
  userId: string;
  hoursBeforeBreak?: number; // hours before midnight to trigger warning
  customTitle?: string;
  customMessage?: string;
  customMotivation?: string;
}

/**
 * Schedule a streak alert notification
 * Warns user before their streak breaks with spiritual motivation
 *
 * @param options - Configuration for the alert
 * @returns The scheduled alert object
 */
export function scheduleStreakAlert(options: ScheduleStreakAlertOptions): StreakAlert {
  const {
    userId,
    hoursBeforeBreak = 24,
    customTitle,
    customMessage,
    customMotivation,
  } = options;

  // Get current streak
  const streak: Streak = getStreak();

  // Calculate time remaining until streak would break
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const hoursRemaining = Math.max(0, (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60));
  const urgency = calculateUrgency(streak.current, hoursRemaining);

  // Get motivation based on streak length
  const motivationData = getMotivationForStreak(streak.current);

  // Build alert
  const alert: StreakAlert = {
    id: generateAlertId(),
    userId,
    streak: streak.current,
    urgency,
    title: customTitle || (urgency === 'critical' || urgency === 'high'
      ? DEFAULT_ALERT_MESSAGES[urgency].title
      : motivationData.title),
    message: customMessage || (urgency === 'critical' || urgency === 'high'
      ? DEFAULT_ALERT_MESSAGES[urgency].message
      : motivationData.message),
    motivation: customMotivation || motivationData.motivation,
    scheduledFor: new Date(now.getTime() + hoursBeforeBreak * 60 * 60 * 1000),
    triggered: false,
    createdAt: now,
  };

  // Store alert
  alertStore.set(alert.id, alert);

  return alert;
}

// ============================================================
// ALERT MANAGEMENT
// ============================================================

/**
 * Get all pending alerts for a user
 */
export function getPendingAlerts(userId: string): StreakAlert[] {
  const alerts: StreakAlert[] = [];

  alertStore.forEach((alert) => {
    if (alert.userId === userId && !alert.triggered) {
      alerts.push(alert);
    }
  });

  return alerts;
}

/**
 * Mark an alert as triggered
 */
export function markAlertTriggered(alertId: string): boolean {
  const alert = alertStore.get(alertId);
  if (alert) {
    alert.triggered = true;
    return true;
  }
  return false;
}

/**
 * Cancel a scheduled alert
 */
export function cancelStreakAlert(alertId: string): boolean {
  return alertStore.delete(alertId);
}

/**
 * Get critical alerts that need immediate attention
 */
export function getCriticalAlerts(userId: string): StreakAlert[] {
  return getPendingAlerts(userId).filter(
    (alert) => alert.urgency === 'critical' || alert.urgency === 'high'
  );
}

/**
 * Clear all alerts for a user
 */
export function clearUserAlerts(userId: string): number {
  let count = 0;

  alertStore.forEach((alert, id) => {
    if (alert.userId === userId) {
      alertStore.delete(id);
      count++;
    }
  });

  return count;
}

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

/**
 * Schedule a 24-hour warning before streak breaks
 */
export function scheduleStreakWarning(userId: string): StreakAlert {
  return scheduleStreakAlert({
    userId,
    hoursBeforeBreak: 24,
  });
}

/**
 * Schedule an 8-hour warning (morning reminder)
 */
export function scheduleMorningStreakAlert(userId: string): StreakAlert {
  return scheduleStreakAlert({
    userId,
    hoursBeforeBreak: 8,
  });
}

/**
 * Schedule immediate critical alert
 */
export function scheduleCriticalStreakAlert(userId: string): StreakAlert {
  return scheduleStreakAlert({
    userId,
    hoursBeforeBreak: 0,
  });
}

/**
 * Get streak status with alert information
 */
export function getStreakStatus(userId: string): {
  streak: Streak;
  hasCriticalAlert: boolean;
  pendingAlerts: number;
  nextAlertTime: Date | null;
} {
  const streak = getStreak();
  const pendingAlerts = getPendingAlerts(userId);
  const criticalAlerts = getCriticalAlerts(userId);

  let nextAlertTime: Date | null = null;
  if (pendingAlerts.length > 0) {
    nextAlertTime = pendingAlerts.reduce((earliest, alert) => {
      return alert.scheduledFor < earliest ? alert.scheduledFor : earliest;
    }, pendingAlerts[0].scheduledFor);
  }

  return {
    streak,
    hasCriticalAlert: criticalAlerts.length > 0,
    pendingAlerts: pendingAlerts.length,
    nextAlertTime,
  };
}