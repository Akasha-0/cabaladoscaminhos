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
      expect(state).toHaveProperty('lastSync');
      expect(state).toHaveProperty('isSyncing');
      expect(state).toHaveProperty('syncError');
    });
  });

  describe('getSyncMetadata', () => {
    it('should return null when no data exists', () => {
      const metadata = getSyncMetadata();
      expect(metadata).toBeNull();
    });

    it('should return metadata when data exists', () => {
      const now = Date.now();
      localStorageMock.store[STORAGE_KEY] = JSON.stringify({
        data: { test: 'value' },
        version: CURRENT_VERSION,
        timestamp: now,
      });
      localStorageMock.store[SYNC_TIMESTAMP_KEY] = String(now);
      localStorageMock.store[SYNC_VERSION_KEY] = String(CURRENT_VERSION);

      const metadata = getSyncMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.version).toBe(CURRENT_VERSION);
      expect(metadata?.timestamp).toBe(now);
    });
  });

  describe('getSyncData', () => {
    it('should return null when no data exists', () => {
      const result = getSyncData();
      expect(result).toBeNull();
    });

    it('should return parsed data when exists', () => {
      const testData = { users: [{ id: '1', name: 'Test' }] };
      const now = Date.now();
      localStorageMock.store[STORAGE_KEY] = JSON.stringify({
        data: testData,
        version: CURRENT_VERSION,
        timestamp: now,
      });

      const result = getSyncData<typeof testData>();
      expect(result).not.toBeNull();
      expect(result?.data).toEqual(testData);
      expect(result?.version).toBe(CURRENT_VERSION);
      expect(result?.timestamp).toBe(now);
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
      expect(result.version).toBe(CURRENT_VERSION);
      expect(result.timestamp).toBeDefined();
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
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('timestamp');
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

      const result = mergeSyncData({ age: 31, city: 'NYC' });

      expect(result).not.toBeNull();
      expect(result?.data.name).toBe('John');
      expect(result?.data.age).toBe(31);
      expect(result?.data.city).toBe('NYC');
    });

    it('should preserve version and update timestamp', () => {
      const existingData = { initial: 'data' };
      setSyncData(existingData);
      
      // Get original timestamp
      const originalResult = getSyncData<typeof existingData>();
      const originalTimestamp = originalResult?.timestamp;

      // Wait a bit to ensure different timestamp
      const merged = mergeSyncData({ additional: 'data' });

      expect(merged).not.toBeNull();
      expect(merged?.timestamp).toBeGreaterThanOrEqual(originalTimestamp!);
    });

    it('should handle deep merge for objects', () => {
      setSyncData({ user: { profile: { name: 'Test' } } });
      
      const result = mergeSyncData({ user: { profile: { age: 25 } } });

      expect(result?.data.user.profile.name).toBe('Test');
      expect(result?.data.user.profile.age).toBe(25);
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
  });

  describe('hasSyncData', () => {
    it('should return false when no data exists', () => {
      expect(hasSyncData()).toBe(false);
    });

    it('should return true when data exists', () => {
      setSyncData({ some: 'data' });
      expect(hasSyncData()).toBe(true);
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
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
      }));

      setSyncData(largeData);
      const result = getSyncData<typeof largeData>();

      expect(result?.data).toHaveLength(1000);
    });
  });
});