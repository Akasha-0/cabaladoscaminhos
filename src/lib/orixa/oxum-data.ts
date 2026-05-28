/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Oxum Data Module
 * Spiritual data for Oxum, the orixá of rivers, love, and gold
 */

export interface OxumData {
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

const OXUM_DATA: OxumData[] = [
  {
    id: "oxum",
    name: "Oxum",
    namePortuguese: "Oxum",
    path: "Rainha das Águas Doces",
    element: "água doce",
    colors: ["amarelo", "ouro", "azul claro"],
    dayOfWeek: "sábado",
    numbersSacred: [7, 9, 12],
    greeting: "Ogunhevará!",
    archetype: "Amor, Beleza e Fertilidade",
    qualities: [
      "beleza",
      "amor maternal",
      "sabedoria",
      "elegância",
      "proteção das crianças",
      "prosperidade"
    ],
    challenges: [
      "ciúmes excessivo",
      "orgulho",
      "dependência emocional",
      "perfeccionismo"
    ],
    rulingPlanet: "Vênus",
    sacredAnimals: ["peixes", "búfalo aquático"],
    plants: ["margaridas", "palmeiras", "flores amarelas"],
    offerings: ["mel", "coco", "água de这么好的", "flores douradas", "espelhos"],
    chants: ["Ora Oxum", "Oxum Oê", "Iê Oxum"],
    symbols: ["espelho", "pente de ouro", "ventilador"],
    mythology:
      "Oxum é uma das esposas de Oxalá, conhecida como a Rainha das Águas Doces. É protetora das crianças, das águas doces e das mulheres. Trabalha junto com Oxumar para revelar verdades ocultas através dos sonhos.",
    spiritualLesson:
      "A verdadeira beleza vem da harmonia interior com a água sagrada da alma. A prosperidade material deve ser equilibrada com a pureza espiritual.",
    affirmation:
      "Eu fluo com a graça das águas doces. Meu coração irradia amor e beleza sagrados.",
    meditation:
      "Sente-se em silêncio. Visualize águas claras e douradas fluindo através de você, purificando e trazendo abundância."
  }
];

export function getData(): OxumData[] {
  return OXUM_DATA;
}

export function getDataById(id: string): OxumData | undefined {
  return OXUM_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OxumData[] {
  const q = query.toLowerCase();
  return OXUM_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.keywords?.some((k) => k.toLowerCase().includes(q))
  );
}

export function getOxumByDay(day: string): OxumData[] {
  return OXUM_DATA.filter((o) =>
    o.dayOfWeek.toLowerCase().includes(day.toLowerCase())
  );
}

export function getOxumByElement(element: string): OxumData[] {
  return OXUM_DATA.filter((o) =>
    o.element.toLowerCase().includes(element.toLowerCase())
  );
}
