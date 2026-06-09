// Cross-system correlation engine

import type { Correlation, MentorContext } from './types';
import { findCorrelations } from './maps';

export interface CorrelationResult {
  primary: string;
  system: string;
  correlations: Correlation[];
}

export async function correlateAll(context: MentorContext): Promise<CorrelationResult[]> {
  const results: CorrelationResult[] = [];
  
  // Placeholder: correlate based on birth data
  if (context.birthData) {
    // Cabala correlation
    results.push({
      primary: 'life-path',
      system: 'cabala',
      correlations: findCorrelations('life-path', 'cabala'),
    });
    
    // Astrology correlation
    results.push({
      primary: 'sun-sign',
      system: 'astrology',
      correlations: findCorrelations('sun-sign', 'astrology'),
    });
    
    // Odus correlation
    results.push({
      primary: 'birth-odu',
      system: 'odus',
      correlations: findCorrelations('birth-odu', 'odus'),
    });
  }
  
  return results;
}

export function findCommonThemes(correlations: Correlation[]): string[] {
  // Find themes that appear across multiple systems
  const themes = new Map<string, number>();
  
  for (const corr of correlations) {
    // Extract theme from reference (placeholder logic)
    const theme = corr.reference.split('-')[0];
    themes.set(theme, (themes.get(theme) || 0) + 1);
  }
  
  return Array.from(themes.entries())
    .filter(([, count]) => count > 1)
    .map(([theme]) => theme);
}
