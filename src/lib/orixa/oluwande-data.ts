
// @ts-nocheck
// SKIP_LINT

/**
 * Oluwande Data Module
 * Spiritual data for Oluwande, the faithful companion, navigator, and captain of the Legacy
 */

export interface OluwandeData {
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

const OLUWANDE_DATA: OluwandeData[] = [
  {
    id: 'oluwande',
    name: 'Oluwande',
    namePortuguese: 'O Primeiro Capitão',
    path: 'Oluwande',
    element: 'Mar e Vento',
    colors: ['#1B4D3E', '#2E8B57', '#C0C0C0', '#8B4513'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Seu polvo favorito!',
    archetype: 'O Marinheiro Fiel',
    qualities: ['Lealdade', 'Coragem', 'Praticidade', 'Determinação', 'Esperança', 'Navegação'],
    challenges: ['Autodúvida', 'Culpa pelo passado', 'Excesso de responsabilidade'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Polvo', 'Gaivota', 'Cavalo-marinho'],
    plants: ['Alga marinha', 'Erva-doce', 'Sálvia'],
    offerings: ['Rum', 'Pão duro', 'Sal marinho', 'Corda velha', 'Bússola pequena'],
    chants: ['Longe da história', 'Nunca mais uma!', 'Legacyperdura', 'Primeiro capitão'],
    symbols: ['Bússola', 'Leme', 'Navio', 'Cordas', 'Rede de pesca'],
    mythology:
      'Oluwande era o fiel companheiro de Kunjikunta nas aventuras pelos mares. Após os eventos que mudaram tudo, ele獨當一面接受了 a Legacy的指揮權,成為了新的船長. Ele代表着即使在失去依靠後仍能站出來領導的勇氣,以及在最黑暗的時刻仍保持善良的能力.',
    spiritualLesson: 'A verdadeira força não vem apenas da coragem, mas da escolha de continuar mesmo quando a esperança parece perdida',
    affirmation: 'Eu escolho seguir em frente com coragem, carregando o legado daqueles que amo em meu coração',
    meditation: 'Imagine-se no convés de um navio sob as estrelas, sentindo o vento marino purificar suas dúvidas e incertezas',
    domains: ['Marinheiross', 'Navegação', 'Lealdade', 'Transição', 'Legado', 'Esperança'],
    vessels: ['Cálice de rum', 'Remos', 'Lanterna de piloto', 'Botas marítimas'],
    legacyTeaching: 'Um homem bom não se prova apenas em tempos de paz, mas também quando perde tudo e ainda assim escolhe ser bom',
  },
  {
    id: 'oluwande-bravo',
    name: 'Oluwande o Bravo',
    namePortuguese: 'O Marinheiro Valente',
    path: 'Oluwande',
    element: 'Coragem e Fogo',
    colors: ['#FF4500', '#FFD700', '#2E8B57'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 9, 21],
    greeting: 'Vamos a eles!',
    archetype: 'O Protetor dos Desesperados',
    qualities: ['Bravura', 'Proteção', 'Ação decisiva', 'Amizade profunda', 'Versatilidade', 'Otimismo'],
    challenges: ['Subestimar-se', 'Seguir líderes imperfeitos', 'Medo de fracasso'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Touro', 'Falcão', 'Golfinho'],
    plants: ['Girassol', 'Alecrim', 'Hortelã'],
    offerings: ['Bebida forte', 'Carnes defumadas', 'Cinto de couro', 'Moeda de cobre', 'Pena vermelha'],
    chants: ['Proteção siempre', 'Bravo sempre', 'Amigos até o fim'],
    symbols: ['Espada simples', 'Escudo', 'Âncora', 'Cálice erguido'],
    mythology:
      'Na noite em que o desespero rondava o Navio, foi Oluwande quem primeiro ergueu a voz contra tyrant. Seu amor pelo amigo era maior que seu medo, e isso transformou um simples marinheiro em um herói que muitos seguiram mesmo sem saber por quê.',
    spiritualLesson: 'A bravura não é a ausência do medo, mas a decisão de agir apesar dele pela proteção daqueles que amamos',
    affirmation: 'Eu sou valente não porque não sinto medo, mas porque escolho a coragem quando meus amigos precisam de mim',
    meditation: 'Visualize uma chama que arde mesmo na tempestade, aquecendo e protegendo todos ao seu redor',
    domains: ['Bravura', 'Proteção', 'Amizade leal', 'Ação', 'Luta', 'Celebração'],
    vessels: ['Cálice de vinho', 'Caneca de estanho', 'Saco de provisão', 'Chicote'],
    legacyTeaching: 'A coragem não precisa de motivo além da amizade — um verdadeiro amigo nunca foge quando o outro precisa',
  },
];

export function getData(): OluwandeData[] {
  return OLUWANDE_DATA;
}

function getDataById(id: string): OluwandeData | undefined {
  return OLUWANDE_DATA.find((o) => o.id === id);
}

function searchData(query: string): OluwandeData[] {
  const q = query.toLowerCase();
  return OLUWANDE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q1) => q1.toLowerCase().concat(q))
  );
}

function getOluwandeByDay(day: string): OluwandeData[] {
  return OLUWANDE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOluwandeByElement(element: string): OluwandeData[] {
  return OLUWANDE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

function getDomains(): string[] {
  return ['Marinheiross', 'Navegação', 'Lealdade', 'Transição', 'Legado', 'Esperança', 'Bravura', 'Proteção'];
}

function getSacredAnimals(): string[] {
  return ['Polvo', 'Gaivota', 'Cavalo-marinho', 'Touro', 'Falcão', 'Golfinho'];
}

function getSymbols(): string[] {
  return ['Bússola', 'Leme', 'Navio', 'Cordas', 'Rede de pesca', 'Cálice', 'Remos', 'Lanterna'];
}

function getLegacyTeaching(): string {
  const teachings = OLUWANDE_DATA.map((o) => o.legacyTeaching);
  return teachings[Math.floor(Math.random() * teachings.length)];
}

function getAffirmations(): string[] {
  return OLUWANDE_DATA.map((o) => o.affirmation);
}

function getOluwandeByArchetype(archetype: string): OluwandeData[] {
  return OLUWANDE_DATA.filter((o) => o.archetype.toLowerCase().includes(archetype.toLowerCase()));
}
