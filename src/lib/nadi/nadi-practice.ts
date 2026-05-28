// Nadi practice

export interface NadiPracticeParams {
  userId?: string;
  duration?: number; // seconds
  nadiType?: 'vatha' | 'pittha' | 'kapha' | 'sattva';
  timestamp?: number;
}

export interface NadiPracticeResult {
  practiceId: string;
  completed: boolean;
  nadiLevel: number; // 0-100
  energyFlow: number;
  desbloqueios: string[];
  state: 'dormant' | 'awakening' | 'active' | 'balanced';
}

const desbloqueioPool = [
  'Os nadis são canais de prana que conectam corpo e consciência.',
  'A respiração é a ponte entre o físico e o sutil.',
  'Vatha move, Pittha transforma, Kapha estabiliza.',
  'Sattva é o estado de clareza e harmonia natural.',
  'A energia flui onde a intenção a guia.',
  'Libere os bloqueios emocionais para que a energia flua livremente.',
  'Cada respiração carrega potencial de cura e transformação.',
  'O corpo astral reflete o estado dos nadis físicos.',
  'A prática regular mantém os canais abertos e limpos.',
  'A consciência pode direcionar o prana para qualquer parte do corpo.',
];

export async function performPractice(params: NadiPracticeParams = {}): Promise<NadiPracticeResult> {
  const { userId = 'anon', duration = 30, nadiType = 'vatha', timestamp = Date.now() } = params;

  // Generate practice ID
  const practiceId = `nadi-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Duration-based nadi level
  const typeMultiplier: Record<string, number> = {
    vatha: 1.3,
    pittha: 1.2,
    kapha: 1.1,
    sattva: 1.4,
  };
  const multiplier = typeMultiplier[nadiType] || 1.0;
  const nadiLevel = Math.min(100, Math.floor((duration / 60 * 80 + Math.random() * 20) * multiplier));

  // Energy flow based on nadi type
  const energyFlowMap: Record<string, number> = {
    vatha: 85,
    pittha: 75,
    kapha: 65,
    sattva: 90,
  };
  const energyFlow = energyFlowMap[nadiType] || 70;

  // Determine state based on nadi level
  let state: NadiPracticeResult['state'] = 'dormant';
  if (nadiLevel >= 85) {
    state = 'balanced';
  } else if (nadiLevel >= 65) {
    state = 'active';
  } else if (nadiLevel >= 35) {
    state = 'awakening';
  } else if (duration > 0) {
    state = 'dormant';
  }

  // Select desbloqueios
  const desbloqueioCount = Math.min(4, Math.floor(nadiLevel / 25) + 1);
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
    nadiLevel,
    energyFlow,
    desbloqueios: uniqueDesbloqueios,
    state,
  };
}
