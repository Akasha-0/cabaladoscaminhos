// ============================================================================
// REPUTATION UNIVERSALISTA — Onda 57 (cycle 57, 2026-06-29)
//
// Sistema de reputação alinhado com o ethos universalista da Cabala dos Caminhos:
//
//   1. Reputation é COMPUTADA a partir de contribuições POSITIVAS — nunca
//      punição por ausência. Quem não posta recebe 0, não -X.
//   2. Sacred-engagement tem multiplicador POSITIVO (até 1.5x) — para
//      reconhecer cuidado com conteúdo tradicional. Nunca penaliza ausência.
//   3. 5 tiers: semente → broto → flor → fruto → luz (universalista, não
//      gamificado — não há ranking competitivo, há reconhecimento de presença).
//   4. K-anonimia (k=10) para leaderboards — ninguém aparece se a categoria
//      tem <10 membros. Privacidade por construção.
//   5. Opt-out é honra: usuário que opta-out some completamente do sistema
//      (score não-visível, fora de leaderboards, exportável para si mesmo).
//   6. No-toxicity rule: toxicidade dispara -10 + flag; 3 flags em 30 dias
//      = suspensão temporária (NÃO exclusão — suspensão é reversível).
//   7. LGPD: Art. 7 (legítimo, computado), Art. 9 (toxicidade sensível),
//      Art. 16/18 (export + delete + recompute from public actions).
//
// Módulo puro (sem Prisma, sem DB) — opera em Maps/Arrays para permitir
// teste unitário e composição com o Prisma no edge. Toda persistência é
// responsabilidade do chamador.
//
// Determinismo: timestamps injetados pelo chamador (ou via `now` default),
// não usamos Date.now() em caminhos que afetam seed/hash/id.
// ============================================================================

// ============================================================================
// SECTION 1 — TIPOS
// ============================================================================

/**
 * Tipos de contribuição que afetam reputação.
 * Cada kind tem um `delta` base (em DELTA_BY_KIND) e regras específicas
 * (ex.: sacred-engagement multiplica por tier; toxic content nunca entra).
 */
export type ContributionKind =
  | 'post'
  | 'comment'
  | 'prayer-share'
  | 'sacred-engagement'
  | 'mentor-session'
  | 'workshop-rsvp'
  | 'translation-help'
  | 'community-help'
  | 'tolerance-act';

/**
 * Os 5 níveis universalistas. Cada nível representa PRESENÇA e cuidado,
 * não competição. Não há "perder nível" — níveis só crescem.
 *
 * semente (0-99)        → começando
 * broto  (100-299)      → presença regular
 * flor   (300-699)      → contribuição comunitária
 * fruto  (700-1499)     → contribuição sustentada
 * luz    (1500+)        → presença radiante (não há teto)
 */
export type UniversalistaLevel = 'semente' | 'broto' | 'flor' | 'fruto' | 'luz';

/**
 * Severidade de flag de toxicidade. Crítica dispara moderação imediata.
 */
export type ToxicitySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Tipos de multiplicador sagrado (sempre ≥1.0, ≤1.5).
 */
export type SacredMultiplierKind = 'prayer-bonus' | 'ritual-bonus' | 'mantra-bonus' | 'liturgy-bonus' | 'tradition-share';

/**
 * Resultado da validação — sucesso ou motivo de falha.
 */
export type ValidationResult =
  | { ok: true; reason?: undefined }
  | { ok: false; reason: string };

/**
 * Evento de reputação — entrada atômica no ledger do usuário.
 * Imutável uma vez gravado (correções via novo evento reverso, não edição).
 */
export interface ReputationEvent {
  /** ID único (FNV-1a hash do conteúdo para dedupe opcional) */
  id: string;
  /** Usuário que realizou a contribuição */
  userId: string;
  /** Tipo de contribuição */
  kind: ContributionKind;
  /** Delta base aplicado (antes de multiplicador) */
  delta: number;
  /** Multiplicador sagrado aplicado (1.0 se nenhum) */
  sacredMultiplier: number;
  /** Justificativa textual (auditável) */
  reason: string;
  /** Tradição (se aplicável, ex.: sacred-engagement) */
  tradition: string | null;
  /** Timestamp injetado pelo chamador (ISO 8601) */
  timestamp: string;
  /** Se este evento é reversível (purge LGPD marca como `purged`) */
  purged: boolean;
  /** Flag opcional — se este evento foi originado por auto-mod toxicity */
  fromToxicityFlag: boolean;
}

/**
 * Requisito para badge — função pura avaliável sobre o estado atual.
 */
export interface BadgeRequirement {
  /** Soma mínima de pontos em um kind específico */
  minPointsByKind?: { kind: ContributionKind; min: number };
  /** Total mínimo de pontos */
  minTotalPoints?: number;
  /** Nível mínimo requerido */
  minLevel?: UniversalistaLevel;
  /** Número mínimo de eventos de um kind */
  minEventsByKind?: { kind: ContributionKind; count: number };
  /** Mínimo de tipos de tradição engajados */
  minTraditions?: number;
  /** Mínimo de dias ativos */
  minActiveDays?: number;
}

/**
 * Badge — reconhecimento simbólico, não competitivo.
 * Sacred-tag = true significa que o badge honra prática tradicional.
 */
export interface Badge {
  /** ID único (slug kebab-case) */
  id: string;
  /** Nome amigável */
  name: string;
  /** Descrição do requisito */
  requirement: BadgeRequirement;
  /** Se o badge honra prática sagrada (LGPD: opt-in separate) */
  sacredTag: boolean;
  /** ISO 8601 timestamp de quando foi awarded */
  awardedAt: string;
}

/**
 * Score agregado do usuário — derivado do ledger.
 * Recomputável a qualquer momento via `recomputeScoreFromPublicActions`.
 */
export interface ReputationScore {
  userId: string;
  level: UniversalistaLevel;
  totalPoints: number;
  /** Pontuação por kind (ordenada alfabeticamente no display) */
  breakdownByKind: Record<ContributionKind, number>;
  /** Badges ativas (sem as revogadas) */
  badges: Badge[];
  /** Quantos eventos totais no ledger */
  totalEvents: number;
  /** Última atividade registrada */
  lastActivityAt: string | null;
  /** Se o usuário está atualmente suspenso */
  suspended: boolean;
  /** Quando a suspensão expira (null se não suspenso) */
  suspendedUntil: string | null;
}

/**
 * Entrada do leaderboard — sempre anonimizada (k-anon enforced).
 * NUNCA inclui displayName real — só `displayNameAnonymized`.
 */
export interface LeaderboardEntry {
  rank: number;
  displayNameAnonymized: string;
  level: UniversalistaLevel;
  points: number;
  /** # de badges (sem detalhes — só contagem para não quebrar k-anon) */
  badgeCount: number;
}

/**
 * Flag de toxicidade — armazenada com razão, visível ao próprio usuário
 * (Art. 9 LGPD), NUNCA pública.
 */
export interface ToxicityFlag {
  flagId: string;
  userId: string;
  severity: ToxicitySeverity;
  reason: string;
  /** Conteúdo que disparou (hash, não o conteúdo — para auditoria) */
  contentHash: string;
  action: 'delta-applied' | 'warning' | 'suspension' | 'permanent-ban';
  createdAt: string;
  reviewedBy: string | null;
}

/**
 * Multiplicador sagrado — sempre positivo, sempre capado em 1.5x.
 */
export interface SacredMultiplier {
  kind: SacredMultiplierKind;
  multiplier: number;
  /** Níveis em que se aplica (vazio = todos) */
  appliesToLevels: UniversalistaLevel[];
  /** Tradição (null = qualquer uma) */
  tradition: string | null;
  /** Descrição do multiplicador */
  description: string;
}

/**
 * Registro de opt-out — usuário que pediu para sair do sistema.
 * Honrado incondicionalmente.
 */
export interface OptOutRecord {
  userId: string;
  optedOutAt: string;
  /** Razão (opcional, para analytics agregado anônimo) */
  reason?: string;
  /** Se reverteu opt-out (saiu do opt-out) */
  reverted: boolean;
  revertedAt: string | null;
}

/**
 * Ação pública — usada para recomputar score após LGPD Art. 18 delete.
 * Só contém o que é público por natureza (posts, comments visíveis).
 * NÃO inclui flags de toxicidade (são Art. 9 sensíveis).
 */
export interface PublicActionRecord {
  userId: string;
  kind: ContributionKind;
  delta: number;
  createdAt: string;
  /** Hash do conteúdo (para dedupe) */
  contentHash: string;
}

/**
 * Configuração do sistema — pontos por kind, thresholds, etc.
 * Tudo derivado de UNIVERSALISTA_CONFIG para permitir override em testes.
 */
export interface ReputationConfig {
  /** Delta base por kind (positivo para contribuição) */
  deltaByKind: Record<ContributionKind, number>;
  /** Thresholds para os 5 tiers */
  levelThresholds: Record<UniversalistaLevel, number>;
  /** Multiplicadores sacros disponíveis */
  sacredMultipliers: SacredMultiplier[];
  /** K mínimo para leaderboard (default 10) */
  kAnonMinimum: number;
  /** Janela (dias) para contar flags de toxicidade */
  toxicityWindowDays: number;
  /** Flags necessárias para suspensão */
  toxicitySuspensionThreshold: number;
  /** Dias de suspensão */
  suspensionDays: number;
  /** Multiplicador sagrado máximo (cap) */
  maxSacredMultiplier: number;
  /** Cap negativo de delta (toxicidade não pode passar de -10) */
  minDelta: number;
  /** Cap positivo de delta (anti-abuso) */
  maxDelta: number;
}

/**
 * Estado agregado do usuário — score + ledger + flags + opt-out + badges.
 * É o "registro vivo" no cliente (testes) ou seria no servidor (DB).
 */
export interface UserReputationState {
  score: ReputationScore;
  ledger: ReputationEvent[];
  toxicityFlags: ToxicityFlag[];
  optOut: OptOutRecord | null;
  awardedBadges: Badge[];
}

/**
 * Resultado de award de badge — indica sucesso ou motivo de falha.
 */
export interface AwardBadgeResult {
  awarded: boolean;
  badge: Badge | null;
  reason?: string;
}

// ============================================================================
// SECTION 2 — CONSTANTES
// ============================================================================

/** Níveis canônicos em ordem ascendente. */
export const UNIVERSALISTA_LEVELS: UniversalistaLevel[] = ['semente', 'broto', 'flor', 'fruto', 'luz'];

/** Tradições canônicas — sincronizar com `community/feed.ts` KNOWN_TRADITIONS. */
export const CANONICAL_TRADITIONS = [
  'cabala', 'ifa', 'astrologia', 'tantra', 'reiki', 'meditacao',
  'xamanismo', 'cristianismo-mistico', 'sufismo', 'taoismo', 'umbanda', 'candomble',
] as const;

export type CanonicalTradition = typeof CANONICAL_TRADITIONS[number];

/** Versão da engine — usado em seeds e auditoria. */
export const ENGINE_VERSION = 'w57-reputation-universalista@1.0.0';

/** Delta base por contribution kind (universalista = contribuição positiva). */
export const DELTA_BY_KIND: Record<ContributionKind, number> = {
  'post': 5,
  'comment': 2,
  'prayer-share': 3,
  'sacred-engagement': 4,
  'mentor-session': 12,
  'workshop-rsvp': 3,
  'translation-help': 8,
  'community-help': 10,
  'tolerance-act': 7,
};

/** Thresholds para os 5 tiers (entrada mínima). */
export const LEVEL_THRESHOLDS: Record<UniversalistaLevel, number> = {
  'semente': 0,
  'broto': 100,
  'flor': 300,
  'fruto': 700,
  'luz': 1500,
};

/** Multiplicadores sacros — sempre positivos, capados em 1.5x. */
export const SACRED_MULTIPLIERS: SacredMultiplier[] = [
  { kind: 'prayer-bonus',   multiplier: 1.5, appliesToLevels: ['semente', 'broto'], tradition: null, description: 'Orações compartilhadas nos níveis iniciais recebem bônus de presença.' },
  { kind: 'ritual-bonus',   multiplier: 1.5, appliesToLevels: ['semente', 'broto'], tradition: null, description: 'Rituais compartilhados nos níveis iniciais recebem bônus de presença.' },
  { kind: 'mantra-bonus',   multiplier: 1.2, appliesToLevels: ['flor'], tradition: null, description: 'Mantras no nível flor recebem bônus moderado.' },
  { kind: 'liturgy-bonus',  multiplier: 1.2, appliesToLevels: ['flor'], tradition: null, description: 'Liturgias no nível flor recebem bônus moderado.' },
  { kind: 'tradition-share', multiplier: 1.3, appliesToLevels: ['semente', 'broto', 'flor'], tradition: null, description: 'Compartilhamento de tradição em níveis iniciais a médio.' },
];

/** K mínimo para leaderboard (k-anonimia). */
export const K_ANON_MINIMUM = 10;

/** Janela de dias para contar flags de toxicidade. */
export const TOXICITY_WINDOW_DAYS = 30;

/** Flags em TOXICITY_WINDOW_DAYS para suspensão. */
export const TOXICITY_SUSPENSION_THRESHOLD = 3;

/** Dias de suspensão temporária. */
export const SUSPENSION_DAYS = 14;

/** Cap do multiplicador sagrado (universalismo = não criar pressão). */
export const MAX_SACRED_MULTIPLIER = 1.5;

/** Delta mínimo (toxicidade não pode passar de -10 por evento). */
export const MIN_DELTA = -10;

/** Delta máximo (anti-abuso). */
export const MAX_DELTA = 10;

/** Catálogo de badges — honra presença, não competição. */
export const BADGE_CATALOG: Record<string, { name: string; requirement: BadgeRequirement; sacredTag: boolean }> = {
  'semente-da-presenca': {
    name: 'Semente da Presença',
    requirement: { minTotalPoints: 50, minActiveDays: 7 },
    sacredTag: false,
  },
  'voz-da-comunidade': {
    name: 'Voz da Comunidade',
    requirement: { minEventsByKind: { kind: 'community-help', count: 25 } },
    sacredTag: false,
  },
  'coracao-da-tolerancia': {
    name: 'Coração da Tolerância',
    requirement: { minEventsByKind: { kind: 'tolerance-act', count: 5 } },
    sacredTag: false,
  },
  'mentor-universalista': {
    name: 'Mentor Universalista',
    requirement: { minEventsByKind: { kind: 'mentor-session', count: 10 }, minLevel: 'flor' },
    sacredTag: false,
  },
  'ponte-entre-tradicões': {
    name: 'Ponte entre Tradições',
    requirement: { minTraditions: 4 },
    sacredTag: false,
  },
  'cuidador-da-sabedoria': {
    name: 'Cuidador da Sabedoria',
    requirement: { minEventsByKind: { kind: 'sacred-engagement', count: 20 } },
    sacredTag: true,
  },
  'flor-da-comunidade': {
    name: 'Flor da Comunidade',
    requirement: { minTotalPoints: 300, minLevel: 'flor' },
    sacredTag: false,
  },
  'fruto-do-tempo': {
    name: 'Fruto do Tempo',
    requirement: { minTotalPoints: 700, minLevel: 'fruto', minActiveDays: 90 },
    sacredTag: false,
  },
  'luz-que-ilumina': {
    name: 'Luz que Ilumina',
    requirement: { minTotalPoints: 1500, minLevel: 'luz', minActiveDays: 180 },
    sacredTag: false,
  },
  'voz-da-oracao': {
    name: 'Voz da Oração',
    requirement: { minEventsByKind: { kind: 'prayer-share', count: 15 } },
    sacredTag: true,
  },
};

/** Razões tóxicas canônicas (auto-mod pattern matching). */
export const TOXIC_PATTERNS = [
  'ataque-pessoal',
  'discurso-de-odio',
  'assedio',
  'spam-religioso',
  'desrespeito-tradição',
] as const;

export type ToxicPattern = typeof TOXIC_PATTERNS[number];

/** Config default do sistema. */
export const DEFAULT_CONFIG: ReputationConfig = {
  deltaByKind: DELTA_BY_KIND,
  levelThresholds: LEVEL_THRESHOLDS,
  sacredMultipliers: SACRED_MULTIPLIERS,
  kAnonMinimum: K_ANON_MINIMUM,
  toxicityWindowDays: TOXICITY_WINDOW_DAYS,
  toxicitySuspensionThreshold: TOXICITY_SUSPENSION_THRESHOLD,
  suspensionDays: SUSPENSION_DAYS,
  maxSacredMultiplier: MAX_SACRED_MULTIPLIER,
  minDelta: MIN_DELTA,
  maxDelta: MAX_DELTA,
};

// ============================================================================
// SECTION 3 — VALIDADORES
// ============================================================================

/**
 * Valida uma contribuição: kind válido, delta dentro de [-10, +10], reason não vazio.
 * @example
 *   validateContribution({ kind: 'community-help', delta: 10, reason: 'ajudou newbie' })
 *   // → { ok: true }
 */
export function validateContribution(contribution: {
  kind: ContributionKind;
  delta: number;
  reason: string;
}): ValidationResult {
  const allowedKinds: ContributionKind[] = [
    'post', 'comment', 'prayer-share', 'sacred-engagement',
    'mentor-session', 'workshop-rsvp', 'translation-help',
    'community-help', 'tolerance-act',
  ];
  if (!allowedKinds.includes(contribution.kind)) {
    return { ok: false, reason: `kind inválido: ${contribution.kind}` };
  }
  if (typeof contribution.delta !== 'number' || !Number.isFinite(contribution.delta)) {
    return { ok: false, reason: 'delta deve ser número finito' };
  }
  if (contribution.delta < MIN_DELTA || contribution.delta > MAX_DELTA) {
    return { ok: false, reason: `delta fora do range [${MIN_DELTA}, ${MAX_DELTA}]` };
  }
  if (typeof contribution.reason !== 'string' || contribution.reason.trim().length === 0) {
    return { ok: false, reason: 'reason não pode ser vazio' };
  }
  return { ok: true };
}

/**
 * Valida um delta por kind: confere que está dentro dos limites e é compatível
 * com o kind (kind positivo nunca deve ter delta negativo sem toxicity flag).
 */
export function validateReputationDelta(delta: number, kind: ContributionKind): ValidationResult {
  if (!Number.isFinite(delta)) return { ok: false, reason: 'delta não-finito' };
  if (delta < MIN_DELTA || delta > MAX_DELTA) {
    return { ok: false, reason: `delta ${delta} fora de [${MIN_DELTA}, ${MAX_DELTA}] para kind=${kind}` };
  }
  const baseDelta = DELTA_BY_KIND[kind];
  if (baseDelta > 0 && delta < 0) {
    return { ok: false, reason: `kind=${kind} é positivo (base=${baseDelta}), não aceita delta negativo sem toxicity flag` };
  }
  return { ok: true };
}

/**
 * Valida nível vs pontos — pontos devem satisfazer o threshold do nível.
 * Universalismo: pontos podem exceder o tier atual (rank up), nunca ficam abaixo.
 */
export function validateLevel(level: UniversalistaLevel, points: number): ValidationResult {
  if (!UNIVERSALISTA_LEVELS.includes(level)) {
    return { ok: false, reason: `level inválido: ${level}` };
  }
  const threshold = LEVEL_THRESHOLDS[level];
  if (points < threshold) {
    return { ok: false, reason: `pontos=${points} abaixo do threshold=${threshold} para level=${level}` };
  }
  return { ok: true };
}

/**
 * Valida um badge — checa campos obrigatórios e que o requirement seja avaliável.
 */
export function validateBadge(badge: Badge): ValidationResult {
  if (!badge.id || typeof badge.id !== 'string') return { ok: false, reason: 'badge.id inválido' };
  if (!badge.name || badge.name.trim().length === 0) return { ok: false, reason: 'badge.name vazio' };
  if (!badge.awardedAt) return { ok: false, reason: 'badge.awardedAt obrigatório' };
  const r = badge.requirement;
  if (!r || typeof r !== 'object') return { ok: false, reason: 'badge.requirement obrigatório' };
  const hasAny = r.minPointsByKind || r.minTotalPoints !== undefined || r.minLevel ||
                 r.minEventsByKind || r.minTraditions !== undefined || r.minActiveDays !== undefined;
  if (!hasAny) return { ok: false, reason: 'badge.requirement vazio' };
  return { ok: true };
}

/**
 * Valida um multiplicador sagrado: sempre positivo, capado em 1.5x.
 * Universalismo: nunca < 1.0 (não penaliza ausência).
 */
export function validateSacredMultiplier(multiplier: SacredMultiplier): ValidationResult {
  if (typeof multiplier.multiplier !== 'number' || !Number.isFinite(multiplier.multiplier)) {
    return { ok: false, reason: 'multiplier deve ser número finito' };
  }
  if (multiplier.multiplier < 1.0) {
    return { ok: false, reason: 'multiplier sagrado nunca é < 1.0 (universalismo)' };
  }
  if (multiplier.multiplier > MAX_SACRED_MULTIPLIER) {
    return { ok: false, reason: `multiplier capado em ${MAX_SACRED_MULTIPLIER}` };
  }
  const validLevels: UniversalistaLevel[] = ['semente', 'broto', 'flor', 'fruto', 'luz'];
  for (const lvl of multiplier.appliesToLevels) {
    if (!validLevels.includes(lvl)) return { ok: false, reason: `level inválido: ${lvl}` };
  }
  return { ok: true };
}

/**
 * Valida k-anonimia: o leaderboard deve ter ≥ k usuários únicos por nível
 * para qualquer entrada ser retornada. Senão, retorna vazio.
 */
export function validateKAnonymity(userCount: number, k: number = K_ANON_MINIMUM): ValidationResult {
  if (typeof userCount !== 'number' || userCount < 0) {
    return { ok: false, reason: 'userCount inválido' };
  }
  if (typeof k !== 'number' || k < 1) return { ok: false, reason: 'k inválido' };
  if (userCount < k) {
    return { ok: false, reason: `k-anon falhou: ${userCount} < ${k}` };
  }
  return { ok: true };
}

/**
 * Valida estado de opt-out: se opted-out, o usuário não deve estar em
 * leaderboards, score NÃO é visível publicamente, mas ainda pode exportar.
 */
export function validateOptOut(user: OptOutRecord | null): ValidationResult {
  if (!user) return { ok: true };
  if (user.reverted) return { ok: true };
  return { ok: true }; // opted-out é estado válido
}

/**
 * Valida que o conteúdo NÃO é tóxico — pattern matching contra TOXIC_PATTERNS.
 * Retorna ok=true se conteúdo é seguro, ok=false com severity se tóxico.
 */
export function validateNoToxicity(reason: string): { ok: true } | { ok: false; severity: ToxicitySeverity; pattern: ToxicPattern } {
  const lower = reason.toLowerCase();
  if (lower.includes('ataque') || lower.includes('pessoal')) {
    return { ok: false, severity: 'medium', pattern: 'ataque-pessoal' };
  }
  if (lower.includes('odio') || lower.includes('hate')) {
    return { ok: false, severity: 'high', pattern: 'discurso-de-odio' };
  }
  if (lower.includes('assedio') || lower.includes('harassment')) {
    return { ok: false, severity: 'critical', pattern: 'assedio' };
  }
  if (lower.includes('spam') || lower.includes('propaganda-religiosa')) {
    return { ok: false, severity: 'low', pattern: 'spam-religioso' };
  }
  if (lower.includes('tradição-falsa') || lower.includes('tradio-fake') || lower.includes('desrespeito-tradi')) {
    return { ok: false, severity: 'medium', pattern: 'desrespeito-tradição' };
  }
  return { ok: true };
}

/**
 * Valida nome de display para leaderboard: nunca vazio, nunca > 60 chars,
 * sem PII (sem email, sem telefone).
 */
export function validateDisplayName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') return { ok: false, reason: 'displayName obrigatório' };
  if (name.trim().length === 0) return { ok: false, reason: 'displayName vazio' };
  if (name.length > 60) return { ok: false, reason: 'displayName > 60 chars' };
  if (name.includes('@')) return { ok: false, reason: 'displayName parece email (PII)' };
  if (/\d{8,}/.test(name)) return { ok: false, reason: 'displayName contém sequência numérica longa (telefone?)' };
  return { ok: true };
}

/**
 * Valida que um badge requirement pode ser satisfeito pelo estado.
 */
export function validateBadgeRequirement(
  requirement: BadgeRequirement,
  score: ReputationScore,
  eventCountByKind: Record<ContributionKind, number>,
  traditionsEngaged: number,
  activeDays: number,
): ValidationResult {
  if (requirement.minPointsByKind) {
    const have = score.breakdownByKind[requirement.minPointsByKind.kind] ?? 0;
    if (have < requirement.minPointsByKind.min) {
      return { ok: false, reason: `points-by-kind insuficiente: ${have} < ${requirement.minPointsByKind.min}` };
    }
  }
  if (requirement.minTotalPoints !== undefined && score.totalPoints < requirement.minTotalPoints) {
    return { ok: false, reason: `totalPoints insuficiente: ${score.totalPoints} < ${requirement.minTotalPoints}` };
  }
  if (requirement.minLevel) {
    const have = LEVEL_THRESHOLDS[score.level];
    const need = LEVEL_THRESHOLDS[requirement.minLevel];
    if (have < need) {
      return { ok: false, reason: `level insuficiente: ${score.level} < ${requirement.minLevel}` };
    }
  }
  if (requirement.minEventsByKind) {
    const have = eventCountByKind[requirement.minEventsByKind.kind] ?? 0;
    if (have < requirement.minEventsByKind.count) {
      return { ok: false, reason: `event-count insuficiente: ${have} < ${requirement.minEventsByKind.count}` };
    }
  }
  if (requirement.minTraditions !== undefined && traditionsEngaged < requirement.minTraditions) {
    return { ok: false, reason: `tradições insuficientes: ${traditionsEngaged} < ${requirement.minTraditions}` };
  }
  if (requirement.minActiveDays !== undefined && activeDays < requirement.minActiveDays) {
    return { ok: false, reason: `dias ativos insuficientes: ${activeDays} < ${requirement.minActiveDays}` };
  }
  return { ok: true };
}

/**
 * Valida que uma tradição é canônica (anti-injection / typos).
 */
export function validateTradition(tradition: string | null): ValidationResult {
  if (tradition === null) return { ok: true };
  if (typeof tradition !== 'string') return { ok: false, reason: 'tradition deve ser string ou null' };
  if (!CANONICAL_TRADITIONS.includes(tradition as CanonicalTradition)) {
    return { ok: false, reason: `tradição não-canônica: ${tradition}` };
  }
  return { ok: true };
}

/**
 * Valida timestamp ISO 8601.
 */
export function validateTimestamp(ts: string): ValidationResult {
  if (typeof ts !== 'string') return { ok: false, reason: 'timestamp deve ser string ISO 8601' };
  const parsed = Date.parse(ts);
  if (Number.isNaN(parsed)) return { ok: false, reason: 'timestamp não-parseável' };
  return { ok: true };
}

/**
 * Valida entrada do ledger: campos obrigatórios + ranges.
 */
export function validateLedgerEntry(event: ReputationEvent): ValidationResult {
  if (!event.id || typeof event.id !== 'string') return { ok: false, reason: 'event.id obrigatório' };
  if (!event.userId) return { ok: false, reason: 'event.userId obrigatório' };
  const allowedKinds: ContributionKind[] = [
    'post', 'comment', 'prayer-share', 'sacred-engagement',
    'mentor-session', 'workshop-rsvp', 'translation-help',
    'community-help', 'tolerance-act',
  ];
  if (!allowedKinds.includes(event.kind)) return { ok: false, reason: 'event.kind inválido' };
  if (typeof event.delta !== 'number' || !Number.isFinite(event.delta)) {
    return { ok: false, reason: 'event.delta inválido' };
  }
  if (event.sacredMultiplier < 1.0 || event.sacredMultiplier > MAX_SACRED_MULTIPLIER) {
    return { ok: false, reason: 'event.sacredMultiplier fora do range' };
  }
  if (typeof event.reason !== 'string') return { ok: false, reason: 'event.reason deve ser string' };
  if (typeof event.timestamp !== 'string') return { ok: false, reason: 'event.timestamp deve ser string' };
  if (typeof event.purged !== 'boolean') return { ok: false, reason: 'event.purged deve ser boolean' };
  if (typeof event.fromToxicityFlag !== 'boolean') return { ok: false, reason: 'event.fromToxicityFlag deve ser boolean' };
  return { ok: true };
}

/**
 * Valida entrada do leaderboard: campos obrigatórios + k-anon OK.
 */
export function validateLeaderboardEntry(entry: LeaderboardEntry): ValidationResult {
  if (typeof entry.rank !== 'number' || entry.rank < 1) return { ok: false, reason: 'rank inválido' };
  if (!entry.displayNameAnonymized || typeof entry.displayNameAnonymized !== 'string') {
    return { ok: false, reason: 'displayNameAnonymized obrigatório' };
  }
  if (!UNIVERSALISTA_LEVELS.includes(entry.level)) return { ok: false, reason: 'level inválido' };
  if (typeof entry.points !== 'number' || entry.points < 0) return { ok: false, reason: 'points inválido' };
  return { ok: true };
}

/**
 * Valida flag de toxicidade.
 */
export function validateToxicityFlag(flag: ToxicityFlag): ValidationResult {
  if (!flag.flagId) return { ok: false, reason: 'flagId obrigatório' };
  if (!flag.userId) return { ok: false, reason: 'userId obrigatório' };
  const validSeverity: ToxicitySeverity[] = ['low', 'medium', 'high', 'critical'];
  if (!validSeverity.includes(flag.severity)) return { ok: false, reason: 'severity inválida' };
  if (!flag.reason) return { ok: false, reason: 'reason obrigatório' };
  if (!flag.contentHash) return { ok: false, reason: 'contentHash obrigatório' };
  const validActions = ['delta-applied', 'warning', 'suspension', 'permanent-ban'];
  if (!validActions.includes(flag.action)) return { ok: false, reason: 'action inválida' };
  return { ok: true };
}

/**
 * Valida que um multiplier sagrado aplica a um nível específico.
 */
export function validateSacredEngagement(
  multiplier: SacredMultiplier,
  userLevel: UniversalistaLevel,
): ValidationResult {
  if (multiplier.appliesToLevels.length === 0) return { ok: true };
  if (!multiplier.appliesToLevels.includes(userLevel)) {
    return { ok: false, reason: `multiplier ${multiplier.kind} não aplica a ${userLevel}` };
  }
  return { ok: true };
}

/**
 * Valida bounds de um multiplier (helper).
 */
export function validateMultiplierBounds(multiplier: number): ValidationResult {
  if (!Number.isFinite(multiplier)) return { ok: false, reason: 'multiplier não-finito' };
  if (multiplier < 1.0) return { ok: false, reason: 'multiplier < 1.0 (universalismo)' };
  if (multiplier > MAX_SACRED_MULTIPLIER) return { ok: false, reason: `multiplier > ${MAX_SACRED_MULTIPLIER}` };
  return { ok: true };
}

/**
 * Valida que dois scores vêm do mesmo usuário (para merge).
 */
export function validateSameUser(a: ReputationScore, b: ReputationScore): ValidationResult {
  if (a.userId !== b.userId) return { ok: false, reason: 'userId mismatch' };
  return { ok: true };
}

/**
 * Valida consistência do score: total = soma de breakdownByKind.
 */
export function validateScoreConsistency(score: ReputationScore): ValidationResult {
  const sum = Object.values(score.breakdownByKind).reduce((acc, v) => acc + v, 0);
  if (sum !== score.totalPoints) {
    return { ok: false, reason: `soma breakdown=${sum} ≠ totalPoints=${score.totalPoints}` };
  }
  return { ok: true };
}

/**
 * Valida configuração do sistema.
 */
export function validateConfig(config: ReputationConfig): ValidationResult {
  if (!config.deltaByKind || !config.levelThresholds) return { ok: false, reason: 'config incompleta' };
  if (config.kAnonMinimum < 1) return { ok: false, reason: 'kAnonMinimum < 1' };
  if (config.toxicityWindowDays < 1) return { ok: false, reason: 'toxicityWindowDays < 1' };
  if (config.toxicitySuspensionThreshold < 1) return { ok: false, reason: 'toxicitySuspensionThreshold < 1' };
  if (config.maxSacredMultiplier < 1.0 || config.maxSacredMultiplier > 2.0) {
    return { ok: false, reason: 'maxSacredMultiplier fora do range razoável' };
  }
  return { ok: true };
}

/**
 * Valida estado geral do usuário.
 */
export function validateUserState(state: UserReputationState): ValidationResult {
  const v1 = validateScoreConsistency(state.score);
  if (!v1.ok) return v1;
  for (const e of state.ledger) {
    const v = validateLedgerEntry(e);
    if (!v.ok) return v;
  }
  for (const f of state.toxicityFlags) {
    const v = validateToxicityFlag(f);
    if (!v.ok) return v;
  }
  return { ok: true };
}

// ============================================================================
// SECTION 4 — HASH / UTILITÁRIOS (determinísticos, sem crypto externo)
// ============================================================================

/**
 * FNV-1a 32-bit hash — determinístico, sem dependências.
 * @example
 *   fnv1a32('hello') // → 0x4d2505ca
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/**
 * FNV-1a hex string (8 chars).
 */
export function fnv1a32Hex(input: string): string {
  return fnv1a32(input).toString(16).padStart(8, '0');
}

/**
 * Gera um ID único determinístico para evento: hash(userId|kind|timestamp|reason).
 */
export function generateEventId(userId: string, kind: ContributionKind, ts: string, reason: string): string {
  return fnv1a32Hex(`${userId}|${kind}|${ts}|${reason}`);
}

/**
 * Gera ID para flag de toxicidade: hash(userId|contentHash|ts).
 */
export function generateFlagId(userId: string, contentHash: string, ts: string): string {
  return fnv1a32Hex(`flag|${userId}|${contentHash}|${ts}`);
}

/**
 * Anonimiza displayName para k-anon: usa apenas primeiros 2 chars + hash curto.
 * Reversível apenas para o próprio usuário (LGPD Art. 18 export).
 * @example
 *   anonymizeDisplayName('Maria Silva') // → 'Ma#a3f2'
 */
export function anonymizeDisplayName(name: string): string {
  const v = validateDisplayName(name);
  const safe = v.ok ? name : 'anonymous';
  const prefix = safe.slice(0, 2).toUpperCase();
  const hash = fnv1a32Hex(safe).slice(0, 4);
  return `${prefix}#${hash}`;
}

/**
 * Hash de displayName para k-anon entries (sem prefix visível).
 */
export function hashDisplayName(name: string): string {
  const v = validateDisplayName(name);
  const safe = v.ok ? name : 'anonymous';
  return fnv1a32Hex(`display|${safe}`).slice(0, 12);
}

/**
 * Sanitiza reason para evitar leak de PII (emails, telefones).
 */
export function sanitizeReason(reason: string): string {
  return reason
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    .replace(/\b\d{8,}\b/g, '[phone]')
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[phone]')
    .slice(0, 280);
}

/**
 * Detecta leak de conteúdo sagrado sem opt-in: padrão muito simples,
 * suficiente como defense-in-depth (validação real fica no caller).
 */
export function detectSacredLeak(reason: string): boolean {
  const lower = reason.toLowerCase();
  const sacred = ['oração privada', 'pedido de cura específico', 'nome espiritual pessoal'];
  return sacred.some(s => lower.includes(s));
}

// ============================================================================
// SECTION 5 — CORE: computação de score, badges, leaderboard
// ============================================================================

/**
 * Cria estado inicial vazio para um usuário.
 */
export function createDefaultState(userId: string, now: string = new Date().toISOString()): UserReputationState {
  const breakdownByKind: Record<ContributionKind, number> = {
    'post': 0, 'comment': 0, 'prayer-share': 0, 'sacred-engagement': 0,
    'mentor-session': 0, 'workshop-rsvp': 0, 'translation-help': 0,
    'community-help': 0, 'tolerance-act': 0,
  };
  return {
    score: {
      userId,
      level: 'semente',
      totalPoints: 0,
      breakdownByKind,
      badges: [],
      totalEvents: 0,
      lastActivityAt: null,
      suspended: false,
      suspendedUntil: null,
    },
    ledger: [],
    toxicityFlags: [],
    optOut: null,
    awardedBadges: [],
  };
}

/**
 * Calcula o total de pontos a partir do ledger (excluindo purged e toxicity negative).
 * Eventos purged NÃO contam; toxicity negative conta (precisamos do histórico).
 */
export function totalPoints(ledger: ReputationEvent[]): number {
  let sum = 0;
  for (const e of ledger) {
    if (e.purged) continue;
    sum += Math.round(e.delta * e.sacredMultiplier);
  }
  return sum;
}

/**
 * Conta eventos por kind.
 */
export function countEventsByKind(ledger: ReputationEvent[]): Record<ContributionKind, number> {
  const counts: Record<ContributionKind, number> = {
    'post': 0, 'comment': 0, 'prayer-share': 0, 'sacred-engagement': 0,
    'mentor-session': 0, 'workshop-rsvp': 0, 'translation-help': 0,
    'community-help': 0, 'tolerance-act': 0,
  };
  for (const e of ledger) {
    if (e.purged) continue;
    counts[e.kind]++;
  }
  return counts;
}

/**
 * Pontuação por kind (delta * multiplicador).
 */
export function breakdownByKind(ledger: ReputationEvent[]): Record<ContributionKind, number> {
  const b: Record<ContributionKind, number> = {
    'post': 0, 'comment': 0, 'prayer-share': 0, 'sacred-engagement': 0,
    'mentor-session': 0, 'workshop-rsvp': 0, 'translation-help': 0,
    'community-help': 0, 'tolerance-act': 0,
  };
  for (const e of ledger) {
    if (e.purged) continue;
    b[e.kind] += Math.round(e.delta * e.sacredMultiplier);
  }
  return b;
}

/**
 * Computa o nível a partir do total de pontos.
 * Regra: o nível mais alto cujos threshold ≤ pontos.
 */
export function computeLevel(points: number): UniversalistaLevel {
  if (points >= LEVEL_THRESHOLDS.luz) return 'luz';
  if (points >= LEVEL_THRESHOLDS.fruto) return 'fruto';
  if (points >= LEVEL_THRESHOLDS.flor) return 'flor';
  if (points >= LEVEL_THRESHOLDS.broto) return 'broto';
  return 'semente';
}

/**
 * Próximo tier e threshold.
 */
export function getNextTierThreshold(level: UniversalistaLevel): { next: UniversalistaLevel | null; threshold: number | null } {
  const order: UniversalistaLevel[] = ['semente', 'broto', 'flor', 'fruto', 'luz'];
  const idx = order.indexOf(level);
  if (idx === -1 || idx === order.length - 1) return { next: null, threshold: null };
  const next = order[idx + 1];
  return { next, threshold: LEVEL_THRESHOLDS[next] };
}

/**
 * Progresso percentual para o próximo tier (0-100).
 */
export function getTierProgress(points: number, level: UniversalistaLevel): number {
  const current = LEVEL_THRESHOLDS[level];
  const { threshold: next } = getNextTierThreshold(level);
  if (next === null) return 100;
  const range = next - current;
  if (range <= 0) return 100;
  const into = points - current;
  return Math.max(0, Math.min(100, Math.round((into / range) * 100)));
}

/**
 * Aplica delta ao estado (atualiza score in-place, retorna novo estado).
 * Multiplicador sagrado é aplicado aqui.
 */
export function applyDelta(state: UserReputationState, event: ReputationEvent): UserReputationState {
  if (state.optOut && !state.optOut.reverted) {
    // Opted-out: registra no ledger mas NÃO atualiza score
    state.ledger.push({ ...event, purged: false });
    return state;
  }
  if (state.score.suspended) {
    // Suspenso: registra no ledger mas NÃO atualiza score (penalidade natural)
    state.ledger.push({ ...event, purged: false });
    return state;
  }
  state.ledger.push({ ...event, purged: false });
  const earned = Math.round(event.delta * event.sacredMultiplier);
  state.score.breakdownByKind[event.kind] += earned;
  state.score.totalPoints += earned;
  state.score.totalEvents = state.ledger.filter(e => !e.purged).length;
  state.score.lastActivityAt = event.timestamp;
  state.score.level = computeLevel(state.score.totalPoints);
  return state;
}

/**
 * Registra uma contribuição no ledger do usuário (helper para callers).
 * Cria evento a partir dos parâmetros, valida, e aplica.
 */
export function recordContribution(
  state: UserReputationState,
  args: {
    kind: ContributionKind;
    reason: string;
    sacredMultiplier?: number;
    tradition?: string | null;
    timestamp?: string;
  },
): { state: UserReputationState; event: ReputationEvent; validation: ValidationResult } {
  const ts = args.timestamp ?? new Date().toISOString();
  const delta = DELTA_BY_KIND[args.kind];
  const mult = args.sacredMultiplier ?? 1.0;
  const reason = sanitizeReason(args.reason);
  const trad = args.tradition ?? null;
  const v = validateContribution({ kind: args.kind, delta, reason });
  if (!v.ok) {
    const stubEvent: ReputationEvent = {
      id: generateEventId(state.score.userId, args.kind, ts, reason),
      userId: state.score.userId,
      kind: args.kind,
      delta,
      sacredMultiplier: mult,
      reason,
      tradition: trad,
      timestamp: ts,
      purged: false,
      fromToxicityFlag: false,
    };
    return { state, event: stubEvent, validation: v };
  }
  const event: ReputationEvent = {
    id: generateEventId(state.score.userId, args.kind, ts, reason),
    userId: state.score.userId,
    kind: args.kind,
    delta,
    sacredMultiplier: mult,
    reason,
    tradition: trad,
    timestamp: ts,
    purged: false,
    fromToxicityFlag: false,
  };
  const newState = applyDelta(state, event);
  return { state: newState, event, validation: { ok: true } };
}

/**
 * Aplica bônus de sacred engagement: encontra multiplier aplicável e devolve
 * o multiplicador capado. Retorna 1.0 se nenhum aplicar (universalismo:
 * ausência de sacred engagement NUNCA penaliza).
 */
export function sacredEngagementBonus(
  userLevel: UniversalistaLevel,
  tradition: string | null,
  kind: SacredMultiplierKind,
  now: string = new Date().toISOString(),
): number {
  const candidates = SACRED_MULTIPLIERS.filter(m => m.kind === kind);
  for (const m of candidates) {
    if (m.tradition !== null && m.tradition !== tradition) continue;
    if (m.appliesToLevels.length > 0 && !m.appliesToLevels.includes(userLevel)) continue;
    return Math.min(MAX_SACRED_MULTIPLIER, m.multiplier);
  }
  void now;
  return 1.0;
}

/**
 * Retorna o score do usuário (já agregado). Respeita opt-out: se opted-out,
 * o score retornado tem todos os pontos zerados mas mantém estrutura.
 */
export function getUserReputation(state: UserReputationState, optInOnly: boolean = true): ReputationScore {
  if (state.optOut && !state.optOut.reverted) {
    return {
      ...state.score,
      totalPoints: 0,
      breakdownByKind: Object.fromEntries(
        Object.keys(state.score.breakdownByKind).map(k => [k, 0])
      ) as Record<ContributionKind, number>,
      badges: [],
      suspended: false,
      suspendedUntil: null,
    };
  }
  if (optInOnly && !state.score.totalPoints) {
    return state.score;
  }
  return state.score;
}

/**
 * Verifica se o usuário está suspenso (3+ flags em 30 dias).
 */
export function checkSuspension(state: UserReputationState, now: string = new Date().toISOString()): boolean {
  const windowStart = new Date(Date.parse(now) - TOXICITY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const recentFlags = state.toxicityFlags.filter(f => f.createdAt >= windowStart);
  if (recentFlags.length >= TOXICITY_SUSPENSION_THRESHOLD) {
    if (!state.score.suspended) {
      const until = new Date(Date.parse(now) + SUSPENSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
      state.score.suspended = true;
      state.score.suspendedUntil = until;
    }
    return true;
  }
  return state.score.suspended;
}

/**
 * Limpa suspensão (manual, admin).
 */
export function clearSuspension(state: UserReputationState): UserReputationState {
  state.score.suspended = false;
  state.score.suspendedUntil = null;
  return state;
}

/**
 * Verifica se um usuário está suspenso num instante.
 */
export function isSuspended(state: UserReputationState, now: string = new Date().toISOString()): boolean {
  if (!state.score.suspended) return false;
  if (state.score.suspendedUntil && Date.parse(state.score.suspendedUntil) < Date.parse(now)) {
    state.score.suspended = false;
    state.score.suspendedUntil = null;
    return false;
  }
  return true;
}

/**
 * Flagga conteúdo tóxico: aplica -10 delta, cria flag, checa suspensão.
 * Universalismo: -10 é o MÁXIMO de penalidade (não escala com severity).
 */
export function flagToxicContent(
  state: UserReputationState,
  args: {
    contentHash: string;
    reason: string;
    severity?: ToxicitySeverity;
    now?: string;
  },
): { state: UserReputationState; flag: ToxicityFlag; event: ReputationEvent | null } {
  const ts = args.now ?? new Date().toISOString();
  const flag: ToxicityFlag = {
    flagId: generateFlagId(state.score.userId, args.contentHash, ts),
    userId: state.score.userId,
    severity: args.severity ?? 'medium',
    reason: sanitizeReason(args.reason),
    contentHash: args.contentHash,
    action: 'delta-applied',
    createdAt: ts,
    reviewedBy: null,
  };
  state.toxicityFlags.push(flag);
  let event: ReputationEvent | null = null;
  if (!state.optOut || state.optOut.reverted) {
    event = {
      id: generateEventId(state.score.userId, 'community-help', ts, '[toxicity-penalty]'),
      userId: state.score.userId,
      kind: 'community-help',
      delta: MIN_DELTA,
      sacredMultiplier: 1.0,
      reason: '[toxicity-penalty]',
      tradition: null,
      timestamp: ts,
      purged: false,
      fromToxicityFlag: true,
    };
    state.ledger.push(event);
    state.score.breakdownByKind['community-help'] += MIN_DELTA;
    state.score.totalPoints += MIN_DELTA;
    state.score.level = computeLevel(state.score.totalPoints);
  }
  const suspended = checkSuspension(state, ts);
  if (suspended) flag.action = 'suspension';
  return { state, flag, event };
}

/**
 * Premia um badge ao usuário se o requirement for satisfeito.
 * Idempotente: re-aplicar com mesmo id é no-op.
 */
export function awardBadge(state: UserReputationState, badgeId: string, now: string = new Date().toISOString()): AwardBadgeResult {
  const def = BADGE_CATALOG[badgeId];
  if (!def) return { awarded: false, badge: null, reason: `badge ${badgeId} não existe` };
  if (state.awardedBadges.some(b => b.id === badgeId)) {
    return { awarded: false, badge: null, reason: 'badge já awarded (idempotente)' };
  }
  const eventCounts = countEventsByKind(state.ledger);
  const traditions = new Set(state.ledger.map(e => e.tradition).filter(t => t !== null));
  const days = countActiveDays(state.ledger);
  const v = validateBadgeRequirement(def.requirement, state.score, eventCounts, traditions.size, days);
  if (!v.ok) return { awarded: false, badge: null, reason: v.reason };
  const badge: Badge = {
    id: badgeId,
    name: def.name,
    requirement: def.requirement,
    sacredTag: def.sacredTag,
    awardedAt: now,
  };
  state.awardedBadges.push(badge);
  state.score.badges.push(badge);
  return { awarded: true, badge };
}

/**
 * Progresso para um badge: retorna { satisfied: boolean, missing: string[] }.
 */
export function getBadgeProgress(state: UserReputationState, badgeId: string): { satisfied: boolean; missing: string[] } {
  const def = BADGE_CATALOG[badgeId];
  if (!def) return { satisfied: false, missing: ['badge-not-found'] };
  const eventCounts = countEventsByKind(state.ledger);
  const traditions = new Set(state.ledger.map(e => e.tradition).filter(t => t !== null));
  const days = countActiveDays(state.ledger);
  const missing: string[] = [];
  const r = def.requirement;
  if (r.minPointsByKind) {
    const have = state.score.breakdownByKind[r.minPointsByKind.kind] ?? 0;
    if (have < r.minPointsByKind.min) missing.push(`points-by-kind ${r.minPointsByKind.kind}: ${have}/${r.minPointsByKind.min}`);
  }
  if (r.minTotalPoints !== undefined && state.score.totalPoints < r.minTotalPoints) {
    missing.push(`total: ${state.score.totalPoints}/${r.minTotalPoints}`);
  }
  if (r.minLevel) {
    const have = LEVEL_THRESHOLDS[state.score.level];
    const need = LEVEL_THRESHOLDS[r.minLevel];
    if (have < need) missing.push(`level: ${state.score.level} < ${r.minLevel}`);
  }
  if (r.minEventsByKind) {
    const have = eventCounts[r.minEventsByKind.kind] ?? 0;
    if (have < r.minEventsByKind.count) missing.push(`events ${r.minEventsByKind.kind}: ${have}/${r.minEventsByKind.count}`);
  }
  if (r.minTraditions !== undefined && traditions.size < r.minTraditions) {
    missing.push(`traditions: ${traditions.size}/${r.minTraditions}`);
  }
  if (r.minActiveDays !== undefined && days < r.minActiveDays) {
    missing.push(`active-days: ${days}/${r.minActiveDays}`);
  }
  void eventCounts;
  return { satisfied: missing.length === 0, missing };
}

/**
 * Conta dias únicos ativos no ledger.
 */
export function countActiveDays(ledger: ReputationEvent[]): number {
  const days = new Set<string>();
  for (const e of ledger) {
    if (e.purged) continue;
    days.add(e.timestamp.slice(0, 10));
  }
  return days.size;
}

/**
 * Marca o usuário como opted-out. Score fica invisível mas exportável.
 */
export function optOutReputation(state: UserReputationState, reason?: string, now: string = new Date().toISOString()): UserReputationState {
  state.optOut = {
    userId: state.score.userId,
    optedOutAt: now,
    reason,
    reverted: false,
    revertedAt: null,
  };
  return state;
}

/**
 * Reverte opt-out (usuário pode voltar).
 */
export function optInReputation(state: UserReputationState, now: string = new Date().toISOString()): UserReputationState {
  if (state.optOut) {
    state.optOut.reverted = true;
    state.optOut.revertedAt = now;
  }
  return state;
}

/**
 * LGPD Art. 18 — export do histórico completo do usuário.
 * Retorna JSON-serializável (sem funções, sem refs circulares).
 */
export function exportUserReputation(state: UserReputationState): {
  userId: string;
  exportedAt: string;
  engineVersion: string;
  score: ReputationScore;
  ledger: ReputationEvent[];
  toxicityFlags: ToxicityFlag[];
  awardedBadges: Badge[];
  optOut: OptOutRecord | null;
} {
  return {
    userId: state.score.userId,
    exportedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    score: { ...state.score, breakdownByKind: { ...state.score.breakdownByKind } },
    ledger: state.ledger.map(e => ({ ...e })),
    toxicityFlags: state.toxicityFlags.map(f => ({ ...f })),
    awardedBadges: state.awardedBadges.map(b => ({ ...b })),
    optOut: state.optOut ? { ...state.optOut } : null,
  };
}

/**
 * LGPD Art. 16/18 — purga score, ledger, flags. Mantém aggregate stats anônimos.
 * Retorna uma cópia "anônima" do estado para analytics agregado.
 */
export function purgeUserReputation(state: UserReputationState, now: string = new Date().toISOString()): UserReputationState {
  for (const e of state.ledger) {
    e.purged = true;
    e.reason = '[purged]';
  }
  state.score.totalPoints = 0;
  state.score.breakdownByKind = {
    'post': 0, 'comment': 0, 'prayer-share': 0, 'sacred-engagement': 0,
    'mentor-session': 0, 'workshop-rsvp': 0, 'translation-help': 0,
    'community-help': 0, 'tolerance-act': 0,
  };
  state.score.badges = [];
  state.score.totalEvents = 0;
  state.score.lastActivityAt = now;
  state.score.level = 'semente';
  state.score.suspended = false;
  state.score.suspendedUntil = null;
  state.toxicityFlags = [];
  state.awardedBadges = [];
  return state;
}

/**
 * LGPD Art. 18 follow-up — recomputa score a partir de ações públicas.
 * Se não houver ações públicas, score fica zerado (purged anteriormente).
 */
export function recomputeScoreFromPublicActions(
  state: UserReputationState,
  publicActions: PublicActionRecord[],
): UserReputationState {
  const breakdown: Record<ContributionKind, number> = {
    'post': 0, 'comment': 0, 'prayer-share': 0, 'sacred-engagement': 0,
    'mentor-session': 0, 'workshop-rsvp': 0, 'translation-help': 0,
    'community-help': 0, 'tolerance-act': 0,
  };
  for (const a of publicActions) {
    breakdown[a.kind] = (breakdown[a.kind] ?? 0) + a.delta;
  }
  const total = Object.values(breakdown).reduce((acc, v) => acc + v, 0);
  state.score.breakdownByKind = breakdown;
  state.score.totalPoints = total;
  state.score.level = computeLevel(total);
  state.score.totalEvents = publicActions.length;
  state.score.lastActivityAt = publicActions.length > 0 ? publicActions[publicActions.length - 1].createdAt : null;
  return state;
}

/**
 * Constrói leaderboard para um nível, com k-anon enforced.
 * Retorna [] se <k usuários no nível (privacidade por construção).
 */
export function getLeaderboard(
  states: UserReputationState[],
  level: UniversalistaLevel,
  k: number = K_ANON_MINIMUM,
  limit: number = 50,
): LeaderboardEntry[] {
  const eligible = states.filter(s => {
    if (s.optOut && !s.optOut.reverted) return false;
    if (s.score.level !== level) return false;
    if (s.score.suspended) return false;
    return true;
  });
  if (!validateKAnonymity(eligible.length, k).ok) return [];
  const sorted = [...eligible].sort((a, b) => b.score.totalPoints - a.score.totalPoints);
  const top = sorted.slice(0, limit);
  return top.map((s, idx) => ({
    rank: idx + 1,
    displayNameAnonymized: anonymizeDisplayName(`user-${s.score.userId}`),
    level: s.score.level,
    points: s.score.totalPoints,
    badgeCount: s.awardedBadges.length,
  }));
}

/**
 * Leaderboard totalmente anonimizado — displayName vira só hash.
 */
export function getAnonymizedLeaderboard(states: UserReputationState[], level: UniversalistaLevel, k: number = K_ANON_MINIMUM, limit: number = 50): LeaderboardEntry[] {
  return getLeaderboard(states, level, k, limit).map(e => ({
    ...e,
    displayNameAnonymized: hashDisplayName(e.displayNameAnonymized),
  }));
}

/**
 * Constrói PublicActionRecord do ledger para uso em recompute LGPD.
 */
export function publicActionsFromLedger(ledger: ReputationEvent[]): PublicActionRecord[] {
  return ledger
    .filter(e => !e.purged && !e.fromToxicityFlag)
    .map(e => ({
      userId: e.userId,
      kind: e.kind,
      delta: Math.round(e.delta * e.sacredMultiplier),
      createdAt: e.timestamp,
      contentHash: e.id,
    }));
}

/**
 * Merge de dois estados do mesmo usuário (ex.: import de ledger de outro device).
 * Eventos do ledger são concatenados e deduplicados por id.
 */
export function mergeLedgers(a: UserReputationState, b: UserReputationState): UserReputationState {
  const v = validateSameUser(a.score, b.score);
  if (!v.ok) return a;
  const seen = new Set<string>();
  const merged: ReputationEvent[] = [];
  for (const e of [...a.ledger, ...b.ledger]) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    merged.push({ ...e });
  }
  merged.sort((x, y) => x.timestamp.localeCompare(y.timestamp));
  const out = createDefaultState(a.score.userId);
  out.ledger = merged;
  out.score.breakdownByKind = breakdownByKind(merged);
  out.score.totalPoints = totalPoints(merged);
  out.score.level = computeLevel(out.score.totalPoints);
  out.score.totalEvents = merged.filter(e => !e.purged).length;
  out.score.lastActivityAt = merged.length > 0 ? merged[merged.length - 1].timestamp : null;
  out.score.badges = [...a.score.badges, ...b.score.badges].filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
  out.awardedBadges = out.score.badges;
  out.toxicityFlags = [...a.toxicityFlags, ...b.toxicityFlags].filter((f, i, arr) => arr.findIndex(x => x.flagId === f.flagId) === i);
  return out;
}

/**
 * Recompila o score do estado a partir do ledger (idempotente).
 */
export function recomputeScore(state: UserReputationState): UserReputationState {
  state.score.breakdownByKind = breakdownByKind(state.ledger);
  state.score.totalPoints = totalPoints(state.ledger);
  state.score.level = computeLevel(state.score.totalPoints);
  state.score.totalEvents = state.ledger.filter(e => !e.purged).length;
  state.score.lastActivityAt = state.ledger.length > 0
    ? state.ledger.filter(e => !e.purged).slice(-1)[0]?.timestamp ?? null
    : null;
  return state;
}

/**
 * Retorna multipliers sacros aplicáveis ao nível do usuário.
 */
export function applicableSacredMultipliers(level: UniversalistaLevel): SacredMultiplier[] {
  return SACRED_MULTIPLIERS.filter(m => m.appliesToLevels.length === 0 || m.appliesToLevels.includes(level));
}

/**
 * Sanity check: se o usuário tem 0 sacred engagements e N pontos em outros
 * kinds, NÃO deve ser penalizado. Esta função verifica a regra universalista.
 */
export function verifyNoDenigrationForNoSacred(state: UserReputationState): { ok: boolean; reason?: string } {
  const sacredCount = state.score.breakdownByKind['sacred-engagement'] ?? 0;
  const otherPoints = state.score.totalPoints - sacredCount;
  if (sacredCount === 0 && otherPoints >= 500 && state.score.level !== 'flor') {
    return { ok: false, reason: `denigração: 500+ pontos sem sacred, esperado flor, atual ${state.score.level}` };
  }
  return { ok: true };
}

/**
 * Helper: aplica múltiplos eventos em sequência (batch).
 */
export function batchRecordContributions(
  state: UserReputationState,
  events: Array<{ kind: ContributionKind; reason: string; sacredMultiplier?: number; tradition?: string | null; timestamp?: string }>,
): { state: UserReputationState; results: Array<{ event: ReputationEvent; validation: ValidationResult }> } {
  const results: Array<{ event: ReputationEvent; validation: ValidationResult }> = [];
  for (const ev of events) {
    const r = recordContribution(state, ev);
    state = r.state;
    results.push({ event: r.event, validation: r.validation });
  }
  return { state, results };
}

// ============================================================================
// SECTION 6 — LGPD POLICY (inline documentation, não funções)
// ============================================================================
//
// Art. 7 (legitimidade): reputation é COMPUTADA a partir de contribuições —
// não é coletada como dado pessoal direto. Logo, não exige consentimento
// específico para o score em si. Opt-in é necessário apenas para aparecer
// em leaderboards públicos (k-anon, mas ainda assim público).
//
// Art. 9 (dados sensíveis): toxicity flags são tratados como dado sensível
// (podem revelar visão política/religiosa quando relacionados a discurso).
// Armazenados com razão, visíveis APENAS ao próprio usuário (export Art. 18),
// nunca em leaderboards ou agregados públicos.
//
// Art. 16 (eliminação): usuário pode pedir eliminação. Implementado em
// `purgeUserReputation` — zera score, marca ledger como purged.
//
// Art. 18 (acesso/portabilidade): `exportUserReputation` retorna o histórico
// completo em JSON. `recomputeScoreFromPublicActions` permite reconstruir
// o score a partir de ações públicas (Art. 18 §5º — mínimo necessário para
// manter a funcionalidade legítima da plataforma).
//
// Sacred-text policy: multiplicadores sacros são POSITIVOS (≥ 1.0, ≤ 1.5).
// A regra é "reconhece presença, nunca pune ausência". Um usuário com 0
// sacred engagements e 1000 community-help posts está em flor/luz — não
// é rebaixado por não-engajar com conteúdo tradicional.
//
// Universalismo: nunca denigração por tradição. Tradição é reconhecida
// (sacred-multiplier) mas nunca usada como critério de exclusão.
//
// No-toxicity: 3 flags em 30 dias → suspensão temporária (14 dias), NÃO
// exclusão. Após a suspensão, o usuário pode continuar. Universalismo:
// até toxicidade é caminho de retorno, não de saída.
// ============================================================================

// ============================================================================
// SECTION 7 — SMOKE TEST (20+ casos, runable via tsx)
// ============================================================================

interface SmokeCase {
  name: string;
  run: () => boolean;
}

let smokeResults: Array<{ name: string; passed: boolean; error?: string }> = [];

// ============================================================================
// SECTION 7b — AGGREGATE METRICS (anônimas, sem PII, OK em analytics público)
// ============================================================================

/**
 * Métrica agregada anônima do sistema: contagens por nível e totais.
 * NUNCA inclui dados pessoais. Apenas counts.
 * @example
 *   getAggregateMetrics(states) // → { byLevel: { broto: 11 }, totalUsers: 12 }
 */
export function getAggregateMetrics(states: UserReputationState[]): {
  totalUsers: number;
  activeUsers: number;
  optedOutUsers: number;
  suspendedUsers: number;
  byLevel: Record<UniversalistaLevel, number>;
  totalEvents: number;
  totalFlags: number;
} {
  const byLevel: Record<UniversalistaLevel, number> = { semente: 0, broto: 0, flor: 0, fruto: 0, luz: 0 };
  let active = 0, optedOut = 0, suspended = 0, totalEvents = 0, totalFlags = 0;
  for (const s of states) {
    byLevel[s.score.level]++;
    if (s.optOut && !s.optOut.reverted) optedOut++;
    else active++;
    if (s.score.suspended) suspended++;
    totalEvents += s.ledger.filter(e => !e.purged).length;
    totalFlags += s.toxicityFlags.length;
  }
  return {
    totalUsers: states.length,
    activeUsers: active,
    optedOutUsers: optedOut,
    suspendedUsers: suspended,
    byLevel,
    totalEvents,
    totalFlags,
  };
}

/**
 * Converte o estado para um record compacto para snapshot/serialização.
 */
export function toSnapshot(state: UserReputationState): string {
  return JSON.stringify({
    v: ENGINE_VERSION,
    u: state.score.userId,
    l: state.score.level,
    p: state.score.totalPoints,
    e: state.score.totalEvents,
    b: state.score.badges.length,
    s: state.score.suspended ? 1 : 0,
  });
}

/**
 * Parse um snapshot gerado por `toSnapshot`. Retorna null se inválido.
 */
export function fromSnapshot(snap: string): { userId: string; level: UniversalistaLevel; totalPoints: number } | null {
  try {
    const parsed = JSON.parse(snap) as { u?: unknown; l?: unknown; p?: unknown };
    if (typeof parsed.u !== 'string' || typeof parsed.l !== 'string' || typeof parsed.p !== 'number') return null;
    if (!UNIVERSALISTA_LEVELS.includes(parsed.l as UniversalistaLevel)) return null;
    return {
      userId: parsed.u,
      level: parsed.l as UniversalistaLevel,
      totalPoints: parsed.p,
    };
  } catch {
    return null;
  }
}

/**
 * Determina se dois usuários estão no mesmo "círculo de presença"
 * (mesmo nível, mesma ordem de grandeza de pontos). Usado para pareamento
 * em grupos de mentoria e círculos de estudo.
 */
export function samePresenceCircle(a: ReputationScore, b: ReputationScore): boolean {
  if (a.level !== b.level) return false;
  const order = Math.floor(Math.log10(Math.max(1, a.totalPoints)));
  const orderB = Math.floor(Math.log10(Math.max(1, b.totalPoints)));
  return order === orderB;
}

/**
 * Score card compacto para exibição no perfil: nível, pontos, próximo threshold, top-3 kinds.
 */
export function scoreCard(state: UserReputationState): {
  level: UniversalistaLevel;
  points: number;
  nextTier: UniversalistaLevel | null;
  pointsToNext: number | null;
  progressPct: number;
  topKinds: Array<{ kind: ContributionKind; points: number }>;
  badgeCount: number;
} {
  const breakdown = state.score.breakdownByKind;
  const top = (Object.keys(breakdown) as ContributionKind[])
    .map(k => ({ kind: k, points: breakdown[k] }))
    .filter(x => x.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
  const { next, threshold } = getNextTierThreshold(state.score.level);
  const pointsToNext = threshold !== null ? Math.max(0, threshold - state.score.totalPoints) : null;
  return {
    level: state.score.level,
    points: state.score.totalPoints,
    nextTier: next,
    pointsToNext,
    progressPct: getTierProgress(state.score.totalPoints, state.score.level),
    topKinds: top,
    badgeCount: state.score.badges.length,
  };
}

/**
 * Retorna o conjunto de multipliers sacros aplicáveis a um nível E tradição.
 */
export function multipliersForLevelAndTradition(
  level: UniversalistaLevel,
  tradition: string | null,
): SacredMultiplier[] {
  return SACRED_MULTIPLIERS.filter(m => {
    if (m.appliesToLevels.length > 0 && !m.appliesToLevels.includes(level)) return false;
    if (m.tradition !== null && m.tradition !== tradition) return false;
    return true;
  });
}

/**
 * Sanity-check universalista: garante que o score do usuário respeita
 * a regra "0 sacred engagement + N community help não é penalizado".
 */
export function isUniversalistaCompliant(state: UserReputationState): boolean {
  return verifyNoDenigrationForNoSacred(state).ok;
}

/**
 * Roda todos os smoke tests. Retorna { passed, total, results }.
 */
export function runSmokeTests(): { passed: number; total: number; results: typeof smokeResults } {
  smokeResults = [];
  const cases: SmokeCase[] = [
    {
      name: 'smoke_01_levels_ordered',
      run: () => {
        const order = UNIVERSALISTA_LEVELS;
        return order[0] === 'semente' && order[4] === 'luz';
      },
    },
    {
      name: 'smoke_02_compute_level_flor_at_300',
      run: () => computeLevel(300) === 'flor',
    },
    {
      name: 'smoke_03_compute_level_luz_at_1500',
      run: () => computeLevel(1500) === 'luz',
    },
    {
      name: 'smoke_04_compute_level_semente_at_0',
      run: () => computeLevel(0) === 'semente',
    },
    {
      name: 'smoke_05_100_community_help_equals_flor',
      run: () => {
        const state = createDefaultState('user1');
        for (let i = 0; i < 100; i++) {
          const r = recordContribution(state, { kind: 'community-help', reason: `ajuda ${i}`, timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          state.score = r.state.score;
        }
        // 100 community-help × delta 10 = 1000 points → fruto (≥700)
        return state.score.level === 'fruto' && state.score.totalPoints === 1000;
      },
    },
    {
      name: 'smoke_06_sacred_engagement_1_5x_boost',
      run: () => {
        const state = createDefaultState('user2');
        const mult = sacredEngagementBonus('broto', null, 'prayer-bonus');
        recordContribution(state, { kind: 'prayer-share', reason: 'oração', sacredMultiplier: mult, timestamp: '2026-02-01T12:00:00Z' });
        // base delta = 3 (prayer-share), mult = 1.5 → 4.5 → 5 (arredondado)
        return state.score.totalPoints === 5 && state.score.breakdownByKind['prayer-share'] === 5;
      },
    },
    {
      name: 'smoke_07_three_toxicity_flags_30d_suspends',
      run: () => {
        const state = createDefaultState('user3');
        for (let i = 0; i < 3; i++) {
          flagToxicContent(state, {
            contentHash: `h${i}`,
            reason: 'spam-religioso',
            severity: 'low',
            now: `2026-03-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
          });
        }
        return state.score.suspended === true && state.score.suspendedUntil !== null;
      },
    },
    {
      name: 'smoke_08_opt_out_user_not_in_leaderboard',
      run: () => {
        // 12 broto users (k-anon passes), one of them (userA) opts out.
        // Opted-out user must NOT appear in leaderboard; remaining 11 do.
        const states: UserReputationState[] = [];
        for (let i = 0; i < 12; i++) {
          const s = createDefaultState(`user${i}`);
          for (let j = 0; j < 10; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        optOutReputation(states[0], 'privacidade');
        const lb = getLeaderboard(states, 'broto');
        // states[0] is opted-out → excluded → 11 entries, none start with US#0
        return lb.length === 11 && lb.every(e => !e.displayNameAnonymized.startsWith('US#0'));
      },
    },
    {
      name: 'smoke_09_k_anon_empty_with_lt_k_users',
      run: () => {
        const states: UserReputationState[] = [];
        for (let i = 0; i < 5; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 30; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        const lb = getLeaderboard(states, 'semente', 10);
        return lb.length === 0;
      },
    },
    {
      name: 'smoke_10_export_returns_full_ledger',
      run: () => {
        const state = createDefaultState('userX');
        for (let i = 0; i < 10; i++) recordContribution(state, { kind: 'community-help', reason: `r${i}`, timestamp: `2026-04-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const exp = exportUserReputation(state);
        return exp.ledger.length === 10 && exp.userId === 'userX' && exp.engineVersion === ENGINE_VERSION;
      },
    },
    {
      name: 'smoke_11_purge_clears_ledger',
      run: () => {
        const state = createDefaultState('userY');
        for (let i = 0; i < 20; i++) recordContribution(state, { kind: 'post', reason: `p${i}`, timestamp: `2026-05-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        purgeUserReputation(state, '2026-05-31T12:00:00Z');
        return state.score.totalPoints === 0 && state.score.level === 'semente' && state.ledger.every(e => e.purged);
      },
    },
    {
      name: 'smoke_12_rescore_from_public_actions_consistent',
      run: () => {
        const state = createDefaultState('userZ');
        const publicActions: PublicActionRecord[] = [];
        for (let i = 0; i < 50; i++) {
          publicActions.push({ userId: 'userZ', kind: 'community-help', delta: 10, createdAt: `2026-06-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`, contentHash: `h${i}` });
        }
        recomputeScoreFromPublicActions(state, publicActions);
        return state.score.totalPoints === 500 && state.score.level === 'flor';
      },
    },
    {
      name: 'smoke_13_no_denigration_for_zero_sacred',
      run: () => {
        const state = createDefaultState('userW');
        for (let i = 0; i < 60; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const v = verifyNoDenigrationForNoSacred(state);
        return v.ok && state.score.level === 'flor' && state.score.breakdownByKind['sacred-engagement'] === 0;
      },
    },
    {
      name: 'smoke_14_sacred_multiplier_capped_at_1_5x',
      run: () => {
        const m: SacredMultiplier = { kind: 'prayer-bonus', multiplier: 3.0, appliesToLevels: ['semente'], tradition: null, description: 'bug' };
        const v = validateSacredMultiplier(m);
        return !v.ok && v.reason.includes('1.5');
      },
    },
    {
      name: 'smoke_15_badge_awarded_on_requirement_met',
      run: () => {
        const state = createDefaultState('userB');
        for (let i = 0; i < 30; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const r = awardBadge(state, 'voz-da-comunidade', '2026-01-31T12:00:00Z');
        return r.awarded === true && state.awardedBadges.some(b => b.id === 'voz-da-comunidade');
      },
    },
    {
      name: 'smoke_16_badge_not_awarded_when_requirement_fails',
      run: () => {
        const state = createDefaultState('userC');
        const r = awardBadge(state, 'voz-da-comunidade', '2026-01-31T12:00:00Z');
        return r.awarded === false && r.reason !== undefined;
      },
    },
    {
      name: 'smoke_17_k_anon_with_enough_users_passes',
      run: () => {
        const states: UserReputationState[] = [];
        for (let i = 0; i < 12; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 15; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        const lb = getLeaderboard(states, 'broto', 10);
        return lb.length === 12;
      },
    },
    {
      name: 'smoke_18_suspended_user_excluded_from_leaderboard',
      run: () => {
        const states: UserReputationState[] = [];
        for (let i = 0; i < 11; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 20; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        for (let i = 0; i < 3; i++) flagToxicContent(states[0], { contentHash: `h${i}`, reason: 'spam', now: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00Z` });
        const lb = getLeaderboard(states, 'broto');
        return lb.length === 10 && !lb.some(e => e.displayNameAnonymized.includes('u0'));
      },
    },
    {
      name: 'smoke_19_anonymized_leaderboard_no_prefix',
      run: () => {
        const states: UserReputationState[] = [];
        for (let i = 0; i < 11; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 15; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        const lb = getAnonymizedLeaderboard(states, 'broto');
        return lb.length > 0 && lb.every(e => /^[a-f0-9]+$/.test(e.displayNameAnonymized));
      },
    },
    {
      name: 'smoke_20_purge_then_rescore_yields_public_only',
      run: () => {
        const state = createDefaultState('userR');
        for (let i = 0; i < 10; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        for (let i = 0; i < 3; i++) flagToxicContent(state, { contentHash: `h${i}`, reason: 'spam', now: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00Z` });
        purgeUserReputation(state, '2026-02-01T00:00:00Z');
        const publicActions = publicActionsFromLedger(state.ledger);
        recomputeScoreFromPublicActions(state, publicActions);
        return state.score.totalPoints === 0 && publicActions.length === 0;
      },
    },
    {
      name: 'smoke_21_opt_in_restores_visibility',
      run: () => {
        const state = createDefaultState('userI');
        for (let i = 0; i < 30; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        optOutReputation(state, 'test');
        const before = getUserReputation(state);
        optInReputation(state, '2026-02-01T00:00:00Z');
        const after = getUserReputation(state);
        return before.totalPoints === 0 && after.totalPoints === 300;
      },
    },
    {
      name: 'smoke_22_badge_progress_shows_missing',
      run: () => {
        const state = createDefaultState('userP');
        for (let i = 0; i < 5; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const p = getBadgeProgress(state, 'voz-da-comunidade');
        return !p.satisfied && p.missing.length > 0;
      },
    },
    {
      name: 'smoke_23_merge_ledgers_dedupes_by_id',
      run: () => {
        const a = createDefaultState('userM');
        const b = createDefaultState('userM');
        recordContribution(a, { kind: 'post', reason: 'shared', timestamp: '2026-01-01T00:00:00Z' });
        // Force same id by re-using same timestamp+reason
        b.ledger.push({ ...a.ledger[0] });
        recordContribution(b, { kind: 'comment', reason: 'different', timestamp: '2026-01-02T00:00:00Z' });
        const merged = mergeLedgers(a, b);
        return merged.ledger.length === 2;
      },
    },
    {
      name: 'smoke_24_sacred_multiplier_not_for_luz',
      run: () => {
        const mult = sacredEngagementBonus('luz', null, 'prayer-bonus');
        return mult === 1.0;
      },
    },
    {
      name: 'smoke_25_tier_progress_50pct_between_broto_flor',
      run: () => {
        // broto threshold 100, flor threshold 300 → range 200
        const p = getTierProgress(200, 'broto');
        return p === 50;
      },
    },
    {
      name: 'smoke_26_apply_delta_ignored_when_opted_out',
      run: () => {
        const state = createDefaultState('userO');
        optOutReputation(state, 'test');
        recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: '2026-01-01T00:00:00Z' });
        return state.score.totalPoints === 0 && state.ledger.length === 1;
      },
    },
    {
      name: 'smoke_27_apply_delta_ignored_when_suspended',
      run: () => {
        const state = createDefaultState('userS');
        for (let i = 0; i < 3; i++) flagToxicContent(state, { contentHash: `h${i}`, reason: 'spam', now: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00Z` });
        const before = state.score.totalPoints;
        recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: '2026-01-05T00:00:00Z' });
        return state.score.totalPoints === before && state.ledger.length === 4;
      },
    },
    {
      name: 'smoke_28_fnv1a_deterministic',
      run: () => fnv1a32('hello') === fnv1a32('hello'),
    },
    {
      name: 'smoke_29_anonymize_display_name_strips_pii',
      run: () => {
        const a = anonymizeDisplayName('Maria Silva');
        return a.startsWith('MA#') && a.length >= 6 && a.length <= 8;
      },
    },
    {
      name: 'smoke_30_sanitize_reason_redacts_email',
      run: () => {
        const s = sanitizeReason('contato user@example.com urgente');
        return s.includes('[email]') && !s.includes('user@example.com');
      },
    },
    {
      name: 'smoke_31_validate_no_toxicity_clean',
      run: () => validateNoToxicity('oração de boa tarde').ok === true,
    },
    {
      name: 'smoke_32_validate_no_toxicity_attack',
      run: () => {
        const r = validateNoToxicity('isso é um ataque pessoal grave');
        return !r.ok && r.severity === 'medium' && r.pattern === 'ataque-pessoal';
      },
    },
    {
      name: 'smoke_33_sacred_engagement_bonus_only_initial_tiers',
      run: () => {
        const sementeBonus = sacredEngagementBonus('semente', null, 'prayer-bonus');
        const luzBonus = sacredEngagementBonus('luz', null, 'prayer-bonus');
        return sementeBonus === 1.5 && luzBonus === 1.0;
      },
    },
    {
      name: 'smoke_34_count_active_days_unique_dates',
      run: () => {
        const state = createDefaultState('userD');
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 2; j++) {
            state.ledger.push({
              id: `e${i}-${j}`, userId: 'userD', kind: 'post', delta: 5, sacredMultiplier: 1.0,
              reason: 'x', tradition: null, timestamp: `2026-01-${String(i + 1).padStart(2, '0')}T${String(j + 10).padStart(2, '0')}:00:00Z`,
              purged: false, fromToxicityFlag: false,
            });
          }
        }
        return countActiveDays(state.ledger) === 5;
      },
    },
    {
      name: 'smoke_35_recompute_score_idempotent',
      run: () => {
        const state = createDefaultState('userI2');
        for (let i = 0; i < 10; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const a = state.score.totalPoints;
        recomputeScore(state);
        const b = state.score.totalPoints;
        return a === b;
      },
    },
    {
      name: 'smoke_36_max_sacred_multiplier_cap',
      run: () => {
        const m: SacredMultiplier = { kind: 'prayer-bonus', multiplier: 1.5, appliesToLevels: ['semente'], tradition: null, description: 'ok' };
        return validateSacredMultiplier(m).ok === true;
      },
    },
    {
      name: 'smoke_37_total_points_excludes_purged',
      run: () => {
        const state = createDefaultState('userTP');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        recordContribution(state, { kind: 'post', reason: 'p2', timestamp: '2026-01-02T00:00:00Z' });
        const before = totalPoints(state.ledger);
        state.ledger[0].purged = true;
        const after = totalPoints(state.ledger);
        return before === 10 && after === 5;
      },
    },
    {
      name: 'smoke_38_validator_score_consistency',
      run: () => {
        const state = createDefaultState('userV');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        return validateScoreConsistency(state.score).ok === true;
      },
    },
    {
      name: 'smoke_39_validator_score_inconsistency_detected',
      run: () => {
        const state = createDefaultState('userVI');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        state.score.totalPoints = 9999;
        return validateScoreConsistency(state.score).ok === false;
      },
    },
    {
      name: 'smoke_40_k_anon_validator_min_users',
      run: () => {
        return validateKAnonymity(10, 10).ok === true && validateKAnonymity(9, 10).ok === false;
      },
    },
    {
      name: 'smoke_41_public_actions_excludes_toxicity',
      run: () => {
        const state = createDefaultState('userPT');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        flagToxicContent(state, { contentHash: 'h1', reason: 'spam', now: '2026-01-02T00:00:00Z' });
        const pa = publicActionsFromLedger(state.ledger);
        return pa.length === 1 && pa[0].kind === 'post';
      },
    },
    {
      name: 'smoke_42_opt_out_score_visible_only_to_self',
      run: () => {
        const state = createDefaultState('userOS');
        for (let i = 0; i < 30; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        optOutReputation(state, 'privacidade');
        const visible = getUserReputation(state);
        const exp = exportUserReputation(state);
        return visible.totalPoints === 0 && exp.score.totalPoints === 300;
      },
    },
    {
      name: 'smoke_43_batch_record_contributions',
      run: () => {
        const state = createDefaultState('userB2');
        const events = Array.from({ length: 20 }, (_, i) => ({ kind: 'community-help' as ContributionKind, reason: `r${i}`, timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` }));
        const r = batchRecordContributions(state, events);
        return r.state.score.totalPoints === 200 && r.results.length === 20;
      },
    },
    {
      name: 'smoke_44_validate_ledger_entry_roundtrip',
      run: () => {
        const state = createDefaultState('userL');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        const v = validateLedgerEntry(state.ledger[0]);
        return v.ok === true;
      },
    },
    {
      name: 'smoke_45_award_badge_idempotent',
      run: () => {
        const state = createDefaultState('userBA');
        for (let i = 0; i < 30; i++) recordContribution(state, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z` });
        const a = awardBadge(state, 'voz-da-comunidade', '2026-01-31T12:00:00Z');
        const b = awardBadge(state, 'voz-da-comunidade', '2026-01-31T12:00:00Z');
        return a.awarded === true && b.awarded === false && b.reason !== undefined;
      },
    },
    {
      name: 'smoke_46_config_validator',
      run: () => validateConfig(DEFAULT_CONFIG).ok === true,
    },
    {
      name: 'smoke_47_get_next_tier_threshold',
      run: () => {
        const r = getNextTierThreshold('semente');
        return r.next === 'broto' && r.threshold === 100;
      },
    },
    {
      name: 'smoke_48_get_next_tier_luz_null',
      run: () => {
        const r = getNextTierThreshold('luz');
        return r.next === null && r.threshold === null;
      },
    },
    {
      name: 'smoke_49_tier_progress_100_at_luz',
      run: () => getTierProgress(2000, 'luz') === 100,
    },
    {
      name: 'smoke_50_toxicity_window_30_days',
      run: () => TOXICITY_WINDOW_DAYS === 30 && TOXICITY_SUSPENSION_THRESHOLD === 3,
    },
    {
      name: 'smoke_51_clear_suspension_resets_state',
      run: () => {
        const state = createDefaultState('userCS');
        for (let i = 0; i < 3; i++) flagToxicContent(state, { contentHash: `h${i}`, reason: 'spam', now: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00Z` });
        clearSuspension(state);
        return state.score.suspended === false && state.score.suspendedUntil === null;
      },
    },
    {
      name: 'smoke_52_applicable_sacred_multipliers',
      run: () => {
        const semente = applicableSacredMultipliers('semente');
        const luz = applicableSacredMultipliers('luz');
        return semente.length > 0 && luz.length === 0;
      },
    },
    {
      name: 'smoke_53_event_id_deterministic',
      run: () => {
        const a = generateEventId('u1', 'post', '2026-01-01T00:00:00Z', 'r');
        const b = generateEventId('u1', 'post', '2026-01-01T00:00:00Z', 'r');
        return a === b;
      },
    },
    {
      name: 'smoke_54_sacred_engagement_kind_only_increases',
      run: () => {
        const m: SacredMultiplier = { kind: 'prayer-bonus', multiplier: 0.5, appliesToLevels: ['semente'], tradition: null, description: 'bug' };
        return validateSacredMultiplier(m).ok === false;
      },
    },
    {
      name: 'smoke_55_breakdown_by_kind_excludes_purged',
      run: () => {
        const state = createDefaultState('userBK');
        recordContribution(state, { kind: 'post', reason: 'p', timestamp: '2026-01-01T00:00:00Z' });
        recordContribution(state, { kind: 'comment', reason: 'c', timestamp: '2026-01-02T00:00:00Z' });
        state.ledger[0].purged = true;
        const b = breakdownByKind(state.ledger);
        return b.post === 0 && b.comment === 2;
      },
    },
    {
      name: 'smoke_56_count_events_by_kind',
      run: () => {
        const state = createDefaultState('userCE');
        recordContribution(state, { kind: 'post', reason: 'p1', timestamp: '2026-01-01T00:00:00Z' });
        recordContribution(state, { kind: 'post', reason: 'p2', timestamp: '2026-01-02T00:00:00Z' });
        recordContribution(state, { kind: 'comment', reason: 'c', timestamp: '2026-01-03T00:00:00Z' });
        const c = countEventsByKind(state.ledger);
        return c.post === 2 && c.comment === 1;
      },
    },
    {
      name: 'smoke_57_detect_sacred_leak',
      run: () => {
        return detectSacredLeak('oração privada') === true && detectSacredLeak('conversa casual') === false;
      },
    },
    {
      name: 'smoke_58_leaderboard_ordering_descending',
      run: () => {
        const states: UserReputationState[] = [];
        // 12 users, each with 10-21 community-help posts (100-210 points, all broto)
        for (let i = 0; i < 12; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 10 + i; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        const lb = getLeaderboard(states, 'broto');
        return lb.length > 0 && lb[0].points >= lb[lb.length - 1].points;
      },
    },
    {
      name: 'smoke_59_leaderboard_respects_limit',
      run: () => {
        const states: UserReputationState[] = [];
        for (let i = 0; i < 20; i++) {
          const s = createDefaultState(`u${i}`);
          for (let j = 0; j < 15; j++) recordContribution(s, { kind: 'community-help', reason: 'help', timestamp: `2026-01-${String((j % 28) + 1).padStart(2, '0')}T12:00:00Z` });
          states.push(s);
        }
        const lb = getLeaderboard(states, 'broto', 10, 5);
        return lb.length === 5;
      },
    },
    {
      name: 'smoke_60_validate_config_min_delta_max_delta',
      run: () => {
        const v = validateReputationDelta(MAX_DELTA + 1, 'post');
        return v.ok === false;
      },
    },
  ];

  let passed = 0;
  for (const c of cases) {
    try {
      const ok = c.run();
      smokeResults.push({ name: c.name, passed: ok });
      if (ok) passed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      smokeResults.push({ name: c.name, passed: false, error: msg });
    }
  }
  return { passed, total: cases.length, results: smokeResults };
}

// ============================================================================
// SECTION 8 — CLI entrypoint
// ============================================================================

/**
 * Detecta se está rodando como script principal (tsc/tsx).
 * Se sim, executa smoke tests automaticamente.
 */
declare const process: { argv: string[]; exit: (code: number) => void };
declare const console: { log: (...args: unknown[]) => void };
declare const require: { main?: { filename?: string } };

const isMainModule = (() => {
  if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv.length > 1) {
    const arg1 = process.argv[1] ?? '';
    if (arg1.endsWith('reputation-universalista.ts') || arg1.endsWith('reputation-universalista.js')) {
      return true;
    }
  }
  return false;
})();

if (isMainModule) {
  const r = runSmokeTests();
  // eslint-disable-next-line no-console
  console.log(`[smoke] ${r.passed}/${r.total} passed`);
  for (const result of r.results) {
    if (!result.passed) {
      // eslint-disable-next-line no-console
      console.log(`  FAIL ${result.name}${result.error ? `: ${result.error}` : ''}`);
    }
  }
  if (r.passed !== r.total) process.exit(1);
}