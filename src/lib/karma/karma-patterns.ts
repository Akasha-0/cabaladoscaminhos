/**
 * Karma patterns library
 * Standardized karmic patterns with analysis configurations
 */

export interface KarmaPattern {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  severity: 'light' | 'moderate' | 'heavy';
  category: 'action' | 'inaction' | 'relationship' | 'belief' | 'ancestral';
  indicators: string[];
  resolution: string;
  resolutionPt: string;
  associatedPlanets: string[];
  associatedNumerology: number[];
  cycleLength: number; // in days
}

export const KARMA_PATTERNS: Record<string, KarmaPattern> = {
  'repeated-mistakes': {
    id: 'repeated-mistakes',
    name: 'Repeated Mistakes Pattern',
    namePt: 'Padrão de Erros Repetidos',
    description: 'Cyclic behavioral patterns where similar mistakes occur across different situations',
    descriptionPt: 'Padrões comportamentais cíclicos onde erros similares ocorrem em diferentes situações',
    severity: 'moderate',
    category: 'action',
    indicators: ['similar consequences', 'unaware of pattern', 'frustration cycles'],
    resolution: 'Awareness and conscious change in response to triggers',
    resolutionPt: 'Conscientização e mudança consciente em resposta aos gatilhos',
    associatedPlanets: ['mercury', 'mars'],
    associatedNumerology: [4, 7],
    cycleLength: 28,
  },
  'avoided-responsibility': {
    id: 'avoided-responsibility',
    name: 'Avoided Responsibility',
    namePt: 'Responsabilidade Evitada',
    description: 'Pattern of sidestepping obligations leading to accumulated karmic debt',
    descriptionPt: 'Padrão de desviar de obrigações levando a dívida cármica acumulada',
    severity: 'heavy',
    category: 'inaction',
    indicators: ['procrastination', 'blame external', 'incomplete tasks'],
    resolution: 'Face responsibilities with patience and dedication',
    resolutionPt: 'Enfrentar responsabilidades com paciência e dedicação',
    associatedPlanets: ['saturno', 'jupiter'],
    associatedNumerology: [8, 10],
    cycleLength: 90,
  },
  'codependent-dynamics': {
    id: 'codependent-dynamics',
    name: 'Codependent Dynamics',
    namePt: 'Dinâmicas Codependentes',
    description: 'Unhealthy relationship patterns of giving to receive validation',
    descriptionPt: 'Padrões de relacionamento não saudáveis de dar para receber validação',
    severity: 'moderate',
    category: 'relationship',
    indicators: ['people-pleasing', 'boundary violations', 'unequal exchange'],
    resolution: 'Develop healthy boundaries and self-validation',
    resolutionPt: 'Desenvolver limites saudáveis e auto-validação',
    associatedPlanets: ['venus', 'moon'],
    associatedNumerology: [2, 6],
    cycleLength: 40,
  },
  'victim-mentality': {
    id: 'victim-mentality',
    name: 'Victim Mentality',
    namePt: 'Mentalidade de Vítima',
    description: 'Belief system that external forces control personal outcomes',
    descriptionPt: 'Sistema de crenças de que forças externas controlam os resultados pessoais',
    severity: 'heavy',
    category: 'belief',
    indicators: ['external locus of control', 'resistance to change', 'martyrdom narratives'],
    resolution: 'Claim personal power and accept co-creation of reality',
    resolutionPt: 'Assumir o poder pessoal e aceitar a co-criação da realidade',
    associatedPlanets: ['mars', 'uranus'],
    associatedNumerology: [3, 13],
    cycleLength: 60,
  },
  'ancestral-debt': {
    id: 'ancestral-debt',
    name: 'Ancestral Karmic Debt',
    namePt: 'Dívida Cármica Ancestral',
    description: 'Inherited patterns from family lineage requiring resolution',
    descriptionPt: 'Padrões herdados da linhagem familiar requerendo resolução',
    severity: 'heavy',
    category: 'ancestral',
    indicators: ['family repetitions', 'generations patterns', 'unresolved lineage issues'],
    resolution: 'Honor lineage through conscious healing work',
    resolutionPt: 'Honrar a linhagem através de trabalho consciente de cura',
    associatedPlanets: ['saturno', 'neptune'],
    associatedNumerology: [4, 22],
    cycleLength: 180,
  },
  'power-imbalance': {
    id: 'power-imbalance',
    name: 'Power Imbalance',
    namePt: 'Desequilíbrio de Poder',
    description: 'Cycles of dominance and submission in relationships or roles',
    descriptionPt: 'Ciclos de dominação e submissão em relacionamentos ou papéis',
    severity: 'moderate',
    category: 'relationship',
    indicators: ['dominance patterns', 'submission cycles', 'authority conflicts'],
    resolution: 'Cultivate balanced power dynamics based on mutual respect',
    resolutionPt: 'Cultivar dinâmicas de poder equilibradas baseadas em respeito mútuo',
    associatedPlanets: ['mars', 'pluto'],
    associatedNumerology: [1, 8],
    cycleLength: 45,
  },
  'spiritual-bypassing': {
    id: 'spiritual-bypassing',
    name: 'Spiritual Bypassing',
    namePt: 'Desvio Espiritual',
    description: 'Using spiritual concepts to avoid processing real emotions',
    descriptionPt: 'Usar conceitos espirituais para evitar processar emoções reais',
    severity: 'light',
    category: 'belief',
    indicators: ['dismissal of emotions', 'idealization', 'avoidance behaviors'],
    resolution: 'Integrate spiritual understanding with emotional processing',
    resolutionPt: 'Integrar compreensão espiritual com processamento emocional',
    associatedPlanets: ['neptune', 'jupiter'],
    associatedNumerology: [7, 11],
    cycleLength: 30,
  },
  'abandonment-fear': {
    id: 'abandonment-fear',
    name: 'Abandonment Fear Pattern',
    namePt: 'Padrão de Medo de Abandono',
    description: 'Core wound driving clingy or conversely avoidant behaviors',
    descriptionPt: 'Ferida central conduzindo comportamentos agarrados ou inversamente evitativos',
    severity: 'moderate',
    category: 'ancestral',
    indicators: ['attachment issues', 'fear of rejection', 'instability narratives'],
    resolution: 'Develop secure attachment through inner child healing',
    resolutionPt: 'Desenvolver apego seguro através de cura da criança interior',
    associatedPlanets: ['moon', 'venus'],
    associatedNumerology: [2, 6],
    cycleLength: 35,
  },
  'unfinished-business': {
    id: 'unfinished-business',
    name: 'Unfinished Business',
    namePt: 'Assuntos Inconclusos',
    description: 'Outstanding commitments or relationships left unresolved',
    descriptionPt: 'Compromissos ou relacionamentos pendentes deixados sem resolução',
    severity: 'moderate',
    category: 'inaction',
    indicators: ['lingering debts', 'unsaid words', 'loose ends'],
    resolution: 'Complete what was left hanging with honesty and integrity',
    resolutionPt: 'Completar o que ficou pendente com honestidade e integridade',
    associatedPlanets: ['mercury', 'saturno'],
    associatedNumerology: [5, 8],
    cycleLength: 21,
  },
  'material-attachment': {
    id: 'material-attachment',
    name: 'Material Attachment',
    namePt: 'Apego Material',
    description: 'Excessive identification with possessions and material security',
    descriptionPt: 'Identificação excessiva com posses e segurança material',
    severity: 'light',
    category: 'belief',
    indicators: [' hoarding', 'fear of loss', 'identity in possessions'],
    resolution: 'Develop non-attachment while honoring abundance',
    resolutionPt: 'Desenvolver desapego enquanto honra a abundância',
    associatedPlanets: ['saturno', 'venus'],
    associatedNumerology: [4, 8],
    cycleLength: 50,
  },
};

/**
 * Get all karma patterns as an array
 */
export function getPatterns(): KarmaPattern[] {
  return Object.values(KARMA_PATTERNS);
}

/**
 * Get a specific pattern by id
 */
export function getPattern(id: string): KarmaPattern | undefined {
  return KARMA_PATTERNS[id];
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: KarmaPattern['category']): KarmaPattern[] {
  return getPatterns().filter((p) => p.category === category);
}

/**
 * Get patterns by severity
 */
export function getPatternsBySeverity(severity: KarmaPattern['severity']): KarmaPattern[] {
  return getPatterns().filter((p) => p.severity === severity);
}

/**
 * Get patterns associated with a specific planet
 */
export function getPatternsByPlanet(planet: string): KarmaPattern[] {
  return getPatterns().filter((p) =>
    p.associatedPlanets.some((ap) => ap.toLowerCase() === planet.toLowerCase())
  );
}

/**
 * Get patterns associated with a numerology number
 */
export function getPatternsByNumerology(number: number): KarmaPattern[] {
  return getPatterns().filter((p) => p.associatedNumerology.includes(number));
}

/**
 * Analyze patterns present in a list of indicator strings
 */
export function analyzePatterns(indicators: string[]): KarmaPattern[] {
  const normalizedIndicators = indicators.map((i) => i.toLowerCase().trim());

  return getPatterns().filter((pattern) =>
    pattern.indicators.some((indicator) =>
      normalizedIndicators.some(
        (ni) =>
          ni.includes(indicator.toLowerCase()) ||
          indicator.toLowerCase().includes(ni)
      )
    )
  );
}

/**
 * Calculate severity score based on pattern severity levels
 */
export function calculateSeverityScore(patterns: KarmaPattern[]): number {
  const weights: Record<KarmaPattern['severity'], number> = {
    light: 1,
    moderate: 2,
    heavy: 3,
  };

  return patterns.reduce((sum, p) => sum + weights[p.severity], 0);
}

/**
 * Estimate cycle duration for pattern resolution
 */
export function estimateResolutionTime(patterns: KarmaPattern[]): number {
  if (patterns.length === 0) return 0;

  const avgCycleLength =
    patterns.reduce((sum, p) => sum + p.cycleLength, 0) / patterns.length;

  // Average 2-3 cycles needed for significant progress
  return Math.round(avgCycleLength * 2.5);
}

/**
 * Get patterns grouped by category
 */
export function getPatternsGroupedByCategory(): Record<KarmaPattern['category'], KarmaPattern[]> {
  const categories: KarmaPattern['category'][] = [
    'action',
    'inaction',
    'relationship',
    'belief',
    'ancestral',
  ];

  return categories.reduce(
    (acc, category) => {
      acc[category] = getPatternsByCategory(category);
      return acc;
    },
    {} as Record<KarmaPattern['category'], KarmaPattern[]>
  );
}