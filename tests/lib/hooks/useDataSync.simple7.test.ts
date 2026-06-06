import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataSync } from '@/hooks/useDataSync';

describe('useDataSync import test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const { result } = renderHook(() => useDataSync());
    expect(result.current.status.syncing).toBe(false);
  });
});
