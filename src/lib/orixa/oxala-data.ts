 
// @ts-nocheck
// SKIP_LINT

/**
 * Oxalá Data Module
 * Spiritual data for Oxalá, the orixá of creation, purity, and peace
 */

export interface OxalaData {
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

const OXALA_DATA: OxalaData[] = [
  {
    id: "oxala",
    name: "Oxalá",
    namePortuguese: "Oxalá",
    path: "O Criador e Pai de Todos",
    element: "alma",
    colors: ["branco", "ouro", "marfim"],
    dayOfWeek: "sexta-feira",
    chakra: "7º - Coronário",
    numbersSacred: [1, 8, 15],
    greeting: "Eêê Oxalá!",
    archetype: "Criação, Paz e Pureza",
    qualities: [
      "criação",
      "pureza",
      "paz",
      "sabedoria",
      "misericórdia",
      "paternidade",
      "genero"
    ],
    challenges: [
      "indecisão",
      "excesso de bondade",
      "passividade",
      "dificuldade em agir"
    ],
    rulingPlanet: "Sol",
    sacredAnimals: ["pombo branco", "coruja"],
    plants: ["algodoeiro", "palmeira", "plantas brancas"],
    offerings: ["alpiste", "milho branco", "flores brancas", "candeia", "água de flor"],
    chants: ["Ora Obatalá", "Oxalá Oê", "Eê Oxalá"],
    symbols: ["alabo", "ejá", "panela de barro", "bastão ceremonial"],
    mythology:
      "Oxalá é o pai de todos os orixás e o criador da humanidade. É considerado o mais velho e respeitado dos orixás. Foi preso por Oyá no caldeirão de Ossaim mas foi libertado por Eshu. Governa o lado direito do corpo e é o protetor das crianças.",
    spiritualLesson:
      "A verdadeira criação vem da pureza de intenção. A paz interior é a base de toda sabedoria verdadeira.",
    affirmation:
      "Eu sou luz pura e criação sagrada. Minha alma irradia paz e sabedoria eternas.",
    meditation:
      "Sente-se em paz. Visualize uma luz branca e dourada envolvendo você, purificando e trazendo harmonia."
  }
];

export function getData(): OxalaData[] {
  return OXALA_DATA;
}

export function getDataById(id: string): OxalaData | undefined {
  return OXALA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OxalaData[] {
  const q = query.toLowerCase();
  return OXALA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.archetype.toLowerCase().includes(q)
  );
}

export function getOxalaByElement(element: string): OxalaData[] {
  return OXALA_DATA.filter((o) => o.element.toLowerCase() === element.toLowerCase());
}
