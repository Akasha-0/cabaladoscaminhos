 
// @ts-nocheck
// SKIP_LINT

/**
 * Nana Data Module
 * Spiritual data for Nanã (Buruku), the orixá of swamp waters, patience, wisdom, and the elderly
 */

export interface NanaData {
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

const NANA_DATA: NanaData[] = [
  {
    id: 'nana',
    name: 'Nanã',
    namePortuguese: 'Senzala dos Mares',
    path: 'Nanã',
    element: 'Água Barrenta e Lama',
    colors: ['#4B0082', '#483D8B', '#6A5ACD'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [7, 15, 21],
    greeting: 'Salubá!',
    archetype: 'A Anciã da Sabedoria Primordial',
    qualities: ['Paciência', 'Sabedoria', 'Ternura', 'Persistência', 'Tolerância', 'Compaixão'],
    challenges: ['Estagnação', 'Procrastinação', 'Excesso de resignação', 'Melancolia'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Caracol', 'Coruja', 'Cágado'],
    plants: ['Mussambê', 'Manjericão', 'Alfavaca', 'Cebolinha'],
    offerings: ['Azeite de dendê branco', 'Água de rosas', 'Flores brancas', 'Farinha de mandioca', 'Ovo cozido', 'Quiabo'],
    chants: ['Nanã', 'Salubá', 'Buruku', 'Ogunhê'],
    symbols: ['Cabaça', 'Lama primordial', 'Urso', 'Ramo de PALMEIRA'],
    mythology:
      'Nanã Buruku é uma das orixás mais antigas, existente antes da criação do mundo. É a mãe primordial das águas barrentas de onde toda vida emerge. Foi ela quem acolheu Olokun quando este se sentiu só no fundo do oceano, oferecendo-lhe a lama sagrada como consolo. Nanã é avó de todos os orixás e guardiã dos segredos da vida e da morte. É ela quem presenteia as crianças com a inteligência e a sabedoria antes mesmo do nascimento.',
    spiritualLesson: 'A verdadeira sabedoria vem da paciência; na lama primordial jazem as sementes de toda criação',
    affirmation: 'Eu abraço a paciência sagrada de Nanã, deixando que a sabedoria se desenvolva em seu tempo próprio',
    meditation: 'Visualize águas calmas e barrentas envolvendo você, nutrindo sua alma com a sabedoria ancestral dos tempos',
  },
  {
    id: 'nana-ikedoo',
    name: 'Nanã Ikedoo',
    namePortuguese: 'Mãe das Criações',
    path: 'Nanã',
    element: 'Gestação e Nascimento',
    colors: ['#E6E6FA', '#DDA0DD', '#9370DB'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 9, 27],
    greeting: 'Nanã Salubá!',
    archetype: 'A Mãe Gestadora',
    qualities: ['Nutrição', 'Proteção', 'Gestação', 'Acolhimento', 'Devoção', 'Cuidado'],
    challenges: ['Superproteção', 'Autonegligência', 'Dependência emocional', 'Medo do abandono'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Mãe', 'Búfala', 'Tartaruga'],
    plants: ['Malva', 'Pé de moleque', 'Bambú', 'Jurema'],
    offerings: ['Leite de coco', 'Açúcar mascavo', 'Velas roxas', 'Água de assignação', 'Pão fresco', 'Frutas maduras'],
    chants: ['Ikedoo', 'Nanã', 'Omo', 'Mãe'],
    symbols: ['Berço', 'Pote de barro', 'Lua crescente', 'Ramo sagrado'],
    mythology:
      'Nanã Ikedoo é a faceta de Nanã relacionada à gestação e ao parto. É ela quem abençoa as mulheres grávidas e garante o desenvolvimento saudável dos nascituros. Conta-se que foi Nanã quem gestou os primeiros filhos no mundo primordial, usando a lama sagrada como útero cósmico. É também protetora das crianças abandonadas e das mães que choram por seus filhos.',
    spiritualLesson: 'A vida se desenvolve no escuro; confie no processo de gestação interior',
    affirmation: 'Eu nutro a vida dentro de mim com amor e paciência, confiando no tempo divino da criação',
    meditation: 'Imagine um espaço acolhedor e escuro como um útero, onde sua essência é nutrida pela sabedoria primordial de Nanã',
  },
];

export function getData(): NanaData[] {
  return NANA_DATA;
}

export function getDataById(id: string): NanaData | undefined {
  return NANA_DATA.find((n) => n.id === id);
}

export function searchData(query: string): NanaData[] {
  const lowerQuery = query.toLowerCase();
  return NANA_DATA.filter(
    (n) =>
      n.name.toLowerCase().includes(lowerQuery) ||
      n.namePortuguese.toLowerCase().includes(lowerQuery) ||
      n.element.toLowerCase().includes(lowerQuery) ||
      n.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      n.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getNanaByDay(day: string): NanaData[] {
  return NANA_DATA.filter((n) => n.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getNanaByElement(element: string): NanaData[] {
  return NANA_DATA.filter((n) => n.element.toLowerCase().includes(element.toLowerCase()));
}
