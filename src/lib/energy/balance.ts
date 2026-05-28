/**
 * Energy balance calculation and tracking utilities.
 */

export interface EnergyReading {
  timestamp: number;
  physical?: number;
  emotional?: number;
  mental?: number;
  spiritual?: number;
}

export interface EnergyBalance {
  physical: number;
  emotional: number;
  mental: number;
  spiritual: number;
}

export interface BalanceResult {
  total: number;
  average: number;
  distribution: 'harmonious' | 'focused' | 'scattered' | 'dormant';
  dominantEnergy: keyof EnergyBalance | null;
  weakestEnergy: keyof EnergyBalance | null;
  recommendation: string;
}

const DEFAULT_ENERGY: EnergyBalance = {
  physical: 0,
  emotional: 0,
  mental: 0,
  spiritual: 0,
};

const DISTRIBUTION_THRESHOLD = 15;

function normalize(values: Partial<EnergyBalance>): EnergyBalance {
  return { ...DEFAULT_ENERGY, ...values };
}

function detectDistribution(energy: EnergyBalance): BalanceResult['distribution'] {
  const values = Object.values(energy);
  const total = values.reduce((sum, v) => sum + v, 0);
  
  if (total === 0) return 'dormant';
  
  const variance = values.reduce((sum, v) => sum + Math.pow(v - total / values.length, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const mean = total / values.length;
  
  if (mean < 20) return 'dormant';
  if (stdDev < DISTRIBUTION_THRESHOLD) return 'harmonious';
  
  const activeCount = values.filter(v => v > mean * 0.5).length;
  if (activeCount === 1) return 'focused';
  return 'scattered';
}

function findDominant(energy: EnergyBalance): keyof EnergyBalance | null {
  let max = -Infinity;
  let dominant: keyof EnergyBalance | null = null;
  
  for (const [key, value] of Object.entries(energy)) {
    if (value > max) {
      max = value;
      dominant = key as keyof EnergyBalance;
    }
  }
  
  return max > 0 ? dominant : null;
}

function findWeakest(energy: EnergyBalance): keyof EnergyBalance | null {
  const activeEntries = Object.entries(energy).filter(([, v]) => v > 0);
  if (activeEntries.length === 0) return null;
  
  let min = Infinity;
  let weakest: keyof EnergyBalance | null = null;
  
  for (const [key, value] of activeEntries) {
    if (value < min) {
      min = value;
      weakest = key as keyof EnergyBalance;
    }
  }
  
  return weakest;
}

function generateRecommendation(distribution: BalanceResult['distribution'], dominant: keyof EnergyBalance | null, weakest: keyof EnergyBalance | null): string {
  const recommendations: Record<string, string> = {
    harmonious: 'Your energy is well-balanced. Maintain this harmony through regular self-care practices.',
    focused: `Your ${dominant} energy is dominant. Consider activities that engage your weaker energy centers.`,
    scattered: 'Your energy is scattered across multiple areas. Grounding practices can help center your focus.',
    dormant: 'Your energy levels are low across all areas. Prioritize rest and gentle restoration.',
  };
  
  return recommendations[distribution];
}

/**
 * Calculate balance from current energy levels
 */
export function calculateBalance(energy: Partial<EnergyBalance>): BalanceResult {
  const normalized = normalize(energy);
  const values = Object.values(normalized);
  const total = values.reduce((sum, v) => sum + v, 0);
  const average = total / values.length;
  
  const distribution = detectDistribution(normalized);
  const dominantEnergy = findDominant(normalized);
  const weakestEnergy = findWeakest(normalized);
  const recommendation = generateRecommendation(distribution, dominantEnergy, weakestEnergy);
  
  return {
    total: Math.round(total * 100) / 100,
    average: Math.round(average * 100) / 100,
    distribution,
    dominantEnergy,
    weakestEnergy,
    recommendation,
  };
}

/**
 * Track energy over time for balance analysis
 */
export class EnergyTracker {
  private readings: EnergyReading[] = [];
  
  addReading(reading: EnergyReading): void {
    this.readings.push({
      ...reading,
      timestamp: reading.timestamp || Date.now(),
    });
  }
  
  getReadings(limit?: number): EnergyReading[] {
    if (limit) {
      return this.readings.slice(-limit);
    }
    return [...this.readings];
  }
  
  getLatest(): EnergyReading | null {
    return this.readings[this.readings.length - 1] || null;
  }
  
  clear(): void {
    this.readings = [];
  }
  
  analyze(limit?: number): BalanceResult {
    const readings = limit ? this.getReadings(limit) : this.readings;
    if (readings.length === 0) {
      return calculateBalance({});
    }
    
    const latest = readings[readings.length - 1];
    return calculateBalance({
      physical: latest.physical,
      emotional: latest.emotional,
      mental: latest.mental,
      spiritual: latest.spiritual,
    });
  }
  
  getAverage(limit?: number): EnergyBalance {
    const readings = limit ? this.readings.slice(-limit) : this.readings;
    if (readings.length === 0) {
      return { ...DEFAULT_ENERGY };
    }
    
    const totals = { ...DEFAULT_ENERGY };
    for (const reading of readings) {
      if (reading.physical !== undefined) totals.physical += reading.physical;
      if (reading.emotional !== undefined) totals.emotional += reading.emotional;
      if (reading.mental !== undefined) totals.mental += reading.mental;
      if (reading.spiritual !== undefined) totals.spiritual += reading.spiritual;
    }
    
    return {
      physical: totals.physical / readings.length,
      emotional: totals.emotional / readings.length,
      mental: totals.mental / readings.length,
      spiritual: totals.spiritual / readings.length,
    };
  }
}