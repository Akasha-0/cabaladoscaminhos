// Spirit data
export interface SpiritEntity {
  id: string;
  name: string;
  description: string;
  origin?: string;
}

export interface SpiritData {
  entities: SpiritEntity[];
}

const spiritEntities: SpiritEntity[] = [
  {
    id: 'guia',
    name: 'Guia Espiritual',
    description: 'Entidade protetora que auxilia na jornada espiritual.',
    origin: 'Tradição Cabalística',
  },
  {
    id: 'mentor',
    name: 'Mentor Celestial',
    description: 'Força guia que oferece sabedoria e direcionamento.',
    origin: 'Tradição Hermética',
  },
  {
    id: 'guardiao',
    name: 'Guardião do Caminho',
    description: 'Protetor que vigia os portais entre dimensões.',
    origin: 'Tradição Antiga',
  },
];

export function getData(): SpiritData {
  return {
    entities: spiritEntities,
  };
}
