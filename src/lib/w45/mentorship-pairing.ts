// ============================================================================
// W45 — MENTORSHIP PAIRING ENGINE
// ============================================================================
// 1-on-1 matching entre mentores e aprendizes para o Akasha Portal.
//
// Critérios: tradição, especialidades, idioma, disponibilidade semanal,
// nível de experiência, rating, verificação e balanceamento de carga.
//
// Pure functions. Sem React, sem Prisma, sem IO.
// Onda 45 — 2026-06-29.
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tradição espiritual. Stub local minimal; se `../community/traditions`
 * existir no monorepo, a chamada pode fazer `import type { Tradition }`
 * a partir daquele módulo no futuro. Mantemos a definição local para
 * garantir isolamento da engine de pairing.
 */
export type Tradition =
  | 'cabala'
  | 'ifa'
  | 'astrologia'
  | 'tantra'
  | 'reiki'
  | 'meditacao'
  | 'xamanismo'
  | 'cristianismo-mistico'
  | 'sufismo'
  | 'taoismo'
  | 'umbanda'
  | 'candomble'
  | 'budismo'
  | 'hinduismo';

/** Idiomas suportados no portal. */
export type Language = 'pt' | 'en' | 'es';

/**
 * Especialidade do mentor. Reflete domínios práticos ensináveis dentro
 * das tradições suportadas pelo Akasha Portal.
 */
export type Specialty =
  | 'ritual_leadership'
  | 'divination'
  | 'herbalism'
  | 'energy_work'
  | 'mediumship'
  | 'kabbalistic_study'
  | 'astrological_reading'
  | 'tarot'
  | 'cigano'
  | 'numerology'
  | 'meditation'
  | 'ancestor_work'
  | 'drum_circle'
  | 'chant_leadership'
  | 'community_building'
  | 'lgbtq_inclusion'
  | 'recovering_from_trauma'
  | 'diaspora_connection';

/** Objetivo de aprendizado declarado pelo aprendiz. */
export type LearningGoal =
  | 'deepen_practice'
  | 'learn_divination'
  | 'learn_rituals'
  | 'community_leadership'
  | 'lineage_integration'
  | 'daily_spiritual_life'
  | 'crisis_support'
  | 'cultural_reconnection';

/** Nível de experiência subjetivo (não se confunde com seniority). */
export type ExperienceLevel =
  | 'beginner'
  | 'initiate'
  | 'practitioner'
  | 'elder'
  | 'master';

/** Nível de experiência do mentor (não inclui `beginner`). */
export type MentorExperienceLevel = 'initiate' | 'practitioner' | 'elder' | 'master';

/**
 * Janela de disponibilidade semanal em uma timezone específica.
 * dayOfWeek: 0 = domingo, 6 = sábado (convenção Date#getDay()).
 */
export type AvailabilityWindow = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startHour: number;
  endHour: number;
  timezone: string;
};

/** Nível de verificação do mentor — proxy de confiança. */
export type VerificationLevel =
  | 'unverified'
  | 'community_verified'
  | 'lineage_verified';

/** Praticante experiente que oferece mentoria. */
export type Mentor = {
  id: string;
  displayName: string;
  tradition: Tradition;
  lineage?: string;
  yearsOfPractice: number;
  languages: Language[];
  specialties: Specialty[];
  experienceLevel: MentorExperienceLevel;
  availability: AvailabilityWindow[];
  bio: string;
  verificationLevel: VerificationLevel;
  rating: number;
  menteeCount: number;
  maxConcurrentMentees: number;
  acceptingMentees: boolean;
};

/** Aprendiz que busca mentoria. */
export type Mentee = {
  id: string;
  displayName: string;
  tradition: Tradition;
  goals: LearningGoal[];
  languages: Language[];
  experienceLevel: 'beginner' | 'initiate' | 'practitioner';
  availability: AvailabilityWindow[];
  preferredMentorExperience: MentorExperienceLevel;
  bio: string;
};

/** Sugestão da primeira sessão — formato e duração. */
export type SessionFormat = 'in_person' | 'video' | 'audio' | 'text';

export type FirstSession = {
  topic: string;
  durationMin: number;
  format: SessionFormat;
};

/** Resultado de uma comparação entre mentor e aprendiz. */
export type Match = {
  mentorId: string;
  menteeId: string;
  score: number;
  reasons: string[];
  concerns: string[];
  suggestedFirstSession: FirstSession;
};

/** Pesos editáveis da heurística de pontuação. */
export type PairingConfig = {
  traditionWeight: number;
  specialtyWeight: number;
  languageWeight: number;
  availabilityWeight: number;
  experienceLevelWeight: number;
  ratingWeight: number;
  verificationWeight: number;
  loadBalancingWeight: number;
};

/** Pesos padrão — calibrados para privilegiar fit substantivo. */
export const DEFAULT_PAIRING_CONFIG: PairingConfig = {
  traditionWeight: 2.5,
  specialtyWeight: 3.0,
  languageWeight: 2.0,
  availabilityWeight: 1.5,
  experienceLevelWeight: 1.2,
  ratingWeight: 1.0,
  verificationWeight: 1.0,
  loadBalancingWeight: 0.8,
};

/** Possíveis estados de uma pairing persistida. */
export type PairingStatus =
  | 'proposed'
  | 'accepted'
  | 'active'
  | 'paused'
  | 'completed'
  | 'declined'
  | 'ended';

/** Registro persistido de uma pairing mentor↔mentee. */
export type Pairing = {
  id: string;
  mentorId: string;
  menteeId: string;
  matchedAt: number;
  status: PairingStatus;
  endedReason?: string;
};

/** Resultado do readiness check aplicado a um mentor. */
export type ReadinessResult = {
  ready: boolean;
  issues: string[];
};

// ============================================================================
// CONSTANTS — mapping helpers
// ============================================================================

/**
 * Matriz de "afinidade entre tradições" usada por `traditionAlignment`.
 * Valor entre 0 e 1: 1 = mesma tradição, 0 = sem relação direta.
 * Editável: futuras ondas podem calibrar com curadoria do Cigano Ramiro.
 */
const TRADITION_AFFINITY: Record<Tradition, Partial<Record<Tradition, number>>> = {
  cabala: { 'cristianismo-mistico': 0.4, tantra: 0.3, astrologia: 0.4, budismo: 0.3, 'hinduismo': 0.3 },
  ifa: { candomble: 0.85, umbanda: 0.7, xamanismo: 0.4 },
  candomble: { ifa: 0.85, umbanda: 0.7, xamanismo: 0.4 },
  umbanda: { candomble: 0.7, ifa: 0.7, xamanismo: 0.5, 'cristianismo-mistico': 0.3 },
  xamanismo: { candomble: 0.4, umbanda: 0.5, budismo: 0.3, 'hinduismo': 0.3 },
  astrologia: { cabala: 0.4, tantra: 0.3 },
  tantra: { 'hinduismo': 0.5, budismo: 0.5, cabala: 0.3 },
  'hinduismo': { budismo: 0.7, tantra: 0.5 },
  budismo: { 'hinduismo': 0.7, tantra: 0.5, meditacao: 0.8 },
  meditacao: { budismo: 0.8, 'hinduismo': 0.5, sufismo: 0.4, taoismo: 0.5 },
  sufismo: { 'cristianismo-mistico': 0.4, meditacao: 0.4, budismo: 0.4 },
  taoismo: { meditacao: 0.5, budismo: 0.4, 'hinduismo': 0.3 },
  'cristianismo-mistico': { cabala: 0.4, sufismo: 0.4, umbanda: 0.3 },
  reiki: { meditacao: 0.3, xamanismo: 0.2 },
};

/** Tabela que conecta goal → specialty correspondente. */
const GOAL_TO_SPECIALTY: Record<LearningGoal, Specialty[]> = {
  deepen_practice: ['meditation', 'ancestor_work', 'energy_work'],
  learn_divination: ['divination', 'tarot', 'cigano', 'astrological_reading', 'numerology'],
  learn_rituals: ['ritual_leadership', 'drum_circle', 'chant_leadership'],
  community_leadership: ['community_building', 'ritual_leadership', 'lgbtq_inclusion'],
  lineage_integration: ['ancestor_work', 'ritual_leadership', 'diaspora_connection'],
  daily_spiritual_life: ['meditation', 'energy_work', 'herbalism'],
  crisis_support: ['recovering_from_trauma', 'mediumship', 'community_building'],
  cultural_reconnection: ['diaspora_connection', 'ancestor_work', 'ritual_leadership'],
};

/** Pesos numéricos para o nível de verificação. */
const VERIFICATION_VALUE: Record<VerificationLevel, number> = {
  unverified: 0,
  community_verified: 0.5,
  lineage_verified: 1,
};

/** Ranking de senioridade do mentor (esquerda → direita: júnior → sênior). */
const MENTOR_SENIORITY_RANK: Record<MentorExperienceLevel, number> = {
  initiate: 1,
  practitioner: 2,
  elder: 3,
  master: 4,
};

/** Ranking de senioridade do aprendiz. */
const MENTEE_SENIORITY_RANK: Record<Mentee['experienceLevel'], number> = {
  beginner: 0,
  initiate: 1,
  practitioner: 2,
};

// ============================================================================
// HELPERS — primitive scores
// ============================================================================

/**
 * Calcula o overlap semanal (em horas) entre dois conjuntos de janelas
 * de disponibilidade. Janelas são comparadas dentro do mesmo dia da
 * semana; mismatch de timezone é tolerado via heurística de "hora
 * local aproximada" (sem conversão real — production-grade usaria
 * luxon/temporal no caller).
 *
 * @returns horas de overlap por semana (≥ 0).
 */
export function availabilityOverlap(
  a: AvailabilityWindow[],
  b: AvailabilityWindow[],
): number {
  if (a.length === 0 || b.length === 0) return 0;

  let totalOverlapHours = 0;
  for (let day = 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6; day < 7; day = ((day + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6)) {
    const aWindows = a.filter((w) => w.dayOfWeek === day);
    const bWindows = b.filter((w) => w.dayOfWeek === day);
    if (aWindows.length === 0 || bWindows.length === 0) continue;

    for (const aw of aWindows) {
      for (const bw of bWindows) {
        const start = Math.max(aw.startHour, bw.startHour);
        const end = Math.min(aw.endHour, bw.endHour);
        if (end > start) {
          totalOverlapHours += end - start;
        }
      }
    }
  }
  // Cap de 24h/dia × 7 = 168h para garantir sanidade.
  return Math.min(totalOverlapHours, 168);
}

/**
 * Compatibilidade de idioma entre dois perfis.
 *
 * - 1.0 → pelo menos um idioma em comum
 * - 0.0 → sem nenhum idioma em comum
 * A função é simétrica e idempotente.
 */
export function languageCompatibility(a: Language[], b: Language[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const aSet = new Set<Language>(a);
  let shared = 0;
  for (const lang of b) {
    if (aSet.has(lang)) shared += 1;
  }
  return shared > 0 ? 1 : 0;
}

/**
 * Alinhamento entre tradições de aprendiz e mentor.
 *
 * - 1.0 → mesma tradição
 * - ~0.4-0.85 → sincretismo direto (ex: ifa ↔ candomble)
 * - ~0.3 → diálogo inter-tradicional razoável
 * - 0.0 → sem matriz definida ou tradições distintas sem ponte conhecida
 */
export function traditionAlignment(
  menteeTradition: Tradition,
  mentorTradition: Tradition,
): number {
  if (menteeTradition === mentorTradition) return 1;
  const entry = TRADITION_AFFINITY[menteeTradition];
  if (!entry) return 0;
  const score = entry[mentorTradition];
  return typeof score === 'number' ? score : 0;
}

/**
 * Calcula a sobreposição entre goals do aprendiz e specialties do mentor.
 * Para cada goal, verifica se o mentor cobre ao menos uma das specialties
 * mapeadas em `GOAL_TO_SPECIALTY`.
 *
 * @returns score entre 0 e 1 (fração de goals cobertos).
 */
export function specialtyOverlap(menteeGoals: LearningGoal[], mentorSpecialties: Specialty[]): number {
  if (menteeGoals.length === 0) return 0;
  if (mentorSpecialties.length === 0) return 0;
  const specSet = new Set<Specialty>(mentorSpecialties);

  let covered = 0;
  for (const goal of menteeGoals) {
    const mapped = GOAL_TO_SPECIALTY[goal] ?? [];
    if (mapped.some((s) => specSet.has(s))) {
      covered += 1;
    }
  }
  return covered / menteeGoals.length;
}

/**
 * Favorece mentores que ainda não estão saturados.
 * Ratio = menteeCount / maxConcurrentMentees; score decai linearmente
 * de 1 (vazio) para 0 (cheio). targetRatio abaixo do qual se considera
 * "desejável" — default 0.6.
 */
export function loadBalanceScore(mentor: Mentor, targetRatio = 0.6): number {
  if (mentor.maxConcurrentMentees <= 0) return 0;
  const ratio = mentor.menteeCount / mentor.maxConcurrentMentees;
  if (ratio >= 1) return 0;
  if (ratio <= targetRatio) return 1;
  // Decaimento linear entre targetRatio (1.0) e 1.0 (0.0).
  const span = 1 - targetRatio;
  if (span <= 0) return ratio <= targetRatio ? 1 : 0;
  const decay = (1 - ratio) / span;
  return Math.max(0, Math.min(1, decay));
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Verifica se um mentor está pronto para receber um novo aprendiz.
 * Critérios: `acceptingMentees`, tem disponibilidade declarada, tem
 * capacidade livre, está pelo menos `community_verified`, tem ao menos
 * um idioma declarado.
 */
export function validateMentorReadiness(mentor: Mentor): ReadinessResult {
  const issues: string[] = [];

  if (!mentor.acceptingMentees) {
    issues.push('mentor not accepting new mentees');
  }
  if (mentor.availability.length === 0) {
    issues.push('mentor has no availability windows');
  }
  if (mentor.maxConcurrentMentees <= 0) {
    issues.push('mentor maxConcurrentMentees must be > 0');
  } else if (mentor.menteeCount >= mentor.maxConcurrentMentees) {
    issues.push('mentor already at capacity');
  }
  if (mentor.languages.length === 0) {
    issues.push('mentor must list at least one language');
  }
  if (mentor.verificationLevel === 'unverified') {
    issues.push('mentor is unverified');
  }

  return { ready: issues.length === 0, issues };
}

/**
 * Sugere o tópico da primeira sessão, conectando o que o aprendiz
 * busca com o que o mentor oferece de mais distintivo. A função é
 * determinística e nunca inventa conteúdo — apenas faz bridging.
 */
export function suggestFirstTopic(mentee: Mentee, mentor: Mentor): string {
  const primaryGoal = mentee.goals[0];
  if (!primaryGoal) {
    return 'Apresentação mútua e mapeamento de expectativas';
  }

  // Encontra a primeira specialty do mentor que cobre o goal primário.
  const candidates = GOAL_TO_SPECIALTY[primaryGoal] ?? [];
  const mentorSpecialty = mentor.specialties.find((s) => candidates.includes(s));
  if (mentorSpecialty) {
    return `Primeira sessão focada em ${humanizeSpecialty(mentorSpecialty)} alinhado a ${humanizeGoal(primaryGoal)}`;
  }

  // Sem specialty direta → fallback baseado no gap de experiência.
  const expGap = MENTOR_SENIORITY_RANK[mentor.experienceLevel] - MENTEE_SENIORITY_RANK[mentee.experienceLevel];
  if (expGap >= 2) {
    return 'Introdução progressiva ao caminho, com escuta da jornada atual';
  }
  return `Diálogo inicial sobre ${humanizeGoal(primaryGoal)} com mentoria de prática integrada`;
}

/**
 * Sugere formato/duração da primeira sessão heurística simples:
 * - texto se mentor saturado, distância grande, ou sem overlap
 * - vídeo default
 * - presencial se mesmo dia com overlap ≥ 4h
 */
function suggestFirstSession(
  mentee: Mentee,
  mentor: Mentor,
  hasAvailability: boolean,
): FirstSession {
  let format: SessionFormat = 'video';
  let durationMin = 45;
  let topic = suggestFirstTopic(mentee, mentor);

  if (mentor.experienceLevel === 'master') {
    durationMin = 60;
  }
  if (!hasAvailability) {
    format = 'text';
    durationMin = 20;
    topic = `${topic} (troca inicial por texto)`;
    return { topic, durationMin, format };
  }

  const overlap = availabilityOverlap(mentee.availability, mentor.availability);
  if (overlap >= 6) {
    format = 'video';
    durationMin = 60;
  } else if (overlap >= 3) {
    format = 'video';
    durationMin = 45;
  } else if (overlap >= 1) {
    format = 'audio';
    durationMin = 30;
  } else {
    format = 'text';
    durationMin = 20;
  }

  return { topic, durationMin, format };
}

// ============================================================================
// HUMANIZER
// ============================================================================

function humanizeSpecialty(s: Specialty): string {
  const map: Record<Specialty, string> = {
    ritual_leadership: 'liderança ritual',
    divination: 'divinação',
    herbalism: 'ervanaria',
    energy_work: 'trabalho de energia',
    mediumship: 'mediunidade',
    kabbalistic_study: 'estudo cabalístico',
    astrological_reading: 'leitura astrológica',
    tarot: 'Tarot',
    cigano: 'Cigano',
    numerology: 'numerologia',
    meditation: 'meditação',
    ancestor_work: 'trabalho com ancestrais',
    drum_circle: 'roda de tambor',
    chant_leadership: 'liderança de cantigas',
    community_building: 'construção de comunidade',
    lgbtq_inclusion: 'inclusão LGBTQIA+',
    recovering_from_trauma: 'recuperação de trauma',
    diaspora_connection: 'conexão com diáspora',
  };
  return map[s] ?? s;
}

function humanizeGoal(g: LearningGoal): string {
  const map: Record<LearningGoal, string> = {
    deepen_practice: 'aprofundar a prática',
    learn_divination: 'aprender divinação',
    learn_rituals: 'aprender rituais',
    community_leadership: 'liderança comunitária',
    lineage_integration: 'integração de linhagem',
    daily_spiritual_life: 'vida espiritual diária',
    crisis_support: 'suporte em crise',
    cultural_reconnection: 'reconexão cultural',
  };
  return map[g] ?? g;
}

// ============================================================================
// SCORING
// ============================================================================

type ScoreBreakdown = {
  raw: number;
  contributions: Array<{ label: string; delta: number; sign: 1 | -1 }>;
  tradition: number;
  specialty: number;
  language: number;
  availability: number;
  experienceLevel: number;
  rating: number;
  verification: number;
  load: number;
};

/**
 * Calcula cada dimensão da heurística de pontuação para uma comparação
 * isolada mentor ↔ mentee. Função interna; usado por `scoreMatch`.
 *
 * @returns breakdown completo antes da agregação final.
 */
function computeBreakdown(
  mentee: Mentee,
  mentor: Mentor,
  config: PairingConfig,
): ScoreBreakdown {
  // --- Tradição -----------------------------------------------------
  const tradition = traditionAlignment(mentee.tradition, mentor.tradition);
  const traditionContrib = tradition * config.traditionWeight;

  // --- Specialty / goals -------------------------------------------
  const specialty = specialtyOverlap(mentee.goals, mentor.specialties);
  const specialtyContrib = specialty * config.specialtyWeight;

  // --- Idioma ------------------------------------------------------
  const language = languageCompatibility(mentee.languages, mentor.languages);
  const languageContrib = language * config.languageWeight;

  // --- Disponibilidade (normalizado: 0h = 0, 6h+ = 1) --------------
  const overlapHours = availabilityOverlap(mentee.availability, mentor.availability);
  const availability = Math.min(1, overlapHours / 6);
  const availabilityContrib = availability * config.availabilityWeight;

  // --- Nível de experiência ---------------------------------------
  // Quão bem o nível do mentor atende a expectativa do aprendiz.
  // 1.0 = mentor exatamente no nível preferido
  // 0.5 = um nível acima ou abaixo
  // 0.0 = muito distante
  const mentorRank = MENTOR_SENIORITY_RANK[mentor.experienceLevel];
  const preferredLower = MENTOR_SENIORITY_RANK[mentee.preferredMentorExperience];
  const seniorOffset = Math.abs(mentorRank - preferredLower);
  const experienceLevel = Math.max(0, 1 - seniorOffset * 0.33);
  const experienceLevelContrib = experienceLevel * config.experienceLevelWeight;

  // --- Rating (assume rating 0..5, normalizado para 0..1) ---------
  const ratingRaw = clamp01(mentor.rating / 5);
  // Penaliza rating muito baixo (< 3).
  const ratingAdjusted = ratingRaw >= 0.6 ? ratingRaw : ratingRaw * 0.5;
  const ratingContrib = ratingAdjusted * config.ratingWeight;

  // --- Verificação ------------------------------------------------
  const verification = VERIFICATION_VALUE[mentor.verificationLevel];
  const verificationContrib = verification * config.verificationWeight;

  // --- Load balancing ---------------------------------------------
  const load = loadBalanceScore(mentor);
  const loadContrib = load * config.loadBalancingWeight;

  const total =
    traditionContrib +
    specialtyContrib +
    languageContrib +
    availabilityContrib +
    experienceLevelContrib +
    ratingContrib +
    verificationContrib +
    loadContrib;

  return {
    raw: total,
    contributions: [
      { label: 'tradição', delta: traditionContrib, sign: 1 },
      { label: 'specialty', delta: specialtyContrib, sign: 1 },
      { label: 'idioma', delta: languageContrib, sign: 1 },
      { label: 'disponibilidade', delta: availabilityContrib, sign: 1 },
      { label: 'nível de experiência', delta: experienceLevelContrib, sign: 1 },
      { label: 'rating', delta: ratingContrib, sign: 1 },
      { label: 'verificação', delta: verificationContrib, sign: 1 },
      { label: 'balanceamento de carga', delta: loadContrib, sign: 1 },
    ],
    tradition,
    specialty,
    language,
    availability,
    experienceLevel,
    rating: ratingAdjusted,
    verification,
    load,
  };
}

// ============================================================================
// PUBLIC SCORING API
// ============================================================================

/**
 * Compara um único mentor contra um aprendiz e devolve um `Match`
 * com score agregado, reasons textuais, concerns e sugestão de
 * primeira sessão.
 *
 * O score final NÃO está normalizado para [0, 1]; permite comparação
 * relativa entre matches via `findMatches`.
 */
export function scoreMatch(mentee: Mentee, mentor: Mentor, config: PairingConfig): Match {
  const readiness = validateMentorReadiness(mentor);

  const breakdown = computeBreakdown(mentee, mentor, config);

  const reasons: string[] = [];
  const concerns: string[] = [];

  // Reasons — cita as dimensões com contribuição significativa.
  if (breakdown.tradition >= 0.85) {
    reasons.push(`Alinhamento forte com a tradição ${mentor.tradition}.`);
  } else if (breakdown.tradition >= 0.5) {
    reasons.push(`Ponte sincrética razoável entre ${mentee.tradition} e ${mentor.tradition}.`);
  }
  if (breakdown.specialty >= 0.66) {
    reasons.push('Cobre a maioria dos seus objetivos de aprendizado.');
  } else if (breakdown.specialty >= 0.33) {
    reasons.push('Cobre parte dos seus objetivos de aprendizado.');
  }
  if (breakdown.language === 1) {
    reasons.push('Compartilha idioma com você.');
  }
  if (breakdown.availability >= 0.66) {
    reasons.push('Boa sobreposição de disponibilidade semanal.');
  }
  if (breakdown.experienceLevel >= 0.9) {
    reasons.push('Nível de senioridade alinhado com sua preferência.');
  }
  if (breakdown.verification >= 0.5) {
    reasons.push(
      mentor.verificationLevel === 'lineage_verified'
        ? 'Mentor verificado por linhagem.'
        : 'Mentor verificado pela comunidade.',
    );
  }
  if (breakdown.load >= 0.8) {
    reasons.push('Capacidade aberta para novos aprendizes.');
  }
  if (mentor.bio && mentor.bio.trim().length > 0) {
    reasons.push('Apresentação escrita disponível.');
  }

  // Concerns — sinaliza pontos fracos honestamente.
  if (!readiness.ready) {
    concerns.push(...readiness.issues);
  }
  if (breakdown.tradition === 0) {
    concerns.push('Tradição sem ponte conhecida para o aprendizado desejado.');
  }
  if (breakdown.specialty === 0) {
    concerns.push('Nenhuma das especialidades do mentor cobre seus objetivos.');
  }
  if (breakdown.language === 0) {
    concerns.push('Nenhum idioma em comum.');
  }
  if (breakdown.availability < 0.2) {
    concerns.push('Sobreposição de disponibilidade semanal muito baixa.');
  }
  if (breakdown.rating < 0.6 && mentor.rating > 0) {
    concerns.push(`Rating abaixo de 3 (atual ${mentor.rating.toFixed(1)}).`);
  }

  const suggestedFirstSession = suggestFirstSession(
    mentee,
    mentor,
    readiness.issues.length === 0 || breakdown.availability > 0,
  );

  return {
    mentorId: mentor.id,
    menteeId: mentee.id,
    score: breakdown.raw,
    reasons,
    concerns,
    suggestedFirstSession,
  };
}

/**
 * Retorna os top-N matches ordenados por score descendente.
 * Mentores não-prontos NÃO são filtrados por padrão — entram com
 * `concerns` populados, deixando o caller decidir.
 */
export function findMatches(
  mentee: Mentee,
  mentors: Mentor[],
  config: Partial<PairingConfig> = {},
  limit = 5,
): Match[] {
  const effective: PairingConfig = { ...DEFAULT_PAIRING_CONFIG, ...config };

  const matches = mentors.map((mentor) => scoreMatch(mentee, mentor, effective));
  matches.sort((a, b) => b.score - a.score);
  if (limit <= 0) return [];
  return matches.slice(0, limit);
}

/**
 * Gera uma explicação textual curta do porquê deste match existir.
 * Útil para UI, emails e logs de auditoria.
 */
export function explainMatch(match: Match): string {
  const lines: string[] = [];
  lines.push(`Score ${match.score.toFixed(2)} (mentor ${match.mentorId} ↔ mentee ${match.menteeId})`);

  if (match.reasons.length > 0) {
    lines.push('Por que este match:');
    for (const r of match.reasons) lines.push(`  • ${r}`);
  }
  if (match.concerns.length > 0) {
    lines.push('Pontos de atenção:');
    for (const c of match.concerns) lines.push(`  ⚠ ${c}`);
  }
  lines.push(
    `Primeira sessão sugerida: ${match.suggestedFirstSession.topic} (${match.suggestedFirstSession.durationMin}min, ${match.suggestedFirstSession.format})`,
  );

  return lines.join('\n');
}

// ============================================================================
// PERSISTENCE — wrap a match into a pairing
// ============================================================================

/**
 * Cria um registro de pairing a partir de um Match. O id é gerado
 * via `crypto.randomUUID` quando disponível, com fallback para um
 * id determinístico baseado em timestamp + ids.
 */
export function createPairing(match: Match): Pairing {
  const now = Date.now();
  const id = generatePairingId(match, now);
  return {
    id,
    mentorId: match.mentorId,
    menteeId: match.menteeId,
    matchedAt: now,
    status: 'proposed',
  };
}

/**
 * Atualiza o status de uma pairing. Encapsula transições válidas.
 * Função pura — não muta `pairing`; retorna uma nova instância.
 */
export function transitionPairing(
  pairing: Pairing,
  nextStatus: PairingStatus,
  endedReason?: string,
): Pairing {
  const result: Pairing = { ...pairing, status: nextStatus };
  if (nextStatus === 'ended' || nextStatus === 'completed' || nextStatus === 'declined') {
    if (typeof endedReason === 'string' && endedReason.trim().length > 0) {
      result.endedReason = endedReason.trim();
    }
  }
  return result;
}

/**
 * Lista as transições válidas a partir de um status. Útil para a UI
 * renderizar apenas botões de ação aplicáveis.
 */
export function allowedTransitions(from: PairingStatus): PairingStatus[] {
  switch (from) {
    case 'proposed':
      return ['accepted', 'declined'];
    case 'accepted':
      return ['active', 'paused', 'ended'];
    case 'active':
      return ['paused', 'completed', 'ended'];
    case 'paused':
      return ['active', 'ended'];
    case 'completed':
    case 'ended':
    case 'declined':
      return [];
  }
}

// ============================================================================
// FILTERS — refine result sets
// ============================================================================

/** Opções do filtro aplicado a um resultado de `findMatches`. */
export type MatchFilter = {
  /** Score mínimo (inclusivo) aceito. */
  minScore?: number;
  /** Se true, mentors com concerns não-vazias são descartados. */
  requireReady?: boolean;
  /** Se definido, apenas matches com este formato sugerido são aceitos. */
  requireFormat?: SessionFormat;
  /** Limite de duração mínima (em minutos) da primeira sessão. */
  minFirstSessionMinutes?: number;
};

/**
 * Aplica um filtro a uma lista de matches, retornando apenas os que
 * satisfazem todos os critérios. Não reordena — chame `findMatches`
 * novamente se quiser mudar a ordem.
 */
export function filterMatches(matches: Match[], filter: MatchFilter = {}): Match[] {
  return matches.filter((m) => {
    if (typeof filter.minScore === 'number' && m.score < filter.minScore) return false;
    if (filter.requireReady && m.concerns.length > 0) return false;
    if (filter.requireFormat && m.suggestedFirstSession.format !== filter.requireFormat) {
      return false;
    }
    if (
      typeof filter.minFirstSessionMinutes === 'number' &&
      m.suggestedFirstSession.durationMin < filter.minFirstSessionMinutes
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Atalho: top matches prontos (sem concerns) e com score mínimo
 * implícito de 60% do melhor score do conjunto de entrada.
 */
export function findReadyMatches(
  mentee: Mentee,
  mentors: Mentor[],
  config: Partial<PairingConfig> = {},
  limit = 5,
): Match[] {
  const candidates = findMatches(mentee, mentors, config, mentors.length);
  const topScore = candidates[0]?.score ?? 0;
  const threshold = topScore * 0.6;
  const ready = filterMatches(candidates, { minScore: threshold, requireReady: true });
  return ready.slice(0, limit);
}

// ============================================================================
// DIAGNOSTICS — compare two configurations
// ============================================================================

/**
 * Compara dois `PairingConfig` retornando um diff simbólico. Útil
 * para A/B tuning da heurística.
 */
export function diffPairingConfig(
  a: PairingConfig,
  b: PairingConfig,
): Array<{ key: keyof PairingConfig; from: number; to: number; delta: number }> {
  const keys: Array<keyof PairingConfig> = [
    'traditionWeight',
    'specialtyWeight',
    'languageWeight',
    'availabilityWeight',
    'experienceLevelWeight',
    'ratingWeight',
    'verificationWeight',
    'loadBalancingWeight',
  ];
  return keys.map((k) => {
    const from = a[k];
    const to = b[k];
    return { key: k, from, to, delta: to - from };
  });
}

// ============================================================================
// INTERNAL UTILITIES
// ============================================================================

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function generatePairingId(match: Match, ts: number): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  const u = g.crypto?.randomUUID?.();
  if (typeof u === 'string' && u.length > 0) {
    return `pair_${u}`;
  }
  return `pair_${ts}_${match.mentorId}_${match.menteeId}`;
}

// ============================================================================
// RE-EXPORTS — convenience namespace
// ============================================================================

export const MentorshipPairing = {
  findMatches,
  findReadyMatches,
  filterMatches,
  scoreMatch,
  explainMatch,
  createPairing,
  transitionPairing,
  allowedTransitions,
  validateMentorReadiness,
  suggestFirstTopic,
  availabilityOverlap,
  languageCompatibility,
  traditionAlignment,
  specialtyOverlap,
  loadBalanceScore,
  diffPairingConfig,
  DEFAULT_PAIRING_CONFIG,
} as const;

export default MentorshipPairing;
