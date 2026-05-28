// Prana practice

export interface PranaPracticeConfig {
  userId?: string;
  duration?: number; // seconds
  pranaType?: 'prana' | 'apana' | 'samana' | 'udana' | 'vyana';
  technique?: 'breathing' | 'visualization' | 'chanting' | 'movement';
  intensity?: number; // 1-10 scale
  timestamp?: number;
}

export interface PranaPracticeResult {
  practiceId: string;
  completed: boolean;
  pranaLevel: number; // 0-100
  energyBalance: number;
  activatedChannels: string[];
  desbloqueios: string[];
  state: 'dormant' | 'awakening' | 'active' | 'balanced';
}

const desbloqueioPool = [
  'O prana é a energia vital que permeia todo o universo.',
  'A respiração consciente é a ponte entre o corpo e o espírito.',
  'Prana sobe, apana desce, samana equilibra.',
  'Vyana circula por todo o corpo, conectando cada célula.',
  'Udana eleva a consciência para reinos superiores.',
  'A prática regular intensifica o fluxo de energia vital.',
  'O corpo é um templo de energia em constante movimento.',
  'Cada respiração carrega potencial de cura e transformação.',
  'A mente tranquila permite que o prana flua sem obstáculos.',
  'O alinhamento do corpo, respiração e mente desperta o prana.',
];

export async function performPractice(config: PranaPracticeConfig = {}): Promise<PranaPracticeResult> {
  const { userId = 'anon', duration = 30, pranaType = 'prana', technique = 'breathing', intensity = 5, timestamp = Date.now() } = config;

  // Generate practice ID
  const practiceId = `prana-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Prana type multipliers for energy calculation
  const typeMultiplier: Record<string, number> = {
    prana: 1.3,
    apana: 1.2,
    samana: 1.1,
    udana: 1.4,
    vyana: 1.5,
  };

  // Technique efficiency
  const techniqueEfficiency: Record<string, number> = {
    breathing: 1.2,
    visualization: 1.1,
    chanting: 1.0,
    movement: 0.9,
  };

  const multiplier = (typeMultiplier[pranaType] || 1.0) * (techniqueEfficiency[technique] || 1.0);
  const intensityFactor = intensity / 10;
  
  // Calculate prana level
  const pranaLevel = Math.min(100, Math.floor(((duration / 60 * 80 + Math.random() * 20) * multiplier * (0.5 + intensityFactor * 0.5))));

  // Energy balance based on prana type
  const energyBalanceMap: Record<string, number> = {
    prana: 85,
    apana: 80,
    samana: 90,
    udana: 75,
    vyana: 95,
  };
  const energyBalance = energyBalanceMap[pranaType] || 70;

  // Determine activated channels
  const channelMapping: Record<string, string[]> = {
    prana: ['sushumna', 'ida', 'pingala'],
    apana: ['sushumna', 'ganga'],
    samana: ['sushumna', 'saravati'],
    udana: ['sushumna', 'ida', 'ganga'],
    vyana: ['ida', 'pingala', 'sushumna', 'ganga', 'saravati'],
  };
  const activatedChannels = channelMapping[pranaType] || ['sushumna'];

  // Determine state based on prana level
  let state: PranaPracticeResult['state'] = 'dormant';
  if (pranaLevel >= 85) {
    state = 'balanced';
  } else if (pranaLevel >= 65) {
    state = 'active';
  } else if (pranaLevel >= 35) {
    state = 'awakening';
  } else if (duration > 0) {
    state = 'dormant';
  }

  // Select desbloqueios
  const desbloqueioCount = Math.min(4, Math.floor(pranaLevel / 25) + 1);
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
    completed: true,
    pranaLevel,
    energyBalance,
    activatedChannels,
    desbloqueios: uniqueDesbloqueios,
    state,
  };
}