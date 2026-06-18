/**
 * Helpers para o zodíaco + Mandala Fase 3 (spec mandala-fase3-zodiac-tantra).
 *
 * Adiciona:
 * - GLYPHS_BY_PLANET: glifos unicode padrão para os 10 planetas
 * - PLANET_COLORS: cores fixas por planeta (Sol/Lua = dourado/prata)
 * - longitudeToAngle: converte longitude absoluta (0-360°) em ângulo SVG
 *   com a convenção: 0° = 9 horas do relógio (esquerda, ascendente).
 *
 * Pré-existente: formatDegreeToZodiac (mantido).
 */

/**
 * Converte um grau absoluto (0-359,99) na notação "Sign °GrauNaSign".
 * Usado tanto em server components quanto em client components.
 */
export function formatDegreeToZodiac(deg: number | string | null | undefined): string {
  if (deg == null) return '';
  const num = typeof deg === 'string' ? parseFloat(deg) : deg;
  if (isNaN(num)) return String(deg);

  const signs = [
    'Áries',
    'Touro',
    'Gêmeos',
    'Câncer',
    'Leão',
    'Virgem',
    'Libra',
    'Escorpião',
    'Sagitário',
    'Capricórnio',
    'Aquário',
    'Peixes',
  ];

  const signIndex = Math.floor(num / 30) % 12;
  const degInSign = Math.floor(num % 30);
  return `${signs[signIndex]} ${degInSign}°`;
}

// Mandala Fase 3: glifos astrológicos unicode padrão para os 10 planetas.
export const GLYPHS_BY_PLANET: Record<string, string> = {
  Sol: '☉',
  Lua: '☽',
  Mercúrio: '☿',
  Vênus: '♀',
  Marte: '♂',
  Júpiter: '♃',
  Saturno: '♄',
  Urano: '♅',
  Netuno: '♆',
  Plutão: '♇',
};

// Mandala Fase 3: cores fixas por planeta.
// Luminares (Sol/Lua) recebem tons quentes; clássicos ficam brancos; modernos em cinza.
export const PLANET_COLORS: Record<string, string> = {
  Sol: '#FFD166', // dourado
  Lua: '#C9D4E0', // prata
  Mercúrio: '#FFFFFF', // branco
  Vênus: '#FFFFFF',
  Marte: '#FF7A7A', // vermelho claro (Marte é vermelho por tradição)
  Júpiter: '#FFFFFF',
  Saturno: '#FFFFFF',
  Urano: '#A8B5C8', // cinza-azulado
  Netuno: '#A8B5C8',
  Plutão: '#A8B5C8',
};

/**
 * Converte longitude absoluta (0-360°) em ângulo SVG, com a convenção:
 * - longitude 0° (ascendente) → SVG 180° (ponto esquerdo, 9 horas do relógio)
 * - longitude 90° → SVG 90° (ponto inferior, 6 horas)
 * - longitude 180° → SVG 0° (ponto direito, 3 horas)
 * - longitude 270° → SVG 270° (ponto superior, 12 horas)
 *
 * Fórmula: svgAngle = (180 - longitude + 360) % 360
 *
 * Usado pelo MandalaChart para posicionar planetas no anel zodiacal.
 */
export function longitudeToSvgAngle(absoluteLongitude: number): number {
  if (!Number.isFinite(absoluteLongitude)) return 0;
  return (180 - absoluteLongitude + 360) % 360;
}
