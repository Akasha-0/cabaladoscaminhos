/**
 * Planet-Zodiac-Aspect Correlation Mapping
 * Combines planets in zodiac signs with their astrological aspects
 * Based on classical Western astrology traditions integrated with Cabala dos Caminhos
 */

import { getPlanetZodiac, PLANET_ZODIAC_MAPPINGS, type PlanetZodiacMapping } from '@/lib/correlation/planet-zodiac';
import { getPlanetAspect, PLANET_ASPECTS, type PlanetAspect } from '@/lib/correlation/planet-aspect';

export interface PlanetZodiacAspectMapping {
  planeta: string;
  signo: string;
  aspecto: string;
  /** Dignidade: domicilio, exaltação, queda, exilio */
  dignidade: 'domicilio' | 'exaltação' | 'queda' | 'exilio' | 'nenhuma';
  /** Natureza do elemento: fogo, terra, ar, água */
  elemento: 'fogo' | 'terra' | 'ar' | 'água';
  /** Qualidade do signo: cardinal, fixed, mutable */
  qualidade: 'cardinal' | 'fixed' | 'mutable';
  /** Interpretação espiritual integrada */
  interpretação: string;
  /** Significado espiritual no sistema Cabala */
  significado_espiritual: string;
  /** Aspect nature from PLANET_ASPECTS */
  natureza_aspecto: 'harmonioso' | 'tensional' | 'neutro';
  /** Aspect symbol */
  símbolo_aspecto: string;
}

type Elemento = 'fogo' | 'terra' | 'ar' | 'água';
type Qualidade = 'cardinal' | 'fixed' | 'mutable';

// Element mapping for zodiac signs
const SIGN_ELEMENT: Record<string, Elemento> = {
  Áries: 'fogo',
  Leão: 'fogo',
  Sagitário: 'fogo',
  Touro: 'terra',
  Virgem: 'terra',
  Capricórnio: 'terra',
  Gêmeos: 'ar',
  Libra: 'ar',
  Aquário: 'ar',
  Câncer: 'água',
  Escorpião: 'água',
  Peixes: 'água',
};

// Quality mapping for zodiac signs
const SIGN_QUALITY: Record<string, Qualidade> = {
  Áries: 'cardinal',
  Câncer: 'cardinal',
  Libra: 'cardinal',
  Capricórnio: 'cardinal',
  Leão: 'fixed',
  Escorpião: 'fixed',
  Touro: 'fixed',
  Aquário: 'fixed',
  Gêmeos: 'mutable',
  Virgem: 'mutable',
  Sagitário: 'mutable',
  Peixes: 'mutable',
};

// All classical aspects
const ASPECTS = ['conjunção', 'sextil', 'quadratura', 'trino', 'oposição'] as const;

// Build the complete mapping: 7 planets × 12 signs × 5 aspects = 420 combinations
// We provide interpretive data for each combination
function buildPlanetZodiacAspectMappings(): PlanetZodiacAspectMapping[] {
  const mappings: PlanetZodiacAspectMapping[] = [];
  const planets = Object.keys(PLANET_ZODIAC_MAPPINGS);
  const signs = Object.keys(SIGN_ELEMENT);

  for (const planeta of planets) {
    for (const signo of signs) {
      for (const aspecto of ASPECTS) {
        const planetData = PLANET_ZODIAC_MAPPINGS[planeta];
        const aspectData = PLANET_ASPECTS[aspecto];
        const elemento = SIGN_ELEMENT[signo];
        const qualidade = SIGN_QUALITY[signo];

        // Determine dignity based on planet-zodiac relationship
        let dignidade: PlanetZodiacAspectMapping['dignidade'] = 'nenhuma';
        if (planetData.domicilio === signo) {
          dignidade = 'domicilio';
        } else if (planetData.exaltação === signo) {
          dignidade = 'exaltação';
        } else if (planetData.queda === signo) {
          dignidade = 'queda';
        } else if (planetData.exilio === signo) {
          dignidade = 'exilio';
        }

        // Build spiritual interpretation
        const interpretação = buildInterpretação(planeta, signo, aspecto, dignidade, elemento);
        const significado_espiritual = buildSignificadoEspiritual(planeta, signo, aspecto, aspectData.natureza);

        mappings.push({
          planeta,
          signo,
          aspecto,
          dignidade,
          elemento,
          qualidade,
          interpretação,
          significado_espiritual,
          natureza_aspecto: aspectData.natureza,
          símbolo_aspecto: aspectData.simbolo,
        });
      }
    }
  }

  return mappings;
}

// Build interpretive text for the combination
function buildInterpretação(
  planeta: string,
  signo: string,
  aspecto: string,
  dignidade: string,
  elemento: Elemento
): string {
  const dignityText: Record<string, string> = {
    domicilio: 'em dignidade máxima, exercendo seu poder arquetípico com plenitude',
    exaltação: 'em posição de honras, operando com brilho e reconhecimento',
    queda: 'em posição debilitada, enfrentando desafios para expressar sua essência',
    exilio: 'em desconforto profundo, lutando contra a dissonância entre sua natureza e o ambiente',
    nenhuma: 'em posição neutra, exercendo influência moderada',
  };

  const aspectInterpretation: Record<string, string> = {
    conjunção: 'fusão energética intensa, concentrando as forças planetárias',
    sextil: 'fluxo harmonioso de oportunidades, facilitando a expressão natural',
    quadratura: 'tensão criativa que exige ação transformadora',
    trino: 'harmonia automática, facilitando talentos inatos e fluidez',
    oposição: 'tensão dialética de polaridades, pedindo integração consciente',
  };

  return `Planeta ${planeta} em ${signo} em ${aspecto} — ${dignityText[dignidade]}. ${aspectInterpretation[aspecto]}. Elemento ${elemento} modula a expressão planetária.`;
}

// Build spiritual meaning in Cabala dos Caminhos context
function buildSignificadoEspiritual(
  planeta: string,
  signo: string,
  aspecto: string,
  natureza: 'harmonioso' | 'tensional' | 'neutro'
): string {
  const planetSpirit: Record<string, string> = {
    Sol: 'representa a essência do eu, o propósito de vida e a vontade divina interior',
    Lua: 'simboliza a psique, as emoções, o passado e a intuição receptiva',
    Mercúrio: 'encarna a mente, a comunicação, a lógica e a adaptação mental',
    Vênus: 'manifesta o amor, a harmonia, a beleza e a吸引力 magnética',
    Marte: 'expressa a força de vontade, a ação, a coragem e a energia assertiva',
    Júpiter: 'significa a expansão, a sabedoria, a fartura e a visão de conjunto',
    Saturno: 'denota a estrutura, a disciplina, o tempo e as limitações necessárias',
  };

  const aspectSpirit: Record<string, string> = {
    conjunção: 'unificação das forças cósmicas — convergência do caminho do iniciado com a vontade divina',
    sextil: 'oportunidade de evolução — janelas astrais onde o praticante encontra menos resistência',
    quadratura: 'prova de fogo espiritual — fermento de transformação que testa a dedicação ao caminho',
    trino: 'graça divina fluindo naturalmente — alinhamento entre os elementos internos e externos',
    oposição: 'integração dos opostos — reconcileiação de forças aparentemente contraditórias',
  };

  return `No sistema Cabala dos Caminhos, ${planeta.toLowerCase()} em ${signo.toLowerCase()} com ${aspecto} representa: ${planetSpirit[planeta]}. ${aspectSpirit[aspecto]}. A natureza ${natureza === 'harmonioso' ? 'armoniosa' : natureza === 'tensional' ? 'tensional' : 'neutra'} deste aspecto indica o tipo de trabalho interior necessário.`;
}

// Pre-compute and freeze the mappings
const PLANET_ZODIAC_ASPECT_MAPPINGS = buildPlanetZodiacAspectMappings();
Object.freeze(PLANET_ZODIAC_ASPECT_MAPPINGS);

/**
 * Get planet-zodiac-aspect correlation
 * @param planeta - Planet name (e.g., 'Sol', 'Lua', 'Marte')
 * @param signo - Zodiac sign (e.g., 'Leão', 'Touro', 'Escorpião')
 * @param aspecto - Aspect type (e.g., 'conjunção', 'trino', 'oposição')
 * @returns The correlation mapping or null if not found
 */
export function getPlanetZodiacAspect(
  planeta: string,
  signo: string,
  aspecto: string
): PlanetZodiacAspectMapping | null {
  return (
    PLANET_ZODIAC_ASPECT_MAPPINGS.find(
      m => m.planeta === planeta && m.signo === signo && m.aspecto === aspecto
    ) ?? null
  );
}

/**
 * Get all planet-zodiac-aspect mappings for a specific planet
 * @param planeta - Planet name
 * @returns Array of mappings for the planet
 */
export function getPlanetZodiacAspectByPlanet(planeta: string): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.planeta === planeta);
}

/**
 * Get all planet-zodiac-aspect mappings for a specific sign
 * @param signo - Zodiac sign
 * @returns Array of mappings for the sign
 */
export function getPlanetZodiacAspectBySign(signo: string): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.signo === signo);
}

/**
 * Get all planet-zodiac-aspect mappings for a specific aspect
 * @param aspecto - Aspect type
 * @returns Array of mappings for the aspect
 */
export function getPlanetZodiacAspectByAspect(aspecto: string): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.aspecto === aspecto);
}

/**
 * Get all mappings with specific dignity
 * @param dignidade - Dignity level (domicilio, exaltação, queda, exilio, nenhuma)
 * @returns Array of mappings with the specified dignity
 */
export function getByDignidade(dignidade: PlanetZodiacAspectMapping['dignidade']): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.dignidade === dignidade);
}

/**
 * Get mappings by element nature
 * @param elemento - Element (fogo, terra, ar, água)
 * @returns Array of mappings for the element
 */
export function getByElemento(elemento: Elemento): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.elemento === elemento);
}

/**
 * Get mappings by aspect nature
 * @param natureza - Aspect nature (harmonioso, tensional, neutro)
 * @returns Array of mappings for the nature
 */
export function getByAspectNature(natureza: 'harmonioso' | 'tensional' | 'neutro'): PlanetZodiacAspectMapping[] {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.filter(m => m.natureza_aspecto === natureza);
}

/**
 * Get all planet-zodiac dignity information
 * Combines planet-zodiac data with aspect context
 * @param planeta - Planet name
 * @returns Object with domicile, exaltation, fall, exile information
 */
export function getPlanetDignity(): Record<string, { tipo: string; signo: string }> {
  const dignities: Record<string, { tipo: string; signo: string }> = {};

  for (const [planeta, data] of Object.entries(PLANET_ZODIAC_MAPPINGS)) {
    dignities[`${planeta}_domicilio`] = { tipo: 'domicilio', signo: data.domicilio };
    dignities[`${planeta}_exaltação`] = { tipo: 'exaltação', signo: data.exaltação };
    dignities[`${planeta}_queda`] = { tipo: 'queda', signo: data.queda };
    dignities[`${planeta}_exilio`] = { tipo: 'exilio', signo: data.exilio };
  }

  return dignities;
}

/**
 * Get planet dignity for a specific sign
 * @param planeta - Planet name
 * @param signo - Zodiac sign
 * @returns The dignity type or null if none
 */
export function getPlanetInSign(planeta: string, signo: string): PlanetZodiacAspectMapping['dignidade'] | null {
  const mapping = getPlanetZodiac(planeta);
  if (!mapping) return null;

  if (mapping.domicilio === signo) return 'domicilio';
  if (mapping.exaltação === signo) return 'exaltação';
  if (mapping.queda === signo) return 'queda';
  if (mapping.exilio === signo) return 'exilio';

  return null;
}

/**
 * Get all available planets
 * @returns Array of planet names
 */
export function getAllPlanets(): string[] {
  return Object.keys(PLANET_ZODIAC_MAPPINGS);
}

/**
 * Get all zodiac signs
 * @returns Array of sign names
 */
export function getAllSigns(): string[] {
  return Object.keys(SIGN_ELEMENT);
}

/**
 * Get all aspect types
 * @returns Array of aspect names
 */
export function getAllAspects(): string[] {
  return [...ASPECTS];
}

/**
 * Get element for a sign
 * @param signo - Zodiac sign
 * @returns The element or null if not found
 */
export function getSignElement(signo: string): Elemento | null {
  return SIGN_ELEMENT[signo] ?? null;
}

/**
 * Get quality for a sign
 * @param signo - Zodiac sign
 * @returns The quality or null if not found
 */
export function getSignQuality(signo: string): Qualidade | null {
  return SIGN_QUALITY[signo] ?? null;
}

/**
 * Get total number of mappings
 * @returns Total count of planet-sign-aspect combinations
 */
export function getTotalMappings(): number {
  return PLANET_ZODIAC_ASPECT_MAPPINGS.length;
}

/**
 * Check if a combination exists
 * @param planeta - Planet name
 * @param signo - Zodiac sign
 * @param aspecto - Aspect type
 * @returns True if the combination exists
 */
export function hasPlanetZodiacAspect(planeta: string, signo: string, aspecto: string): boolean {
  return getPlanetZodiacAspect(planeta, signo, aspecto) !== null;
}

// Re-export types for convenience
export type { PlanetZodiacMapping, PlanetAspect } from '@/lib/correlation/planet-zodiac';