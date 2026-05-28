/**
 * Meditation session tracking utilities
 */

export interface SessionData {
  startedAt: Date;
  durationSeconds: number;
  completed: boolean;
}

export interface TrackingResult {
  sessionId: string;
  tracked: boolean;
}

let activeSession: SessionData | null = null;

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Start tracking a new meditation session.
 */
export function trackSession(durationSeconds?: number): TrackingResult {
  const sessionId = generateSessionId();

  activeSession = {
    startedAt: new Date(),
    durationSeconds: durationSeconds ?? 0,
    completed: false,
  };

  return { sessionId, tracked: true };
}

/**
 * Get the currently active session data.
 */
export function getActiveSession(): SessionData | null {
  return activeSession;
}

/**
 * Mark the current session as completed.
 */
export function completeSession(): void {
  if (activeSession) {
    activeSession.completed = true;
  }
}
