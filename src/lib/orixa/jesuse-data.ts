/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Jesuse Data Module
 * Spiritual data for Jesuse, Orixá of devotion, compassion, and spiritual love
 */

export interface JesuseData {
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
  sacredGeometry: string[];
}

const JESUSE_DATA: JesuseData[] = [
  {
    id: 'jesuse',
    name: 'Jesuse',
    namePortuguese: 'Jesus Cristo',
    path: 'Ijubà',
    element: 'Água e Fogo',
    colors: ['#8B0000', '#FFFFFF', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [3, 7, 12],
    greeting: 'Jesuse Ayan!',
    archetype: 'O Salvador',
    qualities: ['Compaixão', 'Perdão', 'Devoção', 'Sacrifício', 'Amor incondicional', 'Redenção'],
    challenges: ['Sacrifício excessivo', 'Perdão difícil', 'Culpa não resolvida'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cordeiro', 'Pomba', 'Peixe'],
    plants: ['Rosa branca', 'Lavanda', 'Espada de São Jorge'],
    offerings: ['Pão', 'Vinho', 'Água benta', 'Flores brancas', 'Velas douradas'],
    chants: ['Jesuse', 'Misericórdia', 'Amém'],
    symbols: ['Cruz', 'Coroa de espinhos', 'Cálice', 'Peixe'],
    mythology:
      'Jesuse representa a energia do amor incondicional e do sacrifício divino. Ele encarna a luz que ilumina os caminhos escuro, oferecendo redenção e esperança para todos os seres. Sua energia conecta o céu e a terra,Bringing messages of paz, amor e compaixão para a humanidade. Jesuse ensina que através do amor verdadeiro, podemos transcender nossos limites e encontrar a salvação.',
    spiritualLesson:
      'O verdadeiro amor se manifesta no sacrifício silencioso. Através da compaixão, encontramos nossa conexão mais profunda com o divino.',
    affirmation:
      'Eu sou digno de amor e compaixão. Jesuse me abraça em sua luz sagrada e me guia para a redenção eterna.',
    meditation:
      'Sente-se em posição de meditação com as mãos abertas. Visualize uma luz dourada emanando do seu coração, expandindo-se para envolver todo o seu ser. Essa luz representa o amor incondicional de Jesuse fluindo através de você, preenchendo cada célula com compaixão e perdão. Permita que essa energia cure todas as feridas do passado.',
    sacredGeometry: ['Cruz', 'Círculo', 'Estrela de seis pontas'],
  },
];

export function getData(): JesuseData[] {
  return JESUSE_DATA;
}

function getDataById(id: string): JesuseData | undefined {
  return JESUSE_DATA.find((j) => j.id === id);
}

function searchData(query: string): JesuseData[] {
  const lowerQuery = query.toLowerCase();
  return JESUSE_DATA.filter(
    (j) =>
      j.name.toLowerCase().includes(lowerQuery) ||
      j.namePortuguese.toLowerCase().includes(lowerQuery) ||
      j.archetype.toLowerCase().includes(lowerQuery) ||
      j.qualities.some((q: string) => q.toLowerCase().includes(lowerQuery))
  );
}

function getJesuseByDay(day: string): JesuseData[] {
  return JESUSE_DATA.filter((j) => j.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getJesuseByElement(element: string): JesuseData[] {
  return JESUSE_DATA.filter((j) => j.element.toLowerCase().includes(element.toLowerCase()));
}