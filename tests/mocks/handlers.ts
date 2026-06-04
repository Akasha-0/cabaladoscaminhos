import { vi } from 'vitest';

export const mockFetch = (data: unknown, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  }) as Promise<Response>;
};

export const setupFetchMock = () => {
  Object.defineProperty(global, 'fetch', {
    writable: true,
    value: vi.fn(),
  });
};

export const clearFetchMock = () => {
  vi.clearAllMocks();
};
