// src/lib/w30/daily-reflection-push.ts
// Daily reflection push trigger — orchestrates w27/daily-reflection + w29/notifications-webpush
// Fires at user-configured hour, sends a personalized prompt via web-push

import type { DailyReflectionPrompt } from "../w27/daily-reflection";
import type { WebPushPayload } from "../w29/notifications-webpush";

export interface PushDeliveryResult {
  readonly userId: string;
  readonly delivered: boolean;
  readonly endpoint?: string;
  readonly errorCode?: number;
  readonly errorMessage?: string;
}

/** Build the web-push payload from a daily reflection prompt */
export function buildPushPayload(
  prompt: DailyReflectionPrompt,
  locale: string = "pt-BR",
): WebPushPayload {
  const isPt = locale.startsWith("pt");
  return {
    title: isPt ? "Reflexão do dia" : "Daily reflection",
    body: prompt.question,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    tag: `reflection-${prompt.dayOfYear}`,
    data: {
      url: `/akasha/reflection/${prompt.id}`,
      promptId: prompt.id,
    },
  };
}

/** Determine if a user is eligible for a push right now */
export function isPushEligible(
  now: Date,
  userPushHour: number, // 0-23
  userTimezoneOffsetMin: number, // minutes
  lastPushedAt: string | null,
): boolean {
  const localHour = (now.getUTCHours() + userTimezoneOffsetMin / 60 + 24) % 24;
  if (Math.floor(localHour) !== userPushHour) return false;
  if (lastPushedAt) {
    const last = new Date(lastPushedAt);
    const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 20) return false;
  }
  return true;
}

/** Deduplicate pushes per user per day (one reflection per day max) */
export function dedupePerDay(
  pendingUserIds: readonly string[],
  lastPushedAt: Readonly<Record<string, string>>,
  today: string, // YYYY-MM-DD
): readonly string[] {
  return pendingUserIds.filter((uid) => lastPushedAt[uid]?.startsWith(today) !== true);
}

/** Batch result aggregation */
export function summarizeDelivery(results: readonly PushDeliveryResult[]): {
  total: number;
  delivered: number;
  failed: number;
  failureRate: number;
} {
  const delivered = results.filter((r) => r.delivered).length;
  const failed = results.length - delivered;
  return {
    total: results.length,
    delivered,
    failed,
    failureRate: results.length === 0 ? 0 : failed / results.length,
  };
}
