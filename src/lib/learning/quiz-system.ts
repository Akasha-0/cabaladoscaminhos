/**
 * Quiz System — Multiple choice learning assessments
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizConfig {
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  quizId: string;
  answers: (number | null)[];
  score: number;
  totalQuestions: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizSession {
  quiz: QuizConfig;
  currentIndex: number;
  answers: (number | null)[];
  startedAt: Date;
  isComplete: boolean;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  feedback: QuizFeedback[];
}

export interface QuizFeedback {
  questionId: string;
  question: string;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Creates a quiz session with the given configuration
 */
export function createQuiz(config: QuizConfig): QuizSession {
  if (!config.questions || config.questions.length === 0) {
    throw new Error('Quiz must have at least one question');
  }

  return {
    quiz: config,
    currentIndex: 0,
    answers: new Array(config.questions.length).fill(null),
    startedAt: new Date(),
    isComplete: false,
  };
}

/**
 * Submit an answer for the current question
 */
export function submitAnswer(
  session: QuizSession,
  questionIndex: number,
  selectedIndex: number
): QuizSession {
  if (questionIndex < 0 || questionIndex >= session.quiz.questions.length) {
    throw new Error('Invalid question index');
  }

  const question = session.quiz.questions[questionIndex];
  if (selectedIndex < 0 || selectedIndex >= question.options.length) {
    throw new Error('Invalid option index');
  }

  const newAnswers = [...session.answers];
  newAnswers[questionIndex] = selectedIndex;

  return {
    ...session,
    answers: newAnswers,
    currentIndex: questionIndex + 1,
    isComplete: questionIndex === session.quiz.questions.length - 1,
  };
}

/**
 * Skip the current question
 */
export function skipQuestion(session: QuizSession): QuizSession {
  const nextIndex = session.currentIndex + 1;
  return {
    ...session,
    currentIndex: nextIndex,
    isComplete: nextIndex >= session.quiz.questions.length,
  };
}

/**
 * Calculate the quiz result
 */
export function calculateResult(session: QuizSession): QuizResult {
  const { quiz, answers } = session;
  let score = 0;
  const feedback: QuizFeedback[] = [];

  quiz.questions.forEach((question, index) => {
    const selectedIndex = answers[index];
    const isCorrect = selectedIndex === question.correctIndex;

    if (isCorrect) {
      score++;
    }

    feedback.push({
      questionId: question.id,
      question: question.question,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect,
      explanation: question.explanation,
    });
  });

  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passingThreshold = 70;
  const passed = percentage >= passingThreshold;

  return {
    quizId: quiz.title,
    score,
    totalQuestions,
    percentage,
    passed,
    feedback,
  };
}

/**
 * Check if an answer is correct
 */
export function checkAnswer(
  session: QuizSession,
  questionIndex: number
): { isCorrect: boolean; correctIndex: number } | null {
  const question = session.quiz.questions[questionIndex];
  const selectedIndex = session.answers[questionIndex];

  if (selectedIndex === null) {
    return null;
  }

  return {
    isCorrect: selectedIndex === question.correctIndex,
    correctIndex: question.correctIndex,
  };
}

/**
 * Get the next unanswered question index
 */
export function getNextUnanswered(session: QuizSession): number | null {
  const idx = session.answers.findIndex((answer) => answer === null);
  return idx === -1 ? null : idx;
}

/**
 * Create a quiz attempt record
 */
export function createAttempt(session: QuizSession): QuizAttempt {
  const result = calculateResult(session);

  return {
    quizId: session.quiz.title,
    answers: session.answers,
    score: result.score,
    totalQuestions: result.totalQuestions,
    startedAt: session.startedAt,
    completedAt: new Date(),
  };
}
