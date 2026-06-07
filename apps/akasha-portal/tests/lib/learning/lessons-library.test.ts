import { describe, it, expect } from 'vitest';
import { getLessons, getLessonsByLevel, getLessonsByCategory, getLessonById } from '@/lib/learning/lessons-library';

describe('learning/lessons-library', () => {
  it('returns all lessons', () => {
    const lessons = getLessons();
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('filters lessons by level', () => {
    const beginner = getLessonsByLevel('beginner');
    expect(beginner.length).toBeGreaterThan(0);
    expect(beginner.every(l => l.level === 'beginner')).toBe(true);
  });

  it('finds a lesson by id', () => {
    const lesson = getLessonById('intro-cabala-1');
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe('Introdução à Cabala');
  });
});
