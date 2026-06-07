import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

describe('useSearchHistory', () => {
  let mockGetItem: ReturnType<typeof vi.spyOn>;
  let mockSetItem: ReturnType<typeof vi.spyOn>;
  let storageData: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storageData = {};
    mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storageData[key] || null);
    mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storageData[key] = value;
    });
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
    storageData['search-history'] = JSON.stringify(['search1', 'search2', 'search3']);

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual(['search1', 'search2', 'search3']);
  });

  it('handles corrupted localStorage data gracefully', () => {
    storageData['search-history'] = 'invalid json {{{';

    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('handles missing localStorage gracefully', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    expect(result.current.history).toEqual([]);
  });

  it('does not add empty searches to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    result.current.addSearch('   ');
    
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('saves search to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    result.current.addSearch('nova busca');
    
    expect(mockSetItem).toHaveBeenCalledWith(
      'search-history',
      JSON.stringify(['nova busca'])
    );
  });

  it('saves trimmed search to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory());
    
    result.current.addSearch('  busca com espaco  ');
    
    expect(mockSetItem).toHaveBeenCalledWith(
      'search-history',
      JSON.stringify(['busca com espaco'])
    );
  });

  it('moves existing search to front when re-added', () => {
    storageData['search-history'] = JSON.stringify(['search1', 'busca existente', 'search3']);

    const { result } = renderHook(() => useSearchHistory());
    
    result.current.addSearch('busca existente');
    
    const savedData = JSON.parse(storageData['search-history']);
    expect(savedData[0]).toBe('busca existente');
    // Should only appear once
    expect(savedData.filter((h: string) => h === 'busca existente')).toHaveLength(1);
  });

  it('clears history in localStorage', () => {
    storageData['search-history'] = JSON.stringify(['search1', 'search2']);

    const { result } = renderHook(() => useSearchHistory());
    
    result.current.clearHistory();
    
    expect(mockSetItem).toHaveBeenCalledWith('search-history', '[]');
  });

  it('removes specific search from localStorage', () => {
    storageData['search-history'] = JSON.stringify(['search1', 'search2', 'search3']);

    const { result } = renderHook(() => useSearchHistory());
    
    result.current.removeSearch('search2');
    
    const savedData = JSON.parse(storageData['search-history']);
    expect(savedData).not.toContain('search2');
    expect(savedData).toEqual(['search1', 'search3']);
  });

  it('limits history to 20 items', () => {
    // Start with 20 items
    const manyItems = Array.from({ length: 20 }, (_, i) => `search${i}`);
    storageData['search-history'] = JSON.stringify(manyItems);

    const { result } = renderHook(() => useSearchHistory());
    
    // Add a new search - should push oldest out (search19 should be removed)
    result.current.addSearch('new search');
    
    const savedData = JSON.parse(storageData['search-history']);
    expect(savedData).toHaveLength(20);
    expect(savedData[0]).toBe('new search');
    expect(savedData).not.toContain('search19');
  });
});
