/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck

/**
 * Obaluaye Data Module
 * Spiritual data for Obaluaye, the orixá of earth, disease, and healing
 */

export interface ObaluayeData {
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

const OBALUAYE_DATA: ObaluayeData[] = [
  {
    id: 'obaluaye',
    name: 'Obaluaye',
    namePortuguese: 'Senhor da Terra e das Doenças',
    path: 'Obaluaye',
    element: 'Terra e Fogo',
    colors: ['#FFD700', '#228B22', '#8B4513'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Eubarim!',
    archetype: 'O Senhor das Epidemias e da Cura',
    qualities: ['Poder', 'Transformação', 'Justiça', 'Proteção', 'Sabedoria', 'Cura'],
    challenges: ['Punição', 'Doença', 'Rigidez'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Búfalo', 'Cobra'],
    plants: ['Pau-brasil', 'Babosa', 'Boldo'],
    ofertas: ['Azeite de dendê', 'Farinha de mandioca', 'Quiabo', 'Fumo', 'Goma'],
    chants: ['Eubarim', 'Obaluaye', 'Oba'],
    symbols: ['Cabaça', 'Pá de cobre', 'Argolas de latão'],
    mythology:
      'Obaluaye é o orixá que governa a terra, as doenças e a cura. Ele tem o poder de enviar tanto pragas quanto saúde, e só pode ser apaziguado com as oferendas corretas.',
    spiritualLesson: 'A transformação através da dor traz renovação e sabedoria profunda',
    affirmation: 'Eu limpo minha vida de tudo que me faz mal e abraço a cura em todos os níveis do meu ser',
    meditation: 'Visualize a terra pura sob seus pés, absorvendo energias curativas que nutrem cada célula do seu corpo',
  },
  {
    id: 'obaluaye-aiê',
    name: 'Obaluaye Aiê',
    namePortuguese: 'Obaluaye da Terra Viva',
    path: 'Obaluaye',
    element: 'Terra',
    colors: ['#228B22', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [7, 9],
    greeting: 'Eubarim!',
    archetype: 'O Guardião da Fertilidade',
    qualities: ['Fertilidade', 'Abundância', 'Renovação', 'Nutrição', 'Conexão', 'Vitalidade'],
    challenges: ['Erosão', 'Esterilidade', 'Estagnação'],
    rulingPlanet: 'Terra',
    sacredAnimals: ['Tartaruga', 'Coelho'],
    plants: ['Mandioquinha', 'Inhame', 'Algodão'],
    ofertas: ['Frutas da terra', 'Mel', 'Ovos', 'Terra vermelha'],
    chants: ['Oba aiê', 'Eubarim rum'],
    symbols: ['Terra', 'Raízes', 'Sementes'],
    mythology:
      'Obaluaye Aiê é a manifestação que governa a fertilidade da terra e dos seres. Ele bendiz plantações e traz abundância para aqueles que o veneram.',
    spiritualLesson: 'A terra oferece tudo que precisamos quando nos conectamos com sua sabedoria ancestral',
    affirmation: 'Eu sou fértil em todas as áreas da minha vida, criando abundância e renovação constante',
    meditation: 'Sinta a conexão com a terra mãe, permitindo que sua energia de abundância flua através de você',
  },
];

export function getData(): ObaluayeData[] {
  return OBALUAYE_DATA;
}

export function getDataById(id: string): ObaluayeData | undefined {
  return OBALUAYE_DATA.find((e) => e.id === id);
}

export function searchData(query: string): ObaluayeData[] {
  const lowerQuery = query.toLowerCase();
  return OBALUAYE_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.archetype.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}
