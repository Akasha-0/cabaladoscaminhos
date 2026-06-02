// Reading Scheduler - Cabala Dos Caminhos
// Schedules readings with localStorage persistence
// No linting, no formatting

const STORAGE_KEY = 'cdc_scheduled_readings';

export interface ScheduledReading {
  id: string;
  type: string;
  title: string;
  scheduledAt: Date;
  completed?: boolean;
}

function loadFromStorage(): ScheduledReading[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((r: ScheduledReading) => ({
      ...r,
      scheduledAt: new Date(r.scheduledAt),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(readings: ScheduledReading[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
}

export function scheduleReading(
  type: string,
  title: string,
  scheduledAt: Date,
  id?: string
): ScheduledReading {
  const reading: ScheduledReading = {
    id: id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    title,
    scheduledAt,
    completed: false,
  };

  const readings = loadFromStorage();
  readings.push(reading);
  saveToStorage(readings);

  return reading;
}

export function getScheduledReadings(): ScheduledReading[] {
  return loadFromStorage();
}

export function cancelScheduledReading(id: string): boolean {
  const readings = loadFromStorage();
  const before = readings.length;
  const filtered = readings.filter((r) => r.id !== id);
  if (filtered.length < before) {
    saveToStorage(filtered);
    return true;
  }
  return false;
}

export function markReadingComplete(id: string): boolean {
  const readings = loadFromStorage();
  const reading = readings.find((r) => r.id === id);
  if (!reading) return false;
  reading.completed = true;
  saveToStorage(readings);
  return true;
}

export function clearCompletedReadings(): void {
  const readings = loadFromStorage().filter((r) => !r.completed);
  saveToStorage(readings);
}