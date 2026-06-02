// fallow-ignore-file unused-file
export interface Reminder {
  id: string;
  bookId: string;
  title: string;
  remindAt: number; // unix timestamp ms
  message: string;
  notified: boolean;
}

const STORAGE_KEY = 'reading_reminders';

// In-memory cache to avoid redundant storage reads
let cache: Reminder[] | null = null;

function load(): Reminder[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(items: Reminder[]): void {
  cache = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded or private mode — degrade silently
  }
}

export function setReminder(data: {
  bookId: string;
  title: string;
  remindAt: number;
  message: string;
}): Reminder {
  const reminder: Reminder = {
    id: crypto.randomUUID(),
    notified: false,
    ...data,
  };
  const items = load();
  items.push(reminder);
  persist(items);
  return reminder;
}

export function getReminders(bookId?: string): Reminder[] {
  const items = load();
  if (bookId) return items.filter((r) => r.bookId === bookId);
  return [...items];
}

export function dismissReminder(id: string): void {
  const items = load().filter((r) => r.id !== id);
  persist(items);
}

export function markNotified(id: string): void {
  const items = load().map((r) => (r.id === id ? { ...r, notified: true } : r));
  persist(items);
}

// Request browser notification permission; call once on init
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// Fire any due reminders and mark them notified
// fallow-ignore-next-line complexity
export function processDueReminders(): void {
  const now = Date.now();
  const items = load();
  let changed = false;

  for (const reminder of items) {
    if (!reminder.notified && reminder.remindAt <= now) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(reminder.title, { body: reminder.message, icon: '/favicon.ico' });
      }
      reminder.notified = true;
      changed = true;
    }
  }

  if (changed) persist(items);
}

// Polling driver — call once, it self-reschedules
let pollingTimer: ReturnType<typeof setInterval> | null = null;

export function startReminderPolling(intervalMs = 30_000): void {
  if (pollingTimer) clearInterval(pollingTimer);
  processDueReminders();
  pollingTimer = setInterval(processDueReminders, intervalMs);
}

export function stopReminderPolling(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}
