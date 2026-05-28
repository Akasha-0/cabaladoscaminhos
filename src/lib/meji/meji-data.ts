// @ts-nocheck
// Meji data — The Ifá Divination System

export interface MejiEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiData {
  entities: MejiEntity[];
  aspects: string[];
}

const entities: MejiEntity[] = [
  {
    id: 'meji',
    name: 'Meji',
    description: 'Meji e o Odu supremo do Ifa, representando a forca criadora e a dualidade sagrada. Este odu traz a mensagem do equilbrio entre forcas opostas e a necessidade de harmonizar os extremos para encontrar a sabedoria verdadeira.',
    characteristics: ['dualidade', 'criacao', 'equilibrio', 'sabedoria', 'transformacao'],
    category: 'meji',
    practice: 'meditacao-da-dualidade',
  },
  {
    id: 'meji-ogbe',
    name: 'Meji-Ogbe',
    description: 'A uniao de Meji com Ogbe traz a abertura para novos começos. A sabedoria de Meji combinada com a capacidade de Ogbe de iniciar ciclos cria uma energia de renovacao e inicio de jornada espiritual.',
    characteristics: ['renovacao', 'inicio', 'abertura', 'jornada', 'iniciacao'],
    category: 'combinacao',
    practice: 'ritual-de-novo-inicio',
  },
  {
    id: 'meji-oyeku',
    name: 'Meji-Oyeku',
    description: 'Meji com Oyeku revela a dinamica entre abundancia e escassez. Este Odu ensina que a transformacao da escuridao em luz requer compreensao profunda dos ciclos economicos e espirituais.',
    characteristics: ['transformacao', 'ciclos', 'abundancia', 'escassez', 'transmutacao'],
    category: 'combinacao',
    practice: 'ritual-de-abundancia',
  },
  {
    id: 'meji-odi',
    name: 'Meji-Odi',
    description: 'A combinacao de Meji com Odi traz a forca da reflexao. A dualidade sagrada de Meji encontra a introspeccao de Odi para revelar verdades ocultas e guia para decisoes importantes.',
    characteristics: ['reflexao', 'introspeccao', 'verdade', 'discernimento', 'guia'],
    category: 'combinacao',
    practice: 'ritual-de-reflexao',
  },
  {
    id: 'meji-irosun',
    name: 'Meji-Irosun',
    description: 'Meji com Irosun traz a mensagem da advertncia sagrada. A dualidade de Meji se manifesta atraves dos avisos de Irosun para proteger contra perigos ocultos e armadilhas espirituais.',
    characteristics: ['advertncia', 'protecao', 'vigilancia', 'sabedoria-protetora', 'cuidado'],
    category: 'combinacao',
    practice: 'ritual-de-protecao',
  },
  {
    id: 'meji-ogunda',
    name: 'Meji-Ogunda',
    description: 'Meji com Ogunda representa a forca da terra e a dualidade criadora. Este Odu indica que grandes obras estao por vir e que a energia de Meji sustenta os projetos e empreendimentos.',
    characteristics: ['acao', 'construcao', 'terra', 'projetos', 'realizacao'],
    category: 'combinacao',
    practice: 'ritual-de-acao',
  },
  {
    id: 'meji-ose',
    name: 'Meji-Ose',
    description: 'A uniao de Meji com Ose traz a forca da medicina e cura. A dualidade sagrada de Meji canaliza a energia curativa de Ose para restaurar o equilbrio entre corpo e espirito.',
    characteristics: ['cura', 'medicina', 'saude', 'restauracao', 'vitalidade'],
    category: 'combinacao',
    practice: 'ritual-de-cura',
  },
  {
    id: 'meji-oba',
    name: 'Meji-Oba',
    description: 'Meji com Oba revela o caminho do servico e da lealdade. A dualidade de Meji orienta as relacoes de poder e servico na comunidade, fortalecendo vinculos e deveres sagrados.',
    characteristics: ['servico', 'lealdade', 'comunidade', 'dever', 'autoridade'],
    category: 'combinacao',
    practice: 'ritual-de-servico',
  },
];

const aspects: string[] = [
  'dualidade',
  'criacao',
  'equilibrio',
  'transformacao',
  'sabedoria',
  'renovacao',
  'ciclos',
  'acao',
  'cura',
  'protecao',
];

function buildData(): MejiData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiData | null = null;

export function getData(): MejiData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
