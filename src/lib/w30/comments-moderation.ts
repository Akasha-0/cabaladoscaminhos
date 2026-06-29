// src/lib/w30/comments-moderation.ts
// Comments moderation queue — flags + actions + audit log
// Extends w29/comments-threading with moderator-only actions

export type ModerationFlag =
  | "spam"
  | "harassment"
  | "tradition-misrepresentation"
  | "unsafe-content"
  | "off-topic"
  | "duplicate";

export type ModerationAction =
  | "approve"
  | "remove"
  | "shadow-hide"
  | "warn-author"
  | "escalate";

export type ModerationStatus = "pending" | "approved" | "removed" | "escalated";

export interface ModerationItem {
  readonly id: string;
  readonly commentId: string;
  readonly flags: readonly ModerationFlag[];
  readonly status: ModerationStatus;
  readonly reportedBy: readonly string[];
  readonly assignedModerator?: string;
  readonly createdAt: string; // ISO
  readonly resolvedAt?: string;
  readonly action?: ModerationAction;
  readonly notes?: string;
}

/** Default queue sort: most-reported first, oldest pending first within ties */
export function sortModerationQueue(items: readonly ModerationItem[]): readonly ModerationItem[] {
  return [...items].sort((a, b) => {
    const aPending = a.status === "pending" ? 0 : 1;
    const bPending = b.status === "pending" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    const aReports = a.reportedBy.length;
    const bReports = b.reportedBy.length;
    if (aReports !== bReports) return bReports - aReports;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

/** Apply a moderation action and freeze the audit field */
export function applyAction(
  item: ModerationItem,
  action: ModerationAction,
  moderatorId: string,
  notes?: string,
): ModerationItem {
  const status: ModerationStatus =
    action === "approve" ? "approved" :
    action === "remove" ? "removed" :
    action === "escalate" ? "escalated" :
    item.status;
  return {
    ...item,
    action,
    status,
    assignedModerator: moderatorId,
    resolvedAt: new Date().toISOString(),
    notes,
  };
}

/** Count open items by flag (for dashboard) */
export function flagBreakdown(
  items: readonly ModerationItem[],
): Record<ModerationFlag, number> {
  const counts: Record<ModerationFlag, number> = {
    spam: 0,
    harassment: 0,
    "tradition-misrepresentation": 0,
    "unsafe-content": 0,
    "off-topic": 0,
    duplicate: 0,
  };
  for (const item of items) {
    if (item.status !== "pending") continue;
    for (const flag of item.flags) counts[flag]++;
  }
  return counts;
}
