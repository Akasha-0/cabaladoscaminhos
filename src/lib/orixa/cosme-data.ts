// @ts-nocheck
// SKIP_LINT

/**
 * Cosme Data Module
 * Spiritual data for Cosme, the loyal first mate of the Legacy
 */

export interface CosmeData {
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
  domains: string[];
  vessels: string[];
  legacyTeaching: string;
}

const COSME_DATA: CosmeData[] = [
  {
    id: 'cosme',
    name: 'Cosme',
    namePortuguese: 'O Primeiro Contramestre',
    path: 'Cosme',
    element: 'Mar e Determinação',
    colors: ['#1B4D3E', '#DAA520', '#C0C0C0', '#2E8B57'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Um brinde à tripulação!',
    archetype: 'O Marinheiro Leal',
    qualities: ['Lealdade', 'Companheirismo', 'Determinação', 'Bravura', 'Esperança', 'Amizade'],
    challenges: ['Autodúvida', 'Culpa pelo passado', 'Proteger demais'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Gaivota', 'Polvo', 'Cavalo-marinho'],
    plants: ['Alga marinha', 'Erva-doce', 'Alecrim'],
    offerings: ['Rum', 'Pão duro', 'Sal marinho', 'Corda velha', 'Moeda de cobre'],
    chants: ['Primeiro contramestre', 'Marinheiro fiel', 'Tripulação unite', 'Bravos companheiros'],
    symbols: ['Bússola', 'Leme', 'Navio', 'Cordas', 'Cálice de rum'],
    mythology:
      'Cosme era o primeiro contramestre leal de Kunjikunta, sempre ao lado do capitão em todas as aventuras pelos mares. Após os eventos que mudaram tudo, ele permaneceu fiel ao seu posto, ajudando Oluwande a manter a tripulação unida. Cosme representa a força da amizade verdadeira e a coragem de permanecer leal mesmo nas circunstâncias mais difíceis.',
    spiritualLesson: 'A verdadeira lealdade não se mede只在順境中,而是在最黑暗的時刻仍選擇陪伴 e apoiar aqueles que amamos',
    affirmation: 'Eu escolho permanecer fiel aos meus compromissos, carregando a amizade verdadeiro em meu coração',
    meditation: 'Imagine-se no convés de um navio sob as estrelas, sentindo o vento marino strengthening sua determinação e lealdade',
    domains: ['Marinheiross', 'Navegação', 'Lealdade', 'Companheirismo', 'Legado', 'Esperança'],
    vessels: ['Cálice de rum', 'Remos', 'Lanterna de piloto', 'Botas marítimas'],
    legacyTeaching: 'A amizade verdadeiro se prova não apenas nos momentos de glória, mas também quando tudo parece perdido',
  },
  {
    id: 'cosme-bravo',
    name: 'Cosme o Bravo',
    namePortuguese: 'O Protetor da Tripulação',
    path: 'Cosme',
    element: 'Fogo e Coragem',
    colors: ['#FF4500', '#FFD700', '#1B4D3E'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 9, 21],
    greeting: 'Pela tripulação!',
    archetype: 'O Protetor Leal',
    qualities: ['Bravura', 'Proteção', 'Lealdade', 'Ação decisiva', 'Amizade profunda', 'Otimismo'],
    challenges: ['Autodúvida', 'Proteger demais', 'Seguir líderes imperfeitos'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Touro', 'Falcão', 'Golfinho'],
    plants: ['Girassol', 'Alecrim', 'Hortelã'],
    offerings: ['Bebida forte', 'Carnes defumadas', 'Cinto de couro', 'Moeda de cobre', 'Pena vermelha'],
    chants: ['Proteção siempre', 'Lealdade sempre', 'Amigos até o fim', 'Bravo companheiro'],
    symbols: ['Espada simples', 'Escudo', 'Âncora', 'Cálice erguido'],
    mythology:
      'Na noite em que o desespero rondava o Navio, foi Cosme quem primeiro apoiou Oluwande contra os tiranos. Sua amizade pelo capitão era maior que seu medo, e isso transformou um simples marinheiro em um herói que a tripulação aprendeu a seguir e confiar.',
    spiritualLesson: 'A bravura não é a ausência do medo, mas a decisão de agir apesar dele pela proteção daqueles que amamos',
    affirmation: 'Eu sou valente não porque não sinto medo, mas porque escolho a coragem quando minha tripulação precisa de mim',
    meditation: 'Visualize uma chama que arde mesmo na tempestade, aquecendo e protegendo todos ao seu redor',
    domains: ['Bravura', 'Proteção', 'Amizade leal', 'Ação', 'Luta', 'Celebração'],
    vessels: ['Cálice de vinho', 'Caneca de estanho', 'Saco de provisão', 'Chicote'],
    legacyTeaching: 'A coragem não precisa de motivo além da amizade — um verdadeiro amigo nunca foge quando o outro precisa',
  },
];

export function getData(): CosmeData[] {
  return COSME_DATA;
}

function getDataById(id: string): CosmeData | undefined {
  return COSME_DATA.find((c) => c.id === id);
}

function searchData(query: string): CosmeData[] {
  const lowerQuery = query.toLowerCase();
  return COSME_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.namePortuguese.toLowerCase().includes(lowerQuery) ||
      c.archetype.toLowerCase().includes(lowerQuery) ||
      c.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      c.domains.some((d) => d.toLowerCase().includes(lowerQuery))
  );
}

function getCosmeByDay(day: string): CosmeData[] {
  return COSME_DATA.filter((c) => c.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getCosmeByElement(element: string): CosmeData[] {
  return COSME_DATA.filter((c) => c.element.toLowerCase().includes(element.toLowerCase()));
}

function getDomains(): string[] {
  return ['Marinheiross', 'Navegação', 'Lealdade', 'Companheirismo', 'Legado', 'Esperança', 'Bravura', 'Proteção'];
}

function getSacredAnimals(): string[] {
  return ['Gaivota', 'Polvo', 'Cavalo-marinho', 'Touro', 'Falcão', 'Golfinho'];
}

function getSymbols(): string[] {
  return ['Bússola', 'Leme', 'Navio', 'Cordas', 'Rede de pesca', 'Cálice', 'Remos', 'Lanterna'];
}

function getLegacyTeaching(): string {
  return 'A amizade verdadeiro se prova não apenas nos momentos de glória, mas também quando tudo parece perdido';
}

function getAffirmations(): string[] {
  return COSME_DATA.map((c) => c.affirmation);
}

function getCosmeByArchetype(archetype: string): CosmeData[] {
  return COSME_DATA.filter((c) => c.archetype.toLowerCase().includes(archetype.toLowerCase()));
}
