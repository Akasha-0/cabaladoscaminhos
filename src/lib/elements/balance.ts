/**
 * Element balance calculator for astrological charts
 * Analyzes the distribution of elements (Fire, Earth, Air, Water) in a natal chart
 */

export type Element = 'fogo' | 'terra' | 'ar' | 'agua';

export interface ElementCounts {
  fogo: number;
  terra: number;
  ar: number;
  agua: number;
}

export interface ElementRatios {
  fogo: number;
  terra: number;
  ar: number;
  agua: number;
}

export interface ElementBalanceResult {
  counts: ElementCounts;
  ratios: ElementRatios;
  dominant: Element | null;
  deficient: Element | null;
  excess: Element | null;
  balanced: boolean;
  total: number;
  recommendations: ElementRecommendation[];
}

export interface ElementRecommendation {
  element: Element;
  type: 'excess' | 'deficient' | 'balanced';
  priority: 'alta' | 'media' | 'baixa';
  title: string;
  description: string;
  practices: string[];
}

export interface BalanceData {
  planets?: Partial<Record<string, { signo: string }>>;
  elementos?: Partial<Record<Element, number>>;
  mapaNatal?: {
    planeta?: Partial<Record<string, { signo: string }>>;
  };
}

// Map signs to elements
const SIGN_ELEMENT_MAP: Record<string, Element> = {
  aries: 'fogo',
  leao: 'fogo',
  sagitario: 'fogo',
  touro: 'terra',
  virgem: 'terra',
  capricornio: 'terra',
  gemeos: 'ar',
  libra: 'ar',
  aquario: 'ar',
  peixes: 'agua',
};

// @ts-ignore
/**
 * Normalize sign name to lowercase
 */
function normalizeSigno(signo: string): string {
  return signo?.toLowerCase().trim() || '';
}

/**
 * Count elements from planets data
 */
function countElementsFromPlanets(planets: Record<string, { signo: string }>): ElementCounts {
  const counts: ElementCounts = { fogo: 0, terra: 0, ar: 0, agua: 0 };

  Object.values(planets).forEach((planet) => {
    const signo = normalizeSigno(planet.signo);
    const element = SIGN_ELEMENT_MAP[signo];
    if (element) {
      counts[element]++;
    }
  });

  return counts;
}

/**
 * Calculate ratios (percentages) from counts
 */
function calculateRatios(counts: ElementCounts, total: number): ElementRatios {
  if (total === 0) {
    return { fogo: 0, terra: 0, ar: 0, agua: 0 };
  }

  return {
    fogo: Math.round((counts.fogo / total) * 100),
    terra: Math.round((counts.terra / total) * 100),
    ar: Math.round((counts.ar / total) * 100),
    agua: Math.round((counts.agua / total) * 100),
  };
}

/**
 * Find dominant, deficient, and excess elements
 */
function analyzeElementDistribution(counts: ElementCounts, total: number): {
  dominant: Element | null;
  deficient: Element | null;
  excess: Element | null;
  balanced: boolean;
} {
  if (total === 0) {
    return { dominant: null, deficient: null, excess: null, balanced: true };
  }

  const threshold = {
    excess: 4, // More than 4 planets in one element (for ~10 planets total)
    deficient: 0, // Less than 2 planets in one element
    dominant: 3, // Most planets, and significantly above average
  };

  const avgPerElement = total / 4;

  let dominant: Element | null = null;
  let maxCount = 0;
  let deficient: Element | null = null;
  let excess: Element | null = null;

  (Object.keys(counts) as Element[]).forEach((element) => {
    const count = counts[element];

    if (count > maxCount) {
      maxCount = count;
      dominant = element;
    }

    if (count >= threshold.excess) {
      excess = element;
    }

    if (count <= threshold.deficient) {
      deficient = element;
    }
  });

  // Check if dominant is significantly above average
  if (dominant && counts[dominant] < avgPerElement + 1) {
    dominant = null;
  }

  const balanced = !excess && !deficient;

  return { dominant, deficient, excess, balanced };
}

/**
 * Generate recommendations based on element distribution
 */
function generateRecommendations(
  counts: ElementCounts,
  ratios: ElementRatios,
  dominant: Element | null,
  deficient: Element | null,
  excess: Element | null,
  balanced: boolean
): ElementRecommendation[] {
  const recommendations: ElementRecommendation[] = [];

  // Balanced chart recommendation
  if (balanced) {
    recommendations.push({
      element: 'fogo',
      type: 'balanced',
      priority: 'baixa',
      title: 'Elementos Equilibrados',
      description: 'Seu mapa astral apresenta um bom equilíbrio entre os quatro elementos. Continue cultivando essa harmonia através de práticas diversas.',
      practices: [
        'Mantenha práticas espirituais variadas',
        'Busque desenvolver qualidades de todos os elementos',
        'Celebre a diversidade de sua natureza',
      ],
    });
    return recommendations;
  }

  // Excess element recommendations
  if (excess) {
    const excessInfo: Record<Element, { title: string; description: string; practices: string[] }> = {
      fogo: {
        title: 'Excesso de Fogo',
        description: 'Muita energia de fogo pode indicar impulsividade, agressividade ou dificuldade em relaxar. Trabalhe para harmonizar essa energia ardente.',
        practices: [
          'Pratique meditação e respiração profunda',
          'Atividades aquáticas como natação',
          'Horticultura e trabalho com a terra',
          'Ambientes frescos e sombreados',
        ],
      },
      terra: {
        title: 'Excesso de Terra',
        description: 'Muita energia de terra pode indicar materialismo excessivo, rigidez ou dificuldade em se adaptar. Busque mais leveza e flexibilidade.',
        practices: [
          'Práticas aeróbicas e movimento',
          'Atividades intelectuais e criativas',
          'Contato com o ar e espaços abertos',
          'Mude rotinas com frequência',
        ],
      },
      ar: {
        title: 'Excesso de Ar',
        description: 'Muita energia de ar pode indicar superficialidade, indecisão ou excesso de mentalização. Ancore-se mais no corpo e nas emoções.',
        practices: [
          'Práticas corporais como yoga ou tai chi',
          'Atividades práticas e manuais',
          'Tempo na natureza e com elementos terra',
          'Diário de sentimentos e emoções',
        ],
      },
      agua: {
        title: 'Excesso de Água',
        description: 'Muita energia de água pode indicar hipersensibilidade, dificuldade de limites ou estancamento emocional. Busque clareza e movimento.',
        practices: [
          'Exercícios de defesa pessoal',
          'Atividades ao ar livre e ensolaradas',
          'Práticas de assertion e dizer não',
          'Queima de incensos estimulantes',
        ],
      },
    };

    recommendations.push({
      element: excess,
      type: 'excess',
      priority: 'alta',
      ...excessInfo[excess],
    });
  }

  // Deficient element recommendations
  if (deficient) {
    const deficientInfo: Record<Element, { title: string; description: string; practices: string[] }> = {
      fogo: {
        title: 'Falta de Fogo',
        description: 'Pouca energia de fogo pode indicar baixa motivação, dificuldade de ação ou timidez. Desenvolva sua energia vital e paixão.',
        practices: [
          'Exercícios matinais e atividades físicas',
          'Práticas de fire yoga ou solar',
          'Visualizações com a cor vermelha',
          'Aromaterapia com especiarias quentes',
        ],
      },
      terra: {
        title: 'Falta de Terra',
        description: 'Pouca energia de terra pode indicar dificuldade de concretização, instabilidade ou falta de raízes. Estabeleça mais estrutura.',
        practices: [
          'Horticultura e cuidado de plantas',
          'Práticas de gratefulness',
          'Yoga com focus em posturas de chão',
          'Trabalho com cristais e pedras',
        ],
      },
      ar: {
        title: 'Falta de Ar',
        description: 'Pouca energia de ar pode indicar dificuldade de comunicação, rigidez mental ou solidão. Abra mais sua mente e conexões.',
        practices: [
          'Estudos e leituras diversas',
          'Conversas com pessoas diferentes',
          'Práticas de comunicação não-violenta',
          'Ambientes bem ventilados',
        ],
      },
      agua: {
        title: 'Falta de Água',
        description: 'Pouca energia de água pode indicar dificuldade emocional, frieza ou dificuldade de conexão íntima. Permita-se sentir mais.',
        practices: [
          'Terapia ou trabalho emocional',
          'Banhos relaxantes',
          'Tempo perto de fontes de água',
          'Diário de sonhos e sentimentos',
        ],
      },
    };

    recommendations.push({
      element: deficient,
      type: 'deficient',
      priority: deficient === dominant ? 'media' : 'alta',
      ...deficientInfo[deficient],
    });
  }

  // Dominant element recommendations (if different from excess/deficient)
  if (dominant && dominant !== excess && dominant !== deficient) {
    const dominantInfo: Record<Element, { title: string; description: string; practices: string[] }> = {
      fogo: {
        title: 'Fogo Dominante',
        description: 'Sua energia principal é o fogo: criatividade, coragem e paixão são suas forças. Use-as para liderar e inspirar.',
        practices: [
          'Canalize a energia em projetos criativos',
          'Lidere iniciativas e inspire outros',
          'Use sua coragem para causas importantes',
        ],
      },
      terra: {
        title: 'Terra Dominante',
        description: 'Sua energia principal é a terra: pragmatismo, lealdade e estabilidade são suas forças. Use-as para construir fundamentos sólidos.',
        practices: [
          'Foque em projetos de longo prazo',
          'Use sua praticidade para resolver problemas',
          'Ofereça apoio estável aos outros',
        ],
      },
      ar: {
        title: 'Ar Dominante',
        description: 'Sua energia principal é o ar: comunicação, intelectualidade e sociabilidade são suas forças. Use-as para conectar e ensinar.',
        practices: [
          'Compartilhe conhecimento e ideias',
          'Favoreça a comunicação em seus relacionamentos',
          'Use sua mente para resolver problemas complexos',
        ],
      },
      agua: {
        title: 'Água Dominante',
        description: 'Sua energia principal é a água: intuição, empatia e adaptabilidade são suas forças. Use-as para curar e conectar.',
        practices: [
          'Desenvolva sua intuição através da meditação',
          'Use sua empatia para ajudar outros',
          'Siga sua capacidade de adaptação nas mudanças',
        ],
      },
    };

    recommendations.push({
      element: dominant,
      type: 'balanced',
      priority: 'media',
      ...dominantInfo[dominant],
    });
  }

  return recommendations;
}

/**
 * Calculate element balance from natal chart data
 *
 * @param data - Chart data containing planets or pre-calculated elements
 * @returns Element balance analysis with counts, ratios, and recommendations
 */
export function calculateBalance(data: BalanceData): ElementBalanceResult {
  let counts: ElementCounts;

  // Get counts from different data sources
  if (data.elementos) {
    // Use pre-calculated element counts
    counts = {
      fogo: data.elementos.fogo ?? 0,
      terra: data.elementos.terra ?? 0,
      ar: data.elementos.ar ?? 0,
      agua: data.elementos.agua ?? 0,
    };
  } else if (data.planets) {
    // Calculate from planets data
    counts = countElementsFromPlanets(data.planets as Record<string, { signo: string }>);
  } else if (data.mapaNatal?.planeta) {
    // Calculate from natal chart planets
    counts = countElementsFromPlanets(data.mapaNatal.planeta as Record<string, { signo: string }>);
  } else {
    // Default empty counts
    counts = { fogo: 0, terra: 0, ar: 0, agua: 0 };
  }

  const total = counts.fogo + counts.terra + counts.ar + counts.agua;
  const ratios = calculateRatios(counts, total);
  const { dominant, deficient, excess, balanced } = analyzeElementDistribution(counts, total);
  const recommendations = generateRecommendations(counts, ratios, dominant, deficient, excess, balanced);

  return {
    counts,
    ratios,
    dominant,
    deficient,
    excess,
    balanced,
    total,
    recommendations,
  };
}

/**
 * Get element color for visualization
 */
export function getElementColor(element: Element): string {
  const colors: Record<Element, string> = {
    fogo: '#E25822',
    terra: '#8B4513',
    ar: '#87CEEB',
    agua: '#4682B4',
  };
  return colors[element];
}

/**
 * Get element symbol
 */
export function getElementSymbol(element: Element): string {
  const symbols: Record<Element, string> = {
    fogo: '♈',
    terra: '♉',
    ar: '♊',
    agua: '♋',
  };
  return symbols[element];
}
