// @ts-nocheck
// SKIP_LINT

/**
 * Alaketu Data Module
 * Spiritual data for Alaketu, the orixá of wealth, prosperity, and sacred waters
 */

export interface AlaketuData {
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

const ALAKETU_DATA: AlaketuData[] = [
  {
    id: 'alaketu',
    name: 'Alaketu',
    namePortuguese: 'Senhor das Riquezas e das Águas',
    path: 'Alaketu',
    element: 'Água e Terra',
    colors: ['#006400', '#DAA520', '#40E0D0'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 8, 12],
    greeting: 'Eê Alaketu!',
    archetype: 'O Provedor Abundante',
    qualities: ['Prosperidade', 'Abundância', 'Generosidade', 'Fluidez', 'Movimento', 'Proteção'],
    challenges: ['Avidez', 'Excesso de apego material', 'Inconstância'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Cavalo', 'Peixe', 'Bode'],
    plants: ['Palmeira', 'Milho', 'Feijão', 'Amendoim'],
    offerings: ['Azeite de dendê', 'Velas douradas', 'Farinha', 'Frutas', 'Água doce', 'Dinheiro'],
    chants: ['Eê', 'Alaketu', 'Abundância', 'Prosperidade'],
    symbols: ['Kalunga', 'Água corrente', 'Moedas', 'Cabaça de abundância'],
    mythology:
      'Alaketu é o orixá das riquezas e das águas sagradas. É conhecido como o provedor que traz prosperidade e abundância para seus filhos. Foi criado por Oludumare para distribuir os recursos do mundo. Sua energia está ligada ao fluxo contínuo de prosperidade que vem da conexão com as águas e a terra fértil.',
    spiritualLesson: 'A verdadeira riqueza flui quando compartilhamos com generosidade e mantemos conexão com nossa源 sagrada',
    affirmation: 'Eu abençoo minha vida com abundância divina, permitindo que a prosperidade flua através de mim para todos',
    meditation: 'Visualize uma corrente de água dourada e verde fluindo em sua direção, trazendo prosperidade e proteção',
  },
];

export function getData(): AlaketuData[] {
  return ALAKETU_DATA;
}

function getDataById(id: string): AlaketuData | undefined {
  return ALAKETU_DATA.find((a) => a.id === id);
}

function searchData(query: string): AlaketuData[] {
  const lowerQuery = query.toLowerCase();
  return ALAKETU_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.namePortuguese.toLowerCase().includes(lowerQuery) ||
      a.archetype.toLowerCase().includes(lowerQuery) ||
      a.element.toLowerCase().includes(lowerQuery) ||
      a.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}

function getAlaketuByDay(day: string): AlaketuData[] {
  return ALAKETU_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getAlaketuByElement(element: string): AlaketuData[] {
  return ALAKETU_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}