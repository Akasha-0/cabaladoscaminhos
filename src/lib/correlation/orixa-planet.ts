/**
 * Orixá-Planet Correlation Module
 * Maps Orixás to planets, elements, and spiritual meanings
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaPlanet {
  orixa: string;
  planeta: string;
  elemento: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  significado_espiritual: string;
  planeta_secundario?: string;
}

// Main Orixá-Planet mappings based on IDEIA.md
const ORIXAS_PLANETS_MAP: Record<string, OrixaPlanet> = {
  'Oxalá': {
    orixa: 'Oxalá',
    planeta: 'Sol',
    elemento: 'éter',
    significado_espiritual: 'O Criador supremo, Pai de todos os Orixás. Governa a criação, pureza, paz e reconciliação. Simboliza o princípio masculino da fecundidade cósmica e a energia etérea que conecta o físico ao espiritual.',
    planeta_secundario: 'Júpiter'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    planeta: 'Lua',
    elemento: 'água',
    significado_espiritual: 'Mãe das águas e Rainha do Mar. Provedora, nutridora e protetora maternal. Governa os ciclos reprodutivos, a fertilidade, os partos e o amor incondicional. Sua energia hídrica traz cura emocional e renovação espiritual.',
    planeta_secundario: 'Netuno'
  },
  'Oxum': {
    orixa: 'Oxum',
    planeta: 'Vênus',
    elemento: 'água',
    significado_espiritual: 'A riqueza interior e a prosperidade material. Deusa do ouro, dos rios e do amor. Governa a vaidade, a beleza, a sensualidade e a abundância. Sua energia hídrica ensina a fluir com gracejo e a atrair recursos com elegância.'
  },
  'Ogum': {
    orixa: 'Ogum',
    planeta: 'Marte',
    elemento: 'terra',
    significado_espiritual: 'O guerreiro, ferreiro e senhor das encruzilhadas. Abre caminhos, vence batalhas e conquista territórios. Sua energia telúrica representa a força, a perseverança e a capacidade de superar obstáculos com coragem.',
    planeta_secundario: 'Plutão'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    planeta: 'Júpiter',
    elemento: 'terra',
    significado_espiritual: 'O caçador, provedor e senhor das matas. Busca constante, sabedoria ancestral e conexão com a natureza. Sua energia terrestre ensina a buscar com persistência, a confiar no processo e a celebrar as conquistas com alegria.'
  },
  'Xangô': {
    orixa: 'Xangô',
    planeta: 'Sol',
    elemento: 'fogo',
    significado_espiritual: 'O senhor da justiça, do raio e do trovão. Governa a lei cósmica, a verdade e o equilíbrio social. Sua energia ígnea traz poder, autoridade e a capacidade de destruir o que não serve para reconstruir com maior força.',
    planeta_secundario: 'Marte'
  },
  'Iansã': {
    orixa: 'Iansã',
    planeta: 'Urano',
    elemento: 'fogo',
    significado_espiritual: 'A guerreira dos ventos e das tempestades. Dona das mudanças bruscas e das transformações radicais. Sua energia ígnea representa a libertação, a revolução interior e a capacidade de se adaptar aos ventos da vida com determinação.',
    planeta_secundario: 'Plutão'
  },
  'Omolu': {
    orixa: 'Omolu',
    planeta: 'Saturno',
    elemento: 'terra',
    significado_espiritual: 'O senhor das doenças e da cura, das portas e do destino. Transforma a escuridão em luz, a doença em saúde. Sua energia telúrica ensina que através do confronto com a escuridão encontramos a verdadeira cura e renascimento.'
  },
  'Nanã': {
    orixa: 'Nanã',
    planeta: 'Saturno',
    elemento: 'água',
    significado_espiritual: 'A anciã, senhora das águas paradas e do barro. Governa a sabedoria dos anciãos, os segredos ancestrais e a transformação da matéria. Sua energia hídrica ensina que a verdadeira sabedoria vem com o tempo e a experiência.',
    planeta_secundario: 'Lua'
  }
};

/**
 * Get Orixá planet correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaPlanet mapping or undefined if not found
 */
export function getOrixaPlanet(orixa: string): OrixaPlanet | undefined {
  const normalized = orixa.trim();
  return ORIXAS_PLANETS_MAP[normalized] || Object.values(ORIXAS_PLANETS_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXAS_PLANETS_MAP);
}

/**
 * Get reverse mapping: planet to associated Orixás
 * @param planeta - Name of the planet
 * @returns Array of Orixás associated with that planet
 */
export function getPlanetOrixa(planeta: string): OrixaPlanet[] {
  const normalized = planeta.trim().toLowerCase();
  return Object.values(ORIXAS_PLANETS_MAP).filter(
    entry => entry.planeta.toLowerCase() === normalized
  );
}

/**
 * Get all Orixá-planet mappings
 * @returns Array of all OrixaPlanet objects
 */
export function getAllOrixaPlanets(): OrixaPlanet[] {
  return Object.values(ORIXAS_PLANETS_MAP);
}

// fallow-ignore-next-line unused-export
export default {
  getOrixaPlanet,
  getAllOrixas,
  getPlanetOrixa,
  getAllOrixaPlanets,
};