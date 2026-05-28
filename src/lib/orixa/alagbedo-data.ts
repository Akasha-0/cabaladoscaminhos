/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Alagbedo Data Module
 * Spiritual data for Alagbedo, the orixá of protection and prevention of misfortune
 */

export interface AlagbedoData {
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

const ALAGBEDO_DATA: AlagbedoData[] = [
  {
    id: 'alagbedo',
    name: 'Alagbedo',
    namePortuguese: 'O Protetor dos Males',
    path: 'Odu',
    element: 'Ar e Fogo',
    colors: ['#FF0000', '#000000', '#FFD700'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Eo!',
    archetype: 'O Protetor contra Males',
    qualities: ['Proteção', 'Prevenção', 'Fortuna', 'Sorte', 'Amuletos', 'Barreira Sagrada'],
    challenges: ['Obsessão', 'Medo', 'Superstição'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Galo', 'Cão preto'],
    plants: ['Arruda', 'Pau-brasil', 'Alecrim'],
    offerings: ['Azeite de dendê', 'Galo', 'Fio vermelho', 'Pimenta', 'Dinheiro'],
    chants: ['Alagbedo', 'Eo', 'Ora'],
    symbols: ['Corrente', 'Fio vermelho', 'Galo', 'Amuleto'],
    mythology:
      'Alagbedo é o orixá que protege contra acidentes, doenças e todo tipo de mal. Ele é invoked antes de qualquer jornada para garantir segurança e afastar misfortúnio.',
    spiritualLesson: 'A verdadeira proteção vem do conhecimento e preparação, não do medo',
    affirmation: 'Eu sou protegido por forças sagradas que afastam todo mal e me guiam pela luz',
    meditation: 'Visualize uma luz vermelha envolvendo seu corpo como um escudo protetor, afastando negativity',
  },
];

export function getData(): AlagbedoData[] {
  return ALAGBEDO_DATA;
}

export function getDataById(id: string): AlagbedoData | undefined {
  return ALAGBEDO_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AlagbedoData[] {
  const lowerQuery = query.toLowerCase();
  return ALAGBEDO_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.namePortuguese.toLowerCase().includes(lowerQuery) ||
      a.element.toLowerCase().includes(lowerQuery) ||
      a.archetype.toLowerCase().includes(lowerQuery) ||
      a.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}

export function getAlagbedoByDay(day: string): AlagbedoData[] {
  return ALAGBEDO_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getAlagbedoByElement(element: string): AlagbedoData[] {
  return ALAGBEDO_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}