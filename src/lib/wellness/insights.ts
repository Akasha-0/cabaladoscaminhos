/**
 * Wellness insights — pattern analysis for user wellness data
 */

// Wellness categories
export type WellnessCategory = 
  | 'meditation'
  | 'ritual'
  | 'sleep'
  | 'exercise'
  | 'nutrition'
  | 'mindfulness';

export interface WellnessEvent {
  id: string;
  userId: string;
  category: WellnessCategory;
  timestamp: Date;
  duration?: number;
  completed: boolean;
  mood?: number;
}

export interface WellnessInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'recommendation';
  category: WellnessCategory;
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
}

export interface WellnessPattern {
  category: WellnessCategory;
  frequency: number;
  averageDuration: number;
  streakDays: number;
  consistency: number;
  trends: 'improving' | 'stable' | 'declining';
}

export interface WellnessSummary {
  totalEvents: number;
  activeDays: number;
  topCategory: WellnessCategory;
  patterns: WellnessPattern[];
  insights: WellnessInsight[];
  streak: number;
  wellnessScore: number;
}

// Internal wellness storage
const events: WellnessEvent[] = [];

// Pattern detection thresholds
const THRESHOLDS = {
  minFrequency: 2,
  minStreak: 3,
  highConsistency: 0.7,
  lowConsistency: 0.3,
  improvingTrend: 0.2,
  decliningTrend: -0.2,
};

/**
 * Add a wellness event
 */
export function addWellnessEvent(
  event: Omit<WellnessEvent, 'id' | 'timestamp'>
): WellnessEvent {
  const newEvent: WellnessEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
  events.push(newEvent);
  return newEvent;
}

/**
 * Get events for a user in a time range
 */
function getUserEvents(
  userId: string,
  startDate?: Date,
  endDate?: Date
): WellnessEvent[] {
  return events.filter((e) => {
    if (e.userId !== userId) return false;
    if (startDate && e.timestamp < startDate) return false;
    if (endDate && e.timestamp > endDate) return false;
    return true;
  });
}

/**
 * Detect patterns in wellness data
 */
function detectPatterns(events: WellnessEvent[]): WellnessPattern[] {
  const byCategory = new Map<WellnessCategory, WellnessEvent[]>();

  for (const event of events) {
    const existing = byCategory.get(event.category) || [];
    existing.push(event);
    byCategory.set(event.category, existing);
  }

  const patterns: WellnessPattern[] = [];

  for (const [category, categoryEvents] of byCategory) {
    if (categoryEvents.length < THRESHOLDS.minFrequency) continue;

    const sorted = [...categoryEvents].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const durations = categoryEvents
      .map((e) => e.duration)
      .filter((d): d is number => d !== undefined);

    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    const streakDays = calculateStreak(sorted);
    const consistency = calculateConsistency(sorted);
    const trends = calculateTrend(sorted);

    patterns.push({
      category,
      frequency: categoryEvents.length,
      averageDuration: avgDuration,
      streakDays,
      consistency,
      trends,
    });
  }

  return patterns;
}

/**
 * Calculate consecutive day streak
 */
function calculateStreak(sortedEvents: WellnessEvent[]): number {
  if (sortedEvents.length === 0) return 0;

  const uniqueDays = new Set<string>();
  for (const event of sortedEvents) {
    const day = event.timestamp.toISOString().split('T')[0];
    uniqueDays.add(day);
  }

  const sortedDays = [...uniqueDays].sort();
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.floor(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Calculate consistency score (0-1)
 */
function calculateConsistency(events: WellnessEvent[]): number {
  if (events.length < 2) return 0;

  const sorted = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  const first = sorted[0].timestamp.getTime();
  const last = sorted[sorted.length - 1].timestamp.getTime();
  const span = last - first;

  if (span === 0) return 1;

  const days = span / (1000 * 60 * 60 * 24);
  const expectedFrequency = events.length / Math.max(days, 1);

  return Math.min(expectedFrequency / 2, 1);
}

/**
 * Calculate trend direction
 */
function calculateTrend(events: WellnessEvent[]): 'improving' | 'stable' | 'declining' {
  if (events.length < 3) return 'stable';

  const sorted = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, e) => sum + (e.duration || 0), 0) / firstHalf.length
    : 0;
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, e) => sum + (e.duration || 0), 0) / secondHalf.length
    : 0;

  if (secondAvg - firstAvg > THRESHOLDS.improvingTrend) return 'improving';
  if (firstAvg - secondAvg > THRESHOLDS.decliningTrend) return 'declining';
  return 'stable';
}

/**
 * Identify anomalies in wellness data
 */
function identifyAnomalies(events: WellnessEvent[]): WellnessInsight[] {
  const insights: WellnessInsight[] = [];

  if (events.length < 2) return insights;

  const byCategory = new Map<WellnessCategory, WellnessEvent[]>();
  for (const event of events) {
    const existing = byCategory.get(event.category) || [];
    existing.push(event);
    byCategory.set(event.category, existing);
  }

  for (const [category, categoryEvents] of byCategory) {
    const durations = categoryEvents
      .map((e) => e.duration)
      .filter((d): d is number => d !== undefined);

    if (durations.length < 2) continue;

    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance =
      durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
      durations.length;
    const stdDev = Math.sqrt(variance);

    for (const event of categoryEvents) {
      if (event.duration !== undefined && Math.abs(event.duration - mean) > stdDev * 2) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'anomaly',
          category,
          title: `Unusual ${category} duration detected`,
          description: `This ${category} session was significantly ${event.duration > mean ? 'longer' : 'shorter'} than your typical ${category} practice.`,
          confidence: 0.85,
          timestamp: event.timestamp,
        });
      }
    }
  }

  return insights;
}

/**
 * Generate recommendations based on patterns
 */
function generateRecommendations(patterns: WellnessPattern[]): WellnessInsight[] {
  const recommendations: WellnessInsight[] = [];

  for (const pattern of patterns) {
    if (pattern.trends === 'declining') {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        category: pattern.category,
        title: `Re-engage with ${pattern.category} practice`,
        description: `Your ${pattern.category} practice has been declining. Consider setting a small, achievable goal to rebuild your habit.`,
        confidence: 0.8,
        timestamp: new Date(),
      });
    }

    if (pattern.streakDays >= THRESHOLDS.minStreak) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        category: pattern.category,
        title: `Maintain your ${pattern.category} momentum`,
        description: `You've maintained a ${pattern.streakDays}-day streak in ${pattern.category}. Keep going!`,
        confidence: 0.9,
        timestamp: new Date(),
      });
    }

    if (pattern.consistency < THRESHOLDS.lowConsistency && pattern.frequency > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        category: pattern.category,
        title: `Improve ${pattern.category} consistency`,
        description: `Your ${pattern.category} practice would benefit from a more regular schedule. Try to practice at the same time each day.`,
        confidence: 0.75,
        timestamp: new Date(),
      });
    }
  }

  const categoryCounts = new Map<WellnessCategory, number>();
  for (const pattern of patterns) {
    categoryCounts.set(pattern.category, pattern.frequency);
  }

  const sortedCategories = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  if (sortedCategories.length > 1) {
    const leastUsed = sortedCategories[sortedCategories.length - 1];
    recommendations.push({
      id: crypto.randomUUID(),
      type: 'recommendation',
      category: leastUsed[0],
      title: `Explore ${leastUsed[0]} practice`,
      description: `You've been focusing on other areas. Consider adding some ${leastUsed[0]} activities to your wellness routine.`,
      confidence: 0.7,
      timestamp: new Date(),
    });
  }

  return recommendations;
}

/**
 * Calculate overall wellness score
 */
function calculateWellnessScore(
  patterns: WellnessPattern[],
  events: WellnessEvent[]
): number {
  if (events.length === 0) return 0;

  let score = 0;

  const avgConsistency =
    patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.consistency, 0) / patterns.length
      : 0;

  const avgStreak =
    patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.streakDays, 0) / patterns.length
      : 0;

  const completionRate =
    events.length > 0
      ? events.filter((e) => e.completed).length / events.length
      : 0;

  score = avgConsistency * 30 + Math.min(avgStreak * 5, 30) + completionRate * 40;

  return Math.round(Math.min(score, 100));
}

/**
 * Get comprehensive wellness insights
 */
export function getInsights(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    categories?: WellnessCategory[];
  }
): WellnessSummary {
  const userEvents = getUserEvents(userId, options?.startDate, options?.endDate);

  const filteredEvents =
    options?.categories && options.categories.length > 0
      ? userEvents.filter((e) => options.categories!.includes(e.category))
      : userEvents;

  const patterns = detectPatterns(filteredEvents);
  const anomalies = identifyAnomalies(filteredEvents);
  const recommendations = generateRecommendations(patterns);
  const insights = [...anomalies, ...recommendations];

  const uniqueDays = new Set<string>();
  for (const event of filteredEvents) {
    uniqueDays.add(event.timestamp.toISOString().split('T')[0]);
  }

  const categoryCounts = new Map<WellnessCategory, number>();
  for (const event of filteredEvents) {
    const count = categoryCounts.get(event.category) || 0;
    categoryCounts.set(event.category, count + 1);
  }

  let topCategory: WellnessCategory = 'meditation';
  let maxCount = 0;
  for (const [cat, count] of categoryCounts) {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  }

  const overallStreak = calculateStreak(
    [...filteredEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  );

  return {
    totalEvents: filteredEvents.length,
    activeDays: uniqueDays.size,
    topCategory,
    patterns,
    insights,
    streak: overallStreak,
    wellnessScore: calculateWellnessScore(patterns, filteredEvents),
  };
}

/**
 * Reset wellness data (for testing only)
 */
export function _resetWellness(): void {
  events.length = 0;
}