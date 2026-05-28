// Dosha practice

export interface DoshaPracticeConfig {
  userId?: string;
  duration?: number; // seconds
  doshaType?: 'vata' | 'pitta' | 'kapha' | 'tridosha';
  technique?: 'breathing' | 'nutrition' | 'movement' | 'meditation' | 'herbs' | 'lifestyle';
  intensity?: number; // 1-10 scale
  timestamp?: number;
}

export interface DoshaPracticeResult {
  practiceId: string;
  completed: boolean;
  doshaLevel: number; // 0-100
  balanceScore: number; // -100 to 100
  primaryDosha: 'vata' | 'pitta' | 'kapha';
  activatedChannels: string[];
  desbloqueios: string[];
  state: 'imbalanced' | 'balanced' | 'harmonized' | 'enlightened';
}

const desbloqueioPool = [
  'Vata é o princípio do movimento que governa toda comunicação no corpo.',
  'Pitta é o fogo digestivo que transforma tudo o que tocamos.',
  'Kapha é a estrutura que sustenta e protege o corpo e mente.',
  'O equilíbrio dos doshas é a base da saúde em Ayurveda.',
  'Cada respiração pode harmonizar os três doshas.',
  'A primavera desperta kapha, o verão ativa pitta, o outono move vata.',
  'Quando vata está equilibrado, a mente é clara e creativa.',
  'Pitta equilibrado traz inteligência, compreensão e coragem.',
  'Kapha equilibrado traz força, estabilidade e compaixão.',
  'A prática diária mantém os doshas em harmonia.',
  'O corpo é um microcosmo refletindo os elementos do universo.',
  'A digestão forte é o pilar de todos os tratamentos ayurvédicos.',
  'O Agni (fogo digestivo) é a chave para a saúde doshasica.',
  'Ritucharya (regime seasonal) é essencial para o equilíbrio.',
  'Dinacharya (rotina diária) mantém os doshas harmonizados.',
];

export async function performPractice(config: DoshaPracticeConfig = {}): Promise<DoshaPracticeResult> {
  const {
    userId = 'anon',
    duration = 30,
    doshaType = 'tridosha',
    technique = 'meditation',
    intensity = 5,
    timestamp = Date.now(),
  } = config;

  // Generate practice ID
  const practiceId = `dosha-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Dosha type multipliers for energy calculation
  const typeMultiplier: Record<string, number> = {
    vata: 1.2,
    pitta: 1.1,
    kapha: 0.9,
    tridosha: 1.0,
  };

  // Technique efficiency
  const techniqueEfficiency: Record<string, number> = {
    breathing: 1.2,
    nutrition: 1.1,
    movement: 1.0,
    meditation: 1.3,
    herbs: 0.9,
    lifestyle: 1.0,
  };

  const multiplier = (typeMultiplier[doshaType] || 1.0) * (techniqueEfficiency[technique] || 1.0);
  const intensityFactor = intensity / 10;

  // Calculate dosha level
  const doshaLevel = Math.min(100, Math.floor(((duration / 60 * 75 + Math.random() * 25) * multiplier * (0.5 + intensityFactor * 0.5))));

  // Balance score based on dosha type
  const balanceScoreMap: Record<string, number> = {
    vata: 15,
    pitta: 20,
    kapha: 10,
    tridosha: 25,
  };
  const balanceScore = Math.min(100, Math.floor((balanceScoreMap[doshaType] || 50) * intensityFactor));

  // Determine primary dosha
  const doshas: Array<'vata' | 'pitta' | 'kapha'> = ['vata', 'pitta', 'kapha'];
  const primaryDosha = doshas[Math.floor(Math.random() * doshas.length)];

  // Determine activated channels
  const channelMapping: Record<string, string[]> = {
    vata: ['prana', 'udana', 'vyana'],
    pitta: ['samana', 'agni'],
    kapha: ['apana', 'kapha'],
    tridosha: ['prana', 'samana', 'apana', 'udana', 'vyana'],
  };
  const activatedChannels = channelMapping[doshaType] || ['prana', 'samana', 'apana'];

  // Determine state based on dosha level
  let state: DoshaPracticeResult['state'] = 'imbalanced';
  if (doshaLevel >= 85) {
    state = 'enlightened';
  } else if (doshaLevel >= 70) {
    state = 'harmonized';
  } else if (doshaLevel >= 50) {
    state = 'balanced';
  } else if (duration > 0) {
    state = 'imbalanced';
  }

  // Select desbloqueios
  const desbloqueioCount = Math.min(5, Math.floor(doshaLevel / 20) + 1);
  const desbloqueios = desbloqueioPool
    .sort(() => Math.random() - 0.5)
    .slice(0, desbloqueioCount);

  // Remove duplicates
  const uniqueDesbloqueios: string[] = [];
  for (const desbloqueio of desbloqueios) {
    if (!uniqueDesbloqueios.includes(desbloqueio)) {
      uniqueDesbloqueios.push(desbloqueio);
    }
  }

  return {
    practiceId,
    completed: duration > 0,
    doshaLevel,
    balanceScore,
    primaryDosha,
    activatedChannels,
    desbloqueios: uniqueDesbloqueios,
    state,
  };
}