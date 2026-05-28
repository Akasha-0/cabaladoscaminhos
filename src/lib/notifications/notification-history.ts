const STORAGE_KEY = 'notification_history';
const MAX_HISTORY = 100;

export interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export function saveNotification(entry: Omit<NotificationEntry, 'id' | 'timestamp'>): void {
  const history = loadHistory();
  const newEntry: NotificationEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  history.unshift(newEntry);
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function loadHistory(): NotificationEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}