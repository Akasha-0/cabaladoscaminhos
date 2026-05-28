/**
 * Ritual Schedule
 * Manages scheduled rituals and their timing
 */

export interface RitualSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday-Saturday
  dayOfMonth?: number; // 1-31
  month?: number; // 1-12
  description?: string;
  active: boolean;
}

const schedules: RitualSchedule[] = [
  {
    id: 'daily-morning',
    name: 'Morning Ritual',
    frequency: 'daily',
    time: '06:00',
    description: 'Daily morning spiritual practice',
    active: true,
  },
  {
    id: 'weekly-sabbath',
    name: 'Weekly Sabbath',
    frequency: 'weekly',
    time: '18:00',
    dayOfWeek: 0,
    description: 'Sunday rest and reflection',
    active: true,
  },
  {
    id: 'monthly-new-moon',
    name: 'New Moon Ritual',
    frequency: 'monthly',
    time: '00:00',
    dayOfMonth: 1,
    description: 'Monthly new moon ceremony',
    active: true,
  },
  {
    id: 'yearly-equinox',
    name: 'Equinox Celebration',
    frequency: 'yearly',
    time: '12:00',
    dayOfMonth: 20,
    month: 3,
    description: 'Spring equinox gathering',
    active: true,
  },
];

/**
 * Get all ritual schedules
 */
export function getSchedule(): RitualSchedule[] {
  return schedules.filter((s) => s.active);
}

/**
 * Get a specific schedule by ID
 */
export function getScheduleById(id: string): RitualSchedule | undefined {
  return schedules.find((s) => s.id === id);
}

/**
 * Add a new ritual schedule
 */
export function addSchedule(schedule: Omit<RitualSchedule, 'id'>): RitualSchedule {
  const id = `${schedule.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const newSchedule: RitualSchedule = { ...schedule, id };
  schedules.push(newSchedule);
  return newSchedule;
}

/**
 * Deactivate a schedule (soft delete)
 */
export function removeSchedule(id: string): boolean {
  const schedule = schedules.find((s) => s.id === id);
  if (schedule) {
    schedule.active = false;
    return true;
  }
  return false;
}
