// ============================================================
// SPIRITUAL STATS CALCULATOR - CABALA DOS CAMINHOS
// ============================================================
// Shared utility for calculating spiritual statistics across
// multiple item types (favorites, energy, stats, notifications,
// divine connections, health metrics, etc.)
//
// Clone group: 90d90719 (108 lines, 3 instances)
// Files: energy, favorites, stats routes
// ============================================================

import type { SpiritualCorrelations } from './spiritual-correlations';

export interface SpiritualStats {
  byType?: Record<string, number>;
  bySefirot: Record<string, number>;
  byChakra: Record<string, number>;
  byElement: Record<string, number>;
  byOrixa: Record<string, number>;
}

export interface HasSpiritualCorrelations {
  tipo?: string;
  type?: string;
  metricType?: string;
  spiritualCorrelations?: SpiritualCorrelations | null;
}

/**
 * Calculate spiritual statistics from a list of items with spiritual correlations.
 * This is the shared implementation extracted from multiple API routes.
 *
 * @param items - Array of items with optional spiritual correlations
 * @returns SpiritualStats object with counts by type, sefirot, chakra, element, orixa
 */
// fallow-ignore-next-line unused-export
export function calculateSpiritualStats<T extends HasSpiritualCorrelations>(
  items: T[],
  options: {
    /** Include byType breakdown (default: true) */
    includeType?: boolean;
    /** Key name for type field (default: 'tipo') */
    typeKey?: 'tipo' | 'type' | 'metricType';
  } = {}
): SpiritualStats {
  const { includeType = true, typeKey = 'tipo' } = options;

  const stats: SpiritualStats = {
    bySefirot: {},
    byChakra: {},
    byElement: {},
    byOrixa: {},
  };

  if (includeType) {
    stats.byType = {};
  }

  for (const item of items) {
    // Count by type
    if (includeType && stats.byType) {
      const typeValue = item[typeKey] || item.tipo || item.type || item.metricType || 'unknown';
      stats.byType[typeValue] = (stats.byType[typeValue] || 0) + 1;
    }

    // Count by spiritual correlations
    const corr = item.spiritualCorrelations;
    if (!corr) continue;

    // Sefirot
    if (corr.sefirot && Array.isArray(corr.sefirot)) {
      for (const s of corr.sefirot) {
        stats.bySefirot[s] = (stats.bySefirot[s] || 0) + 1;
      }
    }

    // Chakra
    if (corr.chakra != null) {
      const key = String(corr.chakra);
      stats.byChakra[key] = (stats.byChakra[key] || 0) + 1;
    }

    // Element
    if (corr.element) {
      stats.byElement[corr.element] = (stats.byElement[corr.element] || 0) + 1;
    }

    // Orixa
    if (corr.orixa) {
      stats.byOrixa[corr.orixa] = (stats.byOrixa[corr.orixa] || 0) + 1;
    }
  }

  return stats;
}

/**
 * Calculate spiritual stats from raw entries with inline spiritualCorrelations.
 * Use this when items have spiritual correlations embedded directly.
 */
export function calculateSpiritualStatsInline<T extends { spiritualCorrelations?: SpiritualCorrelations | null; tipo?: string }>(
  items: T[]
): SpiritualStats {
  return calculateSpiritualStats(items, { includeType: true });
}
