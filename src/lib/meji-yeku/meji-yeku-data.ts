// @ts-nocheck
// Meji-Yeku data — The Ifá Divination System

export interface MejiYekuEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiYekuData {
  entities: MejiYekuEntity[];
  aspects: string[];
}

const entities: MejiYekuEntity[] = [
  {
    id: 'meji-yeku',
    name: 'Meji-Yeku',
    description: 'Meji com Yeku revela a dinamica entre o sagrado e o profano. Este Odu ensina que a mediacao entre这两 worlds requires understanding of both cosmic law and earthly matters.',
    characteristics: ['mediacao', 'equilibrio', 'sagrado', 'profano', 'transicao'],
    category: 'principal',
    practice: 'ritual-de-mediacao',
  },
  {
    id: 'meji-yeku-ire',
    name: 'Meji-Yeku-Ire',
    description: 'A uniao de Meji-Yeku com Ire traz a promessa de harmônia. A força mediadora de Meji-Yeku canaliza a energia de Ire para manifestar reconciliacao entre opostos.',
    characteristics: ['harmonia', 'reconciliacao', 'paz', 'equilibrio', 'uniao'],
    category: 'combinacao',
    practice: 'ritual-de-harmonia',
  },
  {
    id: 'meji-yeku-oga',
    name: 'Meji-Yeku-Oga',
    description: 'Meji-Yeku com Oga revela o caminho da autoridade sagrada. A dinamica entre sagrado e profano orienta o uso do poder espiritual no mundo material.',
    characteristics: ['autoridade', 'poder', 'lideranca', 'sabedoria', 'comando'],
    category: 'combinacao',
    practice: 'ritual-de-autoridade',
  },
  {
    id: 'meji-yeku-onu',
    name: 'Meji-Yeku-Onu',
    description: 'A combinacao de Meji-Yeku com Onu traz a forca da palavra sagrada. Este Odu indica que a comunicacao e a profecia serao a chave para a mediacao entre realms.',
    characteristics: ['palavra', 'profecia', 'comunicacao', 'sabedoria', 'verdade'],
    category: 'combinacao',
    practice: 'ritual-de-profecia',
  },
  {
    id: 'meji-yeku-ros',
    name: 'Meji-Yeku-Ros',
    description: 'Meji-Yeku com Ros revela a advertancia sobre o descontrole. A dualidade sagrada de Meji-Yeku manifesta-se atraves dos avisos de Ros para manter o equilibrio entre mundos.',
    characteristics: ['advertancia', 'cautela', 'equilibrio', 'limites', 'discernimento'],
    category: 'combinacao',
    practice: 'ritual-de-protecao',
  },
];

const aspects: string[] = [
  'mediacao',
  'equilibrio',
  'sagrado',
  'profano',
  'transicao',
  'harmonia',
  'reconciliacao',
  'autoridade',
  'profecia',
  'advertancia',
];

function buildData(): MejiYekuData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiYekuData | null = null;

export function getData(): MejiYekuData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiYekuEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiYekuEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiYekuEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;