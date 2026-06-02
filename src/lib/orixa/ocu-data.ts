// @ts-nocheck
// SKIP_LINT

/**
 * Ocu Data Module
 * Spiritual data for Ocu, the orixá of voice, throat, and sacred speech
 */

export interface OcuData {
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

const OCU_DATA: OcuData[] = [
  {
    id: 'ocu',
    name: 'Ocu',
    namePortuguese: 'Senhor da Voz Sagrada',
    path: 'Ocu',
    element: 'Ar e Éter',
    colors: ['#FFFFFF', '#87CEEB', '#E6E6FA'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 7, 15],
    greeting: 'Ocu Okê!',
    archetype: 'O Guardião da Palavra Verdadeira',
    qualities: ['VERDADE', 'Clareza', 'Autenticidade', 'Comunicação', 'Escuta Sagrada', 'Intuição'],
    challenges: ['Mentira', 'Manipulação', 'Inveja', 'Superficialidade'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Papagaio', 'Beija-flor', 'Sabiá'],
    plants: ['Manjericão', 'Babosa', 'Arruda'],
    offerings: ['Água de cocção', 'Velas brancas', 'Flores brancas', 'Frutas', 'Mel', 'Espelho'],
    chants: ['Ocu', 'Voz verdadeira', 'Palavra de luz'],
    symbols: ['Garganta', 'Lábios', 'Sino', 'Espelho'],
    mythology:
      'Ocu é o orixá da garganta, da voz sagrada e da comunicação autêntica. É ele quem dá aos seres humanos o dom da palavra verdadeira, permitindo que expressemos nossa essência mais profunda. Ocu ensina que cada palavra carrega poder criativo e que a verdadeira comunicação é um ato sagrado de conexão entre o mundo físico e o espiritual.',
    spiritualLesson: 'A voz é um instrumento sagrado; use-a para curar, revelar verdades e conectar almas',
    affirmation: 'Minha voz é verdadeira e autêntica; eu falo com clareza e coração aberto',
    meditation: 'Sinta a energia da voz vibrando em sua garganta, cada som um fio de luz conectando você ao universo',
  },
];

export function getData(): OcuData[] {
  return OCU_DATA;
}

function getDataById(id: string): OcuData | undefined {
  return OCU_DATA.find((o) => o.id === id);
}

function searchData(query: string): OcuData[] {
  const lowerQuery = query.toLowerCase();
  return OCU_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery)
  );
}

function getOcuByElement(element: string): OcuData[] {
  return OCU_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}