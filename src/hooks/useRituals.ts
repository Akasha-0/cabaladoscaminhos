'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Ritual {
  id: string;
  nome: string;
  descricao: string;
  frequencia: 'diario' | 'semanal' | 'mensal';
  categoria: string;
  icon?: string;
  duracaoMinutos?: number;
}

export interface RitualCompletion {
  ritualId: string;
  completedAt: string;
  nota?: string;
}

export interface RitualStreak {
  ritualId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompleted: string | null;
}
export interface RitualStats {
  totalCompletions: number;
  completionsToday: number;
  completionsThisWeek: number;
  completionsThisMonth: number;
}

interface UseRitualsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  userId?: string;
}

function useRituals(options: UseRitualsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 60000, userId } = options;

  const [rituais, setRituais] = useState<Ritual[]>([]);
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const [streaks, setStreaks] = useState<Map<string, RitualStreak>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RitualStats>({
    totalCompletions: 0,
    completionsToday: 0,
    completionsThisWeek: 0,
    completionsThisMonth: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStreak = useCallback((ritualId: string, completionList: RitualCompletion[]): RitualStreak => {
    const ritualCompletions = completionList
      .filter((c) => c.ritualId === ritualId)
      .map((c) => new Date(c.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    if (ritualCompletions.length === 0) {
      return { ritualId, currentStreak: 0, longestStreak: 0, lastCompleted: null };
    }

    const lastCompleted = ritualCompletions[0].toISOString();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completionDates = [...new Set(
      ritualCompletions.map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )].sort((a, b) => b - a);

    if (completionDates.length > 0) {
      const daysSinceLastCompletion = Math.floor(
        (today.getTime() - completionDates[0]) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCompletion <= 1) {
        currentStreak = 1;
        for (let i = 1; i < completionDates.length; i++) {
          const dayDiff = Math.floor(
            (completionDates[i - 1] - completionDates[i]) / (1000 * 60 * 60 * 24)
          );
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    tempStreak = 1;
    for (let i = 1; i < completionDates.length; i++) {
      const dayDiff = Math.floor(
        (completionDates[i - 1] - completionDates[i]) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { ritualId, currentStreak, longestStreak, lastCompleted };
  }, []);

  const calculateStats = useCallback((completionList: RitualCompletion[]): RitualStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalCompletions: completionList.length,
      completionsToday: completionList.filter((c) => new Date(c.completedAt) >= today).length,
      completionsThisWeek: completionList.filter((c) => new Date(c.completedAt) >= weekStart).length,
      completionsThisMonth: completionList.filter((c) => new Date(c.completedAt) >= monthStart).length,
    };
  }, []);

  const fetchRituais = useCallback(async () => {
    try {
      setError(null);
      const url = userId ? `/api/rituais?userId=${userId}` : '/api/rituais';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao carregar rituais');
      }

      const data = await response.json();
      setRituais(data.rituais || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRituais([]);
    }
  }, [userId]);

  const fetchCompletions = useCallback(async () => {
    try {
      const url = userId ? `/api/rituais/completions?userId=${userId}` : '/api/rituais/completions';
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          setCompletions([]);
          return;
        }
        throw new Error('Erro ao carregar completions');
      }

      const data = await response.json();
      const completionList: RitualCompletion[] = data.completions || data || [];
      setCompletions(completionList);

      const newStreaks = new Map<string, RitualStreak>();
      for (const ritual of rituais) {
        newStreaks.set(ritual.id, calculateStreak(ritual.id, completionList));
      }
      setStreaks(newStreaks);
      setStats(calculateStats(completionList));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [userId, rituais, calculateStreak, calculateStats]);

  const refreshAll = useCallback(async () => {
    await fetchRituais();
    await fetchCompletions();
  }, [fetchRituais, fetchCompletions]);

  const completeRitual = useCallback(async (ritualId: string, nota?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/rituais/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ritualId, nota, userId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao completar ritual');
      }

      const completion: RitualCompletion = await response.json();
      setCompletions((prev) => [...prev, completion]);
      setStreaks((prev) => {
        const newStreaks = new Map(prev);
        newStreaks.set(ritualId, calculateStreak(ritualId, [...completions, completion]));
        return newStreaks;
      });
      setStats((prev) => ({
        ...prev,
        totalCompletions: prev.totalCompletions + 1,
        completionsToday: prev.completionsToday + 1,
        completionsThisWeek: prev.completionsThisWeek + 1,
        completionsThisMonth: prev.completionsThisMonth + 1,
      }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar ritual');
      return false;
    }
  }, [userId, completions, calculateStreak]);

  const undoCompletion = useCallback(async (ritualId: string, completedAt: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/rituais/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ritualId, completedAt, userId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao desfazer completion');
      }

      setCompletions((prev) =>
        prev.filter((c) => !(c.ritualId === ritualId && c.completedAt === completedAt))
      );
      setStreaks((prev) => {
        const newStreaks = new Map(prev);
        const updatedCompletions = completions.filter(
          (c) => !(c.ritualId === ritualId && c.completedAt === completedAt)
        );
        newStreaks.set(ritualId, calculateStreak(ritualId, updatedCompletions));
        return newStreaks;
      });
      setStats((prev) => ({
        ...prev,
        totalCompletions: prev.totalCompletions - 1,
        completionsToday: prev.completionsToday - 1,
        completionsThisWeek: prev.completionsThisWeek - 1,
        completionsThisMonth: prev.completionsThisMonth - 1,
      }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desfazer completion');
      return false;
    }
  }, [userId, completions, calculateStreak]);

  const isCompletedToday = useCallback((ritualId: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completions.some((c) => {
      const completionDate = new Date(c.completedAt);
      completionDate.setHours(0, 0, 0, 0);
      return c.ritualId === ritualId && completionDate.getTime() === today.getTime();
    });
  }, [completions]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    };
    init();
  }, [refreshAll]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchCompletions();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchCompletions]);

  useEffect(() => {
    if (rituais.length > 0 && completions.length > 0) {
      const newStreaks = new Map<string, RitualStreak>();
      for (const ritual of rituais) {
        newStreaks.set(ritual.id, calculateStreak(ritual.id, completions));
      }
      setStreaks(newStreaks);
    }
  }, [rituais, completions, calculateStreak]);

  return {
    rituais,
    completions,
    streaks,
    stats,
    loading,
    error,
    completeRitual,
    undoCompletion,
    isCompletedToday,
    refetch: refreshAll,
    refreshRituais: fetchRituais,
    refreshCompletions: fetchCompletions,
  };
}
