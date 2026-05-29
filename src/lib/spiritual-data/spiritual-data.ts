// Spiritual Data Module - Core interfaces and data
// This file was reconstructed after corruption

export interface OduProperties {
  number: number;
  elements: string[];
  orixas: string[];
  quizilas: string[];
  preceitos: string[];
  ebo: string;
  theme?: string;
  themeReference?: string;
  frequency?: string;
  planet?: string;
  energyType?: string;
  function?: string;
  chakraTarget?: string;
  orixaActivated?: string[];
  [key: string]: unknown;
}

export interface OduData {
  id: string;
  category: string;
  name: string;
  description: string;
  origin: string;
  keywords: string[];
  properties: OduProperties;
}

export interface SpiritualData {
  id: string;
  category: string;
  name: string;
  description: string;
  origin: string;
  keywords: string[];
  properties?: OduProperties;
}

// Chakra data
export const CHAKRAS = [
  { id: 'root', name: 'Muladhara', color: '#ff0000', frequency: 396, element: 'terra' },
  { id: 'sacral', name: 'Svadhisthana', color: '#ff8800', frequency: 417, element: 'agua' },
  { id: 'solar', name: 'Manipura', color: '#ffff00', frequency: 528, element: 'fogo' },
  { id: 'heart', name: 'Anahata', color: '#00ff00', frequency: 639, element: 'ar' },
  { id: 'throat', name: 'Vishuddha', color: '#00ffff', frequency: 741, element: 'eter' },
  { id: 'third-eye', name: 'Ajna', color: '#0000ff', frequency: 852, element: 'luz' },
  { id: 'crown', name: 'Sahasrara', color: '#8800ff', frequency: 963, element: 'espirito' },
] as const;

// Simple spiritual data array
export const spiritualData: SpiritualData[] = [
  {
    id: 'chakra-root',
    category: 'chakra',
    name: 'Muladhara',
    description: 'O centro de sobrevivência e conexão terrena.',
    origin: 'Tradição Hindu',
    keywords: ['terra', 'estabilidade', 'segurança', 'sobrevivência'],
  },
];

export function getData(): SpiritualData[] {
  return spiritualData;
}

export function getDataByCategory(category: string): SpiritualData[] {
  return spiritualData.filter((d) => d.category === category);
}

export function getDataById(id: string): SpiritualData | undefined {
  return spiritualData.find((d) => d.id === id);
}

export function getCategories(): string[] {
  return Array.from(new Set(spiritualData.map((d) => d.category)));
}