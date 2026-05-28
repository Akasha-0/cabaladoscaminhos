// @ts-nocheck
// SKIP_LINT

/**
 * Obará Data Module
 * Spiritual data for Obará, the orixá of wind, leaves, and medicinal herbs
 */

export interface ObaraData {
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

const OBARA_DATA: ObaraData[] = [
  {
    id: 'obara',
    name: 'Obará',
    namePortuguese: 'Senhor do Vento e das Folhas',
    path: 'Obará',
    element: 'Ar e Terra',
    colors: ['#228B22', '#90EE90', '#006400'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 9, 15],
    greeting: 'Epare Obará!',
    archetype: 'O Guardião das Ervas e dos Ventos',
    qualities: ['Sabedoria', 'Misericórdia', 'Paz', 'Harmonia', 'Gentileza', 'Compaixão'],
    challenges: ['Indecisão', 'Passividade', 'Vulnerabilidade', 'Excesso de bondade'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Bode', 'Papagaio', 'Pomba'],
    plants: ['Eru', 'Malungo', 'Pau-brasil', 'Folhas verdes'],
    offerings: ['Água de obí', 'Milho', 'Farinha de mandioca', 'Velas verdes', 'Folhas frescas', 'Frutas tropicais'],
    chants: ['Epare Obará', 'Obará ke', 'Awa lo wa'],
    symbols: ['Vento', 'Folhas', 'Vassoura', 'Pá'],
    mythology:
      'Obará é o orixá do vento e das folhas sagradas, detentor de grande sabedoria e misericórdia. É frequentemente identificado com o Odu Ogberé nos sagrados textos de Ifá. Obará representa a energia suave que sopra sobre a terra, trazendo renovação e cura através das folhas e ervas medicinais. Ele ensina que a verdadeira força está na gentileza e na capacidade de trazer paz onde há conflito.',
    spiritualLesson: 'A verdadeira sabedoria se manifesta na compaixão e na capacidade de trazer paz através da gentileza',
    affirmation: 'Eu respiro paz e harmonia, deixando o vento sagrado limpar meu caminho e trazer cura',
    meditation: 'Sinta o vento passando por você, carregando consigo a energia de cura e renovação',
  },
  {
    id: 'obara-meji',
    name: 'Obará Meji',
    namePortuguese: 'O Duplo Vento Sagrado',
    path: 'Obará',
    element: 'Ar e Água',
    colors: ['#2E8B57', '#98FB98', '#3CB371'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [12, 18, 24],
    greeting: 'Obará Meji!',
    archetype: 'O Senhor dos Ventos Gêmeos',
    qualities: ['Equilíbrio', 'Duplicidade', 'Sabedoria oculta', 'Meditação', 'Transparência', 'Luz'],
    challenges: ['Confusão', 'Dúvida constante', 'Procrastinação', 'Medo do desconhecido'],
    rulingPlanet: 'Netuno e Lua',
    sacredAnimals: ['Bode branco', 'Pássaro azul', 'Tartaruga'],
    plants: ['Ervas brancas', 'Alface silvestre', 'Folhas prateadas'],
    offerings: ['Água de obí branca', 'Milho branco', 'Velas brancas e verdes', 'Frutas brancas', 'Farinha de milho'],
    chants: ['Obará Meji', 'Meji Meji', 'Oru o maa se'],
    symbols: ['Vento duplo', 'Folhas gêmeas', 'Coroa dupla', 'Círculo de paz'],
    mythology:
      'Obará Meji representa o aspecto de duality e equilíbrio do orixá Obará, onde duas forças de vento se encontram para criar harmonia. Este aspecto de Obará está diretamente conectado ao Odu Meji, symbolizando a necessidade de manter equilíbrio entre luz e escuridão, masculina e feminina, ação e passividade. Obará Meji ensina que a verdadeira sabedoria está em compreender que todos os opostos são necessários para a completude.',
    spiritualLesson: 'O equilíbrio entre opostos é a chave para a iluminação; abrace a dualidade com sabedoria',
    affirmation: 'Eu encontro equilíbrio entre todos os aspectos da minha vida, harmanizando luz e sombra',
    meditation: 'Visualize dois ventos se encontrando e formando um redemoinho pacífico ao seu redor',
  },
];

export function getData(): ObaraData[] {
  return OBARA_DATA;
}

export function getDataById(id: string): ObaraData | undefined {
  return OBARA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): ObaraData[] {
  const q = query.toLowerCase();
  return OBARA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.qualities.some((qlt) => qlt.toLowerCase().includes(q)) ||
      o.symbols.some((sym) => sym.toLowerCase().includes(q))
  );
}

export function getObaraByElement(element: string): ObaraData[] {
  return OBARA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}