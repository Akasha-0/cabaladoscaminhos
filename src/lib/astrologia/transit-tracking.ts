// fallow-ignore-file unused-file
import type { Transito } from './trânsitos/calculator';

const STORAGE_KEY = 'transit_tracking';

export interface TransitTrackingEntry {
  id: string;
  planeta: string;
  planetaNatal: string;
  aspecto: string;
  inicio: string;
  fim: string | null;
  createdAt: string;
  dismissed: boolean;
}

export interface TransitTracking {
  entries: TransitTrackingEntry[];
  lastUpdated: string;
}

export function createTrackingEntry(transito: Transito): TransitTrackingEntry {
  return {
    id: `${transito.planeta}-${transito.planetaNatal}-${transito.inicio.getTime()}`,
    planeta: transito.planeta,
    planetaNatal: transito.planetaNatal,
    aspecto: transito.aspecto,
    inicio: transito.inicio.toISOString(),
    fim: transito.fim ? transito.fim.toISOString() : null,
    createdAt: new Date().toISOString(),
    dismissed: false,
  };
}

export function loadTracking(): TransitTracking {
  if (typeof window === 'undefined') {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { entries: [], lastUpdated: new Date().toISOString() };
    }
    return JSON.parse(raw) as TransitTracking;
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

export function saveTracking(data: TransitTracking): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function trackTransit(transito: Transito): TransitTrackingEntry {
  const tracking = loadTracking();
  const existingIndex = tracking.entries.findIndex(
    (e) => e.planeta === transito.planeta && e.planetaNatal === transito.planetaNatal && !e.dismissed
  );
  const entry = createTrackingEntry(transito);

  if (existingIndex >= 0) {
    tracking.entries[existingIndex] = entry;
  } else {
    tracking.entries.push(entry);
  }
  tracking.lastUpdated = new Date().toISOString();
  saveTracking(tracking);
  return entry;
}

export function dismissTransit(id: string): void {
  const tracking = loadTracking();
  const entry = tracking.entries.find((e) => e.id === id);
  if (entry) {
    entry.dismissed = true;
    tracking.lastUpdated = new Date().toISOString();
    saveTracking(tracking);
  }
}

export function getActiveTransits(): TransitTrackingEntry[] {
  const tracking = loadTracking();
  return tracking.entries.filter((e) => !e.dismissed && e.fim === null);
}

export function clearTracking(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}