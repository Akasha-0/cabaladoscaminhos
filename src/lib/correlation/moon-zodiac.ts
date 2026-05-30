/**
 * Moon-Zodiac Correlation Module
 * Maps the 8 lunar phases to zodiac signs with element alignments and spiritual practices
 * Based on IDEIA.md lunar alchemy and classical astrology correspondences
 */

export interface MoonZodiac {
  fase: string;
  signo: string;
  elemento: 'fogo' | 'terra' | 'ar' | 'água';
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  energia: 'receptiva' | 'ativa' | 'transmutadora' | 'dissolutiva';
  praticas: string[];
  caracteristicas: string[];
}

/**
 * The 8 lunar phases mapped to zodiac signs, elements, and spiritual practices
 * Each phase aligns with the energetic quality of its associated zodiac sign
 * Based on the Alquimia Lunar table from IDEIA.md and classical Western astrology
 */
export const MOON_ZODIAC_MAP: Record<string, MoonZodiac> = {
  'lua-nova': {
    fase: 'Lua Nova',
    signo: 'Escorpião',
    elemento: 'água',
    qualidade: 'fixed',
    energia: 'receptiva',
    praticas: [
      'Iniciação de projetos secretos',
      'Meditação profunda',
      'Trabalho interno e autoconhecimento',
      'Definir intenções ocultas',
      'Conexão com o inconsciente',
    ],
    caracteristicas: [
      'Transformação interior',
      'Intuição penetrante',
      'Poder pessoal silencioso',
      'Renovação das fundações',
    ],
  },
  'lua-crescente': {
    fase: 'Lua Crescente',
    signo: 'Sagitário',
    elemento: 'fogo',
    qualidade: 'mutable',
    energia: 'ativa',
    praticas: [
      'Rituais de abertura de caminhos',
      'Expansão de projetos',
      'Busca por conhecimento',
      'Viagens espirituais',
      'Ativação da optimism',
    ],
    caracteristicas: [
      'Crescimento acelerado',
      'Expansão da consciência',
      'Descoberta e aventura',
      'Fé e propósito',
    ],
  },
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    signo: 'Áries',
    elemento: 'fogo',
    qualidade: 'cardinal',
    energia: 'ativa',
    praticas: [
      'Ação decisiva',
      'Quebra de obstáculos',
      'Coragem para novos começos',
      'Iniciativa pessoal',
      'Liderança espiritual',
    ],
    caracteristicas: [
      'Força de vontade',
      'Pioneirismo',
      'Movimento rápido',
      'Impulso de transformação',
    ],
  },
  'lua-cheia': {
    fase: 'Lua Cheia',
    signo: 'Câncer',
    elemento: 'água',
    qualidade: 'cardinal',
    energia: 'ativa',
    praticas: [
      'Iluminação emocional',
      'Rituais de cura e perdão',
      'Conexão com ancestrais',
      'Proteção do lar',
      'Manifestação de desejos',
    ],
    caracteristicas: [
      'Apex de magnetismo',
      'Claridade emocional',
      'Intuição no pico',
      'Culminação de ciclos',
    ],
  },
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    signo: 'Capricórnio',
    elemento: 'terra',
    qualidade: 'cardinal',
    energia: 'transmutadora',
    praticas: [
      'Avaliação de progresso',
      'Estruturação de objetivos',
      'Descarrego de padrões',
      'Disciplina espiritual',
      'Purificação de antigas formas',
    ],
    caracteristicas: [
      'Refinamento estrutural',
      'Responsabilidade assumida',
      'Dissolução do que não serve',
      'Construção sólida',
    ],
  },
  'lua-minguante': {
    fase: 'Lua Minguante',
    signo: 'Libra',
    elemento: 'ar',
    qualidade: 'cardinal',
    energia: 'dissolutiva',
    praticas: [
      'Harmonização de relacionamentos',
      'Equilíbrio de forças opostas',
      'Mediação espiritual',
      'Desapego de equilíbrio falso',
      'Restabelecimento de justiça',
    ],
    caracteristicas: [
      'Equilíbrio e justiça',
      'Releitura de partnerships',
      'Diplomacia sagrada',
      'Culminação do discernimento',
    ],
  },
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    signo: 'Aquário',
    elemento: 'ar',
    qualidade: 'fixed',
    energia: 'dissolutiva',
    praticas: [
      'Liberação de dogmas',
      'Inovação espiritual',
      'Desapego social',
      'Visão ampliada da humanidade',
      'Prepara\u00e7\u00e3o para novo paradigma',
    ],
    caracteristicas: [
      'Desconstrução do antigo',
      'Abertura para o novo',
      'Humanitarismo profundo',
      'Libertação das formas',
    ],
  },
  'lua-velha': {
    fase: 'Lua Velha (Bals\u00e2mica)',
    signo: 'Virgem',
    elemento: 'terra',
    qualidade: 'mutable',
    energia: 'dissolutiva',
    praticas: [
      'Purifica\u00e7\u00e3o interior',
      'An\u00e1lise de padr\u00f5es',
      'Purga de ilusões',
      'Perfeccionamento espiritual',
      'Recolhimento para renascimento',
    ],
    caracteristicas: [
      'Purifica\u00e7\u00e3o total',
      'Discernimento agudo',
      'Desapego da matéria',
      'Transi\u00e7\u00e3o para o novo ciclo',
    ],
  },
};

/**
 * Get the Moon-Zodiac correlation for a given lunar phase
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonZodiac mapping or null if phase not found
 */
export function getMoonZodiac(fase: string): MoonZodiac | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_ZODIAC_MAP[normalizedFase] ?? null;
}

/**
 * Get all Moon-Zodiac mappings
 * @returns Array of all MoonZodiac mappings
 */
export function getAllMoonZodiacs(): MoonZodiac[] {
  return Object.values(MOON_ZODIAC_MAP);
}

/**
 * Get zodiac sign for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The zodiac sign or null if not found
 */
export function getZodiacMoon(fase: string): string | null {
  return MOON_ZODIAC_MAP[fase.toLowerCase().trim()]?.signo ?? null;
}

/**
 * Get all phases that align with a specific element
 * Useful for elemental ritual planning
 */
export function getMoonPhasesByElement(
  elemento: MoonZodiac['elemento']
): MoonZodiac[] {
  return Object.values(MOON_ZODIAC_MAP).filter(
    (mapping) => mapping.elemento === elemento
  );
}

/**
 * Get all phases that align with a specific quality
 * Useful for timing rituals by energy dynamics
 */
export function getMoonPhasesByQuality(
  qualidade: MoonZodiac['qualidade']
): MoonZodiac[] {
  return Object.values(MOON_ZODIAC_MAP).filter(
    (mapping) => mapping.qualidade === qualidade
  );
}

/**
 * Get the element for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementByPhase(fase: string): MoonZodiac['elemento'] | null {
  return MOON_ZODIAC_MAP[fase.toLowerCase().trim()]?.elemento ?? null;
}

/**
 * Get the energy type for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The energy type or null if not found
 */
export function getEnergyByPhase(
  fase: string
): MoonZodiac['energia'] | null {
  return MOON_ZODIAC_MAP[fase.toLowerCase().trim()]?.energia ?? null;
}