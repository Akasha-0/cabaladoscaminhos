 

// ============================================================
// NOTIFICATION SCHEDULING - CABALA DOS CAMINHOS
// ============================================================
// LocalStorage-based notification scheduling
// ============================================================

const STORAGE_KEY = 'cabala_notification_schedule';

// ============================================================
// TYPES
// ============================================================

export interface ScheduledNotification {
  id: string;
  type: 'ritual' | 'meditation' | 'reading' | 'reminder' | 'affirmation';
  title: string;
  message: string;
  scheduledAt: number; // Unix timestamp
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface ScheduleInput {
  type: ScheduledNotification['type'];
  title: string;
  message: string;
  scheduledAt: number;
  metadata?: Record<string, any>;
}

// ============================================================
// STORAGE HELPERS
// ============================================================

function getStoredSchedule(): ScheduledNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSchedule(schedule: ScheduledNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

export function scheduleNotification(input: ScheduleInput): ScheduledNotification {
  const now = Date.now();
  const notification: ScheduledNotification = {
    id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    status: 'pending',
    createdAt: now,
  };

  const schedule = getStoredSchedule();
  schedule.push(notification);
  saveSchedule(schedule);

  return notification;
}

export function getScheduled(): ScheduledNotification[];
export function getScheduled(type: ScheduledNotification['type']): ScheduledNotification[];
export function getScheduled(type?: ScheduledNotification['type']): ScheduledNotification[] {
  const schedule = getStoredSchedule();

  if (!type) {
    return schedule;
  }

  return schedule.filter(n => n.type === type);
}

export function cancelScheduled(id: string): boolean {
  const schedule = getStoredSchedule();
  const index = schedule.findIndex(n => n.id === id);

  if (index === -1) return false;

  schedule[index].status = 'cancelled';
  saveSchedule(schedule);

  return true;
}

export function dismissNotification(id: string): boolean {
  const schedule = getStoredSchedule();
  const index = schedule.findIndex(n => n.id === id);

  if (index === -1) return false;

  schedule[index].status = 'sent';
  saveSchedule(schedule);

  return true;
}

export function clearOldNotifications(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
  const cutoff = Date.now() - maxAgeMs;
  const schedule = getStoredSchedule();
  const filtered = schedule.filter(n => n.createdAt > cutoff);
  saveSchedule(filtered);
}
