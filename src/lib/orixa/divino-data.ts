/* prettier-ignore */
// @ts-nocheck

/**
 * Divino Data Module
 * Spiritual data for Divino, Orixá of divine light and spiritual ascension
 */

export interface DivinoData {
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
  ascensionStages: string[];
  sacredGeometry: string[];
}

const DIVINO_DATA: DivinoData[] = [
  {
    id: "divino-1",
    name: "Divino",
    namePortuguese: "Divino",
    path: "divino",
    element: "Luz",
    colors: ["#FFD700", "#FFFFFF", "#87CEEB"],
    dayOfWeek: "Domingo",
    numbersSacred: [3, 7, 12, 33],
    greeting: "Bendito seja",
    archetype: "O Iluminado",
    qualities: [
      "Purificação espiritual",
      "Iluminação interior",
      "União com o divino",
      "Sabedoria sagrada",
      "Transcendência"
    ],
    challenges: [
      "Orgulho espiritual",
      "Fanatismo religioso",
      "Rigidez doutrinária"
    ],
    rulingPlanet: "Sol",
    sacredAnimals: ["Columba", "Fênix"],
    plants: ["Flor de lótus", "Crisântemo sagrado"],
    offerings: [
      "Ouro",
      "Incenso puro",
      "Água cristalina",
      "Flores brancas"
    ],
    chants: [
      "Ó Divino, luz que ilumina",
      "Purifica minha alma",
      "Guia-me para a verdade"
    ],
    symbols: ["Estrela de oito pontas", "Círculo de luz", "Sol radiante"],
    mythology: "Divino representa a luz suprema que emanou do Todo-Poderoso para iluminar todos os caminhos da criação. É a expressão pura da divindade manifestada em forma acessível aos seres humanos.",
    spiritualLesson: "A verdadeira iluminação vem da purificação interior e do reconhecimento da luz divina que habita em todos os seres.",
    affirmation: "Eu sou luz, eu sou divino, eu sou um com o todo sagrado.",
    meditation: "Visualize uma luz dourada preenchendo seu ser, dissolvendo todas as sombras e levando você à compreensão da natureza divina.",
    ascensionStages: [
      "Reconhecimento da luz interior",
      "Purificação do ego",
      "União com a consciência divina",
      "Transcendência espiritual",
      "Retorno como luz para o mundo"
    ],
    sacredGeometry: ["Círculo", "Hexagrama", "Flor da vida"]
  },
  {
    id: "divino-2",
    name: "Divino",
    namePortuguese: "Divino",
    path: "divino",
    element: "Fogo",
    colors: ["#FF4500", "#FF6347", "#FFD700"],
    dayOfWeek: "Quinta-feira",
    numbersSacred: [7, 21, 49],
    greeting: "Glória a Deus",
    archetype: "O Purificador",
    qualities: [
      "Fé inabalável",
      "Devoção profunda",
      "Transformação através do fogo sagrado",
      "Renascimento espiritual"
    ],
    challenges: [
      "Intolerância",
      "Proselitismo excessivo",
      "Juízo aos outros"
    ],
    rulingPlanet: "Marte",
    sacredAnimals: ["Águia", "Fênix"],
    plants: ["Alecrim", "Absinto"],
    offerings: [
      "Velas douradas",
      "Mel puro",
      "Salmoura sagrada",
      "Pão sem fermento"
    ],
    chants: [
      "Fogo sagrado que purifica",
      "Queima o que não serve",
      "Deixa apenas a verdade"
    ],
    symbols: ["Cruz de fogo", "Chama tríplice", "Espada de luz"],
    mythology: "Divino manifesta-se como o fogo purificador que transforma a escuridão em luz. Foi enviado para quemar tudo que é impuro e revelar a essência divina em cada criatura.",
    spiritualLesson: "O fogo divino não destrói a alma, mas transforma suas imperfeições em luz pura.",
    affirmation: "Que o fogo sagrado purifique meu ser e revele minha verdade divina.",
    meditation: "Sinta o calor do fogo divino atravessando seu corpo, queimando cada impureza e deixando apenas sua essência radiante.",
    ascensionStages: [
      "Chama da fé desperta",
      "Fogo da transformação aceita",
      "Arder da devoção profunda",
      "Resplandecer da sabedoria",
      "Unificação com a luz suprema"
    ],
    sacredGeometry: ["Triângulo", "Estrela de Davi", "Sagrado coração"]
  }
];

export function getData(): DivinoData[] {
  return DIVINO_DATA;
}

export function getDataById(id: string): DivinoData | undefined {
  return DIVINO_DATA.find((d) => d.id === id);
}

export function searchData(query: string): DivinoData[] {
  const lowerQuery = query.toLowerCase();
  return DIVINO_DATA.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.path.toLowerCase().includes(lowerQuery) ||
      d.archetype.toLowerCase().includes(lowerQuery) ||
      d.element.toLowerCase().includes(lowerQuery) ||
      d.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}

export function getDivinoByDay(day: string): DivinoData[] {
  return DIVINO_DATA.filter((d) => d.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getDivinoByElement(element: string): DivinoData[] {
  return DIVINO_DATA.filter((d) => d.element.toLowerCase().includes(element.toLowerCase()));
}