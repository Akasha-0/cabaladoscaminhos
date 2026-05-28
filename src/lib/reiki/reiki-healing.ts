export interface ReikiSession {
  id: string;
  clientName?: string;
  practitioner?: string;
  startedAt: Date;
  completedAt?: Date;
  techniques: string[];
  chakras: string[];
  symbols: string[];
  notes?: string;
}

export interface HealingResult {
  success: boolean;
  session: ReikiSession;
  message: string;
  energyLevel: number;
  balanceAchieved: boolean;
}

export type ReikiSymbol = 'cho-ku-rei' | 'sei-hei-ki' | 'hon-sha-zen-sho-tel' | 'DAI-KO-MYO' | 'Raku';

export type HealingTechnique =
  | 'hand-placement'
  | 'center-line'
  | 'chakra-balancing'
  | 'distant-healing'
  | 'full-body';

const REIKI_SYMBOLS: Record<ReikiSymbol, { name: string; meaning: string; pt: string }> = {
  'cho-ku-rei': {
    name: 'Chō Ku Rei',
    meaning: 'Power symbol - amplifies energy',
    pt: 'Símbolo do Poder - amplifica a energia',
  },
  'sei-hei-ki': {
    name: 'Sei He Ki',
    meaning: 'Harmony symbol - emotional healing',
    pt: 'Símbolo da Harmonia - cura emocional',
  },
  'hon-sha-zen-sho-tel': {
    name: 'Hon Sha Ze Sho Nen',
    meaning: 'Distance symbol - connects across time and space',
    pt: 'Símbolo da Distância - conecta através do tempo e espaço',
  },
  'DAI-KO-MYO': {
    name: 'Dai Ko Myo',
    meaning: 'Master symbol - enlightenment and rapid healing',
    pt: 'Símbolo do Mestre - iluminação e cura rápida',
  },
  'Raku': {
    name: 'Raku',
    meaning: 'Fire symbol - grounds and activates kundalini',
    pt: 'Símbolo do Fogo - ancora e ativa a kundalini',
  },
};

const [...CHAKRAS] = [
  'coroa',
  'terceiro-olho',
  'garganta',
  'coracao',
  'solar',
  'sacro',
  'raiz',
] as const;

const TECHNIQUE_MAP: Record<HealingTechnique, string[]> = {
  'hand-placement': ['coracao', 'solar', 'sacro'],
  'center-line': [...CHAKRAS],
  'chakra-balancing': [...CHAKRAS],
  'distant-healing': ['coroa', 'terceiro-olho'],
  'full-body': [...CHAKRAS],
};

let sessionCounter = 0;

export function performHealing(params?: {
  clientName?: string;
  practitioner?: string;
  technique?: HealingTechnique;
  symbols?: ReikiSymbol[];
  notes?: string;
}): HealingResult {
  const sessionId = `reiki-${Date.now()}-${++sessionCounter}`;

  const technique = params?.technique ?? 'full-body';
  const symbols = params?.symbols ?? ['cho-ku-rei', 'sei-hei-ki'];
  const chakras = TECHNIQUE_MAP[technique];

  const session: ReikiSession = {
    id: sessionId,
    clientName: params?.clientName,
    practitioner: params?.practitioner,
    startedAt: new Date(),
    techniques: [technique],
    chakras: [...chakras],
    symbols: [...symbols],
    notes: params?.notes,
  };

  const symbolDescriptions = symbols
    .map((s) => REIKI_SYMBOLS[s]?.name ?? s)
    .join(', ');

  const result: HealingResult = {
    success: true,
    session,
    message: `Sessão Reiki ${technique} completada. Símbolos canalizados: ${symbolDescriptions}.`,
    energyLevel: Math.floor(Math.random() * 30) + 70,
    balanceAchieved: true,
  };

  session.completedAt = new Date();
  return result;
}

export function getSymbols(): typeof REIKI_SYMBOLS {
  return { ...REIKI_SYMBOLS };
}

export function getSymbol(symbol: ReikiSymbol) {
  return REIKI_SYMBOLS[symbol];
}

export function getChakras(): readonly string[] {
  return [...[...CHAKRAS]];
}