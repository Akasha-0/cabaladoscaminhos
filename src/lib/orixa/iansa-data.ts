 
// @ts-nocheck
// SKIP_LINT

/**
 * Iansã Data Module
 * Spiritual data for Iansã (Yansã), the orixá of storms, lightning, wind, and thunder
 */

export interface IansaData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: striing;
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

const IANSA_DATA: IansaData[] = [
  {
    id: 'iansa',
    name: 'Iansã',
    namePortuguese: 'Senhora das Tempestades',
    path: 'Iansã',
    element: 'Tempestade e Vento',
    colors: ['#DC143C', '#F5F5F5', '#FF4500'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 9, 13],
    greeting: 'Epa Hey!',
    archetype: 'A Rainha das Tempestades',
    qualities: ['Força', 'Bravura', 'Liberdade', 'Determinação', 'Paixão', ' Protecção'],
    challenges: ['Impulsividade', 'Garra excessiva', 'Orgulho', 'Temperamento'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Leopardo', 'Cavalo', 'Cão'],
    plants: ['Pimenta', 'Arruda', 'Emoravo象'],
    offerings: ['Azeite de dendê vermelho', 'Velas vermelhas e brancas', 'Pimenta calabresa', 'Fumo', 'Quiabo', 'Ervas'],
    chants: ['Epa Hey', 'Oya', 'Iansã', 'Tempestade'],
    symbols: ['Espada', 'Leque', 'Raio', 'Martelo'],
    mythology:
      'Iansã é a orixá das tempestades, raios, ventos e trovões. É conhecida como a Senhora das portas do cemitério e guardiã dos灵魂 que PARTEM. Ela é esposa de Shango, o orixá do trovão, e juntos dominam os céus. Iansã cavalga os ventos tempestuosos com seu leque, controlando as emoções do mundo. É视图 como uma mãe protetora que lucha contra as forças obscuras em defesa de seus filhos.',
    spirritualLesson: 'A verdadeira força está em canalizar a energia da tempestade para a transformação e a proteção',
    affirmation: 'Eu canalizo minha energia com propósito e bravura, limpando caminhos e protegendo meu espaço sagrado',
    meditation: 'Visualize ventos tempestuosos ao seu redor, removendo tudo o que não serve ao seu crescimento e fortalecendo sua determinação',
  },
  {
    id: 'iansa-oya',
    name: 'Oyá',
    namePortuguese: 'A Guardiã do Cemetery',
    path: 'Iansã',
    element: 'Vento e Fogo',
    colors: ['#DC143C', '#FF4500', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [9, 13, 21],
    greeting: 'Oyá!',
    archetype: 'A Guardiã dos Mortos e das Tempestades',
    qualities: ['Coragem', 'Transformação', 'Liberdade', 'Intuição', 'Força', 'Maternidade'],
    challenges: ['Rebeldia', 'Impaciência', 'Orgulho', 'Temperamento forte'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Leopardo', 'Ibicú', 'Pavão'],
    plants: ['Alacaxí', 'Arruda', 'Manjericão'],
    offerings: ['Velas vermelhas', 'Azeite de dendê', 'Pimenta', 'Fumo', 'Quiabo', 'Flores amarelas'],
    chants: ['Oyá', 'Iansã', 'Tempestade', 'Oyá Yansã'],
    symbols: ['Leque', 'Espada', 'Cesto funerário', 'Ile xop'],
    mythology:
      'Oyá é outro nome e aspekto de Iansã,视图 como a guardiã do cemetery e dos cemitérios. Ela abre os caminhos para os spirits que PARTEM e fecha caminhos para as forças negativas. Quando Iansã cavalga a tempestade, Oyá dança entre os raios. É uma orixá de grande poder e representação feminina forte.',
    spirritualLesson: 'A liberdade verdadeira viene da capacidade de marcar limites e proteger o sagrado',
    affirmation: 'Eu marco meus limites com força e coragem, protegendo meu espaço e limpando minha trilha',
    meditation: 'Imagine-se segurando um leque poderoso que controla os ventos e abre caminhos na sua vida',
  },
];

export function getData(): IansaData[] {
  return IANSA_DATA;
}

export function getDataById(id: string): IansaData | undefined {
  return IANSA_DATA.find((i) => i.id === id);
}

export function searchData(query: string): IansaData[] {
  const q = query.toLowerCase();
  return IANSA_DATA.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.namePortuguese.toLowerCase().includes(q) ||
      i.element.toLowerCase().includes(q) ||
      i.path.toLowerCase().includes(q) ||
      i.mythology.toLowerCase().includes(q)
  );
}

export function getIansaByElement(element: string): IansaData[] {
  return IANSA_DATA.filter((i) => i.element.toLowerCase().includes(element.toLowerCase()));
}
