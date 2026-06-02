 
// @ts-nocheck
// SKIP_LINT

/**
 * Oyanda Data Module
 * Spiritual data for Oyanda, the orixá of transformation and wisdom
 */

export interface OyandaData {
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

const OYANDA_DATA: OyandaData[] = [
  {
    id: "oyanda",
    name: "Oyanda",
    namePortuguese: "Oyanda",
    path: "O Senhor da Transformacao",
    element: "fogo",
    colors: ["vermelho", "laranja", "dourado"],
    dayOfWeek: "tera-feira",
    numbersSacred: [3, 7, 21],
    greeting: "Eêê Oyanda!",
    archetype: "Transformacao e Sabedoria",
    qualities: [
      "transformacao",
      "sabedoria",
      "forca",
      "coragem",
      "maturidade",
      "perseveranca"
    ],
    challenges: [
      "rigidez",
      "excesso de severidade",
      "dificuldade em aceitar mudanca",
      "orgulho"
    ],
    rulingPlanet: "Marte",
    sacredAnimals: ["leao", "falcao"],
    plants: ["pimenta", "gengibre", "plantas vermelhas"],
    offerings: ["pimenta vermelha", "vinho vermelho", "frango assado", "milho torrado"],
    chants: ["Ora Oyanda", "Oyanda Oê", "Eê Oyanda"],
    symbols: ["espada", "bastão de comando", "escudo"],
    mythology:
      "Oyanda e o orixa que governa a transformacao e a sabedoria earned through experience. E conhecido por sua forca e coragem, mas tambem por sua capacidade de guiar os seres humanos pelo caminho da evolucao espiritual. Oyanda representa o fogo purificador que transforma a materia prima em algo mais elevado.",
    spiritualLesson:
      "A verdadeira sabedoria vem da transformacao. So atraves da mudanca podemos evoluir e nos tornar quem verdadeiramente somos.",
    affirmation:
      "Eu sou forca e transformacao. Minha sabedoria me guia para a evolucao constante.",
    meditation:
      "Sinta o calor do fogo interior. Visualize a chama purificando suas limitacoes e transformando-as em luz."
  }
];

export function getData(): OyandaData[] {
  return OYANDA_DATA;
}

function getDataById(id: string): OyandaData | undefined {
  return OYANDA_DATA.find((o) => o.id === id);
}

function searchData(query: string): OyandaData[] {
  const lowerQuery = query.toLowerCase();
  return OYANDA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery)
  );
}

function getOyandaByElement(element: string): OyandaData[] {
  return OYANDA_DATA.filter((o) => o.element.toLowerCase() === element.toLowerCase());
}
