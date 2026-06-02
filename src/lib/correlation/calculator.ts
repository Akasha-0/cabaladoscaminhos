// fallow-ignore-next-line complexity
/**
 * Calculadora do Sistema de Correlações Espirituais
 * Cabala dos Caminhos - Engine de Correlações
 * 
 * Funções para calcular:
 * - Caminho de Vida Cabalístico
 * - Odu de Nascimento (Ifá)
 * - Signo Solar
 * - Configuração de Chakras
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
  getOduInfo,
  getZodiacInfo,
  isMasterNumber
} from './definitions';

// ============================================
// TIPOS DE ENTRADA E SAÍDA
// ============================================

export interface BirthData {
  birthDate: Date;
  name?: string;
}

export interface CabalisticPathResult {
  number: number;
  isMaster: boolean;
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
}

export interface BirthOduResult {
  odu: string;
  number: number;
  meaning: string;
  preceitos: string[];
  element: ElementType;
  orixas: string[];
}

export interface ZodiacSignResult {
  sign: SignType;
  element: ElementType;
  ruler: string;
  modality: string;
  keywords: string[];
  chakra: ChakraLevel;
}

export interface ChakraConfigResult {
  dominantChakra: ChakraLevel;
  secondaryChakras: ChakraLevel[];
  deficientChakras: ChakraLevel[];
  balanced: boolean;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Soma os dígitos de um número até остатка single digit
 */
function sumDigits(num: number): number {
  return String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

/**
 * Reduz um número à sua raiz (1-9) preservando números mestres
 */
function reduceToRoot(num: number): number {
  // Se é um número mestre, retorna diretamente
  if ([11, 22, 33].includes(num)) {
    return num;
  }
  
  // Se já é um dígito único, retorna
  if (num <= 9) {
    return num;
  }
  
  // Reduz recursivamente
  return reduceToRoot(sumDigits(num));
}

/**
 * Converte data para string YYYYMMDD
 */
function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Soma todos os dígitos de uma data (YYYYMMDD -> sum)
 */
function sumDateDigits(date: Date): number {
  const dateStr = dateToString(date);
  return dateStr.split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

// ============================================
// CÁLCULO DO CAMINHO DE VIDA CABALÍSTICO
// ============================================

/**
 * Calcula o Caminho de Vida Cabalístico a partir da data de nascimento
 * 
 * Método: Soma todos os dígitos da data (YYYYMMDD) e reduz até 1-9 ou número mestre
 * 
 * @param birthDate - Data de nascimento
 * @returns Resultado com número, se é mestre, e informações detalhadas
 */
function calculateCabalisticPath(birthDate: Date): CabalisticPathResult {
  // Soma todos os dígitos da data
  const total = sumDateDigits(birthDate);
  
  // Reduz à raiz (preservando números mestres)
  const reduced = reduceToRoot(total);
  
  // Busca informações do número
  const info = getCabalisticInfo(reduced);
  
  return {
    number: reduced,
    isMaster: isMasterNumber(reduced),
    name: info?.name || 'Desconhecido',
    description: info?.description || `Número ${reduced}`,
    strengths: info?.strengths || [],
    challenges: info?.challenges || []
  };
}

// ============================================
// CÁLCULO DO ODU DE NASCIMENTO
// ============================================

/**
 * Calcula o Odu de Nascimento (Ifá) a partir da data de nascimento
 * 
 * Método: Soma dia + mês, se > 16 soma os dígitos
 * O resultado indica qual dos 16 Odus rege o nascimento
 * 
 * @param birthDate - Data de nascimento
 * @returns Resultado com Odu e informações tradicionais
 */
function calculateBirthOdu(birthDate: Date): BirthOduResult {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  
  // Soma dia + mês
  let oduNumber = day + month;
  
  // Se > 16, soma os dígitos até ficar <= 16
  while (oduNumber > 16) {
    oduNumber = sumDigits(oduNumber);
  }
  
  // Busca o Odu pelo número
  const oduEntry = Object.entries(ODUS).find(([_, odu]) => odu.number === oduNumber);
  const oduName = oduEntry?.[0] || 'Alafia';
  const oduInfo = oduEntry?.[1];
  
  return {
    odu: oduName,
    number: oduNumber,
    meaning: oduInfo?.meaning || 'Significado desconhecido',
    preceitos: oduInfo?.preceitos || [],
    element: (oduInfo?.element as ElementType) || 'Terra',
    orixas: oduInfo?.orixas || []
  };
}

// ============================================
// DETERMINAÇÃO DO SIGNO SOLAR
// ============================================

/**
 * Determina o signo solar baseado na data de nascimento
 * 
 * @param birthDate - Data de nascimento
 * @returns Resultado com signo e características
 */
// fallow-ignore-next-line complexity
function getZodiacSign(birthDate: Date): ZodiacSignResult {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // Determina o signo baseado no dia e mês
  let sign: SignType;
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    sign = 'Aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    sign = 'Touro';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    sign = 'Gemeos';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    sign = 'Cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    sign = 'Leao';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    sign = 'Virgem';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    sign = 'Libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    sign = 'Escorpiao';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    sign = 'Sagitario';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    sign = 'Capricornio';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    sign = 'Aquario';
  } else {
    sign = 'Peixes';
  }
  
  const info = getZodiacInfo(sign);
  
  return {
    sign,
    element: (info?.element as ElementType) || 'Terra',
    ruler: info?.ruler || 'Desconhecido',
    modality: info?.modality || 'Unknown',
    keywords: info?.keywords || [],
    chakra: (info?.chakra as ChakraLevel) || 1
  };
}

// ============================================
// CONFIGURAÇÃO DE CHAKRAS
// ============================================

/**
 * Calcula a configuração de chakras baseada na data e nome
 * 
 * Método: Combina soma da data (para chakras inferiores) 
 * com vogais do nome (para chakras superiores)
 * 
 * @param birthDate - Data de nascimento
 * @param name - Nome completo (opcional)
 * @returns Configuração de chakras dominantes
 */
function calculateChakraConfig(birthDate: Date, name?: string): ChakraConfigResult {
  // Calcula números baseados na data
  const daySum = sumDigits(birthDate.getDate());
  const monthSum = sumDigits(birthDate.getMonth() + 1);
  const yearSum = sumDigits(birthDate.getFullYear());
  
  // Calcula chakras baseados na data (chakras 1-4)
  const baseChakra = ((daySum + monthSum) % 4) + 1;
  
  // Calcula chakras superiores baseados no nome (se fornecido)
  let nameChakra = 5;
  if (name) {
    const vowels = name.match(/[aeiouáéíóúâêîôûãõ]/gi) || [];
    const vowelSum = vowels.reduce((sum, v) => sum + v.charCodeAt(0), 0);
    nameChakra = ((vowelSum % 3) + 5) as ChakraLevel; // 5, 6, ou 7
  }
  
  // Determina chakras dominantes e deficientes
  const dominantChakra = Math.min(baseChakra, nameChakra) as ChakraLevel;
  const secondaryChakras = [5, 6, 7].filter(c => c !== nameChakra) as ChakraLevel[];
  
  // Identifica chakras potencialmente deficientes (os não alcançados)
  const allChakras: ChakraLevel[] = [1, 2, 3, 4, 5, 6, 7];
  const deficientChakras = allChakras.filter(c => c < dominantChakra) as ChakraLevel[];
  
  return {
    dominantChakra,
    secondaryChakras,
    deficientChakras,
    balanced: deficientChakras.length <= 2
  };
}

// ============================================
// CÁLCULO COMPLETO DO PERFIL
// ============================================

export interface CompleteProfileInput {
  birthDate: Date;
  name?: string;
}

export interface CompleteProfile {
  cabalisticPath: CabalisticPathResult;
  birthOdu: BirthOduResult;
  zodiacSign: ZodiacSignResult;
  chakraConfig: ChakraConfigResult;
  dominantElement: ElementType;
  primaryChakra: ChakraLevel;
}

/**
 * Calcula o perfil espiritual completo
 * 
 * Combina todos os cálculos em um perfil unificado
 * 
 * @param input - Dados de nascimento e nome
 * @returns Perfil espiritual completo
 */
function calculateCompleteProfile(input: CompleteProfileInput): CompleteProfile {
  const { birthDate, name } = input;
  
  // Calcula cada componente
  const cabalisticPath = calculateCabalisticPath(birthDate);
  const birthOdu = calculateBirthOdu(birthDate);
  const zodiacSign = getZodiacSign(birthDate);
  const chakraConfig = calculateChakraConfig(birthDate, name);
  
  // Determina elemento dominante (combina signo e Odu)
  const elementFromSign = zodiacSign.element;
  const elementFromOdu = birthOdu.element;
  
  // Se são iguais, usa esse; caso contrário, usa o do signo
  const dominantElement = elementFromSign === elementFromOdu 
    ? elementFromSign 
    : elementFromSign;
  
  // Determina chakra primário (do signo)
  const primaryChakra = zodiacSign.chakra;
  
  return {
    cabalisticPath,
    birthOdu,
    zodiacSign,
    chakraConfig,
    dominantElement,
    primaryChakra
  };
}

// ============================================
// FUNÇÕES DE ANÁLISE ADICIONAL
// ============================================

/**
 * Analisa compatibilidade entre número cabalístico e Odu
 */
function analyzeCabalisticOduCompatibility(
  cabalisticNumber: number, 
  oduNumber: number
): { compatible: boolean; notes: string } {
  const oduEntry = Object.values(ODUS).find(o => o.number === oduNumber);
  
  if (!oduEntry) {
    return { compatible: false, notes: 'Odu não encontrado' };
  }
  
  const isCompatible = oduEntry.compatibleNumerology.includes(cabalisticNumber);
  const isIncompatible = oduEntry.incompatibleNumerology.includes(cabalisticNumber);
  
  if (isCompatible) {
    return { 
      compatible: true, 
      notes: 'Excelente compatibilidade entre seu número e seu Odu' 
    };
  }
  
  if (isIncompatible) {
    return { 
      compatible: false, 
      notes: 'Seu número e Odu têm energias contrastantes - trabalho espiritual pode ser necessário' 
    };
  }
  
  return { 
    compatible: true, 
    notes: 'Compatibilidade neutra entre número e Odu' 
  };
}

/**
 * Analisa harmonia entre signo e número cabalístico
 */
function analyzeZodiacCabalisticHarmony(
  sign: SignType, 
  cabalisticNumber: number
): { harmony: 'high' | 'medium' | 'low'; notes: string } {
  const zodiacInfo = getZodiacInfo(sign);
  const element = zodiacInfo?.element;
  
  const cabalisticInfo = getCabalisticInfo(cabalisticNumber);
  const compatibleElements = cabalisticInfo?.compatibleElements || [];
  
  if (compatibleElements.includes(element as ElementType)) {
    return { 
      harmony: 'high', 
      notes: 'Seu signo e número cabalístico estão em harmonia elemental' 
    };
  }
  
  // Verifica se o chakra do signo corresponde ao número
  const signChakra = zodiacInfo?.chakra || 1;
  if (signChakra === cabalisticNumber || Math.abs(signChakra - cabalisticNumber) <= 2) {
    return { 
      harmony: 'medium', 
      notes: 'Seu signo e número têm relação moderada' 
    };
  }
  
  return { 
    harmony: 'low', 
    notes: 'Seu signo e número podem ter tensões a serem trabalhadas' 
  };
}

/**
 * Retorna o elemento predominante considerando múltiplas fontes
 */
function getPredominantElement(
  signElement: ElementType,
  oduElement: ElementType,
  cabalisticElement?: ElementType
): ElementType {
  // Se todos são iguais, retorna esse
  if (signElement === oduElement && oduElement === (cabalisticElement || signElement)) {
    return signElement;
  }
  
  // Se signo e Odu são iguais, retorna esse
  if (signElement === oduElement) {
    return signElement;
  }
  
  // Conta ocorrências
  const counts: Record<ElementType, number> = {
    'Agua': 0,
    'Fogo': 0,
    'Terra': 0,
    'Ar': 0
  };
  
  counts[signElement]++;
  counts[oduElement]++;
  if (cabalisticElement) counts[cabalisticElement]++;
  
  // Retorna o mais frequente
  const entries = Object.entries(counts) as [ElementType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  
  return entries[0][0];
}

// ============================================
