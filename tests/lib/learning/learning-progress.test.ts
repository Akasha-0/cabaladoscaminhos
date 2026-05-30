import { describe, it, expect } from 'vitest';
import { trackProgress, recordLessonProgress, recordQuizScore, calculateOverallScore, getLessonCompletion, getCompletedCount } from '@/lib/learning/learning-progress';

describe('learning/learning-progress', () => {
  it('creates a progress tracker for a user', () => {
    const progress = trackProgress('user-1');
    expect(progress.userId).toBe('user-1');
    expect(progress.lessonProgress.size).toBe(0);
    expect(progress.quizScores.size).toBe(0);
  });

  it('records lesson progress', () => {
    const progress = trackProgress('user-2');
    const updated = recordLessonProgress(progress, 'lesson-1', 300, 90);
    expect(getLessonCompletion(updated, 'lesson-1')).toBe(true);
  });

  it('calculates overall score from quiz scores', () => {
    const progress = trackProgress('user-3');
    recordQuizScore(progress, 'quiz-1', 85);
    recordQuizScore(progress, 'quiz-2', 95);
    expect(calculateOverallScore(progress)).toBe(90);
  });
});
