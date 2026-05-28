// @ts-nocheck
// Meji Ros data — The Ifá Divination System

export interface MejiRosEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface MejiRosData {
  entities: MejiRosEntity[];
  aspects: string[];
}

const entities: MejiRosEntity[] = [
  {
    id: 'meji-ros',
    name: 'Meji Ros',
    description: 'Meji Ros e o Odu que representa a forca da revelacao e da verdade manifesta. Este odu ensina que a luz da sabidencia emerge quando a dualidade e harmonizada, revelando caminhos ocultos e verdades profundas.',
    characteristics: ['revelacao', 'verdade', 'luz', 'claridade', 'sabedoria'],
    category: 'meji-ros',
    practice: 'meditacao-da-verdade',
  },
  {
    id: 'meji-ros-ogbe',
    name: 'Meji Ros-Ogbe',
    description: 'A uniao de Meji Ros com Ogbe traz o poder do recomeco iluminado. A revelacao de Meji Ros se une a capacidade de Ogbe de iniciar novos ciclos, permitindo comecar jornada com clareza e proposito.',
    characteristics: ['recomeco', 'iluminacao', 'claridade', 'inicio', 'proposito'],
    category: 'combinacao',
    practice: 'ritual-de-renovacao-iluminada',
  },
  {
    id: 'meji-ros-oyeku',
    name: 'Meji Ros-Oyeku',
    description: 'Meji Ros com Oyeku revela a transformacao da escuridao em luz. Este Odu indica que phase de transmutacao espiritual esta em curso, onde abundancia e clareza substituem a escassez e confusao.',
    characteristics: ['transmutacao', 'luz', 'abundancia', 'transformacao', 'clareza'],
    category: 'combinacao',
    practice: 'ritual-de-transmutacao',
  },
  {
    id: 'meji-ros-odi',
    name: 'Meji Ros-Odi',
    description: 'A combinacao de Meji Ros com Odi traz a visao profetica. A revelacao de Meji Ros encontra a profundidade de Odi para unveiled verdades ocultas e proporcionar discernimento espiritual.',
    characteristics: ['visao', 'profcia', 'discernimento', 'verdade-oculta', 'intuicao'],
    category: 'combinacao',
    practice: 'ritual-de-visao-proftica',
  },
  {
    id: 'meji-ros-irosun',
    name: 'Meji Ros-Irosun',
    description: 'Meji Ros com Irosun traz a verdade protetora. A luz da revelacao se manifesta como advertncia sagrada, protegendo contra perigos espirituais e revelando armadilhas ocultas.',
    characteristics: ['verdade', 'protecao', 'advertncia', 'vigilancia', 'cuidado'],
    category: 'combinacao',
    practice: 'ritual-de-verdade-protetora',
  },
  {
    id: 'meji-ros-ogunda',
    name: 'Meji Ros-Ogunda',
    description: 'Meji Ros com Ogunda representa a clareza na forca. A revelacao ilumina o caminho da acao e da construcao, permitindo grandes obras com visao clara e proposito autentico.',
    characteristics: ['acao', 'claridade', 'construcao', 'visao', 'realizacao'],
    category: 'combinacao',
    practice: 'ritual-da-acao-clara',
  },
  {
    id: 'meji-ros-ose',
    name: 'Meji Ros-Ose',
    description: 'A uniao de Meji Ros com Ose traz a verdade curativa. A luz da revelacao canaliza a energia medicinal para restabelecer equilbrio entre corpo, mente e espirito.',
    characteristics: ['cura', 'verdade', 'luz-curativa', 'restauracao', 'equilibrio'],
    category: 'combinacao',
    practice: 'ritual-de-cura-verdadeira',
  },
  {
    id: 'meji-ros-oba',
    name: 'Meji Ros-Oba',
    description: 'Meji Ros com Oba revela a verdade do servico sagrado. A claridade de Meji Ros orienta as relacoes de poder e servico na comunidade, fortalecendo liderazgo autntico e devoto.',
    characteristics: ['servico', 'liderazgo', 'verdade', 'comunidade', 'sabedoria'],
    category: 'combinacao',
    practice: 'ritual-de-servico-verdadeiro',
  },
];

const aspects: string[] = [
  'revelacao',
  'verdade',
  'luz',
  'claridade',
  'sabedoria',
  'transmutacao',
  'visao',
  'protecao',
  'acao',
  'cura',
];

function buildData(): MejiRosData {
  return {
    entities,
    aspects,
  };
}

// Singleton cache
let cachedData: MejiRosData | null = null;

export function getData(): MejiRosData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): MejiRosEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): MejiRosEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): MejiRosEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  return [...new Set(entities.map((e) => e.category))];
}

export function getAspects(): string[] {
  return [...aspects];
}

export default getData;
