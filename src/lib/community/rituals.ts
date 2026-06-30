// ============================================================================
// COMMUNITY RITUALS — Daily Ritual System (Wave 32, 2026-06-30)
// ============================================================================
// 7 tipos de rituais cotidianos + streak tracking + freeze tokens + milestones.
//
// Princípios éticos (gaming ético):
//   - SEMPRE opt-in (LGPD Art. 7 I)
//   - Streak é bônus, nunca imposição
//   - Streak freeze: 1 token/mês para preservar continuidade (não punição)
//   - Milestones oferecem CONTEÚDO, não status social
//   - Sem "leaderboard" de streaks — comparação gera culpa (anti-pattern)
//
// Matemática de streak:
//   - currentStreak = dias consecutivos com pelo menos 1 ritual marcado
//   - Freeze token = preserva 1 dia perdido (não conta como reset)
//   - Missão semanal: ≥5 rituais/semana (não precisa ser diário)
//
// Referência: docs/COMMUNITY-FEATURES-W32.md §2 (Daily Ritual System)
// ============================================================================

// ============================================================================
// Tipos públicos
// ============================================================================

export const RITUAL_TYPES = [
  'MEDITATION',
  'READING',
  'REFLECTION',
  'GRATITUDE',
  'INTENTION',
  'PARTAGE',
  'SILENCE',
] as const;

export type RitualType = (typeof RITUAL_TYPES)[number];

/** Metadados imutáveis de cada tipo de ritual. */
export const RITUAL_TYPE_META: Readonly<
  Record<RitualType, {
    id: RitualType;
    labelPt: string;
    labelEn: string;
    emoji: string;
    durationMin: number; // duração sugerida
    description: string;
    traditionAffinity: readonly string[]; // tradições onde esse ritual ressoa
  }>
> = {
  MEDITATION: {
    id: 'MEDITATION',
    labelPt: 'Meditação',
    labelEn: 'Meditation',
    emoji: '🧘',
    durationMin: 15,
    description: 'Sentar-se em silêncio, observar a respiração.',
    traditionAffinity: ['Budismo', 'Hinduísmo', 'Cabalá', 'Cristianismo Místico'],
  },
  READING: {
    id: 'READING',
    labelPt: 'Leitura',
    labelEn: 'Reading',
    emoji: '📖',
    durationMin: 20,
    description: 'Ler texto sagrado, artigo ou poesia.',
    traditionAffinity: ['Cabalá', 'Cristianismo Místico', 'Islamismo Sufi', 'Espiritismo'],
  },
  REFLECTION: {
    id: 'REFLECTION',
    labelPt: 'Reflexão',
    labelEn: 'Reflection',
    emoji: '📓',
    durationMin: 10,
    description: 'Escrever sobre o dia, sensações, sonhos.',
    traditionAffinity: ['Espiritismo', 'Junguiana', 'Cabalá'],
  },
  GRATITUDE: {
    id: 'GRATITUDE',
    labelPt: 'Gratidão',
    labelEn: 'Gratitude',
    emoji: '🙏',
    durationMin: 5,
    description: 'Listar 3 coisas pelas quais sente gratidão.',
    traditionAffinity: ['Cristianismo Místico', 'Espiritismo', 'Budismo'],
  },
  INTENTION: {
    id: 'INTENTION',
    labelPt: 'Intenção',
    labelEn: 'Intention',
    emoji: '🎯',
    durationMin: 5,
    description: 'Definir intenção clara para o dia.',
    traditionAffinity: ['Cabalá', 'Tantra', 'Budismo'],
  },
  PARTAGE: {
    id: 'PARTAGE',
    labelPt: 'Partage',
    labelEn: 'Partage',
    emoji: '🍞',
    description: 'Partilhar algo (refeição, tempo, escuta) com alguém.',
    durationMin: 30,
    traditionAffinity: ['Umbanda', 'Candomblé', 'Cristianismo Místico', 'Comunidade'],
  },
  SILENCE: {
    id: 'SILENCE',
    labelPt: 'Silêncio',
    labelEn: 'Silence',
    emoji: '🤫',
    durationMin: 10,
    description: 'Praticar silêncio intencional por período definido.',
    traditionAffinity: ['Quaker', 'Cabalá', 'Hinduísmo', 'Sufismo'],
  },
};

/** Streak milestones — chave é dias consecutivos. */
export const STREAK_MILESTONES: readonly {
  days: number;
  badge: string;
  rewardPt: string;
  rewardEn: string;
}[] = [
  { days: 1, badge: '🌱', rewardPt: 'Bem-vindo à jornada', rewardEn: 'Welcome to the journey' },
  { days: 7, badge: '🌿', rewardPt: 'Ritual semanal formado', rewardEn: 'Weekly ritual formed' },
  { days: 30, badge: '🌳', rewardPt: 'Mês de presença', rewardEn: 'A month of presence' },
  { days: 90, badge: '🌟', rewardPt: 'Trimestre contemplativo', rewardEn: 'A contemplative quarter' },
  { days: 180, badge: '✨', rewardPt: 'Meia-volta ao sol', rewardEn: 'Half a sun cycle' },
  { days: 365, badge: '🌌', rewardPt: 'Ano de prática', rewardEn: 'A year of practice' },
] as const;

// ============================================================================
// Tipos
// ============================================================================

/** Configuração do profile de rituais do user (carregado do DB; defaults abaixo). */
export interface UserRitualProfile {
  userId: string;
  /** Opt-in (LGPD Art. 7 I). Sem opt-in, rituais não geram streak. */
  optedIn: boolean;
  /** Data de início da prática (primeiro ritual). */
  startedAt: Date | null;
  /** Timezone do user (IANA) — para cálculo de "hoje". */
  timezone: string;
  /** Tipos de ritual que o user pratica (subset de RITUAL_TYPES). */
  preferredTypes: readonly RitualType[];
  /** Tokens de freeze disponíveis (regenera 1/mês). */
  freezeTokens: number;
  /** Último mês em que regeneramos freeze (YYYY-MM). */
  freezeLastRefillMonth: string | null;
  /** Streak atual (dias consecutivos). */
  currentStreak: number;
  /** Maior streak atingido (record). */
  longestStreak: number;
  /** Total de rituais completados (lifetime). */
  totalRitualsCompleted: number;
  /** Última data com ritual registrado (ISO date YYYY-MM-DD local). */
  lastRitualLocalDate: string | null;
  /** Milestones já celebrados (badge emoji). */
  celebratedMilestones: readonly string[];
}

/** Entrada do diário: ritual marcado em um dia. */
export interface RitualEntry {
  id: string;
  userId: string;
  ritualType: RitualType;
  /** Duração efetiva em minutos (>= 1). */
  durationMin: number;
  /** Notas/reflexões opcionais. */
  note: string | null;
  /** UTC timestamp do registro. */
  completedAt: Date;
  /** Data local (YYYY-MM-DD no timezone do user). */
  localDate: string;
}

export const DEFAULT_RITUAL_PROFILE: Omit<UserRitualProfile, 'userId'> = {
  optedIn: false,
  startedAt: null,
  timezone: 'America/Sao_Paulo',
  preferredTypes: ['MEDITATION', 'GRATITUDE'],
  freezeTokens: 0,
  freezeLastRefillMonth: null,
  currentStreak: 0,
  longestStreak: 0,
  totalRitualsCompleted: 0,
  lastRitualLocalDate: null,
  celebratedMilestones: [],
};

// ============================================================================
// Pure helpers (sem DB)
// ============================================================================

/** Converte Date UTC para data local "YYYY-MM-DD" no timezone IANA. */
export function toLocalDate(date: Date, timezone: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(date);
}

/** Diferença em dias entre duas datas locais (YYYY-MM-DD). */
export function daysBetweenLocal(localA: string, localB: string): number {
  // Parse YYYY-MM-DD como UTC para evitar DST
  const a = Date.UTC(
    parseInt(localA.slice(0, 4), 10),
    parseInt(localA.slice(5, 7), 10) - 1,
    parseInt(localA.slice(8, 10), 10)
  );
  const b = Date.UTC(
    parseInt(localB.slice(0, 4), 10),
    parseInt(localB.slice(5, 7), 10) - 1,
    parseInt(localB.slice(8, 10), 10)
  );
  return Math.round((b - a) / 86_400_000);
}

/** Mês atual no formato YYYY-MM (timezone IANA). */
export function currentMonthKey(date: Date, timezone: string): string {
  return toLocalDate(date, timezone).slice(0, 7);
}

// ============================================================================
// Streak math
// ============================================================================

export interface StreakUpdateInput {
  profile: UserRitualProfile;
  /** Entradas do dia local "hoje" (após o registro novo). */
  todayEntries: readonly RitualEntry[];
  /** Data local "hoje" (YYYY-MM-DD). */
  todayLocal: string;
  /** Data local "ontem" (YYYY-MM-DD). */
  yesterdayLocal: string;
}

export interface StreakUpdateResult {
  newCurrentStreak: number;
  newLongestStreak: number;
  /** true se o registro atingiu um novo milestone. */
  newMilestoneHit: { days: number; badge: string } | null;
  /** true se um freeze token foi consumido automaticamente. */
  freezeConsumed: boolean;
}

/**
 * Recalcula streak após registro de ritual.
 *
 * Lógica:
 *   - Se já tem ritual HOJE → sem mudança (idempotente, múltiplos rituais/dia)
 *   - Se último ritual foi ONTEM → currentStreak += 1
 *   - Se último ritual foi HOJE (já registrado) → mantém streak
 *   - Se gap > 1 dia E profile.freezeTokens > 0 → consome 1 freeze, streak += 1
 *   - Senão → streak reseta para 1
 *
 * Pure function: retorna novo estado, não muta.
 */
export function recalcStreak(input: StreakUpdateInput): StreakUpdateResult {
  const { profile, todayEntries, todayLocal, yesterdayLocal } = input;

  // Sem opt-in: nunca computa streak (LGPD)
  if (!profile.optedIn) {
    return {
      newCurrentStreak: profile.currentStreak,
      newLongestStreak: profile.longestStreak,
      newMilestoneHit: null,
      freezeConsumed: false,
    };
  }

  // Sem entradas hoje: nada a fazer
  if (todayEntries.length === 0) {
    return {
      newCurrentStreak: profile.currentStreak,
      newLongestStreak: profile.longestStreak,
      newMilestoneHit: null,
      freezeConsumed: false,
    };
  }

  // Já tem entrada hoje? Idempotente.
  const hadEntryToday = profile.lastRitualLocalDate === todayLocal;
  if (hadEntryToday) {
    return {
      newCurrentStreak: profile.currentStreak,
      newLongestStreak: profile.longestStreak,
      newMilestoneHit: null,
      freezeConsumed: false,
    };
  }

  // Primeira entrada de hoje: calcula delta
  const lastDate = profile.lastRitualLocalDate;
  let newStreak: number;
  let freezeConsumed = false;

  if (lastDate === null) {
    newStreak = 1; // primeira vez
  } else {
    const daysSinceLast = daysBetweenLocal(lastDate, todayLocal);

    if (daysSinceLast === 1) {
      // ontem → sequência contínua
      newStreak = profile.currentStreak + 1;
    } else if (daysSinceLast === 0) {
      // hoje (mas lastDate != today) — improvável; trata como manutenção
      newStreak = Math.max(1, profile.currentStreak);
    } else if (daysSinceLast > 1 && profile.freezeTokens > 0) {
      // gap > 1: tenta consumir freeze
      newStreak = profile.currentStreak + 1;
      freezeConsumed = true;
    } else {
      // gap > 1 sem freeze: reset
      newStreak = 1;
    }
  }

  // Reforça piso mínimo de 1 (acabei de registrar, conta hoje)
  newStreak = Math.max(1, newStreak);

  const newLongest = Math.max(profile.longestStreak, newStreak);

  // Detecta novo milestone
  let newMilestoneHit: { days: number; badge: string } | null = null;
  for (const m of STREAK_MILESTONES) {
    if (
      newStreak >= m.days &&
      profile.currentStreak < m.days &&
      !profile.celebratedMilestones.includes(m.badge)
    ) {
      newMilestoneHit = { days: m.days, badge: m.badge };
      break; // apenas 1 milestone por update
    }
  }

  return {
    newCurrentStreak: newStreak,
    newLongestStreak: newLongest,
    newMilestoneHit,
    freezeConsumed,
  };
}

// ============================================================================
// Freeze token refill
// ============================================================================

/**
 * Decide se o profile ganha 1 freeze token neste mês.
 * Regra: 1 token por mês, opt-in (caller deve validar opt-in antes).
 * Idempotente: se já refillou neste mês, retorna 0.
 */
export function refillFreezeToken(
  profile: UserRitualProfile,
  now: Date
): { shouldRefill: boolean; newTokens: number } {
  const monthKey = currentMonthKey(now, profile.timezone);
  if (profile.freezeLastRefillMonth === monthKey) {
    return { shouldRefill: false, newTokens: profile.freezeTokens };
  }
  // Cap em 3 tokens acumulados
  const newTokens = Math.min(3, profile.freezeTokens + 1);
  return { shouldRefill: true, newTokens };
}

/** Compra/recebe freeze token (opt-in). Retorna novo saldo, cap em 3. */
export function grantFreezeToken(profile: UserRitualProfile): number {
  return Math.min(3, profile.freezeTokens + 1);
}

/** Consome freeze token explicitamente (opt-in do user). */
export function consumeFreezeToken(profile: UserRitualProfile): {
  ok: boolean;
  newTokens: number;
} {
  if (profile.freezeTokens <= 0) {
    return { ok: false, newTokens: 0 };
  }
  return { ok: true, newTokens: profile.freezeTokens - 1 };
}

// ============================================================================
// Ritual entry validation
// ============================================================================

export class RitualValidationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'RitualValidationError';
  }
}

export function validateRitualEntry(input: {
  ritualType: string;
  durationMin: number;
  note: string | null;
}): asserts input is { ritualType: RitualType; durationMin: number; note: string | null } {
  if (!RITUAL_TYPES.includes(input.ritualType as RitualType)) {
    throw new RitualValidationError(
      `Tipo de ritual inválido: "${input.ritualType}". Use um dos 7 tipos oficiais.`
    );
  }
  if (input.durationMin < 1 || input.durationMin > 480) {
    throw new RitualValidationError(
      'Duração deve estar entre 1 e 480 minutos (8h)'
    );
  }
  if (input.note !== null && input.note.length > 1000) {
    throw new RitualValidationError('Nota muito longa (máx 1000 caracteres)');
  }
}

// ============================================================================
// Weekly mission (5 rituais/semana)
// ============================================================================

/**
 * Missão semanal: ≥ 5 rituais em qualquer 7 dias consecutivos.
 * Pure: recebe entries do período, retorna progresso.
 */
export interface WeeklyMissionResult {
  ritualsThisWeek: number;
  targetMet: boolean;
  /** % de 0-100 (5 = 100%) */
  percent: number;
}

export function computeWeeklyMission(
  entries: readonly RitualEntry[],
  weekStartLocal: string,
  weekEndLocal: string
): WeeklyMissionResult {
  const weekStartTs = Date.UTC(
    parseInt(weekStartLocal.slice(0, 4), 10),
    parseInt(weekStartLocal.slice(5, 7), 10) - 1,
    parseInt(weekStartLocal.slice(8, 10), 10)
  );
  const weekEndTs = Date.UTC(
    parseInt(weekEndLocal.slice(0, 4), 10),
    parseInt(weekEndLocal.slice(5, 7), 10) - 1,
    parseInt(weekEndLocal.slice(8, 10), 10)
  );

  const inWeek = entries.filter((e) => {
    const ts = e.completedAt.getTime();
    return ts >= weekStartTs && ts <= weekEndTs + 86_400_000 - 1;
  });

  const count = inWeek.length;
  return {
    ritualsThisWeek: count,
    targetMet: count >= 5,
    percent: Math.min(100, Math.round((count / 5) * 100)),
  };
}

// ============================================================================
// Streak summary (para UI)
// ============================================================================

export interface StreakSummary {
  current: number;
  longest: number;
  freezeTokens: number;
  nextMilestone: { days: number; badge: string; daysRemaining: number } | null;
  celebratedBadges: readonly string[];
}

/** Resumo compacto para UI cards (mobile-first bottom sheet). */
export function summarizeStreak(profile: UserRitualProfile): StreakSummary {
  let nextMilestone: StreakSummary['nextMilestone'] = null;
  for (const m of STREAK_MILESTONES) {
    if (m.days > profile.currentStreak) {
      nextMilestone = {
        days: m.days,
        badge: m.badge,
        daysRemaining: m.days - profile.currentStreak,
      };
      break;
    }
  }

  return {
    current: profile.currentStreak,
    longest: profile.longestStreak,
    freezeTokens: profile.freezeTokens,
    nextMilestone,
    celebratedBadges: profile.celebratedMilestones,
  };
}

// ============================================================================
// Anti-pattern self-check (gaming ético)
// ============================================================================

/**
 * Validador que garante que o profile não está sendo manipulado.
 *
 * Não retorna bloqueios, mas sinaliza "red flags" para auditoria ética:
 *   - streak > 365 com < 100 rituais totais (estatisticamente improvável)
 *   - totalRitualsCompleted < currentStreak (não conta rituais extras)
 *   - celebratedMilestones contém badges que ainda não atingiu
 */
export interface EthicsFlag {
  severity: 'INFO' | 'WARN' | 'BLOCK';
  code: string;
  message: string;
}

export function auditRitualProfile(profile: UserRitualProfile): readonly EthicsFlag[] {
  const flags: EthicsFlag[] = [];

  // Sanity check 1: total >= current (impossível ter streak maior que total)
  if (profile.currentStreak > profile.totalRitualsCompleted) {
    flags.push({
      severity: 'BLOCK',
      code: 'STREAK_EXCEEDS_TOTAL',
      message: `Streak (${profile.currentStreak}) > rituais totais (${profile.totalRitualsCompleted}). Possível manipulação.`,
    });
  }

  // Sanity check 2: streak absurdo com poucos rituais
  if (profile.currentStreak > 365 && profile.totalRitualsCompleted < 100) {
    flags.push({
      severity: 'WARN',
      code: 'IMPLAUSIBLE_LONG_STREAK',
      message: `Streak de ${profile.currentStreak} dias com apenas ${profile.totalRitualsCompleted} rituais totais.`,
    });
  }

  // Sanity check 3: badges celebrados que não foram atingidos
  for (const m of STREAK_MILESTONES) {
    if (
      profile.celebratedMilestones.includes(m.badge) &&
      profile.longestStreak < m.days
    ) {
      flags.push({
        severity: 'BLOCK',
        code: 'UNJUSTIFIED_BADGE',
        message: `Badge ${m.badge} celebrado mas longest streak (${profile.longestStreak}) < ${m.days} dias.`,
      });
    }
  }

  // Info: opt-out é OK, mas streak congelado em > 0 é estranho
  if (!profile.optedIn && profile.currentStreak > 0) {
    flags.push({
      severity: 'INFO',
      code: 'OPTOUT_WITH_STREAK',
      message: 'User opt-out com streak > 0; limpar antes de aplicar opt-out.',
    });
  }

  return flags;
}