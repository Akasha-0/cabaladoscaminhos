/**
 * Geração de Perfil Espiritual Consolidado
 * Cabala dos Caminhos - Engine de Correlações
 * 
 * Combina todos os sistemas em um perfil unificado
 * com insights personalizados e orientações práticas
 */

import {
  ElementType,
  SignType,
  ChakraLevel,
  getCabalisticInfo,
  getElementInfo,
  getOduInfo,
  getZodiacInfo,
  getChakraInfo,
  CABALISTIC_NUMBERS,
  ODUS,
  ZODIAC_SIGNS,
  CHAKRAS
} from '../definitions';

import {
  calculateCabalisticPath,
  calculateBirthOdu,
  getZodiacSign,
  calculateChakraConfig,
  calculateCompleteProfile,
  analyzeCabalisticOduCompatibility,
  analyzeZodiacCabalisticHarmony
} from '../calculator';

import {
  generateCrossSystemAnalysis,
  correlateNumerologyElement,
  correlateOduNumerology,
  correlateZodiacElement,
  correlateChakraElement,
  correlateZodiacChakra,
  CrossSystemInsights,
  FullProfileCorrelation
} from '../correlation-matrix';

// ============================================
// TIPOS DO PERFIL CONSOLIDADO
// ============================================

export interface ConsolidatedProfile {
  // Dados básicos
  birthDate: Date;
  name?: string;
  calculatedAt: Date;
  
  // Componentes individuais
  cabalisticPath: {
    number: number;
    isMaster: boolean;
    name: string;
    description: string;
    strengths: string[];
    challenges: string[];
    affirmation: string;
    spiritualLesson: string;
  };
  
  birthOdu: {
    name: string;
    number: number;
    meaning: string;
    preceitos: string[];
    element: ElementType;
    orixas: string[];
  };
  
  zodiacSign: {
    name: SignType;
    element: ElementType;
    ruler: string;
    modality: string;
    keywords: string[];
    chakra: ChakraLevel;
  };
  
  chakraConfig: {
    dominant: ChakraLevel;
    secondary: ChakraLevel[];
    deficient: ChakraLevel[];
    balanced: boolean;
  };
  
  // Elemento dominante
  dominantElement: {
    element: ElementType;
    characteristics: string[];
    strength: string;
    challenge: string;
  };
  
  // Correlações
  correlations: {
    numerologyElement: string;
    oduNumerology: string;
    zodiacElement: string;
    chakraElement: string;
    zodiacChakra: string;
    overallHarmony: 'high' | 'medium' | 'low';
  };
  
  // Insights cruzados
  crossSystemInsights: {
    primaryInsight: string;
    secondaryInsights: string[];
    spiritualGifts: string[];
    growthAreas: string[];
    elementalBalance: {
      dominant: ElementType;
      deficient: ElementType;
      recommendation: string;
    };
  };
  
  // Orientações práticas
  guidance: {
    dailyPractice: string[];
    affirmations: string[];
    meditation: {
      mantra: string;
      focus: string;
      duration: string;
    };
    elementalWork: {
      strengthen: string[];
      balance: string[];
    };
    spiritualRituals: string[];
  };
  
  // Preceitos e recomendações
  precepts: {
    fromOdu: string[];
    fromNumerology: string[];
    fromZodiac: string[];
    unifiedPrecepts: string[];
  };
  
  // Mapa de conexões
  connectionMap: {
    strengths: string[];
    challenges: string[];
    patterns: string[];
    recommendations: string[];
  };
}

export interface QuickProfile {
  summary: string;
  dominantNumber: number;
  dominantOdu: string;
  dominantSign: SignType;
  dominantElement: ElementType;
  primaryChakra: ChakraLevel;
  keyInsight: string;
}

// ============================================
// PERFIL CONSOLIDADO
// ============================================

/**
 * Gera perfil espiritual consolidado completo
 * 
 * Este é o produto final do engine de correlações -
 * um perfil unificado que integra todos os sistemas
 * espirituais com insights práticos
 * 
 * @param birthDate - Data de nascimento
 * @param name - Nome completo (opcional)
 * @returns Perfil espiritual completo
 */
export function generateConsolidatedProfile(
  birthDate: Date,
  name?: string
): ConsolidatedProfile {
  // Calcula perfil completo
  const profile = calculateCompleteProfile({ birthDate, name });
  
  // Obtém informações detalhadas
  const cabalisticInfo = getCabalisticInfo(profile.cabalisticPath.number);
  const oduInfo = getOduInfo(profile.birthOdu.odu);
  const zodiacInfo = getZodiacInfo(profile.zodiacSign.sign);
  const elementInfo = getElementInfo(profile.dominantElement);
  
  // Gera correlações
  const numerologyElementCorr = correlateNumerologyElement(
    profile.cabalisticPath.number,
    profile.dominantElement
  );
  const oduNumerologyCorr = correlateOduNumerology(
    profile.birthOdu.odu,
    profile.cabalisticPath.number
  );
  const zodiacElementCorr = correlateZodiacElement(
    profile.zodiacSign.sign,
    profile.dominantElement
  );
  const chakraElementCorr = correlateChakraElement(
    profile.chakraConfig.dominantChakra,
    profile.dominantElement
  );
  const zodiacChakraCorr = correlateZodiacChakra(
    profile.zodiacSign.sign,
    profile.chakraConfig.dominantChakra
  );
  
  // Calcula harmonia geral
  const correlationTypes = [
    numerologyElementCorr.correlationType,
    oduNumerologyCorr.correlationType,
    zodiacElementCorr.correlationType,
    chakraElementCorr.correlationType,
    zodiacChakraCorr.correlationType
  ];
  
  const strongCount = correlationTypes.filter(t => t === 'strong').length;
  const conflictCount = correlationTypes.filter(t => t === 'conflict').length;
  
  let overallHarmony: 'high' | 'medium' | 'low' = 'medium';
  if (strongCount >= 3 && conflictCount === 0) overallHarmony = 'high';
  if (conflictCount > 0 || strongCount <= 1) overallHarmony = 'low';
  
  // Gera insights cruzados
  const fullCorrelation: FullProfileCorrelation = {
    cabalisticNumber: profile.cabalisticPath.number,
    odu: profile.birthOdu.odu,
    sign: profile.zodiacSign.sign,
    element: profile.dominantElement,
    dominantChakra: profile.chakraConfig.dominantChakra
  };
  
  const crossInsights = generateCrossSystemAnalysis(fullCorrelation);
  
  // Gera orientações práticas
  const guidance = generateGuidance(profile, crossInsights);
  
  // Gera preceitos unificados
  const precepts = generateUnifiedPrecepts(profile);
  
  // Gera mapa de conexões
  const connectionMap = generateConnectionMap(profile, crossInsights);
  
  return {
    birthDate,
    name,
    calculatedAt: new Date(),
    
    cabalisticPath: {
      number: profile.cabalisticPath.number,
      isMaster: profile.cabalisticPath.isMaster,
      name: profile.cabalisticPath.name,
      description: profile.cabalisticPath.description,
      strengths: profile.cabalisticPath.strengths,
      challenges: profile.cabalisticPath.challenges,
      affirmation: cabalisticInfo?.affirmation || '',
      spiritualLesson: cabalisticInfo?.spiritualLesson || ''
    },
    
    birthOdu: {
      name: profile.birthOdu.odu,
      number: profile.birthOdu.number,
      meaning: profile.birthOdu.meaning,
      preceitos: profile.birthOdu.preceitos,
      element: profile.birthOdu.element,
      orixas: profile.birthOdu.orixas
    },
    
    zodiacSign: {
      name: profile.zodiacSign.sign,
      element: profile.zodiacSign.element,
      ruler: profile.zodiacSign.ruler,
      modality: profile.zodiacSign.modality,
      keywords: profile.zodiacSign.keywords,
      chakra: profile.zodiacSign.chakra
    },
    
    chakraConfig: {
      dominant: profile.chakraConfig.dominantChakra,
      secondary: profile.chakraConfig.secondaryChakras,
      deficient: profile.chakraConfig.deficientChakras,
      balanced: profile.chakraConfig.balanced
    },
    
    dominantElement: {
      element: profile.dominantElement,
      characteristics: elementInfo?.characteristics || [],
      strength: `Facilidade em ${elementInfo?.characteristics.slice(0, 2).join(' e ')}`,
      challenge: elementInfo?.deficiencyBehavior || ''
    },
    
    correlations: {
      numerologyElement: numerologyElementCorr.insight,
      oduNumerology: oduNumerologyCorr.insight,
      zodiacElement: zodiacElementCorr.insight,
      chakraElement: chakraElementCorr.insight,
      zodiacChakra: zodiacChakraCorr.insight,
      overallHarmony
    },
    
    crossSystemInsights: {
      primaryInsight: crossInsights.primaryInsight,
      secondaryInsights: crossInsights.secondaryInsights,
      spiritualGifts: crossInsights.spiritualGifts,
      growthAreas: crossInsights.growthAreas,
      elementalBalance: crossInsights.elementalBalance
    },
    
    guidance,
    precepts,
    connectionMap
  };
}

// ============================================
// PERFIL RÁPIDO
// ============================================

/**
 * Gera versão resumida do perfil para display rápido
 */
export function generateQuickProfile(
  birthDate: Date,
  name?: string
): QuickProfile {
  const profile = calculateCompleteProfile({ birthDate, name });
  
  const dominantNumber = profile.cabalisticPath.number;
  const dominantOdu = profile.birthOdu.odu;
  const dominantSign = profile.zodiacSign.sign;
  const dominantElement = profile.dominantElement;
  const primaryChakra = profile.zodiacSign.chakra;
  
  const zodiacInfo = getZodiacInfo(dominantSign);
  const elementInfo = getElementInfo(dominantElement);
  
  const keyInsight = `${zodiacInfo?.keywords[0] || 'Buscador'} com tendência ${elementInfo?.characteristics[0] || 'intuitivo'}. ` +
    `Caminho de Vida ${dominantNumber} orientado para ${getCabalisticInfo(dominantNumber)?.name || 'autoconhecimento'}.`;
  
  return {
    summary: `${getChakraInfo(primaryChakra)?.name} | ${elementInfo?.name} | ${dominantSign}`,
    dominantNumber,
    dominantOdu,
    dominantSign,
    dominantElement,
    primaryChakra,
    keyInsight
  };
}

// ============================================
// FUNÇÕES DE GERAÇÃO DE CONTEÚDO
// ============================================

function generateGuidance(
  profile: ReturnType<typeof calculateCompleteProfile>,
  insights: CrossSystemInsights
): ConsolidatedProfile['guidance'] {
  const dailyPractice: string[] = [];
  const affirmations: string[] = [];
  
  // Práticas baseadas no chakra dominante
  const chakraInfo = getChakraInfo(profile.chakraConfig.dominantChakra);
  if (chakraInfo) {
    dailyPractice.push(`Meditar com o mantra ${chakraInfo.mantra} focado no chakra ${chakraInfo.name}`);
    affirmations.push(chakraInfo.affirmation);
  }
  
  // Práticas baseadas no elemento
  const elementInfo = getElementInfo(profile.dominantElement);
  if (elementInfo) {
    dailyPractice.push(`Praticar ${getElementPractice(profile.dominantElement)}`);
  }
  
  // Práticas baseadas no número
  const numberInfo = getCabalisticInfo(profile.cabalisticPath.number);
  if (numberInfo) {
    affirmations.push(numberInfo.affirmation);
    dailyPractice.push(`Refletir sobre a lição espiritual: ${numberInfo.spiritualLesson}`);
  }
  
  // Adiciona práticas do Odu
  const oduInfo = getOduInfo(profile.birthOdu.odu);
  if (oduInfo) {
    dailyPractice.push(oduInfo.recommendations[0]);
  }
  
  // Elemental work
  const strengthenElements = insights.elementalBalance.dominant === profile.dominantElement
    ? []
    : [insights.elementalBalance.dominant];
  
  const balanceElements = getConflictingElements(profile.dominantElement);
  
  return {
    dailyPractice: dailyPractice.slice(0, 5),
    affirmations: [...new Set(affirmations)].slice(0, 3),
    meditation: {
      mantra: chakraInfo?.mantra || 'OM',
      focus: `Chakra ${chakraInfo?.name} - ${chakraInfo?.element}`,
      duration: '15-30 minutos'
    },
    elementalWork: {
      strengthen: strengthenElements,
      balance: balanceElements.slice(0, 2)
    },
    spiritualRituals: generateSpiritualRituals(profile)
  };
}

function generateUnifiedPrecepts(
  profile: ReturnType<typeof calculateCompleteProfile>
): ConsolidatedProfile['precepts'] {
  const fromOdu = profile.birthOdu.preceitos;
  const numberInfo = getCabalisticInfo(profile.cabalisticPath.number);
  const fromNumerology = numberInfo?.challenges.map(c => `Evitar ${c.toLowerCase()}`) || [];
  const zodiacInfo = getZodiacInfo(profile.zodiacSign.sign);
  
  // Preceitos unificados - elimina duplicatas e prioriza
  const allPrecepts = [...fromOdu, ...fromNumerology];
  const uniquePrecepts = [...new Set(allPrecepts)].slice(0, 5);
  
  return {
    fromOdu,
    fromNumerology,
    fromZodiac: zodiacInfo?.keywords.map(k => `Cultivar ${k.toLowerCase()}`) || [],
    unifiedPrecepts: uniquePrecepts
  };
}

function generateConnectionMap(
  profile: ReturnType<typeof calculateCompleteProfile>,
  insights: CrossSystemInsights
): ConsolidatedProfile['connectionMap'] {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const patterns: string[] = [];
  const recommendations: string[] = [];
  
  // Forces baseado no número
  const numberInfo = getCabalisticInfo(profile.cabalisticPath.number);
  if (numberInfo) {
    strengths.push(...numberInfo.strengths.map(s => `${profile.cabalisticPath.number}: ${s}`));
  }
  
  // Padrão element-chakra
  patterns.push(
    `Elemento ${profile.dominantElement} conectado ao chakra ${getChakraInfo(profile.chakraConfig.dominantChakra)?.name}`
  );
  
  // Padrão signo-elemento
  if (profile.zodiacSign.element === profile.dominantElement) {
    patterns.push(`Signo ${profile.zodiacSign.sign} nativo do elemento ${profile.dominantElement}`);
  }
  
  // Desafios do Odu
  const oduInfo = getOduInfo(profile.birthOdu.odu);
  if (oduInfo) {
    challenges.push(`Odu ${profile.birthOdu.odu}: ${oduInfo.preceitos[0]}`);
  }
  
  // Recomendações baseadas nos insights
  if (insights.growthAreas.length > 0) {
    recommendations.push(`Área de crescimento: ${insights.growthAreas[0]}`);
  }
  
  if (insights.spiritualGifts.length > 0) {
    recommendations.push(`Dom espiritual: ${insights.spiritualGifts[0]}`);
  }
  
  return { strengths, challenges, patterns, recommendations };
}

function generateSpiritualRituals(
  profile: ReturnType<typeof calculateCompleteProfile>
): string[] {
  const rituals: string[] = [];
  
  // Ritual baseado no chakra
  const chakraInfo = getChakraInfo(profile.chakraConfig.dominantChakra);
  if (chakraInfo) {
    rituals.push(`Meditação de ativação do ${chakraInfo.name} com visualização da cor ${chakraInfo.color}`);
  }
  
  // Ritual baseado no Odu
  const oduInfo = getOduInfo(profile.birthOdu.odu);
  if (oduInfo && oduInfo.orixas.length > 0) {
    rituals.push(`Ritual de conexão com ${oduInfo.orixas[0]}`);
  }
  
  // Ritual elemental
  rituals.push(`Ritual elemental de ${profile.dominantElement} - ${getElementRitual(profile.dominantElement)}`);
  
  return rituals;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getElementPractice(element: ElementType): string {
  const practices: Record<ElementType, string> = {
    'Agua': 'banhos ritualísticos e trabalho emocional',
    'Fogo': 'exercícios de respiração e ativação de poder pessoal',
    'Terra': 'práticas de aterramento e conexão com a natureza',
    'Ar': 'exercícios respiratórios e meditação mental'
  };
  return practices[element] || 'práticas espirituais variadas';
}

function getElementRitual(element: ElementType): string {
  const rituals: Record<ElementType, string> = {
    'Agua': 'banho de imersão com sais e ervas',
    'Fogo': 'visualização do fogo interior e candles',
    'Terra': 'earthing e oferenda à terra',
    'Ar': 'queima de incenso e defumação'
  };
  return rituals[element] || 'ritual de harmonização';
}

function getConflictingElements(element: ElementType): ElementType[] {
  const conflicts: Record<ElementType, ElementType[]> = {
    'Agua': ['Fogo'],
    'Fogo': ['Agua'],
    'Terra': ['Ar'],
    'Ar': ['Terra']
  };
  return conflicts[element] || [];
}

// ============================================
