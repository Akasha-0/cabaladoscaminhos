// @ts-nocheck
// SKIP_LINT

/**
 * Ozulum Data Module
 * Spiritual data for Ozulum, the orixá of underground waters and hidden mysteries
 */

export interface OzulumData {
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

const OZULUM_DATA: OzulumData[] = [
  {
    id: "ozulum",
    name: "Ozulum",
    namePortuguese: "Ozulum",
    path: "O Senhor das Aguas Subterraneas",
    element: "agua",
    colors: ["azul escuro", "azul marinho", "prata"],
    dayOfWeek: "sabado",
    numbersSacred: [3, 7, 15],
    greeting: "Eê Ozulum!",
    archetype: "Segredos e Aguas Profundas",
    qualities: [
      "mistério",
      "profundidade",
      "intuição",
      "resiliência",
      "sabedoria oculta",
      "conexão com o invisível"
    ],
    challenges: [
      "segredos guardados demais",
      "dificuldade em se expressar",
      "tendência ao isolamento",
      "resistência à superfície"
    ],
    rulingPlanet: "Netuno",
    sacredAnimals: ["enguia", "peixe de caverna", "serpente d'água"],
    plants: ["samambaia", "musgo", "plantas de sombra"],
    offerings: ["água de chuva", "farinha de mandioca", "pepino", "flores brancas"],
    chants: ["Ora Ozulum", "Ozulum Oê", "Eê Ozulum"],
    symbols: ["cálice de água", "caverna", "pedra úmida"],
    mythology:
      "Ozulum é o orixá que habita as águas subterrâneas e os segredos da terra. É conhecido por guardar conhecimentos antigos que não podem ser revelados abertamente. Governa os poços, nascentes profundas e as correntes invisíveis que correm sob a superfície do mundo. Ozulum ensina que a verdadeira sabedoria está no que é oculto e no poder do silêncio.",
    spiritualLesson:
      "Nem tudo precisa ser visível para ser verdadeiro. As águas profundas guardam respostas que a superfície jamais conheceria.",
    affirmation:
      "Eu sou profundidade e mistério. Minha sabedoria nasce do silêncio e da escuridão fértil.",
    meditation:
      "Sinta a presença da água subterrânea. Visualize correntes profundas fluindo sob a terra, carregando segredos antigos e sabedoria oculta."
  }
];

export function getData(): OzulumData[] {
  return OZULUM_DATA;
}

export function getDataById(id: string): OzulumData | undefined {
  return OZULUM_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OzulumData[] {
  const lowerQuery = query.toLowerCase();
  return OZULUM_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery)
  );
}

export function getOzulumByElement(element: string): OzulumData[] {
  return OZULUM_DATA.filter((o) => o.element.toLowerCase() === element.toLowerCase());
}