export interface CosmicData {
  id: string;
  name: string;
  type: string;
  value: number;
  description: string;
  timestamp: number;
}

export const COSMIC_DATASET: CosmicData[] = [
  {
    id: 'cosmic-001',
    name: 'Stellar Core',
    type: 'star',
    value: 1.989e30,
    description: 'Solar mass基准',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-002',
    name: 'Galactic Center',
    type: 'galaxy',
    value: 4.3e6,
    description: '银河系中心黑洞质量（太阳质量）',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-003',
    name: 'Hubble Constant',
    type: 'constant',
    value: 67.4,
    description: '宇宙膨胀率 km/s/Mpc',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-004',
    name: 'Planck Mass',
    type: 'constant',
    value: 2.176e-8,
    description: '普朗克质量 kg',
    timestamp: Date.now(),
  },
  {
    id: 'cosmic-005',
    name: 'Dark Energy Density',
    type: 'energy',
    value: 6.9e-27,
    description: '暗能量密度 kg/m³',
    timestamp: Date.now(),
  },
];

export function getData(): CosmicData[] {
  return [...COSMIC_DATASET];
}