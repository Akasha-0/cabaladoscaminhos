// @ts-nocheck
// Okanle data — The Ifá Divination System

export interface OkanleEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface OkanleData {
  entities: OkanleEntity[];
  aspects: string[];
}

const entities: OkanleEntity[] = [
  {
    id: 'okanle-meji',
    name: 'Okanle-Meji',
    description: 'Okanle na sua forma mais pura representa a unidade entre o campones e a natureza. Este Odu fala da harmonia entre o ser humano e a terra, da importancia da vida rural e das tradicoes agricolas.',
    characteristics: ['harmonia', 'tradicao', 'terra', 'comunidade', 'prosperidade'],
    category: 'meji',
    practice: 'cultivo-da-terra',
  },
  {
    id: 'okanle-ogbe',
    name: 'Okanle-Ogbe',
    description: 'A combinacao de Okanle com Ogbe traz a mensagem da abundancia atraves da paciência. O trabalho na terra requer tempo e dedidacao, assim como a colheita de resultados na vida.',
    characteristics: ['abundancia', 'paciencia', 'trabalho', 'dedicacao', 'fecundidade'],
    category: 'combinacao',
    practice: 'semeadura-consciente',
  },
  {
    id: 'okanle-oyeku',
    name: 'Okanle-Oyeku',
    description: 'Okanle com Oyeku revela que a transformacao e necessaria para a colheita. As missoes devem ser deixadas partir para que novas abundances possam nascer.',
    characteristics: ['transformacao', 'soltura', 'renovacao', 'liberacao', 'novos-campos'],
    category: 'combinacao',
    practice: 'limpeza-da-terra',
  },
  {
    id: 'okanle-odi',
    name: 'Okanle-Odi',
    description: 'Okanle com Odi ensina que a reflexao e essencial antes de plantar. Conhecer o terreno e fundamental para uma boa colheita.',
    characteristics: ['reflexao', 'conhecimento', 'prudencia', 'observacao', 'sabedoria-agraria'],
    category: 'combinacao',
    practice: 'estudo-do-terreno',
  },
  {
    id: 'okanle-oshey',
    name: 'Okanle-Oshey',
    description: 'A uniao de Okanle com Oshey traz alegria e celebracao da vida no campo. O trabalho rural e uma fonte de felicidade e satisfacao.',
    characteristics: ['alegria', 'celebracao', 'felicidade', 'gratidao', 'festa-da-colheita'],
    category: 'combinacao',
    practice: 'festival-rural',
  },
];

const aspects: string[] = [
  'trabalho-rural',
  'abundancia-natural',
  'harmonia-com-a-terra',
  'tradicao-agraria',
  'prosperidade-sustentavel',
  'comunidade-camponesa',
  'ciclo-das-estacoes',
  'semeadura-e-colheita',
];

function buildData(): OkanleData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: OkanleData | null = null;

export function getData(): OkanleData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): OkanleEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): OkanleEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): OkanleEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
