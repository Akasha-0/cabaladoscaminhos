// @ts-nocheck
// SKIP_LINT

/**
 * Obá Data Module
 * Spiritual data for Obá, the orixá of fire, cooking, and domestic wisdom
 */

export interface ObaData {
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

const OBA_DATA: ObaData[] = [
  {
    id: 'oba',
    name: 'Obá',
    namePortuguese: 'Senhora do Fogo Sagrado',
    path: 'Obá',
    element: 'Fogo e Água',
    colors: ['#DC143C', '#F5F5F5', '#FFD700'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [7, 11, 21],
    greeting: 'Epo Obá!',
    archetype: 'A Guardiã do Fogo Doméstico',
    qualities: ['SABEDORIA', 'Disciplina', 'Honra', 'Proteção', 'Nobreza', 'Paciência'],
    challenges: ['Orgulho', 'Rigidez', 'Possessividade', 'Perfeccionismo'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cobra', 'Coruja', 'Galo'],
    plants: ['Pimenta', 'Alfavaca', 'Manjericão'],
    offerings: ['Azeite de dendê vermelho', 'Velas vermelhas e brancas', 'Fogo de vela', 'Frango', 'Feijão', 'Ervas'],
    chants: ['Epo Obá', 'Obá', 'Fogo sagrado'],
    symbols: ['Fogo', 'Panela', 'Espada', 'Bacia'],
    mythology:
      'Obá é a orixá do fogo sagrado, da culinária e da sabedoria doméstica. É uma das esposas de Xangô, o orixá do trovão, e junto com Iansã e Oyá forma o círculo de poder de Xangô. Obá é a guardiã do fogo que alimenta o lar, proporcionando calor, alimento e proteção para a família. Ela ensina que a verdadeira força está em nutrir e proteger aqueles que amamos.',
    spiritualLesson: 'A verdadeira sabedoria está em cuidar do sagrado em cada ato doméstico e alimentar os outros com amor',
    affirmation: 'Eu nutro minha família com sabedoria e amor, mantendo o fogo sagrado da minha casa',
    meditation: 'Visualize uma chama dançando no centro do seu lar, alimentando todos com calor e luz',
  },
  {
    id: 'oba-oyon',
    name: 'Obá Oyón',
    namePortuguese: 'A Dama do Fogo',
    path: 'Obá',
    element: 'Fogo e Terra',
    colors: ['#FF4500', '#FFD700', '#DC143C'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [9, 14, 27],
    greeting: 'Obá Oyón!',
    archetype: 'A Senhora das Chamas',
    qualities: ['Força', 'Determinação', 'Nobreza', 'Bravura', 'Sabedoria', 'Honra'],
    challenges: ['Irritabilidade', 'Ciúmes', 'Orgulho', 'Impetuosidade'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cobra d\'água', 'Lagarto', 'Galo vermelho'],
    plants: ['Pimenta vermelha', 'Arruda', 'Alecrim'],
    offerings: ['Velas vermelhas', 'Azeite de dendê', 'Fogo sagrado', 'Galinha', 'Vinho de palmeira', 'Ervas sagradas'],
    chants: ['Obá Oyón', 'Fogo queima', 'Xangô Obá'],
    symbols: ['Chama', 'Panela de barro', 'Espada flamejante', 'Bacia de água'],
    mythology:
      'Obá Oyón é o aspecto guerreiro de Obá, conhecida como a Dama das Chamas. Ela representa o poder transformador do fogo que purifica e fortalece. Quando Xangô precisa de força nas batalhas, Obá Oyón surge para proteger e fortalecer seus guerreiros. Ela é a guardiã do fogo sagrado que queima tudo o que não serve ao crescimento espiritual.',
    spiritualLesson: 'O fogo purifica e transforma; deixe arder o que precisa ser consumido para que o novo possa nascer',
    affirmation: 'Eu transformo minha vida através do fogo sagrado da purificação, eliminando o que não serve',
    meditation: 'Imagine uma chama pura consumindo todas as energias negativas ao seu redor, deixando apenas luz',
  },
];

export function getData(): ObaData[] {
  return OBA_DATA;
}

export function getDataById(id: string): ObaData | undefined {
  return OBA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): ObaData[] {
  const lowerQuery = query.toLowerCase();
  return OBA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.path.toLowerCase().includes(lowerQuery)
  );
}

export function getObaByElement(element: string): ObaData[] {
  return OBA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}