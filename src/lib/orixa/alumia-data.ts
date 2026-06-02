// @ts-nocheck
// SKIP_LINT

/**
 * Alumiá Data Module
 * Spiritual data for Alumiá, the orixá of transformation and rebirth
 */

export interface AlumiaData {
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

const ALUMIA_DATA: AlumiaData[] = [
  {
    id: "alumia",
    name: "Alumiá",
    namePortuguese: "Alumiá",
    path: "Senhor da Transmutação",
    element: "fogo e ar",
    colors: ["roxo", "violeta", "indigo"],
    dayOfWeek: "quinta-feira",
    numbersSacred: [3, 7, 9],
    greeting: "Alumiaê!",
    archetype: "Transformação e Renovação",
    qualities: [
      "renovação",
      "transmutação",
      "sabedoria oculta",
      "clareza mental",
      "libertação",
      "proteção espiritual"
    ],
    challenges: [
      "rigidez emocional",
      "resistência à mudança",
      "dificuldade em perdoar",
      "hermetismo excessivo"
    ],
    rulingPlanet: "Netuno",
    sacredAnimals: ["coruja", "borboleta"],
    plants: ["lavanda", "salvia", "alecrim"],
    offerings: ["vinho tinto", "incenso de sálvia", "velas roxas", "pedras ametista"],
    chants: ["Alumia Oê", "Sarê Alumia", "Alumiaê Abaluaê"],
    symbols: ["pirâmide", "chama tríplice", "espiral ascendente"],
    mythology:
      "Alumiá é o orixá que governa os processos de transformação e morte iniciática. É quem conduz as almas através das portas da renovação, permitindo que o velho morra para que o novo nasça. Está associado aos mistérios da alquimia interior e à destruição criativa.",
    spiritualLesson:
      "A morte não é fim, mas transformação. Cada fim carrega em si a semente de um novo começo. A verdadeira sabedoria está em saber quando soltar o antigo para abraçar o novo.",
    affirmation:
      "Eu me transformo a cada instante. Solto o que precisa morrer para que o novo floresça em mim.",
    meditation:
      "Sente-se em silêncio. Visualize uma chama violeta envolvendo seu corpo, consumindo o que precisa ser libertado e transformando cinzas em luz pura."
  }
];

export function getData(): AlumiaData[] {
  return ALUMIA_DATA;
}

function getDataById(id: string): AlumiaData | undefined {
  return ALUMIA_DATA.find((o) => o.id === id);
}

function searchData(query: string): AlumiaData[] {
  const q = query.toLowerCase();
  return ALUMIA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q))
  );
}

function getAlumiaByElement(element: string): AlumiaData[] {
  return ALUMIA_DATA.filter((o) => o.element.includes(element.toLowerCase()));
}

function getAlumiaByDay(day: string): AlumiaData[] {
  return ALUMIA_DATA.filter((o) => o.dayOfWeek.includes(day.toLowerCase()));
}