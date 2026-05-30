/**
 * Element-Planet Spiritual Correlation
 * Based on IDEIA.md Cabala dos Caminhos system data
 * Aligns the four classical elements with their planetary rulers
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export type Planeta = 'Sol' | 'Lua' | 'Mercúrio' | 'Vênus' | 'Marte' | 'Júpiter' | 'Saturno';

export interface ElementPlanetMapping {
  /** Element name (Portuguese) */
  elemento: Elemento;
  /** Planetary ruler */
  planeta: Planeta;
  /** Elemental qualities */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
  /** Orixá correspondent */
  orixa: string;
  /** Sacred day of the planet */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Chakra correspondent */
  chakra: string;
  /** Sephirah correspondence (Cabala) */
  sephirah: string;
  /** Spiritual associations */
  associacoes_espirituais: string[];
  /** Affinities */
  afinidades: string[];
  /** Práticas espirituais */
  praticas: {
    ebos: string[];
    banhos: string[];
    defumacoes: string[];
  };
}

// ─── Element-to-Planet Mapping ──────────────────────────────────────────────────

export const ELEMENT_PLANET_MAPPINGS: Record<Elemento, ElementPlanetMapping> = {
  Fogo: {
    elemento: 'Fogo',
    planeta: 'Sol',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    associacoes_espirituais: [
      'Vitalidade e energia vital',
      'Transformação e purificação',
      'Vontade e determinação',
      'Brilho pessoal e carisma',
      'Fogo sagrado da criação',
    ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
    ],
    praticas: {
      ebos: ['Amalá para Xangô', 'Oferendas de fogo'],
      banhos: ['Ervas quentes (guiné, arruda)', 'Folhas de quebra-pedra'],
      defumacoes: ['Sândalo', 'Cravo-da-índia', 'Canela'],
    },
  },
  Água: {
    elemento: 'Água',
    planeta: 'Lua',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco', 'Transparente'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    associacoes_espirituais: [
      'Emoção e sensibilidade',
      'Intuição e sabedoria interior',
      'Maternidade e nutrição',
      'Ciclos e mudanças',
      'Águas profundas do inconsciente',
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
    ],
    praticas: {
      ebos: ['Canjica na beira-mar para Iemanjá', 'Alimentos brancos'],
      banhos: ['Colônia', 'Alcaparra', 'Folha de lágrima-de-Nossa-Senhora'],
      defumacoes: ['Lavanda', 'Lálá', 'Alcáçuz'],
    },
  },
  Ar: {
    elemento: 'Ar',
    planeta: 'Mercúrio',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    chakra: '4º Cardíaco',
    sephirah: 'Hod',
    associacoes_espirituais: [
      'Mente e intelecto',
      'Comunicação e expressão',
      'Flexibilidade e adaptação',
      'Ciclos de transformação',
      'Movimento e respiração',
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Cardíaco (anahara)',
      'Sistema nervoso',
      'Temperamento melancólico',
    ],
    praticas: {
      ebos: ['Arroz doce para Oxumaré', 'Oferendas de arco-íris'],
      banhos: ['Dinheiro-em-penca', 'Folha da fortuna'],
      defumacoes: ['Alfarroba', 'Benjoim', 'Mastruz'],
    },
  },
  Terra: {
    elemento: 'Terra',
    planeta: 'Saturno',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    associacoes_espirituais: [
      'Estrutura e fundamentação',
      'Ancestralidade e tradição',
      'Transformação e renovação',
      'Saúde física e transmutação',
      'O lodo primordial da criação',
    ],
    afinidades: [
      'Sistema esquelético',
      'Chakra Básico (muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
    ],
    praticas: {
      ebos: ['Pipoca (Deburu) para Omolu', 'Ebó de caminho'],
      banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho'],
      defumacoes: ['Pau-brasil', 'Nim', 'Carvão vegetal'],
    },
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ELEMENT_PLANET_MAPPINGS);
// Freeze nested objects
Object.values(ELEMENT_PLANET_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Returns the element-planet mapping for a given element name.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns The correlation mapping or null if not found
 */
export function getElementPlanet(elemento: string): ElementPlanetMapping | null {
  const normalized = elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase() as Elemento;
  return ELEMENT_PLANET_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the planet-to-element mapping.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Mercúrio', 'Saturno')
 * @returns The element name or null if not found
 */
export function getPlanetElement(planeta: string): Elemento | null {
  const normalized = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase() as Planeta;
  
  for (const [elemento, mapping] of Object.entries(ELEMENT_PLANET_MAPPINGS)) {
    if (mapping.planeta === normalized) {
      return elemento as Elemento;
    }
  }
  return null;
}

/**
 * Returns all element-planet mappings.
 * @returns Array of all correlation mappings
 */
export function getAllElementPlanets(): ElementPlanetMapping[] {
  return Object.values(ELEMENT_PLANET_MAPPINGS);
}