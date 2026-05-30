import { describe, it, expect } from 'vitest';
import {
  trackSession,
  getActiveSession,
  completeSession,
  type TrackingResult,
} from '@/lib/meditation/session-tracking';

describe('session-tracking', () => {
  describe('trackSession', () => {
    it('creates a new tracking session', () => {
      const result = trackSession();
      expect(result.tracked).toBe(true);
      expect(result.sessionId).toMatch(/^sess_/);
    });

    it('includes timestamp in session ID', () => {
      const before = Date.now();
      const result = trackSession();
      const after = Date.now();
      const idParts = result.sessionId.split('_');
      const timestamp = parseInt(idParts[1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('returns a valid session ID format', () => {
      const result = trackSession();
      // Format: sess_<timestamp>_<random>
      expect(result.sessionId).toMatch(/^sess_\d+_[a-z0-9]+$/);
    });

    it('sets duration if provided', () => {
      trackSession(300);
      const session = getActiveSession();
      expect(session?.durationSeconds).toBe(300);
    });

    it('defaults duration to 0 if not provided', () => {
      trackSession();
      const session = getActiveSession();
      expect(session?.durationSeconds).toBe(0);
    });

    it('sets startedAt to current date', () => {
      const before = new Date();
      trackSession();
      const session = getActiveSession();
      const after = new Date();
      expect(session?.startedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session?.startedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('marks session as not completed initially', () => {
      trackSession();
      const session = getActiveSession();
      expect(session?.completed).toBe(false);
    });
  });

  describe('getActiveSession', () => {
    it('returns active session after tracking', () => {
      const result = trackSession();
      const session = getActiveSession();
      expect(session).not.toBeNull();
      expect(result.sessionId).toBeDefined();
    });

    it('returns the active session after tracking with duration', () => {
      const result = trackSession(100);
      const session = getActiveSession();
      expect(session).not.toBeNull();
      expect(result.sessionId).toBeDefined();
    });
  });

  describe('completeSession', () => {
    it('marks the active session as completed', () => {
      trackSession(120);
      completeSession();
      const session = getActiveSession();
      expect(session?.completed).toBe(true);
    });

    it('does nothing when no session is active', () => {
      // Should not throw
      expect(() => completeSession()).not.toThrow();
    });

    it('preserves other session data when completing', () => {
      trackSession(600);
      completeSession();
      const session = getActiveSession();
      expect(session?.completed).toBe(true);
      expect(session?.durationSeconds).toBe(600);
      expect(session?.startedAt).toBeInstanceOf(Date);
    });
  });
});