'use client';

/**
 * Meditation session management
 */

export interface Session {
  id: string;
  meditationId: string;
  title: string;
  category: string;
  startedAt: number;
  durationSeconds: number;
  elapsedSeconds: number;
  paused: boolean;
  completed: boolean;
}

const STORAGE_KEY = 'meditation_active_sessions';

function generateId(): string {
  return `msess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export interface CreateSessionParams {
  meditationId: string;
  title: string;
  category: string;
  durationSeconds: number;
}

/**
 * Create a new meditation session.
 */
export function createSession(params: CreateSessionParams): Session {
  const sessions = getSessions();
  
  const session: Session = {
    id: generateId(),
    meditationId: params.meditationId,
    title: params.title,
    category: params.category,
    startedAt: Date.now(),
    durationSeconds: params.durationSeconds,
    elapsedSeconds: 0,
    paused: false,
    completed: false,
  };
  
  sessions.push(session);
  saveSessions(sessions);
  
  return session;
}

/**
 * Get all sessions.
 */
export function getAllSessions(): Session[] {
  return getSessions();
}

/**
 * Get a session by ID.
 */
export function getSession(id: string): Session | undefined {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
}

/**
 * Update a session's elapsed time.
 */
export function updateSessionProgress(id: string, elapsedSeconds: number): Session | undefined {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return undefined;
  
  sessions[index].elapsedSeconds = elapsedSeconds;
  saveSessions(sessions);
  
  return sessions[index];
}

/**
 * Pause a session.
 */
export function pauseSession(id: string): Session | undefined {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return undefined;
  
  sessions[index].paused = true;
  saveSessions(sessions);
  
  return sessions[index];
}

/**
 * Resume a paused session.
 */
export function resumeSession(id: string): Session | undefined {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return undefined;
  
  sessions[index].paused = false;
  saveSessions(sessions);
  
  return sessions[index];
}

/**
 * Mark a session as completed.
 */
export function completeSession(id: string): Session | undefined {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) return undefined;
  
  sessions[index].completed = true;
  saveSessions(sessions);
  
  return sessions[index];
}

/**
 * Delete a session.
 */
export function deleteSession(id: string): boolean {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== id);
  
  if (filtered.length === sessions.length) return false;
  
  saveSessions(filtered);
  return true;
}

/**
 * Clear all sessions.
 */
export function clearAllSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get active (not completed) sessions.
 */
export function getActiveSessions(): Session[] {
  return getSessions().filter(s => !s.completed);
}