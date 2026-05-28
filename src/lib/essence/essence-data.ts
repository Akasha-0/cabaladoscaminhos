// Essence data
export interface EssenceEntity {
  id: string;
  name: string;
  description: string;
  origin?: string;
}

export interface EssenceData {
  entities: EssenceEntity[];
}

const essenceEntities: EssenceEntity[] = [
  {
    id: 'essencia-vital',
    name: 'Essência Vital',
    description: 'Força primária que anima e sustenta a existência.',
    origin: 'Tradição Cabalística',
  },
  {
    id: 'chamma',
    name: 'Chamma',
    description: 'Raio de luz divina que ilumina o caminho interior.',
    origin: 'Tradição Hebraica',
  },
  {
    id: 'neshama',
    name: 'Neshama',
    description: 'Alma superior que conecta o ser ao divino.',
    origin: 'Tradição Cabalística',
  },
];

export function getData(): EssenceData {
  return {
    entities: essenceEntities,
  };
}