// @ts-nocheck
// Meji She data — The Ifá Divination System

export interface MejiSheEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiSheData {
  entities: MejiSheEntity[];
  aspects: string[];
}

const entities: MejiSheEntity[] = [
  {
    id: 'meji-she',
    name: 'Meji She',
    description: 'Meji She e o Odu que representa a forca do feminino sagrado e da intuicao profunda. Este odu ensina que a sabiduria verdadeira emerge da conexao com a energia feminina do universo, revelando caminhos attraves da intuicao e da compaixao.',
    characteristics: ['intuicao', 'feminino', 'compaixao', 'sabedoria-intuitiva', 'conexao'],
    category: 'meji-she',
    practice: 'meditacao-do-feminino-sagrado',
  },
  {
    id: 'meji-she-ogbe',
    name: 'Meji She-Ogbe',
    description: 'A uniao de Meji She com Ogbe traz o poder do recomeco intuitivo. A sabedoria feminina de Meji She se une a capacidade de Ogbe de iniciar novos ciclos, permitindo comecar jornada com profunda conexao espiritual.',
    characteristics: ['recomeco', 'intuicao', 'inicio', 'espiritualidade', 'novos-ciclos'],
    category: 'combinacao',
    practice: 'ritual-de-renovacao-intuitiva',
  },
  {
    id: 'meji-she-oyeku',
    name: 'Meji She-Oyeku',
    description: 'Meji She com Oyeku revela a sabedoria da transformacao interior. Este Odu indica que phase de desenvolvimento espiritual esta em curso, onde a energia feminina transforma escuridao em luz interior.',
    characteristics: ['transformacao', 'interior', 'luz', 'desenvolvimento', 'espiritual'],
    category: 'combinacao',
    practice: 'ritual-de-transformacao-interior',
  },
  {
    id: 'meji-she-odi',
    name: 'Meji She-Odi',
    description: 'A combinacao de Meji She com Odi traz a visao intuitiva profunda. A sabedoria feminina encontra a profundidade de Odi para revelar verdades ocultas e proporcionar discernimento espiritual atraves da intuicao.',
    characteristics: ['visao', 'profundidade', 'discernimento', 'verdade-oculta', 'intuicao'],
    category: 'combinacao',
    practice: 'ritual-de-visao-intuitiva',
  },
  {
    id: 'meji-she-irosun',
    name: 'Meji She-Irosun',
    description: 'Meji She com Irosun traz a protecao da sabedoria sagrada. A energia feminina se manifesta como forca protetora, guardando contra perigos espirituais e revelando caminhos seguros.',
    characteristics: ['protecao', 'sabedoria', 'forca', 'seguranca', 'energia-feminina'],
    category: 'combinacao',
    practice: 'ritual-de-protecao-sagrada',
  },
  {
    id: 'meji-she-ogunda',
    name: 'Meji She-Ogunda',
    description: 'Meji She com Ogunda representa a forca criativa feminina. A intuicao sagrada ilumina o caminho da acao e da construcao, permitindo grandes obras com visao profunda e proposito autentico.',
    characteristics: ['forca', 'criacao', 'acao', 'visao', 'proposito'],
    category: 'combinacao',
    practice: 'ritual-da-forca-criativa',
  },
  {
    id: 'meji-she-ose',
    name: 'Meji She-Ose',
    description: 'A uniao de Meji She com Ose traz a cura energetica feminina. A energia sagrada canaliza forcas medicinais para restabelecer equilbrio entre corpo, mente e espirito de forma compasiva.',
    characteristics: ['cura', 'energia', 'equilibrio', 'compassao', 'restauracao'],
    category: 'combinacao',
    practice: 'ritual-de-cura-energetica',
  },
  {
    id: 'meji-she-oba',
    name: 'Meji She-Oba',
    description: 'Meji She com Oba revela a sabedoria do servico sagrado. A energia feminina orienta as relacoes de poder e servico na comunidade, fortalecendo liderazgo autntico e compasivo.',
    characteristics: ['servico', 'liderazgo', 'comunidade', 'sabedoria', 'compassao'],
    category: 'combinacao',
    practice: 'ritual-de-servico-compassivo',
  },
];

const aspects: string[] = [
  'intuicao',
  'feminino',
  'compaixao',
  'sabedoria',
  'conexao',
  'transformacao',
  'visao',
  'protecao',
  'forca',
  'cura',
];

function buildData(): MejiSheData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiSheData | null = null;

export function getData(): MejiSheData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiSheEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiSheEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiSheEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
