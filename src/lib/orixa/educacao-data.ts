// @ts-nocheck
// SKIP_LINT

/**
 * Educacao Data Module
 * Spiritual data for Educação, the principle of wisdom, knowledge, and continuous learning
 */

export interface EducacaoData {
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

const EDUCACAO_DATA: EducacaoData[] = [
  {
    id: "educacao-01",
    name: "Educacao",
    namePortuguese: "Educação",
    path: "Path of Knowledge and Continuous Wisdom",
    element: "Knowledge",
    colors: ["Blue", "Gold"],
    dayOfWeek: "Thursday",
    numbersSacred: [3, 7, 12],
    greeting: "I learn with humility",
    archetype: "The Eternal Student",
    qualities: [
      "Wisdom",
      "Humility",
      "Curiosity",
      "Discernment",
      "Patience",
      "Teaching",
      "Openness"
    ],
    challenges: [
      "Arrogance",
      "Rigidity",
      "Resistance to new ideas",
      "Indifference to others' growth"
    ],
    rulingPlanet: "Mercury",
    sacredAnimals: ["Owl", "Dove"],
    plants: ["Sage", "Lavender", "Rosemary"],
    offerings: ["Books", "Ink", "Seeds of knowledge", "Gold coins"],
    chants: [
      "Orixá me guia na busca pela verdade",
      "Que a sabedoria ilumine meu caminho"
    ],
    symbols: ["Open book", "Light bulb", "Scales of justice"],
    mythology:
      "Educacao represents the divine principle of continuous learning and the transmission of wisdom across generations. It is the eternal flame that burns within those who seek truth, reminding us that knowledge is the greatest treasure one can possess.",
    spiritualLesson:
      "True wisdom comes from knowing how little we know, and from remaining forever open to learning. Education is not a destination but a lifelong journey of discovery.",
    affirmation: "I embrace learning with an open heart and mind",
    meditation:
      "I sit in stillness, allowing new knowledge to flow into my being like a gentle stream, enriching my soul with understanding and clarity."
  },
  {
    id: "educacao-02",
    name: "Educacao",
    namePortuguese: "Educação",
    path: "Path of Teaching and Mentorship",
    element: "Air",
    colors: ["White", "Silver"],
    dayOfWeek: "Wednesday",
    numbersSacred: [5, 9],
    greeting: "Share your wisdom",
    archetype: "The Mentor",
    qualities: [
      "Patience",
      "Clarity",
      "Empathy",
      "Inspiration",
      "Generosity",
      "Dedication"
    ],
    challenges: [
      "Impatience with beginners",
      "Hoarding knowledge",
      "Burning out while teaching"
    ],
    rulingPlanet: "Moon",
    sacredAnimals: ["Butterfly", "Crane"],
    plants: ["Mint", "Camomile", "Sweet basil"],
    offerings: ["Chalk", "Slate tablets", "Herbal tea", "White candles"],
    chants: [
      "Transmito o saber com amor",
      "Cada aprendiz traz nova luz"
    ],
    symbols: ["Chalkboard", "Pen", "Graduation cap"],
    mythology:
      "Educacao as mentor guides those who teach, Blessing them with patience and the ability to transfer understanding to others. Every lesson given plants seeds that will bloom in future generations.",
    spiritualLesson:
      "Teaching is also learning. When we share our knowledge, we deepen our own understanding and honor the chain of wisdom that came before us.",
    affirmation: "I teach with patience and inspire others to grow",
    meditation:
      "I breathe in the wisdom of generations past and breathe out understanding to those who seek my guidance, creating an endless cycle of growth."
  }
];

export function getData(): EducacaoData[] {
  return EDUCACAO_DATA;
}

export function getDataById(id: string): EducacaoData | undefined {
  return EDUCACAO_DATA.find((e) => e.id === id);
}

export function searchData(query: string): EducacaoData[] {
  const q = query.toLowerCase();
  return EDUCACAO_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.path.toLowerCase().includes(q) ||
      e.qualities.some((q) => q.toLowerCase().includes(q)) ||
      e.archetype.toLowerCase().includes(q)
  );
}

export function getEducacaoByDay(day: string): EducacaoData[] {
  return EDUCACAO_DATA.filter((e) => e.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getEducacaoByElement(element: string): EducacaoData[] {
  return EDUCACAO_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}
