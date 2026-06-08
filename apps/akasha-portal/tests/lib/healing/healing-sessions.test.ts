import { describe, it, expect, beforeEach } from 'vitest';
import { trackSession, getSession, getAllSessions, getSessionMetrics } from '@/lib/healing/healing-sessions';

describe('healing/healing-sessions', () => {
  beforeEach(() => {
    // Reset module state if needed
  });

  it('trackSession creates a new session', () => {
    const session = trackSession();
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.status).toBe('active');
    expect(session.startTime).toBeInstanceOf(Date);
  });

  it('getSession retrieves tracked session', () => {
    const created = trackSession();
    const retrieved = getSession(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
  });

  it('getSessionMetrics returns valid metrics', () => {
    const metrics = getSessionMetrics();
    expect(typeof metrics.totalSessions).toBe('number');
    expect(typeof metrics.activeSessions).toBe('number');
    expect(typeof metrics.completedSessions).toBe('number');
  });
});