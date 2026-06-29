// src/lib/w38/notifications-digest-preview.ts
// Show digest content before send to allow editing. Uses the new time-aware identifyStaleReason.
// Composes: w35/notifications-digest-mode (RawNotification, DigestItem, DigestConfig, buildDigests),
//           w36/w36-notifications-escalation-v2 (StaleReason, identifyStaleReason with now param),
//           w32/push-prefs-ui (PushPreferences, channel filtering)

export type NotificationKind =
  | "comment_reply"
  | "comment_mention"
  | "follow"
  | "badge_earned"
  | "streak_reminder"
  | "leitura_recommendation"
  | "mentorship_session"
  | "mentorship_request"
  | "marketplace_purchase"
  | "wishlist_price_drop"
  | "event_invitation"
  | "system_announcement";

export type NotificationChannel = "push" | "email" | "in_app" | "suppressed";

export interface PushPreferences {
  userId: string;
  enabledKinds: NotificationKind[];
  quietHoursStart: number; // 0..23
  quietHoursEnd: number; // 0..23
  preferredChannels: NotificationChannel[];
  digestEnabled: boolean;
}

export interface RawNotification {
  notificationId: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  contextId: string | null;
  createdAt: number;
  readAt: number | null;
  ackedAt: number | null;
  deliveredAt: number | null;
  channel: NotificationChannel;
  source: string;
  priority: "low" | "normal" | "high";
}

export type DigestAction = "keep" | "remove" | "stale" | "edit";

export interface DigestItem {
  itemId: string;
  notification: RawNotification;
  action: DigestAction;
  editedTitle: string | null;
  editedBody: string | null;
  order: number;
}

export interface DigestConfig {
  windowMs: number;
  maxItems: number;
  quietHoursStart: number;
  quietHoursEnd: number;
  bundleableKinds: NotificationKind[];
  allowChannels: NotificationChannel[];
}

export type StaleReason = "delivered_unread" | "delivered_unack" | "never_delivered" | "unread_long" | null;

export const DEFAULT_DIGEST_PREVIEW_CONFIG = {
  maxTitleLength: 120,
  maxBodyLength: 500,
  maxItems: 20,
  staleAgeMin: 60,
  unackAgeMin: 30,
  neverDeliveredAgeMin: 120,
};

export function isWithinQuietHours(now: number, startHour: number, endHour: number): boolean {
  const hour = new Date(now).getUTCHours();
  if (startHour <= endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

export function ageMinutes(notification: RawNotification, now: number): number {
  return Math.floor((now - notification.createdAt) / 60000);
}

export function identifyStaleReason(notification: RawNotification, now: number): StaleReason {
  const ageMin = ageMinutes(notification, now);
  if (notification.deliveredAt === null && ageMin >= DEFAULT_DIGEST_PREVIEW_CONFIG.neverDeliveredAgeMin) {
    return "never_delivered";
  }
  if (notification.deliveredAt !== null) {
    if (notification.ackedAt === null && ageMin >= DEFAULT_DIGEST_PREVIEW_CONFIG.unackAgeMin) {
      return "delivered_unack";
    }
    if (notification.readAt === null && ageMin >= DEFAULT_DIGEST_PREVIEW_CONFIG.staleAgeMin) {
      return "delivered_unread";
    }
  }
  if (ageMin >= DEFAULT_DIGEST_PREVIEW_CONFIG.staleAgeMin * 4) {
    return "unread_long";
  }
  return null;
}

export function isStaleForDigest(notification: RawNotification, now: number): boolean {
  return identifyStaleReason(notification, now) !== null;
}

export function buildDigestItem(
  notification: RawNotification,
  now: number,
  action: DigestAction = "keep",
  order: number = 0,
): DigestItem {
  return {
    itemId: `item-${notification.notificationId}`,
    notification,
    action,
    editedTitle: null,
    editedBody: null,
    order,
  };
}

export function filterNotificationsForDigest(
  notifications: RawNotification[],
  config: DigestConfig,
  prefs: PushPreferences,
  now: number,
): RawNotification[] {
  if (!prefs.digestEnabled) return [];
  return notifications.filter((n) => {
    if (n.userId !== prefs.userId) return false;
    if (n.channel === "suppressed") return false;
    if (!prefs.enabledKinds.includes(n.kind)) return false;
    if (!config.allowChannels.includes(n.channel)) return false;
    if (now - n.createdAt > config.windowMs) return false;
    return true;
  });
}

export function buildDigestItems(
  notifications: RawNotification[],
  now: number,
  maxItems: number = DEFAULT_DIGEST_PREVIEW_CONFIG.maxItems,
): DigestItem[] {
  const items: DigestItem[] = [];
  const sorted = [...notifications].sort((a, b) => b.createdAt - a.createdAt);
  for (let i = 0; i < Math.min(sorted.length, maxItems); i++) {
    const n = sorted[i];
    const stale = isStaleForDigest(n, now);
    const action: DigestAction = stale ? "stale" : "keep";
    items.push(buildDigestItem(n, now, action, i));
  }
  return items;
}

export function editDigestItem(
  item: DigestItem,
  newTitle: string | null,
  newBody: string | null,
): DigestItem {
  if (newTitle !== null && newTitle.length > DEFAULT_DIGEST_PREVIEW_CONFIG.maxTitleLength) {
    return { ...item, action: "edit", editedTitle: newTitle.slice(0, DEFAULT_DIGEST_PREVIEW_CONFIG.maxTitleLength) };
  }
  if (newBody !== null && newBody.length > DEFAULT_DIGEST_PREVIEW_CONFIG.maxBodyLength) {
    return { ...item, action: "edit", editedBody: newBody.slice(0, DEFAULT_DIGEST_PREVIEW_CONFIG.maxBodyLength) };
  }
  return {
    ...item,
    action: "edit",
    editedTitle: newTitle ?? item.editedTitle,
    editedBody: newBody ?? item.editedBody,
  };
}

export function removeDigestItem(item: DigestItem): DigestItem {
  return { ...item, action: "remove" };
}

export function restoreDigestItem(item: DigestItem): DigestItem {
  const action: DigestAction = isStaleForDigest(item.notification, Date.now()) ? "stale" : "keep";
  return { ...item, action, editedTitle: null, editedBody: null };
}

export function applyItemActions(
  items: DigestItem[],
): { kept: DigestItem[]; removed: DigestItem[]; stale: DigestItem[]; edited: DigestItem[] } {
  const kept: DigestItem[] = [];
  const removed: DigestItem[] = [];
  const stale: DigestItem[] = [];
  const edited: DigestItem[] = [];
  for (const item of items) {
    switch (item.action) {
      case "keep": kept.push(item); break;
      case "remove": removed.push(item); break;
      case "stale": stale.push(item); break;
      case "edit": edited.push(item); kept.push(item); break;
    }
  }
  return { kept, removed, stale, edited };
}

export interface DigestPreview {
  previewId: string;
  userId: string;
  generatedAt: number;
  items: DigestItem[];
  keptItems: DigestItem[];
  removedItems: DigestItem[];
  staleItems: DigestItem[];
  editedItems: DigestItem[];
  totalOriginal: number;
  totalKept: number;
  totalRemoved: number;
  totalStale: number;
  totalEdited: number;
  previewText: string;
  estimatedSendAt: number;
}

export function renderItemLine(item: DigestItem): string {
  const n = item.notification;
  const title = item.editedTitle ?? n.title;
  const body = item.editedBody ?? n.body;
  const tag = item.action === "stale" ? "[STALE]" : item.action === "edit" ? "[EDITED]" : "";
  return `${tag} ${title} — ${body}`;
}

export function buildPreviewText(items: DigestItem[]): string {
  if (items.length === 0) return "Digest preview: no items.";
  const lines: string[] = [`Digest preview (${items.length} items):`];
  for (let i = 0; i < items.length; i++) {
    lines.push(`${i + 1}. ${renderItemLine(items[i])}`);
  }
  return lines.join("\n");
}

export function estimateSendTime(now: number, prefs: PushPreferences): number {
  if (!isWithinQuietHours(now, prefs.quietHoursStart, prefs.quietHoursEnd)) {
    return now + 60 * 60 * 1000;
  }
  const hour = new Date(now).getUTCHours();
  const target = prefs.quietHoursEnd > hour ? prefs.quietHoursEnd : prefs.quietHoursEnd + 24;
  const targetMs = new Date(now).setUTCHours(target, 0, 0, 0);
  return targetMs;
}

export function buildDigestPreview(
  userId: string,
  notifications: RawNotification[],
  config: DigestConfig,
  prefs: PushPreferences,
  now: number,
): DigestPreview {
  const filtered = filterNotificationsForDigest(notifications, config, prefs, now);
  const items = buildDigestItems(filtered, now, config.maxItems);
  const split = applyItemActions(items);
  const previewText = buildPreviewText(split.kept);
  return {
    previewId: `preview-${userId}-${now}`,
    userId,
    generatedAt: now,
    items,
    keptItems: split.kept,
    removedItems: split.removed,
    staleItems: split.stale,
    editedItems: split.edited,
    totalOriginal: notifications.length,
    totalKept: split.kept.length,
    totalRemoved: split.removed.length,
    totalStale: split.stale.length,
    totalEdited: split.edited.length,
    previewText,
    estimatedSendAt: estimateSendTime(now, prefs),
  };
}

export function commitDigestPreview(
  preview: DigestPreview,
): { kept: DigestItem[]; removed: DigestItem[] } {
  return { kept: preview.keptItems, removed: preview.removedItems };
}

export function summarizeDigestPreview(preview: DigestPreview): string {
  return [
    `digest-preview[${preview.userId}]:`,
    `orig=${preview.totalOriginal}`,
    `kept=${preview.totalKept}`,
    `removed=${preview.totalRemoved}`,
    `stale=${preview.totalStale}`,
    `edited=${preview.totalEdited}`,
    `send_at=${new Date(preview.estimatedSendAt).toISOString()}`,
  ].join(" | ");
}
