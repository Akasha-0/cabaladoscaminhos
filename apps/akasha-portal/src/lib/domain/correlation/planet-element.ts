/**
 * Planet-Element Spiritual Correlation
 * Based on IDEIA.md Cabala dos Caminhos system data
 * Aligns the seven classical planets with their elemental correspondences
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type Planeta = 'Sol' | 'Lua' | 'Mercúrio' | 'Vênus' | 'Marte' | 'Júpiter' | 'Saturno';

export interface PlanetElementMapping {
  /** Planet name */
  planeta: Planeta;
  /** Associated element */
  elemento: Elemento;
  /** Chakra correspondent */
  chakra: string;
  /** Orixá correspondent */
  orixa: string;
  /** Elemental qualities */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
  /** Sacred day of the planet */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Sephirah correspondence (Cabala) */
  sephirah: string;
  /** Spiritual meaning / associations */
  significado_espiritual: string[];
  /** Affinities */
  afinidades: string[];
  /** Práticas espirituais */
  praticas: {
    ebos: string[];
    banhos: string[];
    defumacoes: string[];
  };
}

// ─── Planet-to-Element Mapping ────────────────────────────────────────────────

export const PLANET_ELEMENT_MAPPINGS: Record<Planeta, PlanetElementMapping> = {
  Sol: {
    planeta: 'Sol',
    elemento: 'Fogo',
    chakra: '3º Plexo Solar',
    orixa: 'Xangô',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    dia_sagrado: 'Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    sephirah: 'Tiphereth',
    significado_espiritual: [
      'Vitalidade e energia vital',
      'Transformação e purificação',
      'Vontade e determinação',
      'Brilho pessoal e carisma',
      'Fogo sagrado da criação',
      'Essência do ser e identidade',
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
  Lua: {
    planeta: 'Lua',
    elemento: 'Água',
    chakra: '6º Frontal',
    orixa: 'Iemanjá',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco', 'Transparente'],
    sephirah: 'Yesod',
    significado_espiritual: [
      'Emoção e sensibilidade',
      'Intuição e sabedoria interior',
      'Maternidade e nutrição',
      'Ciclos e mudanças',
      'Águas profundas do inconsciente',
      'Conexão com o sagrado feminino',
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
  Mercúrio: {
    planeta: 'Mercúrio',
    elemento: 'Ar',
    chakra: '4º Cardíaco',
    orixa: 'Oxumaré',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    dia_sagrado: 'Quarta-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde'],
    sephirah: 'Hod',
    significado_espiritual: [
      'Mente e intelecto',
      'Comunicação e expressão',
      'Flexibilidade e adaptação',
      'Ciclos de transformação',
      'Movimento e respiração',
      'Ligação entre céu e terra',
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Cardíaco (anahata)',
      'Sistema nervoso',
      'Temperamento melancólico',
    ],
    praticas: {
      ebos: ['Arroz doce para Oxumaré', 'Oferendas de arco-íris'],
      banhos: ['Dinheiro-em-penca', 'Folha da fortuna'],
      defumacoes: ['Alfarroba', 'Benjoim', 'Mastruz'],
    },
  },
  Vênus: {
    planeta: 'Vênus',
    elemento: 'Terra',
    chakra: '2º Sacral',
    orixa: 'Oxum',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Úmido',
      polaridade: 'Equilibrado',
    },
    dia_sagrado: 'Sexta-feira',
    cores: ['Rosa', 'Azul Claro', 'Verde', 'Dourado'],
    sephirah: 'Netzach',
    significado_espiritual: [
      'Amor e beleza',
      'Harmonia e prazer',
      'Fertilidade e abundância',
      'Conexão com a natureza',
      'Valorização do sagrado feminino',
      'Prazer da existência',
    ],
    afinidades: [
      'Sistema reprodutivo',
      'Chakra Sacral (svadhisthana)',
      'Rins e bexiga',
      'Temperamento sanguíneo',
    ],
    praticas: {
      ebos: ['Mel e flores para Oxum', 'Água de florais'],
      banhos: ['Rosa', 'Jasmim', 'Flor de laranjeira'],
      defumacoes: ['Baunilha', 'Rosa', 'Ylang-ylang'],
    },
  },
  Marte: {
    planeta: 'Marte',
    elemento: 'Fogo',
    chakra: '1º Básico',
    orixa: 'Ogum',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    dia_sagrado: 'Terça-feira',
    cores: ['Vermelho', 'Laranja', 'Amarelo Queimado'],
    sephirah: 'Gevurah',
    significado_espiritual: [
      'Força e coragem',
      'Ação e determinação',
      'Proteção e conquista',
      'Energia de transformação',
      'Luta e superação',
      'Poderio warrior espiritual',
    ],
    afinidades: [
      'Sistema muscular',
      'Chakra Básico (muladhara)',
      'Sistema imunológico',
      'Temperamento bilioso',
    ],
    praticas: {
      ebos: ['Comidas picantes para Ogum', 'Oferendas de ferro'],
      banhos: ['Pimenta', 'Gengibre', 'Alecrim'],
      defumacoes: ['Pimenta', 'Gengibre seco', 'Cravo'],
    },
  },
  Júpiter: {
    planeta: 'Júpiter',
    elemento: 'Éter',
    chakra: '7º Coronário',
    orixa: 'Oxalá',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Neutro',
      polaridade: 'Yang',
    },
    dia_sagrado: 'Quinta-feira',
    cores: ['Branco', 'Dourado', 'Violeta'],
    sephirah: 'Chesed',
    significado_espiritual: [
      'Expansão e abundância',
      'Sabedoria e filosofia',
      'Fé e otimismo',
      'Transcendência espiritual',
      'Generosidade e justiça',
      'Conexão com o divino',
    ],
    afinidades: [
      'Fígado e vesícula biliar',
      'Chakra Coronário (sahasrara)',
      'Sistema nervoso central',
      'Consciência cósmica',
    ],
    praticas: {
      ebos: ['Leite e alimentos brancos para Oxalá', 'Oferendas de paz'],
      banhos: ['Alfazema', 'Flor de bacharel', 'Rosa branca'],
      defumacoes: ['Benjoim puro', 'Sálvia branca', 'Mirra'],
    },
  },
  Saturno: {
    planeta: 'Saturno',
    elemento: 'Terra',
    chakra: '1º Básico',
    orixa: 'Omolu',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    dia_sagrado: 'Sábado',
    cores: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    sephirah: 'Malkuth',
    significado_espiritual: [
      'Estrutura e fundamentação',
      'Ancestralidade e tradição',
      'Transformação e renovação',
      'Saúde física e transmutação',
      'O lodo primordial da criação',
      'Disciplina e limites sagrados',
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
Object.freeze(PLANET_ELEMENT_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ELEMENT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Returns the planet-element mapping for a given planet name.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetElement(planeta: string): PlanetElementMapping | null {
  const normalized = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase() as Planeta;
  return PLANET_ELEMENT_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the element-planet mapping (reverse lookup).
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns The planet name or null if not found
 */
export function getElementPlanet(elemento: string): Planeta | null {
  const normalized = elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase() as Elemento;
  
  for (const [planeta, mapping] of Object.entries(PLANET_ELEMENT_MAPPINGS)) {
    if (mapping.elemento === normalized) {
      return planeta as Planeta;
    }
  }
  return null;
}

/**
 * Returns all planet-element mappings.
 * @returns Array of all correlation mappings
 */
export function getAllPlanetElements(): PlanetElementMapping[] {
  return Object.values(PLANET_ELEMENT_MAPPINGS);
}