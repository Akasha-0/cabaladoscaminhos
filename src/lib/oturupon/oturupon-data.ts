// Oturupon Data - Ifa Divination System - Cabala Dos Caminhos

/**
 * Oturupon data interface
 */
export interface OturuponData {
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
  ebos: OturuponEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Oturupon
 */
export interface OturuponEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Oturupon data
 */
export const oturuponData: OturuponData = {
  id: 'oturupon-001',
  name: 'Oturupon',
  namePt: 'Oturupon - A Paz Absoluta',
  nameEn: 'Oturupon - Absolute Peace',
  yoruba: 'Òtúrúpọ̀n',
  numero: 16,
  simbolo: '☱',
  linhas: [true, false, false, false],
  significado: 'Paz absoluta, luz total, confirmação divina, tudo está bem',
  description:
    'Oturupon é o Odu da paz completa e da luz absoluta. Representa a confirmação dos Deuses e a certeza de que tudo está bem no caminho espiritual. Quando Oturupon aparece, o universo conspira a favor do consulente, trazendo harmonia, cura e a certeza do propósito divino. É o Odu que encerra ciclos de luta e abre as portas para a serenidade, a sabedoria e a proteção máxima.',
  keywords: ['paz', 'luz', 'cura', 'harmonia', 'proteção', 'confirmação', 'sabedoria', 'silêncio'],
  oduPrinciples: ['Paz', 'Unificação', 'Luz Interior', 'Confirmação', 'Serenidade', 'Proteção Divina'],
  spiritualGuidance: [
    'A paz que procura está dentro de você; encontre o silêncio sagrado.',
    'Tudo aquilo que pediu foi ouvido; confie no tempo divino.',
    'Sua luz interior brilha mais forte do que qualquer escuridão.',
    'Aceitação e gratidão são as chaves da sua transformação.',
    'A sabedoria supreme vem do silêncio e da escuta profunda.',
  ],
  ritualPractices: [
    'Ebo de Paz e Harmonização',
    'Oferendas a Oxalá',
    'Banho de agua de cheiro e flores brancas',
    'Meditação em silêncio profundo',
    'Acendimento de velas brancas ao entardecer',
  ],
  ebos: [
    {
      tipo: 'Ebo de Paz Interior',
      descricao: 'Sacrifício para acalmar a mente e trazer harmonia espiritual',
      elementos: ['flores brancas', 'agua de cheiro', 'coco ralado', 'farinha de milho', 'mel'],
    },
    {
      tipo: 'Ebo de Cura e Proteção',
      descricao: 'Sacrifício para proteção maxima e cura de enfermidades',
      elementos: ['oturupon frasco', 'alecrim branco', 'manjericao', 'agua de coco', 'velas brancas'],
    },
    {
      tipo: 'Ebo de Agradecimento',
      descricao: 'Sacrifício de gratidão pelas bençãos recebidas',
      elementos: ['frutas docês', 'leite de coco', 'fuba de quiabo', 'flores brancas', 'ouro'],
    },
  ],
  quizilas: [
    'Não duvidar da propria espiritualidade',
    'Evitar orgulho e arrogância',
    'Não falar mal dos mais velhos',
    'Respeitar o silêncio sagrado',
    'Manter as práticas espirituais em dia',
    'Evitar ambientes de confusão e conflito',
  ],
  orixas: ['Olodumare', 'Oxalá', 'Orunmila', 'Nanã'],
  sacredFrequencies: ['528 Hz (Criação)', '639 Hz (Conexão)', '741 Hz (Expressão)', '963 Hz (Unidade)'],
  elements: ['Luz', 'Ar', 'Éter', 'Paz'],
  dayOfWeek: 'Sexta-feira',
  colors: ['#FFFFFF', '#F5F5DC', '#FFFAFA'],
};

/**
 * Get all Oturupon data
 */
export function getData(): OturuponData {
  return oturuponData;
}

/**
 * Get Oturupon by identifier
 */
export function getOturuponById(id: string): OturuponData | undefined {
  if (id === oturuponData.id) return oturuponData;
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Oturupon
 */
export function getQuizilas(): string[] {
  return oturuponData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Oturupon
 */
export function getEbós(): OturuponEbo[] {
  return oturuponData.ebos;
}

/**
 * Get all Orixás associated with Oturupon
 */
export function getOrixas(): string[] {
  return oturuponData.orixas;
}

/**
 * Get sacred frequencies for Oturupon
 */
export function getSacredFrequencies(): string[] {
  return oturuponData.sacredFrequencies;
}

export default getData;