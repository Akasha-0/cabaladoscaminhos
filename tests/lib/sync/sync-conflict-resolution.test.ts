/**
 * Sync Conflict Resolution Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolveConflict,
  hasConflict,
  autoResolve,
  type SyncConflict,
  type ConflictStrategy,
  type ConflictResolution,
} from '@/lib/sync/sync-conflict-resolution';

describe('Sync Conflict Resolution', () => {
  describe('resolveConflict - local-wins strategy', () => {
    it('should resolve conflict by returning local value', () => {
      const conflict: SyncConflict<string> = {
        local: 'local-value',
        remote: 'remote-value',
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'local-wins');
      
      expect(result.resolved).toBe('local-value');
      expect(result.strategy).toBe('local-wins');
      expect(result.resolvedAt).toBeGreaterThan(0);
    });

    it('should work with objects', () => {
      const conflict: SyncConflict<{ name: string }> = {
        local: { name: 'local-name' },
        remote: { name: 'remote-name' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'local-wins');
      
      expect(result.resolved).toEqual({ name: 'local-name' });
    });
  });

  describe('resolveConflict - remote-wins strategy', () => {
    it('should resolve conflict by returning remote value', () => {
      const conflict: SyncConflict<string> = {
        local: 'local-value',
        remote: 'remote-value',
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'remote-wins');
      
      expect(result.resolved).toBe('remote-value');
      expect(result.strategy).toBe('remote-wins');
    });

    it('should work with numbers', () => {
      const conflict: SyncConflict<number> = {
        local: 42,
        remote: 100,
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'remote-wins');
      
      expect(result.resolved).toBe(100);
    });
  });

  describe('resolveConflict - latest-wins strategy', () => {
    it('should return local when local is newer', () => {
      const conflict: SyncConflict<string> = {
        local: 'local-value',
        remote: 'remote-value',
        localTimestamp: 3000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'latest-wins');
      
      expect(result.resolved).toBe('local-value');
    });

    it('should return remote when remote is newer', () => {
      const conflict: SyncConflict<string> = {
        local: 'local-value',
        remote: 'remote-value',
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'latest-wins');
      
      expect(result.resolved).toBe('remote-value');
    });

    it('should return local when timestamps are equal', () => {
      const conflict: SyncConflict<string> = {
        local: 'local-value',
        remote: 'remote-value',
        localTimestamp: 1000,
        remoteTimestamp: 1000,
      };
      
      const result = resolveConflict(conflict, 'latest-wins');
      
      expect(result.resolved).toBe('local-value');
    });
  });

  describe('resolveConflict - merge strategy', () => {
    it('should merge two objects', () => {
      const conflict: SyncConflict<Record<string, unknown>> = {
        local: { a: 1, b: 2 },
        remote: { b: 3, c: 4 },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'merge');
      
      expect(result.resolved).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should prefer non-null remote values', () => {
      const conflict: SyncConflict<{ a: string | null }> = {
        local: { a: 'local' },
        remote: { a: null },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'merge');
      
      expect(result.resolved).toEqual({ a: 'local' });
    });

    it('should return remote when local is null', () => {
      const conflict: SyncConflict<{ a: string } | null> = {
        local: null,
        remote: { a: 'remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'merge');
      
      expect(result.resolved).toEqual({ a: 'remote' });
    });

    it('should merge arrays without duplicates', () => {
      const conflict: SyncConflict<number[]> = {
        local: [1, 2, 3],
        remote: [2, 3, 4],
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'merge');
      
      expect(result.resolved).toEqual([1, 2, 3, 4]);
    });

    it('should merge nested objects', () => {
      const conflict: SyncConflict<{ nested: { x: number; y: number } }> = {
        local: { nested: { x: 1, y: 2 } },
        remote: { nested: { x: 10, y: 20 } },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = resolveConflict(conflict, 'merge');
      
      expect(result.resolved).toEqual({ nested: { x: 10, y: 20 } });
    });
  });

  describe('hasConflict', () => {
    it('should return false for identical strings', () => {
      expect(hasConflict('hello', 'hello')).toBe(false);
    });

    it('should return true for different strings', () => {
      expect(hasConflict('hello', 'world')).toBe(true);
    });

    it('should return false for identical numbers', () => {
      expect(hasConflict(42, 42)).toBe(false);
    });

    it('should return true for different numbers', () => {
      expect(hasConflict(42, 100)).toBe(true);
    });

    it('should return false for identical objects', () => {
      expect(hasConflict({ a: 1 }, { a: 1 })).toBe(false);
    });

    it('should return true for different objects', () => {
      expect(hasConflict({ a: 1 }, { a: 2 })).toBe(true);
    });

    it('should return true for different types', () => {
      expect(hasConflict('string', '123')).toBe(true);
    });

    it('should return false for identical arrays', () => {
      expect(hasConflict([1, 2, 3], [1, 2, 3])).toBe(false);
    });

    it('should return true for different arrays', () => {
      expect(hasConflict([1, 2], [1, 2, 3])).toBe(true);
    });

    it('should return true for array vs object', () => {
      expect(hasConflict([], {})).toBe(true);
    });

    it('should handle null values', () => {
      expect(hasConflict(null, null)).toBe(false);
      expect(hasConflict(null, 'value')).toBe(true);
    });
  });

  describe('autoResolve', () => {
    it('should use latest-wins strategy', () => {
      const conflict: SyncConflict<string> = {
        local: 'local',
        remote: 'remote',
        localTimestamp: 3000,
        remoteTimestamp: 2000,
      };
      
      const result = autoResolve(conflict);
      
      expect(result.strategy).toBe('latest-wins');
      expect(result.resolved).toBe('local');
    });

    it('should pick newer value', () => {
      const conflict: SyncConflict<number> = {
        local: 1,
        remote: 2,
        localTimestamp: 1000,
        remoteTimestamp: 2000,
      };
      
      const result = autoResolve(conflict);
      
      expect(result.resolved).toBe(2);
    });
  });

  describe('ConflictResolution output', () => {
    it('should include resolvedAt timestamp', () => {
      const conflict: SyncConflict<string> = {
        local: 'value',
        remote: 'value',
        localTimestamp: 1000,
        remoteTimestamp: 1000,
      };
      
      const beforeTime = Date.now();
      const result = resolveConflict(conflict, 'local-wins');
      const afterTime = Date.now();
      
      expect(result.resolvedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(result.resolvedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should preserve strategy in result', () => {
      const conflict: SyncConflict<string> = {
        local: 'value',
        remote: 'value',
        localTimestamp: 1000,
        remoteTimestamp: 1000,
      };
      
      const strategies: ConflictStrategy[] = ['local-wins', 'remote-wins', 'latest-wins', 'merge'];
      
      strategies.forEach(strategy => {
        const result = resolveConflict(conflict, strategy);
        expect(result.strategy).toBe(strategy);
      });
    });
  });
});