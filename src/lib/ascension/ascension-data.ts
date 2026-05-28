/**
 * Ascension Data - Spiritual ascension data for Cabala dos Caminhos
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AscensionData {
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

const ascensionData: AscensionData[] = [
  {
    id: 'consciousness-level',
    name: 'Nível de Consciência',
    namePt: 'Nível de Consciência',
    nameEn: 'Consciousness Level',
    value: 55,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Current state of expanded awareness and spiritual perception',
    descriptionPt: 'Estado atual de consciência expandida e percepção espiritual',
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
    id: 'soul-integration',
    name: 'Integração da Alma',
    namePt: 'Integração da Alma',
    nameEn: 'Soul Integration',
    value: 68,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Harmonization of soul fragments and higher self connection',
    descriptionPt: 'Harmonização de fragmentos da alma e conexão com o eu superior',
    timestamp: Date.now(),
  },
  {
    id: 'vibration-frequency',
    name: 'Frequência Vibracional',
    namePt: 'Frequência Vibracional',
    nameEn: 'Vibration Frequency',
    value: 73,
    min: 0,
    max: 100,
    unit: 'Hz',
    description: 'Personal energetic vibration rate aligned with higher dimensions',
    descriptionPt: 'Taxa de vibração energética pessoal alinhada com dimensões superiores',
    timestamp: Date.now(),
  },
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
    id: 'crown-chakra-flow',
    name: 'Fluxo do Chakra Coroa',
    namePt: 'Fluxo do Chakra Coroa',
    nameEn: 'Crown Chakra Flow',
    value: 61,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Divine energy channel through the sahasrara chakra',
    descriptionPt: 'Canal de energia divina através do chakra sahasrara',
    timestamp: Date.now(),
  },
  {
    id: 'third-eye-radiance',
    name: 'Brilho do Terceiro Olho',
    namePt: 'Brilho do Terceiro Olho',
    nameEn: 'Third Eye Radiance',
    value: 58,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Clairvoyant perception and inner vision clarity',
    descriptionPt: 'Percepção clarividente e clareza da visão interior',
    timestamp: Date.now(),
  },
  {
    id: 'sacred-fire-ignition',
    name: 'Ignição do Fogo Sagrado',
    namePt: 'Ignição do Fogo Sagrado',
    nameEn: 'Sacred Fire Ignition',
    value: 47,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Inner sacred fire activation for spiritual transformation',
    descriptionPt: 'Ativação do fogo sagrado interior para transformação espiritual',
    timestamp: Date.now(),
  },
  {
    id: 'etheric-template-alignment',
    name: 'Alinhamento do Template Etérico',
    namePt: 'Alinhamento do Template Etérico',
    nameEn: 'Etheric Template Alignment',
    value: 52,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Alignment with the cosmic blueprint for soul evolution',
    descriptionPt: 'Alinhamento com o blueprint cósmico para evolução da alma',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-connection',
    name: 'Conexão Cósmica',
    namePt: 'Conexão Cósmica',
    nameEn: 'Cosmic Connection',
    value: 64,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Deep connection to universal consciousness and source energy',
    descriptionPt: 'Conexão profunda com a consciência universal e energia fonte',
    timestamp: Date.now(),
  },
];

/**
 * Get all ascension data entries
 */
export function getData(): AscensionData[] {
  return ascensionData;
}

/**
 * Get ascension data entry by id
 */
export function getDataById(id: string): AscensionData | undefined {
  return ascensionData.find((d) => d.id === id);
}

/**
 * Get ascension data by category based on id prefix
 */
export function getDataByCategory(category: string): AscensionData[] {
  return ascensionData.filter((d) => d.id.startsWith(category));
}