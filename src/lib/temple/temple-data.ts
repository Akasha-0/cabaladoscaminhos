// Temple data
export interface TempleEntity {
  id: string;
  name: string;
  description: string;
  type?: string;
  purpose?: string;
}

export interface TempleData {
  entities: TempleEntity[];
}

const templeEntities: TempleEntity[] = [
  {
    id: 'inner-sacred',
    name: 'Santuário Interior',
    description: 'O espaço sagrado no centro da alma onde reside a essência divina.',
    type: 'inner_sanctum',
    purpose: 'meditation_and_reflection',
  },
  {
    id: 'heart-temple',
    name: 'Templo do Coração',
    description: 'O santuário do amor incondicional e compaixão universal.',
    type: 'heart_center',
    purpose: 'emotional_healing',
  },
  {
    id: 'third-eye-shrine',
    name: 'Santuário do Terceiro Olho',
    description: 'A câmara de percepção além dos sentidos físicos.',
    type: 'wisdom_center',
    purpose: 'intuition_and_insight',
  },
  {
    id: 'crown-sacred',
    name: 'Sagrado da Coroa',
    description: 'O portal de conexão com a consciência universal.',
    type: 'crown_chakra',
    purpose: 'spiritual_alignment',
  },
  {
    id: 'meridian-temple',
    name: 'Templo dos Meridianos',
    description: 'Os canais de energia que conectam corpo e espírito.',
    type: 'energy_pathway',
    purpose: 'vitality_and_flow',
  },
];

export function getData(): TempleData {
  return {
    entities: templeEntities,
  };
}