// @ts-nocheck
// SKIP_LINT

/**
 * Oya Data Module
 * Spiritual data for Oya, the orixá of winds, storms, lightning, and transformative change
 */

export interface OyaData {
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
  sacredObjects: string[];
  invocationPhrases: string[];
  aspects: OyaAspect[];
}

export interface OyaAspect {
  name: string;
  description: string;
  energy: string;
}

export interface OyaPath {
  name: string;
  description: string;
  attributes: string[];
}

const OYA_DATA: OyaData = {
  id: 'oya',
  name: 'Oya',
  namePortuguese: 'Senhora dos Ventos',
  path: 'Tempestade e Transformação',
  element: 'Ar e Fogo',
  colors: ['#8B0000', '#9400D3', '#FF6347', '#FFFFFF'],
  dayOfWeek: 'Sábado',
  numbersSacred: [9, 18, 27],
  greeting: 'Epa! Oya!',
  archetype: 'Guardiana das Transformações',
  qualities: [
    'Força',
    'Liberdade',
    'Transformação',
    'Coragem',
    'Movimento',
    'Adaptabilidade',
    'Tempestade interior',
    'Quebra de padrões',
    'Velocidade',
    'Decisão'
  ],
  challenges: [
    'Impaciência',
    'Destruição descontrolada',
    'Medo da mudança',
    'Rigidez emocional',
    'Resistência ao fluxo'
  ],
  rulingPlanet: 'Mercúrio',
  sacredAnimals: ['Ibis', 'Búfalo', 'Cavalo'],
  plants: ['Dente-de-leão', 'Sálvia', 'Verbena', 'Eucalipto'],
  offerings: [
    'Quiabo',
    'Milho torrado',
    'Amendoim',
    'Velas vermelhas',
    'Velas roxas',
    'Pimenta-do-reino',
    'Dinheiro',
    'Tecido vermelho'
  ],
  chants: [
    'Epa! Oya!',
    'Oya yansan',
    'Tempestade que limpa',
    'Vento que transforma',
    'Oya abre meu caminho',
    'Iansan, mãe dos ventos'
  ],
  symbols: [
    'Ibadan (leque ritual)',
    'Ventilador de palha',
    'Raio',
    'Tempestade',
    'Pá virada',
    'Caveira',
    'Tecido vermelho e roxo'
  ],
  mythology:
    'Oya é a orixá dos ventos, tempestades e raios. Consorte de Xangô, ela é conhecida como Iansã, a mãe dos ventos. Oya guarda os portais entre a vida e a morte e é a senhora dos cemitérios, governando as transformações que vêm com as mudanças de ciclo. Ela é a guerrreira que limpa o caminho, a tempestade que destrói o que precisa ser transformado e o vento que traz renovação. Oya é a primeira a chegar quando há mudança, criando espaço para o novo.',
  spiritualLesson:
    'A transformação verdadeira exige coragem de abandonar o conhecido. Oya ensina que a destruição do antigo é sagrada quando abre caminho para o novo. Nem toda mudança é destruição — nem toda destruição é negativa.',
  affirmation: 'Eu abraço a mudança com coragem e confiança. O vento da transformação me limpa e me renova. Sou forte como a tempestade e livre como o vento.',
  meditation: 'Sente-se em local ventilado ou ao ar livre. Imagine o vento soprando através de você, levando embora tudo o que não serve mais. Permita que a energia de Oya limpe seu campo energético, renovando sua força e coragem.',
  domains: [
    'ventos',
    'tempestades',
    'raios',
    'transformação',
    'mudanças',
    'cemitérios',
    'portais',
    'fechaduras',
    'mercadores',
    'quintais',
    'mercados',
    'ferrovias'
  ],
  sacredObjects: [
    'ibadan',
    'leque ritual',
    'pá virada',
    'velas vermelhas',
    'velas roxas',
    'pimenta',
    'dinheiro',
    'tecidos'
  ],
  invocationPhrases: [
    'Oya, sopra em minha vida',
    'Oya, abre os caminhos fechados',
    'Oya, transforma minha dor em força',
    'Tempestade que limpa, venha agora',
    'Vento sagrado, limpa meu caminho'
  ],
  aspects: [
    {
      name: 'Oya Iansã',
      description: 'A mãe dos ventos, senhora das tempestades',
      energy: 'vento'
    },
    {
      name: 'Oya Oyá',
      description: 'A guerreira que guarda os portais',
      energy: 'proteção'
    },
    {
      name: 'Oya Alakim',
      description: 'A guardiã dos cemitérios e portais da morte',
      energy: 'transformação'
    },
    {
      name: 'Oya Buru',
      description: 'A dona das feiras e mercados',
      energy: 'prosperidade'
    },
    {
      name: 'Oya Saton',
      description: 'A senhora das railroads e caminhos de ferro',
      energy: 'movimento'
    }
  ]
};

export function getData(): OyaData {
  return OYA_DATA;
}

export function getDataById(id: string): OyaData | undefined {
  return id === 'oya' ? OYA_DATA : undefined;
}

export function searchData(query: string): OyaData[] {
  const q = query.toLowerCase();
  return OYA_DATA.name.toLowerCase().includes(q) ||
    OYA_DATA.namePortuguese.toLowerCase().includes(q) ||
    OYA_DATA.path.toLowerCase().includes(q) ||
    OYA_DATA.qualities.some((qual) => qual.toLowerCase().includes(q)) ||
    OYA_DATA.mythology.toLowerCase().includes(q)
    ? [OYA_DATA]
    : [];
}

export function getOyaByElement(element: string): OyaData | undefined {
  return OYA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OYA_DATA : undefined;
}

export function getOyaByDay(day: string): OyaData | undefined {
  return OYA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? OYA_DATA : undefined;
}

export function getSacredObjects(): string[] {
  return OYA_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return OYA_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return OYA_DATA.domains;
}

export function getAspects(): OyaAspect[] {
  return OYA_DATA.aspects;
}