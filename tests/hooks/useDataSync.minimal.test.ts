/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataSync } from '@/hooks/useDataSync';

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

describe('useDataSync minimal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('has correct default status', () => {
    const { result } = renderHook(() => useDataSync());
    expect(result.current.status).toEqual({
      lastSync: null,
      pending: 0,
      syncing: false,
      error: null,
    });
  });
});
