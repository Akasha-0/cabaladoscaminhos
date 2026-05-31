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
  nome_fase: string;
  signo: Signo;
  elemento: Elemento;
  qualidade: Qualidade;
  significado_espiritual: string;
  energia_moon: string;
  archetype_connection: string;
  ritual_guidance: string[];
}

const MOON_ZODIAC_MAP: Record<FaseLua, MoonZodiac> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    signo: 'Escorpião',
    elemento: 'Água',
    qualidade: 'Fixo',
    significado_espiritual: 'Renascimento e transformação profunda. Momento de plantar sementes no inconsciente, onde a escuridão da lua nova encontra a intensidade de Escorpião para regeneração total.',
    energia_moon: 'Receptiva, regenerativa, transformadora',
    archetype_connection: 'A Feiticeira - magia de renovação e poder pessoal',
    ritual_guidance: ['Rituais de renascimento interior', 'Limpeza de velhas feridas', 'Invocação de força transformadora'],
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    signo: 'Sagitário',
    elemento: 'Fogo',
    qualidade: 'Mutável',
    significado_espiritual: 'Expansão e busca por verdade. A energia crescente da lua encontra o otimismo de Sagitário para ampliar horizontes e buscar conhecimento sagrado.',
    energia_moon: 'Expansiva, aventureira, esperançosa',
    archetype_connection: 'A Sábia - busca por sabedoria e expansão da consciência',
    ritual_guidance: ['Rituais de expansão de consciência', 'Busca por conhecimento espiritual', 'Viagens internas e externas'],
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    signo: 'Áries',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    significado_espiritual: 'Ação e coragem. A lua em crescimento encontra a força de Áries para iniciar projetos com determinação e vigor guerreiro.',
    energia_moon: 'Ativa, corajosa, pioneira',
    archetype_connection: 'A Guerreira - ativação da vontade e coragem de agir',
    ritual_guidance: ['Rituais de ativação da vontade', 'Quebra de obstáculos', 'Iniciação de novos projetos'],
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    signo: 'Câncer',
    elemento: 'Água',
    qualidade: 'Cardinal',
    significado_espiritual: 'Iluminação emocional e proteção. A plenitude da lua encontra a sensibilidade de Câncer para revelar emoções e nutrir a alma.',
    energia_moon: 'Manifestadora, iluminada, nutridora',
    archetype_connection: 'A Mãe - cuidados, proteção e conexão com ancestrais',
    ritual_guidance: ['Rituais de alta magia', 'Conexão com ancestrais', 'Libertação emocional e cura'],
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    signo: 'Capricórnio',
    elemento: 'Terra',
    qualidade: 'Cardinal',
    significado_espiritual: 'Disciplina e purificação. A energia declinante da lua encontra a ambição estruturada de Capricórnio para purgar o que não serve e construir bases sólidas.',
    energia_moon: 'Purificadora, estruturante, resoluta',
    archetype_connection: 'A Mestra - sabedoria através da disciplina e师长',
    ritual_guidance: ['Rituais de limpeza e descarrego', 'Organização e estruturação', 'Libertação de padrões-limitantes'],
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    signo: 'Libra',
    elemento: 'Ar',
    qualidade: 'Cardinal',
    significado_espiritual: 'Harmonia e equilíbrio. A lua em dissolução encontra o equilíbrio de Libra para reconciliar opostos e buscar justiça cósmica.',
    energia_moon: 'Harmonizadora, equilibrante, mediadora',
    archetype_connection: 'A Justiça - equilíbrio, harmonia e decisões equilibradas',
    ritual_guidance: ['Rituais de harmonia em relacionamentos', 'Meditação por equilíbrio interior', 'Decisões com discernimento'],
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    signo: 'Aquário',
    elemento: 'Ar',
    qualidade: 'Fixo',
    significado_espiritual: 'Libertação e inovação. A energia em declínio encontra a Originalidade de Aquário para dissolver o velho e preparar o novo modelo de ser.',
    energia_moon: 'Libertadora, inovadora, visionária',
    archetype_connection: 'O Inventor - quebra de paradigmas e visão de futuro',
    ritual_guidance: ['Rituais de inovação espiritual', 'Libertação de dogmas', 'Conexão com a coletividade'],
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    signo: 'Virgem',
    elemento: 'Terra',
    qualidade: 'Mutável',
    significado_espiritual: 'Discernimento e purificação final. A lua em seu ciclo mais antigo encontra o pragmatismo de Virgem para depurar o essencial e preparar o renascimento.',
    energia_moon: 'Ancestral, depurativa, preparatória',
    archetype_connection: 'A Serva - serviço sagrado e purificação do físico e emocional',
    ritual_guidance: ['Rituais de descarrego final', 'Purificação do corpo e ambiente', 'Preparação para novo ciclo'],
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
 * @param elemento - The element to filter by
 * @returns Array of MoonZodiac mappings for that element
 */
export function getMoonPhasesByElement(elemento: string): MoonZodiac[] {
  return getAllMoonZodiacs().filter(
    (m) => m.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get moon phases associated with a specific quality.
 * @param qualidade - The quality to filter by (Cardinal, Fixo, Mutável)
 * @returns Array of MoonZodiac mappings for that quality
 */
export function getMoonPhasesByQuality(qualidade: string): MoonZodiac[] {
  return getAllMoonZodiacs().filter(
    (m) => m.qualidade.toLowerCase() === qualidade.toLowerCase()
  );
}

/**
 * Get the element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementByPhase(fase: string): Elemento | null {
  const mapping = getMoonZodiac(fase);
  return mapping?.elemento || null;
}

/**
 * Get the spiritual energy description for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The energy description or null if not found
 */
export function getEnergyByPhase(fase: string): string | null {
  const mapping = getMoonZodiac(fase);
  return mapping?.energia_moon || null;
}

/**
 * Get the moon phase corresponding to a specific zodiac sign.
 * @param signo - The zodiac sign
 * @returns The moon phase or null if not found
 */
export function getPhaseByZodiac(signo: string): FaseLua | null {
  const normalizedSign = signo.charAt(0).toUpperCase() + signo.slice(1).toLowerCase();
  const entry = Object.entries(MOON_ZODIAC_MAP).find(
    ([, mapping]) => mapping.signo === normalizedSign
  );
  return entry ? (entry[0] as FaseLua) : null;
}