import type { UserSpiritualData } from '../types';
import type { DetectedPattern } from '../deep-correlation-engine';

// ============================================================
// ODÚ → TAROT ARCANA MAP (used by recurring-number detector)
// ============================================================
// 16 Odús → Tarot Major Arcana — canonical names per constants/odus.ts
// Arcano numbers follow Merindilogun position: Ogbe=0, Ejiokô=1, Etogundá=2, etc.
export const ODU_TAROT_MAP: Record<string, number[]> = {
  'Ogbe': [0],
  'Ejiokô': [1],
  'Etogundá': [2],
  'Irosun': [3],
  'Oxê': [4],
  'Obará': [5],
  'Odi': [6],
  'Ejionile': [7],
  'Ossá': [8],
  'Ofun': [9],
  'Owarin': [10],
  'Ejilaxebô': [11],
  'Oturupon': [12],
  'Oturá': [13],
  'Iká': [14],
  'Ofurufu': [15],
};

// ============================================================
// PATTERN DETECTORS
// ============================================================
// Each detector receives UserSpiritualData and returns DetectedPattern[].
// They are pure functions (no `this`, no shared state) — extracted from
// DeepCorrelationEngine to keep that class focused on orchestration.
// ============================================================

export function detectRecurringNumberPatterns(
  userData: UserSpiritualData
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (userData.numeroPessoal) {
    // Check if personal number matches any arcana or odu
    const matchingArcana = Object.entries(ODU_TAROT_MAP)
      .filter(([_, nums]) => nums.includes(userData.numeroPessoal!))
      .map(([odu]) => odu);

    if (matchingArcana.length > 0) {
      patterns.push({
        patternType: 'recurring_number',
        systems: ['numerology', 'tarot', 'ifa'],
        description: `Seu número pessoal ${userData.numeroPessoal} aparece em múltiplos sistemas: ${matchingArcana.join(', ')}. Este número carrega um significado especial em sua jornada espiritual.`,
        recommendation: `Medite sobre a energia do número ${userData.numeroPessoal} e como ela se manifesta em diferentes aspectos de sua vida.`,
        urgency: 'medium',
      });
    }
  }

  // Check for repeating digits in life path
  if (userData.numeroPessoal && userData.numeroPessoal > 9) {
    const digits = userData.numeroPessoal.toString().split('');
    const hasRepeating = digits.some((d, i) => digits.indexOf(d) !== i);

    if (hasRepeating) {
      patterns.push({
        patternType: 'recurring_number',
        systems: ['numerology'],
        description: `Seu número pessoal contém dígitos repetidos, indicando uma ênfase específica em sua energia vibracional.`,
        recommendation:
          'Trabalhe com a energia dos dígitos repetidos para amplificar seus pontos fortes.',
        urgency: 'low',
      });
    }
  }

  return patterns;
}

export function detectElementalImbalance(
  userData: UserSpiritualData
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Collect elements from different systems
  const elements: string[] = [];

  if (userData.orixaRegente) {
    // Each Orixá has element associations
    const orixaElements: Record<string, string> = {
      'Ogum': 'Fogo',
      'Oxum': 'Água',
      'Iemanjá': 'Água',
      'Oxossi': 'Ar',
      'Obatalá': 'Terra',
      'Omulu': 'Terra',
      'Xangô': 'Fogo',
      'Iansã': 'Ar',
    };
    const elem = orixaElements[userData.orixaRegente];
    if (elem) elements.push(elem);
  }

  if (userData.sign) {
    // Zodiac signs have element associations
    const signElements: Record<string, string> = {
      'Aries': 'Fogo', 'Leo': 'Fogo', 'Sagittarius': 'Fogo',
      'Taurus': 'Terra', 'Virgo': 'Terra', 'Capricorn': 'Terra',
      'Gemini': 'Ar', 'Libra': 'Ar', 'Aquarius': 'Ar',
      'Cancer': 'Água', 'Scorpio': 'Água', 'Pisces': 'Água',
    };
    const elem = signElements[userData.sign];
    if (elem) elements.push(elem);
  }

  // Count element frequencies
  const elementCounts: Record<string, number> = {};
  for (const elem of elements) {
    elementCounts[elem] = (elementCounts[elem] || 0) + 1;
  }

  // Detect imbalance (one element strongly dominant)
  const dominantElement = Object.entries(elementCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (
    dominantElement &&
    dominantElement[1] >= 2 &&
    Object.keys(elementCounts).length >= 2
  ) {
    const missingElements = ['Fogo', 'Terra', 'Água', 'Ar'].filter(
      (e) => !elementCounts[e]
    );

    patterns.push({
      patternType: 'elemental_imbalance',
      systems: ['candomble', 'astrology'],
      description: `Sua energia espiritual está fortemente enfocada no elemento ${dominantElement[0]}, com ${dominantElement[1]} manifestações. Elementos ausentes: ${missingElements.join(', ') || 'Nenhum'}.`,
      recommendation: `Incorporar práticas do elemento ${missingElements[0] || 'equilibrado'} para harmonizar sua energia espiritual total.`,
      urgency: missingElements.length > 1 ? 'high' : 'medium',
    });
  }

  return patterns;
}

export function detectKarmicThemes(
  userData: UserSpiritualData
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const systems: string[] = [];

  // Check for karmic indicators across systems
  if (userData.numeroPessoal === 9 || userData.numeroPessoal === 11) {
    systems.push('numerology');
  }

  if (userData.arcoMaior?.includes(10) || userData.arcoMaior?.includes(21)) {
    systems.push('tarot');
  }

  if (userData.odu === 'Ofun' || userData.odu === 'Meji') {
    systems.push('ifa');
  }

  if (userData.sign === 'Scorpio' || userData.rashi === 'Vrischika') {
    systems.push('astrology');
  }

  if (systems.length >= 2) {
    patterns.push({
      patternType: 'karmic_theme',
      systems,
      description: `Sua jornada espiritual mostra múltiplos indicadores de temas cármicos: ${systems.join(', ')}. Você está em um caminho de resolução de karma e evolução espiritual profunda.`,
      recommendation:
        'Pratique a gratidão e o perdão diariamente. Rituais de ancestrais podem ajudar na limpeza cármica.',
      urgency: 'medium',
    });
  }

  return patterns;
}

export function detectSpiritualBlocks(
  userData: UserSpiritualData
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const blocks: string[] = [];

  // Check for potential blocks in each system
  if (userData.sefirotDominante?.length === 1 && userData.numeroPessoal) {
    // Over-reliance on single sephirah
    blocks.push('kabbalah');
  }

  if (!userData.arcoMaior && userData.numeroPessoal) {
    // Strong numerology but no tarot integration
    blocks.push('tarot');
  }

  if (userData.orixaRegente && !userData.odu) {
    // Orixá, mas sem Odú correspondente
    blocks.push('ifa');
  }

  if (blocks.length >= 2) {
    patterns.push({
      patternType: 'spiritual_block',
      systems: blocks,
      description: `Você apresenta bloqueios espirituais nos sistemas: ${blocks.join(', ')}. Estes gaps estão limitando sua evolução espiritual completa.`,
      recommendation:
        'Estude os sistemas faltantes para integrar completamente sua jornada espiritual. Consulte um Babalawo ou especialista em Tarot.',
      urgency: 'high',
    });
  }

  return patterns;
}
