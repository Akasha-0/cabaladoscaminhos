/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDataSync } from '@/hooks/useDataSync';
import type { SyncStatus, SyncConflict, DataSyncOptions } from '@/hooks/useDataSync';

describe('useDataSync', () => {
  let mockLocalStorage: Record<string, string>;
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockSetInterval: ReturnType<typeof vi.fn>;
  let mockClearInterval: ReturnType<typeof vi.fn>;

  const createLocalStorageMock = () => {
    mockLocalStorage = {};
    return {
      getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { mockLocalStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; }),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = {};
    mockFetch = vi.fn();
    mockSetInterval = vi.fn(() => 123);
    mockClearInterval = vi.fn();

    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('setInterval', mockSetInterval);
    vi.stubGlobal('clearInterval', mockClearInterval);

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: createLocalStorageMock(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('initial state', () => {
    it('has correct default status values', () => {
      const { result } = renderHook(() => useDataSync());

      expect(result.current.status).toEqual({
        lastSync: null,
        pending: 0,
        syncing: false,
        error: null,
      });
 });

    it('starts with empty conflicts array', () => {
      const { result } = renderHook(() => useDataSync());

      expect(result.current.conflicts).toEqual([]);
    });

    it('exposes all required methods', () => {
      const { result } = renderHook(() => useDataSync());

      expect(result.current.sync).toBeDefined();
      expect(typeof result.current.sync).toBe('function');
      expect(result.current.resolveConflict).toBeDefined();
      expect(typeof result.current.resolveConflict).toBe('function');
      expect(result.current.markPending).toBeDefined();
      expect(typeof result.current.markPending).toBe('function');
      expect(result.current.pushLocal).toBeDefined();
      expect(typeof result.current.pushLocal).toBe('function');
    });
  });

  describe('markPending', () => {
    it('increments pending counter', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.markPending('testKey', { value: 'test' });
      });

      expect(result.current.status.pending).toBe(1);
    });

    it('adds key to pending storage', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.markPending('testKey', { value: 'test' });
      });

      const pending = JSON.parse(mockLocalStorage['cabala_sync_data_pending']);
      expect(pending).toContain('testKey');
    });

    it('stores value in local storage', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));
      const testData = { value: 'test' };

      await act(async () => {
        result.current.markPending('testKey', testData);
      });

      const stored = JSON.parse(mockLocalStorage['cabala_sync_data']);
      expect(stored.testKey).toEqual(testData);
    });

    it('does not duplicate pending keys', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.markPending('testKey', { value: '1' });
        result.current.markPending('testKey', { value: '2' });
      });

      const pending = JSON.parse(mockLocalStorage['cabala_sync_data_pending']);
      expect(pending.filter((k: string) => k === 'testKey').length).toBe(1);
      expect(result.current.status.pending).toBe(1);
    });

    it('accumulates multiple pending keys', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.markPending('key1', { value: '1' });
        result.current.markPending('key2', { value: '2' });
        result.current.markPending('key3', { value: '3' });
      });

      expect(result.current.status.pending).toBe(3);
    });
  });

  describe('pushLocal', () => {
    it('saves data to localStorage', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.markPending('dataKey', { data: 'test' });
      });

      await act(async () => {
        result.current.pushLocal();
      });

      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('detects conflicts when local and cloud differ', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ dataKey: { local: true } });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify(['dataKey']);
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ dataKey: { cloud: true } });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.pushLocal();
      });

      const conflicts = JSON.parse(mockLocalStorage['cabala_sync_data_conflicts']);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].key).toBe('dataKey');
    });

    it('does not create conflict when values match', async () => {
      const sameData = { value: 'same' };
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ dataKey: sameData });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify(['dataKey']);
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ dataKey: sameData });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        result.current.pushLocal();
      });

      const conflicts = mockLocalStorage['cabala_sync_data_conflicts'];
      expect(conflicts || '[]').toBe('[]');
    });
  });

  describe('syncToCloud', () => {
    it('fetches POST to cloud endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('sends data with timestamp in body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      const call = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(call[1].body as string);
      expect(body.data).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('throws error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await expect(result.current.sync()).rejects.toThrow('Sync failed: 500');
      });
    });
  });

  describe('syncFromCloud', () => {
    it('fetches GET from cloud endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'cloud' }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      let cloudData: unknown;
      await act(async () => {
        cloudData = await result.current.sync();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('returns parsed JSON data', async () => {
      const cloudData = { profile: { name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cloudData),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      let fetchedData: unknown;
      await act(async () => {
        fetchedData = await result.current.sync();
      });

      expect(fetchedData).toEqual(cloudData);
    });

    it('throws error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await expect(result.current.sync()).rejects.toThrow('Fetch failed: 404');
      });
    });
  });

  describe('performSync', () => {
    it('combines local and cloud sync', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ local: 'data' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ cloud: 'data' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('sets syncing to true during sync', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ local: 'data' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ cloud: 'data' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }), 50)));

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      let syncingDuring: boolean | undefined;
      act(() => {
        result.current.sync().then(() => {});
        syncingDuring = result.current.status.syncing;
      });

      expect(syncingDuring).toBe(true);
    });

    it('updates lastSync on successful sync', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ local: 'data' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ cloud: 'data' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.lastSync).toBeTruthy();
    });

    it('clears pending after successful sync', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ local: 'data' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ cloud: 'data' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.pending).toBe(0);
    });

    it('prevents concurrent syncs', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ local: 'data' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ cloud: 'data' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }), 100)));

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        const sync1 = result.current.sync();
        const sync2 = result.current.sync();
        await Promise.all([sync1, sync2]);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles no data scenario gracefully', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.status.lastSync).toBeTruthy();
    });
  });

  describe('resolveConflict', () => {
    it('handles local resolution', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ conflictKey: { local: true } });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ conflictKey: { cloud: true } });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('handles cloud resolution', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ conflictKey: { local: true } });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ conflictKey: { cloud: true } });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'cloud');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('handles merged resolution', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ conflictKey: { local: true } });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ conflictKey: { cloud: true } });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'merged');
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('removes resolved conflict from conflicts array', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ conflictKey: { local: true } });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ conflictKey: { cloud: true } });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(result.current.conflicts.find(c => c.key === 'conflictKey')).toBeUndefined();
    });

    it('sets error on sync failure', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ conflictKey: { local: true } });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ conflictKey: { cloud: true } });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(result.current.status.error).toBe('Failed to resolve conflict');
    });
  });

  describe('custom options', () => {
    it('uses custom storageKey', async () => {
      const customKey = 'custom_sync_key';
      const { result } = renderHook(() => useDataSync({
        autoSync: false,
        storageKey: customKey,
      }));

      await act(async () => {
        result.current.markPending('test', { value: 'test' });
      });

      const pending = JSON.parse(mockLocalStorage[`${customKey}_pending`]);
      expect(pending).toContain('test');
    });

    it('uses custom cloudEndpoint', async () => {
      const customEndpoint = '/api/custom-sync';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({
        autoSync: false,
        cloudEndpoint: customEndpoint,
      }));

      await act(async () => {
        await result.current.sync();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        customEndpoint,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('uses custom syncIntervalMs', () => {
      const customInterval = 60000; // 1 minute

      renderHook(() => useDataSync({
        autoSync: true,
        syncIntervalMs: customInterval,
      }));

      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        customInterval
      );
    });
  });

  describe('auto-sync behavior', () => {
    it('does not auto-sync when disabled', () => {
      renderHook(() => useDataSync({ autoSync: false }));

      expect(mockSetInterval).not.toHaveBeenCalled();
    });

    it('sets up interval when enabled', () => {
      renderHook(() => useDataSync({ autoSync: true }));

      expect(mockSetInterval).toHaveBeenCalled();
    });

    it('clears interval on unmount', () => {
      const { unmount } = renderHook(() => useDataSync({ autoSync: true }));

      unmount();

      expect(mockClearInterval).toHaveBeenCalledWith(123);
    });

    it('syncs immediately if lastSync is older than interval', () => {
      const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      mockLocalStorage['cabala_sync_data_last_sync'] = oldTimestamp;
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ data: 'test' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ data: 'cloud' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      renderHook(() => useDataSync({ autoSync: true }));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('does not sync immediately if lastSync is recent', () => {
      const recentTimestamp = new Date().toISOString();
      mockLocalStorage['cabala_sync_data_last_sync'] = recentTimestamp;

      renderHook(() => useDataSync({ autoSync: true }));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('persists lastSync to localStorage', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ data: 'test' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ data: 'cloud' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(mockLocalStorage['cabala_sync_data_last_sync']).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('sets error status on sync failure', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ data: 'test' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ data: 'cloud' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBe('Network error');
    });

    it('sets syncing to false after error', async () => {
      mockLocalStorage['cabala_sync_data'] = JSON.stringify({ data: 'test' });
      mockLocalStorage['cabala_sync_data_cloud'] = JSON.stringify({ data: 'cloud' });
      mockLocalStorage['cabala_sync_data_pending'] = JSON.stringify([]);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.syncing).toBe(false);
    });

    it('handles localStorage errors gracefully', async () => {
      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      // Simulate corrupted localStorage data
      mockLocalStorage['cabala_sync_data_pending'] = 'invalid json {{{';

      await act(async () => {
        result.current.markPending('test', { value: 'test' });
      });

      // Should not throw, pending should be 1 from the successful mark
      expect(result.current.status.pending).toBe(1);
    });

    it('handles fetch JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('JSON parse error')),
      });

      const { result } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBeTruthy();
    });
  });
});
