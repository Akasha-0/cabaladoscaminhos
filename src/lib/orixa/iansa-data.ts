
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
    rulingPlanet: 'Urano',
    sacredAnimals: ['Leopardo', 'Ibicú', 'Pavão'],
    plants: ['Alacaxí', 'Arruda', 'Manjericão'],
    offerings: ['Velas vermelhas', 'Azeite de dendê', 'Pimenta', 'Fumo', 'Quiabo', 'Flores amarelas'],
    chants: ['Oyá', 'Iansã', 'Tempestade', 'Oyá Yansã'],
    symbols: ['Leque', 'Espada', 'Cesto funerário', 'Ile xop'],
   mythology:
     'Oyá é outro nome e aspecto de Iansã, vista como a guardiã do cemitério e dos espíritos ancestrais. Ela abre os caminhos para os espíritos que partem e fecha caminhos para as forças negativas. Quando Iansã cavalga a tempestade, Oyá dança entre os raios. É uma orixá de grande poder e representação feminina forte.',
   spiritualLesson: 'A liberdade verdadeira vem da capacidade de marcar limites e proteger o sagrado',
   affirmation: 'Eu sou a força da tempestade que limpa e renova. Tenho o poder de abrir caminhos com minha determinação e coragem.',
    meditation: 'Imagine-se segurando um leque poderoso que controla os ventos e abre caminhos na sua vida',
  },
  {
    id: 'iansa-oya',
    name: 'Oyá',
    namePortuguese: 'A Guardiã do Cemitério',
    path: 'Iansã',
    element: 'Vento e Fogo',
    colors: ['Laranja', 'Amarelo', 'Vermelho'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [9, 13, 21],
    greeting: 'Oyá!',
    archetype: 'A Guardiã dos Mortos e das Tempestades',
    qualities: ['Coragem', 'Transformação', 'Liberdade', 'Intuição', 'Força', 'Maternidade'],
    challenges: ['Rebeldia', 'Impaciência', 'Orgulho', 'Temperamento forte'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Leopardo', 'Ibicú', 'Pavão'],
    plants: ['Alacaxí', 'Arruda', 'Manjericão'],
    offerings: ['Velas vermelhas', 'Azeite de dendê', 'Pimenta', 'Fumo', 'Quiabo', 'Flores amarelas'],
    chants: ['Oyá', 'Iansã', 'Tempestade', 'Oyá Yansã'],
    symbols: ['Leque', 'Espada', 'Cesto funerário', 'Ile xop'],
    mythology:
      'Oyá é outro nome e aspecto de Iansã, vista como a guardiã do cemitério e dos espíritos ancestrais. Ela abre os caminhos para os espíritos que partem e fecha caminhos para as forças negativas. Quando Iansã cavalga a tempestade, Oyá dança entre os raios. É uma orixá de grande poder e representação feminina forte.',
    spiritualLesson: 'A liberdade verdadeira vem da capacidade de marcar limites e proteger o sagrado',
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
