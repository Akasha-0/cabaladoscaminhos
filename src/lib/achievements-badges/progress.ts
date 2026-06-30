// ============================================================================
// PROGRESS — Achievement progress tracking (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React) — calcula progresso do usuário em cada
// achievement (current/target/percent), identifica o próximo marco, agrega
// por categoria, e expõe uma cadeia de cálculo auditável.
//
// Design decisions:
//   - Single source of truth: UserState (from achievements.ts) é suficiente
//   - "current" é derivado do estado; "target" vem do critério (heurística)
//   - Calculações são puras (sem Date.now / Math.random) — clocks vêm de fora
//   - "nextMilestone" prioriza menor percent-restante (não menor current)
//   - "auditProgressCalculation" expõe a cadeia para QA / auditoria
//
// Cycle 62 lesson 2: never-calc silently — export the formula chain.
// ============================================================================

import type {
  AchievementId,
  AchievementDefinition,
  AchievementCategory,
  UserState,
  UserId,
} from './achievements.ts';
import { ACHIEVEMENTS } from './achievements.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressEntry {
  readonly achievement: AchievementDefinition;
  readonly current: number;
  readonly target: number;
  readonly percent: number; // 0..100, rounded; >100 capped to 100 for display but current can exceed
  readonly isComplete: boolean;
}

export interface CategoryProgress {
  readonly category: AchievementCategory;
  readonly totalAchievements: number;
  readonly unlockedCount: number;
  readonly percent: number;
}

// ============================================================================
// TARGET HEURISTICS
// ============================================================================
// Each achievement entry declares its *current* rule but not its *target* —
// we infer the target from the criterion's "at-least" constant. For named
// predicates (boolean achievements), the target is 1.
//
// To keep this maintainable, we map achievement id → target explicitly via
// a small table. Adding a new achievement requires adding an entry here so
// progress reporting stays honest.

const TARGET_TABLE: Readonly<Record<AchievementId, number>> = Object.freeze({
  // Readings (volume)
  'first-light': 1,
  'devoted-seeker': 10,
  'caminhante-do-caminho': 50,
  'mestre-da-mesa': 100,
  'oracle-elder': 500,
  // Readings (by tradition)
  'cigano-sincero': 10,
  'cigano-viajante': 50,
  'astrologia-iniciante': 10,
  'astrologia-mestra': 50,
  'orixas-tocado': 10,
  'orixas-filhos-do-axxe': 50,
  'cabala-estudante': 10,
  'numerologia-vibrante': 10,
  'tantra-desperto': 10,
  'tarot-leitor': 10,
  // Streaks
  'chama-de-3-dias': 3,
  'chama-de-7-dias': 7,
  'chama-de-30-dias': 30,
  'chama-de-100-dias': 100,
  'chama-de-365-dias': 365,
  // Reflection
  'primeira-reflexao': 1,
  'reflexao-semanal': 7,
  'diario-de-sonhos': 10,
  'reflexao-mestre': 100,
  // Community
  'primeira-partilha': 1,
  'conselheiro': 10,
  'mentor-solidario': 1,
  'mestre-da-celebracao': 100,
  // Exploration
  'tocou-3-tradicoes': 3,
  'tocou-5-tradicoes': 5,
  'orculo-inclusivo': 6,
  'caminhante-de-todas-as-portas': 7,
  'primeiro-passo': 1,
});

// ============================================================================
// CURRENT-VALUE DERIVATION
// ============================================================================
// Each achievement has a counter field. Lookup the field from the criterion
// input. Named booleans (mentoringPeer, hasCompletedOnboarding) use 0/1.

function deriveCurrentValue(state: UserState, id: AchievementId): number {
  switch (id as string) {
    // Readings
    case 'first-light':
    case 'devoted-seeker':
    case 'caminhante-do-caminho':
    case 'mestre-da-mesa':
    case 'oracle-elder':
      return state.totalReadings;
    case 'cigano-sincero':
    case 'cigano-viajante':
      return state.ciganoReadings;
    case 'astrologia-iniciante':
    case 'astrologia-mestra':
      return state.astrologiaReadings;
    case 'orixas-tocado':
    case 'orixas-filhos-do-axxe':
      return state.orixasReadings;
    case 'cabala-estudante':
      return state.cabalaReadings;
    case 'numerologia-vibrante':
      return state.numerologiaReadings;
    case 'tantra-desperto':
      return state.tantraReadings;
    case 'tarot-leitor':
      return state.tarotReadings;
    // Streaks
    case 'chama-de-3-dias':
    case 'chama-de-7-dias':
    case 'chama-de-30-dias':
    case 'chama-de-100-dias':
    case 'chama-de-365-dias':
      return state.currentStreak;
    // Reflection
    case 'primeira-reflexao':
    case 'reflexao-semanal':
    case 'reflexao-mestre':
      return state.reflections;
    case 'diario-de-sonhos':
      return state.dreams;
    // Community
    case 'primeira-partilha':
    case 'mestre-da-celebracao':
      return state.posts;
    case 'conselheiro':
      return state.helpfulComments;
    // Boolean achievements
    case 'mentor-solidario':
      return state.mentoringPeer ? 1 : 0;
    case 'primeiro-passo':
      return state.hasCompletedOnboarding ? 1 : 0;
    // Exploration (computed)
    case 'tocou-3-tradicoes':
    case 'tocou-5-tradicoes':
    case 'caminhante-de-todas-as-portas':
      return state.uniqueTraditionsUsed;
    case 'orculo-inclusivo':
      return state.readingTypesUsed;
    default:
      return 0;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get progress for a single achievement.
 *
 * Returns a ProgressEntry with:
 *   - current: derived value from state
 *   - target: from TARGET_TABLE (1 for booleans)
 *   - percent: 0..100, rounded; >100 capped at 100 for display, but `isComplete` is the source of truth
 *   - isComplete: true if evaluateAchievement returns true
 */
export function getProgress(
  state: UserState,
  achievementId: AchievementId,
): ProgressEntry {
  if (!state) {
    throw new Error('Progress: state is required');
  }
  const def = ACHIEVEMENTS.find((d) => d.id === achievementId);
  if (!def) {
    throw new Error(`Progress: unknown achievement ${achievementId}`);
  }
  const target = TARGET_TABLE[achievementId] ?? 1;
  const rawCurrent = deriveCurrentValue(state, achievementId);
  const current = Math.max(0, rawCurrent);
  const percentRaw = target === 0 ? 100 : (current / target) * 100;
  const percent = Math.min(100, Math.round(percentRaw * 10) / 10);
  const isComplete = (() => {
    try {
      return def.criteria(state);
    } catch {
      return false;
    }
  })();
  return Object.freeze({
    achievement: def,
    current,
    target,
    percent,
    isComplete,
  });
}

/**
 * Get all in-progress achievements (current < target AND not yet complete).
 * Sorted by highest percent first (closest-to-completion shown first).
 */
export function getInProgressAchievements(
  state: UserState,
): readonly ProgressEntry[] {
  return ACHIEVEMENTS
    .map((d) => getProgress(state, d.id))
    .filter((p) => !p.isComplete)
    .sort((a, b) => b.percent - a.percent);
}

/**
 * Return the closest achievement (highest percent that isn't yet complete).
 * `null` if user has completed everything.
 */
export function nextMilestone(state: UserState): ProgressEntry | null {
  const inProgress = getInProgressAchievements(state);
  if (inProgress.length === 0) return null;
  return inProgress[0]!;
}

/**
 * Streak-specific progress: progressToStreakMilestones walks each streak
 * achievement and returns {milestone, current, percent}.
 *
 * Streak family is detected by id prefix "chama-de-".
 */
export function progressToStreakMilestones(
  state: UserState,
): readonly {
  readonly achievement: AchievementDefinition;
  readonly milestone: number;
  readonly current: number;
  readonly percent: number;
}[] {
  return ACHIEVEMENTS
    .filter((d) => (d.id as string).startsWith('chama-de-'))
    .map((d) => {
      const target = TARGET_TABLE[d.id] ?? 1;
      const current = state.currentStreak;
      const percent =
        target === 0 ? 100 : Math.min(100, Math.round((current / target) * 1000) / 10);
      return Object.freeze({
        achievement: d,
        milestone: target,
        current,
        percent,
      });
    })
    .slice()
    .sort((a, b) => a.milestone - b.milestone);
}

/**
 * Category-level rollup. Returns total achievements in category, how many
 * unlocked, and percentage.
 *
 * `unlockedIds` is optional — when omitted, defaults to "evaluate state",
 * i.e. an achievement is unlocked if its criteria currently pass.
 */
export function progressByCategory(
  state: UserState,
  category: AchievementCategory,
  unlockedIds?: ReadonlySet<string>,
): CategoryProgress {
  const all = ACHIEVEMENTS.filter((d) => d.category === category);
  const totalAchievements = all.length;
  let unlockedCount = 0;
  if (unlockedIds) {
    for (const d of all) {
      if (unlockedIds.has(d.id as string)) unlockedCount += 1;
    }
  } else {
    for (const d of all) {
      try {
        if (d.criteria(state)) unlockedCount += 1;
      } catch {
        // skip
      }
    }
  }
  const percent =
    totalAchievements === 0
      ? 0
      : Math.round((unlockedCount / totalAchievements) * 1000) / 10;
  return Object.freeze({ category, totalAchievements, unlockedCount, percent });
}

/**
 * Aggregate rollup across all categories. Useful for the user dashboard.
 */
export function progressAllCategories(
  state: UserState,
  unlockedIds?: ReadonlySet<string>,
): readonly CategoryProgress[] {
  const cats: readonly AchievementCategory[] = [
    'readings',
    'streaks',
    'reflection',
    'community',
    'exploration',
  ];
  return cats.map((c) => progressByCategory(state, c, unlockedIds));
}

// ============================================================================
// AUDIT — Calculation chain (cycle 62 lesson 2)
// ============================================================================

/**
 * Audit entrypoint for the progress calculation. Returns the chain used:
 *   - target-table sizes
 *   - derivation table completeness (all achievements present)
 *   - rounding behavior (2 decimals, capped at 100)
 *   - percent formula
 *
 * Used by `auditProgressCalculation` exports in tests and by QA reviewers.
 */
export interface ProgressCalculationAudit {
  readonly targetEntryCount: number;
  readonly catalogEntryCount: number;
  readonly allTargetsCovered: boolean;
  readonly percentFormula: string;
  readonly capBehavior: string;
  readonly categoryList: readonly AchievementCategory[];
  readonly streakPrefix: string;
  readonly rounding: string;
  readonly passes: boolean;
}

export function auditProgressCalculation(): ProgressCalculationAudit {
  const catalogIds = new Set<string>(ACHIEVEMENTS.map((d) => d.id as string));
  const targetIds = new Set<string>(
    Object.keys(TARGET_TABLE) as readonly string[],
  );
  // Targets may be a *strict subset* if some achievements are pure booleans not
  // requiring a numeric goal. We require EVERY catalog id to have a target
  // (current implementation supports only numeric-current achievements).
  const allCovered =
    [...catalogIds].every((id) => targetIds.has(id)) &&
    [...targetIds].every((id) => catalogIds.has(id));

  const formula =
    'percent = min(100, round((current / target) * 100 * 10) / 10)';
  const cap = 'percent clamp at 100 for display; current may exceed target';
  const rounding = '1 decimal place';

  const categoryList: readonly AchievementCategory[] = [
    'readings',
    'streaks',
    'reflection',
    'community',
    'exploration',
  ];

  return Object.freeze({
    targetEntryCount: targetIds.size,
    catalogEntryCount: catalogIds.size,
    allTargetsCovered: allCovered,
    percentFormula: formula,
    capBehavior: cap,
    categoryList,
    streakPrefix: 'chama-de-',
    rounding,
    passes: allCovered,
  });
}
