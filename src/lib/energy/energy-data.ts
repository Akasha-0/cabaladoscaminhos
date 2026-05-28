/**
 * Energy Data - Core energy measurements and spiritual data for Cabala dos Caminhos
 */

export interface EnergyData {
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

const energyData: EnergyData[] = [
  {
    id: "prana-vital",
    name: "Prana Vital",
    namePt: "Prana Vital",
    nameEn: "Vital Prana",
    value: 72,
    min: 0,
    max: 100,
    unit: "%",
    description: "Universal life force energy level",
    descriptionPt: "Nível de energia força vital universal",
    timestamp: Date.now(),
  },
  {
    id: "chakra-balance",
    name: "Equilíbrio Chakral",
    namePt: "Equilíbrio Chakral",
    nameEn: "Chakra Balance",
    value: 65,
    min: 0,
    max: 100,
    unit: "%",
    description: "Overall chakra alignment and harmony",
    descriptionPt: "Alinhamento e harmonia geral dos chakras",
    timestamp: Date.now(),
  },
  {
    id: "etheric-field",
    name: "Campo Etérico",
    namePt: "Campo Etérico",
    nameEn: "Etheric Field",
    value: 78,
    min: 0,
    max: 100,
    unit: "%",
    description: "Etheric body energy density",
    descriptionPt: "Densidade de energia do corpo etérico",
    timestamp: Date.now(),
  },
  {
    id: "kundalini-flow",
    name: "Fluxo Kundalini",
    namePt: "Fluxo Kundalini",
    nameEn: "Kundalini Flow",
    value: 45,
    min: 0,
    max: 100,
    unit: "%",
    description: "Serpent energy progression through chakras",
    descriptionPt: "Progressão da energia serpente através dos chakras",
    timestamp: Date.now(),
  },
  {
    id: "qi-circulation",
    name: "Circulação de Qi",
    namePt: "Circulação de Qi",
    nameEn: "Qi Circulation",
    value: 68,
    min: 0,
    max: 100,
    unit: "%",
    description: "Meridian energy flow rate",
    descriptionPt: "Taxa de fluxo de energia nos meridianos",
    timestamp: Date.now(),
  },
  {
    id: "solar-plexus-glow",
    name: "Brilho Solar",
    namePt: "Brilho Solar",
    nameEn: "Solar Plexus Glow",
    value: 55,
    min: 0,
    max: 100,
    unit: "%",
    description: "Manipura chakra energy intensity",
    descriptionPt: "Intensidade de energia do chakra Manipura",
    timestamp: Date.now(),
  },
  {
    id: "heart-coherence",
    name: "Coerência Cardíaca",
    namePt: "Coerência Cardíaca",
    nameEn: "Heart Coherence",
    value: 82,
    min: 0,
    max: 100,
    unit: "%",
    description: "Heart-brain neural synchronization",
    descriptionPt: "Sincronização neural coração-cérebro",
    timestamp: Date.now(),
  },
  {
    id: "crown-connection",
    name: "Conexão Corona",
    namePt: "Conexão Corona",
    nameEn: "Crown Connection",
    value: 61,
    min: 0,
    max: 100,
    unit: "%",
    description: "Sahasrara chakra divine connection",
    descriptionPt: "Conexão divina do chakra Sahasrara",
    timestamp: Date.now(),
  },
  {
    id: "grounding-current",
    name: "Corrente de Ancoragem",
    namePt: "Corrente de Ancoragem",
    nameEn: "Grounding Current",
    value: 74,
    min: 0,
    max: 100,
    unit: "%",
    description: "Earth connection and grounding strength",
    descriptionPt: "Força de conexão com a Terra",
    timestamp: Date.now(),
  },
  {
    id: "auric-field-strength",
    name: "Força do Campo Áurico",
    namePt: "Força do Campo Áurico",
    nameEn: "Auric Field Strength",
    value: 70,
    min: 0,
    max: 100,
    unit: "%",
    description: "Overall auric field integrity and strength",
    descriptionPt: "Integridade e força geral do campo áurico",
    timestamp: Date.now(),
  },
];

/**
 * Get all energy data entries
 */
export function getData(): EnergyData[] {
  return energyData;
}

/**
 * Get energy data entry by id
 */
export function getDataById(id: string): EnergyData | undefined {
  return energyData.find((d) => d.id === id);
}

/**
 * Get energy data by category based on id prefix
 */
export function getDataByCategory(category: string): EnergyData[] {
  return energyData.filter((d) => d.id.startsWith(category));
}