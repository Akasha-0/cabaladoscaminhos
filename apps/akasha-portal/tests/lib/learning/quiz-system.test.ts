import { describe, it, expect } from 'vitest';
import { createQuiz, submitAnswer, calculateResult, getNextUnanswered } from '@/lib/learning/quiz-system';

describe('learning/quiz-system', () => {
  const sampleQuiz = {
    title: 'Test Quiz',
    description: 'A test',
    questions: [
      {
        id: 'q1',
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'What is 3+3?',
        options: ['5', '6', '7', '8'],
        correctIndex: 1,
      },
    ],
  };

  it('creates a quiz session', () => {
    const session = createQuiz(sampleQuiz);
    expect(session.quiz.title).toBe('Test Quiz');
    expect(session.currentIndex).toBe(0);
    expect(session.isComplete).toBe(false);
  });

  it('submits an answer and advances', () => {
    const session = createQuiz(sampleQuiz);
    const updated = submitAnswer(session, 0, 1);
    expect(updated.answers[0]).toBe(1);
  });

  it('calculates result with correct score', () => {
    const session = createQuiz(sampleQuiz);
    const withAnswers = submitAnswer(submitAnswer(session, 0, 1), 1, 1);
    const result = calculateResult(withAnswers);
    expect(result.score).toBe(2);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });
});
