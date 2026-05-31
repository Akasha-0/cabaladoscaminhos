/**
 * Moon-Zodiac Spiritual Correlation Module
 * Maps the 8 lunar phases to zodiac signs with element connections
 * and spiritual meanings based on astrological hermetic traditions.
 * 
 * Based on Cabala dos Caminhos lunar-zodiac synthesis principles.
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';
export type Qualidade = 'Cardinal' | 'Fixo' | 'Mutável';
export type Signo = 'Áries' | 'Touro' | 'Gêmeos' | 'Câncer' | 'Leão' | 'Virgem' | 'Libra' | 'Escorpião' | 'Sagitário' | 'Capricórnio' | 'Aquário' | 'Peixes';
export type FaseLua = 
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export interface MoonZodiac {
  fase: string;
  signo: Signo;
  elemento: 'fogo' | 'água' | 'ar' | 'terra';
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  energia: 'receptiva' | 'ativa' | 'transmutadora' | 'dissolutiva';
  praticas: string[];
  caracteristicas: string[];
}

export const MOON_ZODIAC_MAP: Record<FaseLua, MoonZodiac> = {
  'lua-nova': {
    fase: 'Lua Nova',
    signo: 'Escorpião',
    elemento: 'água',
    qualidade: 'fixed',
    energia: 'receptiva',
    praticas: [
      'Iniciação de projetos secretos',
      'Planejamento de longo prazo',
      'Conexão com o inconsciente',
      'Rituais de renascimento interior',
    ],
    caracteristicas: [
      'Transformação interior',
      'Poder pessoal',
      'Mistério e profundidade',
      'Regeneração total',
    ],
  },
  'lua-crescente': {
    fase: 'Lua Crescente',
    signo: 'Sagitário',
    elemento: 'fogo',
    qualidade: 'mutable',
    energia: 'ativa',
    praticas: [
      'Expansão de projetos',
      'Busca por conhecimento',
      'Viagens espirituais',
      'Otimismo e esperança',
    ],
    caracteristicas: [
      'Aventura e exploração',
      'Sabedoria filosófica',
      'Expansão de horizontes',
      'Busca por verdade',
    ],
  },
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    signo: 'Áries',
    elemento: 'fogo',
    qualidade: 'cardinal',
    energia: 'ativa',
    praticas: [
      'Quebra de obstáculos',
      'Início de ações',
      'Coragem e determinação',
      'Ativação da vontade',
    ],
    caracteristicas: [
      'Pioneirismo',
      'Iniciativa guerreira',
      'Força de ação',
      'Determinação',
    ],
  },
  'lua-cheia': {
    fase: 'Lua Cheia',
    signo: 'Câncer',
    elemento: 'água',
    qualidade: 'cardinal',
    energia: 'ativa',
    praticas: [
      'Manifestação de desejos',
      'Conexão com ancestrais',
      'Rituais de proteção',
      'Culminação emocional',
    ],
    caracteristicas: [
      'Nutrição emocional',
      'Iluminação interna',
      'Conexão com a família',
      'Proteção e cuidado',
    ],
  },
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    signo: 'Capricórnio',
    elemento: 'terra',
    qualidade: 'cardinal',
    energia: 'transmutadora',
    praticas: [
      'Limpeza de velhos padrões',
      'Estruturação de projetos',
      'Disciplina e organização',
      'Purificação kármica',
    ],
    caracteristicas: [
      'Ambição estruturada',
      'Disciplina rigorosa',
      'Responsabilidade',
      'Ascensão pelo esforço',
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
      'Equilíbrio de opostos',
      'Decisões com discernimento',
      'Justiça cósmica',
    ],
    caracteristicas: [
      'Equilíbrio e harmonia',
      'Beleza e estética',
      'Parceria e diplomacia',
      'Discernimento justo',
    ],
  },
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    signo: 'Aquário',
    elemento: 'ar',
    qualidade: 'fixed',
    energia: 'dissolutiva',
    praticas: [
      'Libertação de dogmas',
      'Inovação espiritual',
      'Conexão com a coletividade',
      'Quebra de paradigmas',
    ],
    caracteristicas: [
      'Originalidade',
      'Humanitarismo',
      'Visão de futuro',
      'Liberdade interior',
    ],
  },
  'lua-velha': {
    fase: 'Lua Velha (Balsâmica)',
    signo: 'Virgem',
    elemento: 'terra',
    qualidade: 'mutable',
    energia: 'dissolutiva',
    praticas: [
      'Descarrego final',
      'Purificação do ambiente',
      'Organização e ordem',
      'Preparação para novo ciclo',
    ],
    caracteristicas: [
      'Discernimento prático',
      'Pureza e organização',
      'Análise crítica',
      'Serviço sagrado',
    ],
  },
};

/**
 * Returns the complete moon-zodiac mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonZodiac mapping or null if phase not found
 */
export function getMoonZodiac(fase: string): MoonZodiac | null {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return MOON_ZODIAC_MAP[faseNormalizada] || null;
}

/**
 * Get the zodiac sign for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The zodiac sign or null if not found
 */
export function getZodiacMoon(fase: string): Signo | null {
  const mapping = getMoonZodiac(fase);
  return mapping?.signo || null;
}

/**
 * Get all moon-zodiac mappings.
 * @returns Array of all MoonZodiac mappings
 */
export function getAllMoonZodiacs(): MoonZodiac[] {
  return Object.values(MOON_ZODIAC_MAP);
}

/**
 * Get moon phases associated with a specific element.
 * @param elemento - The element to filter by (case-insensitive)
 * @returns Array of MoonZodiac mappings for that element
 */
export function getMoonPhasesByElement(elemento: string): MoonZodiac[] {
  const normalized = elemento.toLowerCase();
  return getAllMoonZodiacs().filter(
    (m) => m.elemento.toLowerCase() === normalized
  );
}

/**
 * Get moon phases associated with a specific quality.
 * @param qualidade - The quality to filter by (Cardinal, Fixo, Mutável or lowercased)
 * @returns Array of MoonZodiac mappings for that quality
 */
export function getMoonPhasesByQuality(qualidade: string): MoonZodiac[] {
  const normalized = qualidade.toLowerCase();
  return getAllMoonZodiacs().filter(
    (m) => m.qualidade.toLowerCase() === normalized
  );
}

/**
 * Get the element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementByPhase(fase: string): MoonZodiac['elemento'] | null {
  const mapping = getMoonZodiac(fase);
  return mapping?.elemento || null;
}

/**
 * Get the spiritual energy description for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The energy description or null if not found
 */
export function getEnergyByPhase(fase: string): MoonZodiac['energia'] | null {
  const mapping = getMoonZodiac(fase);
  return mapping?.energia || null;
}