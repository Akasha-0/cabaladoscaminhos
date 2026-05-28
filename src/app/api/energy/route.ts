// ============================================================
// ENERGY API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for energy management
// - Energy levels and trends
// - Energy balance tracking
// - Personal energy insights
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Energy levels enum-like structure
const ENERGY_LEVELS = {
  EXHAUSTED: 1,
  LOW: 2,
  MODERATE: 3,
  GOOD: 4,
  HIGH: 5,
  OPTIMAL: 6,
} as const;

type EnergyLevel = typeof ENERGY_LEVELS[keyof typeof ENERGY_LEVELS];

interface EnergyEntry {
  id: string;
  userId: string;
  level: EnergyLevel;
  timestamp: string;
  notes?: string;
  activities?: string[];
}

interface EnergyTrend {
  period: string;
  averageLevel: number;
  peakTime: string;
  lowTime: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface EnergyInsight {
  type: 'tip' | 'warning' | 'recommendation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// In-memory energy tracking (in production, use database)
const energyStore: Map<string, EnergyEntry[]> = new Map();

// Helper to get or create user energy entries
function getUserEnergyEntries(userId: string): EnergyEntry[] {
  return energyStore.get(userId) || [];
}

// Calculate energy trend from entries
function calculateEnergyTrend(entries: EnergyEntry[]): EnergyTrend {
  if (entries.length === 0) {
    return {
      period: '7d',
      averageLevel: 3,
      peakTime: '10:00',
      lowTime: '14:00',
      trend: 'stable',
    };
  }

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const recentEntries = sortedEntries.slice(-7);
  const averageLevel =
    recentEntries.reduce((sum, e) => sum + e.level, 0) / recentEntries.length;

  // Determine peak and low times from entries
  const levelByHour = new Map<number, number[]>();
  recentEntries.forEach((entry) => {
    const hour = new Date(entry.timestamp).getHours();
    if (!levelByHour.has(hour)) levelByHour.set(hour, []);
    levelByHour.get(hour)!.push(entry.level);
  });

  let peakTime = '10:00';
  let lowTime = '14:00';
  let maxAvg = 0;
  let minAvg = Infinity;

  levelByHour.forEach((levels, hour) => {
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      peakTime = `${hour.toString().padStart(2, '0')}:00`;
    }
    if (avg < minAvg) {
      minAvg = avg;
      lowTime = `${hour.toString().padStart(2, '0')}:00`;
    }
  });

  // Calculate trend
  const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
  const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
  const firstAvg = firstHalf.reduce((sum, e) => sum + e.level, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((sum, e) => sum + e.level, 0) / (secondHalf.length || 1);

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (secondAvg - firstAvg > 0.5) trend = 'increasing';
  else if (firstAvg - secondAvg > 0.5) trend = 'decreasing';

  return {
    period: '7d',
    averageLevel: Math.round(averageLevel * 10) / 10,
    peakTime,
    lowTime,
    trend,
  };
}

// Generate energy insights based on trends
function generateInsights(trend: EnergyTrend, entries: EnergyEntry[]): EnergyInsight[] {
  const insights: EnergyInsight[] = [];

  if (trend.trend === 'decreasing' && trend.averageLevel < 3) {
    insights.push({
      type: 'warning',
      title: 'Energy Declining',
      description: 'Your energy levels have been decreasing. Consider rest and self-care.',
      priority: 'high',
    });
  }

  if (trend.trend === 'increasing' && trend.averageLevel >= 4) {
    insights.push({
      type: 'tip',
      title: 'Sustained Energy',
      description: 'Great job maintaining high energy levels! Keep your routines consistent.',
      priority: 'medium',
    });
  }

  // Check for patterns
  const recentActivities = entries.slice(-14).flatMap((e) => e.activities || []);
  const activityCounts = new Map<string, number>();
  recentActivities.forEach((a) => {
    activityCounts.set(a, (activityCounts.get(a) || 0) + 1);
  });

  if (activityCounts.size > 0) {
    const topActivity = Array.from(activityCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      type: 'recommendation',
      title: 'Activity Insight',
      description: `Your most frequent energy-boosting activity is "${topActivity[0]}".`,
      priority: 'low',
    });
  }

  // Peak time recommendation
  insights.push({
    type: 'tip',
    title: 'Optimal Time',
    description: `Your energy peaks around ${trend.peakTime}. Schedule important tasks during this time.`,
    priority: 'medium',
  });

  return insights;
}

// Get current energy status
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    // Get user's energy entries
    const entries = getUserEnergyEntries(userId);

    switch (action) {
      case 'status': {
        // Get current energy level (most recent entry or default)
        const latestEntry = entries.length > 0
          ? entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          : null;

        return NextResponse.json({
          success: true,
          data: {
            currentLevel: latestEntry?.level ?? ENERGY_LEVELS.MODERATE,
            lastUpdated: latestEntry?.timestamp ?? new Date().toISOString(),
            label: getEnergyLabel(latestEntry?.level ?? ENERGY_LEVELS.MODERATE),
          },
        });
      }

      case 'trend': {
        const trend = calculateEnergyTrend(entries);
        const insights = generateInsights(trend, entries);

        return NextResponse.json({
          success: true,
          data: {
            trend,
            insights,
            totalEntries: entries.length,
          },
        });
      }

      case 'history': {
        const days = parseInt(url.searchParams.get('days') || '7', 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filteredEntries = entries.filter(
          (e) => new Date(e.timestamp) >= cutoffDate
        );

        return NextResponse.json({
          success: true,
          data: {
            entries: filteredEntries,
            total: filteredEntries.length,
            period: `${days}d`,
          },
        });
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid action. Use: status, trend, or history' },
          { status: 400 }
        );
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to process energy request' },
      { status: 500 }
    );
  }
}

function getEnergyLabel(level: EnergyLevel): string {
  const labels: Record<number, string> = {
    [ENERGY_LEVELS.EXHAUSTED]: 'Exhausted',
    [ENERGY_LEVELS.LOW]: 'Low',
    [ENERGY_LEVELS.MODERATE]: 'Moderate',
    [ENERGY_LEVELS.GOOD]: 'Good',
    [ENERGY_LEVELS.HIGH]: 'High',
    [ENERGY_LEVELS.OPTIMAL]: 'Optimal',
  };
  return labels[level] || 'Unknown';
}

// Record energy entry (used by other parts of the app)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const body = await request.json();

    const { level, notes, activities } = body;

    if (!level || level < 1 || level > 6) {
      return NextResponse.json(
        { error: 'Invalid energy level. Must be between 1 and 6.' },
        { status: 400 }
      );
    }

    const entry: EnergyEntry = {
      id: crypto.randomUUID(),
      userId,
      level,
      timestamp: new Date().toISOString(),
      notes: notes || undefined,
      activities: activities || undefined,
    };

    const userEntries = getUserEnergyEntries(userId);
    userEntries.push(entry);

    // Keep only last 100 entries per user
    if (userEntries.length > 100) {
      userEntries.splice(0, userEntries.length - 100);
    }

    energyStore.set(userId, userEntries);

    return NextResponse.json({
      success: true,
      data: { entry },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to record energy entry' },
      { status: 500 }
    );
  }
}