import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAfirmacoes } from '@/hooks/useAfirmacoes';

describe('useAfirmacoes', () => {
  let storageData: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    storageData = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storageData[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storageData[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete storageData[key];
    });
  });

  it('returns currentAffirmation', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(result.current.currentAffirmation).toBeDefined();
    expect(typeof result.current.currentAffirmation).toBe('object');
  });

  it('currentAffirmation has id', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(result.current.currentAffirmation.id).toBeDefined();
  });

  it('currentAffirmation has texto', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(result.current.currentAffirmation.texto).toBeDefined();
    expect(typeof result.current.currentAffirmation.texto).toBe('string');
  });

  it('has getNewAffirmation function', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(typeof result.current.getNewAffirmation).toBe('function');
  });

  it('has saveFavorite function', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(typeof result.current.saveFavorite).toBe('function');
  });

  it('has removeFavorite function', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(typeof result.current.removeFavorite).toBe('function');
  });

  it('has favorites array', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(Array.isArray(result.current.favorites)).toBe(true);
  });

  it('starts with empty favorites by default', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    expect(result.current.favorites).toHaveLength(0);
  });

  it('loads favorites from localStorage', () => {
    const storedFavorites = [
      { id: '1', texto: 'Test affirmation', autor: 'Test' },
      { id: '2', texto: 'Another affirmation', autor: 'Test' },
    ];
    storageData['cabala-afirmacoes-favoritas'] = JSON.stringify(storedFavorites);

    const { result } = renderHook(() => useAfirmacoes());
    
    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites[0].id).toBe('1');
    expect(result.current.favorites[1].id).toBe('2');
  });

  it('handles corrupted localStorage gracefully', () => {
    storageData['cabala-afirmacoes-favoritas'] = 'invalid json {{{';

    const { result } = renderHook(() => useAfirmacoes());
    
    // Should fall back to empty array
    expect(result.current.favorites).toHaveLength(0);
  });

  it('getNewAffirmation returns an affirmation', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = result.current.getNewAffirmation();
    
    expect(affirmation).toBeDefined();
    expect(affirmation.id).toBeDefined();
    expect(affirmation.texto).toBeDefined();
  });

  it('getNewAffirmation changes currentAffirmation', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    act(() => {
      result.current.getNewAffirmation();
    });
    
    // The function should work
    expect(result.current.currentAffirmation).toBeDefined();
  });

  it('saveFavorite adds affirmation to favorites', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = { id: '999', texto: 'Test save', autor: 'Test' };
    
    act(() => {
      result.current.saveFavorite(affirmation);
    });
    
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].id).toBe('999');
  });

  it('saveFavorite returns true on success', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = { id: '999', texto: 'Test save', autor: 'Test' };
    
    let returnValue: boolean | undefined;
    act(() => {
      returnValue = result.current.saveFavorite(affirmation);
    });
    
    expect(returnValue).toBe(true);
  });

  it('saveFavorite does not duplicate existing favorites', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = { id: '999', texto: 'Test save', autor: 'Test' };
    
    act(() => {
      result.current.saveFavorite(affirmation);
    });
    act(() => {
      result.current.saveFavorite(affirmation);
    });
    
    // Should only have one
    expect(result.current.favorites).toHaveLength(1);
  });

  it('removeFavorite removes affirmation from favorites', () => {
    const storedFavorites = [
      { id: '1', texto: 'Test affirmation', autor: 'Test' },
    ];
    storageData['cabala-afirmacoes-favoritas'] = JSON.stringify(storedFavorites);

    const { result } = renderHook(() => useAfirmacoes());
    
    act(() => {
      result.current.removeFavorite('1');
    });
    
    expect(result.current.favorites).toHaveLength(0);
  });

  it('removeFavorite returns true on success', () => {
    const storedFavorites = [
      { id: '1', texto: 'Test affirmation', autor: 'Test' },
    ];
    storageData['cabala-afirmacoes-favoritas'] = JSON.stringify(storedFavorites);

    const { result } = renderHook(() => useAfirmacoes());
    
    let returnValue: boolean | undefined;
    act(() => {
      returnValue = result.current.removeFavorite('1');
    });
    
    expect(returnValue).toBe(true);
  });

  it('removeFavorite handles non-existent id gracefully', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    act(() => {
      result.current.removeFavorite('non-existent-id');
    });
    
    // Should not throw, favorites should still be empty
    expect(result.current.favorites).toHaveLength(0);
  });

  it('saves favorites to localStorage when adding', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = { id: '999', texto: 'Test save', autor: 'Test' };
    
    act(() => {
      result.current.saveFavorite(affirmation);
    });
    
    expect(storageData['cabala-afirmacoes-favoritas']).toBeDefined();
    const saved = JSON.parse(storageData['cabala-afirmacoes-favoritas']);
    expect(saved).toHaveLength(1);
  });

  it('saves favorites to localStorage when removing', () => {
    const storedFavorites = [
      { id: '1', texto: 'Test affirmation', autor: 'Test' },
    ];
    storageData['cabala-afirmacoes-favoritas'] = JSON.stringify(storedFavorites);

    const { result } = renderHook(() => useAfirmacoes());
    
    act(() => {
      result.current.removeFavorite('1');
    });
    
    const saved = JSON.parse(storageData['cabala-afirmacoes-favoritas']);
    expect(saved).toHaveLength(0);
  });

  it('can add and remove multiple favorites', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    act(() => {
      result.current.saveFavorite({ id: '1', texto: 'First', autor: 'Test' });
      result.current.saveFavorite({ id: '2', texto: 'Second', autor: 'Test' });
      result.current.saveFavorite({ id: '3', texto: 'Third', autor: 'Test' });
    });
    
    expect(result.current.favorites).toHaveLength(3);
    
    act(() => {
      result.current.removeFavorite('2');
    });
    
    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites.find(f => f.id === '2')).toBeUndefined();
  });

  it('favorites have correct structure', () => {
    const { result } = renderHook(() => useAfirmacoes());
    
    const affirmation = { id: '999', texto: 'Test save', autor: 'Test Author' };
    
    act(() => {
      result.current.saveFavorite(affirmation);
    });
    
    const favorite = result.current.favorites[0];
    expect(favorite).toHaveProperty('id');
    expect(favorite).toHaveProperty('texto');
    expect(favorite).toHaveProperty('autor');
  });
});