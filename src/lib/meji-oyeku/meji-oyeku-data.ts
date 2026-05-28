// @ts-nocheck
// Meji-Oyeku data — The Ifá Divination System

export interface MejiOyekuEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiOyekuData {
  entities: MejiOyekuEntity[];
  aspects: string[];
}

const entities: MejiOyekuEntity[] = [
  {
    id: 'meji-oyeku',
    name: 'Meji-Oyeku',
    description: 'Meji com Oyeku revela a dinamica entre abundancia e escassez. Este Odu ensina que a transformacao da escuridao em luz requer compreensao profunda dos ciclos economicos e espirituais.',
    characteristics: ['transformacao', 'ciclos', 'abundancia', 'escassez', 'transmutacao'],
    category: 'principal',
    practice: 'ritual-de-abundancia',
  },
  {
    id: 'meji-oyeku-ire',
    name: 'Meji-Oyeku-Ire',
    description: 'A uniao de Meji-Oyeku com Ire traz a promise de bonanca. A forca transformadora de Meji-Oyeku canaliza a energia de Ire para manifestar prosperidade material e espiritual.',
    characteristics: ['prosperidade', 'bonanca', 'manifestacao', 'abundancia', 'feelicidade'],
    category: 'combinacao',
    practice: 'ritual-de-prosperidade',
  },
  {
    id: 'meji-oyeku-oga',
    name: 'Meji-Oyeku-Oga',
    description: 'Meji-Oyeku com Oga revela o caminho da autoridade financeira. A dinamica entre abundancia e escassez orienta o uso responsavel de recursos e o comando de empreendimentos.',
    characteristics: ['autoridade', 'finanças', 'lideranca', 'recursos', 'comando'],
    category: 'combinacao',
    practice: 'ritual-de-lideranca',
  },
  {
    id: 'meji-oyeku-onu',
    name: 'Meji-Oyeku-Onu',
    description: 'A combinacao de Meji-Oyeku com Onu traz a forca do comercio e das alianzas. Este Odu indica que transacoes e parcerias serao a chave para a transformação da escassez em abundancia.',
    characteristics: ['comercio', 'alianca', 'parceria', 'transacao', 'cooperação'],
    category: 'combinacao',
    practice: 'ritual-de-comercio',
  },
  {
    id: 'meji-oyeku-ros',
    name: 'Meji-Oyeku-Ros',
    description: 'Meji-Oyeku com Ros revela a advertencia sobre o excesso. A dualidade sagrada de Meji-Oyeku manifesta-se atraves dos avisos de Ros para evitar desperdicio e apego material.',
    characteristics: ['advertncia', 'equilibrio', 'moderação', 'sabedoria', 'discernimento'],
    category: 'combinacao',
    practice: 'ritual-de-equilibrio',
  },
];

const aspects: string[] = [
  'transformacao',
  'ciclos',
  'abundancia',
  'escassez',
  'transmutacao',
  'prosperidade',
  'comércio',
  'lideranca',
  'equilibrio',
];

function buildData(): MejiOyekuData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiOyekuData | null = null;

export function getData(): MejiOyekuData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiOyekuEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiOyekuEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiOyekuEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
