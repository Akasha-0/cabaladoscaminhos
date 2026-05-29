import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpiritualHistory } from '@/hooks/useSpiritualHistory';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useSpiritualHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('deve carregar dados do localStorage', async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const storedData = [
      {
        date: yesterday,
        energyReadings: [{ energia: 75, equilibrio: 80, frequencia: 65, date: yesterday, timestamp: Date.now() - 86400000 }],
        divinations: [],
        rituals: [],
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.history).toHaveLength(1);
  });

  it('deve adicionar energy reading', async () => {
    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addEnergyReading({
        energia: 80,
        equilibrio: 85,
        frequencia: 70,
      });
    });

    expect(result.current.history.length).toBeGreaterThanOrEqual(1);
    const todayEntry = result.current.history.find(h => h.date === new Date().toISOString().split('T')[0]);
    expect(todayEntry?.energyReadings.length).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('deve adicionar divination', async () => {
    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addDivination({
        system: 'tarot',
        result: { card: 'The Fool', meaning: 'New beginnings' },
      });
    });

    expect(result.current.history.length).toBeGreaterThanOrEqual(1);
    const todayEntry = result.current.history.find(h => h.date === new Date().toISOString().split('T')[0]);
    expect(todayEntry?.divinations.length).toBe(1);
  });

  it('deve adicionar ritual completion', async () => {
    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addRitualCompletion({
        ritualId: 'test-ritual',
        ritualType: 'oracao',
        completed: true,
      });
    });

    expect(result.current.history.length).toBeGreaterThanOrEqual(1);
    const todayEntry = result.current.history.find(h => h.date === new Date().toISOString().split('T')[0]);
    expect(todayEntry?.rituals.length).toBe(1);
    expect(todayEntry?.rituals[0].completed).toBe(true);
  });

  it('deve calcular streak com dados consecutivos', async () => {
    const today = new Date();
    const dates: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const storedData = dates.map((date, index) => ({
      date,
      energyReadings: index === 0 ? [{ energia: 75, equilibrio: 80, frequencia: 65, date, timestamp: Date.now() }] : [],
      divinations: [],
      rituals: index > 0 ? [{ ritualId: `r${index}`, ritualType: 'oracao' as const, completed: true, date, timestamp: Date.now() }] : [],
    }));

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getStreak()).toBe(5);
  });

  it('deve limpar historico', async () => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = [
      { date: today, energyReadings: [{ energia: 75, equilibrio: 80, frequencia: 65, date: today, timestamp: Date.now() }], divinations: [], rituals: [] },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('deve lidar com localStorage cheio', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addEnergyReading({
        energia: 80,
        equilibrio: 85,
        frequencia: 70,
      });
    });
  });

  it('deve buscar leituras por data', async () => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = [
      { date: today, energyReadings: [{ energia: 75, equilibrio: 80, frequencia: 65, date: today, timestamp: Date.now() }], divinations: [], rituals: [] },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

    const { result } = renderHook(() => useSpiritualHistory());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const entry = result.current.getReadingsForDate(today);
    expect(entry).toBeDefined();
    expect(entry?.energyReadings.length).toBe(1);
  });
});
