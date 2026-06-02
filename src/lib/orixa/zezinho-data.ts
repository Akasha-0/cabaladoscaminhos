// @ts-nocheck
// SKIP_LINT

/**
 * Zezinho Data Module
 * Spiritual data for Zezinho, the youthful orixá of joy, mischief, and spontaneous transformation
 */

export interface ZezinhoData {
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

const ZEZINHO_DATA: ZezinhoData[] = [
  {
    id: 'zezinho',
    name: 'Zezinho',
    namePortuguese: 'Menino do Povo',
    path: 'Zezinho',
    element: 'Fogo e Ar',
    colors: ['#FF6B35', '#FFE66D', '#4ECDC4'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Egbé Zezinho!',
    archetype: 'O Pivete Divino',
    qualities: ['Alegría', 'Liberdade', 'Espontaneidade', 'Transformação', 'Des结构调整', 'Esperteza'],
    challenges: ['Imaturidade', 'Impulsividade', 'Irresponsabilidade', 'Traquinagem excessiva'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Macaco', 'Papagaio', 'Sabiá'],
    plants: ['Manjericão', 'Arruda', 'Alecrim'],
    offerings: ['Balas', 'Doces', 'Frutas tropicais', 'Velas coloridas', 'Coca-Cola', 'Pãozinho'],
    chants: ['Zezinho', 'Egbé', 'Kaó'],
    symbols: ['Chocalho', 'Bastão', 'Fio vermelho', 'Portas abertas'],
    mythology:
      'Zezinho é o orixá孩童子, o eterno menino do povo. Elegante e travesso, ele guarda as encruzilhadas e abre os caminhos bloqueados. Como youngest dos orixás, Zezinho ensina que a verdadera sabedoria também vem do brincar, da creatividad e da capacidade de se adaptar rapidamente às mudanças.',
    spiritualLesson: 'A verdadera liberdade está em saber ser leve mesmo quando a vida pesa',
    affirmation: 'Eu abraço minha luz interior com alegría, usando minha inteligência para abrir caminhos e resolver problemas de forma criativa',
    meditation: 'Visualize-se como uma criança correndo em um campo aberto, livre de preocupaçőes, conectado à tierra e ao céu ao mesmo tempo',
  },
];

export function getData(): ZezinhoData[] {
  return ZEZINHO_DATA;
}

function getDataById(id: string): ZezinhoData | undefined {
  return ZEZINHO_DATA.find((z) => z.id === id);
}

function searchData(query: string): ZezinhoData[] {
  const lowerQuery = query.toLowerCase();
  return ZEZINHO_DATA.filter(
    (z) =>
      z.name.toLowerCase().includes(lowerQuery) ||
      z.namePortuguese.toLowerCase().includes(lowerQuery) ||
      z.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      z.element.toLowerCase().includes(lowerQuery)
  );
}

function getZezinhoByElement(element: string): ZezinhoData[] {
  return ZEZINHO_DATA.filter((z) => z.element.toLowerCase().includes(element.toLowerCase()));
}