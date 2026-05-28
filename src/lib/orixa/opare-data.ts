 
// @ts-nocheck
// SKIP_LINT

/**
 * Oparé Data Module
 * Spiritual data for Oparé, the orixá of music, celebration, and sensuality
 */

export interface OpareData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
}

const OPARE_DATA: OpareData[] = [
  {
    id: 'opare',
    name: 'Oparé',
    namePortuguese: 'Senhora da Dança e da Alegria',
    path: 'Oxum',
    element: 'Ritmo e Alegria',
    colors: ['#FF1493', '#FFD700', '#FF69B4'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 5, 7],
    greeting: 'Oparé Oriê!',
    archetype: 'A Rainha da Celebration e do Prazer',
    qualities: [
      'Alegría',
      'Dança',
      'Sensualidade',
      'Música',
      'Celebração',
      'Prazer',
      'Charme',
      'Vibração',
      'Comunidade'
    ],
    challenges: [
      'Excesso',
      'Superficialidade',
      'Procrastinação',
      'Instabilidade emocional',
      'Buscar aprovação externa'
    ],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Colibri', 'Mariposa'],
    plants: ['Hibisco', 'Jasmim', 'Alamanda rosa', 'Rosa vermelha'],
    offerings: ['Velas roses', 'Perfumes doces', 'Azeite de dendê', 'Flores coloridas', 'Vinho doce', 'Bijuterias douradas', 'Frutas tropicais'],
    chants: ['Oparé', 'Oriê', 'Êêê'],
    symbols: ['Pandeiro', 'Espelho de mão', 'Fitas coloridas', 'Guirlanda de flores'],
    mythology:
      'Oparé é a orixá que governa a dança, a música e as celebrações. Ela é a incarnation da alegria que pulsa em cada ritmo, o espírito que faz os pés se moverem e o coração se preencher de prazer. Oparé ensina que a vida é uma festa sagrada e que cada momento merece ser celebrado com todo o corpo e alma. Ela é a source de toda melodia e a guardiã dos prazeres innocentes. Oparé revela que a verdadeira celebração vem do alinhamento com o prazer divino e que a dança é uma forma de oração.',
    spiritualLesson: 'A verdadeira alegria vem da celebração do presente e do prazer de existir',
    affirmation: 'Eu danço com a energia de Oparé, celebrando a vida e permitindo que a alegria flua através de mim',
    meditation: 'Sinta seu corpo movendo-se em ritmo, visualizando cores rosas e douradas emanando de seus movimentos'
  },
  {
    id: 'opare-i昌',
    name: 'Oparé Ijexá',
    namePortuguese: 'Senhora das Festas Populares',
    path: 'Oxum',
    element: 'Celebração Popular',
    colors: ['#FF6347', '#FFA500', '#FFFF00'],
    dayOfWeek: 'Sábado',
    numbersSacred: [4, 6, 9],
    greeting: 'Oparé Oê!',
    archetype: 'A Mestra das Festas',
    qualities: ['Comunidade', 'Tradição', 'Ancestralidade', 'Festa', 'Luz', 'Unção', 'Encantamento'],
    challenges: ['Excesso de trabalho', 'Sacrifício propio', 'Dificuldade em descansar'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Galinha d\'Angola', 'Pava', 'Borboleta colorida'],
    plants: ['Alamanda amarela', 'Malva rosa', 'Papoula'],
    offerings: ['Velas laranjas', 'Guloseimas', 'Danças offerings', 'Amendoim torrado', 'Aguardente doce'],
    chants: ['Oê', 'Oparé Oê', 'Ahoyê'],
    symbols: ['Pandeiro украшенный', 'Fitas de festa', 'Esteira colorido', 'Balões'],
    mythology:
      'Oparé Ijexá é a faceta festiva de Oparé, a mestra que governa as celebrações populares e as danças tradicionais. Ela é invoked nas festas de rua, nos carnavais e em todas as reuniões onde a alegria é compartida. Oparé Ijexá traz a bênção da unção festiva, fazendo com que cada celebração se torne uma experiência transformadora. Seu poder atrai multidões e une comunidades através da alegria compartilhada.',
    spiritualLesson: 'Celebrar juntos é criar pontes sagradas entre almas',
    affirmation: 'Eu invoco Oparé Ijexá para abençoar minhas celebrações e criar momentos de alegria compartilhada',
    meditation: 'Visualize uma festa colorida onde todas as pessoas dançam em harmonia, conectadas pela luz de Oparé'
  }
];

export function getData(): OpareData[] {
  return OPARE_DATA;
}

export function getDataById(id: string): OpareData | undefined {
  return OPARE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OpareData[] {
  const lowerQuery = query.toLowerCase();
  return OPARE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getOpareByDay(day: string): OpareData[] {
  return OPARE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOpareByElement(element: string): OpareData[] {
  return OPARE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}