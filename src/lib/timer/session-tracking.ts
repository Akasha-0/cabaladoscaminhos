'use client';

export interface TimerSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  type: string;
}

const STORAGE_KEY = 'timer_sessions';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function trackSession(type: string = 'default'): TimerSession {
  const sessions = getSessionsRaw();
  const session: TimerSession = {
    id: generateId(),
    startedAt: Date.now(),
    type,
  };
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return session;
}

export function completeSession(id: string, duration?: number): void {
  const sessions = getSessionsRaw();
  const index = sessions.findIndex((s) => s.id === id);
  if (index !== -1) {
    sessions[index].completedAt = Date.now();
    sessions[index].duration = duration ?? (sessions[index].completedAt - sessions[index].startedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

export function getSessions(): TimerSession[] {
  return getSessionsRaw();
}

function getSessionsRaw(): TimerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimerSession[]) : [];
  } catch {
    return [];
  }
}