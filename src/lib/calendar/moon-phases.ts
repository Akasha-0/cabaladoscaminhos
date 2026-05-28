/**
 * Moon Phases
 * Lunar cycle tracking and phase calculations for spiritual practice
 */

// Standard moon phases with their spiritual significance
export type MoonPhaseName =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhase {
  name: MoonPhaseName;
  displayName: string;
  illumination: number;
  emoji: string;
  spiritualMeaning: string;
  idealPractices: string[];
}

export interface MoonPhaseData {
  date: string;
  phase: MoonPhase;
  nextFullMoon: string;
  nextNewMoon: string;
  cycleDay: number;
}

// Reference new moon date (January 6, 2000 - known new moon)
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');
const LUNAR_CYCLE_DAYS = 29.53058867;

/**
 * Calculate the moon phase for a given date
 * Uses a simplified calculation based on known new moon reference
 */
export function calculateMoonPhase(date: Date): MoonPhaseName {
  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_CYCLE_DAYS;
  const normalizedAge = lunarAge < 0 ? lunarAge + LUNAR_CYCLE_DAYS : lunarAge;

  // Divide the cycle into 8 phases
  const phaseLength = LUNAR_CYCLE_DAYS / 8;

  if (normalizedAge < phaseLength) return 'new';
  if (normalizedAge < phaseLength * 2) return 'waxing_crescent';
  if (normalizedAge < phaseLength * 3) return 'first_quarter';
  if (normalizedAge < phaseLength * 4) return 'waxing_gibbous';
  if (normalizedAge < phaseLength * 5) return 'full';
  if (normalizedAge < phaseLength * 6) return 'waning_gibbous';
  if (normalizedAge < phaseLength * 7) return 'last_quarter';
  return 'waning_crescent';
}

/**
 * Calculate illumination percentage (0-100)
 */
export function calculateIllumination(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_CYCLE_DAYS;
  const normalizedAge = lunarAge < 0 ? lunarAge + LUNAR_CYCLE_DAYS : lunarAge;

  // Illumination follows a sine wave pattern
  const illumination = (1 - Math.cos((normalizedAge / LUNAR_CYCLE_DAYS) * 2 * Math.PI)) / 2;
  return Math.round(illumination * 100);
}

/**
 * Get the next full moon date
 */
export function getNextFullMoon(fromDate: Date): Date {
  const diff = fromDate.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_CYCLE_DAYS;

  // Full moon occurs at approximately half the cycle
  const fullMoonDay = LUNAR_CYCLE_DAYS / 2;

  let daysUntilFullMoon = fullMoonDay - lunarAge;
  if (daysUntilFullMoon < 0) {
    daysUntilFullMoon += LUNAR_CYCLE_DAYS;
  }

  return new Date(fromDate.getTime() + daysUntilFullMoon * 24 * 60 * 60 * 1000);
}

/**
 * Get the next new moon date
 */
export function getNextNewMoon(fromDate: Date): Date {
  const diff = fromDate.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_CYCLE_DAYS;

  let daysUntilNewMoon = -lunarAge;
  if (daysUntilNewMoon <= 0) {
    daysUntilNewMoon += LUNAR_CYCLE_DAYS;
  }

  return new Date(fromDate.getTime() + daysUntilNewMoon * 24 * 60 * 60 * 1000);
}

// Moon phase definitions with spiritual significance
const PHASE_DATA: Record<MoonPhaseName, Omit<MoonPhase, 'illumination'>> = {
  new: {
    name: 'new',
    displayName: 'Lua Nova',
    emoji: '🌑',
    spiritualMeaning: 'Início de ciclos, introspecção profunda, plantar intenções. Momento de renovação e limpeza energética.',
    idealPractices: ['Definir intenções', 'Novo projeto', 'Limpeza energética', 'Meditação silenciosa', 'Gratidão'],
  },
  waxing_crescent: {
    name: 'waxing_crescent',
    displayName: 'Crescente',
    emoji: '🌒',
    spiritualMeaning: 'Crescimento de intenções, energia ascendente, ação e movimento. Fase de build-up e conquista.',
    idealPractices: ['Iniciar projetos', 'Desenvolvimento pessoal', 'Oração por crescimento', 'Estudo espiritual', 'Crença ativa'],
  },
  first_quarter: {
    name: 'first_quarter',
    displayName: 'Quarto Crescente',
    emoji: '🌓',
    spiritualMeaning: 'Decisão e ação, superação de desafios, equilíbrio entre esforço e paciência.',
    idealPractices: ['Decisões importantes', 'Superar obstáculos', 'Trabalho criativo', 'Rituais de proteção', 'Força interior'],
  },
  waxing_gibbous: {
    name: 'waxing_gibbous',
    displayName: 'Gibosa Crescente',
    emoji: '🌔',
    spiritualMeaning: 'Refinamento de intenções, avaliação do progresso, preparação para a plenitude.',
    idealPractices: ['Avaliação de metas', 'Ajustes finos', 'Gratidão antecipada', 'Conexão com ancestrais', 'Oração de благословение'],
  },
  full: {
    name: 'full',
    displayName: 'Lua Cheia',
    emoji: '🌕',
    spiritualMeaning: 'Culminância, iluminação, revelações,峰值 de energia lunar. Rituais de gratidão e purificação.',
    idealPractices: ['Gratidão intensiva', 'Rituais de purificação', 'Leitura intuitive', 'Manifestação concretizada', 'Liberação emocional'],
  },
  waning_gibbous: {
    name: 'waning_gibbous',
    displayName: 'Gibosa Minguante',
    emoji: '🌖',
    spiritualMeaning: 'Compartilhar sabedoria, ensinar, cicatrizar. Transmitir conhecimento adquirido.',
    idealPractices: ['Ensinar outros', 'Compartilhar experiências', 'Descanso restaurador', 'Perdão', 'Cura emocional'],
  },
  last_quarter: {
    name: 'last_quarter',
    displayName: 'Quarto Minguante',
    emoji: '🌗',
    spiritualMeaning: 'Liberação, perdão, limpeza. Remover o que não serve mais para dar espaço ao novo.',
    idealPractices: ['Rituais de limpeza', 'Deixar ir', 'Perdão genuíno', 'Planejamento interior', 'Purificação'],
  },
  waning_crescent: {
    name: 'waning_crescent',
    displayName: 'Minguante',
    emoji: '🌘',
    spiritualMeaning: 'Descanco, integração, preparo para o novo ciclo. Silêncio e reflexão profunda.',
    idealPractices: ['Descanso profundo', 'Integração de lições', 'Meditação restauradora', 'Preparo para ciclo novo', 'Soltar'],
  },
};

/**
 * Get complete moon phase data for a specific date
 */
export function getMoonPhaseForDate(date: Date): MoonPhaseData {
  const phaseName = calculateMoonPhase(date);
  const illumination = calculateIllumination(date);
  const nextFull = getNextFullMoon(date);
  const nextNew = getNextNewMoon(date);

  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const cycleDay = Math.floor((daysSinceNewMoon % LUNAR_CYCLE_DAYS) + 1);

  const phaseBase = PHASE_DATA[phaseName];

  return {
    date: date.toISOString().split('T')[0],
    phase: {
      ...phaseBase,
      illumination,
    },
    nextFullMoon: nextFull.toISOString().split('T')[0],
    nextNewMoon: nextNew.toISOString().split('T')[0],
    cycleDay,
  };
}

/**
 * Get moon phases - main exported function
 * Returns moon phase data for today by default, or specified date
 */
export function getMoonPhases(date?: Date | string): MoonPhaseData {
  const targetDate = date
    ? typeof date === 'string' ? new Date(date) : date
    : new Date();

  return getMoonPhaseForDate(targetDate);
}

/**
 * Get moon phases - alias for getMoonPhases
 */
export function getPhases(date?: Date | string): MoonPhaseData {
  return getMoonPhases(date);
}

/**
 * Get moon phases for a date range (for calendar display)
 */
export function getMoonPhasesForRange(startDate: Date, days: number): MoonPhaseData[] {
  const phases: MoonPhaseData[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < days; i++) {
    phases.push(getMoonPhaseForDate(current));
    current.setDate(current.getDate() + 1);
  }

  return phases;
}

/**
 * Track moon phase history
 */
export interface MoonPhaseHistoryEntry {
  date: string;
  phaseName: MoonPhaseName;
  loggedAt: string;
}

export function createPhaseEntry(date?: Date): MoonPhaseHistoryEntry {
  const targetDate = date ?? new Date();
  const phaseName = calculateMoonPhase(targetDate);

  return {
    date: targetDate.toISOString().split('T')[0],
    phaseName,
    loggedAt: new Date().toISOString(),
  };
}

/**
 * Get spiritual recommendations based on current phase
 */
export function getPhaseRecommendations(date?: Date): {
  recommended: string[];
  avoided: string[];
  affirmation: string;
} {
  const phaseData = getMoonPhases(date);
  const phaseName = phaseData.phase.name;

  const recommendations: Record<MoonPhaseName, { recommended: string[]; avoided: string[]; affirmation: string }> = {
    new: {
      recommended: ['Iniciar novo projeto', 'Definir intenção', 'Escrever diários', 'Orar', 'Limpar espaço'],
      avoided: ['Impaciência', 'Comparação', 'Negatividade', 'Procrastinação ativa'],
      affirmation: 'Eu abraço novos começos com coração aberto e mente clara.',
    },
    waxing_crescent: {
      recommended: ['Avançar em metas', 'Praticar fé ativa', 'Nutrir crescimento', 'Estudar', 'Criar'],
      avoided: ['Dúvida excessiva', 'Inação', 'Sabotagem', 'Desânimo'],
      affirmation: 'A cada passo, minha intenção se fortalece e manifesto meu melhor.',
    },
    first_quarter: {
      recommended: ['Tomar decisões', 'Resolver conflitos', 'Agir com coragem', 'Trabalhar', 'Proteger espaço'],
      avoided: ['Indecisão prolongada', 'Medo de agir', 'Pessimismo', 'Conflitos desnecessários'],
      affirmation: 'Com confiança, atravesso desafios e emergo mais forte.',
    },
    waxing_gibbous: {
      recommended: ['Agradecer', 'Avaliar', 'Ajustar', 'Gratidão', 'Conexão espiritual'],
      avoided: ['Insatisfação', 'Ingratidão', 'Perfeccionismo excessivo', 'Autocrítica destrutiva'],
      affirmation: 'Reconheço minha evolução e celebro o crescimento alcançado.',
    },
    full: {
      recommended: ['Gratidão pública', 'Rituais de lua cheia', 'Intuição aguda', 'Manifestar', 'Celebrar'],
      avoided: ['Conflitos', 'Tensão', 'Excesso', 'Segredos nocivos'],
      affirmation: 'Minha luz interior brilha plena e ilumina meu caminho e dos outros.',
    },
    waning_gibbous: {
      recommended: ['Ensinar', 'Compartilhar', 'Curar', 'Descansar', 'Perdoar'],
      avoided: ['Excesso de esforço', 'Competição', 'Egoísmo', 'Amargura'],
      affirmation: 'Ao compartilhar minha sabedoria, multiplico bênçãos em minha vida.',
    },
    last_quarter: {
      recommended: ['Limpar', 'Soltar', 'Perdoar', 'Descartar', 'Reorganizar'],
      avoided: ['Acomodação', 'Acúmulo', 'Rancor', 'Rigidez'],
      affirmation: 'Libero o que não serve mais e abro espaço para nova luz.',
    },
    waning_crescent: {
      recommended: ['Descansar', 'Integrar', 'Refletir', 'Silenciar', 'Preparar'],
      avoided: ['Sobrecarga', 'Planejamento excessivo', 'Ansiedade', 'Pressa'],
      affirmation: 'No silêncio, encontro sabedoria e preparo meu ser para o novo ciclo.',
    },
  };

  return recommendations[phaseName];
}

/**
 * Get all phases for a specific month
 */
export function getMonthlyPhases(year: number, month: number): MoonPhaseData[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  return getMoonPhasesForRange(firstDay, daysInMonth);
}