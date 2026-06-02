// @ts-nocheck
// SKIP_LINT

/**
 * Proposito Data Module
 * Spiritual data for Proposito, the sacred path of divine purpose, destiny, and calling
 */

export interface PropositoData {
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

const PROPOSITO_DATA: PropositoData[] = [
  {
    id: 'proposito',
    name: 'Proposito',
    namePortuguese: 'O Caminho Sagrado do Propósito',
    path: 'Proposito',
    element: 'Fogo e Éter',
    colors: ['#FFD700', '#FF8C00', '#FF6347'],
    dayOfWeek: 'Domingo',
    numbersSacred: [1, 7, 11],
    greeting: 'Proposito!',
    archetype: 'A CHAMADA DIVINA',
    qualities: ['Propósito', 'Destino', 'Vocação', 'Missão', 'Direção', 'Claridade'],
    challenges: ['Indecisão', 'Medo do fracasso', 'Ignorar a voz interior', 'Procrastinação'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Fênix', 'Leão', 'Águia'],
    plants: ['Girassol', 'Calêndula', 'Dente-de-leão', 'Sálvia dourada'],
    offerings: ['Velas douradas', 'Mel', 'Incenso de sálvia', 'Flores amarelas', 'Ouro em po'],
    chants: ['Proposito ai', 'Ori mi', 'Alashè'],
    symbols: ['Estrela', 'Caminho', 'Chama', 'Coroa'],
    mythology: 'Proposito é o princípio sagrado do destino e da vocação divina. Este caminho representa a energia que nos conecta com nossa verdadeira missão de vida — aquilo que viemos realizar neste mundo. É através do Proposito que encontramos clareza sobre nossa trajetória, entendendo que cada ser possui um papel único no tecido do universo. O Proposito ensina que conhecer sua vontade divina não é arrogância, mas alinhamento — pois quando vivemos nossa vocação, servimos não apenas a nós mesmos, mas a todo o cosmos.',
    spiritualLesson: 'O verdadeiro propósito não se encontra no exterior, mas na escuta silenciosa da alma',
    affirmation: 'Eu abro meu coração para conhecer minha missão divina, confiando na sabedoria que me guia',
    meditation: 'Visualize uma luz dourada emanando do seu coração, iluminando o caminho de sua verdadeira vocação',
  },
];

export function getData(): PropositoData[] {
  return PROPOSITO_DATA;
}

function getDataById(id: string): PropositoData | undefined {
  return PROPOSITO_DATA.find((p) => p.id === id);
}

function searchData(query: string): PropositoData[] {
  const q = query.toLowerCase();
  return PROPOSITO_DATA.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.namePortuguese.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      p.element.toLowerCase().includes(q) ||
      p.qualities.some((q) => q.toLowerCase().includes(q))
  );
}

function getPropositoByElement(element: string): PropositoData[] {
  return PROPOSITO_DATA.filter((p) => p.element.toLowerCase().includes(element.toLowerCase()));
}