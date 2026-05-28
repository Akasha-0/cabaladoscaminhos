// @ts-nocheck
// Meji Je data — The Ifá Divination System

export interface MejiJeEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiJeData {
  entities: MejiJeEntity[];
  aspects: string[];
}

const entities: MejiJeEntity[] = [
  {
    id: 'meji-je',
    name: 'Meji Je',
    description: 'Meji Je e o Odu que representa a forca da sabedoria escondida e do conhecimento profundo. Este odu ensina que a verdadeira sabencia reside nos caminhos menos evidentes, onde a introspeccao revela verdades ocultas aos olhos comuns.',
    characteristics: ['sabedoria', 'conhecimento', 'introspeccao', 'profundidade', 'sigilo'],
    category: 'meji-je',
    practice: 'meditacao-da-sabedoria-sigilosa',
  },
  {
    id: 'meji-je-ogbe',
    name: 'Meji Je-Ogbe',
    description: 'A uniao de Meji Je com Ogbe traz o poder do conhecimento iniciatico. A sabedoria escondida de Meji Je se une a capacidade de Ogbe de iniciar novos ciclos, permitindo descobertas profundas no incio de jornadas.',
    characteristics: ['iniciacao', 'conhecimento', 'descoberta', 'inicio', 'sabedoria'],
    category: 'combinacao',
    practice: 'ritual-de-conhecimento-iniciatico',
  },
  {
    id: 'meji-je-oyeku',
    name: 'Meji Je-Oyeku',
    description: 'Meji Je com Oyeku revela o conhecimento da transformacao oculta. Este Odu indica que sabedoria antiga esta sendo revelada para guiar processos de mudanca profunda e renovacao interior.',
    characteristics: ['transformacao', 'conhecimento', 'mudanca', 'renovacao', 'interior'],
    category: 'combinacao',
    practice: 'ritual-de-sabedoria-transformadora',
  },
  {
    id: 'meji-je-odi',
    name: 'Meji Je-Odi',
    description: 'A combinacao de Meji Je com Odi traz a sabedoria profonda. O conhecimento escondido de Meji Je encontra a sabedoria oculta de Odi para revelar verdades ancestrais e orientaçoes divinatórias.',
    characteristics: ['sabedoria-ancestral', 'conhecimento-profundo', 'verdade', 'orientacao', 'ancestral'],
    category: 'combinacao',
    practice: 'ritual-de-sabedoria-ancestral',
  },
  {
    id: 'meji-je-irosun',
    name: 'Meji Je-Irosun',
    description: 'Meji Je com Irosun traz o conhecimento protetor. A sabedoria escondida se manifesta como protecao sagrada, revelando perigos ocultos e fortalecendo a intuição protetora.',
    characteristics: ['protecao', 'sabedoria', 'intuicao', 'vigilancia', 'conhecimento-sigiloso'],
    category: 'combinacao',
    practice: 'ritual-de-conhecimento-protetor',
  },
  {
    id: 'meji-je-ogunda',
    name: 'Meji Je-Ogunda',
    description: 'Meji Je com Ogunda representa a sabedoria na forca. O conhecimento profundo ilumina o caminho da construção e da ação estratégica, permitindo grandes realizações com entendimento profundo.',
    characteristics: ['estrategia', 'conhecimento', 'construcao', 'acao', 'realizacao'],
    category: 'combinacao',
    practice: 'ritual-de-sabedoria-estrategica',
  },
  {
    id: 'meji-je-ose',
    name: 'Meji Je-Ose',
    description: 'A uniao de Meji Je com Ose traz o conhecimento medicinal. A sabedoria oculta canaliza a energia curativa para restabelecer o equilbrio espiritual e físico através do conhecimento ancestral.',
    characteristics: ['cura', 'conhecimento', 'sabedoria-curativa', 'restauracao', 'equilibrio'],
    category: 'combinacao',
    practice: 'ritual-de-conhecimento-curativo',
  },
  {
    id: 'meji-je-oba',
    name: 'Meji Je-Oba',
    description: 'Meji Je com Oba revela a sabedoria do servico sagrado. O conhecimento profundo orienta as relações de poder e devoção na comunidade, fortalecendo liderança sábia e comprometida.',
    characteristics: ['servico', 'liderazgo', 'sabedoria', 'comunidade', 'conhecimento'],
    category: 'combinacao',
    practice: 'ritual-de-sabedoria-no-servico',
  },
];

const aspects: string[] = [
  'sabedoria',
  'conhecimento',
  'introspeccao',
  'profundidade',
  'sigilo',
  'iniciacao',
  'transformacao',
  'ancestral',
  'protecao',
  'estrategia',
  'cura',
];

function buildData(): MejiJeData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiJeData | null = null;

export function getData(): MejiJeData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiJeEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiJeEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiJeEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;