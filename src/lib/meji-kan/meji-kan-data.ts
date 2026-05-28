// @ts-nocheck
// Meji-kan data — The Sacred Perception of Ifá

export interface MejiKanEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiKanData {
  entities: MejiKanEntity[];
  aspects: string[];
}

const entities: MejiKanEntity[] = [
  {
    id: 'meji-kan',
    name: 'Meji-Kan',
    description: 'Meji-Kan representa a visao sagrada que emerge da dualidade criadora. Este odu revela a capacidade de perceber além dos véus da realidade, ativando a terceira visao que conecta o plano terreno ao espiritual.',
    characteristics: ['visao', 'percepcao', 'clarividencia', 'revelacao', 'discernimento'],
    category: 'meji-kan',
    practice: 'meditacao-da-visão-sagrada',
  },
  {
    id: 'meji-kan-ogbe',
    name: 'Meji-Kan-Ogbe',
    description: 'A uniao de Meji-Kan com Ogbe traz a abertura para a visao renovadora. A percepcao sagrada se abre para novos horizontes, revelando cheminhosspirituais antes ocultos aos olhos comuns.',
    characteristics: ['abertura', 'horizontes', 'renovacao', 'vision', 'iniciacao'],
    category: 'combinacao',
    practice: 'ritual-da-nova-visao',
  },
  {
    id: 'meji-kan-oyeku',
    name: 'Meji-Kan-Oyeku',
    description: 'Meji-Kan com Oyeku revela a percepcao dos ciclos de luz e escuridao. Este odu ensina a ver atraves das sombras e reconhecer a abundancia escondida nos momentos de provacao.',
    characteristics: ['percepcao', 'ciclos', 'transformacao', 'abundancia', 'sombra'],
    category: 'combinacao',
    practice: 'ritual-da-percepcao-ciclica',
  },
  {
    id: 'meji-kan-odi',
    name: 'Meji-Kan-Odi',
    description: 'A combinacao de Meji-Kan com Odi traz a forca da visao interior. A percepcao sagrada se volta para dentro, revelando verdades ocultas no inconscientee guiando decisoes através da intuicao profunda.',
    characteristics: ['introspeccao', 'verdade', 'intuicao', 'reflexao', 'discernimento'],
    category: 'combinacao',
    practice: 'ritual-da-mirao-interior',
  },
  {
    id: 'meji-kan-irosun',
    name: 'Meji-Kan-Irosun',
    description: 'Meji-Kan com Irosun traz a visao advertente. A percepcao sagrada detecta perigos ocultos e armadilhas espirituais, protegendo o consulente atraves da previsao e vigilancia superiores.',
    characteristics: ['advertncia', 'protecao', 'vigilancia', 'previsao', 'cuidado'],
    category: 'combinacao',
    practice: 'ritual-da-visao-protetora',
  },
  {
    id: 'meji-kan-ogunda',
    name: 'Meji-Kan-Ogunda',
    description: 'Meji-Kan com Ogunda representa a visao da forca terrena. Este odu revela projetos e obras atraves da percepcao sagrada, conectando a visao espiritual com a acao no mundo material.',
    characteristics: ['visao', 'acao', 'terra', 'projetos', 'realizacao'],
    category: 'combinacao',
    practice: 'ritual-da-visao-material',
  },
  {
    id: 'meji-kan-ose',
    name: 'Meji-Kan-Ose',
    description: 'A uniao de Meji-Kan com Ose traz a visao curativa. A percepcao sagrada identifica desequilibrios e ativa a capacidade de ver o caminho da cura em todos os planos da existencia.',
    characteristics: ['cura', 'visao', 'saude', 'restauracao', 'percepcao'],
    category: 'combinacao',
    practice: 'ritual-da-visao-curativa',
  },
  {
    id: 'meji-kan-oba',
    name: 'Meji-Kan-Oba',
    description: 'Meji-Kan com Oba revela a visao do servico e da autoridadedivina. A percepcao sagrada orienta relacoes de poder, identificando os caminhos do servico sagrado na comunidade.',
    characteristics: ['servico', 'lealdade', 'comunidade', 'autoridade', 'visao'],
    category: 'combinacao',
    practice: 'ritual-da-visao-sagrada',
  },
];

const aspects: string[] = [
  'visao',
  'percepcao',
  'clarividencia',
  'revelacao',
  'discernimento',
  'introspeccao',
  'transformacao',
  'protecao',
  'intuicao',
  'previsao',
];

function buildData(): MejiKanData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiKanData | null = null;

export function getData(): MejiKanData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiKanEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiKanEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiKanEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
