/**
 * Moon-Frequency Spiritual Correlation Module
 * Maps lunar phases to Solfeggio frequencies with element and healing correspondences.
 * Based on Cabala dos Caminhos hermetic principles and lunar-sonic alchemy.
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type FaseLua =
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export interface MoonFrequencyMapping {
  fase: string;
  nome_fase: string;
  frequencia: number;
  elemento: Elemento;
  propriedades_healing: {
    fisico: string;
    emocional: string;
    mental_espiritual: string;
    pratica_recomendada: string;
  };
  qualidade_lunar: {
    energia: string;
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
    vibração: string;
    manifesto: string;
  };
  orixa_regente: string;
  chakra: string;
}

/**
 * Complete mapping of lunar phases to Solfeggio frequencies.
 * Each phase carries the vibrational signature that amplifies its spiritual intent.
 * Based on lunar elemental alchemy and traditional hermetic correspondences.
 */
export const MOON_FREQUENCY_MAP: Record<FaseLua, MoonFrequencyMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    frequencia: 396,
    elemento: 'Terra',
    propriedades_healing: {
      fisico: 'Fortalece ossos, ancoramento e sistema imunológico',
      emocional: 'Dissolve medos de novos inícios, culpa e padrões de escassez',
      mental_espiritual: 'Promove clareza para novos propósitos, sabedoria ancestral ekarma',
      pratica_recomendada: 'Meditação de ancoramento, plantio de sementes espirituais, trabalho com ancestrais',
    },
    qualidade_lunar: {
      energia: 'Receptiva e silenciosa',
      polaridade: 'Yin',
      vibração: 'Semente - potencial adormecido',
      manifesto: 'Novos inícios, proteção, renovação interior',
    },
    orixa_regente: 'Exu',
    chakra: '1º Básico (Muladhara)',
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    frequencia: 417,
    elemento: 'Água',
    propriedades_healing: {
      fisico: 'Purifica fluidos corporais, melhora circulação linfática e limpeza energética',
      emocional: 'Liberta traumas emocionais, apegos do passado e bloqueios de prosperidade',
      mental_espiritual: 'Desperta intuição, sensibilidade espiritual e fluxo criativo',
      pratica_recomendada: 'Rituais de abertura de caminhos, banhos de prosperidade, visualização criativa',
    },
    qualidade_lunar: {
      energia: 'Crescente e nutridora',
      polaridade: 'Yang',
      vibração: 'Broto - crescimento vital',
      manifesto: 'Prosperidade, atração, movimento ascendente',
    },
    orixa_regente: 'Oxóssi',
    chakra: '2º Sacro (Svadhisthana)',
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    frequencia: 528,
    elemento: 'Fogo',
    propriedades_healing: {
      fisico: 'Estimula regeneração celular, ativa sistema nervoso e fortalece coração',
      emocional: 'Transforma medo em coragem, restaura confiança e desperta o guerreiro interior',
      mental_espiritual: 'Ativa poder de manifestação, propósito de vida e ação determinada',
      pratica_recomendada: 'Quebra de obstáculos, ritual de defesa, ativação da vontade',
    },
    qualidade_lunar: {
      energia: 'Ativa e desafiadora',
      polaridade: 'Yang',
      vibração: 'Chama - força transformadora',
      manifesto: 'Coragem, ação, quebra de barreiras',
    },
    orixa_regente: 'Ogum',
    chakra: '3º Plexo Solar (Manipura)',
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    frequencia: 639,
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Equilibra sistema hormonal, harmoniza metabolism e regula ciclos',
      emocional: 'Promove amor incondicional, harmonia em relacionamentos e gratidão plena',
      mental_espiritual: 'Desperta compaixão universal, beleza interior e conexão com o divino',
      pratica_recomendada: 'Alta magia de atração, consagrações, rituais de amor e cura coletiva',
    },
    qualidade_lunar: {
      energia: 'Manifestadora e iluminada',
      polaridade: 'Equilibrado',
      vibração: 'Oceano - plenitude absoluta',
      manifesto: 'Culminação, gratidão, magia manifesta',
    },
    orixa_regente: 'Oxalá',
    chakra: '4º Cardíaco (Anahata)',
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    frequencia: 741,
    elemento: 'Ar',
    propriedades_healing: {
      fisico: 'Purifica garganta e canais energéticos, melhora comunicação e expressão',
      emocional: 'Liberta medo de falar verdades, facilita expressão autêntica e perdão',
      mental_espiritual: 'Desperta sabedoria, eloquência e comunicação com guias espirituais',
      pratica_recomendada: 'Rituais de limpeza, descarrego, dissolução de padrões limitantes',
    },
    qualidade_lunar: {
      energia: 'Dissolutiva e libertadora',
      polaridade: 'Yang',
      vibração: 'Vento - dispersão do que não serve',
      manifesto: 'Libertação, purificação, transformação',
    },
    orixa_regente: 'Iansã',
    chakra: '5º Laríngeo (Vishuddha)',
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    frequencia: 852,
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Expande consciência, ativa terceira vista e desperta capacidades psíquicas',
      emocional: 'Dissipa ilusões, promove visão clara de verdades ocultas e expansão espiritual',
      mental_espiritual: 'Desperta sabedoria interior, compreensão profunda e intuição pura',
      pratica_recomendada: 'Meditação profunda, trabalho com terceiro olho, revelação de verdades',
    },
    qualidade_lunar: {
      energia: 'Transmutadora e reveladora',
      polaridade: 'Yin',
      vibração: 'Fumaça - dissolução no invisível',
      manifesto: 'Revelação de verdades ocultas, cura de feridas antigas',
    },
    orixa_regente: 'Omolu',
    chakra: '6º Frontal (Ajna)',
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    frequencia: 963,
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Ativa glândula pineal, desperta consciência cósmica e conecta com o todo',
      emocional: 'Promove integração do aprendizado, perdão profundo e paz interior',
      mental_espiritual: 'Conecta com a Fonte criadora, padrão original e unidade universal',
      pratica_recomendada: 'Sagramento, oração silenciosa, contemplação pura e integração do ciclo',
    },
    qualidade_lunar: {
      energia: 'Integradora e reflexiva',
      polaridade: 'Yin',
      vibração: 'Raiz - consolidação do aprendizado',
      manifesto: 'Integração, perdão, preparação para novo ciclo',
    },
    orixa_regente: 'Nanã',
    chakra: '7º Coronário (Sahasrara)',
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    frequencia: 963,
    elemento: 'Éter',
    propriedades_healing: {
      fisico: 'Facilita transição celular, purificação profunda e renovação energética total',
      emocional: 'Promove libertação de condicionamentos antigos e abertura para renascimento',
      mental_espiritual: 'Conecta com sabedoria dos antigos, consciência ancestral e limiar entre ciclos',
      pratica_recomendada: 'Rituais de despedida do ciclo, comunicação ancestral, preparo para Lua Nova',
    },
    qualidade_lunar: {
      energia: 'Ancestral e limiar',
      polaridade: 'Equilibrado',
      vibração: 'Limiar - entre mundos',
      manifesto: 'Comunicação com ancestrais, sabedoria dos antigos, preparo para renascimento',
    },
    orixa_regente: 'Omolu',
    chakra: '7º Coronário (Sahasrara)',
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(MOON_FREQUENCY_MAP);
Object.values(MOON_FREQUENCY_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the complete moon-frequency mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonFrequencyMapping or null if phase not found
 */
export function getMoonFrequency(fase: string): MoonFrequencyMapping | null {
  const normalizedFase = fase.toLowerCase().trim() as FaseLua;
  return MOON_FREQUENCY_MAP[normalizedFase] ?? null;
}

/**
 * Get the frequency corresponding to a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The frequency in Hz or null if not found
 */
export function getFrequencyMoon(fase: string): number | null {
  return getMoonFrequency(fase)?.frequencia ?? null;
}

/**
 * Get all moon-frequency mappings.
 * @returns Array of all MoonFrequencyMapping
 */
export function getAllMoonFrequencies(): MoonFrequencyMapping[] {
  return Object.values(MOON_FREQUENCY_MAP);
}

/**
 * Get the element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementByMoon(fase: string): Elemento | null {
  return getMoonFrequency(fase)?.elemento ?? null;
}

/**
 * Get the healing properties for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The healing properties or null if not found
 */
export function getHealingByMoon(fase: string): MoonFrequencyMapping['propriedades_healing'] | null {
  return getMoonFrequency(fase)?.propriedades_healing ?? null;
}

/**
 * Get the Orixá regente for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Orixá name or null if not found
 */
export function getOrixaByMoon(fase: string): string | null {
  return getMoonFrequency(fase)?.orixa_regente ?? null;
}

/**
 * Get the chakra associated with a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The chakra name or null if not found
 */
export function getChakraByMoon(fase: string): string | null {
  return getMoonFrequency(fase)?.chakra ?? null;
}

/**
 * Get the polarity for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The polarity or null if not found
 */
export function getPolarityByMoon(fase: string): 'Yang' | 'Yin' | 'Equilibrado' | null {
  return getMoonFrequency(fase)?.qualidade_lunar.polaridade ?? null;
}

/**
 * Get the spiritual quality (vibração) for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The vibration description or null if not found
 */
export function getVibrationByMoon(fase: string): string | null {
  return getMoonFrequency(fase)?.qualidade_lunar.vibração ?? null;
}

/**
 * Get all frequencies used in the mapping.
 * @returns Array of unique Solfeggio frequencies
 */
export function getAvailableFrequencies(): number[] {
  const frequencies = new Set(Object.values(MOON_FREQUENCY_MAP).map((m) => m.frequencia));
  return Array.from(frequencies).sort((a, b) => a - b);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): FaseLua[] {
  return Object.keys(MOON_FREQUENCY_MAP) as FaseLua[];
}

/**
 * Get all moon phases for a specific frequency.
 * @param frequencia - The Solfeggio frequency in Hz
 * @returns Array of MoonFrequencyMapping
 */
export function getMoonsByFrequency(frequencia: number): MoonFrequencyMapping[] {
  return Object.values(MOON_FREQUENCY_MAP).filter((m) => m.frequencia === frequencia);
}

/**
 * Get all moon phases for a specific element.
 * @param elemento - The element name
 * @returns Array of MoonFrequencyMapping
 */
export function getMoonsByElement(elemento: string): MoonFrequencyMapping[] {
  return Object.values(MOON_FREQUENCY_MAP).filter((m) => m.elemento === elemento);
}

/**
 * Get all moon phases for a specific Orixá.
 * @param orixa - The Orixá name
 * @returns Array of MoonFrequencyMapping
 */
export function getMoonsByOrixa(orixa: string): MoonFrequencyMapping[] {
  return Object.values(MOON_FREQUENCY_MAP).filter((m) => m.orixa_regente === orixa);
}