/**
 * mentorship-goal-tracking.ts
 *
 * Cycle 35 — Mentorship SMART Goals, Progress %, and Action Item Templates.
 *
 * Composes with:
 *   - src/lib/w29/mentorship-matching.ts         (match profile)
 *   - src/lib/w33/mentorship-session-detail.ts   (session viewmodel)
 *   - src/lib/w25/mentorship-pairing.ts          (1-on-1 pairing)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. SMART goals — Specific / Measurable / Achievable / Relevant / Time-
 *      bound validation, plus a builder that enforces all 5 axes.
 *   2. Progress — overall % (0..100) computed from a weighted mix of
 *      completed sub-goals and updated action items.
 *   3. Action items — template library (12 archetypes) the mentor can pick
 *      from, plus a creator that stamps defaults (due, priority, status).
 *   4. Cadence — suggest follow-up interval based on progress and last
 *      check-in: stalled or behind → shorter cadence; on track or done →
 *      longer cadence.
 *   5. Summary — aggregate (open / done / overdue / avg progress / ETA).
 */

// ---------- TYPES ----------------------------------------------------------

export type GoalStatus = "draft" | "active" | "achieved" | "abandoned" | "blocked";

export type Priority = "low" | "medium" | "high" | "critical";

export interface MentorshipGoal {
  id: string;
  mentorshipId: string;
  title: string;        // specific
  metric: string;       // measurable (e.g., "3x/week meditation")
  baseline: number;     // starting value (0 if N/A)
  target: number;       // target value
  current: number;      // current value
  unit: string;         // e.g., "sessions", "minutes", "days"
  relevance: string;    // why this matters to the mentee
  deadline: number;     // epoch ms
  status: GoalStatus;
  createdAt: number;
  updatedAt: number;
}

export type ActionItemStatus =
  | "open"
  | "in_progress"
  | "done"
  | "skipped"
  | "blocked";

export type ActionItemTemplate =
  | "read_passage"
  | "daily_reflection"
  | "voice_practice"
  | "study_session"
  | "meditation_sitting"
  | "journaling_prompt"
  | "check_in_message"
  | "read_recommended"
  | "shadow_mentor_session"
  | "apply_to_life"
  | "ritual_practice"
  | "share_with_community";

export interface ActionItem {
  id: string;
  goalId: string;
  title: string;
  template: ActionItemTemplate;
  status: ActionItemStatus;
  priority: Priority;
  dueAt: number;
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface ProgressSnapshot {
  goalId: string;
  percent: number;          // 0..100
  subProgress: number;      // 0..100
  onTrack: boolean;
  remaining: number;        // target - current
  isOverdue: boolean;
  daysToDeadline: number;
}

export interface CadenceSuggestion {
  intervalDays: number;
  reason: string;
  urgency: "low" | "medium" | "high";
}

export interface GoalSummary {
  total: number;
  active: number;
  achieved: number;
  blocked: number;
  averageProgress: number;
  overdueGoals: number;
  nextDeadline: number | null;
}

export interface ActionItemSummary {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  skipped: number;
  blocked: number;
  overdue: number;
  byTemplate: Record<ActionItemTemplate, number>;
}

// ---------- CONSTANTS -----------------------------------------------------

export const ACTION_ITEM_TEMPLATES: Record<
  ActionItemTemplate,
  { title: string; defaultPriority: Priority; defaultOffsetDays: number }
> = {
  read_passage: { title: "Ler passagem indicada", defaultPriority: "medium", defaultOffsetDays: 2 },
  daily_reflection: { title: "Reflexão diária", defaultPriority: "low", defaultOffsetDays: 1 },
  voice_practice: { title: "Prática de voz / leitura", defaultPriority: "medium", defaultOffsetDays: 1 },
  study_session: { title: "Sessão de estudo", defaultPriority: "high", defaultOffsetDays: 3 },
  meditation_sitting: { title: "Sentar para meditar", defaultPriority: "medium", defaultOffsetDays: 1 },
  journaling_prompt: { title: "Prompt de journaling", defaultPriority: "low", defaultOffsetDays: 2 },
  check_in_message: { title: "Mensagem de check-in", defaultPriority: "low", defaultOffsetDays: 7 },
  read_recommended: { title: "Ler material recomendado", defaultPriority: "medium", defaultOffsetDays: 5 },
  shadow_mentor_session: { title: "Sessão sombra com mentor", defaultPriority: "high", defaultOffsetDays: 7 },
  apply_to_life: { title: "Aplicar conceito na vida", defaultPriority: "high", defaultOffsetDays: 4 },
  ritual_practice: { title: "Prática ritual", defaultPriority: "medium", defaultOffsetDays: 2 },
  share_with_community: { title: "Compartilhar com a comunidade", defaultPriority: "low", defaultOffsetDays: 7 },
};

export const PROGRESS_ON_TRACK_THRESHOLD = 0.7; // 70% of expected progress
export const MAX_GOAL_DURATION_DAYS = 365;
export const MIN_GOAL_DURATION_DAYS = 1;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const CADENCE_MIN_DAYS = 1;
export const CADENCE_MAX_DAYS = 30;

// ---------- SMART VALIDATION ---------------------------------------------

export interface SmartValidation {
  isValid: boolean;
  missing: ("specific" | "measurable" | "achievable" | "relevant" | "time_bound")[];
  score: number; // 0..5
}

export function validateSmart(goal: MentorshipGoal): SmartValidation {
  const missing: SmartValidation["missing"] = [];
  if (!goal.title || goal.title.trim().length < 3) missing.push("specific");
  if (!goal.metric || goal.metric.trim().length < 3) missing.push("measurable");
  // Achievable: target != baseline AND target direction makes sense
  const ach =
    goal.target !== goal.baseline &&
    (goal.target > goal.baseline || goal.target < goal.baseline);
  if (!ach) missing.push("achievable");
  if (!goal.relevance || goal.relevance.trim().length < 3) missing.push("relevant");
  // Time-bound: deadline in the future and reasonable window
  const durDays = (goal.deadline - goal.createdAt) / MS_PER_DAY;
  const tb = durDays >= MIN_GOAL_DURATION_DAYS && durDays <= MAX_GOAL_DURATION_DAYS;
  if (!tb) missing.push("time_bound");
  return {
    isValid: missing.length === 0,
    missing,
    score: 5 - missing.length,
  };
}

export function isSpecific(goal: MentorshipGoal): boolean {
  return typeof goal.title === "string" && goal.title.trim().length >= 3;
}

export function isMeasurable(goal: MentorshipGoal): boolean {
  return typeof goal.metric === "string" && goal.metric.trim().length >= 3;
}

export function isAchievable(goal: MentorshipGoal): boolean {
  return goal.target !== goal.baseline;
}

export function isRelevant(goal: MentorshipGoal): boolean {
  return typeof goal.relevance === "string" && goal.relevance.trim().length >= 3;
}

export function isTimeBound(goal: MentorshipGoal): boolean {
  const durDays = (goal.deadline - goal.createdAt) / MS_PER_DAY;
  return durDays >= MIN_GOAL_DURATION_DAYS && durDays <= MAX_GOAL_DURATION_DAYS;
}

// ---------- BUILDERS -----------------------------------------------------

export function buildGoal(input: {
  id: string;
  mentorshipId: string;
  title: string;
  metric: string;
  baseline: number;
  target: number;
  unit: string;
  relevance: string;
  deadline: number;
  createdAt: number;
}): MentorshipGoal {
  return {
    id: input.id,
    mentorshipId: input.mentorshipId,
    title: input.title,
    metric: input.metric,
    baseline: input.baseline,
    target: input.target,
    current: input.baseline,
    unit: input.unit,
    relevance: input.relevance,
    deadline: input.deadline,
    status: "active",
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
}

export function buildActionItem(input: {
  id: string;
  goalId: string;
  template: ActionItemTemplate;
  createdAt: number;
  dueOffsetDays?: number;
  title?: string;
  priority?: Priority;
  notes?: string;
}): ActionItem {
  const tpl = ACTION_ITEM_TEMPLATES[input.template];
  const offset = input.dueOffsetDays ?? tpl.defaultOffsetDays;
  return {
    id: input.id,
    goalId: input.goalId,
    title: input.title ?? tpl.title,
    template: input.template,
    status: "open",
    priority: input.priority ?? tpl.defaultPriority,
    dueAt: input.createdAt + offset * MS_PER_DAY,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    notes: input.notes,
  };
}

export function buildActionItemsForGoal(
  goal: MentorshipGoal,
  templates: ActionItemTemplate[],
  now: number
): ActionItem[] {
  return templates.map((tpl, idx) =>
    buildActionItem({
      id: `${goal.id}::ai::${idx}`,
      goalId: goal.id,
      template: tpl,
      createdAt: now,
    })
  );
}

// ---------- PROGRESS -----------------------------------------------------

export function expectedProgress(goal: MentorshipGoal, now: number): number {
  if (goal.deadline <= goal.createdAt) return 0;
  if (now <= goal.createdAt) return 0;
  if (now >= goal.deadline) return 1;
  return (now - goal.createdAt) / (goal.deadline - goal.createdAt);
}

export function goalProgressPct(goal: MentorshipGoal): number {
  const span = goal.target - goal.baseline;
  if (span === 0) return goal.current >= goal.target ? 100 : 0;
  const reached = (goal.current - goal.baseline) / span;
  return clampPct(reached * 100);
}

export function actionProgressPct(items: ActionItem[]): number {
  if (items.length === 0) return 0;
  let done = 0;
  for (const it of items) {
    if (it.status === "done") done += 1;
    if (it.status === "skipped") done += 0.5; // partial credit
  }
  return clampPct((done / items.length) * 100);
}

export function snapshotProgress(
  goal: MentorshipGoal,
  items: ActionItem[],
  now: number
): ProgressSnapshot {
  const percent = goalProgressPct(goal);
  const subProgress = actionProgressPct(items);
  const expected = expectedProgress(goal, now);
  const onTrack = percent / 100 >= expected * PROGRESS_ON_TRACK_THRESHOLD;
  const remaining = goal.target - goal.current;
  const isOverdue = now > goal.deadline && percent < 100;
  const daysToDeadline = Math.round((goal.deadline - now) / MS_PER_DAY);
  return {
    goalId: goal.id,
    percent: round1(percent),
    subProgress: round1(subProgress),
    onTrack,
    remaining,
    isOverdue,
    daysToDeadline,
  };
}

// ---------- CADENCE ------------------------------------------------------

export function suggestCadence(
  goal: MentorshipGoal,
  items: ActionItem[],
  lastCheckIn: number,
  now: number
): CadenceSuggestion {
  const snap = snapshotProgress(goal, items, now);
  const sinceCheckInDays = (now - lastCheckIn) / MS_PER_DAY;
  let interval = 7;
  let urgency: CadenceSuggestion["urgency"] = "low";
  let reason = "default weekly cadence";
  if (snap.isOverdue) {
    interval = 1;
    urgency = "high";
    reason = "goal overdue — daily check-in";
  } else if (!snap.onTrack && snap.daysToDeadline < 14) {
    interval = 2;
    urgency = "high";
    reason = "behind schedule with deadline near — every 2 days";
  } else if (!snap.onTrack) {
    interval = 3;
    urgency = "medium";
    reason = "behind schedule — every 3 days";
  } else if (snap.percent >= 100) {
    interval = 14;
    urgency = "low";
    reason = "goal achieved — bi-weekly celebration";
  } else if (snap.percent >= 75) {
    interval = 7;
    urgency = "low";
    reason = "near completion — weekly";
  }
  if (sinceCheckInDays > interval) {
    urgency = urgency === "low" ? "medium" : "high";
    reason += ` (last check-in was ${Math.round(sinceCheckInDays)}d ago)`;
  }
  return {
    intervalDays: Math.max(CADENCE_MIN_DAYS, Math.min(CADENCE_MAX_DAYS, interval)),
    reason,
    urgency,
  };
}

// ---------- AGGREGATES ---------------------------------------------------

export function summarizeGoals(goals: MentorshipGoal[], now: number): GoalSummary {
  const sum: GoalSummary = {
    total: goals.length,
    active: 0,
    achieved: 0,
    blocked: 0,
    averageProgress: 0,
    overdueGoals: 0,
    nextDeadline: null,
  };
  let totalPct = 0;
  for (const g of goals) {
    if (g.status === "active") sum.active += 1;
    if (g.status === "achieved") sum.achieved += 1;
    if (g.status === "blocked") sum.blocked += 1;
    if (g.deadline < now && g.status !== "achieved") sum.overdueGoals += 1;
    totalPct += goalProgressPct(g);
    if (g.status === "active" || g.status === "blocked") {
      if (sum.nextDeadline === null || g.deadline < sum.nextDeadline) {
        sum.nextDeadline = g.deadline;
      }
    }
  }
  sum.averageProgress = goals.length > 0 ? round1(totalPct / goals.length) : 0;
  return sum;
}

export function summarizeActionItems(
  items: ActionItem[],
  now: number
): ActionItemSummary {
  const byTemplate: Record<ActionItemTemplate, number> = {
    read_passage: 0,
    daily_reflection: 0,
    voice_practice: 0,
    study_session: 0,
    meditation_sitting: 0,
    journaling_prompt: 0,
    check_in_message: 0,
    read_recommended: 0,
    shadow_mentor_session: 0,
    apply_to_life: 0,
    ritual_practice: 0,
    share_with_community: 0,
  };
  const sum: ActionItemSummary = {
    total: items.length,
    open: 0,
    inProgress: 0,
    done: 0,
    skipped: 0,
    blocked: 0,
    overdue: 0,
    byTemplate,
  };
  for (const it of items) {
    switch (it.status) {
      case "open":
        sum.open += 1;
        break;
      case "in_progress":
        sum.inProgress += 1;
        break;
      case "done":
        sum.done += 1;
        break;
      case "skipped":
        sum.skipped += 1;
        break;
      case "blocked":
        sum.blocked += 1;
        break;
    }
    byTemplate[it.template] += 1;
    if (
      it.status !== "done" &&
      it.status !== "skipped" &&
      it.dueAt < now
    ) {
      sum.overdue += 1;
    }
  }
  return sum;
}

// ---------- INTERNAL -----------------------------------------------------

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function round1(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}
