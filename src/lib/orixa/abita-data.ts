/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Abita Data Module
 * Spiritual data for Abita, the orixá of earth, stability, and grounding energy
 */

export interface AbitaData {
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
  sacredObjects: string[];
  invocationPhrases: string[];
  domains: string[];
}

const ABITA_DATA: AbitaData[] = [
  {
    id: 'abita',
    name: 'Abita',
    namePortuguese: 'Senhor da Terra Firme',
    path: 'Abita',
    element: 'Terra e Estabilidade',
    colors: ['#8B4513', '#D2691E', '#DEB887'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [4, 8, 13],
    greeting: 'Abita!',
    archetype: 'O Fundamento do Mundo',
    qualities: ['Estabilidade', 'Ancoragem', 'Paciência', 'Persistência', 'Firmeza', 'Confiança'],
    challenges: ['Rigidez', 'Teimosia', 'Resistência à mudança'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Tartaruga', 'Boi', 'Elefante'],
    plants: ['Mandioca', 'Batata-doce', 'Milho', 'Feijão'],
    offerings: ['Terra vermelha', 'Farinha de tapioca', 'Mel', 'Velas marrons', 'Copos de água'],
    chants: ['Abita', 'Ogunhe', 'Ibeji'],
    symbols: ['Pá', 'Enxada', 'Terra arada', 'Mandacaru'],
    mythology:
      'Abita é o orixá que governa a terra e a estabilidade. Ele é o responsável por manter o mundo firme sob nossos pés. Abita representa a foundation sobre a qual toda vida é construída, sendo venerado como aquele que segura a terra e garante que ela não se abra.',
    spiritualLesson: 'A verdadeira força vem da ancoragem profunda na terra e na estabilidade interior',
    affirmation: 'Eu estou profundamente ancorado na terra, firme em minha propósito e nutrido pela energia de Abita',
    meditation: 'Visualize suas raízes descendo profundamente na terra, absorvendo a energia estabilizadora de Abita',
    sacredObjects: ['Terra vermelha', 'Pá', 'Semente', 'Pedra'],
    invocationPhrases: [
      'Abita, firma meus pés na terra',
      'Abita, dá-me estabilidade',
      'Abita, ancora meu espírito'
    ],
    domains: [
      'terra',
      'estabilidade',
      'ancoragem',
      'construção',
      'fundação',
      'persistência',
      'nutrição'
    ],
  },
];

export function getData(): AbitaData[] {
  return ABITA_DATA;
}

export function getDataById(id: string): AbitaData | undefined {
  return ABITA_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AbitaData[] {
  const lowerQuery = query.toLowerCase();
  return ABITA_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.path.toLowerCase().includes(lowerQuery) ||
      a.element.toLowerCase().includes(lowerQuery) ||
      a.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      a.domains.some((d) => d.toLowerCase().includes(lowerQuery))
  );
}

export function getAbitaByDay(day: string): AbitaData[] {
  return ABITA_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getAbitaByElement(element: string): AbitaData[] {
  return ABITA_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}

export function getSacredObjects(): string[] {
  return ABITA_DATA.flatMap((a) => a.sacredObjects);
}

export function getInvocationPhrases(): string[] {
  return ABITA_DATA.flatMap((a) => a.invocationPhrases);
}

export function getDomains(): string[] {
  return ABITA_DATA.flatMap((a) => a.domains);
}