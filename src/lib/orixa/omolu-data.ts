/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Omolu Data Module
 * Spiritual data for Omolu/Obaluaye, the orixá of the earth, healing, and disease
 */

export interface OmoluData {
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

const OMOlu_DATA: OmoluData[] = [
  {
    id: 'omolu',
    name: 'Omolu',
    namePortuguese: 'Senhor das Doenças e da Terra',
    path: 'Omolu',
    element: 'Terra e Doença',
    colors: ['#8B4513', '#CD853F', '#DEB887'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [6, 9, 15],
    greeting: 'Epa!',
    archetype: 'O Guardião das Epidemias',
    qualities: ['Healing', 'Earth wisdom', 'Transformation', 'Resilience', 'Shadow work', 'Ancestral knowledge'],
    challenges: ['Isolation', 'Fear of contamination', 'Rejection of vulnerability'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Tatu', 'Cobra', 'Lagarto'],
    plants: ['Prairie grass', 'Mandioca brava', 'Babosa'],
    offerings: ['Pau-brasil', 'Quiabo', 'Mandioca', 'Velas marrons', 'Cachorro-preto'],
    chants: ['Omolu', 'Obaluaye', 'Epa'],
    symbols: ['Rabo de tatu', 'Pente de Osanha', 'Cabaça sagrada'],
    mythology:
      'Omolu é o orixá que governa a terra, as doenças e a cura. Foi picado por um escorpião e sobreviveu, tornando-se o senhor das epidemias e das pandemias. Omolu é quem cria e quem cura as doenças. Ele habita debaixo da terra e nasce das folhas de palmeira.',
    spiritualLesson: 'A verdadeira cura vem do confronto com a escuridão e a transformação do sofrimento em sabedoria',
    affirmation: 'Eu transformo minha dor em sabedoria, honro os ciclos de doença e cura, e abraço minha resiliência',
    meditation: 'Visualize a terra sob seus pés, enviando energia de cura através de você, transformando cada célula',
  },
  {
    id: 'omolu-obaluaye',
    name: 'Obaluaye',
    namePortuguese: 'O Senhor da Terra e das Epidemias',
    path: 'Omolu',
    element: 'Terra contaminada',
    colors: ['#A0522D', '#D2691E', '#F4A460'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Obaluaye!',
    archetype: 'O Protetor das Pandemias',
    qualities: ['Proteção', 'Cura de epidemias', 'Sabedoria telúrica', 'Transformação', 'Regeneração'],
    challenges: ['Pária social', 'Medo da morte', 'Dor crônica'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Tatu', 'Cobra-preta', 'Escorpião'],
    plants: ['Palmeira', 'Xique-xique', 'Carrapato'],
    offerings: ['Quiabo cozido', 'Farinha de mandioca', 'Velas marrons', 'Maçã-do-conde', 'Pimenta'],
    chants: ['Obaluayê', 'Omolu', 'Êpa'],
    symbols: ['Pente de Osanha', 'Rabo de tatu', 'Manto de palha'],
    mythology:
      'Obaluaye é a forma mais terrível de Omolu, aquele que traz as epidemias e também pode curá-las. Ele é dono da bexiga, do sarcoma e de todas as doenças de pele. Quando Obaluaye está irritado, as epidemias se espalham pela terra.',
    spiritualLesson: 'A proteção verdadeira vem do conhecimento profundo dos ciclos destrutivos e regenerativos da natureza',
    affirmation: 'Eu sou protegido pela sabedoria ancestral da terra, transformo ameaças em cura e doença em renovação',
    meditation: 'Conecte-se com a energia da terra, sinta-a entrando pelos seus pés e subindo pela sua coluna, purificando',
  },
];

export function getData(): OmoluData[] {
  return OMOlu_DATA;
}

export function getDataById(id: string): OmoluData | undefined {
  return OMOlu_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OmoluData[] {
  const q = query.toLowerCase();
  return OMOlu_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q))
  );
}

export function getOmoluByDay(day: string): OmoluData[] {
  return OMOlu_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOmoluByElement(element: string): OmoluData[] {
  return OMOlu_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}