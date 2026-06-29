// src/lib/w33/mentorship-session-detail.ts
// Cycle 33 worker D — mentorship session detail page helpers
// Composes w29/mentorship-matching + w25/mentorship-pairing
// Scope: session view model, notes, action items, agenda builder, follow-up
// Namespace: w33 — self-contained, type-only deps on other waves

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
export type SessionFormat = "video" | "audio" | "chat" | "in_person";
export type ActionItemStatus = "pending" | "in_progress" | "done" | "cancelled";

export interface MentorProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly bio: string;
  readonly traditions: ReadonlyArray<string>;
  readonly yearsOfPractice: number;
  readonly totalSessionsCompleted: number;
  readonly averageRating: number; // 0-5
  readonly responseTimeHours: number;
  readonly languages: ReadonlyArray<string>;
  readonly isAvailable: boolean;
}

export interface MenteeProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly seekingTraditions: ReadonlyArray<string>;
  readonly goals: ReadonlyArray<string>;
  readonly experienceLevel: "beginner" | "intermediate" | "advanced";
  readonly preferredFormat: ReadonlyArray<SessionFormat>;
}

export interface SessionNote {
  readonly id: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: number;
  readonly visibility: "shared" | "private_to_mentor" | "private_to_mentee";
}

export interface ActionItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly assignedTo: string;
  readonly dueAt: number | null;
  readonly status: ActionItemStatus;
  readonly createdAt: number;
  readonly completedAt: number | null;
}

export interface SessionRecord {
  readonly id: string;
  readonly mentorId: string;
  readonly menteeId: string;
  readonly scheduledAt: number;
  readonly durationMinutes: number;
  readonly format: SessionFormat;
  readonly status: SessionStatus;
  readonly topic: string;
  readonly agenda: ReadonlyArray<string>;
  readonly notes: ReadonlyArray<SessionNote>;
  readonly actionItems: ReadonlyArray<ActionItem>;
  readonly joinedAt: number | null;
  readonly endedAt: number | null;
  readonly ratingFromMentee: number | null; // 1-5
  readonly ratingFromMentor: number | null;
}

export interface SessionViewModel {
  readonly session: SessionRecord;
  readonly mentor: MentorProfile;
  readonly mentee: MenteeProfile;
  readonly canJoin: boolean;
  readonly canEditNotes: boolean;
  readonly pendingActionItems: ReadonlyArray<ActionItem>;
  readonly isOverdue: boolean;
  readonly minutesUntilStart: number;
  readonly durationLabel: string;
}

const JOIN_WINDOW_MINUTES = 10;

export function buildSessionViewModel(
  session: SessionRecord,
  mentor: MentorProfile,
  mentee: MenteeProfile,
  currentUserId: string,
  now: number,
): SessionViewModel {
  const minutesUntilStart = Math.round((session.scheduledAt - now) / 60000);
  const canJoin =
    session.status === "scheduled" &&
    Math.abs(minutesUntilStart) <= JOIN_WINDOW_MINUTES;
  const canEditNotes =
    (currentUserId === mentor.userId || currentUserId === mentee.userId) &&
    (session.status === "in_progress" || session.status === "completed");
  const pendingActionItems = session.actionItems.filter(
    (a) => a.status === "pending" || a.status === "in_progress",
  );
  const isOverdue = session.status === "scheduled" && minutesUntilStart < -JOIN_WINDOW_MINUTES;
  return {
    session,
    mentor,
    mentee,
    canJoin,
    canEditNotes,
    pendingActionItems,
    isOverdue,
    minutesUntilStart,
    durationLabel: formatDuration(session.durationMinutes),
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, "0")}`;
}

export interface AgendaBuilder {
  readonly totalMinutes: number;
  readonly blocks: ReadonlyArray<AgendaBlock>;
  readonly overrun: boolean;
}

export interface AgendaBlock {
  readonly title: string;
  readonly minutes: number;
  readonly order: number;
  readonly isOptional: boolean;
}

export function buildAgenda(
  topic: string,
  blocks: ReadonlyArray<{ title: string; minutes: number; isOptional?: boolean }>,
  totalSessionMinutes: number,
): AgendaBuilder {
  const used = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const ordered = blocks
    .map((b, i) => ({ title: b.title, minutes: b.minutes, order: i, isOptional: b.isOptional ?? false }))
    .sort((a, b) => a.order - b.order);
  return {
    totalMinutes: used,
    blocks: ordered,
    overrun: used > totalSessionMinutes,
  };
}

export function validateNote(
  body: string,
  maxLength: number = 5000,
): { valid: boolean; reason: "empty" | "too_long" | "ok" } {
  const trimmed = body.trim();
  if (trimmed.length === 0) return { valid: false, reason: "empty" };
  if (trimmed.length > maxLength) return { valid: false, reason: "too_long" };
  return { valid: true, reason: "ok" };
}

export interface ActionItemCompletion {
  readonly updatedItem: ActionItem;
  readonly isCompletedNow: boolean;
  readonly completionRatio: number; // 0-1
}

export function completeActionItem(item: ActionItem, now: number): ActionItemCompletion {
  return {
    updatedItem: { ...item, status: "done", completedAt: now },
    isCompletedNow: true,
    completionRatio: 1,
  };
}

export function actionItemProgress(items: ReadonlyArray<ActionItem>): {
  total: number;
  done: number;
  pending: number;
  inProgress: number;
  ratio: number;
} {
  const total = items.length;
  const done = items.filter((a) => a.status === "done").length;
  const pending = items.filter((a) => a.status === "pending").length;
  const inProgress = items.filter((a) => a.status === "in_progress").length;
  return {
    total,
    done,
    pending,
    inProgress,
    ratio: total === 0 ? 1 : done / total,
  };
}

export function suggestFollowUpInterval(
  rating: number | null,
  actionItemRatio: number,
): { days: number; reason: "high_engagement" | "standard" | "needs_followup" | "low_engagement" } {
  if (rating !== null && rating >= 4 && actionItemRatio >= 0.7) {
    return { days: 14, reason: "high_engagement" };
  }
  if (actionItemRatio < 0.3) {
    return { days: 7, reason: "low_engagement" };
  }
  if (rating !== null && rating <= 2) {
    return { days: 7, reason: "needs_followup" };
  }
  return { days: 21, reason: "standard" };
}
