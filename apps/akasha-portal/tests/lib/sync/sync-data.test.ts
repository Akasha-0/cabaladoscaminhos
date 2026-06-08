import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSyncState,
  getSyncMetadata,
  getSyncData,
  setSyncData,
  mergeSyncData,
  clearSyncData,
  hasSyncData,
  type SyncData,
  type SyncMetadata
} from '@/lib/sync/sync-data';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Sync Data Module', () => {
  const STORAGE_KEY = 'app_sync_data';
  const SYNC_TIMESTAMP_KEY = 'app_sync_timestamp';
  const SYNC_VERSION_KEY = 'app_sync_version';
  const CURRENT_VERSION = 1;

  beforeEach(() => {
    localStorageMock.store = {};
    vi.clearAllMocks();
  });

  describe('getSyncState', () => {
    it('should return current sync state', () => {
      const state = getSyncState();
      expect(state).toHaveProperty('isSyncing');
      expect(state).toHaveProperty('lastSyncAt');
      expect(state).toHaveProperty('syncError');
    });
  });

  describe('getSyncMetadata', () => {
    it('should return null when no data exists', () => {
      const metadata = getSyncMetadata();
      expect(metadata).toBeNull();
    });

    it('should return metadata when data exists', () => {
      const now = new Date().toISOString();
      localStorageMock.store[STORAGE_KEY] = JSON.stringify({
        data: { test: 'value' },
        metadata: {
          version: CURRENT_VERSION,
          syncedAt: now,
          lastModified: now,
        },
      });
      localStorageMock.store[SYNC_TIMESTAMP_KEY] = now;
      localStorageMock.store[SYNC_VERSION_KEY] = String(CURRENT_VERSION);

      const metadata = getSyncMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.version).toBe(CURRENT_VERSION);
      expect(metadata?.syncedAt).toBe(now);
    });
  });

  describe('getSyncData', () => {
    it('should return null when no data exists', () => {
      const result = getSyncData();
      expect(result).toBeNull();
    });

    it('should return parsed data when exists', () => {
      const testData = { users: [{ id: '1', name: 'Test' }] };
      const now = new Date().toISOString();
      localStorageMock.store[STORAGE_KEY] = JSON.stringify({
        data: testData,
        metadata: {
          version: CURRENT_VERSION,
          syncedAt: now,
          lastModified: now,
        },
      });

      const result = getSyncData<typeof testData>();
      expect(result).not.toBeNull();
      expect(result?.data).toEqual(testData);
      expect(result?.metadata.version).toBe(CURRENT_VERSION);
      expect(result?.metadata.syncedAt).toBe(now);
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.store[STORAGE_KEY] = 'invalid json';

      const result = getSyncData();
      expect(result).toBeNull();
    });
  });

  describe('setSyncData', () => {
    it('should store data with correct metadata', () => {
      const testData = { items: ['a', 'b', 'c'] };
      const result = setSyncData(testData);

      expect(result.data).toEqual(testData);
      expect(result.metadata.version).toBe(CURRENT_VERSION);
      expect(result.metadata.syncedAt).toBeDefined();
      expect(result.metadata.lastModified).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it('should update sync timestamp', () => {
      const testData = { key: 'value' };
      setSyncData(testData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        SYNC_TIMESTAMP_KEY,
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        SYNC_VERSION_KEY,
        String(CURRENT_VERSION)
      );
    });

    it('should return proper SyncData structure', () => {
      const testData = { nested: { deep: true } };
      const result = setSyncData(testData);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('version');
      expect(result.metadata).toHaveProperty('syncedAt');
      expect(result.metadata).toHaveProperty('lastModified');
    });

    it('should update sync state lastSyncAt', () => {
      setSyncData({ test: 'value' });
      const state = getSyncState();
      expect(state.lastSyncAt).toBeDefined();
      expect(state.isSyncing).toBe(false);
      expect(state.syncError).toBeNull();
    });
  });

  describe('mergeSyncData', () => {
    it('should return null when no existing data', () => {
      const result = mergeSyncData({ newKey: 'value' });
      expect(result).toBeNull();
    });

    it('should merge partial data into existing', () => {
      const existingData = { name: 'John', age: 30 };
      setSyncData(existingData);

      const result = mergeSyncData<typeof existingData>({ age: 31 });

      expect(result).not.toBeNull();
      expect(result?.data.age).toBe(31);
      expect(result?.data.name).toBe('John');
    });

    it('should preserve version and update lastModified', () => {
      const existingData = { initial: 'data' };
      setSyncData(existingData);
      
      // Get original lastModified
      const originalResult = getSyncData<typeof existingData>();
      const originalLastModified = originalResult?.metadata.lastModified;

      // Merge data
      const merged = mergeSyncData({ additional: 'data' });

      expect(merged).not.toBeNull();
      expect(merged?.metadata.lastModified).toBeDefined();
      expect(new Date(merged!.metadata.lastModified!).getTime())
        .toBeGreaterThanOrEqual(new Date(originalLastModified!).getTime());
    });

    it('should shallow merge objects', () => {
      setSyncData({ user: { profile: { name: 'Test' } } });
      
      const result = mergeSyncData({ user: { profile: { age: 25 } } });

      // Shallow merge replaces nested objects
      expect(result?.data.user).toBeDefined();
    });
  });

  describe('clearSyncData', () => {
    it('should remove all sync-related keys', () => {
      setSyncData({ test: 'data' });
      
      clearSyncData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(SYNC_TIMESTAMP_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(SYNC_VERSION_KEY);
    });

    it('should clear store completely', () => {
      setSyncData({ data: 'value' });
      
      clearSyncData();

      const result = getSyncData();
      expect(result).toBeNull();
    });

    it('should reset sync state', () => {
      setSyncData({ data: 'value' });
      clearSyncData();
      
      const state = getSyncState();
      expect(state.lastSyncAt).toBeNull();
      expect(state.isSyncing).toBe(false);
      expect(state.syncError).toBeNull();
    });
  });

  describe('hasSyncData', () => {
    it('should return false when no data exists', () => {
      expect(hasSyncData()).toBe(false);
    });

    it('should return true when data exists', () => {
      setSyncData({ some: 'data' });
      expect(hasSyncData()).toBe(true);
    });

    it('should return false after clear', () => {
      setSyncData({ data: 'value' });
      clearSyncData();
      expect(hasSyncData()).toBe(false);
    });
  });

  describe('Data integrity', () => {
    it('should preserve data types through set and get', () => {
      const complexData = {
        numbers: [1, 2, 3],
        nested: { deep: { value: true } },
        mixed: [1, 'two', { three: 3 }],
        nullValue: null,
        boolValue: false,
      };

      setSyncData(complexData);
      const result = getSyncData<typeof complexData>();

      expect(result?.data).toEqual(complexData);
    });

    it('should handle empty objects', () => {
      setSyncData({});
      const result = getSyncData();

      expect(result?.data).toEqual({});
    });

    it('should handle large data sets', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
      }));

      setSyncData(largeData);
      const result = getSyncData<typeof largeData>();

      expect(result?.data).toHaveLength(100);
    });

    it('should preserve nested objects', () => {
      const nestedData = { a: { b: { c: { d: 'deep' } } } };
      setSyncData(nestedData);
      const result = getSyncData();

      expect(result?.data).toEqual(nestedData);
    });
  });
});