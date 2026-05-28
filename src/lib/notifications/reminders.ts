// ============================================================
// SPIRITUAL REMINDER SCHEDULER - CABALA DOS CAMINHOS
// ============================================================
// Scheduling service for spiritual practice reminders
// Supports ritual, ebó, oração, and meditation patterns
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// TYPES
// ============================================================

export type ReminderType = 'ritual' | 'ebó' | 'oração' | 'meditação' | 'meditacao' | 'cábala' | 'leitura' | 'gratidão';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface WeeklySchedule {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

export interface MonthlySchedule {
  dayOfMonth: number; // 1-31
}

export interface CustomSchedule {
  interval: number; // days
}

export type SchedulePattern = WeeklySchedule | MonthlySchedule | CustomSchedule;

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  frequency: ReminderFrequency;
  title: string;
  message: string;
  time: string; // HH:MM format
  timezone: string;
  schedule: SchedulePattern | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt: Date | null;
  nextTriggerAt: Date | null;
}

export interface CreateReminderInput {
  userId: string;
  type: ReminderType;
  frequency: ReminderFrequency;
  title?: string;
  message?: string;
  time: string;
  timezone?: string;
  schedule?: SchedulePattern;
}

export interface UpdateReminderInput {
  title?: string;
  message?: string;
  time?: string;
  timezone?: string;
  schedule?: SchedulePattern;
  enabled?: boolean;
}

// ============================================================
// DEFAULT MESSAGES BY TYPE
// ============================================================

const DEFAULT_MESSAGES: Record<ReminderType, { title: string; message: string }> = {
  ritual: {
    title: 'Hora do Ritual',
    message: 'É hora de conectar-se com sua essência espiritual. Seu ritual aguarda.',
  },
  ebó: {
    title: 'Ritual de Ebó',
    message: 'Uma oportunidade de purificação e equilíbrio energético se apresenta.',
  },
  oração: {
    title: 'Momento de Oração',
    message: 'Reserve um instante para elevar suas preces e intenções.',
  },
  meditação: {
    title: 'Prática de Meditação',
    message: 'Permita-se encontrar paz interior através da meditação.',
  },
  meditacao: {
    title: 'Prática de Meditação',
    message: 'Permita-se encontrar paz interior através da meditação.',
  },
  cábala: {
    title: 'Estudo Cabalístico',
    message: 'A sabedoria ancestral aguarda seu momento de exploração.',
  },
  leitura: {
    title: 'Leitura Espiritual',
    message: 'Dedique tempo à leitura que nutre sua alma.',
  },
  gratidão: {
    title: 'Prática de Gratidão',
    message: 'Cultive gratidão pelas bênçãos em sua vida.',
  },
};

// ============================================================
// SCHEDULE CALCULATIONS
// ============================================================

function calculateNextTrigger(
  frequency: ReminderFrequency,
  time: string,
  schedule: SchedulePattern | null,
  referenceDate: Date = new Date()
): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(referenceDate);
  next.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      if (next <= referenceDate) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'weekly':
      if (schedule && 'dayOfWeek' in schedule) {
        const targetDay = schedule.dayOfWeek;
        const currentDay = next.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        next.setDate(next.getDate() + daysUntil);
      } else {
        next.setDate(next.getDate() + 7);
      }
      break;

    case 'monthly':
      if (schedule && 'dayOfMonth' in schedule) {
        const targetDay = schedule.dayOfMonth;
        const currentDay = next.getDate();
        if (currentDay >= targetDay) {
          next.setMonth(next.getMonth() + 1);
        }
        next.setDate(targetDay);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      break;

    case 'custom':
      if (schedule && 'interval' in schedule) {
        next.setDate(next.getDate() + schedule.interval);
      } else {
        next.setDate(next.getDate() + 1);
      }
      break;
  }

  return next;
}

function matchesSchedule(
  reminder: Reminder,
  now: Date
): boolean {
  if (!reminder.enabled) return false;

  const [reminderHours, reminderMinutes] = reminder.time.split(':').map(Number);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Check if current time matches reminder time (±1 minute tolerance)
  if (reminderHours !== currentHours || Math.abs(reminderMinutes - currentMinutes) > 1) {
    return false;
  }

  const currentDayOfWeek = now.getDay();
  const currentDayOfMonth = now.getDate();

  switch (reminder.frequency) {
    case 'daily':
      return true;

    case 'weekly':
      if (reminder.schedule && 'dayOfWeek' in reminder.schedule) {
        return reminder.schedule.dayOfWeek === currentDayOfWeek;
      }
      return false;

    case 'monthly':
      if (reminder.schedule && 'dayOfMonth' in reminder.schedule) {
        return reminder.schedule.dayOfMonth === currentDayOfMonth;
      }
      return false;

    case 'custom':
      return true;

    default:
      return false;
  }
}

// ============================================================
// SERVICE INTERFACE
// ============================================================

export interface ReminderService {
  setReminder(input: CreateReminderInput): Promise<Reminder>;
  getReminders(userId: string): Promise<Reminder[]>;
  getReminderById(id: string): Promise<Reminder | null>;
  updateReminder(id: string, input: UpdateReminderInput): Promise<Reminder | null>;
  cancelReminder(id: string): Promise<boolean>;
  getActiveReminders(): Promise<Reminder[]>;
  getRemindersToTrigger(): Promise<Reminder[]>;
  markReminderTriggered(id: string): Promise<void>;
}

// ============================================================
// IN-MEMORY STORE (for rapid access)
// ============================================================

const memoryStore = new Map<string, Reminder>();

// ============================================================
// SERVICE IMPLEMENTATION
// ============================================================

class ReminderServiceImpl implements ReminderService {

  async setReminder(input: CreateReminderInput): Promise<Reminder> {
    const defaults = DEFAULT_MESSAGES[input.type] || {
      title: 'Lembrete Espiritual',
      message: 'Um momento de conexão espiritual aguarda você.',
    };

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      userId: input.userId,
      type: input.type,
      frequency: input.frequency,
      title: input.title || defaults.title,
      message: input.message || defaults.message,
      time: input.time,
      timezone: input.timezone || 'America/Sao_Paulo',
      schedule: input.schedule || null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastTriggeredAt: null,
      nextTriggerAt: calculateNextTrigger(input.frequency, input.time, input.schedule || null),
    };

    // Store in memory for fast access
    memoryStore.set(reminder.id, reminder);

    // Persist to database if prisma is available
    try {
      await prisma.reminder.create({
        data: {
          id: reminder.id,
          userId: reminder.userId,
          type: reminder.type,
          frequency: reminder.frequency,
          title: reminder.title,
          message: reminder.message,
          time: reminder.time,
          timezone: reminder.timezone,
          schedule: reminder.schedule as object,
          enabled: reminder.enabled,
          lastTriggeredAt: reminder.lastTriggeredAt,
          nextTriggerAt: reminder.nextTriggerAt,
        },
      });
    } catch {
      // Continue with memory-only storage if DB fails
    }

    return reminder;
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    // Try memory first
    const memoryReminders = Array.from(memoryStore.values()).filter(
      (r) => r.userId === userId
    );

    if (memoryReminders.length > 0) {
      return memoryReminders;
    }

    // Fallback to database
    try {
      const dbReminders = await prisma.reminder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Hydrate memory store
      for (const r of dbReminders) {
        const reminder: Reminder = {
          id: r.id,
          userId: r.userId,
          type: r.type as ReminderType,
          frequency: r.frequency as ReminderFrequency,
          title: r.title ?? '',
          message: r.message ?? '',
          time: r.time,
          timezone: r.timezone ?? 'America/Sao_Paulo',
          schedule: (r.schedule as unknown as SchedulePattern) ?? null,
          enabled: r.enabled ?? true,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          lastTriggeredAt: r.lastTriggeredAt,
          nextTriggerAt: r.nextTriggerAt,
        };
        memoryStore.set(r.id, reminder);
      }

      return dbReminders.map((r): Reminder => ({
        id: r.id,
        userId: r.userId,
        type: r.type as ReminderType,
        frequency: r.frequency as ReminderFrequency,
        title: r.title ?? '',
        message: r.message ?? '',
        time: r.time,
        timezone: r.timezone ?? 'America/Sao_Paulo',
        schedule: (r.schedule as unknown as SchedulePattern) ?? null,
        enabled: r.enabled ?? true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        lastTriggeredAt: r.lastTriggeredAt,
        nextTriggerAt: r.nextTriggerAt,
      }));
    } catch {
      return memoryReminders;
    }
  }

  async getReminderById(id: string): Promise<Reminder | null> {
    return memoryStore.get(id) || null;
  }

  async updateReminder(id: string, input: UpdateReminderInput): Promise<Reminder | null> {
    const existing = memoryStore.get(id);
    if (!existing) return null;

    const updated: Reminder = {
      ...existing,
      title: input.title ?? existing.title,
      message: input.message ?? existing.message,
      time: input.time ?? existing.time,
      timezone: input.timezone ?? existing.timezone,
      schedule: input.schedule ?? existing.schedule,
      enabled: input.enabled ?? existing.enabled,
      updatedAt: new Date(),
    };

    updated.nextTriggerAt = calculateNextTrigger(
      updated.frequency,
      updated.time,
      updated.schedule
    );

    memoryStore.set(id, updated);

    // Persist update
    try {
      await prisma.reminder.update({
        where: { id },
        data: {
          title: updated.title,
          message: updated.message,
          time: updated.time,
          timezone: updated.timezone,
          schedule: updated.schedule as object,
          enabled: updated.enabled,
          nextTriggerAt: updated.nextTriggerAt,
        },
      });
    } catch {
      // Continue with memory-only
    }

    return updated;
  }

  async cancelReminder(id: string): Promise<boolean> {
    const existing = memoryStore.get(id);
    if (!existing) return false;

    // Soft delete by disabling
    existing.enabled = false;
    existing.updatedAt = new Date();
    memoryStore.set(id, existing);

    try {
      await prisma.reminder.update({
        where: { id },
        data: { enabled: false },
      });
    } catch {
      // Continue with memory-only
    }

    return true;
  }

  async getActiveReminders(): Promise<Reminder[]> {
    return Array.from(memoryStore.values()).filter((r) => r.enabled);
  }

  async getRemindersToTrigger(): Promise<Reminder[]> {
    const now = new Date();
    const toTrigger: Reminder[] = [];

    for (const reminder of memoryStore.values()) {
      if (matchesSchedule(reminder, now)) {
        toTrigger.push(reminder);
      }
    }

    return toTrigger;
  }

  async markReminderTriggered(id: string): Promise<void> {
    const reminder = memoryStore.get(id);
    if (!reminder) return;

    reminder.lastTriggeredAt = new Date();
    reminder.nextTriggerAt = calculateNextTrigger(
      reminder.frequency,
      reminder.time,
      reminder.schedule,
      reminder.lastTriggeredAt
    );
    reminder.updatedAt = new Date();

    memoryStore.set(id, reminder);

    try {
      await prisma.reminder.update({
        where: { id },
        data: {
          lastTriggeredAt: reminder.lastTriggeredAt,
          nextTriggerAt: reminder.nextTriggerAt,
        },
      });
    } catch {
      // Continue with memory-only
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export const reminderService = new ReminderServiceImpl();

export async function setReminder(input: CreateReminderInput): Promise<Reminder> {
  return reminderService.setReminder(input);
}

export async function getReminders(userId: string): Promise<Reminder[]> {
  return reminderService.getReminders(userId);
}

export async function cancelReminder(id: string): Promise<boolean> {
  return reminderService.cancelReminder(id);
}

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

export async function setDailyRitualReminder(
  userId: string,
  time: string,
  timezone?: string
): Promise<Reminder> {
  return setReminder({
    userId,
    type: 'ritual',
    frequency: 'daily',
    time,
    timezone,
  });
}

export async function setWeeklyOraçãoReminder(
  userId: string,
  dayOfWeek: number,
  time: string,
  timezone?: string
): Promise<Reminder> {
  return setReminder({
    userId,
    type: 'oração',
    frequency: 'weekly',
    time,
    timezone,
    schedule: { dayOfWeek },
  });
}

export async function setMonthlyEbóReminder(
  userId: string,
  dayOfMonth: number,
  time: string,
  timezone?: string
): Promise<Reminder> {
  return setReminder({
    userId,
    type: 'ebó',
    frequency: 'monthly',
    time,
    timezone,
    schedule: { dayOfMonth },
  });
}

export async function getActiveRemindersForUser(userId: string): Promise<Reminder[]> {
  const reminders = await getReminders(userId);
  return reminders.filter((r) => r.enabled);
}

export async function getRemindersByType(
  userId: string,
  type: ReminderType
): Promise<Reminder[]> {
  const reminders = await getReminders(userId);
  return reminders.filter((r) => r.type === type);
}