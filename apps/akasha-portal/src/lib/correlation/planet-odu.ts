/**
 * Planet-Odú Ifá Correlation Mapping
 * Based on IDEIA.md Tabela de Correspondência Macro
 * Aligns classical planets with their corresponding Odu Ifá (Merindilogun)
 */

export interface PlanetOduMapping {
  /** Classical planet name (Portuguese) */
  planeta: string;
  /** Corresponding Odu Ifá number and name */
  odu: {
    numero: number;
    nome: string;
  };
  /** Energetic alignment classification */
  alinhamento_energetico: string;
  /** Spiritual significance and archetype */
  significado_espiritual: string;
  /** Ritual associations and offerings */
  associacoes_rituais: {
    ebos: string[];
    elementos: string[];
    direcoes: string[];
    cores: string[];
  };
}

// ─── Planet-to-Odú Ifá Mapping ─────────────────────────────────────────────────

export const PLANET_ODU_MAPPINGS: Record<string, PlanetOduMapping> = {
  Jupiter: {
    planeta: 'Júpiter',
    odu: {
      numero: 5,
      nome: 'Oxé',
    },
    alinhamento_energetico: 'Fria / Expansiva',
    significado_espiritual:
      'Oxé (5): O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual. Este odú confere magnetismo pessoal, charme natural e a capacidade de realizar feitiçarias (no sentido de magia ritual). Traz a energia da diplomacia, da autoestima elevada e da atração de recursos materiais e emocionais.',
    associacoes_rituais: {
      ebos: [
        'Banhos de mel',
        'Caldas de frutas',
        'Oferendas com girassóis',
        'Moedas douradas em águas doces',
        'Rituais de atração e prosperidade',
      ],
      elementos: ['Água'],
      direcoes: ['Sul'],
      cores: ['Amarelo-ouro', 'Rosa', 'Azul-celeste'],
    },
  },
  Lua: {
    planeta: 'Lua',
    odu: {
      numero: 4,
      nome: 'Irosun',
    },
    alinhamento_energetico: 'Fria / Receptiva',
    significado_espiritual:
      'Irosun (4): O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro com clareza. Este odú confere intuição profunda, capacidade de interpretar avisos e sonhos, e conexão com as águas geradoras. Abre a visão interior para perceber o que está além do véu.',
    associacoes_rituais: {
      ebos: [
        'Alimentos brancos para Iemanjá',
        'Canjica na beira-mar',
        'Banhos de folhas frias (colônia, saião)',
        'Rituais de proteção e clarividência',
      ],
      elementos: ['Fogo', 'Terra'],
      direcoes: ['Norte'],
      cores: ['Azul Escuro', 'Branco', 'Azul-celeste'],
    },
  },
  Marte: {
    planeta: 'Marte',
    odu: {
      numero: 7,
      nome: 'Odi',
    },
    alinhamento_energetico: 'Quente / Ígnea',
    significado_espiritual:
      'Odi (7): A teimosia, o renascimento, as coisas ocultas, o poço profundo. Traz a energia da transmutação e do renascimento após ciclos difíceis. O poço profundo representa os mistérios ocultos que devem ser explorados para alcançar a transformação. Desperta a coragem de enfrentar o que está oculto.',
    associacoes_rituais: {
      ebos: [
        'Pipoca (Deburu) para Omolu',
        'Banhos de lama ou argila',
        'Defumações pesadas com resinas',
        'Rituais de transmutação e proteção',
      ],
      elementos: ['Terra', 'Água'],
      direcoes: ['Norte'],
      cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    },
  },
  Mercurio: {
    planeta: 'Mercúrio',
    odu: {
      numero: 3,
      nome: 'Etaogundá',
    },
    alinhamento_energetico: 'Neutra / Volátil',
    significado_espiritual:
      'Etaogundá (3): A revolta, a força física, a criação de ferramentas. O corte e a separação. Este odú traz a energia da criação através do trabalho, da justiça e da força interior. Representa a capacidade de criar ferramentas (no sentido literal e metafórico) para superar obstáculos e manter o equilíbrio.',
    associacoes_rituais: {
      ebos: [
        'Inhames assados',
        'Paliteiros de Ogum',
        'Limpeza com folhas de mariô',
        'Limpeza com ferro',
        'Rituais de defesa e firmeza',
      ],
      elementos: ['Fogo', 'Terra'],
      direcoes: ['Oeste'],
      cores: ['Vermelho', 'Verde', 'Azul Claro'],
    },
  },
  Saturno: {
    planeta: 'Saturno',
    odu: {
      numero: 1,
      nome: 'Okaran',
    },
    alinhamento_energetico: 'Quente / Densa',
    significado_espiritual:
      'Okaran (1): O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado. Este odú traz a energia do início de ciclos, quando tudo ainda é dúvida e desafio. Representa a força necessária para iniciar grandes empreendimentos do zero, passando pela prova de fogo da insubordinação aos obstáculos.',
    associacoes_rituais: {
      ebos: [
        'Despachos em encruzilhadas',
        'Moedas para abrir caminhos',
        'Pipoca para Exu',
        'Panos escuros',
        'Rituais de abertura de caminhos',
      ],
      elementos: ['Terra', 'Fogo'],
      direcoes: ['Norte'],
      cores: ['Preto', 'Vermelho', 'Branco e Preto'],
    },
  },
  Sol: {
    planeta: 'Sol',
    odu: {
      numero: 6,
      nome: 'Obará',
    },
    alinhamento_energetico: 'Quente / Radiante',
    significado_espiritual:
      'Obará (6): A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo. Traz a energia da realeza interior, do brilho pessoal e da manifestação da prosperidade. Conecta o consulente à força vital do sol e à capacidade de transformar recursos em abundância.',
    associacoes_rituais: {
      ebos: [
        'Oferecer seis tipos de frutas',
        'Amalá para Xangô',
        'Dar comida à terra e partilhar banquetes',
        'Rituais de fartura e prosperidade',
      ],
      elementos: ['Fogo', 'Ar'],
      direcoes: ['Oeste'],
      cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    },
  },
  Venus: {
    planeta: 'Vênus',
    odu: {
      numero: 8,
      nome: 'EjiOníle',
    },
    alinhamento_energetico: 'Fria / Magnética',
    significado_espiritual:
      'EjiOníle (8): A cabeça (Ori), a liderança, o topo do mundo, o sangue branco. Este odú representa a liderança espiritual, o cuidado com o Ori (cabeça) e a conexão com o divino. Traz a energia da paz absoluta, da pureza e do alinhamento com a sabedoria superior. É o odú do Bori e da consagração da cabeça.',
    associacoes_rituais: {
      ebos: [
        'Oferendas de canjica branca',
        'Algodão para Oxalá',
        'Banhos de boldo (tapete de Oxalá)',
        'Velas brancas',
        'Rituais de alinhamento (Bori)',
      ],
      elementos: ['Ar', 'Água'],
      direcoes: ['Centro', 'Leste'],
      cores: ['Branco', 'Marfim', 'Opala'],
    },
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(PLANET_ODU_MAPPINGS);
// Freeze nested objects
Object.values(PLANET_ODU_MAPPINGS).forEach(mapping => {
  Object.freeze(mapping);
  Object.freeze(mapping.odu);
  Object.freeze(mapping.associacoes_rituais);
});

/**
 * Get the planet-to-Odú Ifá correlation mapping
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetOdu(planeta: string): PlanetOduMapping | null {
  return PLANET_ODU_MAPPINGS[planeta] ?? null;
}

/**
 * Get the Odu-to-planet reverse mapping
 * @param oduNome - Odu name (e.g., 'Obará', 'Irosun', 'Odi')
 * @returns The planet name or null if not found
 */
export function getOduPlanet(oduNome: string): string | null {
  for (const [planeta, mapping] of Object.entries(PLANET_ODU_MAPPINGS)) {
    if (mapping.odu.nome === oduNome) {
      return planeta;
    }
  }
  return null;
}

/**
 * Get all available planet-Odú mappings
 * @returns Array of all correlation mappings
 */
export function getAllPlanetOdus(): PlanetOduMapping[] {
  return Object.values(PLANET_ODU_MAPPINGS);
}

/**
 * Get all planet names
 * @returns Array of planet names (sorted alphabetically)
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_ODU_MAPPINGS).sort();
}

/**
 * Check if a planet exists in the mapping
 * @param planeta - Planet name to check
 * @returns True if planet exists in mapping
 */
export function hasPlanetOdu(planeta: string): boolean {
  return planeta in PLANET_ODU_MAPPINGS;
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The planet mapping associated with that Odu number, or null if not found
 */
export function getOduByNumber(numero: number): PlanetOduMapping | null {
  for (const mapping of Object.values(PLANET_ODU_MAPPINGS)) {
    if (mapping.odu.numero === numero) {
      return mapping;
    }
  }
  return null;
}

export default {
  getPlanetOdu,
  getOduPlanet,
  getAllPlanetOdus,
  getAllPlanets,
  hasPlanetOdu,
  getOduByNumber,
  PLANET_ODU_MAPPINGS,
};
