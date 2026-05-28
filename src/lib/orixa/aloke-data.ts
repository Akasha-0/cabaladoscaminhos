/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Alokê Data Module
 * Spiritual data for Alokê, Orixá associated with light and illumination
 */

export interface AlokeData {
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

const ALOKE_DATA: AlokeData[] = [
  {
    id: "aloke",
    name: "Alokê",
    namePortuguese: "Alokê",
    path: "Luz e Iluminação",
    element: "luz",
    colors: ["amarelo", "dourado", "branco"],
    dayOfWeek: "sexta-feira",
    numbersSacred: [3, 7, 21],
    greeting: "Alokê Oiê!",
    archetype: "Luz, Sabedoria e Iluminação Interior",
    qualities: [
      "iluminação",
      "sabedoria",
      "clareza mental",
      "verdade",
      "discernimento",
      "orientação espiritual"
    ],
    challenges: [
      "orgulho intelectual",
      "arrogância",
      "rigidez de pensamento",
      "dificuldade em aceitar sombras"
    ],
    rulingPlanet: "Sol",
    sacredAnimals: ["leão", "águia", "coruja"],
    plants: ["girassol", "calêndula", "hipérico"],
    offerings: ["mel", "flores amarelas", "velas douradas", "frutas douradas", "incenso de sálvia"],
    chants: ["Alokê Oiê", "Ora Alokê", "Alokê Laroyê"],
    symbols: ["sol", "chama", "olho sagrado", "espelho de luz"],
    mythology:
      "Alokê é o orixá da luz e da iluminação, aquele que dissipa as trevas da ignorância e revela a verdade interior. É associado à luz solar que ilumina o caminho espiritual, trazendo clareza aos que buscam conhecimento verdadeiro. Alokê abre os olhos da alma para enxergar além das aparências.",
    spiritualLesson:
      "A verdadeira luz não está fora de nós, mas sim na chama interior que ilumina nossa essência. Buscar a sabedoria verdadeira significa também integrar nossas sombras, não apenas a luz.",
    affirmation:
      "Eu sou a luz que ilumina meu caminho. Minha sabedoria interior revela a verdade com clareza e amor.",
    meditation:
      "Sente-se em silêncio. Visualize uma luz dourada emanando do seu centro, expandindo-se até envolver completamente seu ser, iluminando cada canto da sua alma e dissipando qualquer escuridão."
  }
];

export function getData(): AlokeData[] {
  return ALOKE_DATA;
}

export function getDataById(id: string): AlokeData | undefined {
  return ALOKE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): AlokeData[] {
  const q = query.toLowerCase();
  return ALOKE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.mythology.toLowerCase().includes(q)
  );
}

export function getAlokeByElement(element: string): AlokeData[] {
  return ALOKE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getAlokeByDay(day: string): AlokeData[] {
  return ALOKE_DATA.filter((o) => o.dayOfWeek.toLowerCase() === day.toLowerCase());
}
