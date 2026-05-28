// Logbara Data - Ifa Divination System - Cabala Dos Caminhos
 
 

/**
 * Logbara data interface
 */
export interface LogbaraData {
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
  ebos: LogbaraEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Logbara
 */
export interface LogbaraEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Logbara data
 */
export const logbaraData: LogbaraData = {
  id: 'logbara-010',
  name: 'Logbara',
  namePt: 'Logbara - A Grande Luz',
  nameEn: 'Logbara - The Great Light',
  yoruba: 'Logbárá',
  numero: 10,
  simbolo: '☱',
  linhas: [true, true, true, true],
  significado: 'Luz ancestral, ancestralidade, conexão, purificação',
  description:
    'Logbara é o décimo Odu do Merindilogun, representando a luz ancestral e a conexão com os mortos. Simboliza sabedoria herdada, purificação kármica e comunicação com os ancestrais. Quando Logbara aparece, há uma abertura para receive guidance from the ancestors and perform cleansing rituals that remove generational burdens. Fala da luz que brilha através das gerações, do sangue que carrega sabedoria antiga, e da necessidade de honrar aqueles que vieram antes.',
  keywords: ['ancestor', 'light', 'purification', 'ancestry', 'karmic cleansing', 'wisdom', 'legacy'],
  oduPrinciples: ['Ancestralidade', 'Luz', 'Purificação', 'Legado', 'Tradição', 'Comunicação'],
  spiritualGuidance: [
    'Conecte-se com seus ancestrais através de rituais de honra e memória.',
    'A purificação viene através do reconhecimento das bênçãos herdadas.',
    'Reconheça a sabedoria que flui através das gerações.',
    'Libere fardos familiares através de rituais de purificação.',
    'A luz ancestral ilumina seu caminho quando você a honra.',
  ],
  ritualPractices: [
    'Ebo de purificação ancestral',
    'Oferendas aos Egungun',
    'Ritual de limpeza kármica',
    'Meditação com defumação',
    'Sacrifício de sangue ritual',
  ],
  ebos: [
    {
      tipo: 'Ebo de Purificação',
      descricao: 'Sacrifício para limpar fardos ancestrais e bloqueios',
      elementos: ['galo branco', 'akara frito', 'logbara frasco', 'alecrim', 'água de flor de laranjeira'],
    },
    {
      tipo: 'Ebo de Honra aos Ancestrais',
      descricao: 'Sacrifício para agradecer e honrar os mortos',
      elementos: ['akara frito', 'milho torrado', 'logbara frasco', 'dendes', 'coco fresco'],
    },
    {
      tipo: 'Ebo de Libertação',
      descricao: 'Sacrifício para libertar padrões familiares repetitivos',
      elementos: ['cabrito branco', 'logbara frasco', 'farinha de inhame', 'mel de abelha', 'sal marinho'],
    },
  ],
  quizilas: [
    'Não fazer oferendas aos domingos',
    'Não consumir álcool antes de rituais',
    'Respeitar os mortos e não profanar túmulos',
    'Não ignorar avisos dos ancestrais',
    'Manter a limpeza espiritual antes de rituais',
  ],
  orixas: ['Olodumare', 'Egungun', 'Ogun', 'Osanyin'],
  sacredFrequencies: ['396 Hz (Libertação)', '417 Hz (Mudança)', '528 Hz (Criação)', '741 Hz (Purificação)'],
  elements: ['Luz', 'Fogo', 'Terra', 'Ancestralidade'],
  dayOfWeek: 'Terça-feira',
  colors: ['#FFFAF0', '#FFA500', '#8B0000'],
};

/**
 * Get all Logbara data
 */
export function getData(): LogbaraData {
  return logbaraData;
}

/**
 * Get Logbara by identifier
 */
export function getLogbaraById(id: string): LogbaraData | undefined {
  if (id === logbaraData.id) return logbaraData;
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Logbara
 */
export function getQuizilas(): string[] {
  return logbaraData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Logbara
 */
export function getEbós(): LogbaraEbo[] {
  return logbaraData.ebos;
}

/**
 * Get all Orixás associated with Logbara
 */
export function getOrixas(): string[] {
  return logbaraData.orixas;
}

/**
 * Get sacred frequencies for Logbara
 */
export function getSacredFrequencies(): string[] {
  return logbaraData.sacredFrequencies;
}

export default getData;