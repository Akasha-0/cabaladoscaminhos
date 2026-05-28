
// @ts-nocheck
// SKIP_LINT

/**
 * Odara Data Module
 * Spiritual data for Odara, the orixá of beauty, joy and flourishing
 */

export interface OdaraData {
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

const ODARA_DATA: OdaraData[] = [
  {
    id: 'odara',
    name: 'Odara',
    namePortuguese: 'Dono da Beleza',
    path: 'Odara',
    element: 'Água e Terra',
    colors: ['#FFD700', '#FFA500', '#FFFFFF'],
    dayOfWeek: 'Domingo',
    numbersSacred: [5, 7, 15],
    greeting: 'Odara!',
    archetype: 'O Desbravador da Alegria',
    qualities: ['Beleza', 'Alegria', 'Florescimento', 'Bondade', 'Generosidade', 'Abundância'],
    challenges: ['Vaidade excessiva', 'Superficialidade', 'Medo de envelhecer'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Borboleta', 'Colibri'],
    plants: ['Dama-da-noite', 'Alamanda', 'Girassol'],
    offerings: ['perfume floral', 'Flores amarelas e laranjas', 'Velas douradas', 'Azeite doce', 'Mirra'],
    chants: ['Odara', 'Oba', 'Ewa'],
    symbols: ['Flor de lotus', 'Espelho', 'Pavão', 'Arco-íris'],
    mythology:
      'Odara é o orixá da beleza, da alegria e do florescimento. Ele abençoa a arte, a criatividade e a capacidade de encontrar beleza no cotidiano. Odara ensina que a verdadeira beleza vem de dentro e que a alegria é uma forma sagrada de resistência.',
    spiritualLesson: 'A beleza verdadeira habita na generosidade do coração e na capacidade de criar alegria',
    affirmation: 'Eu floresço como uma flor sob o sol, irradiando beleza, alegria e bondade por onde passo',
    meditation: 'Visualize uma luz dourada e alaranjada envolvendo seu ser, despertando a alegria de viver e a apreciação da beleza em cada momento',
  },
];

export function getData(): OdaraData[] {
  return ODARA_DATA;
}

export function getDataById(id: string): OdaraData | undefined {
  return ODARA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OdaraData[] {
  const lowerQuery = query.toLowerCase();
  return ODARA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.mythology.toLowerCase().includes(lowerQuery)
  );
}

export function getOdaraByDay(day: string): OdaraData[] {
  return ODARA_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOdaraByElement(element: string): OdaraData[] {
  return ODARA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}
