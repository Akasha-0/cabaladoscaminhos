/**
 * Karma analysis engine.
 * Provides comprehensive analysis of karmic patterns, cycles, and recommendations.
 */

import { getPatterns, type KarmaPattern } from './karma-patterns';

export interface AnalysisInput {
  userId: string;
  birthDate?: Date;
  currentKarma: number;
  indicators?: string[];
  transitPlanet?: string;
  numerologyNumber?: number;
}

export interface AnalysisResult {
  dominantPatterns: KarmaPattern[];
  severityScore: number;
  cyclePhase: 'formation' | 'culmination' | 'release' | 'integration';
  resolutionEstimate: number;
  recommendations: string[];
  insights: string[];
  timestamp: Date;
}

/**
 * Analyze karmic state and provide recommendations.
 */
export function analyze(input: AnalysisInput): AnalysisResult {
  const patterns = input.indicators?.length
    ? getPatterns().filter((p) => input.indicators!.some((i) => p.indicators.includes(i)))
    : getPatterns();

  const relevantPatterns = input.numerologyNumber
    ? patterns.filter((p) => p.associatedNumerology.includes(input.numerologyNumber!))
    : patterns;

  const dominantPatterns = relevantPatterns.slice(0, 5);

  const severityScore = dominantPatterns.reduce((sum, p) => {
    const weights: Record<string, number> = { light: 1, moderate: 3, heavy: 7 };
    return sum + (weights[p.severity] ?? 1);
  }, 0);

  const cyclePhase = calculateCyclePhase(input.currentKarma, severityScore);

  const resolutionEstimate = estimateResolution(dominantPatterns, severityScore);

  const recommendations = generateRecommendations(dominantPatterns, cyclePhase);

  const insights = generateInsights(dominantPatterns, input.transitPlanet);

  return {
    dominantPatterns,
    severityScore,
    cyclePhase,
    resolutionEstimate,
    recommendations,
    insights,
    timestamp: new Date(),
  };
}

function calculateCyclePhase(
  karma: number,
  severity: number
): AnalysisResult['cyclePhase'] {
  if (karma > 80 || severity > 20) return 'formation';
  if (karma > 50 || severity > 10) return 'culmination';
  if (karma > 20 || severity > 5) return 'release';
  return 'integration';
}

function estimateResolution(patterns: KarmaPattern[], severity: number): number {
  const baseMonths = 3 + Math.floor(severity / 3);
  const patternMultiplier = Math.max(1, patterns.length * 0.5);
  return Math.ceil(baseMonths * patternMultiplier);
}

function generateRecommendations(
  patterns: KarmaPattern[],
  phase: AnalysisResult['cyclePhase']
): string[] {
  const recs: string[] = [];
  const categories = new Set(patterns.map((p) => p.category));

  if (categories.has('relationship')) {
    recs.push('Practice forgiveness and compassion in relationships.');
  }
  if (categories.has('ancestral')) {
    recs.push('Explore ancestral patterns and heal lineage wounds.');
  }
  if (categories.has('action')) {
    recs.push('Review intentional actions and their consequences.');
  }
  if (categories.has('inaction')) {
    recs.push('Identify opportunities missed; take conscious action now.');
  }
  if (categories.has('belief')) {
    recs.push('Examine limiting beliefs that create karmic loops.');
  }

  if (phase === 'formation') {
    recs.push('Avoid creating new karmic debts; act with awareness.');
  } else if (phase === 'culmination') {
    recs.push('Resolution is near; maintain patience and observe without reaction.');
  } else if (phase === 'release') {
    recs.push('Old patterns dissolving; embrace change and let go.');
  } else {
    recs.push('Integration phase; embody lessons learned.');
  }

  return recs;
}

function generateInsights(patterns: KarmaPattern[], planet?: string): string[] {
  const insights: string[] = [];

  if (patterns.length === 0) {
    insights.push('No dominant karmic patterns detected in current cycle.');
  } else {
    const topPattern = patterns[0];
    insights.push(`Primary pattern: ${topPattern.name} — ${topPattern.description}`);
  }

  if (planet) {
    const planetPatterns = patterns.filter((p) => p.associatedPlanets.includes(planet));
    if (planetPatterns.length > 0) {
      insights.push(`Current transit through ${planet} activates ${planetPatterns.length} karmic theme(s).`);
    }
  }

  const categories = patterns.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  if (dominantCategory) {
    insights.push(`Dominant karmic theme: ${dominantCategory[0]} (${dominantCategory[1]} indicators).`);
  }

  return insights;
}