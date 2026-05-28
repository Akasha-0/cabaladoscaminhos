// @ts-nocheck
// Meji Fa data — The Sacred Divine Knowledge of Ifá

export interface MejiFaEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiFaData {
  entities: MejiFaEntity[];
  aspects: string[];
}

const entities: MejiFaEntity[] = [
  {
    id: 'meji-fa',
    name: 'Meji Fa',
    description: 'Meji Fa e o Odu que representa a forca da sabedoria divina e da fe verdadeira. Este odu ensina que a compreensao sagrada emerge quando a mente e aberta para a verdade eterna, revelando caminhos de iluminacao e devocao.',
    characteristics: ['sabedoria', 'fe', 'devocao', 'conhecimento-sagrado', 'iluminacao'],
    category: 'meji-fa',
    practice: 'meditacao-da-sabedoria-divina',
  },
  {
    id: 'meji-fa-ogbe',
    name: 'Meji Fa-Ogbe',
    description: 'A uniao de Meji Fa com Ogbe traz o poder da sabidencia Iniciadora. A sabedoria de Meji Fa se une a capacidade de Ogbe de iniciar novos ciclos, permitindo comecar jornada com fe e compreensao profunda.',
    characteristics: ['inicio', 'sabedoria', 'fe', 'proposito', 'compreensao'],
    category: 'combinacao',
    practice: 'ritual-de-iniciacao-sabia',
  },
  {
    id: 'meji-fa-oyeku',
    name: 'Meji Fa-Oyeku',
    description: 'Meji Fa com Oyeku revela a transformacao da escuridao em sabidencia. Este Odu indica que phase de crescimento espiritual esta em curso, onde conhecimento sagrado substitui a ignorancia e a confusao.',
    characteristics: ['transformacao', 'sabedoria', 'crescimento', 'conhecimento', 'luz'],
    category: 'combinacao',
    practice: 'ritual-de-crescimento-espiritual',
  },
  {
    id: 'meji-fa-odi',
    name: 'Meji Fa-Odi',
    description: 'A combinacao de Meji Fa com Odi traz a visao profetica do divino. A sabedoria de Meji Fa encontra a profundidade de Odi para revelar verdades ocultas e proporcionar discernimento sagrado.',
    characteristics: ['visao', 'profcia', 'discernimento', 'verdade-divina', 'intuicao'],
    category: 'combinacao',
    practice: 'ritual-de-visao-profetica',
  },
  {
    id: 'meji-fa-irosun',
    name: 'Meji Fa-Irosun',
    description: 'Meji Fa com Irosun traz a sabedoria protetora. O conhecimento divino se manifesta como orientacao sagrada, protegendo contra perigos espirituais e revelando caminhos seguros.',
    characteristics: ['sabedoria', 'protecao', 'orientacao', 'vigilancia', 'guia'],
    category: 'combinacao',
    practice: 'ritual-de-sabedoria-protetora',
  },
  {
    id: 'meji-fa-ogunda',
    name: 'Meji Fa-Ogunda',
    description: 'Meji Fa com Ogunda representa a sabedoria na forca. O conhecimento divino ilumina o caminho da acao e da construcao, permitindo grandes obras com visao clara e fe inabalavel.',
    characteristics: ['acao', 'sabedoria', 'construcao', 'visao', 'determinacao'],
    category: 'combinacao',
    practice: 'ritual-da-acao-sabia',
  },
  {
    id: 'meji-fa-ose',
    name: 'Meji Fa-Ose',
    description: 'A uniao de Meji Fa com Ose traz a verdade curativa. A sabedoria divina canaliza a energia medicinal para restabelecer equilbrio entre corpo, mente e espirito atraves do conhecimento sagrado.',
    characteristics: ['cura', 'sabedoria', 'conhecimento', 'restauracao', 'equilibrio'],
    category: 'combinacao',
    practice: 'ritual-de-cura-sabia',
  },
  {
    id: 'meji-fa-oba',
    name: 'Meji Fa-Oba',
    description: 'Meji Fa com Oba revela a verdade do servico divino. A sabidencia de Meji Fa orienta as relacoes de poder e servico na comunidade, fortalecendo liderazgo autentico e devoto.',
    characteristics: ['servico', 'liderazgo', 'sabedoria', 'comunidade', 'devoacao'],
    category: 'combinacao',
    practice: 'ritual-de-servico-divino',
  },
];

const aspects: string[] = [
  'sabedoria',
  'fe',
  'devocao',
  'conhecimento-sagrado',
  'iluminacao',
  'transformacao',
  'visao',
  'protecao',
  'acao',
  'cura',
];

function buildData(): MejiFaData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiFaData | null = null;

export function getData(): MejiFaData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiFaEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiFaEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiFaEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;