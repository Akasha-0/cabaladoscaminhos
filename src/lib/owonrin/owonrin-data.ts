// Owonrin Data - Ifa Divination System - Cabala Dos Caminhos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Owonrin data interface
 */
export interface OwonrinData {
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
  ebos: OwonrinEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

/**
 * Ebo (sacrifice) structure for Owonrin
 */
export interface OwonrinEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

/**
 * Complete Owonrin data
 */
export const owonrinData: OwonrinData = {
  id: 'owonrin-016',
  name: 'Owonrin',
  namePt: 'Owonrin - A Tempestade',
  nameEn: 'Owonrin - The Storm',
  yoruba: 'Òwónrín',
  numero: 16,
  simbolo: '☲',
  linhas: [false, true, true, true, true, false],
  significado: 'Tempestade, limpeza, purificacao, renovacao',
  description:
    'Owonrin é o.decimo sexto Odu do Merindilogun, representando o poder das tempestades, da limpeza e da purificação. Simboliza a transformação através da agitação, a renovação através da destruição do antigo, e a sabedoria de navegar através de momentos de caos com serenidade interior. Quando Owonrin aparece, indica que uma tempestade está chegando - não para destruir, mas para limpar o ambiente espiritual e preparar o caminho para uma nova era de clareza e propósito.',
  keywords: ['storm', 'purification', 'cleansing', 'renewal', 'transformation', 'turbulence', 'clarity'],
  oduPrinciples: ['Tempestade', 'Purificação', 'Renovação', 'Transformação', 'Limpeza', 'Clareza'],
  spiritualGuidance: [
    'A tempestade passa, mas a alma permanece.',
    'Permita que o vento carregue o que não serve mais.',
    'Encontre paz interior no meio do caos exterior.',
    'A purificação vem através da experiência, não da evitação.',
    'Após a chuva, vem a claridade.',
  ],
  ritualPractices: [
    'Ebo de limpeza para remover energias densas',
    'Oferendas a Ogun',
    'Ritual de banimento sob a chuva',
    'Purificação com agua de chuva abençoada',
    'Oferecimento de akoko leaves',
  ],
  ebos: [
    {
      tipo: 'Ebo de Purificação',
      descricao: 'Sacrifício para limpeza energética e remoção de blockages',
      elementos: ['folhas de akoko', 'agua de chuva', 'kola nut', 'ogbono', 'palma oil'],
    },
    {
      tipo: 'Ebo de Proteção',
      descricao: 'Sacrifício para proteção durante momentos de transição',
      elementos: ['ferro de Ogun', 'garri', 'mel de abelha', 'dende oil', 'akoko leaves'],
    },
    {
      tipo: 'Ebo de Renovação',
      descricao: 'Sacrifício para marcar um novo começo após a tempestade',
      elementos: ['coco fresco', 'farinha de inhame', 'novas sementes', 'ogbono', 'alecrim'],
    },
  ],
  quizilas: [
    'Não enfrentar a tempestade sem preparação espiritual',
    'Não ignorar os sinais de transformação iminente',
    'Respeitar o poder destrutivo e criativo da natureza',
    'Não realizar rituais durante furacões ou raios',
    'Manter respeito pelos elementos naturais',
  ],
  orixas: ['Ogun', 'Shango', 'Obatala', 'Olodumare'],
  sacredFrequencies: ['432 Hz (Purificação)', '528 Hz (Renovação)', '741 Hz (Transformação)', '963 Hz (Clareza)'],
  elements: ['Tempestade', 'Água', 'Fogo', 'Ar', 'Força Transformadora'],
  dayOfWeek: 'Quarta-feira',
  colors: ['#4A90D9', '#2C3E50', '#1ABC9C', '#3498DB'],
};

/**
 * Get all Owonrin data
 */
export function getData(): OwonrinData {
  return owonrinData;
}

/**
 * Get Owonrin by identifier
 */
export function getOwonrinById(id: string): OwonrinData | undefined {
  if (id === owonrinData.id) {
    return owonrinData;
  }
  return undefined;
}

/**
 * Get all Quizilas (taboos/prohibitions) for Owonrin
 */
export function getQuizilas(): string[] {
  return owonrinData.quizilas;
}

/**
 * Get all Ebós (sacrifices) for Owonrin
 */
export function getEbós(): OwonrinEbo[] {
  return owonrinData.ebos;
}

/**
 * Get all Orixás associated with Owonrin
 */
export function getOrixas(): string[] {
  return owonrinData.orixas;
}

/**
 * Get sacred frequencies for Owonrin
 */
export function getSacredFrequencies(): string[] {
  return owonrinData.sacredFrequencies;
}

export default getData;