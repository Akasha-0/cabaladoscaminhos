/**
 * Ascension V2 Data - Spiritual ascension data for Cabala dos Caminhos
 */

 

 
export interface AscensionV2Data {
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

const ascensionV2Data: AscensionV2Data[] = [
  {
    id: 'consciousness-level-v2',
    name: 'Nível de Consciência V2',
    namePt: 'Nível de Consciência V2',
    nameEn: 'Consciousness Level V2',
    value: 58,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Enhanced state of expanded awareness and spiritual perception',
    descriptionPt: 'Estado avançado de consciência expandida e percepção espiritual',
    timestamp: Date.now(),
  },
  {
    id: 'light-body-activation-v2',
    name: 'Ativação do Corpo de Luz V2',
    namePt: 'Ativação do Corpo de Luz V2',
    nameEn: 'Light Body Activation V2',
    value: 45,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Advanced degree of light body template activation in the etheric field',
    descriptionPt: 'Grau avançado de ativação do template do corpo de luz no campo etérico',
    timestamp: Date.now(),
  },
  {
    id: 'soul-integration-v2',
    name: 'Integração da Alma V2',
    namePt: 'Integração da Alma V2',
    nameEn: 'Soul Integration V2',
    value: 72,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Advanced harmonization of soul fragments and higher self connection',
    descriptionPt: 'Harmonização avançada de fragmentos da alma e conexão com o eu superior',
    timestamp: Date.now(),
  },
  {
    id: 'vibration-frequency-v2',
    name: 'Frequência Vibracional V2',
    namePt: 'Frequência Vibracional V2',
    nameEn: 'Vibration Frequency V2',
    value: 78,
    min: 0,
    max: 100,
    unit: 'Hz',
    description: 'Enhanced personal energetic vibration rate aligned with higher dimensions',
    descriptionPt: 'Taxa avançada de vibração energética pessoal alinhada com dimensões superiores',
    timestamp: Date.now(),
  },
  {
    id: 'merkabah-stability-v2',
    name: 'Estabilidade da Merkaba V2',
    namePt: 'Estabilidade da Merkaba V2',
    nameEn: 'Merkabah Stability V2',
    value: 38,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Enhanced stability of the merkaba vehicle for interdimensional travel',
    descriptionPt: 'Estabilidade avançada do veículo merkaba para viagens interdimensionais',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-connection-v2',
    name: 'Conexão Cósmica V2',
    namePt: 'Conexão Cósmica V2',
    nameEn: 'Cosmic Connection V2',
    value: 62,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Deepened connection to cosmic consciousness and universal wisdom',
    descriptionPt: 'Conexão aprofundada com a consciência cósmica e sabedoria universal',
    timestamp: Date.now(),
  },
  {
    id: 'ascension-flames-v2',
    name: 'Chamas da Ascensão V2',
    namePt: 'Chamas da Ascensão V2',
    nameEn: 'Ascension Flames V2',
    value: 51,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Activation level of the sacred ascension flames',
    descriptionPt: 'Nível de ativação das chamas sagradas da ascensão',
    timestamp: Date.now(),
  },
  {
    id: 'dimensional-shift-v2',
    name: 'Mudança Dimensional V2',
    namePt: 'Mudança Dimensional V2',
    nameEn: 'Dimensional Shift V2',
    value: 47,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Progress in shifting between dimensional frequencies',
    descriptionPt: 'Progresso na mudança entre frequências dimensionais',
    timestamp: Date.now(),
  },
];

/**
 * Get all ascension v2 data entries
 */
export function getData(): AscensionV2Data[] {
  return ascensionV2Data;
}

/**
 * Get ascension v2 data entry by id
 */
export function getDataById(id: string): AscensionV2Data | undefined {
  return ascensionV2Data.find((d) => d.id === id);
}

/**
 * Get ascension v2 data by category based on id prefix
 */
export function getDataByCategory(category: string): AscensionV2Data[] {
  return ascensionV2Data.filter((d) => d.id.startsWith(category));
}