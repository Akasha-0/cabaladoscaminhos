// fallow-ignore-file unused-file
/**
 * Profile analytics — engagement tracking for user profiles.
 */

export interface AnalyticsEvent {
  type: string;
  profileId: string;
  userId?: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export interface ProfileAnalytics {
  profileId: string;
  views: number;
  shares: number;
  completions: number;
  engagementRate: number;
  lastUpdated: number;
}

const events: AnalyticsEvent[] = [];

/**
 * Track an analytics event for a profile.
 */
export function trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
  events.push({ ...event, timestamp: Date.now() });
}

/**
 * Retrieve analytics for a given profile.
 */
export function getAnalytics(profileId: string): ProfileAnalytics {
  const profileEvents = events.filter((e) => e.profileId === profileId);
  const views = profileEvents.filter((e) => e.type === 'view').length;
  const shares = profileEvents.filter((e) => e.type === 'share').length;
  const completions = profileEvents.filter((e) => e.type === 'complete').length;

  const total = views + shares + completions;
  const engagementRate = total > 0 ? (completions / total) * 100 : 0;

  return {
    profileId,
    views,
    shares,
    completions,
    engagementRate: Math.round(engagementRate * 100) / 100,
    lastUpdated: profileEvents.length > 0
      ? Math.max(...profileEvents.map((e) => e.timestamp))
      : Date.now(),
  };
}

/**
 * Reset analytics state (for testing only).
 */
export function _resetAnalytics(): void {
  events.length = 0;
}
