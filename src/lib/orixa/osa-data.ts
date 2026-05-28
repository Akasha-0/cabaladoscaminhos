// @ts-nocheck
// SKIP_LINT

/**
 * Oxá Data Module
 * Spiritual data for Oxá, the orixá of dawn, aurora, and new beginnings
 */

export interface OsaData {
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

const OSA_DATA: OsaData[] = [
  {
    id: 'osa',
    name: 'Oxá',
    namePortuguese: 'Senhor da Aurora e dos Novos Começos',
    path: 'Oxá',
    element: 'Ar e Fogo',
    colors: ['#FFA500', '#FFD700', '#FF8C00'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [5, 7, 14],
    greeting: 'Epararoi Oxá!',
    archetype: 'O Despertador da Consciência',
    qualities: ['Iluminação', 'Renovação', 'Esperança', 'Vitalidade', 'Criatividade', 'Inspiração'],
    challenges: ['Impaciência', 'Excesso de energia', 'Instabilidade', 'Temperamento quente'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Galho seco', 'Papagaio', 'Pavão'],
    plants: ['Ixó', 'Al尾部', 'Mastruz', 'Alfavaca'],
    offerings: ['Quiabo assado', 'Milho torrado', 'Velas douradas', 'Farinha de rosca', 'Água de obí', 'Flores amarelas'],
    chants: ['Epararoi Oxá', 'Oxá ke', 'Oxa o'],
    symbols: ['Aurora', 'Sol nascente', 'Pena', 'Espelho'],
    mythology:
      'Oxá é o orixá da aurora e dos novos começos, representando a luz que dissipa as trevas e traz renovação. É frequentemente identificado com o Odu Ejila nos sagrados textos de Ifá. Oxá traz a energia do despertar da consciência, inspirando a humanidade a buscar a verdade e a sabedoria. Ele ensina que cada amanhecer traz consigo a oportunidade de recomeçar com luz e clareza.',
    spiritualLesson: 'A verdadeira iluminação vem do despertar interior que renova a alma a cada novo dia',
    affirmation: 'Eu abraço cada amanhecer como uma oportunidade de renovação e iluminação verdadeira',
    meditation: 'Visualize o sol nascente dentro de você, dissolvendo todas as sombras e trazendo clareza',
  },
  {
    id: 'osa-meji',
    name: 'Oxá Meji',
    namePortuguese: 'A Aurora Dourada Iluminada',
    path: 'Oxá',
    element: 'Ar e Terra',
    colors: ['#DAA520', '#B8860B', '#CD853F'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [10, 16, 22],
    greeting: 'Oxá Meji Oriê!',
    archetype: 'O Senhor da Sabedoria Solar',
    qualities: ['Sabedoria divina', 'Justiça', 'Proteção', 'Honestidade', 'Liderança', 'Verdade'],
    challenges: ['Orgulho', 'Rigidez', 'Exigência excessiva', 'Inflexibilidade'],
    rulingPlanet: 'Sol e Marte',
    sacredAnimals: ['Bode branco', 'Leão', 'Falcão'],
    plants: ['Ervas douradas', 'Mastruz', 'Manjericão', 'Alecrim'],
    offerings: ['Quiabo assado', 'Velas douradas e vermelhas', 'Farinha de rosca', 'Milho torrado', 'Gelo', 'Flores amarelas e vermelhas'],
    chants: ['Oxá Meji', 'Oriê Oxá', 'Ogun ku', 'Epararoi'],
    symbols: ['Sol radioso', 'Espada de luz', 'Coroa solar', 'Balança da justiça'],
    mythology:
      'Oxá Meji representa o aspecto mais poderoso e radiante do orixá Oxá, onde a luz do sol atinge sua máxima expressão. Este aspecto de Oxá está diretamente conectado ao Odu Meji, simbolizando a união das forças cósmicas em sua forma mais pura. Oxá Meji é o protector dos justos e o revelador da verdade, trazendo a luz que expõe todas as sombras e protege contra o mal. Ele ensina que a verdadeira força está na luz que ilumina sem destruir.',
    spiritualLesson: 'A verdadeira força está na luz que ilumina e protege, não na que queima e destrói',
    affirmation: 'Eu sou iluminado pela luz divina que protege e guia meus passos na verdade',
    meditation: 'Sinta a luz dourada do sol envolvendo todo o seu ser, trazendo proteção e sabedoria',
  },
];

export function getData(): OsaData[] {
  return OSA_DATA;
}

export function getDataById(id: string): OsaData | undefined {
  return OSA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OsaData[] {
  const q = query.toLowerCase();
  return OSA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.archetype.toLowerCase().includes(q)
  );
}

export function getOsaByElement(element: string): OsaData[] {
  return OSA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}
