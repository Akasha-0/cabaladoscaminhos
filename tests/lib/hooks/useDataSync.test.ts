/**
 * useDataSync Hook Tests
 *
 * Tests the exported helpers and the hook's complex functions:
 * - detectConflicts (exported pure function)
 * - performSync (CRITICAL - line ~183)
 * - resolveConflict (CRITICAL - line ~244)
 * - markPending (CRITICAL - line ~278)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ─── Mock localStorage ──────────────────────────────────────────────────────

const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ─── Mock fetch ─────────────────────────────────────────────────────────────

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const k of Object.keys(store)) delete store[k];
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  });
});

// ─── Import helpers + hook ───────────────────────────────────────────────────

import {
  detectConflicts,
  type SyncConflict,
} from '@/hooks/useDataSync';

import { useDataSync } from '@/hooks/useDataSync';

// ─── detectConflicts unit tests ─────────────────────────────────────────────

describe('detectConflicts', () => {
  it('returns empty array when localData is null', () => {
    const result = detectConflicts(null, { key: 'value' }, ['key']);
    expect(result).toEqual([]);
  });

  it('returns empty array when cloudData is null', () => {
    const result = detectConflicts({ key: 'value' }, null, ['key']);
    expect(result).toEqual([]);
  });

  it('returns empty array when no pending keys exist', () => {
    const result = detectConflicts({ a: 1 }, { a: 2 }, []);
    expect(result).toEqual([]);
  });

  it('returns empty array when key exists only in local', () => {
    const result = detectConflicts({ a: 1 }, { b: 2 }, ['a']);
    expect(result).toEqual([]);
  });

  it('returns empty array when key exists only in cloud', () => {
    const result = detectConflicts({ a: 1 }, { b: 2 }, ['b']);
    expect(result).toEqual([]);
  });

  it('detects conflict when key exists in both local and cloud', () => {
    const localData = { key: 'localValue' };
    const cloudData = { key: 'cloudValue' };
    const result = detectConflicts(localData, cloudData, ['key']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: 'key',
      localValue: 'localValue',
      cloudValue: 'cloudValue',
      resolution: null,
    });
  });

  it('detects multiple conflicts for multiple keys', () => {
    const localData = { a: 1, b: 2 };
    const cloudData = { a: 10, b: 20 };
    const result = detectConflicts(localData, cloudData, ['a', 'b']);
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('a');
    expect(result[1].key).toBe('b');
  });

  it('ignores keys without conflict (only local)', () => {
    const localData = { onlyLocal: 'x' };
    const cloudData = { onlyCloud: 'y' };
    const result = detectConflicts(localData, cloudData, ['onlyLocal', 'onlyCloud']);
    expect(result).toHaveLength(0);
  });

  it('does not mutate inputs', () => {
    const localData: Record<string, unknown> = { key: 'value' };
    const cloudData: Record<string, unknown> = { key: 'other' };
    detectConflicts(localData, cloudData, ['key']);
    expect(localData.key).toBe('value');
    expect(cloudData.key).toBe('other');
  });
});

// ─── useDataSync hook tests ─────────────────────────────────────────────────

describe('useDataSync', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });
  });

  // ── initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with syncing false, pending 0, error null', () => {
      const { result } = renderHook(() => useDataSync());
      expect(result.current.status.syncing).toBe(false);
      expect(result.current.status.pending).toBe(0);
      expect(result.current.status.error).toBe(null);
    });

    it('exposes sync, markPending, resolveConflict, pushLocal', () => {
      const { result } = renderHook(() => useDataSync());
      expect(typeof result.current.sync).toBe('function');
      expect(typeof result.current.markPending).toBe('function');
      expect(typeof result.current.resolveConflict).toBe('function');
      expect(typeof result.current.pushLocal).toBe('function');
    });

    it('initial pending count reflects existing storage', () => {
      store['custom_pending'] = JSON.stringify(['a', 'b']);
      const { result } = renderHook(() =>
        useDataSync({ storageKey: 'custom' }),
      );
      expect(result.current.status.pending).toBe(2);
    });

    it('initial pending count is 0 when no pending storage', () => {
      const { result } = renderHook(() => useDataSync());
      expect(result.current.status.pending).toBe(0);
    });
  });

  // ── markPending ─────────────────────────────────────────────────────────

  describe('markPending', () => {
    it('adds key to pending list and stores value', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.markPending('testKey', { data: 'testValue' });
      });

      expect(store['spiritual_data_pending']).toBe(
        JSON.stringify(['testKey']),
      );
      expect(store['spiritual_data']).toBe(
        JSON.stringify({ testKey: { data: 'testValue' } }),
      );
    });

    it('does not duplicate key already in pending', () => {
      store['spiritual_data_pending'] = JSON.stringify(['existingKey']);

      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.markPending('existingKey', 'value');
        result.current.markPending('existingKey', 'anotherValue');
      });

      const pending = JSON.parse(store['spiritual_data_pending'] ?? '[]');
      expect(pending).toEqual(['existingKey']);
    });

    it('updates pending count after marking', () => {
      const { result } = renderHook(() => useDataSync());

      expect(result.current.status.pending).toBe(0);

      act(() => {
        result.current.markPending('key1', 'val1');
      });
      expect(result.current.status.pending).toBe(1);

      act(() => {
        result.current.markPending('key2', 'val2');
      });
      expect(result.current.status.pending).toBe(2);
    });

    it('handles empty initial storage gracefully', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.markPending('newKey', { nested: { deep: true } });
      });

      const data = JSON.parse(store['spiritual_data'] ?? '{}');
      expect(data.newKey).toEqual({ nested: { deep: true } });
    });

    it('stores null and undefined values', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.markPending('nullKey', null);
        result.current.markPending('undefKey', undefined);
      });

      const data = JSON.parse(store['spiritual_data'] ?? '{}');
      expect(data.nullKey).toBe(null);
      expect(data.undefKey).toBe(undefined);
    });
  });

  // ── performSync ─────────────────────────────────────────────────────────

  describe('performSync (sync)', () => {
    it('sets syncing true during sync and false after', async () => {
      // Use a promise that stays pending until we control it
      let resolveFetch: () => void;
      const fetchPromise = new Promise<void>((res) => { resolveFetch = res; });
      fetchMock.mockImplementationOnce(() => fetchPromise.then(() => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })));

      const { result } = renderHook(() => useDataSync());

      // Start sync
      const syncPromise = act(async () => {
        await result.current.sync();
      });

      // State should flip to syncing=true briefly
      expect(result.current.status.syncing).toBe(true);

      // Resolve and wait for completion
      resolveFetch!();
      await syncPromise;

      expect(result.current.status.syncing).toBe(false);
    });

    it('pushes local data to cloud on push-only sync', async () => {
      store['spiritual_data'] = JSON.stringify({ pushed: 'value' });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sync/data',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(store['spiritual_data_cloud']).toBe(
        JSON.stringify({ pushed: 'value' }),
      );
      expect(result.current.status.error).toBe(null);
    });

    it('updates lastSync timestamp after successful sync', async () => {
      store['spiritual_data'] = JSON.stringify({ key: 'value' });

      const { result } = renderHook(() => useDataSync());

      const beforeSync = result.current.status.lastSync;

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.lastSync).not.toBe(beforeSync);
      expect(result.current.status.lastSync).toBeTruthy();
    });

    it('clears pending after successful sync', async () => {
      store['spiritual_data'] = JSON.stringify({ key: 'value' });
      store['spiritual_data_pending'] = JSON.stringify(['key']);

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      expect(store['spiritual_data_pending']).toBeUndefined();
      expect(result.current.status.pending).toBe(0);
    });

    it('sets error state on fetch failure', async () => {
      store['spiritual_data'] = JSON.stringify({ key: 'value' });
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBe('Sync failed: 500');
      expect(result.current.status.syncing).toBe(false);
    });

    it('handles null local and cloud gracefully (early return)', async () => {
      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBe(null);
      expect(result.current.status.syncing).toBe(false);
    });

    it('deep-merges local into cloud when both exist and no conflicts', async () => {
      store['spiritual_data'] = JSON.stringify({
        localOnly: 'localValue',
        shared: 'localShared',
      });
      store['spiritual_data_cloud'] = JSON.stringify({
        cloudOnly: 'cloudValue',
        shared: 'cloudShared',
      });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      // mergeValues prioritizes cloud but adds local-only keys
      const synced = JSON.parse(store['spiritual_data_cloud'] ?? '{}');
      expect(synced.cloudOnly).toBe('cloudValue');
      expect(synced.shared).toBe('cloudShared');
      expect(synced.localOnly).toBe('localValue');
    });

    it('calls onConflict callback when conflicts exist', async () => {
      store['spiritual_data'] = JSON.stringify({ conflicted: 'localVal' });
      store['spiritual_data_cloud'] = JSON.stringify({ conflicted: 'cloudVal' });
      store['spiritual_data_pending'] = JSON.stringify(['conflicted']);

      const onConflict = vi.fn().mockResolvedValue('local' as const);

      const { result } = renderHook(() =>
        useDataSync({ onConflict }),
      );

      await act(async () => {
        await result.current.sync();
      });

      expect(onConflict).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'conflicted',
          localValue: 'localVal',
          cloudValue: 'cloudVal',
          resolution: null,
        }),
      );
    });

    it('calls onSyncComplete callback after successful sync', async () => {
      store['spiritual_data'] = JSON.stringify({ key: 'val' });
      const onSyncComplete = vi.fn();

      const { result } = renderHook(() =>
        useDataSync({ onSyncComplete }),
      );

      await act(async () => {
        await result.current.sync();
      });

      expect(onSyncComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          syncing: false,
          error: null,
        }),
      );
    });

    it('resolves conflicts with merged strategy when onConflict is set', async () => {
      store['spiritual_data'] = JSON.stringify({ c: { a: 1 } });
      store['spiritual_data_cloud'] = JSON.stringify({ c: { b: 2 } });
      store['spiritual_data_pending'] = JSON.stringify(['c']);

      const onConflict = vi.fn().mockResolvedValue('merged' as const);

      const { result } = renderHook(() => useDataSync({ onConflict }));

      await act(async () => {
        await result.current.sync();
      });

      const synced = JSON.parse(store['spiritual_data_cloud'] ?? '{}');
      // mergeValues merges both keys
      expect(synced.c).toEqual(expect.objectContaining({ a: 1, b: 2 }));
    });
  });

  // ── resolveConflict ─────────────────────────────────────────────────────

  describe('resolveConflict', () => {
    it('resolves with local value and syncs to cloud', async () => {
      store['spiritual_data'] = JSON.stringify({ conflictKey: 'localVal' });
      store['spiritual_data_cloud'] = JSON.stringify({ conflictKey: 'cloudVal' });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sync/data',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(
        JSON.parse(store['spiritual_data_cloud'] ?? '{}').conflictKey,
      ).toBe('localVal');
    });

    it('resolves with cloud value', async () => {
      store['spiritual_data'] = JSON.stringify({ conflictKey: 'localVal' });
      store['spiritual_data_cloud'] = JSON.stringify({ conflictKey: 'cloudVal' });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'cloud');
      });

      expect(
        JSON.parse(store['spiritual_data_cloud'] ?? '{}').conflictKey,
      ).toBe('cloudVal');
    });

    it('resolves with merged value', async () => {
      store['spiritual_data'] = JSON.stringify({
        conflictKey: { local: true },
      });
      store['spiritual_data_cloud'] = JSON.stringify({
        conflictKey: { cloud: true },
      });

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'merged');
      });

      const resolved = JSON.parse(store['spiritual_data_cloud'] ?? '{}')
        .conflictKey;
      expect(resolved).toEqual(
        expect.objectContaining({ local: true, cloud: true }),
      );
    });

    it('sets error status on failure', async () => {
      store['spiritual_data'] = JSON.stringify({ conflictKey: 'local' });
      store['spiritual_data_cloud'] = JSON.stringify({ conflictKey: 'cloud' });
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(result.current.status.error).toBe('Failed to resolve conflict');
    });

    it('handles missing keys gracefully', async () => {
      store['spiritual_data'] = JSON.stringify({});
      store['spiritual_data_cloud'] = JSON.stringify({});

      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.resolveConflict('nonexistent', 'local');
      });

      expect(result.current.status.error).toBe(null);
    });
  });

  // ── pushLocal ───────────────────────────────────────────────────────────

  describe('pushLocal', () => {
    it('marks conflicting keys in storage', () => {
      store['spiritual_data'] = JSON.stringify({ conflictKey: 'local' });
      store['spiritual_data_cloud'] = JSON.stringify({ conflictKey: 'cloud' });
      store['spiritual_data_pending'] = JSON.stringify(['conflictKey']);

      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.pushLocal();
      });

      const conflicts = JSON.parse(store['spiritual_data_conflicts'] ?? '[]');
      expect(
        conflicts.some((c: { key: string }) => c.key === 'conflictKey'),
      ).toBe(true);
    });

    it('does nothing when no pending keys', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.pushLocal();
      });

      expect(store['spiritual_data_conflicts']).toBeUndefined();
    });
  });

  // ── default options ─────────────────────────────────────────────────────

  describe('default options', () => {
    it('uses spiritual_data as default storageKey', () => {
      const { result } = renderHook(() => useDataSync());
      act(() => {
        result.current.markPending('defaultKey', 'val');
      });
      expect(store['spiritual_data_pending']).toBe(
        JSON.stringify(['defaultKey']),
      );
    });

    it('uses /api/sync/data as default cloudEndpoint', () => {
      store['spiritual_data'] = JSON.stringify({ key: 'val' });
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.sync();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sync/data',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  // ── lastSync persistence effect ─────────────────────────────────────────

  describe('lastSync persistence', () => {
    it('persists lastSync timestamp to storage after sync', async () => {
      store['spiritual_data'] = JSON.stringify({ key: 'val' });
      const { result } = renderHook(() => useDataSync());

      await act(async () => {
        await result.current.sync();
      });

      expect(store['spiritual_data_last_sync']).toBeTruthy();
    });
  });
});
