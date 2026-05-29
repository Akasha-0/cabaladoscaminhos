// Chart templates library
// Pre-built chart configurations for common astrological visualizations

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: 'natal' | 'solar' | 'progressional' | 'synastry' | 'composito' | 'elemental' | 'numerology';
  config: ChartConfig;
}

export interface ChartConfig {
  showAspects: boolean;
  showHouses: boolean;
  showPlanets: boolean;
  showSignGlyphs: boolean;
  showHouseCusps: boolean;
  aspectOrbs: number;
  planets: string[];
  size: number;
  theme: 'dark' | 'light';
  colors: ChartColors;
}

export interface ChartColors {
  primary: string;
  secondary: string;
  aspect: {
    conjunction: string;
    opposition: string;
    trine: string;
    square: string;
    sextile: string;
    inconjunct: string;
  };
  elements: {
    fire: string;
    earth: string;
    air: string;
    water: string;
  };
}

/**
 * Get all available chart templates
 */
export function getTemplates(): ChartTemplate[] {
  return [
    natalFull,
    natalMinimal,
    solarReturn,
    progressional,
    synastryDefault,
    elementBalance,
    numerologyVibration,
  ];
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): ChartTemplate | undefined {
  return getTemplates().find((t) => t.id === id);
}

// Default dark theme colors
const darkColors: ChartColors = {
  primary: '#8b5cf6',
  secondary: '#6366f1',
  aspect: {
    conjunction: '#f59e0b',
    opposition: '#ef4444',
    trine: '#22c55e',
    square: '#ef4444',
    sextile: '#3b82f6',
    inconjunct: '#8b5cf6',
  },
  elements: {
    fire: '#ef4444',
    earth: '#84cc16',
    air: '#06b6d4',
    water: '#3b82f6',
  },
};


// Pre-built templates

export const natalFull: ChartTemplate = {
  id: 'natal-full',
  name: 'Mapa Natal Completo',
  description: 'Visualização completa do mapa natal com planetas, casas, aspectos e signos',
  type: 'natal',
  config: {
    showAspects: true,
    showHouses: true,
    showPlanets: true,
    showSignGlyphs: true,
    showHouseCusps: true,
    aspectOrbs: 8,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'],
    size: 600,
    theme: 'dark',
    colors: darkColors,
  },
};

export const natalMinimal: ChartTemplate = {
  id: 'natal-minimal',
  name: 'Mapa Natal Minimalista',
  description: 'Versão simplificada do mapa natal com apenas signos e planetas',
  type: 'natal',
  config: {
    showAspects: false,
    showHouses: false,
    showPlanets: true,
    showSignGlyphs: true,
    showHouseCusps: false,
    aspectOrbs: 0,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'],
    size: 400,
    theme: 'dark',
    colors: darkColors,
  },
};

export const solarReturn: ChartTemplate = {
  id: 'solar-return',
  name: 'Retorno Solar',
  description: 'Mapa do retorno solar para análise anual',
  type: 'solar',
  config: {
    showAspects: true,
    showHouses: true,
    showPlanets: true,
    showSignGlyphs: true,
    showHouseCusps: true,
    aspectOrbs: 6,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte'],
    size: 500,
    theme: 'dark',
    colors: darkColors,
  },
};

export const progressional: ChartTemplate = {
  id: 'progressional',
  name: 'Mapa Progressional',
  description: 'Cálculo secundário com direções simbólicas',
  type: 'progressional',
  config: {
    showAspects: true,
    showHouses: true,
    showPlanets: true,
    showSignGlyphs: true,
    showHouseCusps: true,
    aspectOrbs: 8,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte'],
    size: 550,
    theme: 'dark',
    colors: darkColors,
  },
};

export const synastryDefault: ChartTemplate = {
  id: 'synastry-default',
  name: 'Sinastria',
  description: 'Comparação entre dois mapas natais',
  type: 'synastry',
  config: {
    showAspects: true,
    showHouses: false,
    showPlanets: true,
    showSignGlyphs: true,
    showHouseCusps: false,
    aspectOrbs: 6,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'],
    size: 700,
    theme: 'dark',
    colors: darkColors,
  },
};

export const elementBalance: ChartTemplate = {
  id: 'element-balance',
  name: 'Balanço Elemental',
  description: 'Distribuição dos elementos no mapa natal',
  type: 'elemental',
  config: {
    showAspects: false,
    showHouses: false,
    showPlanets: true,
    showSignGlyphs: false,
    showHouseCusps: false,
    aspectOrbs: 0,
    planets: ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'],
    size: 400,
    theme: 'dark',
    colors: darkColors,
  },
};

export const numerologyVibration: ChartTemplate = {
  id: 'numerology-vibration',
  name: 'Vibração Numerológica',
  description: 'Gráfico numerológico baseado em nome e data',
  type: 'numerology',
  config: {
    showAspects: false,
    showHouses: false,
    showPlanets: false,
    showSignGlyphs: false,
    showHouseCusps: false,
    aspectOrbs: 0,
    planets: [],
    size: 300,
    theme: 'dark',
    colors: darkColors,
  },
};