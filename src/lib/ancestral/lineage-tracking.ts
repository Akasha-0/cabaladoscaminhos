// lineage-tracking.ts — Ancestral lineage tracking
// @ts-nocheck
 

const STORAGE_KEY = 'ancestral_lineage';

export interface LineageEntry {
  id: string;
  timestamp: number;
  lineage: string[];
  notes?: string;
}

export interface LineageTrack {
  entries: LineageEntry[];
  lastUpdated: number;
}

function load(): LineageTrack {
  if (typeof window === 'undefined') return { entries: [], lastUpdated: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], lastUpdated: 0 };
    return JSON.parse(raw) as LineageTrack;
  } catch {
    return { entries: [], lastUpdated: 0 };
  }
}

function persist(track: LineageTrack): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(track));
  } catch {
    // quota exceeded or private mode
  }
}

export function trackLineage(lineage: string[], notes?: string): LineageEntry {
  const entry: LineageEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    lineage: [...lineage],
    notes,
  };
  const track = load();
  track.entries.push(entry);
  track.lastUpdated = entry.timestamp;
  persist(track);
  return entry;
}

export function getLineageHistory(): LineageEntry[] {
  return load().entries;
}

export function clearLineageHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
