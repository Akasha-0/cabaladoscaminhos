 
// @ts-nocheck
// SKIP_LINT

/**
 * Shango Data Module
 * Spiritual data for Shango (Xangô), the orixá of thunder, fire, justice, and stones
 */

export interface ShangoData {
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

const SHANGO_DATA: ShangoData[] = [
  {
    id: 'shango',
    name: 'Shango',
    namePortuguese: 'Senhor dos Raios',
    path: 'Shango',
    element: 'Fogo e Trovão',
    colors: ['#FF4500', '#DC143C', '#8B0000'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 12, 18],
    greeting: 'Kaô Kabiês!',
    archetype: 'O Senhor da Justiça e do Trovão',
    qualities: ['Força', 'Coragem', 'Justiça', 'Determinação', 'Passion', 'Vitalidade'],
    challenges: ['Impulsividade', 'Garra excessiva', 'orgulho', 'Temperamento'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Búfalo', 'Galo', 'Cabra'],
    plants: ['Palmeira', 'Pau-brasil', 'Arruda'],
    offerings: ['Azeite de dendê vermelho', 'Velas vermelhas', 'Fumo', 'Pão', 'Frutas rojas', 'Ervas'],
    chants: ['Kaô', 'Shango', 'Oba', 'Bara'],
    symbols: ['Machado de dois gumes', 'Pedras', 'Raio', 'Cajado'],
    mythology:
      'Shango foi o terceiro alá (rei) de Oyo, o mais poderoso reino iorubá. Após sua morte, foi divinizado como o orixá dos raios e trovões. Sua esposa Oshun tornou-se marah (amarga) ao descobri-lo em adultério, e abriu as comportas do rio, iniciando uma guerra que levou à morte de Shango. Sua mãe Oduduwa tentou salvá-lo da fome, mas ele se enforcou. Os deuses o transformaram em orixá, e seu trovão ecoa pelo mundo como lembrete de sua justiça.',
    spiritualLesson: 'A verdadeira força está em channel a energia do trovão para a justiça e a transformação',
    affirmation: 'Eu canalizo minha energia com propósito e justiça, transformando desafios em oportunidades de crescimento',
    meditation: 'Visualize raios dourados descendo sobre você, purificando sua aura e fortalecendo sua determinação',
  },
  {
    id: 'shango-oxumar',
    name: 'Oxumar',
    namePortuguese: 'O Aranha Dançante',
    path: 'Shango',
    element: 'Dança e Metamorfose',
    colors: ['#FFD700', '#FFA500', '#8B4513'],
    dayOfWeek: 'Sábado',
    numbersSacred: [3, 7, 21],
    greeting: 'Oxumarê!',
    archetype: 'O Transformador Cósmico',
    qualities: ['Versatilidade', 'Transformação', 'Sabedoria oculta', 'Integração', 'Jogo', 'Fartura'],
    challenges: ['Manipulação', 'Superficialidade', 'Engano', 'Inconstância'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Aranha', 'Pavão', 'Cobra'],
    plants: ['Alfarroba', 'Manga', 'Cajá'],
    offerings: ['Mel', 'Velas douradas', 'Frutas tropicais', 'Azeite de dendê', 'Folhas verdes'],
    chants: ['Oxumar', 'Oxumarê', 'Aranha', 'Dança'],
    symbols: ['Teia de aranha', 'Arco-íris', 'Coroa de plumes', 'Espelho'],
    mythology:
      'Oxumar é a versão mística de Shango, revelado quando os raios de Shango tocam o chão e se transformam em arco-íris. Representa a capacidade de mudar de forma e adaptar-se às circunstâncias. É o guardião dos mistérios e das artes ocultas, tecendo destinos como uma aranha cósmica.',
    spiritualLesson: 'A verdadeira sabedoria vem da capacidade de mudar de forma sem perder a essência',
    affirmation: 'Eu abraço a transformação e teco meu destino com intenção e sabedoria',
    meditation: 'Imagine uma aranha tecendo uma teia luminosa ao seu redor, conectando todos os aspectos de sua vida',
  },
];

export function getData(): ShangoData[] {
  return SHANGO_DATA;
}

export function getDataById(id: string): ShangoData | undefined {
  return SHANGO_DATA.find((s) => s.id === id);
}

export function searchData(query: string): ShangoData[] {
  const lower = query.toLowerCase();
  return SHANGO_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.namePortuguese.toLowerCase().includes(lower) ||
      s.archetype.toLowerCase().includes(lower) ||
      s.qualities.some((q) => q.toLowerCase().includes(lower)),
  );
}

export function getShangoByDay(day: string): ShangoData[] {
  return SHANGO_DATA.filter((s) => s.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getShangoByElement(element: string): ShangoData[] {
  return SHANGO_DATA.filter((s) => s.element.toLowerCase().includes(element.toLowerCase()));
}