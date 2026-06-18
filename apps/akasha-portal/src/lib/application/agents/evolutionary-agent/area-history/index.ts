/**
 * area-history/index.ts
 *
 * Tracks area reads and detects patterns from history entries.
 */

import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AreaHistoryEntry {
  date: string;
  dominantArea: string;
  dominantFrequency: 'shadow' | 'gift' | 'siddhi';
  intensity: number;
}

export interface CycleModulation {
  area: string;
  alignmentScore: number;
  suggestedBoost: 'increase' | 'decrease' | 'maintain';
  rationale: string;
}

// ─── History ──────────────────────────────────────────────────────────────────

/**
 * Regista uma leitura de área e devolve o historial actualizado (max 30 entradas).
 */
export function trackAreaRead(
  entry: AreaHistoryEntry,
  existingHistory: AreaHistoryEntry[],
): AreaHistoryEntry[] {
  // Deduplicate by date — keep only most recent per date
  const byDate = new Map<string, AreaHistoryEntry>();
  for (const e of existingHistory) {
    byDate.set(e.date, e);
  }
  byDate.set(entry.date, entry);

  const merged = Array.from(byDate.values());
  // Sort descending by date
  merged.sort((a, b) => b.date.localeCompare(a.date));
  return merged.slice(0, 30);
}

/**
 * Detecta padrões de área a partir do historial — min 3 entradas para análise.
 */
export function detectAreaPatterns(
  history: AreaHistoryEntry[],
): { persistentShadows: string[]; emergingGifts: string[]; dominantArea: string } | null {
  if (history.length < 3) return null;

  const recent = history.slice(0, 5);
  const areaFreq = new Map<string, { shadow: number; gift: number; total: number }>();

  for (const entry of recent) {
    const cur = areaFreq.get(entry.dominantArea) ?? { shadow: 0, gift: 0, total: 0 };
    cur.total += 1;
    if (entry.dominantFrequency === 'shadow') cur.shadow += 1;
    else if (entry.dominantFrequency === 'gift') cur.gift += 1;
    areaFreq.set(entry.dominantArea, cur);
  }

  const persistentShadows: string[] = [];
  const emergingGifts: string[] = [];

  for (const [area, freq] of areaFreq.entries()) {
    if (freq.shadow >= 2) persistentShadows.push(area);
    if (freq.gift >= 2) emergingGifts.push(area);
  }

  // Dominant area = most frequent in recent history
  let dominantArea = recent[0].dominantArea;
  let maxCount = 0;
  for (const [area, freq] of areaFreq.entries()) {
    if (freq.total > maxCount) {
      maxCount = freq.total;
      dominantArea = area;
    }
  }

  return { persistentShadows, emergingGifts, dominantArea };
}
