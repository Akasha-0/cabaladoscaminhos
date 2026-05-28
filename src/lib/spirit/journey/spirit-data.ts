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
    id: 'caminho',
    name: 'Caminho da Alma',
    description: 'Jornada evolutiva através das esferas celestiais.',
    origin: 'Tradição Cabalística',
  },
  {
    id: 'ascensao',
    name: 'Ascensão Espiritual',
    description: 'Processo de elevação dimensional da consciência.',
    origin: 'Tradição Hermética',
  },
  {
    id: 'transicao',
    name: 'Transição dimensional',
    description: 'Movimento entre planos de existência espiritual.',
    origin: 'Tradição Antiga',
  },
];

export function getData(): SpiritData {
  return {
    entities: spiritEntities,
  };
}