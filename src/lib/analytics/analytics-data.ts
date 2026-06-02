// fallow-ignore-file unused-file
export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  sessionStart: number;
  userId?: string;
}

let analyticsData: AnalyticsData = {
  events: [],
  sessionStart: Date.now(),
};

export function getData(): AnalyticsData {
  return analyticsData;
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  analyticsData.events.push({
    id: crypto.randomUUID(),
    name,
    timestamp: Date.now(),
    properties: properties ?? {},
  });
}

export function setUserId(userId: string): void {
  analyticsData.userId = userId;
}

export function resetAnalytics(): void {
  analyticsData = {
    events: [],
    sessionStart: Date.now(),
  };
}