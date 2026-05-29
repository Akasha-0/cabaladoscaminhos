// ============================================================
// GAMIFICACAO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for gamification data access
// - Achievement management
// - Challenge tracking
// - Streak rewards
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── IMPORT GAMIFICATION MODULES ──────────────────────────────────────────────

import { getAchievements, getAchievementById, getAchievementsByCategory, getUnlockedCount, getTotalCount, getCompletionPercentage, getRecentAchievements, AchievementCategory } from '@/lib/gamification/achievements';
import { getChallenges } from '@/lib/gamification/challenges';
import { getStreakRewards, getRewardsByTier, getNextReward, getUnlockedRewardsCount, getTotalRewardsCount, getRewardById, getProgressToNextReward, RewardTier } from '@/lib/gamification/rewards';
import { getStreak as getStreakInfo } from '@/lib/gamification/streaks';
import { getStreak as getStreakData } from '@/lib/gamification/streak-tracking';

import { performPractice } from '@/lib/orixa/gamificacao-practice';

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────────

interface GamificacaoStats {
  totalAchievements: number;
  unlockedAchievements: number;
  achievementCompletion: number;
  currentStreak: number;
  longestStreak: number;
  totalRewards: number;
  unlockedRewards: number;
  practiceCompleted: boolean;
}

interface GamificacaoData {
  achievements: ReturnType<typeof getAchievements>;
  challenges: ReturnType<typeof getChallenges>;
  streakRewards: ReturnType<typeof getStreakRewards>;
  stats: GamificacaoStats;
  practice: ReturnType<typeof performPractice>;
}

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/gamificacao/data - Get gamification data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const category = searchParams.get('category') as AchievementCategory | null;
  const tier = searchParams.get('tier') as RewardTier | null;
  const recent = searchParams.get('recent');

  try {
    // Get streak info
    const streakInfo = getStreakInfo();
    const streakData = getStreakData();
    // Build stats
    const stats: GamificacaoStats = {
      totalAchievements: getTotalCount(),
      unlockedAchievements: getUnlockedCount(),
      achievementCompletion: getCompletionPercentage(),
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalRewards: getTotalRewardsCount(),
      unlockedRewards: getUnlockedRewardsCount(),
      practiceCompleted: streakData.currentStreak > 0,
    };


    // Return based on type parameter
    if (type === 'achievements') {
      if (id) {
        const achievement = getAchievementById(id);
        if (!achievement) {
          return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
        }
        return NextResponse.json({ achievement });
      }
      if (category) {
        return NextResponse.json({
          achievements: getAchievementsByCategory(category),
          category,
        });
      }
      if (recent) {
        return NextResponse.json({
          achievements: getRecentAchievements(parseInt(recent, 10)),
        });
      }
      return NextResponse.json({
        achievements: getAchievements(),
        stats: {
          total: stats.totalAchievements,
          unlocked: stats.unlockedAchievements,
          completion: stats.achievementCompletion,
        },
      });
    }

    if (type === 'challenges') {
      const challenges = getChallenges();
      if (id) {
        const challenge = challenges.find((c) => c.id === id);
        if (!challenge) {
          return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }
        return NextResponse.json({ challenge });
      }
      return NextResponse.json({ challenges });
    }

    if (type === 'rewards') {
      if (id) {
        const reward = getRewardById(id);
        if (!reward) {
          return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
        }
        return NextResponse.json({ reward });
      }
      if (tier) {
        return NextResponse.json({
          rewards: getRewardsByTier(tier),
          tier,
        });
      }
      return NextResponse.json({
        rewards: getStreakRewards(),
        stats: {
          total: stats.totalRewards,
          unlocked: stats.unlockedRewards,
          progress: getProgressToNextReward(),
        },
      });
    }

    if (type === 'streak') {
      return NextResponse.json({
        streak: streakInfo,
        data: streakData,
        nextReward: getNextReward(),
      });
    }

    if (type === 'stats') {
      return NextResponse.json({ stats });
    }

    // Default: return all gamification data
    const data: GamificacaoData = {
      achievements: getAchievements(),
      challenges: getChallenges(),
      streakRewards: getStreakRewards(),
      stats,
      practice: performPractice(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Gamificacao API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    );
  }
}
