// Otura Data - Ifa Divination System - Cabala Dos Caminhos
 
 

/**
 * Otura data interface
 */
export interface OturaData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  yoruba: string;
  numero: number;
  simbolo: string;
  linhas: boolean[];
  significado: string;
  description: string;
  keywords: string[];
  oduPrinciples: string[];
  spiritualGuidance: string[];
  ritualPractices: string[];
  ebos: OturaEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Otura
 */
export interface OturaEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Otura data
 */
export const oturaData: OturaData = {
  id: 'otura-012',
  name: 'Otura',
  namePt: 'Otura - O Inesperado',
  nameEn: 'Otura - The Unexpected',
  yoruba: 'Òtúrá',
  numero: 12,
  simbolo: '☴',
  linhas: [true, false, true, true],
  significado: 'Revelação, insight, transformação interior, mistério',
  description:
    'Otura é o décimo segundo Odu do Merindilogun, representando o princípio da revelação e do insight profundo. Simboliza a capacidade de ver além do visível, de compreender mistérios ocultos e de transformar-se através do conhecimento sagrado. Quando Otura aparece, o consulente recebe a visão interior para discernir verdades escondidas e navegar por território desconhecido com sabedoria divina.',
  keywords: ['revelation', 'insight', 'transformation', 'mystery', 'inner vision', 'wisdom', 'discernment'],
  oduPrinciples: ['Revelação', 'Conhecimento oculto', 'Visão interior', 'Transformação', 'Mistério', 'Discernimento'],
  spiritualGuidance: [
    'Confie na sua intuição; ela revela verdades que os olhos não podem ver.',
    'O momento de transformação chega quando você aceita o desconhecido.',
    'A sabedoria surge do silêncio e da reflexão profunda.',
    'Desvende os mistérios através da prática espiritual dedicada.',
    'Permita que a luz da revelação ilumine seu caminho interior.',
  ],
  ritualPractices: [
    'Ebo de Visão para abrir o terceiro olho',
    'Oferendas a Orunmila',
    'Meditação em silêncio profundo',
    'Purificação com ervas sagradas',
    'Oferecimento de obi e kola nut',
  ],
  ebos: [
    {
      tipo: 'Ebo de Revelação',
      descricao: 'Sacrifício para abrir a visão interior e revelar verdades ocultas',
      elementos: ['obi segar', 'kola nut', 'mel de abelha', 'ervas sagradas', 'água de.flowers'],
    },
    {
      tipo: 'Ebo de Transformação',
      descricao: 'Sacrifício para facilitar mudanças internas profundas',
      elementos: ['ogbin', 'ewo igi', 'otura frasco', 'incenso', 'óleo de coco'],
    },
    {
      tipo: 'Ebo de Mistério',
      descricao: 'Sacrifício para proteção durante explorações do desconhecido',
      elementos: ['cabrito branco', 'otura frasco', 'alecrim', 'sal marinho', 'vela preta'],
    },
  ],
  quizilas: [
    'Não ignorar visões e sonhos proféticos',
    'Não revelar segredos sagrados a pessoas indignas',
    'Respeitar os mistérios do universo',
    'Não usar o dom da visão para fins egoístas',
    'Manter práticas espirituais em segredo quando necessário',
  ],
  orixas: ['Orunmila', 'Olodumare', 'Ogun', 'Osun'],
  sacredFrequencies: ['396 Hz (Libertação)', '417 Hz (Facilitação)', '528 Hz (Transformação)', '741 Hz (Despertar)'],
  elements: ['Ar', 'Espírito', 'Intuição', 'Transformação Feminina'],
  dayOfWeek: 'Quarta-feira',
  colors: ['#9932CC', '#8A2BE2', '#4B0082'],
};

/**
 * Get all Otura data
 */
export function getData(): OturaData {
  return oturaData;
}

/**
 * Get Otura by identifier
 */
export function getOturaById(id: string): OturaData | undefined {
  if (id === oturaData.id) return oturaData;
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Otura
 */
export function getQuizilas(): string[] {
  return oturaData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Otura
 */
export function getEbós(): OturaEbo[] {
  return oturaData.ebos;
}

/**
 * Get all Orixás associated with Otura
 */
export function getOrixas(): string[] {
  return oturaData.orixas;
}

/**
 * Get sacred frequencies for Otura
 */
export function getSacredFrequencies(): string[] {
  return oturaData.sacredFrequencies;
}

export default getData;