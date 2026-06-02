// @ts-nocheck
// SKIP_LINT

/**
 * Suporte Data Module
 * Spiritual data for Suporte, the sacred path of divine support, grounding, and stability
 */

export interface SuporteData {
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

const SUPORTE_DATA: SuporteData[] = [
  {
    id: 'suporte',
    name: 'Suporte',
    namePortuguese: 'O Refúgio Sagrado',
    path: 'Suporte',
    element: 'Terra e Água',
    colors: ['#2E8B57', '#8B4513', '#D2691E'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [2, 6, 10],
    greeting: 'Suporte!',
    archetype: 'O FUNDAMENTO ESTÁVEL',
    qualities: ['Fortalecimento', 'Estabilidade', 'Apoio', 'Raízes', 'Confiança', 'Conexão terrestrial'],
    challenges: ['Rigidez', 'Resistência à mudança', 'Excesso de dependência', 'Estagnação'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Tartaruga', 'Boi', 'Elefante'],
    plants: ['Raízes sagradas', 'Barbatimão', 'Bambú', 'Alface'],
    offerings: ['Água de oxum', 'Raízes de árvore', 'Farinha de mandioca', 'Mel', 'Velas verdes'],
    chants: ['Suporte ai', 'Ori ina', 'Elegbaotone'],
    symbols: ['Âncora', 'Raízes', 'Pedra', 'Coluna'],
    mythology: 'Suporte é o princípio sagrado da estabilidade e do apoio divino. Este caminho representa a energia que mantém tudo firme quando tudo ao redor ameaça desmoronar. É através do Suporte que recebemos a capacidade de permanecer enraizado na verdade, mesmo quando as tempestades espirituais tentam nos derrubar. O Suporte ensina que pedir ajuda não é fraqueza, mas sabedoria — pois nenhum ser pode existir sem o apoio do divino e da comunidade.',
    spiritualLesson: 'A verdadeira força não está em resistir sozinho, mas em permanecer conectado às raízes que nos sustentam',
    affirmation: 'Eu permito que forças superiores me apoiem, aceitando ajuda com gratidão e humildade',
    meditation: 'Visualize raízes profundas descendo da sua coluna até o centro da Terra, ancorando você em paz e estabilidade',
  },
];

export function getData(): SuporteData[] {
  return SUPORTE_DATA;
}

function getDataById(id: string): SuporteData | undefined {
  return SUPORTE_DATA.find((s) => s.id === id);
}

function searchData(query: string): SuporteData[] {
  const q = query.toLowerCase();
  return SUPORTE_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.namePortuguese.toLowerCase().includes(q) ||
      s.path.toLowerCase().includes(q) ||
      s.element.toLowerCase().includes(q) ||
      s.qualities.some((q) => q.toLowerCase().includes(q))
  );
}

function getSuporteByElement(element: string): SuporteData[] {
  return SUPORTE_DATA.filter((s) => s.element.toLowerCase().includes(element.toLowerCase()));
}
