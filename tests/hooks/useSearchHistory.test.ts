import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

describe('useSearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('returns initial empty history', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('returns history array', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(Array.isArray(result.current.history)).toBe(true);
  });

  it('has addSearch function', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(typeof result.current.addSearch).toBe('function');
  });

  it('has clearHistory function', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(typeof result.current.clearHistory).toBe('function');
  });

  it('has removeSearch function', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(typeof result.current.removeSearch).toBe('function');
  });

  it('loads history from localStorage', () => {
    const storedHistory = JSON.stringify(['search1', 'search2', 'search3']);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedHistory);

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual(['search1', 'search2', 'search3']);
  });

  it('handles corrupted localStorage data gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid json {{{');

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('adds search to history', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.addSearch('nova busca');
    });
    
    expect(result.current.history).toContain('nova busca');
  });

  it('does not add empty searches', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.addSearch('   ');
    });
    
    expect(result.current.history).toEqual([]);
  });

  it('removes duplicates when adding new search', () => {
    const storedHistory = JSON.stringify(['busca existente']);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedHistory);

    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.addSearch('busca existente');
    });
    
    // Should not duplicate, and new search should be first
    expect(result.current.history.filter(h => h === 'busca existente')).toHaveLength(1);
  });

  it('limits history to MAX_ITEMS (20)', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => `search${i}`);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(manyItems));

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toHaveLength(20);
  });

  it('clears all history', () => {
    const storedHistory = JSON.stringify(['search1', 'search2']);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedHistory);

    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.clearHistory();
    });
    
    expect(result.current.history).toEqual([]);
  });

  it('removes specific search from history', () => {
    const storedHistory = JSON.stringify(['search1', 'search2', 'search3']);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedHistory);

    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.removeSearch('search2');
    });
    
    expect(result.current.history).not.toContain('search2');
    expect(result.current.history).toHaveLength(2);
  });

  it('handles missing localStorage gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('trims whitespace from searches', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    act(() => {
      result.current.addSearch('  busca com espaco  ');
    });
    
    expect(result.current.history).toContain('busca com espaco');
  });
});

// Helper for act
function act(callback: () => void) {
  callback();
}
