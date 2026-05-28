 
// @ts-nocheck
// SKIP_LINT

/**
 * Oloxum Data Module
 * Spiritual data for Oloxum, the orixá of oceanic depths, ancestral memory, and transformation
 */

export interface OloxumData {
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

const OLOXUM_DATA: OloxumData[] = [
  {
    id: 'oloxum',
    name: 'Oloxum',
    namePortuguese: 'Senhor das Profundezas',
    path: 'Olokun',
    element: 'Água Abissal e Memória Ancestral',
    colors: ['#1a0a2e', '#2d1b4e', '#4a2c7a'],
    dayOfWeek: 'Domingo',
    numbersSacred: [9, 18, 27],
    greeting: 'Oloxumê!',
    archetype: 'O Guardião das Memórias Primordiais',
    qualities: ['Transformação', 'Profundidade', 'Ancestralidade', 'Intuição', 'Segredos', 'Regeneração'],
    challenges: ['Ocultismo excessivo', 'Segredos guardados', 'Medo do desconhecido'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Polvo', 'Baleia', 'Tartaruga marinha'],
    plants: ['Algas marinhas', 'Musgo', 'Samambaia aquática'],
    offerings: ['Água do mar', 'Perolas negras', 'Azeite de dendê escuro', 'Frutos do mar', 'Incenso de mirra'],
    chants: ['Oloxum', 'Olokun', 'Abaixo', 'Profundeza'],
    symbols: ['Concha espiral', 'Abismo', 'Coral negro', 'Âncora invertida'],
    mythology:
      'Oloxum habita as profundezas mais profundas do oceano, onde a luz nunca alcana. É guardião de todos os segredos ancestrais e das memorias que foram esquecidas pelo mundo superior. Foi Oloxum quem recebeu as primeiras palavras spoken pelo Criador antes da existencia do tempo, e as guarda em conchas spirais em seu palácio de coral negro. Quando um ser humano busca respostas sobre seu passado ancestral, é a Oloxum que deve ser consultado nas profundezas dos sonhos.',
    spiritualLesson: 'Nas profundezas do inconsciente jazem as respostas que a superficie nunca encontrou',
    affirmation: 'Eu mergulho nas profundezas de minha alma, confiando que Oloxum guardará meus segredos mais sagrados',
    meditation: 'Visualize-se descendo por aguas escuras e calmantes, onde cada camada revela uma memoria ancestral guardada por Oloxum',
  },
  {
    id: 'oloxum-ayan',
    name: 'Oloxum Ayan',
    namePortuguese: 'O Respirador das Profundezas',
    path: 'Olokun',
    element: 'Ar e Agua na Descida',
    colors: ['#0d0d1a', '#1a1a2e', '#2a2a4a'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [5, 10, 20],
    greeting: 'Oloxumayan!',
    archetype: 'O Mediador das Duas Aguas',
    qualities: ['Transicao', 'Descida', 'Acolhimento', 'Libertacao', 'Desapego', 'Soltura'],
    challenges: ['Tendencia ao isolacionismo', 'Dificuldade em emergir', 'Acumulo de aguas paradas'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Tubarão', 'Raia', 'Cavalo-marinho'],
    plants: ['Limo', 'Agar-agar', 'Plantas bioluminescentes'],
    offerings: ['Sal grosso', 'Agua salobra', 'Plumas escuras', 'Pedras do fundo do mar'],
    chants: ['Ayan', 'Desce', 'Sobe', 'Respira'],
    symbols: ['Bolha de ar', 'Onda invertida', 'Duas aguas encontrando'],
    mythology:
      'Oloxum Ayan é a faceta de Oloxum que media entre as aguas superficiais e as profundezas abissais. É ele quem ensina os seres a respirar tanto na superficie quanto no fundo, adaptando-se a diferentes pressoes. Conta-se que foi Oloxum Ayan quem primeiro ensinou os humanos a mergulhar em seus propios inconscientes sem medo de se afogar nas emocoes reprimidas.',
    spiritualLesson: 'A verdadeira forca esta em aprender a respirar em qualquer profundidade',
    affirmation: 'Eu respiro profundamente em qualquer situacao, permitindo que Oloxum Ayan guie minha adaptacao',
    meditation: 'Imagine-se em uma coluna de agua, sentindo a pressao transformar-se em forca, respirando em cada nivel de consciencia',
  },
];

export function getData(): OloxumData[] {
  return OLOXUM_DATA;
}

export function getDataById(id: string): OloxumData | undefined {
  return OLOXUM_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OloxumData[] {
  const lowerQuery = query.toLowerCase();
  return OLOXUM_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.element.toLowerCase().includes(lowerQuery)
  );
}

export function getOloxumByDay(day: string): OloxumData[] {
  return OLOXUM_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOloxumByElement(element: string): OloxumData[] {
  return OLOXUM_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}