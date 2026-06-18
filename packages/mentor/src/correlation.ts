// Correlation wrapper for DeepCorrelationEngine
import { DeepCorrelationEngine } from '@/lib/application/ai/deep-correlation-engine';
import type { UserSpiritualData } from '@/lib/application/ai/types';
import type { UserMaps, CorrelationResult } from './types';

export interface CorrelationOptions {
  maxCorrelations?: number;
  includeInsights?: boolean;
}

/**
 * Convert UserMaps to UserSpiritualData for DeepCorrelationEngine
 */
function mapsToSpiritualData(maps: UserMaps): UserSpiritualData {
  return {
    id: 'mentor-user',
    nome: maps.cabala?.dominantSefira || 'User',
    dataNascimento: '',
    numeroPessoal: maps.cabala?.lifePath || maps.cabala?.sefirot?.length || 0,
    arcoPessoal: 0,
    odu: maps.odus?.odu || maps.odus?.primary || '',
    orixaRegente: '',
    sefirotDominante: maps.cabala?.sefirot || [],
    arcoMaior: [],
    sign: maps.astrology?.sign || '',
    houses: maps.astrology?.houses || {},
    rashi: maps.astrology?.rashi || '',
  };
}

/**
 * Get correlations using DeepCorrelationEngine
 */
export async function getCorrelations(
  maps: UserMaps,
  _question: string,
  options: CorrelationOptions = {}
): Promise<CorrelationResult[]> {
  const engine = new DeepCorrelationEngine();
  const data = mapsToSpiritualData(maps);
  const results: CorrelationResult[] = [];

  // Get all system correlations
  const systemCorrelations = engine.getAllSystemCorrelations(data);

  for (const corr of systemCorrelations) {
    results.push({
      primary: `${corr.source}:${corr.target}`,
      secondary: corr.correlationType,
      insight: corr.explanation,
    });
  }

  // Get cross-system patterns
  const patterns = engine.findCrossSystemPatterns(data);

  for (const pattern of patterns) {
    results.push({
      primary: pattern.name,
      secondary: pattern.involved_systems.join(', '),
      insight: pattern.description,
    });
  }

  // Limit results
  const limit = options.maxCorrelations ?? 5;
  return results.slice(0, limit);
}

/**
 * Format correlations for display
 */
export function formatCorrelations(correlations: CorrelationResult[]): string {
  if (correlations.length === 0) {
    return 'Nenhuma correlação significativa encontrada.';
  }

  return correlations
    .map((c, i) => `${i + 1}. ${c.primary} ↔ ${c.secondary}\n   💡 ${c.insight}`)
    .join('\n\n');
}

/**
 * Convert correlations to context string for AI prompts
 */
export function correlationsToContext(correlations: CorrelationResult[]): string {
  return correlations.map((c) => `${c.primary} e ${c.secondary}: ${c.insight}`).join(' | ');
}
