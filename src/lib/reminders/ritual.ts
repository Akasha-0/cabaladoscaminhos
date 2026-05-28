// ============================================================
// RITUAL REMINDER SERVICE - CABALA DOS CAMINHOS
// ============================================================
// Ritual reminder scheduling based on spiritual calendar
// Supports moon phases, orixás, and sacred days
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// TYPES
// ============================================================

export type RitualType =
  | 'lua-nova'
  | 'lua-cheia'
  | 'crescente'
  | 'minguante'
  | 'orixá'
  | 'cabala'
  | 'ebó'
  | 'meditação'
  | 'gratidão';

export interface RitualReminder {
  id: string;
  userId: string;
  type: RitualType;
  title: string;
  message: string;
  scheduledAt: Date;
  timezone: string;
  enabled: boolean;
  lunarPhase?: string;
  orixá?: string;
  dayOfWeek?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleRitualInput {
  userId: string;
  type: RitualType;
  timezone?: string;
  lunarPhase?: 'lua-nova' | 'lua-cheia' | 'crescente' | 'minguante';
  orixá?: string;
  dayOfWeek?: number;
  customTime?: string;
}

export interface RitualCalendarEvent {
  date: Date;
  type: RitualType;
  description: string;
  lunarPhase?: string;
  orixá?: string;
}

// ============================================================
// DEFAULT RITUAL MESSAGES
// ============================================================

const RITUAL_MESSAGES: Record<RitualType, { title: string; message: string }> = {
  'lua-nova': {
    title: '🌑 Lua Nova - Nuevo Comienzo',
    message: 'Es momento de plantar nuevas intenciones. La Luna Nueva favorece la meditación y los rituales de nuevo comienzo.',
  },
  'lua-cheia': {
    title: '🌕 Luna Llena - Manifestación',
    message: 'La energía alcanza su punto máximo. Perfecta para rituales de gratitud, sanación y manifestación.',
  },
  'crescente': {
    title: '🌓 Luna Creciente - Acción',
    message: 'La energía crece como la Luna. Ideal para rituales de atracción, amor y proyectos.',
  },
  'minguante': {
    title: '🌗 Luna Minguante - Soltar',
    message: 'Hora de liberar lo que ya no sirve. Rituales de limpieza, protección y perdón.',
  },
  'orixá': {
    title: '🕯️ Ritual de Orixá',
    message: 'Hoy se honran los orixás. Mantén la fe, ofrece tu devoción y recibe su bendicion.',
  },
  cabala: {
    title: '✡️ Práctica Cabalística',
    message: 'Día propicio para la meditación sobre los Sephiroth y el árbol de la vida.',
  },
  ebó: {
    title: '🔥 Ritual de Ebó',
    message: 'Momento de ofrenda y limpieza espiritual. Conecta con tu orixá guía.',
  },
  'meditação': {
    title: '🧘 Meditación Diaria',
    message: 'Tu práctica diaria de meditación te espera. Encuentra tu centro.',
  },
  'gratidão': {
    title: '🙏 Momento de Gratitud',
    message: 'Agradece por las bendiciones recibidas. La gratitud multiplica la abundancia.',
  },
};

// ============================================================
// MOON PHASE CALCULATIONS
// ============================================================

function getJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
    Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getMoonPhaseFromJD(jd: number): { phase: string; daysSince: number } {
  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const normalized = daysSinceNew < 0 ? daysSinceNew + 29.530588853 : daysSinceNew;

  if (normalized < 1.84566) return { phase: 'lua-nova', daysSince: normalized };
  if (normalized < 5.53697) return { phase: 'crescente', daysSince: normalized };
  if (normalized < 12.91961) return { phase: 'lua-cheia', daysSince: normalized };
  if (normalized < 16.61092) return { phase: 'lua-cheia', daysSince: normalized };
  if (normalized < 20.30224) return { phase: 'minguante', daysSince: normalized };
  if (normalized < 23.99355) return { phase: 'minguante', daysSince: normalized };
  return { phase: 'crescente', daysSince: normalized };
}

function getMoonPhase(date: Date): { phase: string; illumination: number; daysUntilNext: number } {
  const jd = getJulianDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { phase, daysSince } = getMoonPhaseFromJD(jd);
  const daysUntilNext = 29.530588853 - daysSince;

  return { phase, illumination: Math.round((1 - Math.cos((2 * Math.PI * daysSince) / 29.530588853)) / 2 * 100), daysUntilNext };
}

function findNextPhase(targetPhase: string, from: Date): Date {
  let current = new Date(from);
  const maxIterations = 30;

  for (let i = 0; i < maxIterations; i++) {
    const { phase } = getMoonPhase(current);
    if (phase === targetPhase) {
      return current;
    }
    current.setDate(current.getDate() + 1);
  }

  return new Date(from.getTime() + 29.530588853 * 24 * 60 * 60 * 1000);
}

// ============================================================
// SACRED DAYS CALCULATION
// ============================================================

const SACRED_DAYS: Record<number, { orixá: string; type: RitualType; description: string }> = {
  0: { orixá: 'Oxum', type: 'orixá', description: 'Domingo - Día de Oxum, el amor y la belleza' },
  1: { orixá: 'Oxalá', type: 'cabala', description: 'Lunes - Día de Oxalá, la paz y la creación' },
  2: { orixá: 'Ogum', type: 'orixá', description: 'Martes - Día de Ogum, el trabajo y la guerra' },
  3: { orixá: 'Iemanjá', type: 'lua-cheia', description: 'Miércoles - Día de Iemanjá, la madre del mar' },
  4: { orixá: 'Shangô', type: 'ebó', description: 'Jueves - Día de Shangô, la justicia y el rayo' },
  5: { orixá: 'Ibeji', type: 'gratidão', description: 'Viernes - Día de Ibeji, los gemelos divinos' },
  6: { orixá: 'Nanã', type: 'meditação', description: 'Sábado - Día de Nanã, la sabiduría antigua' },
};

function getSacredDay(date: Date) {
  const dayOfWeek = date.getDay();
  return SACRED_DAYS[dayOfWeek];
}

// ============================================================
// RITUAL CALENDAR GENERATION
// ============================================================

export function getRitualCalendar(
  startDate: Date,
  endDate: Date
): RitualCalendarEvent[] {
  const events: RitualCalendarEvent[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const moonPhase = getMoonPhase(current);
    const sacredDay = getSacredDay(current);

    if (moonPhase.phase === 'lua-nova' || moonPhase.phase === 'lua-cheia') {
      events.push({
        date: new Date(current),
        type: moonPhase.phase as RitualType,
        description: moonPhase.phase === 'lua-nova'
          ? 'Ritual de nuevo comienzo e intenciones'
          : 'Ritual de manifestación y gratitud',
        lunarPhase: moonPhase.phase,
      });
    }

    if (sacredDay && current.getDay() === 3) {
      events.push({
        date: new Date(current),
        type: sacredDay.type,
        description: sacredDay.description,
        orixá: sacredDay.orixá,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ============================================================
// SCHEDULE RITUAL REMINDER
// ============================================================

export async function scheduleRitualReminder(
  input: ScheduleRitualInput
): Promise<RitualReminder> {
  const {
    userId,
    type,
    timezone = 'America/Sao_Paulo',
    lunarPhase,
    orixá,
    dayOfWeek,
    customTime,
  } = input;

  const now = new Date();
  let scheduledAt: Date;

  if (lunarPhase) {
    scheduledAt = findNextPhase(lunarPhase, now);
  } else if (dayOfWeek !== undefined) {
    scheduledAt = new Date(now);
    const currentDay = scheduledAt.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
    scheduledAt.setDate(scheduledAt.getDate() + daysUntil);
  } else {
    const moonPhase = getMoonPhase(now);
    if (moonPhase.phase === 'lua-cheia') {
      scheduledAt = now;
    } else {
      scheduledAt = findNextPhase('lua-cheia', now);
    }
  }

  if (customTime) {
    const [hours, minutes] = customTime.split(':').map(Number);
    scheduledAt.setHours(hours, minutes, 0, 0);
  } else {
    scheduledAt.setHours(20, 0, 0, 0);
  }

  const messageTemplate = RITUAL_MESSAGES[type];

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      type,
      title: messageTemplate.title,
      message: messageTemplate.message,
      scheduledAt,
      timezone,
      enabled: true,
      lunarPhase: lunarPhase || getMoonPhase(scheduledAt).phase,
      orixá,
      dayOfWeek,
    },
  });

  return {
    id: reminder.id,
    userId: reminder.userId,
    type: reminder.type as RitualType,
    title: reminder.title,
    message: reminder.message,
    scheduledAt: reminder.scheduledAt,
    timezone: reminder.timezone,
    enabled: reminder.enabled,
    lunarPhase: reminder.lunarPhase || undefined,
    orixá: reminder.orixá || undefined,
    dayOfWeek: reminder.dayOfWeek || undefined,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt,
  };
}

// ============================================================
// CANCEL RITUAL REMINDER
// ============================================================

export async function cancelRitualReminder(id: string): Promise<boolean> {
  try {
    await prisma.reminder.update({
      where: { id },
      data: { enabled: false },
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// GET UPCOMING RITUALS
// ============================================================

export async function getUpcomingRitualReminders(
  userId: string,
  days: number = 30
): Promise<RitualReminder[]> {
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      enabled: true,
      scheduledAt: {
        gte: now,
        lte: endDate,
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return reminders.map((r) => ({
    id: r.id,
    userId: r.userId,
    type: r.type as RitualType,
    title: r.title,
    message: r.message,
    scheduledAt: r.scheduledAt,
    timezone: r.timezone,
    enabled: r.enabled,
    lunarPhase: r.lunarPhase || undefined,
    orixá: r.orixá || undefined,
    dayOfWeek: r.dayOfWeek || undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

// ============================================================
// LOCAL NOTIFICATION PAYLOAD
// ============================================================

export function buildLocalNotificationPayload(
  reminder: RitualReminder
): { title: string; body: string; data: Record<string, unknown> } {
  return {
    title: reminder.title,
    body: reminder.message,
    data: {
      type: 'ritual',
      reminderId: reminder.id,
      ritualType: reminder.type,
      lunarPhase: reminder.lunarPhase,
      orixá: reminder.orixá,
    },
  };
}

// ============================================================
// SCHEDULE FROM SPIRITUAL CALENDAR
// ============================================================

export async function scheduleFromSpiritualCalendar(
  userId: string,
  timezone?: string
): Promise<RitualReminder[]> {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const calendar = getRitualCalendar(now, thirtyDaysLater);

  const scheduledReminders: RitualReminder[] = [];

  for (const event of calendar.slice(0, 5)) {
    const reminder = await scheduleRitualReminder({
      userId,
      type: event.type,
      timezone,
      lunarPhase: event.lunarPhase as 'lua-nova' | 'lua-cheia' | 'crescente' | 'minguante' | undefined,
      orixá: event.orixá,
    });
    scheduledReminders.push(reminder);
  }

  return scheduledReminders;
}
