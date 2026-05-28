/**
 * Energy balance calculation and chakra alignment utilities.
 */

export interface ChakraEnergy {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
}

export interface BalanceResult {
  totalEnergy: number;
  averageEnergy: number;
  alignment: 'balanced' | 'grounded' | 'elevated' | 'disrupted';
  dominantChakra: keyof ChakraEnergy;
  recommendation: string;
}

export function calculateBalance(energy: Partial<ChakraEnergy>): BalanceResult {
  const defaultEnergy: ChakraEnergy = {
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    thirdEye: 0,
    crown: 0,
  };

  const merged = { ...defaultEnergy, ...energy };
  const values = Object.values(merged);
  const totalEnergy = values.reduce((sum, v) => sum + v, 0);
  const averageEnergy = totalEnergy / values.length;

  let dominantChakra: keyof ChakraEnergy = 'root';
  let maxValue = -Infinity;
  for (const [key, value] of Object.entries(merged)) {
    if (value > maxValue) {
      maxValue = value;
      dominantChakra = key as keyof ChakraEnergy;
    }
  }

  let alignment: BalanceResult['alignment'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range <= 10) {
    alignment = 'balanced';
  } else if (merged.root > merged.crown) {
    alignment = 'grounded';
  } else if (merged.crown > merged.root) {
    alignment = 'elevated';
  } else {
    alignment = 'disrupted';
  }

  const recommendations: Record<string, string> = {
    balanced: 'Maintain current energy distribution through regular meditation and mindfulness practices.',
    grounded: 'Consider opening higher chakras through spiritual practices while honoring your strong foundation.',
    elevated: 'Balance your spiritual awareness with physical grounding through nature and body awareness.',
    disrupted: 'Focus on chakra alignment exercises and energy grounding techniques to restore harmony.',
  };

  return {
    totalEnergy,
    averageEnergy: Math.round(averageEnergy * 100) / 100,
    alignment,
    dominantChakra,
    recommendation: recommendations[alignment],
  };
}

export function alignChakras(energy: Partial<ChakraEnergy>): ChakraEnergy {
  const result = calculateBalance(energy);
  const target = result.averageEnergy;

  const aligned: ChakraEnergy = {
    root: target,
    sacral: target,
    solarPlexus: target,
    heart: target,
    throat: target,
    thirdEye: target,
    crown: target,
  };

  return aligned;
}
