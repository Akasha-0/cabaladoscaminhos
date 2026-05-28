// Healing sessions tracking module

export interface HealingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  clientId?: string;
  practitionerId?: string;
  type?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
}

// In-memory session store (replace with DB in production)
const sessions: Map<string, HealingSession> = new Map();

/**
 * Track a new healing session
 * @param options - Session options
 * @returns The created session
 */
export function trackSession(options?: Partial<HealingSession>): HealingSession {
  const id = crypto.randomUUID();
  const session: HealingSession = {
    id,
    startTime: new Date(),
    status: 'active',
    ...options,
  };
  sessions.set(id, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(id: string): HealingSession | undefined {
  return sessions.get(id);
}

/**
 * End an active session
 */
export function endSession(id: string, notes?: string): HealingSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  session.endTime = new Date();
  session.status = 'completed';
  if (notes) session.notes = notes;
  return session;
}

/**
 * Get all sessions
 */
export function getAllSessions(): HealingSession[] {
  return Array.from(sessions.values());
}

/**
 * Get session metrics
 */
export function getSessionMetrics(): SessionMetrics {
  const all = Array.from(sessions.values());
  return {
    totalSessions: all.length,
    activeSessions: all.filter(s => s.status === 'active').length,
    completedSessions: all.filter(s => s.status === 'completed').length,
  };
}