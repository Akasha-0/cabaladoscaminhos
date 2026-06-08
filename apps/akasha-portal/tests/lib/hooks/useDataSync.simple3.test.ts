import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { useDataSync } from '@/hooks/useDataSync';

describe('useDataSync simple', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('initial state', () => {
    const { result } = renderHook(() => useDataSync());
    expect(result.current.status.syncing).toBe(false);
  });
});
