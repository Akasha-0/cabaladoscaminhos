// Meji-Tura Data - Ifa Divination System - Cabala Dos Caminhos
 

// Meji-Tura Interface
export interface MejiTuraData {
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
  ebos: MejiTuraEbo[];
  quizilas: string[];
  orixas: string[];
  sacredFrequencies: string[];
  elements: string[];
  dayOfWeek: string;
  colors: string[];
}

// Ebo (Sacrifice) structure
export interface MejiTuraEbo {
  tipo: string;
  descricao: string;
  elementos: string[];
}

// Meji-Tura Data
export const mejiTuraData: MejiTuraData = {
  id: 'meji-tura-256',
  name: 'Meji-Tura',
  namePt: 'Meji-Tura - Duplo Destino Revelado',
  nameEn: 'Meji-Tura - Revealed Double Destiny',
  yoruba: 'Méjì-Túrá',
  numero: 256,
  simbolo: '⚊⚊|⚊⚊ + ⚊⚊|⚊⚊',
  linhas: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
  significado: 'Destino revelado, verdade oculta, iluminação espiritual, caminho da sabedoria',
  description:
    'Meji-Tura é um Odu de revelação e iluminação espiritual. Este Odu surge quando a energia de Meji se manifesta em sua forma reveladora, onde a verdade interior é trazida à luz. A combinação de Meji com Tura cria uma energia de conhecimento oculto e sabedoria ancestral. Este é um Odu de despertar, onde segredos são revelados e caminhos se iluminam. Meji-Tura ensina que a verdadeira sabedoria vem quando abrimos nossos olhos para ver além do véu da ilusão. Este Odu traz consigo a bênção da revelação divina e o guia através dos caminhos mais obscuros.',
  keywords: ['revelation', 'illumination', 'wisdom', 'truth', 'hidden', 'awakening', 'knowledge', 'ancestral', 'divine'],
  oduPrinciples: ['Revelação Divina', 'Iluminação', 'Verdade Oculta', 'Sabedoria Ancestral', 'Despertar Espiritual', 'Conhecimento'],
  spiritualGuidance: [
    'A verdade será revelada àqueles que buscam com coração puro.',
    'A iluminação vem quando você está pronto para receber.',
    'Segredos antigos serão descobertos no momento certo.',
    'O caminho se aclara quando você confia na sabedoria superior.',
    'A revelação é um presente para aqueles que são dignos.',
  ],
  ritualPractices: ['Ebo de revelação', 'Oferendas a Orunmila', 'Meditação de开门', 'Purificação espiritual'],
  ebos: [
    {
      tipo: 'Ebo de Revelação',
      descricao: 'Sacrifício para abrir os olhos espirituais e revelar a verdade',
      elementos: ['velas douradas', 'akará', 'vinho de palma', 'flores amarelas', 'incenso de sândalo'],
    },
    {
      tipo: 'Ebo de Iluminação',
      descricao: 'Sacrifício para trazer luz aos caminhos obscur',
      elementos: ['azeite de dendê', 'farinha de milho', 'velas brancas', 'ouro', 'água de rio'],
    },
    {
      tipo: 'Ebo Ancestral',
      descricao: 'Sacrifício para conectar com a sabedoria dos ancestrais',
      elementos: ['cabrito branco', 'vinho de palma', 'obí', 'ekura', 'roupas brancas', 'colares de contas'],
    },
  ],
  quizilas: [
    'Não esconder a verdade de si mesmo',
    'Não recusar o conhecimento oferecido',
    'Respeitar o mistério divino',
    'Não usar o conhecimento para dañar',
    'Manter a humildade diante da sabedoria',
  ],
  orixas: ['Orunmila', 'Orixáala', 'Obatala', 'Oxum', 'Iemanjá'],
  sacredFrequencies: [
    '396 Hz (Libertação do Karma)',
    '417 Hz (Facilitação da Mudança)',
    '432 Hz (Fundação Universal)',
    '528 Hz (Transformação)',
    '741 Hz (Despertar Espiritual)',
  ],
  elements: ['Luz', 'Fogo', 'Ar', 'Conhecimento', 'Revelação'],
  dayOfWeek: 'Segunda-feira',
  colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFEFD5', '#FFE4B5'],
};

// Get all Meji-Tura data
export function getData(): MejiTuraData {
  return mejiTuraData;
}

// Get Meji-Tura by identifier
export function getMejiTuraById(id: string): MejiTuraData | undefined {
  if (mejiTuraData.id === id) {
    return mejiTuraData;
  }
  return undefined;
}

// Get all Quizilas (taboos/prohibitions)
export function getQuizilas(): string[] {
  return mejiTuraData.quizilas;
}

// Get all Ebós (sacrifices)
export function getEbós(): MejiTuraEbo[] {
  return mejiTuraData.ebos;
}

// Get all Orixás associated with Meji-Tura
export function getOrixas(): string[] {
  return mejiTuraData.orixas;
}

// Get sacred frequencies
export function getSacredFrequencies(): string[] {
  return mejiTuraData.sacredFrequencies;
}

export default getData;