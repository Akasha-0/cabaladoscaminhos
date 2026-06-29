// src/lib/w32/comments-moderation-ui.ts
// Cycle 32 worker B — comments moderation UI surface (client helpers)
// Composes w29/comments-threading (thread shape) + w30/comments-moderation (queue shape)
// Scope: filters, sort, batch actions, reason modal, status pill
// Namespace: w32 — self-contained, type-only deps on other waves

export type ModerationView = "queue" | "history" | "appeals";
export type ModerationSort = "newest" | "oldest" | "most_reported" | "highest_risk";
export type ModerationStatusFilter = "pending" | "approved" | "removed" | "escalated" | "all";

export interface ModerationReason {
  readonly code:
    | "spam"
    | "harassment"
    | "hate_speech"
    | "misinformation"
    | "off_topic"
    | "self_harm"
    | "illegal"
    | "other";
  readonly label: string;
  readonly requiresNote: boolean;
  readonly autoHide: boolean;
}

export const MODERATION_REASONS: ReadonlyArray<ModerationReason> = [
  { code: "spam", label: "Spam ou propaganda", requiresNote: false, autoHide: true },
  { code: "harassment", label: "Assédio ou bullying", requiresNote: true, autoHide: true },
  { code: "hate_speech", label: "Discurso de ódio", requiresNote: true, autoHide: true },
  { code: "misinformation", label: "Desinformação", requiresNote: true, autoHide: false },
  { code: "off_topic", label: "Fora do tema", requiresNote: false, autoHide: false },
  { code: "self_harm", label: "Autoagressão", requiresNote: true, autoHide: true },
  { code: "illegal", label: "Atividade ilegal", requiresNote: true, autoHide: true },
  { code: "other", label: "Outro (descrever)", requiresNote: true, autoHide: false },
];

export interface ModerationItemDisplay {
  readonly id: string;
  readonly authorDisplayName: string;
  readonly authorReputationLevel: number; // 0-10
  readonly excerpt: string; // truncated body
  readonly fullBody: string;
  readonly threadDepth: number; // 0 = top-level
  readonly reportCount: number;
  readonly riskScore: number; // 0-100
  readonly ageMinutes: number;
  readonly isFromVerifiedAuthor: boolean;
}

export interface ModerationQueueFilter {
  readonly view: ModerationView;
  readonly status: ModerationStatusFilter;
  readonly sort: ModerationSort;
  readonly searchQuery: string;
  readonly minReportCount: number;
  readonly minRiskScore: number;
}

export const DEFAULT_MODERATION_FILTER: ModerationQueueFilter = {
  view: "queue",
  status: "pending",
  sort: "newest",
  searchQuery: "",
  minReportCount: 0,
  minRiskScore: 0,
};

/** Apply filter to a list of moderation items. */
export function applyModerationFilter(
  items: ReadonlyArray<ModerationItemDisplay>,
  filter: ModerationQueueFilter,
): ReadonlyArray<ModerationItemDisplay> {
  const q = filter.searchQuery.trim().toLowerCase();
  return items.filter((it) => {
    if (it.reportCount < filter.minReportCount) return false;
    if (it.riskScore < filter.minRiskScore) return false;
    if (q.length > 0) {
      const haystack = `${it.authorDisplayName} ${it.excerpt} ${it.fullBody}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Sort moderation items per the active sort mode. */
export function sortModerationItems(
  items: ReadonlyArray<ModerationItemDisplay>,
  sort: ModerationSort,
): ReadonlyArray<ModerationItemDisplay> {
  const copy = items.slice();
  switch (sort) {
    case "newest":
      copy.sort((a, b) => a.ageMinutes - b.ageMinutes);
      break;
    case "oldest":
      copy.sort((a, b) => b.ageMinutes - a.ageMinutes);
      break;
    case "most_reported":
      copy.sort((a, b) => b.reportCount - a.reportCount);
      break;
    case "highest_risk":
      copy.sort((a, b) => b.riskScore - a.riskScore);
      break;
  }
  return copy;
}

export interface BatchAction {
  readonly type: "approve" | "remove" | "escalate" | "dismiss_reports";
  readonly itemIds: ReadonlyArray<string>;
  readonly reasonCode: ModerationReason["code"] | null;
  readonly note: string;
}

/** Validate a batch action before submission. */
export function validateBatchAction(
  action: BatchAction,
): { ok: true } | { ok: false; error: string } {
  if (action.itemIds.length === 0) {
    return { ok: false, error: "selecione pelo menos um item" };
  }
  if (action.itemIds.length > 100) {
    return { ok: false, error: "máximo de 100 itens por ação" };
  }
  if ((action.type === "remove" || action.type === "escalate") && !action.reasonCode) {
    return { ok: false, error: "ação requer motivo" };
  }
  if (action.reasonCode) {
    const reason = MODERATION_REASONS.find((r) => r.code === action.reasonCode);
    if (!reason) return { ok: false, error: "motivo inválido" };
    if (reason.requiresNote && action.note.trim().length < 5) {
      return { ok: false, error: `${reason.label} requer nota explicativa` };
    }
  }
  return { ok: true };
}

/** Build the status pill color/label for a moderation status. */
export function moderationStatusPill(
  status: ModerationStatusFilter,
): { label: string; tone: "neutral" | "info" | "warn" | "danger" | "success" } {
  switch (status) {
    case "pending":
      return { label: "Pendente", tone: "warn" };
    case "approved":
      return { label: "Aprovado", tone: "success" };
    case "removed":
      return { label: "Removido", tone: "danger" };
    case "escalated":
      return { label: "Escalado", tone: "info" };
    case "all":
      return { label: "Todos", tone: "neutral" };
  }
}

/** Compute risk-tier label from a 0-100 risk score. */
export function riskTier(score: number): { label: string; tone: "low" | "medium" | "high" | "critical" } {
  if (score < 20) return { label: "Baixo", tone: "low" };
  if (score < 50) return { label: "Médio", tone: "medium" };
  if (score < 80) return { label: "Alto", tone: "high" };
  return { label: "Crítico", tone: "critical" };
}

/** Truncate body to an excerpt for the moderation list view. */
export function buildExcerpt(body: string, maxLength: number = 140): string {
  const collapsed = body.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  return collapsed.slice(0, maxLength - 1) + "…";
}
