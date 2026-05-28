/**
 * Breath work patterns library
 * Standardized breathing exercises with timing configurations
 */

export interface BreathPattern {
  id: string;
  name: string;
  namePt: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter?: number;
  cycles: number;
  benefits: string[];
  category: 'calming' | 'energizing' | 'grounding' | 'healing' | 'focus';
}

export const BREATH_PATTERNS: Record<string, BreathPattern> = {
  calming: {
    id: 'calming',
    name: 'Calming Breath',
    namePt: 'Respiração Calmante',
    description: 'Relaxing pattern to reduce stress and anxiety',
    inhale: 4,
    hold: 4,
    exhale: 6,
    cycles: 6,
    benefits: ['Reduces stress', 'Calms nervous system', 'Promotes relaxation'],
    category: 'calming',
  },
  grounding: {
    id: 'grounding',
    name: 'Grounding Breath',
    namePt: 'Respiração de Enraizamento',
    description: 'Deep breathing to connect with earth energy',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    benefits: ['Grounds energy', 'Reduces anxiety', 'Increases stability'],
    category: 'grounding',
  },
  energizing: {
    id: 'energizing',
    name: 'Energizing Breath',
    namePt: 'Respiração Energizante',
    description: 'Quick inhale for energy boost',
    inhale: 6,
    hold: 2,
    exhale: 4,
    cycles: 5,
    benefits: ['Increases energy', 'Improves focus', 'Boosts alertness'],
    category: 'energizing',
  },
  boxBreathing: {
    id: 'boxBreathing',
    name: 'Box Breathing',
    namePt: 'Respiração Quadrada',
    description: 'Equal timing for balance and calm',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 6,
    benefits: ['Balances nervous system', 'Improves concentration', 'Reduces anxiety'],
    category: 'calming',
  },
  relaxing: {
    id: 'relaxing',
    name: 'Relaxing Breath',
    namePt: 'Respiração Relaxante',
    description: 'Extended exhale for deep relaxation',
    inhale: 4,
    hold: 2,
    exhale: 8,
    cycles: 8,
    benefits: ['Deep relaxation', 'Activates parasympathetic system', 'Improves sleep'],
    category: 'calming',
  },
  coherence: {
    id: 'coherence',
    name: 'Coherence Breath',
    namePt: 'Respiração de Coerência',
    description: 'Heart-brain coherence practice',
    inhale: 5,
    hold: 0,
    exhale: 5,
    cycles: 10,
    benefits: ['Heart rate variability', 'Emotional balance', 'Mental clarity'],
    category: 'healing',
  },
  focus: {
    id: 'focus',
    name: 'Focus Breath',
    namePt: 'Respiração de Foco',
    description: 'Steady breathing for concentration',
    inhale: 4,
    hold: 4,
    exhale: 6,
    cycles: 10,
    benefits: ['Enhances concentration', 'Mental clarity', 'Mindfulness'],
    category: 'focus',
  },
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual Breath',
    namePt: 'Respiração Espiritual',
    description: 'Deep slow breathing for spiritual connection',
    inhale: 7,
    hold: 7,
    exhale: 7,
    cycles: 7,
    benefits: ['Spiritual connection', 'Inner peace', 'Transcendence'],
    category: 'healing',
  },
  ancient: {
    id: 'ancient',
    name: 'Ancient Breath',
    namePt: 'Respiração Ancestral',
    description: 'Traditional ancestral breathing practice',
    inhale: 5,
    hold: 5,
    exhale: 5,
    holdAfter: 5,
    cycles: 9,
    benefits: ['Ancestral connection', 'Grounding', 'Transformation'],
    category: 'healing',
  },
  lion: {
    id: 'lion',
    name: 'Lion Breath',
    namePt: 'Respiração do Leão',
    description: 'Open throat breathing for releasing tension',
    inhale: 4,
    hold: 0,
    exhale: 4,
    cycles: 5,
    benefits: ['Releases jaw tension', 'Opens throat', 'Emotional release'],
    category: 'healing',
  },
};

/**
 * Get all breath patterns as an array
 */
export function getPatterns(): BreathPattern[] {
  return Object.values(BREATH_PATTERNS);
}

/**
 * Get a specific pattern by id
 */
export function getPattern(id: string): BreathPattern | undefined {
  return BREATH_PATTERNS[id];
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: BreathPattern['category']): BreathPattern[] {
  return getPatterns().filter((p) => p.category === category);
}

/**
 * Calculate total duration of a pattern in seconds
 */
export function getPatternDuration(pattern: BreathPattern): number {
  const cycleDuration = pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfter ?? 0);
  return cycleDuration * pattern.cycles;
}

/**
 * Format a pattern step for display
 */
export function formatPatternStep(
  step: 'inhale' | 'hold' | 'exhale' | 'holdAfter',
  seconds: number,
  lang: 'en' | 'pt' = 'en'
): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      inhale: 'Inhale',
      hold: 'Hold',
      exhale: 'Exhale',
      holdAfter: 'Hold after exhale',
    },
    pt: {
      inhale: 'Inspire',
      hold: 'Segure',
      exhale: 'Expire',
      holdAfter: 'Pausa',
    },
  };

  return `${labels[lang][step]} ${seconds}s`;
}

/**
 * Get pattern instructions as array of steps
 */
export function getPatternInstructions(
  pattern: BreathPattern,
  lang: 'en' | 'pt' = 'en'
): string[] {
  const instructions: string[] = [];

  for (let i = 1; i <= pattern.cycles; i++) {
    instructions.push(`${lang === 'en' ? 'Cycle' : 'Ciclo'} ${i}:`);
    instructions.push(`  ${formatPatternStep('inhale', pattern.inhale, lang)}`);
    if (pattern.hold > 0) {
      instructions.push(`  ${formatPatternStep('hold', pattern.hold, lang)}`);
    }
    instructions.push(`  ${formatPatternStep('exhale', pattern.exhale, lang)}`);
    if (pattern.holdAfter && pattern.holdAfter > 0) {
      instructions.push(`  ${formatPatternStep('holdAfter', pattern.holdAfter, lang)}`);
    }
  }

  return instructions;
}
