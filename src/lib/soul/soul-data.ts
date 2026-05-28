// Soul data
export interface SoulEntity {
  id: string;
  name: string;
  description: string;
  essence?: string;
}

export interface SoulData {
  entities: SoulEntity[];
}

const soulEntities: SoulEntity[] = [
  {
    id: 'essence',
    name: 'Essência Divina',
    description: 'A centelha divina que constitui a verdadeira natureza da alma.',
    essence: ' divine_spark',
  },
  {
    id: 'higher-self',
    name: 'Eu Superior',
    description: 'A porção iluminada que conecta com a sabedoria universal.',
    essence: 'transcendental_wisdom',
  },
  {
    id: 'heart-seed',
    name: 'Semente do Coração',
    description: 'O núcleo de luz que pulsa no centro existencial.',
    essence: 'unconditional_love',
  },
];

export function getData(): SoulData {
  return {
    entities: soulEntities,
  };
}
