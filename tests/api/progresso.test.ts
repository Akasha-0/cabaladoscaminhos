// tests/api/progresso.test.ts
// Tests for src/app/api/progresso/route.ts helper functions
// Covers: calculateLevel, enrichAchievement, applySpiritualFilters,
//         normalizeProgressData, build*Progress functions

import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  enrichAchievement,
  applySpiritualFilters,
  normalizeProgressData,
  buildProgressStatsFromExp,
  buildReadingProgress,
  buildRitualProgress,
  buildMeditationProgress,
  buildCreditsProgress,
  calculateSpiritualStats,
} from '@/app/api/progresso/route';
import type { Achievement } from '@/app/api/progresso/route';

describe('calculateLevel', () => {
  it('returns level 1 with 0 experience', () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
  });

  it('returns level 1 when experience is less than 100', () => {
    const result = calculateLevel(50);
    expect(result.level).toBe(1);
    expect(result.expToNext).toBe(100);
  });

  it('increases level when experience reaches threshold', () => {
    const result = calculateLevel(150);
    expect(result.level).toBe(2);
  });

  it('calculates correct expToNext for level 2', () => {
    const result = calculateLevel(150);
    expect(result.expToNext).toBe(150);
  });

  it('handles high experience levels', () => {
    const result = calculateLevel(1000);
    expect(result.level).toBeGreaterThan(3);
  });
});

describe('enrichAchievement', () => {
  const mockBase = {
    id: 'test_achievement',
    name: 'Test Achievement',
    description: 'A test achievement',
    icon: '🏆',
    target: 10,
    category: 'readings' as const,
    rarity: 'common' as const,
    sefirot: ['Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Test affirmation',
    spiritualCorrelations: {
      sefirot: ['Kether'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'Test affirmation',
      frequency: '963 Hz',
    },
  };

  it('enriches achievement with progress 0 and no unlock', () => {
    const result = enrichAchievement(mockBase, 0, null);
    expect(result.id).toBe('test_achievement');
    expect(result.progress).toBe(0);
    expect(result.unlockedAt).toBeNull();
    expect(result.target).toBe(10);
  });

  it('enriches achievement with partial progress', () => {
    const result = enrichAchievement(mockBase, 5, null);
    expect(result.progress).toBe(5);
  });

  it('enriches achievement with full progress and unlock date', () => {
    const unlockDate = '2024-01-15T10:00:00Z';
    const result = enrichAchievement(mockBase, 10, unlockDate);
    expect(result.progress).toBe(10);
    expect(result.unlockedAt).toBe(unlockDate);
  });

  it('copies spiritual correlations from base', () => {
    const result = enrichAchievement(mockBase, 5, null);
    expect(result.spiritualCorrelations).toEqual({
      sefirot: ['Kether'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'Test affirmation',
      frequency: '963 Hz',
    });
  });
});

describe('applySpiritualFilters', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'a1',
      name: 'Achievement 1',
      description: 'Test',
      icon: '✨',
      progress: 5,
      target: 10,
      category: 'readings',
      rarity: 'common',
      unlockedAt: null,
      sefirot: ['Kether'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'Test',
      spiritualCorrelations: {
        sefirot: ['Kether'],
        chakra: 7,
        element: 'Éter',
        orixa: 'Oxalá',
        affirmation: 'Test',
        frequency: '963 Hz',
      },
    },
    {
      id: 'a2',
      name: 'Achievement 2',
      description: 'Test',
      icon: '🔥',
      progress: 3,
      target: 5,
      category: 'rituals',
      rarity: 'uncommon',
      unlockedAt: null,
      sefirot: ['Gevurah'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Ogum',
      affirmation: 'Test',
      spiritualCorrelations: {
        sefirot: ['Gevurah'],
        chakra: 3,
        element: 'Fogo',
        orixa: 'Ogum',
        affirmation: 'Test',
        frequency: '528 Hz',
      },
    },
  ];

  it('returns all achievements when no filters applied', () => {
    const result = applySpiritualFilters(mockAchievements, {});
    expect(result).toHaveLength(2);
  });

  it('filters by sefirot', () => {
    const result = applySpiritualFilters(mockAchievements, { sefirot: 'Kether' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('filters by chakra', () => {
    const result = applySpiritualFilters(mockAchievements, { chakra: 7 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('filters by element', () => {
    const result = applySpiritualFilters(mockAchievements, { element: 'Fogo' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a2');
  });

  it('filters by orixa', () => {
    const result = applySpiritualFilters(mockAchievements, { orixa: 'Ogum' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a2');
  });

  it('applies multiple filters', () => {
    const result = applySpiritualFilters(mockAchievements, { 
      sefirot: 'Gevurah', 
      chakra: 3 
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a2');
  });
});

describe('normalizeProgressData', () => {
  it('returns null for null input', () => {
    const result = normalizeProgressData(null);
    expect(result).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(normalizeProgressData('string')).toBeNull();
    expect(normalizeProgressData(123)).toBeNull();
    expect(normalizeProgressData(undefined)).toBeNull();
  });

  it('normalizes progress data with snake_case keys', () => {
    const rawData = {
      experience: 500,
      total_points: 1000,
      readings_count: 25,
      readings_by_type: { tarot: 10, astrology: 15 },
      readings_this_week: 3,
      readings_this_month: 10,
      rituals_count: 50,
      rituals_streak: 7,
      rituals_longest_streak: 14,
      rituals_completion_rate: 85.5,
      favorite_ritual: 'morning_meditation',
      meditation_sessions: 30,
      meditation_minutes: 450,
      meditation_streak: 5,
      meditation_longest_streak: 12,
      credits_earned: 5000,
      credits_spent: 3500,
      credits_balance: 1500,
      most_expensive_feature: 'ai_reading',
    };
    
    const result = normalizeProgressData(rawData);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.experience).toBe(500);
      expect(result.totalPoints).toBe(1000);
      expect(result.readingsCount).toBe(25);
      expect(result.readingsByType).toEqual({ tarot: 10, astrology: 15 });
      expect(result.readingsThisWeek).toBe(3);
      expect(result.readingsThisMonth).toBe(10);
      expect(result.ritualsCount).toBe(50);
      expect(result.ritualsStreak).toBe(7);
      expect(result.ritualsLongestStreak).toBe(14);
      expect(result.ritualsCompletionRate).toBe(85.5);
      expect(result.favoriteRitual).toBe('morning_meditation');
      expect(result.meditationSessions).toBe(30);
      expect(result.meditationMinutes).toBe(450);
      expect(result.meditationStreak).toBe(5);
      expect(result.meditationLongestStreak).toBe(12);
      expect(result.creditsEarned).toBe(5000);
      expect(result.creditsSpent).toBe(3500);
      expect(result.creditsBalance).toBe(1500);
      expect(result.mostExpensiveFeature).toBe('ai_reading');
    }
  });

  it('defaults missing fields to 0 or null', () => {
    const result = normalizeProgressData({});
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.experience).toBe(0);
      expect(result.totalPoints).toBe(0);
      expect(result.readingsByType).toEqual({});
      expect(result.favoriteRitual).toBeNull();
      expect(result.mostExpensiveFeature).toBeNull();
    }
  });
});

describe('buildProgressStatsFromExp', () => {
  it('builds stats with level 1 for 0 experience', () => {
    const result = buildProgressStatsFromExp(0, 0);
    expect(result.level).toBe(1);
    expect(result.experience).toBe(0);
    expect(result.totalPoints).toBe(0);
  });

  it('builds stats with correct level for experience', () => {
    const result = buildProgressStatsFromExp(500, 1000);
    expect(result.level).toBeGreaterThan(1);
    expect(result.experience).toBe(500);
    expect(result.totalPoints).toBe(1000);
  });

  it('includes experienceToNextLevel', () => {
    const result = buildProgressStatsFromExp(200, 500);
    expect(result.experienceToNextLevel).toBeGreaterThan(0);
  });
});

describe('buildReadingProgress', () => {
  it('builds empty progress when data is null', () => {
    const result = buildReadingProgress(null);
    expect(result.total).toBe(0);
    expect(result.byType).toEqual({});
    expect(result.thisWeek).toBe(0);
    expect(result.thisMonth).toBe(0);
  });

  it('builds progress from normalized data', () => {
    const data = {
      experience: 0, totalPoints: 0, readingsCount: 50, readingsByType: { tarot: 30, astrology: 20 },
      readingsThisWeek: 5, readingsThisMonth: 15, ritualsCount: 0, ritualsStreak: 0, ritualsLongestStreak: 0,
      ritualsCompletionRate: 0, favoriteRitual: null, meditationSessions: 0, meditationMinutes: 0,
      meditationStreak: 0, meditationLongestStreak: 0, creditsEarned: 0, creditsSpent: 0,
      creditsBalance: 0, mostExpensiveFeature: null,
    };
    const result = buildReadingProgress(data);
    expect(result.total).toBe(50);
    expect(result.byType).toEqual({ tarot: 30, astrology: 20 });
    expect(result.thisWeek).toBe(5);
    expect(result.thisMonth).toBe(15);
  });
});

describe('buildRitualProgress', () => {
  it('builds empty progress when data is null', () => {
    const result = buildRitualProgress(null);
    expect(result.totalCompletions).toBe(0);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.completionRate).toBe(0);
    expect(result.favoriteRitual).toBeNull();
  });

  it('builds progress from normalized data', () => {
    const data = {
      experience: 0, totalPoints: 0, readingsCount: 0, readingsByType: {},
      readingsThisWeek: 0, readingsThisMonth: 0, ritualsCount: 100, ritualsStreak: 7,
      ritualsLongestStreak: 30, ritualsCompletionRate: 92.5, favoriteRitual: 'morning_prayer',
      meditationSessions: 0, meditationMinutes: 0, meditationStreak: 0, meditationLongestStreak: 0,
      creditsEarned: 0, creditsSpent: 0, creditsBalance: 0, mostExpensiveFeature: null,
    };
    const result = buildRitualProgress(data);
    expect(result.totalCompletions).toBe(100);
    expect(result.currentStreak).toBe(7);
    expect(result.longestStreak).toBe(30);
    expect(result.completionRate).toBe(92.5);
    expect(result.favoriteRitual).toBe('morning_prayer');
  });
});

describe('buildMeditationProgress', () => {
  it('builds empty progress when data is null', () => {
    const result = buildMeditationProgress(null);
    expect(result.totalSessions).toBe(0);
    expect(result.totalMinutes).toBe(0);
    expect(result.averageSessionLength).toBe(0);
    expect(result.currentMeditationStreak).toBe(0);
    expect(result.longestMeditationStreak).toBe(0);
  });

  it('builds progress with calculated average', () => {
    const data = {
      experience: 0, totalPoints: 0, readingsCount: 0, readingsByType: {},
      readingsThisWeek: 0, readingsThisMonth: 0, ritualsCount: 0, ritualsStreak: 0,
      ritualsLongestStreak: 0, ritualsCompletionRate: 0, favoriteRitual: null,
      meditationSessions: 10, meditationMinutes: 120, meditationStreak: 5, meditationLongestStreak: 14,
      creditsEarned: 0, creditsSpent: 0, creditsBalance: 0, mostExpensiveFeature: null,
    };
    const result = buildMeditationProgress(data);
    expect(result.totalSessions).toBe(10);
    expect(result.totalMinutes).toBe(120);
    expect(result.averageSessionLength).toBe(12);
    expect(result.currentMeditationStreak).toBe(5);
    expect(result.longestMeditationStreak).toBe(14);
  });

  it('handles zero sessions gracefully', () => {
    const data = {
      experience: 0, totalPoints: 0, readingsCount: 0, readingsByType: {},
      readingsThisWeek: 0, readingsThisMonth: 0, ritualsCount: 0, ritualsStreak: 0,
      ritualsLongestStreak: 0, ritualsCompletionRate: 0, favoriteRitual: null,
      meditationSessions: 0, meditationMinutes: 0, meditationStreak: 0, meditationLongestStreak: 0,
      creditsEarned: 0, creditsSpent: 0, creditsBalance: 0, mostExpensiveFeature: null,
    };
    const result = buildMeditationProgress(data);
    expect(result.averageSessionLength).toBe(0);
  });
});

describe('buildCreditsProgress', () => {
  it('builds empty progress when data is null', () => {
    const result = buildCreditsProgress(null);
    expect(result.totalEarned).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.currentBalance).toBe(0);
    expect(result.mostExpensiveFeature).toBeNull();
  });

  it('builds progress from normalized data', () => {
    const data = {
      experience: 0, totalPoints: 0, readingsCount: 0, readingsByType: {},
      readingsThisWeek: 0, readingsThisMonth: 0, ritualsCount: 0, ritualsStreak: 0,
      ritualsLongestStreak: 0, ritualsCompletionRate: 0, favoriteRitual: null,
      meditationSessions: 0, meditationMinutes: 0, meditationStreak: 0, meditationLongestStreak: 0,
      creditsEarned: 10000, creditsSpent: 7500, creditsBalance: 2500, mostExpensiveFeature: 'ai_reading',
    };
    const result = buildCreditsProgress(data);
    expect(result.totalEarned).toBe(10000);
    expect(result.totalSpent).toBe(7500);
    expect(result.currentBalance).toBe(2500);
    expect(result.mostExpensiveFeature).toBe('ai_reading');
  });
});

describe('calculateSpiritualStats', () => {
  const mockAchievements: Achievement[] = [
    {
      id: 'a1', name: 'A1', description: 'Test', icon: '✨', progress: 5, target: 10,
      category: 'readings', rarity: 'common', unlockedAt: null,
      sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Test',
      spiritualCorrelations: { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Test', frequency: '963 Hz' },
    },
    {
      id: 'a2', name: 'A2', description: 'Test', icon: '🔥', progress: 3, target: 5,
      category: 'rituals', rarity: 'uncommon', unlockedAt: null,
      sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Test',
      spiritualCorrelations: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Test', frequency: '528 Hz' },
    },
    {
      id: 'a3', name: 'A3', description: 'Test', icon: '💧', progress: 7, target: 10,
      category: 'readings', rarity: 'rare', unlockedAt: '2024-01-01',
      sefirot: ['Kether'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Test',
      spiritualCorrelations: { sefirot: ['Kether'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Test', frequency: '639 Hz' },
    },
  ];

  it('counts achievements by sefirot', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.bySefirot['Kether']).toBe(2);
    expect(stats.bySefirot['Chokhmah']).toBe(1);
    expect(stats.bySefirot['Gevurah']).toBe(1);
  });

  it('counts achievements by chakra', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.byChakra['7']).toBe(2);
    expect(stats.byChakra['3']).toBe(1);
  });

  it('counts achievements by element', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.byElement['Éter']).toBe(1);
    expect(stats.byElement['Fogo']).toBe(1);
    expect(stats.byElement['Água']).toBe(1);
  });

  it('counts achievements by orixa', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.byOrixa['Oxalá']).toBe(1);
    expect(stats.byOrixa['Ogum']).toBe(1);
    expect(stats.byOrixa['Iemanjá']).toBe(1);
  });

  it('counts achievements by rarity', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.byRarity['common']).toBe(1);
    expect(stats.byRarity['uncommon']).toBe(1);
    expect(stats.byRarity['rare']).toBe(1);
  });

  it('counts achievements by category', () => {
    const stats = calculateSpiritualStats(mockAchievements);
    expect(stats.byCategory['readings']).toBe(2);
    expect(stats.byCategory['rituals']).toBe(1);
  });

  it('handles empty array', () => {
    const stats = calculateSpiritualStats([]);
    expect(stats.bySefirot).toEqual({});
    expect(stats.byChakra).toEqual({});
    expect(stats.byRarity).toEqual({});
  });
});
