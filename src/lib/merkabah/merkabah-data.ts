/**
 * Merkabah Data - Merkabah vehicle data for Cabala dos Caminhos
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MerkabahData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  description: string;
  descriptionPt: string;
  timestamp: number;
}

const merkabahData: MerkabahData[] = [
  {
    id: 'merkabah-stability',
    name: 'Estabilidade da Merkaba',
    namePt: 'Estabilidade da Merkaba',
    nameEn: 'Merkabah Stability',
    value: 35,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Stability of the rotating light vehicle for interdimensional travel',
    descriptionPt: 'Estabilidade do veículo de luz rotativo para viagem interdimensional',
    timestamp: Date.now(),
  },
  {
    id: 'light-body-activation',
    name: 'Ativação do Corpo de Luz',
    namePt: 'Ativação do Corpo de Luz',
    nameEn: 'Light Body Activation',
    value: 42,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Degree of light body template activation in the etheric field',
    descriptionPt: 'Grau de ativação do template do corpo de luz no campo etérico',
    timestamp: Date.now(),
  },
  {
    id: 'counter-rotation',
    name: 'Contrarotação',
    namePt: 'Contrarotação',
    nameEn: 'Counter-Rotation',
    value: 50,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Balance between clockwise and counter-clockwise rotation of light fields',
    descriptionPt: 'Equilíbrio entre rotação horária e anti-horária dos campos de luz',
    timestamp: Date.now(),
  },
  {
    id: 'star-tetrahedron-flow',
    name: 'Fluxo do Tetraedro Estrela',
    namePt: 'Fluxo do Tetraedro Estrela',
    nameEn: 'Star Tetrahedron Flow',
    value: 38,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Harmonic flow through the eight tetrahedra forming the merkaba geometry',
    descriptionPt: 'Fluxo harmônico através dos oito tetraedros formando a geometria da merkaba',
    timestamp: Date.now(),
  },
  {
    id: 'spirit-vehicle-sync',
    name: 'Sincronização do Veículo Espiritual',
    namePt: 'Sincronização do Veículo Espiritual',
    nameEn: 'Spirit Vehicle Synchronization',
    value: 45,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Alignment between spirit, mind and body vehicles of light',
    descriptionPt: 'Alinhamento entre os veículos de luz do espírito, mente e corpo',
    timestamp: Date.now(),
  },
  {
    id: 'dimensional-bridge',
    name: 'Ponte Dimensional',
    namePt: 'Ponte Dimensional',
    nameEn: 'Dimensional Bridge',
    value: 28,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Capacity to bridge between physical and higher dimensional realities',
    descriptionPt: 'Capacidade de Ponte entre realidades físicas e dimensionais superiores',
    timestamp: Date.now(),
  },
  {
    id: 'chrysalis-completion',
    name: 'Conclusão da Crisálida',
    namePt: 'Conclusão da Crisálida',
    nameEn: 'Chrysalis Completion',
    value: 22,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Progress in the personal transformation chrysalis before merkaba activation',
    descriptionPt: 'Progresso na crisálida de transformação pessoal antes da ativação da merkaba',
    timestamp: Date.now(),
  },
  {
    id: 'kundalini-ascension',
    name: 'Ascensão Kundalini',
    namePt: 'Ascensão Kundalini',
    nameEn: 'Kundalini Ascension',
    value: 55,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Rising kundalini energy reaching higher chakra centers',
    descriptionPt: 'Energia kundalini ascendente alcançando centros de chakra superiores',
    timestamp: Date.now(),
  },
];

/**
 * Get all merkabah data entries
 */
export function getData(): MerkabahData[] {
  return merkabahData;
}

/**
 * Get merkabah data entry by id
 */
export function getDataById(id: string): MerkabahData | undefined {
  return merkabahData.find((d) => d.id === id);
}

/**
 * Get merkabah data by category based on id prefix
 */
export function getDataByCategory(category: string): MerkabahData[] {
  return merkabahData.filter((d) => d.id.startsWith(category));
}
