// Kundalini-v2 practice

export interface KundaliniV2PracticeConfig {
  intensity?: number; // 1-10 scale
  duration?: number; // minutes
  chakra?: string; // root, sacral, solar, heart, throat, thirdEye, crown
  breathingPattern?: 'rapid' | 'medium' | 'slow';
}

export interface KundaliniV2PracticeResult {
  completed: boolean;
  energyLevel: number; // 0-100
  activatedChakras: string[];
  serpentPath: number; // how far kundalini ascended (1-7)
  insights: string[];
}

const CHAKRA_SEQUENCE = ['root', 'sacral', 'solar', 'heart', 'throat', 'thirdEye', 'crown'];

export async function performPractice(config: KundaliniV2PracticeConfig = {}): Promise<KundaliniV2PracticeResult> {
  const { intensity = 5, duration = 30, chakra, breathingPattern = 'medium' } = config;

  const breathingMultiplier = {
    rapid: 1.5,
    medium: 1.0,
    slow: 0.7,
  }[breathingPattern];

  const baseEnergy = Math.min(100, Math.max(0, intensity * 10 * breathingMultiplier));

  // Calculate serpent path based on intensity and duration
  const intensityFactor = intensity / 10;
  const durationFactor = Math.min(1, duration / 60);
  const serpentPath = Math.ceil((intensityFactor * 0.4 + durationFactor * 0.6) * 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // Determine activated chakras
  const targetIndex = chakra ? CHAKRA_SEQUENCE.indexOf(chakra) : serpentPath;
  const activatedChakras = CHAKRA_SEQUENCE.slice(0, Math.max(1, targetIndex + 1));

  return {
    completed: true,
    energyLevel: Math.round(baseEnergy),
    activatedChakras,
    serpentPath,
    insights: generateInsights(serpentPath, activatedChakras),
  };
}

function generateInsights(path: number, chakras: string[]): string[] {
  const insights: string[] = [];

  if (path >= 3) {
    insights.push('The breath ignites the fire at the base of the spine');
  }
  if (path >= 5) {
    insights.push('Prana flows through the central channel with increasing clarity');
  }
  if (path >= 7) {
    insights.push('The serpent rises toward the thousand-petaled lotus');
  }

  const chakraInsight: Record<string, string> = {
    root: 'Muladhara grounds the awakening energy',
    sacral: 'Svadhisthana creativity stirs with serpentine grace',
    solar: 'Manipura willpower anchors the rising kundalini',
    heart: 'Anahata compassion opens the heart center',
    throat: 'Vishuddha truth flows through the gateway of voice',
    thirdEye: 'Ajna intuition pierces the veil of illusion',
    crown: 'Sahasrara unites with infinite consciousness',
  };

  chakras.forEach((c) => {
    if (chakraInsight[c]) insights.push(chakraInsight[c]);
  });

  return insights;
}