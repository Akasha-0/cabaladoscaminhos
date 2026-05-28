/**
 * Learning Progress — Track user progress through lessons and quizzes
 */

export interface ProgressEntry {
  lessonId: string;
  completedAt: Date;
  score?: number;
  timeSpent: number; // seconds
}

export interface Progress {
  userId: string;
  lessonProgress: Map<string, ProgressEntry>;
  quizScores: Map<string, number>;
  overallScore: number;
  streakDays: number;
  lastActivity: Date;
  totalTimeSpent: number; // seconds
}

/**
 * Create a new progress tracker for a user
 */
export function trackProgress(userId: string): Progress {
  return {
    userId,
    lessonProgress: new Map(),
    quizScores: new Map(),
    overallScore: 0,
    streakDays: 0,
    lastActivity: new Date(),
    totalTimeSpent: 0,
  };
}

/**
 * Record lesson completion
 */
export function recordLessonProgress(
  progress: Progress,
  lessonId: string,
  timeSpent: number,
  score?: number
): Progress {
  const entry: ProgressEntry = {
    lessonId,
    completedAt: new Date(),
    score,
    timeSpent,
  };
  progress.lessonProgress.set(lessonId, entry);
  progress.lastActivity = new Date();
  progress.totalTimeSpent += timeSpent;
  return progress;
}

/**
 * Record quiz score
 */
export function recordQuizScore(
  progress: Progress,
  quizId: string,
  score: number
): Progress {
  progress.quizScores.set(quizId, score);
  progress.lastActivity = new Date();
  return progress;
}

/**
 * Calculate overall score based on lesson and quiz performance
 */
export function calculateOverallScore(progress: Progress): number {
  let total = 0;
  let count = 0;

  // Average lesson scores
  const lessonScores = Array.from(progress.lessonProgress.values())
    .filter((e) => e.score !== undefined)
    .map((e) => e.score!);
  if (lessonScores.length > 0) {
    total += lessonScores.reduce((a, b) => a + b, 0);
    count += lessonScores.length;
  }

  // Average quiz scores
  const quizScoreArray = Array.from(progress.quizScores.values());
  if (quizScoreArray.length > 0) {
    total += quizScoreArray.reduce((a, b) => a + b, 0);
    count += quizScoreArray.length;
  }

  progress.overallScore = count > 0 ? total / count : 0;
  return progress.overallScore;
}

/**
 * Get progress percentage for a specific lesson
 */
export function getLessonCompletion(
  progress: Progress,
  lessonId: string
): boolean {
  return progress.lessonProgress.has(lessonId);
}

/**
 * Get total completed lessons count
 */
export function getCompletedCount(progress: Progress): number {
  return progress.lessonProgress.size;
}