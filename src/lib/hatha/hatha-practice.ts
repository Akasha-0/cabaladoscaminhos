/**
 * Hatha practice — unified body-breath-mind preparation for higher yoga.
 */

export interface HathaPracticeConfig {
  userId?: string;
  duration?: number; // seconds
  hathaType?: 'asana' | 'pranayama' | 'shatkriya' | 'maha-hatha';
  technique?: 'surya-namaskar' | 'asanas' | 'nadi-shodhana' | 'kapalabhati' | 'bhastrika' | 'full-sequence';
  intensity?: number; // 1-10 scale
  timestamp?: number;
}

export interface HathaPracticeResult {
  practiceId: string;
  completed: boolean;
  hathaLevel: number; // 0-100
  purificationDepth: number;
  energyCentersActivated: string[];
  insights: string[];
  state: 'grounding' | 'heating' | 'purifying' | 'balancing';
}

const insightPool = [
  'Hatha é a ponte entre o corpo e o espíritu — o corpo preparado é o veículo da liberation.',
  'Cada ásana é uma oração feita com o corpo; a forma perfeita emerge da prática constante.',
  'Ha é sol (ha), Tha é lua (tha) — Hatha yoga harmoniza os opostos dentro de nós.',
  'A respiração é o fio que conecta mente, corpo e prana — consciente, transforma.',
  'Shatkriyas purificam os canais para que a energia flua sem obstáculo.',
  'Kapalabhati abre os portões da percepção — a claridade mental é seu fruto.',
  'Nadi Shodhana equilibra os canais sutis para que a kundalini ascenda com segurança.',
  'O corpo é o templo; a prática diária é o ritual de devoção.',
  'Na medida em que o corpo se torna flexível, a mente também se liberta.',
  'Hatha não é um fim — é a preparação para o Raja yoga da meditação profunda.',
  'O esforço correto (sthira) combined com receptividade (sukha) é a chave de toda prática.',
  'Surya Namaskar é um microcosmo do caminho inteiro de yoga em doze movimentos.',
];

export async function performPractice(config: HathaPracticeConfig = {}): Promise<HathaPracticeResult> {
  const { userId = 'anon', duration = 45, hathaType = 'maha-hatha', technique = 'full-sequence', intensity = 5, timestamp = Date.now() } = config;

  const practiceId = `hatha-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  const typeMultiplier: Record<string, number> = {
    'asana': 0.9,
    'pranayama': 1.0,
    'shatkriya': 1.2,
    'maha-hatha': 1.1,
  };

  const techniqueEfficiency: Record<string, number> = {
    'surya-namaskar': 1.1,
    'asanas': 1.0,
    'nadi-shodhana': 1.15,
    'kapalabhati': 1.05,
    'bhastrika': 1.2,
    'full-sequence': 1.25,
  };

  const multiplier = (typeMultiplier[hathaType] || 1.0) * (techniqueEfficiency[technique] || 1.0);
  const intensityFactor = intensity / 10;

  const hathaLevel = Math.min(100, Math.floor(((duration / 60 * 70 + Math.random() * 30) * multiplier * (0.4 + intensityFactor * 0.6))));

  const purificationDepthMap: Record<string, number> = {
    'asana': 55,
    'pranayama': 70,
    'shatkriya': 90,
    'maha-hatha': 80,
  };
  const purificationDepth = Math.min(100, Math.floor((purificationDepthMap[hathaType] || 60) * multiplier * intensityFactor));

  const centerMapping: Record<string, string[]> = {
    'asana': ['muladhara', 'svadhisthana', 'manipura'],
    'pranayama': ['anahata', 'vishuddha', 'ajna'],
    'shatkriya': ['manipura', 'vishuddha', 'ajna'],
    'maha-hatha': ['muladhara', 'svadhisthana', 'manipura', 'anahata', 'vishuddha', 'ajna'],
  };
  const energyCentersActivated = centerMapping[hathaType] || centerMapping['maha-hatha'];

  let state: HathaPracticeResult['state'] = 'grounding';
  if (hathaLevel >= 85) {
    state = 'balancing';
  } else if (hathaLevel >= 65) {
    state = 'purifying';
  } else if (hathaLevel >= 35) {
    state = 'heating';
  } else if (duration > 0) {
    state = 'grounding';
  }

  const insightCount = Math.min(4, Math.floor(hathaLevel / 25) + 1);
  const insights = insightPool
    .sort(() => Math.random() - 0.5)
    .slice(0, insightCount);

  const uniqueInsights: string[] = [];
  for (const insight of insights) {
    if (!uniqueInsights.includes(insight)) {
      uniqueInsights.push(insight);
    }
  }

  return {
    practiceId,
    completed: duration > 0,
    hathaLevel,
    purificationDepth,
    energyCentersActivated,
    insights: uniqueInsights,
    state,
  };
}