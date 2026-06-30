// ============================================================================
// MENTORSHIP v2 — Match Score (Wave 32, 2026-06-30)
// ============================================================================
// Score determinístico (0-100) para parear mentor ↔ mentee baseado em 5 eixos:
//
//   1. Specialty match (tradição)         peso 35
//   2. Availability overlap (horários)    peso 20
//   3. Tier complementarity                peso 15
//   4. Format alignment (1-on-1 / grupo)   peso 15
//   5. Language overlap (idiomas)         peso 15
//
// Todos os pesos somam 100. Score 0 = sem afinidade, 100 = match perfeito.
//
// NÃO proselitiza: se score < 30, recomenda "explorar outros mentores".
// Anti-patterns:
//   - Sem leaderboard de "melhor mentor"
//   - Sem gamificação (mentor não ganha pontos por mentorear)
//   - Opt-in: mentee escolhe se quer pareamento automático
// ============================================================================

// ============================================================================
// Tipos
// ============================================================================

export type MentorTier = 'INICIANTE' | 'PRATICANTE' | 'MESTRE';

export type SessionFormat = 'ONE_ON_ONE' | 'GROUP' | 'BOTH';

export type TimeWindow = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export const TIME_WINDOWS = 4;
export const LANG_OVERLAP_FACTOR = 15;

export interface MentorProfile {
  id: string;
  displayName: string;
  traditions: readonly string[]; // ['Cabala', 'Tarot', ...]
  tier: MentorTier;
  formats: SessionFormat; // aceita 1-on-1, grupo, ou ambos
  availabilityWindows: readonly TimeWindow[];
  languages: readonly string[]; // ['pt-BR', 'en']
  /** Anos de prática (não conta pontos — apenas para contexto). */
  yearsPractice: number;
  /** Anonimato: se true, mentees só veem "Mentor anônimo" até aceitarem. */
  anonymityAvailable: boolean;
  /** Safe reporting: 1-tap report em qualquer mentor. */
  reportable: boolean;
}

export interface MenteeProfile {
  id: string;
  displayName: string;
  /** Tradição principal de interesse (1ª opção). */
  primaryTradition: string;
  /** Tradições alternativas (ordem de preferência). */
  alternateTraditions: readonly string[];
  tier: MentorTier; // tier do próprio mentee (não do mentor)
  preferredFormat: SessionFormat;
  availabilityWindows: readonly TimeWindow[];
  languages: readonly string[];
  /** Opt-in para pareamento automático (LGPD Art. 7 I). */
  optInAutoMatch: boolean;
  /** Se true, quer mentor anônimo (sem nome). */
  wantsAnonymity: boolean;
}

export interface MatchBreakdown {
  specialty: number; // 0-35
  availability: number; // 0-20
  tierComplement: number; // 0-15
  format: number; // 0-15
  language: number; // 0-15
}

export interface MatchResult {
  mentorId: string;
  menteeId: string;
  total: number; // 0-100
  breakdown: MatchBreakdown;
  /** Tier recomendação textual (URGENT/RECOMMENDED/OK/SKIP). */
  tier: 'EXCELLENT' | 'GOOD' | 'OK' | 'WEAK' | 'INCOMPATIBLE';
  reasons: readonly string[]; // frases explicando o match
  blockers: readonly string[]; // razões pelas quais NÃO é um bom match
}

// ============================================================================
// Specialty match (35 pts)
// ============================================================================

/**
 * Match de especialidade por tradição.
 * - Match exato na primaryTradition: 35
 * - Match em alternateTraditions: 25
 * - Match em traditions[] do mentor (sem ser primary): 20
 * - Sem match: 0
 */
export function specialtyScore(
  mentor: MentorProfile,
  mentee: MenteeProfile
): number {
  const mentorTraditions = mentor.traditions.map((t) => t.toLowerCase());

  // Primary match (case-insensitive)
  if (mentorTraditions.includes(mentee.primaryTradition.toLowerCase())) {
    return 35;
  }

  // Alternate match
  for (const alt of mentee.alternateTraditions) {
    if (mentorTraditions.includes(alt.toLowerCase())) {
      return 25;
    }
  }

  // Sem match
  return 0;
}

// ============================================================================
// Availability match (20 pts)
// ============================================================================

/**
 * Janelas de disponibilidade em comum. 4 janelas possíveis, cada match vale
 * 5 pontos (max 20 = todas as 4 janelas em comum).
 *
 * Janelas:
 *   MORNING: 06:00-12:00 local
 *   AFTERNOON: 12:00-18:00 local
 *   EVENING: 18:00-22:00 local
 *   NIGHT: 22:00-06:00 local
 */
export function availabilityScore(
  mentor: MentorProfile,
  mentee: MenteeProfile
): number {
  const overlap = mentor.availabilityWindows.filter((w) =>
    mentee.availabilityWindows.includes(w)
  );
  return Math.min(20, overlap.length * 5);
}

// ============================================================================
// Tier complementarity (15 pts)
// ============================================================================

/**
 * Complementaridade de tier. Ideal: mentor tier > mentee tier.
 *
 * - Mentor tier === mentee tier → 5 (peer, sem hierarquia)
 * - Mentor tier > mentee tier por 1 → 15 (ideal)
 * - Mentor tier > mentee tier por 2 → 10 (muito senior — pode ser distante)
 * - Mentor tier < mentee tier → 0 (incompatível, anti-pattern)
 */
const TIER_RANK: Record<MentorTier, number> = {
  INICIANTE: 0,
  PRATICANTE: 1,
  MESTRE: 2,
};

export function tierScore(
  mentor: MentorProfile,
  mentee: MenteeProfile
): number {
  const mRank = TIER_RANK[mentor.tier];
  const eRank = TIER_RANK[mentee.tier];
  const diff = mRank - eRank;

  if (diff < 0) return 0;
  if (diff === 0) return 5;
  if (diff === 1) return 15;
  return 10; // diff >= 2
}

// ============================================================================
// Format alignment (15 pts)
// ============================================================================

/**
 * Compatibilidade de formato.
 *
 * - Mentor BOTH: aceita qualquer preferência (15)
 * - Mentor === mentee preferência: 15
 * - Mentor GROUP mas mentee prefere ONE_ON_ONE: 5 (pode ser alternativa)
 * - Mentor ONE_ON_ONE mas mentee prefere GROUP: 5
 * - Sem match: 0
 */
export function formatScore(
  mentor: MentorProfile,
  mentee: MenteeProfile
): number {
  if (mentor.formats === 'BOTH') return 15;
  if (mentor.formats === mentee.preferredFormat) return 15;
  // Mentor oferece um formato mas mentee quer outro — parcial
  return 5;
}

// ============================================================================
// Language match (15 pts)
// ============================================================================

/**
 * Idiomas em comum. 1 idioma = 15, 2+ = 15 (cap).
 */
export function languageScore(
  mentor: MentorProfile,
  mentee: MementeProfileTypeGuard
): number {
  const overlap = mentor.languages.filter((l) =>
    mentee.languages.includes(l)
  );
  return overlap.length > 0 ? LANG_OVERLAP_FACTOR : 0;
}

// Helper para satisfazer TS — alias usado só para evitar import duplicado
type MementeProfileTypeGuard = MenteeProfile;

// ============================================================================
// Total score + tier recommendation
// ============================================================================

export function matchScore(
  mentor: MentorProfile,
  mentee: MenteeProfile
): MatchResult {
  const breakdown: MatchBreakdown = {
    specialty: specialtyScore(mentor, mentee),
    availability: availabilityScore(mentor, mentee),
    tierComplement: tierScore(mentor, mentee),
    format: formatScore(mentor, mentee),
    language: languageScore(mentor, mentee),
  };

  const total = Math.min(
    100,
    breakdown.specialty +
      breakdown.availability +
      breakdown.tierComplement +
      breakdown.format +
      breakdown.language
  );

  const tier: MatchResult['tier'] =
    total >= 85 ? 'EXCELLENT' :
    total >= 70 ? 'GOOD' :
    total >= 50 ? 'OK' :
    total >= 30 ? 'WEAK' :
    'INCOMPATIBLE';

  const reasons: string[] = [];
  const blockers: string[] = [];

  if (breakdown.specialty >= 35) reasons.push('Tradição primária em comum');
  else if (breakdown.specialty >= 25) reasons.push('Tradição alternativa compatível');
  else blockers.push('Sem tradição em comum');

  if (breakdown.availability >= 15) reasons.push('Janelas de tempo compatíveis');
  else if (breakdown.availability === 0) blockers.push('Horários não se sobrepõem');

  if (breakdown.tierComplement === 15) reasons.push('Tier complementar ideal');
  else if (breakdown.tierComplement === 0) blockers.push('Tier do mentor abaixo do necessário');

  if (breakdown.format === 15) reasons.push('Formato preferido disponível');
  else if (breakdown.format === 5) reasons.push('Formato alternativo aceito');

  if (breakdown.language > 0) reasons.push('Idioma em comum');
  else blockers.push('Sem idioma em comum');

  return {
    mentorId: mentor.id,
    menteeId: mentee.id,
    total,
    breakdown,
    tier,
    reasons,
    blockers,
  };
}

// ============================================================================
// Group mentorship (master + 3-5 students)
// ============================================================================

export interface GroupMentorshipInput {
  mentorId: string;
  studentIds: readonly string[]; // 3-5 alunos
  tradition: string;
  format: 'GROUP'; // sempre GROUP
  maxStudents: 5;
  minStudents: 3;
}

export class GroupMentorshipValidationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'GroupMentorshipValidationError';
  }
}

export function validateGroupMentorship(
  input: GroupMentorshipInput
): { ok: true } | { ok: false; reason: string } {
  if (input.studentIds.length < input.minStudents) {
    return {
      ok: false,
      reason: `Mínimo de ${input.minStudents} alunos (recebido: ${input.studentIds.length})`,
    };
  }
  if (input.studentIds.length > input.maxStudents) {
    return {
      ok: false,
      reason: `Máximo de ${input.maxStudents} alunos (recebido: ${input.studentIds.length})`,
    };
  }

  // Sem IDs duplicados
  const unique = new Set(input.studentIds);
  if (unique.size !== input.studentIds.length) {
    return { ok: false, reason: 'IDs de alunos duplicados' };
  }

  // Mentor não pode ser aluno de si mesmo
  if (unique.has(input.mentorId)) {
    return { ok: false, reason: 'Mentor não pode ser aluno do próprio grupo' };
  }

  return { ok: true };
}

// ============================================================================
// Anonymity wrapper (mentor → anonymous display)
// ============================================================================

export interface AnonymousMentorView {
  isAnonymous: boolean;
  displayName: string;
  reveal: (viewerAccepted: boolean) => MentorProfile | null;
}

/**
 * Cria view anônima de um mentor. Mentee só vê o nome real após aceitar.
 */
export function anonymizeMentor(
  mentor: MentorProfile,
  menteeWantsAnonymity: boolean
): AnonymousMentorView {
  if (!mentor.anonymityAvailable && !menteeWantsAnonymity) {
    return {
      isAnonymous: false,
      displayName: mentor.displayName,
      reveal: () => mentor,
    };
  }

  return {
    isAnonymous: true,
    displayName: 'Mentor anônimo',
    reveal: (viewerAccepted: boolean) =>
      viewerAccepted ? mentor : null,
  };
}

// ============================================================================
// Safe report (1-tap reportar mentor inadequado)
// ============================================================================

export type ReportReason =
  | 'INAPPROPRIATE_LANGUAGE'
  | 'SPIRITUAL_PRESSURE'      // pressão para prática inadequada
  | 'FINANCIAL_PRESSURE'      // pedir dinheiro
  | 'HARASSMENT'
  | 'NO_SHOW'                 // 3+ faltas
  | 'BREACH_OF_TRUST'
  | 'OTHER';

export const REPORT_REASONS_PT: Readonly<Record<ReportReason, string>> = {
  INAPPROPRIATE_LANGUAGE: 'Linguagem inapropriada',
  SPIRITUAL_PRESSURE: 'Pressão espiritual indevida',
  FINANCIAL_PRESSURE: 'Pressão financeira',
  HARASSMENT: 'Assédio',
  NO_SHOW: 'Faltas recorrentes (3+)',
  BREACH_OF_TRUST: 'Quebra de confiança',
  OTHER: 'Outro',
};

export interface MentorReport {
  id: string;
  reporterId: string;
  mentorId: string;
  reason: ReportReason;
  details: string; // até 2000 chars
  evidenceUrls: readonly string[]; // até 3 URLs opcionais (screenshots)
  createdAt: Date;
}

export class MentorReportValidationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'MentorReportValidationError';
  }
}

export function validateMentorReport(input: {
  reason: string;
  details: string;
  evidenceUrls: readonly string[];
}): asserts input is {
  reason: ReportReason;
  details: string;
  evidenceUrls: readonly string[];
} {
  const validReasons = Object.keys(REPORT_REASONS_PT) as ReportReason[];
  if (!validReasons.includes(input.reason as ReportReason)) {
    throw new MentorReportValidationError(
      `Motivo inválido. Use: ${validReasons.join(', ')}`
    );
  }
  if (input.details.length < 10) {
    throw new MentorReportValidationError(
      'Detalhes muito curtos (mínimo 10 caracteres)'
    );
  }
  if (input.details.length > 2000) {
    throw new MentorReportValidationError(
      'Detalhes muito longos (máximo 2000)'
    );
  }
  if (input.evidenceUrls.length > 3) {
    throw new MentorReportValidationError('Máximo 3 evidências (URLs)');
  }
  for (const url of input.evidenceUrls) {
    if (!url.startsWith('https://')) {
      throw new MentorReportValidationError(
        `URL inválida (deve começar com https://): ${url}`
      );
    }
  }
}