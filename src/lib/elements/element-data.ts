// @ts-nocheck
// Element data for spiritual elements

export interface ElementData {
  id: string;
  name: string;
  symbol: string;
  type: string;
  qualities: string[];
  attributes: string[];
  chakra: string;
  color: string;
  planet: string;
  season: string;
  direction: string;
  description: string;
}

export const ELEMENT_DATASET: ElementData[] = [
  {
    id: 'element-001',
    name: 'Fuego',
    symbol: '△',
    type: 'fire',
    qualities: ['transformación', 'pasión', 'energía'],
    attributes: ['dinamismo', 'claridad', 'inspiración'],
    chakra: 'Manipura',
    color: '#FF6B35',
    planet: 'Marte',
    season: 'Verano',
    direction: 'Sur',
    description: 'El elemento del fuego representa la transformación, la pasión y la energía vital.',
  },
  {
    id: 'element-002',
    name: 'Agua',
    symbol: '▽',
    type: 'water',
    qualities: ['adaptación', 'fluidez', 'intuición'],
    attributes: ['receptividad', 'emoción', 'conexión'],
    chakra: 'Svadhisthana',
    color: '#4A90D9',
    planet: 'Luna',
    season: 'Invierno',
    direction: 'Oeste',
    description: 'El elemento del agua simboliza la adaptación, la fluidez emocional y la conexión intuitiva.',
  },
  {
    id: 'element-003',
    name: 'Aire',
    symbol: '△▽',
    type: 'air',
    qualities: ['comunicación', 'libertad', 'pensamiento'],
    attributes: ['inteligencia', 'claridad mental', 'espíritu'],
    chakra: 'Anahata',
    color: '#A8E6CF',
    planet: 'Mercurio',
    season: 'Primavera',
    direction: 'Este',
    description: 'El elemento del aire representa la comunicación, la libertad mental y el pensamiento elevado.',
  },
  {
    id: 'element-004',
    name: 'Tierra',
    symbol: '▼',
    type: 'earth',
    qualities: ['estabilidad', 'fundamento', 'abundancia'],
    attributes: ['paciencia', 'fortaleza', 'nurtición'],
    chakra: 'Muladhara',
    color: '#8B4513',
    planet: 'Saturno',
    season: 'Otoño',
    direction: 'Norte',
    description: 'El elemento de la tierra simboliza la estabilidad, el fundamento y la abundancia material.',
  },
];

export function getData(): ElementData[] {
  return [...ELEMENT_DATASET];
}
