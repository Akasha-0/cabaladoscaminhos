import { describe, it, expect, beforeEach } from 'vitest';
import { trackProgress, loadTracking, clearTracking } from '@/lib/vibration/v2/vibration-tracking';

describe('vibration-tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('trackProgress returns entry with id, timestamp, phase, notes fields', () => {
    const entry = trackProgress('awakening');
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('timestamp');
    expect(entry).toHaveProperty('phase', 'awakening');
    expect(entry).toHaveProperty('notes');
  });

  it('trackProgress saves entry to localStorage', () => {
    const entry = trackProgress('test-phase');
    const tracking = loadTracking();
    expect(tracking.entries).toHaveLength(1);
    expect(tracking.entries[0].id).toBe(entry.id);
  });

  it('trackProgress without notes omits notes field', () => {
    const entry = trackProgress('phase-one');
    expect(entry).not.toHaveProperty('notes');
  });

  it('trackProgress with notes includes notes field', () => {
    const entry = trackProgress('phase-one', 'feeling good');
    expect(entry.notes).toBe('feeling good');
  });

  it('loadTracking returns empty tracking when no localStorage data', () => {
    const result = loadTracking();
    expect(result).toEqual({ entries: [], lastUpdated: 0 });
  });

  it('loadTracking returns { entries: [], lastUpdated: 0 } on server (SSR)', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - testing SSR behavior
    delete globalThis.window;
    const result = loadTracking();
    globalThis.window = originalWindow;
    expect(result).toEqual({ entries: [], lastUpdated: 0 });
  });

  it('loadTracking returns data when localStorage has data', () => {
    trackProgress('phase-a');
    trackProgress('phase-b', 'with notes');
    const result = loadTracking();
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].phase).toBe('phase-a');
    expect(result.entries[1].phase).toBe('phase-b');
    expect(result.entries[1].notes).toBe('with notes');
    expect(result.lastUpdated).toBeGreaterThan(0);
  });

  it('loadTracking returns empty tracking on corrupted JSON', () => {
    localStorage.setItem('vibration_tracking_v2', 'not valid json {{{');
    const result = loadTracking();
    expect(result).toEqual({ entries: [], lastUpdated: 0 });
  });

  it('clearTracking removes data from localStorage', () => {
    trackProgress('phase-x');
    trackProgress('phase-y');
    clearTracking();
    const result = loadTracking();
    expect(result).toEqual({ entries: [], lastUpdated: 0 });
  });

  it('multiple trackProgress calls accumulate entries in loadTracking result', () => {
    trackProgress('phase-1');
    trackProgress('phase-2');
    trackProgress('phase-3', 'final notes');
    const result = loadTracking();
    expect(result.entries).toHaveLength(3);
    expect(result.entries[0].phase).toBe('phase-1');
    expect(result.entries[1].phase).toBe('phase-2');
    expect(result.entries[2].phase).toBe('phase-3');
    expect(result.entries[2].notes).toBe('final notes');
  });
});