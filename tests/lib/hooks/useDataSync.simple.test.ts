import { describe, it, expect, vi, beforeEach } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('simple', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
  it('mock works', () => {
    fetchMock.mockResolvedValue({ ok: true });
    expect(typeof fetchMock).toBe('function');
  });
});
