export interface ElementMeaning {
  name: string;
  symbol: string;
  qualities: string[];
  attributes: string[];
  chakra: string;
}

export function getMeanings(): Record<string, ElementMeaning> {
  return {
    fuego: {
      name: 'Fuego',
      symbol: '△',
      qualities: ['transformación', 'pasión', 'energía'],
      attributes: ['dinamismo', 'claridad', 'inspiración'],
      chakra: 'Manipura',
    },
    agua: {
      name: 'Agua',
      symbol: '▽',
      qualities: ['adaptación', 'fluidez', 'intuición'],
      attributes: ['receptividad', 'emoción', 'conexión'],
      chakra: 'Svadhisthana',
    },
    aire: {
      name: 'Aire',
      symbol: '△▽',
      qualities: ['comunicación', 'libertad', 'pensamiento'],
      attributes: ['inteligencia', 'claridad mental', 'espíritu'],
      chakra: 'Anahata',
    },
    tierra: {
      name: 'Tierra',
      symbol: '▼',
      qualities: ['estabilidad', 'fundamento', 'abundancia'],
      attributes: ['paciencia', 'fortaleza', 'nurtición'],
      chakra: 'Muladhara',
    },
  };
}