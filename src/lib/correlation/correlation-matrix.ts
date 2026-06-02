/**
 * Matriz de Correlações do Sistema Espiritual
 * Cabala dos Caminhos - Engine de Correlações
 * 
 * Define como os diferentes sistemas espirituais se correlacionam:
 * - Numerologia ↔ Elementos
 * - Odu ↔ Numerologia
 * - Signo ↔ Elemento
 * - Chakra ↔ Elemento
 * - Correlações cruzadas
 */

import {
  ElementType,
  SignType,
  ChakraLevel,
  CABALISTIC_NUMBERS,
  ODUS,
  ZODIAC_SIGNS,
  CHAKRAS,
  getCabalisticInfo,
  getElementInfo,
  getZodiacInfo,
  getChakraInfo,
  getAllElements
} from './definitions';

// ============================================
// TIPOS DE CORRELAÇÃO
// ============================================

export interface CorrelationResult {
  sourceSystem: string;
  targetSystem: string;
  correlationType: 'strong' | 'moderate' | 'weak' | 'conflict';
  description: string;
  insight: string;
  recommendation?: string;
}

export interface CrossSystemAnalysis {
  correlations: CorrelationResult[];
  dominantTheme: string;
  challenges: string[];
  opportunities: string[];
  spiritualPath: string;
}

// ============================================
// MAPA DE ELEMENTOS POR NÚMERO
// ============================================

/**
 * Mapeamento de números cabalísticos para elementos dominantes
 */
const NUMEROLOGY_ELEMENT_MAP: Record<number, ElementType[]> = {
  1: ['Fogo', 'Ar'],
  2: ['Agua', 'Terra'],
  3: ['Fogo', 'Ar'],
  4: ['Terra', 'Fogo'],
  5: ['Ar', 'Agua'],
  6: ['Agua', 'Terra'],
  7: ['Agua', 'Ar'],
  8: ['Fogo', 'Terra'],
  9: ['Fogo', 'Agua'],
  11: ['Agua', 'Ar'],
  22: ['Terra', 'Fogo'],
  33: ['Agua', 'Fogo']
};

// ============================================
// MAPA DE CHAKRAS PARA ELEMENTOS
// ============================================

/**
 * Mapeamento de chakras para elementos
 */
const CHAKRA_ELEMENT_MAP: Record<ChakraLevel, ElementType> = {
  1: 'Terra',
  2: 'Agua',
  3: 'Fogo',
  4: 'Ar',
  5: 'Ar',
  6: 'Agua',
  7: 'Fogo'
};

// ============================================
// MATRIZ DE COMPATIBILIDADE ELEMENTAL
// ============================================

/**
 * Matriz de compatibilidade entre elementos
 * Formato: [element1][element2] = compatibility (1-3)
 */
const ELEMENT_COMPATIBILITY: Record<ElementType, Record<ElementType, number>> = {
  'Agua': {
    'Agua': 3,    // Alta - mesma energia
    'Fogo': 1,    // Baixa - opostos
    'Terra': 2,   // Média - complementar
    'Ar': 2       // Média - complementar
  },
  'Fogo': {
    'Agua': 1,    // Baixa - opostos
    'Fogo': 3,    // Alta - mesma energia
    'Terra': 2,    // Média - transformação
    'Ar': 2       // Média - impulso
  },
  'Terra': {
    'Agua': 2,    // Média - crescimento
    'Fogo': 2,    // Média - transformação
    'Terra': 3,   // Alta - mesma energia
    'Ar': 1       // Baixa - tensão
  },
  'Ar': {
    'Agua': 2,    // Média - evaporação
    'Fogo': 2,    // Média - combustão
    'Terra': 1,   // Baixa - dispersão
    'Ar': 3       // Alta - mesma energia
  }
};

// ============================================
// FUNÇÕES DE CORRELAÇÃO
// ============================================

/**
 * Analisa a correlação entre número cabalístico e elemento
 */
function correlateNumerologyElement(
  number: number,
  element: ElementType
): CorrelationResult {
  const numerologyInfo = getCabalisticInfo(number);
  const compatibleElements = numerologyInfo?.compatibleElements || [];
  
  const isCompatible = compatibleElements.includes(element);
  const elementInfo = getElementInfo(element);
  
  if (isCompatible) {
    return {
      sourceSystem: 'Numerologia Cabalística',
      targetSystem: 'Elementos',
      correlationType: 'strong',
      description: `Número ${number} (${numerologyInfo?.name}) se harmoniza naturalmente com ${element}`,
      insight: `Sua energia numérica ressoa com o elemento ${element}, trazendo facilidade em características como: ${elementInfo?.characteristics.slice(0, 3).join(', ')}`,
      recommendation: `Potencialize essa harmonia com práticas que integrem ambos: ${getElementPractice(element)}`
    };
  }
  
  return {
    sourceSystem: 'Numerologia Cabalística',
    targetSystem: 'Elementos',
    correlationType: 'moderate',
    description: `Número ${number} e ${element} têm relação moderada`,
    insight: `Sua energia pode precisar de ajustes para harmonizar as características do número ${number} com o elemento ${element}`,
    recommendation: `Busque práticas que equilibrem: explore características do elemento que você menos desenvolve`
  };
}

/**
 * Analisa a correlação entre Odu e número cabalístico
 */
function correlateOduNumerology(
  oduName: string,
  cabalisticNumber: number
): CorrelationResult {
  const oduInfo = ODUS[oduName];
  const numerologyInfo = getCabalisticInfo(cabalisticNumber);
  
  if (!oduInfo || !numerologyInfo) {
    return {
      sourceSystem: 'Ifá (Odu)',
      targetSystem: 'Numerologia Cabalística',
      correlationType: 'weak',
      description: 'Dados não encontrados',
      insight: 'Não foi possível analisar a correlação'
    };
  }
  
  const isCompatible = oduInfo.compatibleNumerology.includes(cabalisticNumber);
  const isIncompatible = oduInfo.incompatibleNumerology.includes(cabalisticNumber);
  
  if (isCompatible) {
    return {
      sourceSystem: 'Ifá (Odu)',
      targetSystem: 'Numerologia Cabalística',
      correlationType: 'strong',
      description: `${oduName} (Odu ${oduInfo.number}) harmoniza com número ${cabalisticNumber}`,
      insight: `Seus preceitos de ${oduName} se alinham com as qualidades de ${numerologyInfo.name}. Você tem facilidade em viver essas energias juntas.`,
      recommendation: `Integre os preceitos do Odu com as forças do seu número: pratique ${oduInfo.preceitos[0]}`
    };
  }
  
  if (isIncompatible) {
    return {
      sourceSystem: 'Ifá (Odu)',
      targetSystem: 'Numerologia Cabalística',
      correlationType: 'conflict',
      description: `${oduName} e número ${cabalisticNumber} podem ter tensões`,
      insight: `Você pode sentir um conflito interno entre seus preceitos de ${oduName} e suas tendências numéricas. Isso não é um problema - é uma oportunidade de crescimento.`,
      recommendation: `Trabalhe conscientemente para integrar ambas as energias. Quando sentir o conflito, escolha conscientemente qual energia seguir.`
    };
  }
  
  return {
    sourceSystem: 'Ifá (Odu)',
    targetSystem: 'Numerologia Cabalística',
    correlationType: 'moderate',
    description: `Relação neutra entre ${oduName} e número ${cabalisticNumber}`,
    insight: `Suas energias coexistem sem forte conflito ou facilidade. Você terá que trabalhar um pouco mais para integrar ambas.`,
    recommendation: `Pratique mindfulness para reconhecer quando cada energia está mais presente`
  };
}

/**
 * Analisa a correlação entre signo e elemento
 */
function correlateZodiacElement(
  sign: SignType,
  element: ElementType
): CorrelationResult {
  const zodiacInfo = getZodiacInfo(sign);
  const elementInfo = getElementInfo(element);
  
  if (!zodiacInfo || !elementInfo) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Elementos',
      correlationType: 'weak',
      description: 'Dados não encontrados',
      insight: 'Não foi possível analisar'
    };
  }
  
  const nativeElement = zodiacInfo.element;
  const isNative = nativeElement === element;
  
  if (isNative) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Elementos',
      correlationType: 'strong',
      description: `${sign} é naturalmente regido por ${element}`,
      insight: `O elemento ${element} é nativo do seu signo. Suas características naturais incluem: ${elementInfo.characteristics.slice(0, 3).join(', ')}`,
      recommendation: `Aborde o equilíbrio elemental: conheça os desafios do excesso do seu elemento nativo`
    };
  }
  
  const compatibility = ELEMENT_COMPATIBILITY[nativeElement]?.[element] || 1;
  
  if (compatibility >= 2) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Elementos',
      correlationType: 'moderate',
      description: `${sign} (${nativeElement}) tem relação moderada com ${element}`,
      insight: `O elemento ${element} complementa seu ${nativeElement} nativo, oferecendo expansão e equilíbrio`,
      recommendation: `Pratique exercícios que integrem ambos os elementos`
    };
  }
  
  return {
    sourceSystem: 'Zodíaco',
    targetSystem: 'Elementos',
    correlationType: 'weak',
    description: `${sign} e ${element} têm pouca afinidade natural`,
    insight: `O elemento ${element} representa um aspecto que você pode precisar desenvolver conscientemente`,
    recommendation: `Busque experiências e práticas que aproximem você do elemento ${element}`
  };
}

/**
 * Analisa a correlação entre chakra e elemento
 */
function correlateChakraElement(
  chakra: ChakraLevel,
  element: ElementType
): CorrelationResult {
  const chakraInfo = getChakraInfo(chakra);
  const elementInfo = getElementInfo(element);
  const nativeElement = CHAKRA_ELEMENT_MAP[chakra];
  
  if (!chakraInfo || !elementInfo) {
    return {
      sourceSystem: 'Chakras',
      targetSystem: 'Elementos',
      correlationType: 'weak',
      description: 'Dados não encontrados',
      insight: 'Não foi possível analisar'
    };
  }
  
  if (nativeElement === element) {
    return {
      sourceSystem: 'Chakras',
      targetSystem: 'Elementos',
      correlationType: 'strong',
      description: `O ${chakraInfo.name} está associado ao elemento ${nativeElement}`,
      insight: `Este chakra é naturalmente conectado à energia de ${element}. Trabalhar este chakra potencializa as características de ${element}`,
      recommendation: `Use o mantra ${chakraInfo.mantra} e a afirmação "${chakraInfo.affirmation}" para ativar esta conexão`
    };
  }
  
  return {
    sourceSystem: 'Chakras',
    targetSystem: 'Elementos',
    correlationType: 'moderate',
    description: `O ${chakraInfo.name} e ${element} têm relação moderada`,
    insight: `Trabalhar este chakra pode ajudar a integrar a energia de ${element} em sua vida`,
    recommendation: `Pratique visualização do chakra com a cor ${chakraInfo.color}`
  };
}

/**
 * Analisa a correlação entre signo e chakra
 */
function correlateZodiacChakra(
  sign: SignType,
  dominantChakra: ChakraLevel
): CorrelationResult {
  const zodiacInfo = getZodiacInfo(sign);
  const chakraInfo = getChakraInfo(dominantChakra);
  
  if (!zodiacInfo || !chakraInfo) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Chakras',
      correlationType: 'weak',
      description: 'Dados não encontrados',
      insight: 'Não foi possível analisar'
    };
  }
  
  const nativeChakra = zodiacInfo.chakra;
  
  if (nativeChakra === dominantChakra) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Chakras',
      correlationType: 'strong',
      description: `${sign} indica naturalmente o chakra ${chakraInfo.name}`,
      insight: `Seu signo aponta para o ${chakraInfo.name} como centro de energia natural. Este é seu ponto de força espiritual.`,
      recommendation: `Fortaleça este chakra com: mantra ${chakraInfo.mantra}, affirmation: "${chakraInfo.affirmation}"`
    };
  }
  
  const distance = Math.abs(nativeChakra - dominantChakra);
  
  if (distance <= 2) {
    return {
      sourceSystem: 'Zodíaco',
      targetSystem: 'Chakras',
      correlationType: 'moderate',
      description: `${sign} e chakra ${chakraInfo.name} têm relação moderada`,
      insight: `Seu desenvolvimento espiritual pode envolver expandir do chakra natural (${getChakraInfo(nativeChakra)?.name}) para o ${chakraInfo.name}`,
      recommendation: `Pratique a abertura gradual dos chakras intermediários`
    };
  }
  
  return {
    sourceSystem: 'Zodíaco',
    targetSystem: 'Chakras',
    correlationType: 'weak',
    description: `${sign} e chakra ${chakraInfo.name} têm pouca relação direta`,
    insight: `Seu caminho espiritual pode envolver uma transformação significativa de um centro de energia para outro`,
    recommendation: `Considere práticas de limpeza e abertura de todos os chakras`
  };
}

// ============================================
// ANÁLISE DE SISTEMA CRUZADO
// ============================================

export interface FullProfileCorrelation {
  cabalisticNumber: number;
  odu: string;
  sign: SignType;
  element: ElementType;
  dominantChakra: ChakraLevel;
}

export interface CrossSystemInsights {
  correlations: CorrelationResult[];
  primaryInsight: string;
  secondaryInsights: string[];
  elementalBalance: {
    dominant: ElementType;
    deficient: ElementType;
    recommendation: string;
  };
  chakraElementalRelation: string;
  spiritualGifts: string[];
  growthAreas: string[];
}

/**
 * Gera análise completa de correlações cruzadas
 */
// fallow-ignore-next-line complexity
function generateCrossSystemAnalysis(profile: FullProfileCorrelation): CrossSystemInsights {
  const correlations: CorrelationResult[] = [];
  
  // Numerologia ↔ Elemento
  correlations.push(correlateNumerologyElement(profile.cabalisticNumber, profile.element));
  
  // Odu ↔ Numerologia
  correlations.push(correlateOduNumerology(profile.odu, profile.cabalisticNumber));
  
  // Signo ↔ Elemento
  correlations.push(correlateZodiacElement(profile.sign, profile.element));
  
  // Chakra ↔ Elemento
  correlations.push(correlateChakraElement(profile.dominantChakra, profile.element));
  
  // Signo ↔ Chakra
  correlations.push(correlateZodiacChakra(profile.sign, profile.dominantChakra));
  
  // Analisa equilíbrio elemental
  const numerologyElements = NUMEROLOGY_ELEMENT_MAP[profile.cabalisticNumber] || [];
  const oduElement = ODUS[profile.odu]?.element;
  
  const allElements: ElementType[] = [
    profile.element,
    ...numerologyElements,
    oduElement as ElementType
  ].filter(Boolean) as ElementType[];
  
  const elementCounts = getAllElements().map(e => ({
    element: e,
    count: allElements.filter(ae => ae === e).length
  }));
  
  elementCounts.sort((a, b) => b.count - a.count);
  
  const dominant = elementCounts[0].element;
  const deficient = elementCounts[elementCounts.length - 1].element;
  
  // Gera insights primários
  const strongCorrelations = correlations.filter(c => c.correlationType === 'strong');
  const conflicts = correlations.filter(c => c.correlationType === 'conflict');
  
  let primaryInsight = '';
  if (strongCorrelations.length >= 3) {
    primaryInsight = `Você tem uma configuração espiritualmente coerente com ${strongCorrelations.length} correlações fortes. Suas práticas devem fluir naturalmente.`;
  } else if (conflicts.length > 0) {
    primaryInsight = `Você tem ${conflicts.length} tensão(ões) interna(s) que podem ser oportunidades de crescimento. Aceite o desafio como parte do seu caminho.`;
  } else {
    primaryInsight = `Sua configuração espiritual é equilibrada. Há espaço para desenvolvimento em múltiplas áreas.`;
  }
  
  // Identifica dons espirituais
  const spiritualGifts: string[] = [];
  
  if (profile.element === 'Agua') spiritualGifts.push('Intuição elevada');
  if (profile.element === 'Fogo') spiritualGifts.push('Capacidade de transformação');
  if (profile.element === 'Terra') spiritualGifts.push('Ancoramento e estabilidade');
  if (profile.element === 'Ar') spiritualGifts.push('Comunicação espiritual');
  
  if ([11, 22, 33].includes(profile.cabalisticNumber)) {
    spiritualGifts.push('Número Mestre - dons espirituais elevados');
  }
  
  if (['Cancer', 'Escorpiao', 'Peixes'].includes(profile.sign)) {
    spiritualGifts.push('Sensibilidade emocional e empatia');
  }
  
  if (profile.dominantChakra >= 6) {
    spiritualGifts.push('Conexão com níveis superiores de consciência');
  }
  
  // Identifica áreas de crescimento
  const growthAreas: string[] = [];
  
  if (elementCounts[elementCounts.length - 1].count < 2) {
    growthAreas.push(`Desenvolver o elemento ${deficient}`);
  }
  
  if (profile.dominantChakra <= 3) {
    growthAreas.push('Elevar a consciência para chakras superiores');
  }
  
  if (conflicts.length > 0) {
    growthAreas.push('Integrar energias aparentemente opostas');
  }
  
  return {
    correlations,
    primaryInsight,
    secondaryInsights: correlations
      .filter(c => c.correlationType === 'strong')
      .map(c => c.insight),
    elementalBalance: {
      dominant,
      deficient,
      recommendation: `Fortaleça ${deficient} através de: ${getElementPractice(deficient)}`
    },
    chakraElementalRelation: `Seu chakra ${getChakraInfo(profile.dominantChakra)?.name} está associado ao elemento ${CHAKRA_ELEMENT_MAP[profile.dominantChakra]}`,
    spiritualGifts,
    growthAreas
  };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna prática recomendada para um elemento
 */
function getElementPractice(element: ElementType): string {
  const practices: Record<ElementType, string> = {
    'Agua': 'banhos, meditação perto de água, trabalho emocional',
    'Fogo': 'exercício físico, respiração, práticas de coragem',
    'Terra': 'conexão com natureza, yoga, aterramento',
    'Ar': 'respiração, meditação transcendental, trabalho mental'
  };
  return practices[element] || 'práticas espirituais gerais';
}

/**
 * Calcula score de compatibilidade entre dois elementos
 */
function getElementCompatibilityScore(element1: ElementType, element2: ElementType): number {
  return ELEMENT_COMPATIBILITY[element1]?.[element2] || 1;
}

/**
 * Retorna elementos complementares a um dado elemento
 */
function getComplementaryElements(element: ElementType): ElementType[] {
  const allElements = getAllElements();
  return allElements.filter(e => 
    e !== element && ELEMENT_COMPATIBILITY[element]?.[e] >= 2
  );
}

/**
 * Retorna elementos em conflito com um dado elemento
 */
function getConflictingElements(element: ElementType): ElementType[] {
  const allElements = getAllElements();
  return allElements.filter(e => 
    e !== element && ELEMENT_COMPATIBILITY[element]?.[e] === 1
  );
}

/**
 * Gera matriz de compatibilidade elemental completa
 */
function generateElementCompatibilityMatrix(): Record<ElementType, Record<ElementType, string>> {
  const elements = getAllElements();
  const matrix: Record<ElementType, Record<ElementType, string>> = {} as any;
  
  for (const e1 of elements) {
    matrix[e1] = {} as Record<ElementType, string>;
    for (const e2 of elements) {
      const score = ELEMENT_COMPATIBILITY[e1]?.[e2] || 1;
      if (score === 3) matrix[e1][e2] = 'Excelente';
      else if (score === 2) matrix[e1][e2] = 'Bom';
      else matrix[e1][e2] = 'Tensão';
    }
  }
  
  return matrix;
}
