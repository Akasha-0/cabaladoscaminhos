/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRitualCalendar } from '@/hooks/useRitualCalendar';
import type { Ritual } from '@/hooks/useRituals';

// Mock useRituals
vi.mock('@/hooks/useRituals', () => ({
  useRituals: () => ({
    rituais: [],
    completadosHoje: [],
    completeRitual: vi.fn(),
    undoCompletion: vi.fn(),
    refreshRituais: vi.fn(),
    refreshCompletions: vi.fn(),
    refetch: vi.fn(),
    isCompletedToday: vi.fn(() => false),
  })
}));

// Mock calendar plugin
vi.mock('@/lib/calendar-plugin', () => ({
  loadCalendarPlugin: vi.fn(() => ({
    requestPermission: vi.fn(() => Promise.resolve('granted')),
    addEvent: vi.fn(() => Promise.resolve('event-id')),
    removeEvent: vi.fn(() => Promise.resolve(true)),
    listEvents: vi.fn(() => Promise.resolve([])),
  }))
}));

describe('useRitualCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns object with required properties', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(result.current).toHaveProperty('upcomingRituals');
    expect(result.current).toHaveProperty('syncStatus');
    expect(result.current).toHaveProperty('addRitualToCalendar');
    expect(result.current).toHaveProperty('removeRitualFromCalendar');
    expect(result.current).toHaveProperty('syncWithDeviceCalendar');
  });

  it('upcomingRituals is an array', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(Array.isArray(result.current.upcomingRituals)).toBe(true);
  });

  it('syncStatus has correct shape', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    const syncStatus = result.current.syncStatus;
    expect(syncStatus).toHaveProperty('isSynced');
    expect(syncStatus).toHaveProperty('lastSyncedAt');
    expect(syncStatus).toHaveProperty('error');
    expect(syncStatus).toHaveProperty('isLoading');
    expect(typeof syncStatus.isSynced).toBe('boolean');
    expect(typeof syncStatus.isLoading).toBe('boolean');
    expect(syncStatus.lastSyncedAt === null || typeof syncStatus.lastSyncedAt === 'string').toBe(true);
    expect(syncStatus.error === null || typeof syncStatus.error === 'string').toBe(true);
  });

  it('addRitualToCalendar is a function', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(typeof result.current.addRitualToCalendar).toBe('function');
  });

  it('removeRitualFromCalendar is a function', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(typeof result.current.removeRitualFromCalendar).toBe('function');
  });

  it('syncWithDeviceCalendar is a function', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(typeof result.current.syncWithDeviceCalendar).toBe('function');
  });

  it('accepts ritual and date parameters', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    const mockRitual: Ritual = {
      id: 'test-ritual',
      nome: 'Test Ritual',
      descricao: 'Test Description',
      frequencia: 'semanal',
      categoria: 'test',
    };
    expect(() => result.current.addRitualToCalendar(mockRitual, new Date(), 'weekly')).not.toThrow();
  });

  it('accepts eventId for remove', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(() => result.current.removeRitualFromCalendar('event-123')).not.toThrow();
  });

  it('works with autoSync false option', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    expect(result.current).toBeDefined();
    expect(result.current.upcomingRituals).toBeDefined();
    expect(result.current.syncStatus).toBeDefined();
  });

  it('works with userId option', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false, userId: 'user-123' }));
    expect(result.current).toBeDefined();
    expect(result.current.syncStatus).toHaveProperty('isSynced');
  });

  it('works with lookAheadDays option', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false, lookAheadDays: 7 }));
    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current.upcomingRituals)).toBe(true);
  });

  it('syncWithDeviceCalendar returns a promise', () => {
    const { result } = renderHook(() => useRitualCalendar({ autoSync: false }));
    const returnValue = result.current.syncWithDeviceCalendar();
    expect(returnValue instanceof Promise).toBe(true);
  });
});
