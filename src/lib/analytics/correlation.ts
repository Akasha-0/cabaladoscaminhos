// fallow-ignore-file unused-file
// Correlation matrix generator for spiritual systems
// Calculates correlations between Cabala, Orixás, Odús, Tarot, Numerologia, Lua, etc.

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong';
}

export interface HeatmapData {
  labels: string[];
  matrix: number[][];
  cells: HeatmapCell[];
}

// Spiritual system categories
const SPIRITUAL_SYSTEMS = [
  'Cabala',
  'Orixás',
  'Odús',
  'Tarot',
  'Numerologia',
  'Lua',
  'Chakras',
  'Dias da Semana',
  'Elementos',
  'Geometria Sagrada',
] as const;

type SpiritualSystem = typeof SPIRITUAL_SYSTEMS[number];

// Numerical values for spiritual attributes
const systemValues: Record<SpiritualSystem, number[]> = {
  Cabala: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22],
  Orixás: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  Odús: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  Tarot: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  Numerologia: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  Lua: [1, 2, 3, 4, 5, 6, 7, 8],
  Chakras: [1, 2, 3, 4, 5, 6, 7],
  'Dias da Semana': [1, 2, 3, 4, 5, 6, 7],
  Elementos: [1, 2, 3, 4, 5],
  'Geometria Sagrada': [1, 2, 3, 4, 5, 6, 7],
};

// Correlation calculation (Pearson-like for spiritual systems)
function calculateCorrelation(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  const aNorm = a.map((v) => v / Math.max(...a));
  const bNorm = b.map((v, i) => b[i % b.length] / Math.max(...b));
  
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += Math.abs(aNorm[i % aNorm.length] - bNorm[i % bNorm.length]);
  }
  
  // Convert distance to correlation (0 distance = 1 correlation)
  const avgDist = sum / len;
  return Math.max(0, 1 - avgDist);
}

/**
 * Calculate correlation matrix between all spiritual systems
 * @returns Heatmap data with labels, matrix, and cells
 */
// fallow-ignore-next-line complexity
export function calculateCorrelations(): HeatmapData {
  const systems = SPIRITUAL_SYSTEMS as unknown as SpiritualSystem[];
  const labels = [...systems];
  
  // Build correlation matrix
  const matrix: number[][] = [];
  const cells: HeatmapCell[] = [];
  
  for (let i = 0; i < systems.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < systems.length; j++) {
      let corr: number;
      if (i === j) {
        // Perfect correlation with self
        corr = 1;
      } else {
        // Calculate correlation based on shared attributes
        const aVals = systemValues[systems[i]];
        const bVals = systemValues[systems[j]];
        corr = calculateCorrelation(aVals, bVals);
      }
      row.push(corr);
      
      // Add cell for heatmap
      const absCorr = Math.abs(corr);
      let strength: HeatmapCell['strength'];
      if (absCorr >= 0.8) strength = 'very-strong';
      else if (absCorr >= 0.6) strength = 'strong';
      else if (absCorr >= 0.4) strength = 'moderate';
      else strength = 'weak';
      
      cells.push({
        x: labels[j],
        y: labels[i],
        value: corr,
        strength,
      });
    }
    matrix.push(row);
  }
  
  return { labels, matrix, cells };
}

// Export for direct usage
export const correlationMatrix = calculateCorrelations();