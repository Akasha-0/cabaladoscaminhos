/**
 * Planet-Element Spiritual Correlation
 * Based on IDEIA.md Cabala dos Caminhos system data
 * Maps each planet to its ruling element with full spiritual context
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export type Planeta = 'Sol' | 'Lua' | 'Mercúrio' | 'Vênus' | 'Marte' | 'Júpiter' | 'Saturno';

export interface PlanetElementMapping {
  /** Planet name */
  planeta: Planeta;
  /** Primary element */
  elemento: Elemento;
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

// ─── Planet-to-Element Mapping ─────────────────────────────────────────────────

export const PLANET_ELEMENT_MAPPINGS: Record<Planeta, PlanetElementMapping> = {
  Sol: {
    planeta: 'Sol',
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    orixa: 'Xangô',
    dia_sagrado: 'Domingo',
    cores: ['Amarelo', 'Dourado', 'Laranja'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    associacoes_espirituais: [
      'Vitalidade e energia vital',
      'Transformação e purificação',
      'Vontade e determinação',
      'Brilho pessoal e carisma',
      'Fogo sagrado da criação',
      'Identidade e propósito de vida',
      'Espírito de liderança',
 ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
      'Glândula pineal',
    ],
    praticas: {
      ebos: ['Amalá para Xangô', 'Oferendas de fogo', 'Frutos dourados'],
      banhos: ['Ervas quentes (guiné, arruda)', 'Folhas de quebra-pedra', 'Alecrim'],
      defumacoes: ['Sândalo', 'Cravo-da-índia', 'Canela', 'Benjoim'],
    },
  },
  Lua: {
    planeta: 'Lua',
    elemento: 'Água',
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira',
    cores: ['Azul Escuro', 'Branco', 'Prata', 'Transparente'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    associacoes_espirituais: [
      'Emoção e sensibilidade',
      'Intuição e sabedoria interior',
      'Maternidade e nutrição',
      'Ciclos e mudanças',
      'Águas profundas do inconsciente',
      'Memória e sonhos',
      'Fertilidade e renovação',
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Glândula pituitária',
    ],
    praticas: {
      ebos: ['Canjica na beira-mar para Iemanjá', 'Alimentos brancos', 'Leite e coco'],
      banhos: ['Colônia', 'Alcaparra', 'Folha de lágrima-de-Nossa-Senhora', 'Manjericão'],
      defumacoes: ['Lavanda', 'Lálá', 'Alcáçuz', 'Flor de maracujá'],
    },
  },
  Mercúrio: {
    planeta: 'Mercúrio',
    elemento: 'Ar',
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira',
    cores: ['Amarelo', 'Verde', 'Arco-íris'],
    chakra: '4º Cardíaco',
    sephirah: 'Hod',
    associacoes_espirituais: [
      'Mente e intelecto',
      'Comunicação e expressão',
      'Flexibilidade e adaptação',
      'Ciclos de transformação',
      'Movimento e respiração',
      'Inteligência prática',
      'Comércio e viagens',
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Cardíaco (anahara)',
      'Sistema nervoso',
      'Temperamento melancólico',
      'Glândula tireoide',
    ],
    praticas: {
      ebos: ['Arroz doce para Oxumaré', 'Oferendas de arco-íris', 'Dinheiro-em-penca'],
      banhos: ['Dinheiro-em-penca', 'Folha da fortuna', 'Guiné'],
      defumacoes: ['Alfarroba', 'Benjoim', 'Mastruz', 'Alecrim'],
    },
  },
  Vênus: {
    planeta: 'Vênus',
    elemento: 'Água',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    orixa: 'Oxum',
    dia_sagrado: 'Sexta-feira',
    cores: ['Rosa', 'Azul Claro', 'Verde Claro', 'Branco'],
    chakra: '4º Cardíaco',
    sephirah: 'Netzach',
    associacoes_espirituais: [
      'Amor e beleza',
      'Harmonia e prazer',
      'Fertilidade e abundância',
      'Conexões afetivas',
      'Arte e criatividade',
      'Relacionamentos e uniões',
      'Autoestima e valor próprio',
    ],
    afinidades: [
      'Sistema renal',
      'Chakra Cardíaco (anahara)',
      'Sistema reprodutivo',
      'Temperamento fleumático',
      'Glândulas suprarrenais',
    ],
    praticas: {
      ebos: ['Mel e água para Oxum', 'Perfume e flores', 'Oferendas de mel'],
      banhos: ['Rosa', 'Flor de cova', 'Manjericão roxo', 'Cravo'],
      defumacoes: ['Benjoim', 'Mastruz', 'Lavanda', 'Rosa seca'],
    },
  },
  Marte: {
    planeta: 'Marte',
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    orixa: 'Xangô',
    dia_sagrado: 'Terça-feira',
    cores: ['Vermelho', 'Laranja', 'Preto'],
    chakra: '1º Básico',
    sephirah: 'Geburah',
    associacoes_espirituais: [
      'Coragem e ação',
      'Energia de proteção',
      'Determinação e força',
      'Luta e conquista',
      'Justiça e equilíbrio de poder',
      'Energia sexual e criativa',
      'Assertividade e liderança',
    ],
    afinidades: [
      'Sistema muscular',
      'Chakra Básico (muladhara)',
      'Sistema digestivo (fogo gástrico)',
      'Temperamento bilioso',
      'Glândulas sexuais',
    ],
    praticas: {
      ebos: ['Pimenta para Xangô', 'Azeite e limões', 'Oferendas de guerra'],
      banhos: ['Pimenta', 'Arruda', 'Guiné', 'Cravo-da-índia'],
      defumacoes: ['Cravo', 'Canela', 'Pimenta-da-jamaica', 'Gengibre'],
    },
  },
  Júpiter: {
    planeta: 'Júpiter',
    elemento: 'Fogo',
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Úmido',
      polaridade: 'Yang',
    },
    orixa: 'Oxalá',
    dia_sagrado: 'Domingo',
    cores: ['Branco', 'Amarelo', 'Azul Claro'],
    chakra: '5º Laríngeo',
    sephirah: 'Chesed',
    associacoes_espirituais: [
      'Expansão e abundância',
      'Sabedoria e filosofia',
      'Sorte e prosperidade',
      'Espiritualidade e fé',
      'Generosidade e compaixão',
      'Crescimento pessoal',
      'Proteção espiritual',
    ],
    afinidades: [
      'Fígado e vesícula biliar',
      'Chakra Laríngeo (vishuddha)',
      'Sistema circulatório arterial',
      'Temperamento bilioso',
      'Glândula hipófise',
    ],
    praticas: {
      ebos: ['Fumo de incenso para Oxalá', 'Milho e pipoca', 'Alimentos brancos'],
      banhos: ['Alecrim', 'Manjericão branco', 'Cânfora', 'Espada-de-São-Jorge'],
      defumacoes: ['Sândalo branco', 'Benjoim', 'Lavanda', 'Alcáçuz'],
    },
  },
  Saturno: {
    planeta: 'Saturno',
    elemento: 'Terra',
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
      'Disciplina e organização',
      'Karma e destino',
 ],
    afinidades: [
      'Sistema esquelético',
      'Chakra Básico (muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Glândula paratireoide',
    ],
    praticas: {
      ebos: ['Pipoca (Deburu) para Omolu', 'Ebó de caminho', 'Alimentos pretos'],
      banhos: ['Canela-de-velho', 'Assa-peixe', 'Erva-de-bicho', 'Pau-brasil'],
      defumacoes: ['Pau-brasil', 'Nim', 'Carvão vegetal', 'Eucalipto'],
    },
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_ELEMENT_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ELEMENT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Returns the planet-element mapping for a given planet name.
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Mercúrio', 'Saturno')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetElement(planeta: string): PlanetElementMapping | null {
  const normalized = planeta.charAt(0).toUpperCase() + planeta.slice(1).toLowerCase() as Planeta;
  return PLANET_ELEMENT_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the element-planet mapping (reverse lookup).
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
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
