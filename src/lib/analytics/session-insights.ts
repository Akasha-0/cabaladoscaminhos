/**
 * Session insights — pattern analysis for user sessions
 */

export interface SessionEvent {
  id: string;
  userId?: string;
  type: 'start' | 'end' | 'action' | 'navigation';
  timestamp: number;
  path?: string;
  duration?: number;
  meta?: Record<string, unknown>;
}

export interface SessionInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  data?: Record<string, unknown>;
  generatedAt: number;
}

export interface SessionSummary {
  totalSessions: number;
  averageDuration: number;
  topPaths: string[];
  peakHours: number[];
  frequentActions: string[];
  patternsDetected: string[];
}

// Internal session storage
const sessions: SessionEvent[] = [];

// Session pattern detection thresholds
const PATTERN_THRESHOLDS = {
  minSessions: 5,
  anomalyRatio: 0.3,
  confidenceBase: 0.7,
};

/**
 * Track a session event
 */
export function trackSessionEvent(event: Omit<SessionEvent, 'id' | 'timestamp'>): SessionEvent {
  const sessionEvent: SessionEvent = {
    ...event,
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };
  sessions.push(sessionEvent);
  return sessionEvent;
}

/**
 * Detect patterns in session data
 */
function detectPatterns(events: SessionEvent[]): string[] {
  const patterns: string[] = [];

  if (events.length < PATTERN_THRESHOLDS.minSessions) {
    return patterns;
  }

  // Analyze time-based patterns
  const hourCounts: Record<number, number> = {};
  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([h]) => parseInt(h));

  if (peakHours.length > 0) {
    patterns.push(`peak-activity:${peakHours.join(',')}`);
  }

  // Detect navigation patterns
  const paths = events.filter((e) => e.path).map((e) => e.path!);
  const pathCounts: Record<string, number> = {};
  paths.forEach((p) => {
    pathCounts[p] = (pathCounts[p] || 0) + 1;
  });

  const topPath = Object.entries(pathCounts).sort(([, a], [, b]) => b - a)[0];
  if (topPath) {
    patterns.push(`frequent-path:${topPath[0]}`);
  }

  // Detect action patterns
  const actionTypes = events.filter((e) => e.type === 'action').map((e) => e.meta?.action as string);
  if (actionTypes.length > 0) {
    const actionCounts: Record<string, number> = {};
    actionTypes.forEach((a) => {
      if (a) actionCounts[a] = (actionCounts[a] || 0) + 1;
    });
    const topAction = Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0];
    if (topAction) {
      patterns.push(`common-action:${topAction[0]}`);
    }
  }

  // Detect session duration patterns
  const durations = events.filter((e) => e.duration).map((e) => e.duration!);
  if (durations.length > 3) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > avg * 0.5) {
      patterns.push('variable-duration');
    } else {
      patterns.push('consistent-duration');
    }
  }

  return patterns;
}

/**
 * Identify anomalies in session data
 */
function identifyAnomalies(events: SessionEvent[]): string[] {
  const anomalies: string[] = [];

  if (events.length < 10) return anomalies;

  const durations = events.filter((e) => e.duration).map((e) => e.duration!);
  if (durations.length > 5) {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const outliers = durations.filter((d) => Math.abs(d - avg) > avg * 2);

    if (outliers.length > durations.length * PATTERN_THRESHOLDS.anomalyRatio) {
      anomalies.push('duration-outliers');
    }
  }

  // Check for sudden session spikes
  const now = Date.now();
  const recentSessions = events.filter((e) => now - e.timestamp < 60000);
  const historicalAvg = events.length / ((now - events[0]?.timestamp) / 60000 || 1);

  if (recentSessions.length > historicalAvg * 3 && historicalAvg > 0) {
    anomalies.push('session-spike');
  }

  return anomalies;
}

/**
 * Generate recommendations based on patterns
 */
function generateRecommendations(patterns: string[], anomalies: string[]): string[] {
  const recommendations: string[] = [];

  if (patterns.includes('variable-duration')) {
    recommendations.push('Consider shorter, more focused sessions');
  }

  if (patterns.some((p) => p.startsWith('peak-activity:'))) {
    recommendations.push('Optimal engagement time identified for future content');
  }

  if (anomalies.includes('session-spike')) {
    recommendations.push('Monitor for bot-like behavior or unusual activity');
  }

  if (patterns.includes('inconsistent-patterns')) {
    recommendations.push('Encourage regular session patterns for better spiritual progress');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current session patterns for consistent spiritual growth');
  }

  return recommendations;
}

/**
 * Calculate session statistics
 */
function calculateStats(events: SessionEvent[]): SessionSummary {
  const totalSessions = events.filter((e) => e.type === 'start').length;

  const completedSessions = events.filter((e) => e.type === 'end' && e.duration);
  const durations = completedSessions.map((e) => e.duration!);
  const averageDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const paths = events.filter((e) => e.path).map((e) => e.path!);
  const pathCounts: Record<string, number> = {};
  paths.forEach((p) => {
    pathCounts[p] = (pathCounts[p] || 0) + 1;
  });
  const topPaths = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path]) => path);

  const hourCounts: Record<number, number> = {};
  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([h]) => parseInt(h));

  const actions = events.filter((e) => e.type === 'action' && e.meta?.action);
  const actionCounts: Record<string, number> = {};
  actions.forEach((e) => {
    const action = e.meta?.action as string;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });
  const frequentActions = Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([action]) => action);

  const patterns = detectPatterns(events);

  return {
    totalSessions,
    averageDuration: Math.round(averageDuration),
    topPaths,
    peakHours,
    frequentActions,
    patternsDetected: patterns,
  };
}

/**
 * Get comprehensive session insights
 */
export function getInsights(userId?: string): {
  summary: SessionSummary;
  insights: SessionInsight[];
  patterns: string[];
  anomalies: string[];
} {
  const filteredEvents = userId
    ? sessions.filter((e) => e.userId === userId)
    : sessions;

  const patterns = detectPatterns(filteredEvents);
  const anomalies = identifyAnomalies(filteredEvents);
  const recommendations = generateRecommendations(patterns, anomalies);
  const summary = calculateStats(filteredEvents);

  const confidence = Math.min(
    PATTERN_THRESHOLDS.confidenceBase + (filteredEvents.length / 100) * 0.2,
    0.95
  );

  const insights: SessionInsight[] = [
    {
      id: `insight-${Date.now()}-pattern`,
      type: 'pattern',
      title: patterns.length > 0 ? 'Session Patterns Detected' : 'Insufficient Data',
      description: patterns.length > 0
        ? `Identified ${patterns.length} session patterns including ${patterns[0]}`
        : 'More session data needed to detect meaningful patterns',
      confidence: patterns.length > 0 ? confidence : 0.3,
      data: { patterns },
      generatedAt: Date.now(),
    },
    {
      id: `insight-${Date.now()}-trend`,
      type: 'trend',
      title: 'Session Trends',
      description: summary.totalSessions > 0
        ? `Total of ${summary.totalSessions} sessions with ${Math.round(summary.averageDuration)}s average duration`
        : 'No sessions recorded yet',
      confidence: summary.totalSessions > 0 ? confidence : 0.1,
      data: { totalSessions: summary.totalSessions, averageDuration: summary.averageDuration },
      generatedAt: Date.now(),
    },
    ...(anomalies.length > 0 ? [{
      id: `insight-${Date.now()}-anomaly`,
      type: 'anomaly' as const,
      title: 'Anomalies Detected',
      description: `Found ${anomalies.length} potential anomalies requiring attention`,
      confidence: 0.6,
      data: { anomalies },
      generatedAt: Date.now(),
    }] : []),
    ...recommendations.map((rec, i) => ({
      id: `insight-${Date.now()}-rec-${i}`,
      type: 'recommendation' as const,
      title: 'Recommendation',
      description: rec,
      confidence: 0.75,
      generatedAt: Date.now(),
    })),
  ];

  return {
    summary,
    insights,
    patterns,
    anomalies,
  };
}

/**
 * Reset session data (for testing only)
 */
export function _resetSessions(): void {
  sessions.length = 0;
}