// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Ejia (Oxum) Data Module
 * Spiritual data for Ejia, the orixá of fresh water, beauty, love, and wealth
 */

export interface EjiaData {
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

const EJIA_DATA: EjiaData[] = [
  {
    id: 'ejia',
    name: 'Ejia',
    namePortuguese: 'Rainha das Águas Doces',
    path: 'Oyá',
    element: 'Água doce',
    colors: ['#00BFFF', '#FFD700', '#FFFFFF'],
    dayOfWeek: 'Sábado',
    numbersSacred: [5, 9, 15],
    greeting: 'Ossaim!',
    archetype: 'A Dona das Águas',
    qualities: ['Amor', 'Beleza', 'Fertilidade', 'Sabedoria', 'Delicadeza', 'Intuição'],
    challenges: ['Vaidade', 'Ciúmes', 'Inveja'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Borboleta', 'Pavão'],
    plants: ['Begônia', 'Violeta', 'Lirio'],
    offerings: ['Mel', 'Açúcar', 'Flores amarelas', 'Perfume', 'Água doce'],
    chants: ['Ejia', 'Oxum', 'Iê'],
    symbols: ['Espelho', 'Pente de ouro', 'Rabo de pavão', 'Água corrente'],
    mythology:
      'Ejia é a orixá das águas doces e doceiras. Ela protege a beleza, o amor e a prosperidade. Ejia é conhecida por sua vaidade e beleza, mas também por sua sabedoria e poder de cura.',
    spiritualLesson: 'A verdadeira beleza vem do amor próprio e da conexão com nossa essência divina',
    affirmation: 'Eu honra minha beleza interior e exterior, fluindo com graça e amor por mim mesma',
    meditation: 'Visualize águas cristalinas fluindo ao seu redor, trazendo pureza e renovação para sua alma',
  },
  {
    id: 'ejia-ire',
    name: 'Ejia Ire',
    namePortuguese: 'Ejia da Riqueza',
    path: 'Oyá',
    element: 'Água e Terra',
    colors: ['#FFD700', '#00BFFF', '#8B4513'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [7, 15, 21],
    greeting: 'Ossaim!',
    archetype: 'A Provedora da Abundância',
    qualities: ['Prosperidade', 'Abundância', 'Generosidade', 'Proteção', 'Maternidade', 'Cuidado'],
    challenges: ['Materialismo', 'Possessividade', 'Expectativas Excessivas'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Raposa', 'Veado'],
    plants: ['Girassol', 'Dália', 'Calêndula'],
    offerings: ['Ouro', 'Mel', 'Frutas douradas', 'Azeite', 'Milho'],
    chants: ['Ejia Ire', 'Iêê', 'Oba'],
    symbols: ['Moedas de ouro', 'Jóias', 'Pote de mel', 'Colher de ouro'],
    mythology:
      'Ejia Ire é a manifestação que traz riqueza e abundância. Ela abençoa seus filhos com prosperidade material e espiritual, mas exige respeito e gratidão.',
    spiritualLesson: 'A verdadeira riqueza está em compartilhar bênçãos e manter o coração grato',
    affirmation: 'Eu atraio abundância em todas as áreas da minha vida, fluindo com prosperidade e gratidão',
    meditation: 'Sinta a energia dourada do sol entrando em seu corpo, preenchendo cada célula com abundância',
  },
  {
    id: 'ejia-oxogbo',
    name: 'Ejia Oxogbo',
    namePortuguese: 'Ejia das Pedras',
    path: 'Oyá',
    element: 'Terra e Água',
    colors: ['#808080', '#00BFFF', '#C0C0C0'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [9, 18, 27],
    greeting: 'Ossaim!',
    archetype: 'A Guardiã das Memórias',
    qualities: ['Memória', 'História', 'Ancestralidade', 'Sabedoria Ancestral', 'Respeito', 'Tradição'],
    challenges: ['Passadismo', 'Rigidez', 'Dificuldade em Avançar'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Tartaruga', 'Coruja'],
    plants: ['Musgo', 'Samambaia', 'Hera'],
    offerings: ['Pedras preciosas', 'Água de chuva', 'Frutas do bosque', 'Velas prateadas'],
    chants: ['Ejia Oxogbo', 'Ogunhe', 'Iêi'],
    symbols: ['Pedra de rio', 'Cristal', 'Colar de contas', 'Arvore ancestral'],
    mythology:
      'Ejia Oxogbo é a guardiã das pedras e das memórias ancestrais. Ela conhece todos os segredos do passado e ajuda seus filhos a conectar com suas raízes.',
    spiritualLesson: 'Honrar nossos ancestrais nos fortalece e nos conecta com a sabedoria dos que vieram antes',
    affirmation: 'Eu honro minha história e ancestralidade, usando a sabedoria do passado para construir meu futuro',
    meditation: 'Visualize себя surrounded by ancient stones, each one holding a memory of your lineage',
  },
];

export function getData(): EjiaData[] {
  return EJIA_DATA;
}

export function getDataById(id: string): EjiaData | undefined {
  return EJIA_DATA.find((e) => e.id === id);
}

export function searchData(query: string): EjiaData[] {
  const lowerQuery = query.toLowerCase();
  return EJIA_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      e.archetype.toLowerCase().includes(lowerQuery)
  );
}