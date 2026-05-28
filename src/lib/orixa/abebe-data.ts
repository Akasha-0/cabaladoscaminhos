// @ts-nocheck
// SKIP_LINT

/**
 * Abebe Data Module
 * Spiritual data for Abebe, Orixá of transformation and sacred mysteries
 */

export interface AbebeData {
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
  transformationStages: string[];
  sacredGeometry: string[];
}

const ABEbe_DATA: AbebeData[] = [
  {
    id: "abebe",
    name: "Abebe",
    namePortuguese: "Abebe",
    path: "orixa-abebe",
    element: "Water and Earth",
    colors: ["Deep Blue", "Purple", "Black"],
    dayOfWeek: "Saturday",
    numbersSacred: [7, 9, 13],
    greeting: "Abebe O!",
    archetype: "The Transformer of Destinies",
    qualities: [
      "Deep intuition",
      "Mystery",
      "Transformation",
      "Wisdom",
      "Connection to ancestors",
      "Inner vision"
    ],
    challenges: [
      "Isolation",
      "Obscurity",
      "Forgetting purpose"
    ],
    rulingPlanet: "Neptune and the Moon",
    sacredAnimals: ["Owl", "Serpent", "Sea Turtle"],
    plants: ["Night-blooming jasmine", "Willow", "Mugwort"],
    offerings: ["Dark honey", "Incense of myrrh", "Black candles", "Sea water"],
    chants: ["Abebe ori ire", "Transform my path", "Illuminate the darkness"],
    symbols: ["Mirror", "The Serpent", "Waters of depth"],
    mythology: "Abebe is the keeper of hidden truths and the transformer of consciousness. Born from the union of the Moon and the deep waters, Abebe guides seekers through the shadow places of the self to emerge reborn.",
    spiritualLesson: "True transformation requires descending into the depths before rising in light.",
    affirmation: "I descend into wisdom and emerge transformed.",
    meditation: "I am the depths that transform.",
    transformationStages: [
      "Recognition",
      "Descent",
      "Integration",
      "Emergence",
      "Transcendence"
    ],
    sacredGeometry: ["Spiral", "Moon phases", "Deep waters circles"]
  }
];

export function getData(): AbebeData[] {
  return ABEbe_DATA;
}

export function getDataById(id: string): AbebeData | undefined {
  return ABEbe_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AbebeData[] {
  const lower = query.toLowerCase();
  return ABEbe_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.namePortuguese.toLowerCase().includes(lower) ||
      a.element.toLowerCase().includes(lower) ||
      a.archetype.toLowerCase().includes(lower) ||
      a.qualities.some((q) => q.toLowerCase().includes(lower))
  );
}

export function getAbebeByDay(day: string): AbebeData[] {
  return ABEbe_DATA.filter((a) =>
    a.dayOfWeek.toLowerCase().includes(day.toLowerCase())
  );
}

export function getAbebeByElement(element: string): AbebeData[] {
  return ABEbe_DATA.filter((a) =>
    a.element.toLowerCase().includes(element.toLowerCase())
  );
}