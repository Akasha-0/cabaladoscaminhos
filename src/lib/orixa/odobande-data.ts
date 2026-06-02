 
// @ts-nocheck
// SKIP_LINT

/**
 * Odobande Data Module
 * Spiritual data for Odobande, the orixá of transformation and renewal
 */

export interface OdobandeData {
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

const ODOBANDE_DATA: OdobandeData[] = [
  {
    id: 'odobande',
    name: 'Odobande',
    namePortuguese: 'Senhor da Transformação',
    path: 'Odobande',
    element: 'Água e Fogo',
    colors: ['#4A0E0E', '#8B0000', '#D4AF37'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 7, 12],
    greeting: 'Odobande!',
    archetype: 'O Regenerador das Cicatrizes',
    qualities: ['Transformação', 'Renovação', 'Cicatrização', 'Resiliência', 'Superação', 'Recomeço'],
    challenges: ['Dor guardada', 'Memórias traumáticas', 'Resistência à mudança'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Serpente', 'Fênix', 'Salamandra'],
    plants: ['Babosa', 'Guiné', 'Arruda'],
    offerings: ['Azeite de dendê vermelho', 'Velas vermelhas', 'Etere', 'Flor de papel', 'Água de chuva'],
    chants: ['Odobande', 'Okan', 'Ara'],
    symbols: ['Círculo de fogo', 'Espiral', 'Serpente enrolada', 'Chama'],
    mythology:
      'Odobande é o orixá que governa as cicatrizes da alma e a transformação através da dor. Ele transforma feridas antigas em sabedoria, memória em ensinamento, e trauma em força. Odobande habita nos espaços entre o velho e o novo.',
    spiritualLesson: 'As cicatrizes são mapas da nossa jornada, não marcas de fracasso',
    affirmation: 'Eu transformo minha dor em sabedoria, minhas cicatrizes em testemunhos de força e superação',
    meditation: 'Visualize uma espiral de luz vermelha e dourada envolvendo suas feridas antigas, transformando-as em mapas de sabedoria',
  },
];

export function getData(): OdobandeData[] {
  return ODOBANDE_DATA;
}

function getDataById(id: string): OdobandeData | undefined {
  return ODOBANDE_DATA.find((o) => o.id === id);
}

function searchData(query: string): OdobandeData[] {
  const lowerQuery = query.toLowerCase();
  return ODOBANDE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.mythology.toLowerCase().includes(lowerQuery)
  );
}

function getOdobandeByDay(day: string): OdobandeData[] {
  return ODOBANDE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOdobandeByElement(element: string): OdobandeData[] {
  return ODOBANDE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}