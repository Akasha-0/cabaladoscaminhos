// ============================================================
// MOON ALERT SCHEDULER - CABALA DOS CAMINHOS
// ============================================================
// Scheduling alerts for new and full moon events
// Includes ritual suggestions aligned with lunar energy
// ============================================================

import {
  getNextNewMoon,
  getNextFullMoon,
  getCurrentMoonPhase,
  getMoonPhaseNamePt,
  MoonPhaseEvent,
} from '../notifications/lua';

// ============================================================
// TYPES
// ============================================================

export type MoonAlertType = 'new_moon' | 'full_moon';

export interface MoonAlert {
  id: string;
  userId: string;
  type: MoonAlertType;
  scheduledDate: Date;
  phaseName: string;
  ritualSuggestion: string;
  message: string;
  createdAt: Date;
}

export interface MoonAlertScheduleOptions {
  leadTimeHours?: number; // hours before the event (default: 24)
  includeRitualSuggestion?: boolean;
  customMessage?: string;
}

// ============================================================
// RITUAL SUGGESTIONS BY PHASE
// ============================================================

const RITUAL_SUGGESTIONS = {
  new: {
    primary: 'Novena de intenção - plante as sementes do seu desejo',
    secondary: 'Meditação da Árvore da Vida - visualize seu caminho se expandindo',
    ebó: 'Ebó de abertura - limpe bloqueios para receber novas energias',
    prática: 'Escrita sagrada: registo sua intenção no Journal Cósmico',
  },
  full: {
    primary: 'Ritual de manifestação - agradeça e celebre a completude',
    secondary: 'Lua de comando - utilize a energia peak para energizar objetivos',
    ebó: 'Ebó de libertação - solte o que não serve mais',
    prática: 'Cerimônia de luz: acenda uma vela branca e reflita sobre realizações',
  },
} as const;

const ALERT_MESSAGES = {
  new: {
    title: 'Lua Nova se aproxima',
    body: 'Uma nova ciclo começa. É hora de plantar intenções e recomeçar com clareza.',
  },
  full: {
    title: 'Lua Cheia iluminando',
    body: 'A lua está em seu ápice. Hora de manifestar, agradecer e libertar o que precisa soltar.',
  },
} as const;

// ============================================================
// INTERNAL STORE
// ============================================================

const scheduledAlerts = new Map<string, MoonAlert>();

// ============================================================
// MOON EVENT CALCULATIONS
// ============================================================

function getNextMoonEvent(
  type: MoonAlertType,
  fromDate: Date = new Date()
): MoonPhaseEvent {
  return type === 'new_moon' ? getNextNewMoon(fromDate) : getNextFullMoon(fromDate);
}

function calculateAlertTrigger(
  moonEvent: MoonPhaseEvent,
  leadTimeHours: number
): Date {
  const trigger = new Date(moonEvent.date);
  trigger.setHours(trigger.getHours() - leadTimeHours);
  return trigger;
}

function isWithinAlertWindow(moonEvent: MoonPhaseEvent, hours: number): boolean {
  const now = new Date();
  const diffMs = moonEvent.date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hours;
}

// ============================================================
// RITUAL SUGGESTION FORMATTING
// ============================================================

function formatRitualSuggestion(phase: 'new' | 'full'): string {
  const suggestions = RITUAL_SUGGESTIONS[phase];
  return [
    suggestions.primary,
    suggestions.secondary,
    suggestions.ebó,
    suggestions.prática,
  ].join('\n');
}

function getCustomAlertMessage(
  type: MoonAlertType,
  _phaseName: string,
  customMessage?: string
): { title: string; body: string } {
  const key = type === 'new_moon' ? 'new' : 'full';
  if (customMessage) {
    return {
      title: customMessage,
      body: ALERT_MESSAGES[key].body,
    };
  }
  return ALERT_MESSAGES[key];
}

// ============================================================
// MAIN EXPORT: SCHEDULE MOON ALERT
// ============================================================

/**
 * Schedule a moon phase alert for a user
 * @param userId User identifier
 * @param type New moon or full moon alert
 * @param options Scheduling options (lead time, message, ritual)
 */
export async function scheduleMoonAlert(
  userId: string,
  type: MoonAlertType,
  options: MoonAlertScheduleOptions = {}
): Promise<MoonAlert> {
  const {
    leadTimeHours = 24,
    includeRitualSuggestion = true,
    customMessage,
  } = options;

  // Get the next upcoming event of this type
  const moonEvent = getNextMoonEvent(type);
  const phaseName = getMoonPhaseNamePt(moonEvent.phase);
  const triggerDate = calculateAlertTrigger(moonEvent, leadTimeHours);

  // Format the message
  const { title, body } = getCustomAlertMessage(type, phaseName, customMessage);

  // Build the ritual suggestion
  const ritualSuggestion = includeRitualSuggestion
    ? formatRitualSuggestion(type === 'new_moon' ? 'new' : 'full')
    : '';

  // Create the alert
  const alertId = `${userId}-${type}-${moonEvent.date.toISOString()}`;
  const alert: MoonAlert = {
    id: alertId,
    userId,
    type,
    scheduledDate: moonEvent.date,
    phaseName,
    ritualSuggestion,
    message: body,
    createdAt: new Date(),
  };

  scheduledAlerts.set(alertId, alert);

  // Return the alert immediately (async scheduling handled separately if needed)
  return alert;
}

/**
 * Schedule both new moon and full moon alerts
 */
export async function scheduleBothMoonAlerts(
  userId: string,
  options: MoonAlertScheduleOptions = {}
): Promise<{ newMoon: MoonAlert; fullMoon: MoonAlert }> {
  const [newMoon, fullMoon] = await Promise.all([
    scheduleMoonAlert(userId, 'new_moon', options),
    scheduleMoonAlert(userId, 'full_moon', options),
  ]);

  return { newMoon, fullMoon };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get the next upcoming moon alert
 */
export function getUpcomingMoonAlert(
  userId: string,
  type?: MoonAlertType
): MoonAlert | null {
  let best: MoonAlert | null = null;
  const allAlerts = Array.from(scheduledAlerts.values());

  for (let i = 0; i < allAlerts.length; i++) {
    const alert = allAlerts[i];
    if (alert.userId !== userId) continue;
    if (type && alert.type !== type) continue;

    if (!best || alert.scheduledDate < best.scheduledDate) {
      best = alert;
    }
  }

  return best;
}

/**
 * Get all active moon alerts for a user
 */
export function getUserMoonAlerts(userId: string): MoonAlert[] {
  const alerts: MoonAlert[] = [];
  const allAlerts = Array.from(scheduledAlerts.values());

  for (let i = 0; i < allAlerts.length; i++) {
    const alert = allAlerts[i];
    if (alert.userId === userId) {
      alerts.push(alert);
    }
  }

  return alerts.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
}

/**
 * Check if there's an imminent moon alert (within specified hours)
 */
export function hasImminentMoonAlert(
  userId: string,
  withinHours: number = 24
): boolean {
  const alerts = getUserMoonAlerts(userId);
  const now = new Date();

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const hoursUntil = (alert.scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntil > 0 && hoursUntil <= withinHours) {
      return true;
    }
  }

  return false;
}

/**
 * Cancel a specific moon alert
 */
export function cancelMoonAlert(userId: string, type: MoonAlertType): boolean {
  const allAlerts = Array.from(scheduledAlerts.entries());

  for (let i = 0; i < allAlerts.length; i++) {
    const [id, alert] = allAlerts[i];
    if (alert.userId === userId && alert.type === type) {
      scheduledAlerts.delete(id);
      return true;
    }
  }
  return false;
}

/**
 * Get current moon phase status for alerts
 */
export function getMoonAlertStatus(): {
  currentPhase: MoonPhaseEvent;
  nextNewMoon: MoonPhaseEvent;
  nextFullMoon: MoonPhaseEvent;
  daysUntilNewMoon: number;
  daysUntilFullMoon: number;
} {
  const currentPhase = getCurrentMoonPhase();
  const nextNewMoon = getNextNewMoon();
  const nextFullMoon = getNextFullMoon();

  const now = new Date();
  const daysUntilNewMoon = (nextNewMoon.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const daysUntilFullMoon = (nextFullMoon.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  return {
    currentPhase,
    nextNewMoon,
    nextFullMoon,
    daysUntilNewMoon: Math.max(0, Math.round(daysUntilNewMoon * 10) / 10),
    daysUntilFullMoon: Math.max(0, Math.round(daysUntilFullMoon * 10) / 10),
  };
}