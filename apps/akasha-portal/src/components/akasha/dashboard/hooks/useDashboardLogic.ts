import { useState, useEffect } from 'react';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';
import type { CaixaSintese, DimensaoSintese } from '@/lib/grimoire/synthesis/synthesizer';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';
import { useAkashaSynthesis } from './useAkashaSynthesis';
import { useCyclePersistence } from './useCyclePersistence';
import { useDashboardData } from './useDashboardData';
import type { CycleHistoryData } from './useCyclePersistence';

interface MandatoResponse {
  pilares: PilaresDados;
}

export function useDashboardLogic(userId: string, initialPilares?: PilaresDados) {
  const [activeTab, setActiveTab] = useState<'daily' | 'profile' | 'progress'>('daily');
  const [completing, setCompleting] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [streakToast, setStreakToast] = useState<string | null>(null);
  const [activeFilterChip, setActiveFilterChip] = useState<string | null>(null);

  const [detSintese, setDetSintese] = useState<CaixaSintese | null>(() => {
    if (initialPilares) {
      try {
        return sintetizarMapa(initialPilares);
      } catch (err) {
        console.error('Error synthesizing initial pilares:', err);
      }
    }
    return null;
  });
  const [loadingMandato, setLoadingMandato] = useState(!initialPilares);
  const [selectedDimension, setSelectedDimension] = useState<DimensaoSintese | null>(null);
  const [dimFocoExpanded, setDimFocoExpanded] = useState(false);
  const [ritualExpanded, setRitualExpanded] = useState(false);
  const [cycleHistory, setCycleHistory] = useState<CycleHistoryData | null>(null);
  const [cycleHistoryLoading, setCycleHistoryLoading] = useState(false);

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useDashboardData({ userId });
  const {
    data: dailyData,
    synthesis,
    loading: synthesisLoading,
    refetch: refetchSynthesis,
  } = useAkashaSynthesis({ userId });
  const { persistCycle, getCycleHistory } = useCyclePersistence({ userId });

  const fetchMandato = async () => {
    setLoadingMandato(true);
    try {
      const res = await fetch('/api/akasha/mandato-do-dia');
      if (res.ok) {
        const data = (await res.json()) as MandatoResponse;
        if (data.pilares) {
          const sint = sintetizarMapa(data.pilares);
          setDetSintese(sint);
        }
      }
    }
    catch (err) {
      console.error('Error fetching deterministic mandato:', err);
    } finally {
      setLoadingMandato(false);
    }
  };

  useEffect(() => {
    if (!initialPilares) {
      fetchMandato();
    }
  }, [initialPilares]);

  useEffect(() => {
    if (statsData?.history && dailyData?.ritual) {
      const todayStr = new Date().toISOString().split('T')[0];
      const done = statsData.history.some((item) => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === todayStr && item.ritualName === dailyData.ritual.titulo;
      });
      setCompletedToday(done);
    }
  }, [statsData, dailyData]);

  useEffect(() => {
    if (!dailyData) return;
    void persistCycle(dailyData);
  }, [dailyData, persistCycle]);

  useEffect(() => {
    if (!getCycleHistory) return;
    setCycleHistoryLoading(true);
    void getCycleHistory(30).then((data) => {
      setCycleHistory(data);
      setCycleHistoryLoading(false);
    });
  }, [getCycleHistory]);

  const handleCompleteRitual = async () => {
    if (!dailyData?.ritual) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/akasha/dashboard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualName: dailyData.ritual.titulo,
          ritualLevel: synthesis?.akashaProfile?.dominantFrequency ?? 'gift',
        }),
      });
      if (res.ok) {
        setCompletedToday(true);
        const currentStreak = statsData?.stats?.currentStreak ?? 0;
        setStreakToast(`🔥 ${currentStreak + 1} dia${currentStreak + 1 !== 1 ? 's' : ''}`);
        setTimeout(() => setStreakToast(null), 4000);
        refetchStats();
      }
    } catch (err) {
      console.error('Error completing ritual:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRetryAll = () => {
    refetchStats();
    refetchSynthesis();
    fetchMandato();
  };

  return {
    activeTab,
    setActiveTab,
    completing,
    completedToday,
    streakToast,
    activeFilterChip,
    setActiveFilterChip,
    detSintese,
    loadingMandato,
    selectedDimension,
    setSelectedDimension,
    dimFocoExpanded,
    setDimFocoExpanded,
    ritualExpanded,
    setRitualExpanded,
    cycleHistory,
    cycleHistoryLoading,
    statsData,
    statsLoading,
    dailyData,
    synthesis,
    synthesisLoading,
    refetchSynthesis,
    handleCompleteRitual,
    handleRetryAll,
  };
}
