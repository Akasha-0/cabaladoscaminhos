/**
 * @akasha/portal — Dashboard Hook
 *
 * Hook para buscar dados do dashboard do usuário.
 */

'use client';

import type { DashboardStats, StreakDay, RitualHistoryItem } from '@akasha/core';
import { useState, useEffect, useCallback } from 'react';
import { mockStats, mockStreak, mockHistory } from '../mocks';

interface DashboardData {
  stats: DashboardStats;
  streak: StreakDay[];
  history: RitualHistoryItem[];
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseDashboardDataOptions {
  userId: string;
  enabled?: boolean;
}

export function useDashboardData({
  userId,
  enabled = true,
}: UseDashboardDataOptions): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/akasha/dashboard/stats?userId=${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!cancelled) {
          setData({
            stats: result.stats ?? mockStats,
            streak: result.streak ?? mockStreak,
            history: result.history ?? mockHistory,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          // Fallback para mock data em caso de erro
          setData({
            stats: mockStats,
            streak: mockStreak,
            history: mockHistory,
          });
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, refreshKey]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export type { DashboardData, UseDashboardDataOptions };
