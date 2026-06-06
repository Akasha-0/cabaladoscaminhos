import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { useDataSync } from '@/hooks/useDataSync';

describe('renderHook with autoSync false', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it('renders with autoSync false', () => {
    const { result } = renderHook(() => useDataSync({ autoSync: false }));
    expect(result.current.status.syncing).toBe(false);
  });

  it('renders with no options', () => {
    const { result } = renderHook(() => useDataSync());
    expect(result.current.status.syncing).toBe(false);
  });
});
