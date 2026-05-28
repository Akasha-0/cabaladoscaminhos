// @ts-nocheck
// Meji-Ikate data — The Ifá Divination System

export interface MejiIkateEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiIkateData {
  entities: MejiIkateEntity[];
  aspects: string[];
}

const entities: MejiIkateEntity[] = [
  {
    id: 'meji-ikate',
    name: 'Meji-Ikate',
    description: 'Meji com Ikate representa a dinamica entre mudança e estabilidade. Este Odu ensina que a transformação interior requer compreensão profunda dos ciclos de criação e destruição.',
    characteristics: ['transformacao', 'mudança', 'equilibrio', 'destruicao-criativa', 'renovacao'],
    category: 'principal',
    practice: 'ritual-de-transformacao',
  },
  {
    id: 'meji-ikate-ire',
    name: 'Meji-Ikate-Ire',
    description: 'A uniao de Meji-Ikate com Ire traz a promessa de renovação positiva. A energia transformadora de Meji-Ikate canaliza a força de Ire para manifestar mudanças favoráveis na vida.',
    characteristics: ['renovacao', 'mudanca-positiva', 'esperanca', 'renascimento', 'progresso'],
    category: 'combinacao',
    practice: 'ritual-de-renovacao',
  },
  {
    id: 'meji-ikate-oga',
    name: 'Meji-Ikate-Oga',
    description: 'Meji-Ikate com Oga revela o caminho da liderança transformadora. A dinâmica entre mudança e estabilidade orienta o comando de processos de transformação em grupo.',
    characteristics: ['lideranca', 'transformacao', 'mudanca', 'autoridade', 'visao'],
    category: 'combinacao',
    practice: 'ritual-de-lideranca-transformadora',
  },
  {
    id: 'meji-ikate-onu',
    name: 'Meji-Ikate-Onu',
    description: 'A combinacao de Meji-Ikate com Onu traz a força das parcerias transformadoras. Este Odu indica que alianças estratégicas serão a chave para processos de mudança significativa.',
    characteristics: ['parceria', 'alianca', 'transformacao', 'cooperacao', 'sinergia'],
    category: 'combinacao',
    practice: 'ritual-de-parceria',
  },
  {
    id: 'meji-ikate-ros',
    name: 'Meji-Ikate-Ros',
    description: 'Meji-Ikate com Ros revela a advertência sobre mudanças precipitadas. A dualidade sagrada de Meji-Ikate manifesta-se atraves dos avisos de Ros para evitar mudanças prematuras.',
    characteristics: ['advertncia', 'cautela', 'prudencia', 'espera', 'discernimento'],
    category: 'combinacao',
    practice: 'ritual-de-cautela',
  },
];

const aspects: string[] = [
  'transformacao',
  'mudança',
  'equilibrio',
  'destruicao-criativa',
  'renovacao',
  'renascimento',
  'lideranca',
  'parceria',
  'sinergia',
];

function buildData(): MejiIkateData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiIkateData | null = null;

export function getData(): MejiIkateData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiIkateEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiIkateEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiIkateEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;