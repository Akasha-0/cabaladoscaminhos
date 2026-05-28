/**
 * Meditation tracking with LocalStorage persistence
 */

export interface TrackedSession {
  id: string;
  startedAt: string; // ISO date string
  durationSeconds: number;
  completed: boolean;
  category?: string;
  title?: string;
}

export interface TrackingResult {
  sessionId: string;
  tracked: boolean;
  error?: string;
}

const STORAGE_KEY = "meditation_sessions";

function generateSessionId(): string {
  return `med_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSessions(): TrackedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: TrackedSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Track a meditation session and persist to LocalStorage.
 */
export function trackSession(params?: {
  durationSeconds?: number;
  category?: string;
  title?: string;
}): TrackingResult {
  try {
    const sessionId = generateSessionId();
    const sessions = getSessions();

    const session: TrackedSession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      durationSeconds: params?.durationSeconds ?? 0,
      completed: false,
      category: params?.category,
      title: params?.title,
    };

    sessions.push(session);

    // Keep only last 1000 sessions to prevent storage overflow
    const trimmed = sessions.slice(-1000);
    saveSessions(trimmed);

    return { sessionId, tracked: true };
  } catch (err) {
    return {
      sessionId: "",
      tracked: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Mark a session as completed.
 */
export function completeSession(sessionId: string): boolean {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return false;

  sessions[index].completed = true;
  saveSessions(sessions);
  return true;
}

/**
 * Get all tracked sessions.
 */
export function getTrackedSessions(): TrackedSession[] {
  return getSessions();
}

/**
 * Clear all tracked sessions.
 */
export function clearTracking(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get sessions within a date range.
 */
export function getSessionsByDateRange(
  startDate: Date,
  endDate: Date
): TrackedSession[] {
  const sessions = getSessions();
  return sessions.filter((s) => {
    const date = new Date(s.startedAt);
    return date >= startDate && date <= endDate;
  });
}