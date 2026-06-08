import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { detectConflicts } from '@/hooks/useDataSync';

describe('detectConflicts simple', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('returns empty when localData null', () => {
    expect(detectConflicts(null, { key: 'v' }, ['key'])).toEqual([]);
  });
  it('detects conflict', () => {
    const result = detectConflicts({ k: 'l' }, { k: 'c' }, ['k']);
    expect(result).toHaveLength(1);
  });
});
