"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Spiritual History Hook
 * Tracks daily spiritual readings, divinations, and ritual completions
 * Stores the last 30 days of data in localStorage
 */

const STORAGE_KEY = "cabala_spiritual_data";
const MAX_DAYS = 30;

export interface EnergyReading {
  date: string;
  energia: number;
  equilibrio: number;
  frequencia: number;
  timestamp: number;
}

export interface DivinationResult {
  date: string;
  system: "tarot" | "odu" | "astrologia" | "numerologia";
  result: Record<string, unknown>;
  timestamp: number;
}

export interface RitualCompletion {
  date: string;
  ritualId: string;
  ritualType: "oracao" | "meditacao" | "oferenda" | "agradecimento";
  completed: boolean;
  timestamp: number;
}

export interface SpiritualDayEntry {
  date: string;
  energyReadings: EnergyReading[];
  divinations: DivinationResult[];
  rituals: RitualCompletion[];
}

export interface UseSpiritualHistoryReturn {
  history: SpiritualDayEntry[];
  isLoading: boolean;
  addEnergyReading: (reading: Omit<EnergyReading, "date" | "timestamp">) => void;
  addDivination: (divination: Omit<DivinationResult, "date" | "timestamp">) => void;
  addRitualCompletion: (ritual: Omit<RitualCompletion, "date" | "timestamp">) => void;
  getReadingsForDate: (date: string) => SpiritualDayEntry | undefined;
  getReadingsForRange: (startDate: string, endDate: string) => SpiritualDayEntry[];
  getStreak: () => number;
  clearHistory: () => void;
}

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

function loadHistory(): SpiritualDayEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history: SpiritualDayEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage unavailable
  }
}

function pruneOldEntries(history: SpiritualDayEntry[]): SpiritualDayEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS);
  const cutoffStr = getDateString(cutoffDate);
  return history.filter((entry) => entry.date >= cutoffStr);
}

function getOrCreateEntry(history: SpiritualDayEntry[], date: string): SpiritualDayEntry {
  const existing = history.find((e) => e.date === date);
  if (existing) return existing;
  return {
    date,
    energyReadings: [],
    divinations: [],
    rituals: [],
  };
}

function useSpiritualHistory(): UseSpiritualHistoryReturn {
  const [history, setHistory] = useState<SpiritualDayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
    setIsLoading(false);
  }, []);

  const persistHistory = useCallback((updated: SpiritualDayEntry[]) => {
    const pruned = pruneOldEntries(updated);
    saveHistory(pruned);
    setHistory(pruned);
  }, []);

  const addEnergyReading = useCallback(
    (reading: Omit<EnergyReading, "date" | "timestamp">) => {
      const today = getDateString();
      setHistory((prev) => {
        const updated = [...prev];
        const entry = getOrCreateEntry(updated, today);
        const newReading: EnergyReading = {
          ...reading,
          date: today,
          timestamp: Date.now(),
        };
        entry.energyReadings = [...entry.energyReadings, newReading];
        const existingIndex = updated.findIndex((e) => e.date === today);
        if (existingIndex >= 0) {
          updated[existingIndex] = entry;
        } else {
          updated.push(entry);
        }
        persistHistory(updated);
        return updated;
      });
    },
    [persistHistory]
  );

  const addDivination = useCallback(
    (divination: Omit<DivinationResult, "date" | "timestamp">) => {
      const today = getDateString();
      setHistory((prev) => {
        const updated = [...prev];
        const entry = getOrCreateEntry(updated, today);
        const newDivination: DivinationResult = {
          ...divination,
          date: today,
          timestamp: Date.now(),
        };
        entry.divinations = [...entry.divinations, newDivination];
        const existingIndex = updated.findIndex((e) => e.date === today);
        if (existingIndex >= 0) {
          updated[existingIndex] = entry;
        } else {
          updated.push(entry);
        }
        persistHistory(updated);
        return updated;
      });
    },
    [persistHistory]
  );

  const addRitualCompletion = useCallback(
    (ritual: Omit<RitualCompletion, "date" | "timestamp">) => {
      const today = getDateString();
      setHistory((prev) => {
        const updated = [...prev];
        const entry = getOrCreateEntry(updated, today);
        const newRitual: RitualCompletion = {
          ...ritual,
          date: today,
          timestamp: Date.now(),
        };
        entry.rituals = [...entry.rituals, newRitual];
        const existingIndex = updated.findIndex((e) => e.date === today);
        if (existingIndex >= 0) {
          updated[existingIndex] = entry;
        } else {
          updated.push(entry);
        }
        persistHistory(updated);
        return updated;
      });
    },
    [persistHistory]
  );

  const getReadingsForDate = useCallback(
    (date: string): SpiritualDayEntry | undefined => {
      return history.find((e) => e.date === date);
    },
    [history]
  );

  const getReadingsForRange = useCallback(
    (startDate: string, endDate: string): SpiritualDayEntry[] => {
      return history.filter((e) => e.date >= startDate && e.date <= endDate);
    },
    [history]
  );

  const getStreak = useCallback((): number => {
    if (history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < MAX_DAYS; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkStr = getDateString(checkDate);
      const entry = sorted.find((e) => e.date === checkStr);

      if (!entry) {
        if (i === 0) continue;
        break;
      }

      const hasActivity =
        entry.energyReadings.length > 0 ||
        entry.divinations.length > 0 ||
        entry.rituals.some((r) => r.completed);

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }, [history]);

  const clearHistory = useCallback(() => {
    persistHistory([]);
  }, [persistHistory]);

  return {
    history,
    isLoading,
    addEnergyReading,
    addDivination,
    addRitualCompletion,
    getReadingsForDate,
    getReadingsForRange,
    getStreak,
    clearHistory,
  };
}
