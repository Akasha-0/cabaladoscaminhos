'use client';

/**
 * useCyclePersistence - persists cycle snapshot and area history to DB.
 *
 * Called after useAkashaSynthesis returns fresh data. Stores:
 * - CycleSnapshot (personal numbers + modulation per day)
 * - AreaHistoryEntry (per-area frequency/intensity per day)
 * - ExerciseCompletion records (for tracking which exercises were shown)
 *
 * P6 (iter33): Agente Evolutivo persistence layer.
 * P7 (iter34): Adds getCycleHistory — retrieves stored snapshots for pattern display.
 */

import { useCallback, useRef } from 'react';
import type { DailyContentUI, CycleSnapshotUI, AkashaSynthesisUI } from './useAkashaSynthesis';

interface UseCyclePersistenceOptions {
  userId: string;
}

export interface CycleHistoryData {
  snapshots: Array<{
    id: string;
    date: string;
    modulation: unknown[];
    overallEnergy: number | null;
    synthesis: string | null;
    exercisesJson: unknown[] | null;
  }>;
  areaHistory: Array<{
    id: string;
    date: string;
    area: string;
    dominantFrequency: string;
    intensity: number;
    cycleBoost: string | null;
    alignmentScore: number | null;
    dominantPillar: string | null;
  }>;
  exercises: Array<{
    id: string;
    exerciseId: string;
    area: string;
    title: string;
    completed: boolean;
    completedAt: string | null;
    snapshotDate: string;
  }>;
  meta: {
    userId: string;
    fromDate: string;
    days: number;
    area: string | null;
  };
}

interface UseCyclePersistenceReturn {
  /** Persist cycle + area data after a successful daily fetch. Idempotent. */
  persistCycle: (daily: DailyContentUI) => Promise<{ success: boolean; error?: string }>;
  /** Mark an exercise as completed. */
  markExerciseComplete: (exerciseId: string) => Promise<boolean>;
  /** Retrieve cycle history from DB for pattern display. */
  getCycleHistory: (days?: number) => Promise<CycleHistoryData | null>;
}

export function useCyclePersistence({
  userId,
}: UseCyclePersistenceOptions): UseCyclePersistenceReturn {
  const persistLock = useRef(false);

  const persistCycle = useCallback(
    async (daily: DailyContentUI): Promise<{ success: boolean; error?: string }> => {
      if (!userId || !daily.cycle) return { success: false, error: 'No cycle data' };

      // Prevent double-persist from React strict mode double-invoke
      if (persistLock.current) return { success: true };
      persistLock.current = true;

      try {
        const cycle: CycleSnapshotUI = daily.cycle;
        const synthesis: AkashaSynthesisUI | null = daily.synthesis ?? null;

        // Build area map from synthesis.areas
        const areas: Record<string, {
          frequency: string;
          intensity: number;
          pillarContribution: Record<string, string>;
        }> = {};

        if (synthesis?.areas) {
          for (const [area, narrative] of Object.entries(synthesis.areas)) {
            if (narrative) {
              areas[area] = {
                frequency: narrative.frequency ?? 'shadow',
                intensity: narrative.intensity ?? 1,
                pillarContribution: (narrative as unknown as Record<string, unknown>).pillarContribution as Record<string, string> ?? {},
              };
            }
          }
        }

        // Flatten exercises from cycle.exercises.prioritizedExercises
        const exercises = (cycle.exercises?.prioritizedExercises ?? []).map((ex) => ({
          id: (ex as Record<string, unknown>).id as string ?? ex.title,
          area: ex.area,
          title: ex.title,
          instruction: (ex as Record<string, unknown>).description as string ?? '',
          duration: ex.duration,
          difficulty: ex.difficulty,
          type: ex.type,
        }));

        const payload = {
          snapshot: {
            birthDate: cycle.snapshot.birthDate,
            currentDate: cycle.snapshot.currentDate,
            age: cycle.snapshot.age,
            lifePath: cycle.snapshot.lifePath,
            personalDay: cycle.snapshot.personalDay as unknown as Record<string, unknown>,
            personalMonth: cycle.snapshot.personalMonth as unknown as Record<string, unknown>,
            personalYear: cycle.snapshot.personalYear as unknown as Record<string, unknown>,
            universalYear: cycle.snapshot.universalYear as unknown as Record<string, unknown>,
            currentPinnacle: cycle.snapshot.currentPinnacle as unknown as Record<string, unknown>,
            challenges: (cycle.snapshot as unknown as Record<string, unknown>).challenges as Record<string, unknown> ?? {},
            karmicLessons: cycle.snapshot.karmicLessons as unknown as Record<string, unknown>,
            maturity: cycle.snapshot.maturity as unknown as Record<string, unknown>,
            synthesis: cycle.snapshot.synthesis,
            overallEnergy: cycle.snapshot.overallEnergy,
          },
          modulation: cycle.modulation,
          exercises,
          areas,
        };

        const res = await fetch('/api/akasha/cycle/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          return { success: false, error: err.error ?? `HTTP ${res.status}` };
        }

        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[useCyclePersistence] persistCycle error:', msg);
        return { success: false, error: msg };
      } finally {
        // Unlock after a short delay to handle rapid re-fetches
        setTimeout(() => { persistLock.current = false; }, 2000);
      }
    },
    [userId]
  );

  const markExerciseComplete = useCallback(
    async (exerciseId: string): Promise<boolean> => {
      if (!userId || !exerciseId) return false;

      try {
        const res = await fetch(`/api/akasha/cycle/exercises/${encodeURIComponent(exerciseId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
        return res.ok;
      } catch (err) {
        console.error('[useCyclePersistence] markExerciseComplete error:', err);
        return false;
      }
    },
    [userId]
  );

  const getCycleHistory = useCallback(
    async (days = 30): Promise<CycleHistoryData | null> => {
      if (!userId) return null;
      try {
        const res = await fetch(
          `/api/akasha/cycle/snapshot?days=${days}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (!res.ok) return null;
        const data: CycleHistoryData = await res.json();
        return data;
      } catch (err) {
        console.error('[useCyclePersistence] getCycleHistory error:', err);
        return null;
      }
    },
    [userId]
  );

  return { persistCycle, markExerciseComplete, getCycleHistory };
}
