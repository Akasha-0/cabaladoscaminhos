/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataSync } from '@/hooks/useDataSync';
import type { SyncStatus, SyncConflict, DataSyncOptions } from '@/hooks/useDataSync';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useDataSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('has correct default status values', () => {
      const { result, unmount } = renderHook(() => useDataSync());

      expect(result.current.status).toEqual({
        lastSync: null,
        pending: 0,
        syncing: false,
        error: null,
      });
      unmount();
    });

    it('starts with empty conflicts array', () => {
      const { result, unmount } = renderHook(() => useDataSync());

      expect(result.current.conflicts).toEqual([]);
      unmount();
    });

    it('exposes all required methods', () => {
      const { result, unmount } = renderHook(() => useDataSync());

      expect(result.current.sync).toBeDefined();
      expect(typeof result.current.sync).toBe('function');
      expect(result.current.resolveConflict).toBeDefined();
      expect(typeof result.current.resolveConflict).toBe('function');
      expect(result.current.markPending).toBeDefined();
      expect(typeof result.current.markPending).toBe('function');
      expect(result.current.pushLocal).toBeDefined();
      expect(typeof result.current.pushLocal).toBe('function');
      unmount();
    });
  });

  describe('markPending', () => {
    it('increments pending counter', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.markPending('testKey', { value: 'test' });
      });

      expect(result.current.status.pending).toBe(1);
      unmount();
    });

    it('adds key to pending storage', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.markPending('testKey', { value: 'test' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cabala_sync_data_pending',
        expect.any(String)
      );
      const pendingCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'cabala_sync_data_pending'
      );
      const pending = JSON.parse(pendingCall![1]);
      expect(pending).toContain('testKey');
      unmount();
    });

    it('stores value in local storage', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));
      const testData = { value: 'test' };

      act(() => {
        result.current.markPending('testKey', testData);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cabala_sync_data',
        expect.any(String)
      );
      const storedCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'cabala_sync_data'
      );
      const stored = JSON.parse(storedCall![1]);
      expect(stored.testKey).toEqual(testData);
      unmount();
    });

    it('does not duplicate pending keys', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.markPending('testKey', { value: '1' });
        result.current.markPending('testKey', { value: '2' });
      });

      const pendingCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'cabala_sync_data_pending'
      );
      const pending = JSON.parse(pendingCall![1]);
      expect(pending.filter((k: string) => k === 'testKey').length).toBe(1);
      expect(result.current.status.pending).toBe(1);
      unmount();
    });

    it('accumulates multiple pending keys', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.markPending('key1', { value: '1' });
        result.current.markPending('key2', { value: '2' });
        result.current.markPending('key3', { value: '3' });
      });

      expect(result.current.status.pending).toBe(3);
      unmount();
    });
  });

  describe('pushLocal', () => {
    it('saves data to localStorage', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.markPending('dataKey', { data: 'test' });
      });

      act(() => {
        result.current.pushLocal();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      unmount();
    });

    it('detects conflicts when local and cloud differ', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ dataKey: { local: true } });
        if (key === 'cabala_sync_data_pending') return JSON.stringify(['dataKey']);
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ dataKey: { cloud: true } });
        if (key === 'cabala_sync_data_conflicts') return '[]';
        return null;
      });

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.pushLocal();
      });

      const conflictsCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'cabala_sync_data_conflicts'
      );
      expect(conflictsCall).toBeDefined();
      const conflicts = JSON.parse(conflictsCall![1]);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].key).toBe('dataKey');
      unmount();
    });

    it('does not create conflict when values match', async () => {
      const sameData = { value: 'same' };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ dataKey: sameData });
        if (key === 'cabala_sync_data_pending') return JSON.stringify(['dataKey']);
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ dataKey: sameData });
        if (key === 'cabala_sync_data_conflicts') return '[]';
        return null;
      });

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      act(() => {
        result.current.pushLocal();
      });

      const conflictsCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'cabala_sync_data_conflicts'
      );
      // If no conflict, the setItem for conflicts should not be called or should have empty array
      if (conflictsCall) {
        const conflicts = JSON.parse(conflictsCall[1]);
        expect(conflicts.length).toBe(0);
      }
      unmount();
    });
  });

  describe('syncToCloud', () => {
    it('fetches POST to cloud endpoint', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      unmount();
    });

    it('sends data with timestamp in body', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(call[1].body as string);
      expect(body.data).toBeDefined();
      expect(body.timestamp).toBeDefined();
      unmount();
    });

    it('throws error on non-ok response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await expect(result.current.sync()).rejects.toThrow('Sync failed: 500');
      });
      unmount();
    });
  });

  describe('syncFromCloud', () => {
    it('fetches GET from cloud endpoint', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'cloud' }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sync',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      unmount();
    });

    it('returns parsed JSON data', async () => {
      const cloudData = { profile: { name: 'Test' } };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cloudData),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.lastSync).toBeTruthy();
      unmount();
    });

    it('throws error on non-ok response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await expect(result.current.sync()).rejects.toThrow('Fetch failed: 404');
      });
      unmount();
    });
  });

  describe('performSync', () => {
    it('combines local and cloud sync', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ local: 'data' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ cloud: 'data' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(global.fetch).toHaveBeenCalled();
      unmount();
    });

    it('updates lastSync on successful sync', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ local: 'data' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ cloud: 'data' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.lastSync).toBeTruthy();
      unmount();
    });

    it('clears pending after successful sync', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ local: 'data' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ cloud: 'data' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.pending).toBe(0);
      unmount();
    });

    it('prevents concurrent syncs', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ local: 'data' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ cloud: 'data' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      let resolveFetch: (value: unknown) => void;
      vi.spyOn(global, 'fetch').mockImplementation(
        () => new Promise(resolve => { resolveFetch = resolve as (value: unknown) => void; })
      );

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      let sync1Promise: Promise<void>;
      act(() => {
        sync1Promise = result.current.sync();
      });

      let sync2Promise: Promise<void>;
      act(() => {
        sync2Promise = result.current.sync();
      });

      await act(async () => {
        resolveFetch!({ ok: true, json: () => Promise.resolve({ success: true }) });
        await sync1Promise;
        await sync2Promise;
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      unmount();
    });

    it('handles no data scenario gracefully', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.status.lastSync).toBeTruthy();
      unmount();
    });
  });

  describe('resolveConflict', () => {
    it('handles local resolution', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ conflictKey: { local: true } });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ conflictKey: { cloud: true } });
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(global.fetch).toHaveBeenCalled();
      unmount();
    });

    it('handles cloud resolution', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ conflictKey: { local: true } });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ conflictKey: { cloud: true } });
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'cloud');
      });

      expect(global.fetch).toHaveBeenCalled();
      unmount();
    });

    it('handles merged resolution', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ conflictKey: { local: true } });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ conflictKey: { cloud: true } });
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'merged');
      });

      expect(global.fetch).toHaveBeenCalled();
      unmount();
    });

    it('removes resolved conflict from conflicts array', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ conflictKey: { local: true } });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ conflictKey: { cloud: true } });
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(result.current.conflicts.find(c => c.key === 'conflictKey')).toBeUndefined();
      unmount();
    });

    it('sets error on sync failure', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ conflictKey: { local: true } });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ conflictKey: { cloud: true } });
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.resolveConflict('conflictKey', 'local');
      });

      expect(result.current.status.error).toBe('Failed to resolve conflict');
      unmount();
    });
  });

  describe('custom options', () => {
    it('uses custom storageKey', async () => {
      const customKey = 'custom_sync_key';
      const { result, unmount } = renderHook(() => useDataSync({
        autoSync: false,
        storageKey: customKey,
      }));

      act(() => {
        result.current.markPending('test', { value: 'test' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `${customKey}_pending`,
        expect.any(String)
      );
      unmount();
    });

    it('uses custom cloudEndpoint', async () => {
      const customEndpoint = '/api/custom-sync';
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({
        autoSync: false,
        cloudEndpoint: customEndpoint,
      }));

      await act(async () => {
        await result.current.sync();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        customEndpoint,
        expect.objectContaining({ method: 'POST' })
      );
      unmount();
    });

    it('uses custom syncIntervalMs', () => {
      const customInterval = 60000; // 1 minute
      vi.spyOn(global, 'setInterval').mockReturnValue(123 as unknown as ReturnType<typeof setInterval>);

      const { unmount } = renderHook(() => useDataSync({
        autoSync: true,
        syncIntervalMs: customInterval,
      }));

      expect(global.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        customInterval
      );
      unmount();
    });
  });

  describe('auto-sync behavior', () => {
    it('does not auto-sync when disabled', () => {
      vi.spyOn(global, 'setInterval').mockReturnValue(123 as unknown as ReturnType<typeof setInterval>);

      const { unmount } = renderHook(() => useDataSync({ autoSync: false }));

      expect(global.setInterval).not.toHaveBeenCalled();
      unmount();
    });

    it('sets up interval when enabled', () => {
      vi.spyOn(global, 'setInterval').mockReturnValue(123 as unknown as ReturnType<typeof setInterval>);

      const { unmount } = renderHook(() => useDataSync({ autoSync: true }));

      expect(global.setInterval).toHaveBeenCalled();
      unmount();
    });

    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
      const setIntervalSpy = vi.spyOn(global, 'setInterval').mockReturnValue(123 as unknown as ReturnType<typeof setInterval>);

      const { unmount } = renderHook(() => useDataSync({ autoSync: true }));

      unmount();

      expect(global.clearInterval).toHaveBeenCalledWith(123);
    });

    it('syncs immediately if lastSync is older than interval', async () => {
      const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data_last_sync') return oldTimestamp;
        if (key === 'cabala_sync_data') return JSON.stringify({ data: 'test' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ data: 'cloud' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { unmount } = renderHook(() => useDataSync({ autoSync: true }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      unmount();
    });

    it('does not sync immediately if lastSync is recent', () => {
      const recentTimestamp = new Date().toISOString();
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data_last_sync') return recentTimestamp;
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { unmount } = renderHook(() => useDataSync({ autoSync: true }));

      // With recent lastSync, no immediate sync should happen
      expect(global.fetch).not.toHaveBeenCalled();
      unmount();
    });

    it('persists lastSync to localStorage', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ data: 'test' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ data: 'cloud' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cabala_sync_data_last_sync',
        expect.any(String)
      );
      unmount();
    });
  });

  describe('error handling', () => {
    it('sets error status on sync failure', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ data: 'test' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ data: 'cloud' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBe('Network error');
      unmount();
    });

    it('sets syncing to false after error', async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data') return JSON.stringify({ data: 'test' });
        if (key === 'cabala_sync_data_cloud') return JSON.stringify({ data: 'cloud' });
        if (key === 'cabala_sync_data_pending') return JSON.stringify([]);
        return null;
      });

      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.syncing).toBe(false);
      unmount();
    });

    it('handles localStorage errors gracefully', async () => {
      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      // Simulate corrupted localStorage data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'cabala_sync_data_pending') return 'invalid json {{{';
        return null;
      });

      act(() => {
        result.current.markPending('test', { value: 'test' });
      });

      // Should not throw, pending should be 1 from the successful mark
      expect(result.current.status.pending).toBe(1);
      unmount();
    });

    it('handles fetch JSON parse errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('JSON parse error')),
      } as Response);

      const { result, unmount } = renderHook(() => useDataSync({ autoSync: false }));

      await act(async () => {
        await result.current.sync();
      });

      expect(result.current.status.error).toBeTruthy();
      unmount();
    });
  });
});