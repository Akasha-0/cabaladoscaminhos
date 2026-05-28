 
 

// Existence Practice Module
// Spiritual practice for deepening connection to being and presence

export interface ExistenceSession {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  duration: number; // milliseconds
  practiceType: 'presence' | 'being' | 'zero-point' | 'surrender';
  completed: boolean;
}

export interface ExistenceConfig {
  type: 'presence' | 'being' | 'zero-point' | 'surrender';
  duration: number; // milliseconds
  focus?: string;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export async function performPractice(config?: Partial<ExistenceConfig>): Promise<ExistenceSession> {
  const practiceConfig: ExistenceConfig = {
    type: config?.type ?? 'presence',
    duration: config?.duration ?? 60000,
    focus: config?.focus ?? 'being',
  };

  const session: ExistenceSession = {
    id: generateId(),
    startedAt: new Date(),
    duration: practiceConfig.duration,
    practiceType: practiceConfig.type,
    completed: false,
  };

  await new Promise((resolve) => setTimeout(resolve, 50));

  session.completedAt = new Date();
  session.completed = true;

  return session;
}

export function getPracticeGuidance(type: ExistenceSession['practiceType']): string {
  const guidance: Record<typeof type, string> = {
    presence: 'Rest in the witnessing consciousness that observes all experience without becoming any of it.',
    being: 'Taste the pure essence of existence before thought arises. You are already that which you seek.',
    'zero-point': 'Meet the vast open space between thoughts where all possibilities arise fresh.',
    surrender: 'Release into the spaciousness of existence itself. What remains when all doing falls away?',
  };
  return guidance[type];
}

export function calculateSessionInsight(session: ExistenceSession): string {
  if (!session.completed) {
    return 'Practice interrupted. Existence continues regardless.';
  }

  const minutes = Math.round(session.duration / 60000);
  return `Completed ${minutes} minute${minutes !== 1 ? 's' : ''} of ${session.practiceType} practice. You are the eternal witness of existence.`;
}
