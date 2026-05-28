/**
 * Ritual tracking with LocalStorage persistence.
 */

const RITUAL_TRACK_KEY = 'ritual:tracked';

export interface RitualTrackEntry {
  id: string;
  date: string; // ISO date string
  ritualId: string;
  completedAt: string; // ISO timestamp
}

function getStored(): RitualTrackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RITUAL_TRACK_KEY);
    return raw ? (JSON.parse(raw) as RitualTrackEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: RitualTrackEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RITUAL_TRACK_KEY, JSON.stringify(entries));
}

/**
 * Track a ritual completion.
 */
export function trackRitual(ritualId: string): RitualTrackEntry {
  const entry: RitualTrackEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    ritualId,
    completedAt: new Date().toISOString(),
  };
  const stored = getStored();
  stored.push(entry);
  persist(stored);
  return entry;
}