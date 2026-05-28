// Meaning data
export interface MeaningEntity {
  id: string;
  name: string;
  description: string;
  origin?: string;
}

export interface MeaningData {
  entities: MeaningEntity[];
}

const meaningEntities: MeaningEntity[] = [
  {
    id: 'proposito-existencial',
    name: 'Propósito Existencial',
    description: 'A razão fundamental de ser e estar no mundo.',
    origin: 'Tradição Cabalística',
  },
  {
    id: 'dvik',
    name: 'Dvekut',
    description: 'União com o divino através da intenção e prática.',
    origin: 'Tradição Chassídica',
  },
  {
    id: 'kavaná',
    name: 'Kavaná',
    description: 'Intenção sagrada que direciona a consciência.',
    origin: 'Tradição Mística',
  },
];

export function getData(): MeaningData {
  return {
    entities: meaningEntities,
  };
}