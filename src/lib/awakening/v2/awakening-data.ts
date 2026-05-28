// Awakening data — consciousness expansion metrics and archetypes

export interface AwakeningArchetype {
  id: string;
  name: string;
  portugueseName: string;
  element: string;
  planet: string;
  sephirah: string;
  description: string;
  practices: string[];
  warnings: string[];
  integrationPoints: string[];
}

const archetypes: AwakeningArchetype[] = [
  {
    id: 'neophite',
    name: 'Neophyte',
    portugueseName: 'Neófito',
    element: 'Ar',
    planet: 'Mercúrio',
    sephirah: 'Malkuth',
    description: 'O primeiro passo no caminho do despertar. Despertar da consciência para a existência de planos superiores.',
    practices: ['meditação básica', 'diário de sonhos', 'observação dos pensamentos'],
    warnings: ['evitar uso de substâncias para forçar experiências', 'não forçar estágios'],
    integrationPoints: ['corpo físico', 'sensações básicas'],
  },
  {
    id: 'discernidor',
    name: 'Discerner',
    portugueseName: 'Discernidor',
    element: 'Água',
    planet: 'Lua',
    sephirah: 'Yesod',
    description: 'Desenvolvimento da percepção sutil e discriminação entre realidade e ilusão.',
    practices: ['visualização', 'trabalho com символы', 'leitura de sinais'],
    warnings: ['superstição', 'interpretação forçada de sincronicidades'],
    integrationPoints: ['corpo emocional', 'memórias'],
  },
  {
    id: 'buscador',
    name: 'Seeker',
    portugueseName: 'Buscador',
    element: 'Fogo',
    planet: 'Marte',
    sephirah: 'Hod',
    description: 'Busca ativa por conhecimento oculto e compreensão das leis universais.',
    practices: ['estudo de textos sagrados', 'ritual formal', 'devoção'],
    warnings: ['intelectualização excessiva', 'orgulho pelo conhecimento'],
    integrationPoints: ['mente concreta', 'vontade'],
  },
  {
    id: 'devoto',
    name: 'Devotee',
    portugueseName: 'Devoto',
    element: 'Terra',
    planet: 'Vênus',
    sephirah: 'Netzach',
    description: 'União com o divino através do amor e adoração, dissolução do ego.',
    practices: ['préayer', 'canto devocional', 'serviço desinteressado'],
    warnings: ['dependência emocional do divino', 'idealização'],
    integrationPoints: ['coração', 'emoções elevadas'],
  },
  {
    id: 'místico',
    name: 'Mystic',
    portugueseName: 'Místico',
    element: 'Akasha',
    planet: 'Sol',
    sephirah: 'Tiferet',
    description: 'Experiência direta da unidade fundamental da consciência.',
    practices: ['meditação profunda', 'prática do silêncio', 'contemplação'],
    warnings: ['escapismo', 'negação do mundo fenomenal'],
    integrationPoints: ['eu superior', 'identidade transpersonal'],
  },
  {
    id: 'sacerdote',
    name: 'Priest',
    portugueseName: 'Sacerdote',
    element: 'Akasha',
    planet: 'Júpiter',
    sephirah: 'Geburah',
    description: 'Portal entre o humano e o divino, canal de graça e ensinamentos.',
    practices: ['ritual de sacramento', 'iniciação', 'ensino'],
    warnings: ['abuso de poder', 'manipulação espiritual'],
    integrationPoints: ['autoridade interior', 'discernimento ethical'],
  },
  {
    id: 'mago',
    name: 'Magician',
    portugueseName: 'Mago',
    element: 'Akasha',
    planet: 'Mercúrio',
    sephirah: 'Chesed',
    description: 'Compreensão e uso consciente das forças cósmicas e da vontade divine.',
    practices: ['trabalho com will', 'magia cerimonial', 'invocação'],
    warnings: ['tentativa de controle sobre o destino', 'transgressão do livre-arbítrio'],
    integrationPoints: ['vontade individual', 'propósito'],
  },
  {
    id: 'sábio',
    name: 'Sage',
    portugueseName: 'Sábio',
    element: 'Ar',
    planet: 'Saturno',
    sephirah: 'Binah',
    description: 'Integração da sabedoria em forma de compreensão profunda da natureza da realidade.',
    practices: ['estudo contemplativo', 'ensino', 'compartilhamento do conhecimento'],
    warnings: ['isolamento acadêmico', 'desconexão com o mundo'],
    integrationPoints: ['sabedoria prática', 'comunidade'],
  },
  {
    id: 'iluminado',
    name: 'Illuminated',
    portugueseName: 'Iluminado',
    element: 'Fogo',
    planet: 'Sol',
    sephirah: 'Chokmah',
    description: 'Despertar da centelha divina interior, experiência de luz interior.',
    practices: ['contemplação da luz', 'unificação com a fonte', 'radiação'],
    warnings: ['fanatismo', 'proselitismo forçado'],
    integrationPoints: ['essência divina', 'propósito de vida'],
  },
  {
    id: 'unificado',
    name: 'Unified',
    portugueseName: 'Unificado',
    element: 'Akasha',
    planet: 'Netuno',
    sephirah: 'Kether',
    description: 'Integração final de todos os aspectos da consciência em unidade with the All.',
    practices: ['ser', 'presença', 'unificação'],
    warnings: ['perda de individuação prematura', 'abandono desresponsabilizado'],
    integrationPoints: ['unidade', 'compaixão universal'],
  },
];

export interface AwakeningData {
  version: string;
  lastUpdated: string;
  archetypes: AwakeningArchetype[];
}

function buildData(): AwakeningData {
  return {
    version: '2.0.0',
    lastUpdated: '2026-05-28',
    archetypes,
  };
}

// Singleton cache
let cachedData: AwakeningData | null = null;

export function getData(): AwakeningData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getArchetypeById(id: string): AwakeningArchetype | undefined {
  return archetypes.find((a) => a.id === id);
}

export function getArchetypesByElement(element: string): AwakeningArchetype[] {
  return archetypes.filter((a) => a.element === element);
}

export function getArchetypesByPlanet(planet: string): AwakeningArchetype[] {
  return archetypes.filter((a) => a.planet === planet);
}