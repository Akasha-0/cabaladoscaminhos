// Odu Comparison Tool - Cabala Dos Caminhos
// Compare two Ifa/Odu readings for similarities and differences

import { OduInfo, odusData } from '../odus/calculos';

/**
 * Odu reading structure for comparison
 */
export interface OduReading {
  odu: OduInfo;
  timestamp?: string;
  contexto?: string;
}

/**
 * Elemental alignment between two readings
 */
export interface ElementalAlignment {
  matches: string[];
  conflicts: string[];
  neutral: string[];
  score: number; // -1 to 1
}

/**
 * Orixá overlap between readings
 */
export interface OrixaOverlap {
  shared: string[];
  uniqueA: string[];
  uniqueB: string[];
  compatibilityScore: number;
}

/**
 * Quizila compatibility analysis
 */
export interface QuizilaCompatibility {
  sharedConstraints: string[];
  conflictingConstraints: string[];
  totalConflicts: number;
  manageable: boolean;
}

/**
 * Ebó alignment between readings
 */
export interface EboAlignment {
  sharedPractices: string[];
  complementaryPractices: string[];
  incompatiblePractices: string[];
  alignmentScore: number;
}

/**
 * Complete comparison result
 */
// fallow-ignore-next-line unused-type
export interface OduComparison {
  id: string;
  readingA: OduReading;
  readingB: OduReading;
  timestamp: string;
  /** Same Odu number */
  sameOdu: boolean;
  sameOrisha: boolean;
  /** How similar the readings are (0 to 1) */
  similarityScore: number;
  /** Compatibility level */
  compatibilityLevel: 'alta' | 'media' | 'baixa';
  elementalAlignment: ElementalAlignment;
  orixaOverlap: OrixaOverlap;
  quizilaCompatibility: QuizilaCompatibility;
  eboAlignment: EboAlignment;
  /** Detailed comparison notes */
  notes: string[];
}

/**
 * Compare two Odu readings
 */
function compareOdu(
  readingA: OduReading,
  readingB: OduReading
): OduComparison {
  const sameOdu = readingA.odu.numero === readingB.odu.numero;
  const sameOrisha =
    readingA.odu.orixaRegente === readingB.odu.orixaRegente;

  const elementalAlignment = compareElemental(
    readingA.odu.elementos,
    readingB.odu.elementos
  );

  const orixaOverlap = compareOrixas(
    readingA.odu.orixaRegente,
    readingB.odu.orixaRegente
  );

  const quizilaCompatibility = compareQuizilas(
    readingA.odu.quizilas,
    readingB.odu.quizilas
  );

  const eboAlignment = compareEbos(readingA.odu.ebos, readingB.odu.ebos);

  const similarityScore = calculateSimilarityScore({
    sameOdu,
    sameOrisha,
    elementalAlignment,
    orixaOverlap,
    quizilaCompatibility,
    eboAlignment
  });

  const compatibilityLevel = getCompatibilityLevel(similarityScore);

  const notes = generateComparisonNotes({
    readingA,
    readingB,
    sameOdu,
    sameOrisha,
    elementalAlignment,
    orixaOverlap,
    quizilaCompatibility,
    eboAlignment
  });

  return {
    id: generateId(),
    readingA,
    readingB,
    timestamp: new Date().toISOString(),
    sameOdu,
    sameOrisha,
    similarityScore,
    compatibilityLevel,
    elementalAlignment,
    orixaOverlap,
    quizilaCompatibility,
    eboAlignment,
    notes
  };
}

/**
 * Compare elemental compositions
 */
// fallow-ignore-next-line complexity
function compareElemental(
  elemA: string,
  elemB: string
): ElementalAlignment {
  const elemsA = elemA.split(/[,;\/]/).map(e => e.trim()).filter(Boolean);
  const elemsB = elemB.split(/[,;\/]/).map(e => e.trim()).filter(Boolean);

  const matches: string[] = [];
  const conflicts: string[] = [];
  const neutral: string[] = [];

  const elementalOpposites: Record<string, string[]> = {
    'fogo': ['agua', 'terra'],
    'agua': ['fogo'],
    'terra': ['fogo', 'ar'],
    'ar': ['terra'],
    'eku': ['oca'],
    'oca': ['eku']
  };

  for (const elem of elemsA) {
    if (elemsB.includes(elem)) {
      matches.push(elem);
    } else if (elementalOpposites[elem]?.some(o => elemsB.includes(o))) {
      conflicts.push(elem);
    } else {
      neutral.push(elem);
    }
  }

  for (const elem of elemsB) {
    if (!matches.includes(elem) && !conflicts.includes(elem) && !neutral.includes(elem)) {
      if (elementalOpposites[elem]?.some(o => elemsA.includes(o))) {
        conflicts.push(elem);
      } else if (!elemsA.includes(elem)) {
        neutral.push(elem);
      }
    }
  }

  const matchScore = matches.length / Math.max(elemsA.length, elemsB.length, 1);
  const conflictScore = conflicts.length > 0 ? conflicts.length / Math.max(elemsA.length, elemsB.length, 1) : 0;
  const score = matchScore - conflictScore;

  return { matches, conflicts, neutral, score };
}

/**
 * Compare Orixás (simplified for single Orixá each)
// fallow-ignore-next-line complexity
 */
function compareOrixas(
  orixaA: string,
  orixaB: string
): OrixaOverlap {
  const compatibilityMap: Record<string, string[]> = {
    'Oxum': ['Oxumar', 'Iemanjá', 'Oxóssi'],
    'Iemanjá': ['Oxum', 'Oxumar', 'Nanã'],
    'Ogum': ['Oxóssi', 'Xangô', 'Exu'],
    'Oxóssi': ['Ogum', 'Iansã'],
    'Xangô': ['Ogum', 'Iansã', 'Obá'],
    'Oxumar': ['Oxum', 'Iemanjá'],
    'Nanã': ['Iemanjá', 'Obá'],
    'Iansã': ['Xangô', 'Oxóssi', 'Omulu'],
    'Obá': ['Xangô', 'Nanã'],
    'Omulu': ['Iansã', 'Nanã']
  };

  const shared: string[] = orixaA === orixaB ? [orixaA] : [];
  const uniqueA = orixaA === orixaB ? [] : [orixaA];
  const uniqueB = orixaA === orixaB ? [] : [orixaB];

  const compatible = compatibilityMap[orixaA]?.includes(orixaB) ?? false;
  const sameScore = orixaA === orixaB ? 1.0 : compatible ? 0.5 : 0.0;

  return { shared, uniqueA, uniqueB, compatibilityScore: sameScore };
}

/**
 * Compare quizilas (prohibitions/restrictions)
 */
function compareQuizilas(
  quizilasA: string[],
  quizilasB: string[]
): QuizilaCompatibility {
  const sharedConstraints = quizilasA.filter(q =>
    quizilasB.some(qb => q.toLowerCase() === qb.toLowerCase())
  );

  const allQuizilas = [...new Set([...quizilasA, ...quizilasB])];
  const conflictingPatterns = [
    { a: 'frutos do mar', b: 'peixe' },
    { a: 'vinho', b: 'alcool' },
    { a: 'carne bovina', b: 'vaca' }
  ];

  const conflictingConstraints: string[] = [];
  for (const pattern of conflictingPatterns) {
    const hasA = allQuizilas.some(q =>
      q.toLowerCase().includes(pattern.a) || q.toLowerCase().includes(pattern.b)
    );
    if (hasA) {
      const conflicts = allQuizilas.filter(q => {
        const lower = q.toLowerCase();
        return (lower.includes(pattern.a) || lower.includes(pattern.b)) &&
          quizilasA.some(qa => qa.toLowerCase() !== q.toLowerCase() && quizilasB.some(qb => qb.toLowerCase() !== q.toLowerCase()));
      });
      if (conflicts.length > 1) {
        conflictingConstraints.push(...conflicts.slice(0, 2));
      }
    }
  }

  const manageable = conflictingConstraints.length <= 2;

  return {
    sharedConstraints,
    conflictingConstraints: conflictingConstraints.slice(0, 5),
    totalConflicts: conflictingConstraints.length,
    manageable
  };
}

/**
 * Compare ebós (spiritual offerings/practices)
 */
function compareEbos(
  ebosA: string[],
  ebosB: string[]
): EboAlignment {
  const sharedPractices: string[] = [];
  const complementaryPractices: string[] = [];
  const incompatiblePractices: string[] = [];

  for (const eboA of ebosA) {
    const matchB = ebosB.find(eboB =>
      eboA.toLowerCase().includes(eboB.toLowerCase()) ||
      eboB.toLowerCase().includes(eboA.toLowerCase())
    );

    if (matchB) {
      sharedPractices.push(eboA);
    } else {
      const complement = ebosB.find(eboB => {
        const a = eboA.toLowerCase();
        const b = eboB.toLowerCase();
        return (a.includes('limpeza') && b.includes('protecão')) ||
               (a.includes('protecão') && b.includes('limpeza')) ||
               (a.includes('caminho') && b.includes('abertura'));
      });

      if (complement) {
        complementaryPractices.push(eboA);
      } else {
        incompatiblePractices.push(eboA);
      }
    }
  }

  const total = Math.max(ebosA.length, ebosB.length, 1);
  const alignmentScore = (sharedPractices.length + complementaryPractices.length * 0.5 - incompatiblePractices.length) / total;

  return {
    sharedPractices,
    complementaryPractices,
    incompatiblePractices: incompatiblePractices.slice(0, 3),
    alignmentScore
  };
}

/**
 * Internal score calculation inputs
 */
interface SimilarityInputs {
  sameOdu: boolean;
  sameOrisha: boolean;
  elementalAlignment: ElementalAlignment;
  orixaOverlap: OrixaOverlap;
  quizilaCompatibility: QuizilaCompatibility;
  eboAlignment: EboAlignment;
}

/**
 * Calculate overall similarity score
 */
function calculateSimilarityScore(inputs: SimilarityInputs): number {
  const {
    sameOdu,
    sameOrisha,
    elementalAlignment,
    orixaOverlap,
    quizilaCompatibility,
    eboAlignment
  } = inputs;

  const oduScore = sameOdu ? 0.35 : 0;
  const orishaScore = sameOrisha ? 0.15 : orixaOverlap.compatibilityScore * 0.15;
  const elementalScore = Math.max(0, elementalAlignment.score) * 0.15;
  const eboScore = Math.max(0, eboAlignment.alignmentScore) * 0.20;
  const quizilaScore = quizilaCompatibility.manageable ? 0.10 - (quizilaCompatibility.totalConflicts * 0.02) : 0;

  return Math.max(0, Math.min(1, oduScore + orishaScore + elementalScore + eboScore + quizilaScore));
}

/**
 * Determine compatibility level from score
 */
function getCompatibilityLevel(score: number): 'alta' | 'media' | 'baixa' {
  if (score >= 0.7) return 'alta';
  if (score >= 0.4) return 'media';
  return 'baixa';
}

/**
 * Generate human-readable comparison notes
// fallow-ignore-next-line complexity
 */
function generateComparisonNotes(params: {
  readingA: OduReading;
  readingB: OduReading;
  sameOdu: boolean;
  sameOrisha: boolean;
  elementalAlignment: ElementalAlignment;
  orixaOverlap: OrixaOverlap;
  quizilaCompatibility: QuizilaCompatibility;
  eboAlignment: EboAlignment;
}): string[] {
  const notes: string[] = [];
  const { readingA, readingB, sameOdu, sameOrisha, elementalAlignment, orixaOverlap, quizilaCompatibility, eboAlignment } = params;

  if (sameOdu) {
    notes.push(`${readingA.odu.nome} aparece em ambas as leituras - influencia kuat kiwa.`);
  } else {
    notes.push(`${readingA.odu.nome} (${readingA.odu.orixaRegente}) e ${readingB.odu.nome} (${readingB.odu.orixaRegente}) - caminhos distintos mas relacionados.`);
  }

  if (sameOrisha) {
    notes.push(`Ambos sob a regência de ${readingA.odu.orixaRegente} - alinhamento espiritual forte.`);
  } else if (orixaOverlap.compatibilityScore > 0.3) {
    notes.push(`${readingA.odu.orixaRegente} e ${readingB.odu.orixaRegente} são complementares na tradição.`);
  }

  if (elementalAlignment.matches.length > 0) {
    notes.push(`Elementos em comum: ${elementalAlignment.matches.join(', ')}.`);
  }

  if (elementalAlignment.conflicts.length > 0) {
    notes.push(`Tensões elementais: ${elementalAlignment.conflicts.join(', ')} - trabalho espiritual adicional necessário.`);
  }

  if (quizilaCompatibility.sharedConstraints.length > 0) {
    notes.push(`Proibições compatíveis: ${quizilaCompatibility.sharedConstraints.length} restrição(ões) em comum.`);
  }

  if (quizilaCompatibility.totalConflicts > 0) {
    notes.push(`Atenção: ${quizilaCompatibility.totalConflicts} conflito(s) nos preceitos - consultar babalawo.`);
  }

  if (eboAlignment.sharedPractices.length > 0) {
    notes.push(`Ebós compatíveis: ${eboAlignment.sharedPractices.slice(0, 3).join(', ')}.`);
  }

  if (eboAlignment.complementaryPractices.length > 0) {
    notes.push(`Práticas complementares disponíveis para fortalecer ambas as leituras.`);
  }

  if (eboAlignment.incompatiblePractices.length > 0) {
    notes.push(`Evitar: ${eboAlignment.incompatiblePractices.slice(0, 2).join(', ')} para não criar conflitos.`);
  }

  return notes;
}

/**
 * Generate unique comparison ID
 */
function generateId(): string {
  return `odu_cmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Quick comparison of two Odu numbers (returns basic compatibility)
 */
// fallow-ignore-next-line complexity
export function compareOduNumbers(
  numeroA: number,
  numeroB: number
): { sameOdu: boolean; score: number; recommendation: string } {
  if (numeroA < 1 || numeroA > 16 || numeroB < 1 || numeroB > 16) {
    return { sameOdu: false, score: 0, recommendation: 'Odu fora do alcance válido (1-16).' };
  }

  const oduA = odusData[numeroA];
  const oduB = odusData[numeroB];

  if (!oduA || !oduB) {
    return { sameOdu: false, score: 0, recommendation: 'Odu não encontrado.' };
  }

  const comparison = compareOdu(
    { odu: oduA },
    { odu: oduB }
  );

  let recommendation: string;
  switch (comparison.compatibilityLevel) {
    case 'alta':
      recommendation = `${oduA.nome} e ${oduB.nome} têm alta compatibilidade espiritual.`;
      break;
    case 'media':
      recommendation = `${oduA.nome} e ${oduB.nome} precisam de harmonização espiritual.`;
      break;
    default:
      recommendation = `${oduA.nome} e ${oduB.nome} podem ter tensões - buscar orientação especializada.`;
  }

  return {
    sameOdu: numeroA === numeroB,
    score: comparison.similarityScore,
    recommendation
  };
}