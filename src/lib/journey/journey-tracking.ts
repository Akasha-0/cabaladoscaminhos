/**
 * Journey tracking utilities using LocalStorage.
 */

const STORAGE_KEY = "journey_tracking";

export interface JourneyEvent {
  id: string;
  timestamp: number;
  stage: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface JourneyData {
  userId: string;
  events: JourneyEvent[];
  startedAt: number;
  updatedAt: number;
}

function getStorage(): JourneyData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JourneyData) : null;
  } catch {
    return null;
  }
}

function setStorage(data: JourneyData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function trackJourney(
  userId: string,
  stage: string,
  action: string,
  metadata?: Record<string, unknown>
): JourneyEvent {
  const now = Date.now();
  const event: JourneyEvent = {
    id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: now,
    stage,
    action,
    metadata,
  };

  const existing = getStorage();
  const data: JourneyData = existing && existing.userId === userId
    ? existing
    : { userId, events: [], startedAt: now, updatedAt: now };

  data.events.push(event);
  data.updatedAt = now;
  setStorage(data);

  return event;
}
