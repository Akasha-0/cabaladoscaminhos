// Ritual Combination Generator - Cabala dos Caminhos
// Combines spiritual rituals for enhanced effectiveness

/**
 * Ritual categories for combination matching
 */
export type RitualCategory =
  | 'protection'
  | 'prosperity'
  | 'love'
  | 'healing'
  | 'clarity'
  | 'transformation'
  | 'manifestation'
  | 'release';

/**
 * Moon phase target type for ritual alignment
 */
export type MoonPhaseTarget =
  | 'new'
  | 'waxing'
  | 'full'
  | 'waning';

/**
 * A ritual intention for combination
 */
export interface RitualIntention {
  id: string;
  name: string;
  description?: string;
  targetPhase: MoonPhaseTarget;
  optimalDays?: number;
  orixas?: string[];
  duration?: number;
}

/**
 * A combined ritual with its components and synergy score
 */
export interface RitualCombination {
  id: string;
  name: string;
  description: string;
  rituals: RitualIntention[];
  category: RitualCategory;
  synergyScore: number;
  moonPhase: string;
  orixas: string[];
  practices: string[];
  benefits: string[];
}

/**
 * Complementary ritual suggestion
 */
export interface ComplementaryRitual {
  ritual: RitualIntention;
  reason: string;
  synergyLevel: 'high' | 'medium' | 'low';
}

/**
 * Input for combining rituals
 */
export interface CombineRitualsInput {
  primaryRitual: RitualIntention;
  availableRituals?: RitualIntention[];
  maxSynergyScore?: number;
  preferredMoonPhase?: string;
}

/**
 * Category keyword mappings
 */
const CATEGORY_KEYWORDS: Record<RitualCategory, string[]> = {
  protection: ['proteção', 'defesa', 'guarda', 'segurança', 'shield', 'protection', 'defense'],
  prosperity: ['prosperidade', 'abundância', 'dinheiro', 'ouro', 'fortuna', 'riqueza', 'prosperity', 'abundance', 'wealth'],
  love: ['amor', 'relacionamento', 'paixão', 'união', 'heart', 'love', 'relationship', 'passion'],
  healing: ['cura', 'saúde', 'bem-estar', 'recuperação', 'healing', 'health', 'wellness', 'recovery'],
  clarity: ['clareza', 'visão', 'intuição', 'sabedoria', 'conhecimento', 'clarity', 'vision', 'intuition', 'wisdom'],
  transformation: ['transformação', 'mudança', 'metamorfose', 'renascimento', 'transformation', 'change', 'rebirth'],
  manifestation: ['manifestação', 'criação', 'intenção', 'materialização', 'manifestation', 'creation', 'intention'],
  release: ['liberação', 'desapego', 'limpeza', 'descargo', 'perdão', 'release', 'letting go', 'cleansing'],
};

/**
 * Moon phase to category compatibility
 */
const PHASE_CATEGORY_COMPATIBILITY: Record<MoonPhaseTarget, RitualCategory[]> = {
  new: ['manifestation', 'protection', 'transformation'],
  waxing: ['prosperity', 'love', 'healing', 'clarity'],
  full: ['manifestation', 'love', 'clarity', 'healing'],
  waning: ['release', 'transformation', 'protection'],
};

/**
 * Orixá to category affinity
 */
const ORIXA_CATEGORY_AFFINITY: Record<string, RitualCategory[]> = {
  'Oxalá': ['healing', 'clarity', 'protection'],
  'Oxum': ['love', 'prosperity', 'healing'],
  'Iemanjá': ['love', 'protection', 'manifestation'],
  'Ogum': ['protection', 'transformation', 'clarity'],
  'Xangô': ['clarity', 'transformation', 'protection'],
  'Iansã': ['transformation', 'release', 'protection'],
  'Oxóssi': ['prosperity', 'clarity', 'transformation'],
  'Omolu': ['healing', 'release', 'transformation'],
  'Nanã': ['healing', 'clarity', 'transformation'],
  'Obá': ['love', 'protection', 'prosperity'],
  'Logun Edé': ['love', 'prosperity', 'clarity'],
  'Eṣu': ['transformation', 'manifestation', 'protection'],
};

/**
 * Infer ritual category from name and description
 */
export function inferRitualCategory(ritual: RitualIntention): RitualCategory {
  const text = `${ritual.name} ${ritual.description || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category as RitualCategory;
    }
  }

  // Default categories based on phase
  if (ritual.targetPhase === 'new') return 'manifestation';
  if (ritual.targetPhase === 'full') return 'manifestation';
  if (ritual.targetPhase === 'waning') return 'release';

  return 'transformation';
}

/**
 * Calculate synergy score between two rituals
 */
export function calculateSynergy(ritualA: RitualIntention, ritualB: RitualIntention): number {
  let score = 0;

  const categoryA = inferRitualCategory(ritualA);
  const categoryB = inferRitualCategory(ritualB);

  // Same category bonus
  if (categoryA === categoryB) {
    score += 30;
  }

  // Complementary categories bonus
  const complementaryPairs: Array<[RitualCategory, RitualCategory]> = [
    ['protection', 'manifestation'],
    ['release', 'manifestation'],
    ['healing', 'transformation'],
    ['clarity', 'manifestation'],
    ['love', 'prosperity'],
    ['protection', 'healing'],
  ];

  if (complementaryPairs.some(([a, b]) => (categoryA === a && categoryB === b) || (categoryA === b && categoryB === a))) {
    score += 20;
  }

  // Moon phase synergy
  const phaseOrder: MoonPhaseTarget[] = ['new', 'waxing', 'full', 'waning'];
  const idxA = phaseOrder.indexOf(ritualA.targetPhase);
  const idxB = phaseOrder.indexOf(ritualB.targetPhase);

  if (idxA === idxB) {
    score += 25;
  } else {
    // Adjacent phases work well
    const diff = Math.abs(idxA - idxB);
    if (diff === 1) {
      score += 15;
    }
  }

  // Orixá affinity
  const orixasA = ritualA.orixas || [];
  const orixasB = ritualB.orixas || [];

  if (orixasA.length > 0 && orixasB.length > 0) {
    const shared = orixasA.filter(o => orixasB.includes(o));
    if (shared.length > 0) {
      score += shared.length * 10;
    }
  }

  return Math.min(score, 100);
}

/**
 * Find complementary rituals for a primary ritual
 */
export function suggestComplementaryRituals(
  primaryRitual: RitualIntention,
  availableRituals: RitualIntention[]
): ComplementaryRitual[] {
  const suggestions: ComplementaryRitual[] = [];
  const primaryCategory = inferRitualCategory(primaryRitual);

  for (const ritual of availableRituals) {
    if (ritual.id === primaryRitual.id) continue;

    const synergy = calculateSynergy(primaryRitual, ritual);
    const category = inferRitualCategory(ritual);

    let reason: string;
    let synergyLevel: 'high' | 'medium' | 'low';

    if (synergy >= 60) {
      synergyLevel = 'high';
      reason = `Excelente combinação para ${category}`;
    } else if (synergy >= 40) {
      synergyLevel = 'medium';
      reason = `Bom complemento para ${primaryCategory}`;
    } else {
      synergyLevel = 'low';
      reason = `Pode ser realizado em sequência`;
    }

    if (synergy >= 30) {
      suggestions.push({ ritual, reason, synergyLevel });
    }
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.synergyLevel] - order[b.synergyLevel];
  });
}

/**
 * Generate a unique combination ID
 */
function generateCombinationId(): string {
  return `combo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a ritual combination from multiple rituals
 */
export function createRitualCombination(
  rituals: RitualIntention[],
  name?: string,
  description?: string
): RitualCombination {
  if (rituals.length === 0) {
    throw new Error('At least one ritual is required');
  }

  const primary = rituals[0];
  const categories = rituals.map(r => inferRitualCategory(r));
  const primaryCategory = categories[0];

  // Calculate overall synergy
  let totalSynergy = 0;
  for (let i = 0; i < rituals.length; i++) {
    for (let j = i + 1; j < rituals.length; j++) {
      totalSynergy += calculateSynergy(rituals[i], rituals[j]);
    }
  }

  const avgSynergy = rituals.length > 1 ? Math.round(totalSynergy / ((rituals.length * (rituals.length - 1)) / 2)) : 100;

  // Collect moon phases
  const moonPhases = rituals.map(r => r.targetPhase);
  const uniquePhases = [...new Set(moonPhases)];

  // Collect orixás
  const allOrixas = rituals.flatMap(r => r.orixas || []);
  const uniqueOrixas = [...new Set(allOrixas)];

  // Generate practices from rituals
  const practices = rituals.map(r => r.name).slice(0, 5);

  // Generate benefits based on categories
  const benefitMap: Record<RitualCategory, string[]> = {
    protection: ['Proteção energética', 'Escudo áurico', 'Defesa espiritual'],
    prosperity: ['Atração de abundância', 'Prosperidade financeira', 'Fertilidade'],
    love: ['Harmonia nos relacionamentos', 'Amor próprio', 'Conexão emocional'],
    healing: ['Cura emocional', 'Renovação vital', 'Equilíbrio energético'],
    clarity: ['Clareza mental', 'Visão espiritual', 'Discernimento'],
    transformation: ['Renascimento', 'Evolução espiritual', 'Superação de desafios'],
    manifestation: ['Materialização de intenção', 'Criação consciente', 'Realização'],
    release: ['Liberação de padrões', 'Desapego', 'Purificação'],
  };

  const benefits = categories.flatMap(c => benefitMap[c] || []).slice(0, 4);

  const comboName = name || rituals.map(r => r.name).join(' + ');
  const comboDescription = description || `Combinação poderosa de ${rituals.length} rituais para ${primaryCategory}`;

  return {
    id: generateCombinationId(),
    name: comboName,
    description: comboDescription,
    rituals,
    category: primaryCategory,
    synergyScore: avgSynergy,
    moonPhase: uniquePhases.join(', '),
    orixas: uniqueOrixas.slice(0, 4),
    practices,
    benefits,
  };
}

/**
 * Main function: Combine rituals into optimized combinations
 */
export function combineRituals(
  input: CombineRitualsInput
): RitualCombination[] {
  const { primaryRitual, availableRituals = [], maxSynergyScore = 80 } = input;

  const combinations: RitualCombination[] = [];

  // Start with primary ritual alone
  combinations.push(createRitualCombination([primaryRitual]));

  // Get complementary rituals
  const complements = availableRituals.length > 0
    ? suggestComplementaryRituals(primaryRitual, availableRituals)
    : [];

  // Create 2-ritual combinations with high synergy
  const highSynergyRituals = complements.filter(c => c.synergyLevel === 'high');
  for (const complement of highSynergyRituals.slice(0, 3)) {
    const combo = createRitualCombination(
      [primaryRitual, complement.ritual],
      `${primaryRitual.name} + ${complement.ritual.name}`,
      complement.reason
    );
    if (combo.synergyScore <= maxSynergyScore) {
      combinations.push(combo);
    }
  }

  // Create 3-ritual combinations with highest synergies
  const mediumSynergyRituals = complements.filter(c => c.synergyLevel === 'medium');
  for (const first of highSynergyRituals.slice(0, 2)) {
    for (const second of mediumSynergyRituals.slice(0, 2)) {
      if (first.ritual.id === second.ritual.id) continue;

      const combo = createRitualCombination(
        [primaryRitual, first.ritual, second.ritual],
        `${primaryRitual.name} + ${first.ritual.name} + ${second.ritual.name}`,
        `Sequência completa para ${inferRitualCategory(primaryRitual)}`
      );

      if (combo.synergyScore <= maxSynergyScore) {
        combinations.push(combo);
      }
    }
  }

  // Sort by synergy score descending
  return combinations.sort((a, b) => b.synergyScore - a.synergyScore);
}

/**
 * Get default ritual library for suggestions
 */
export function getDefaultRitualLibrary(): RitualIntention[] {
  return [
    {
      id: 'ritual-protecao',
      name: 'Ritual de Proteção',
      description: 'Firmeza de proteção contra energias negativas',
      targetPhase: 'waning',
      duration: 30,
    },
    {
      id: 'ritual-prosperidade',
      name: 'Ritual de Prosperidade',
      description: 'Atração de abundância e prosperidade',
      targetPhase: 'waxing',
      duration: 45,
    },
    {
      id: 'ritual-amor',
      name: 'Ritual de Amor',
      description: 'Harmonia e proteção nos relacionamentos',
      targetPhase: 'full',
      duration: 40,
    },
    {
      id: 'ritual-cura',
      name: 'Ritual de Cura',
      description: 'Cura emocional e renovação vital',
      targetPhase: 'full',
      duration: 50,
    },
    {
      id: 'ritual-manifestacao',
      name: 'Ritual de Manifestação',
      description: 'Materialização de intenções e desejos',
      targetPhase: 'new',
      duration: 35,
    },
    {
      id: 'ritual-libertacao',
      name: 'Ritual de Libertação',
      description: 'Liberação de padrões e purificação',
      targetPhase: 'waning',
      duration: 45,
    },
    {
      id: 'ritual-claridade',
      name: 'Ritual de Claridade',
      description: 'Visão espiritual e discernimento',
      targetPhase: 'waxing',
      duration: 30,
    },
    {
      id: 'ritual-transformacao',
      name: 'Ritual de Transformação',
      description: 'Renascimento e evolução espiritual',
      targetPhase: 'new',
      duration: 60,
    },
  ];
}