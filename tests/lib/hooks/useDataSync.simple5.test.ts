import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

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

describe('renderHook test', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it('renders hook', () => {
    const { result } = renderHook(() => useDataSync());
    expect(typeof result.current.sync).toBe('function');
  });
});
