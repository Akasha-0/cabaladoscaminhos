export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'ritual' | 'reflection' | 'breathing' | 'journaling';
  weekStart: string; // ISO date string for the start of the week
  weekEnd: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string; // ISO date string
}

const CHALLENGE_TEMPLATES: Omit<Challenge, 'weekStart' | 'weekEnd' | 'completed' | 'completedAt'>[] = [
  {
    id: 'meditate-30min',
    title: 'Meditação de 30 Minutos',
    description: 'Pratique uma sessão de meditação com duração mínima de 30 minutos.',
    type: 'meditation',
    xpReward: 100,
  },
  {
    id: 'ritual-daily',
    title: 'Ritual Matinal',
    description: 'Realize seu ritual matinal de conexão espiritual.',
    type: 'ritual',
    xpReward: 75,
  },
  {
    id: 'journal-sacred',
    title: 'Diário Sagrado',
    description: 'Escreva pelo menos 3 páginas sobre seus reflexão espiritual do dia.',
    type: 'journaling',
    xpReward: 80,
  },
  {
    id: 'breathing-cycle',
    title: 'Ciclo de Respiração',
    description: 'Complete 10 ciclos de respiração consciente durante o dia.',
    type: 'breathing',
    xpReward: 50,
  },
  {
    id: 'reflection-weekly',
    title: 'Reflexão Semanal',
    description: 'Dedique 20 minutos à reflexão sobre seus progresso espiritual da semana.',
    type: 'reflection',
    xpReward: 90,
  },
  {
    id: 'deep-meditation',
    title: 'Meditação Profunda',
    description: ' Alcance um estado de meditação profunda por pelo menos 15 minutos sem interrupção.',
    type: 'meditation',
    xpReward: 120,
  },
  {
    id: 'night-ritual',
    title: 'Ritual Noturno',
    description: 'Realize um ritual de encerramento do dia antes de dormir.',
    type: 'ritual',
    xpReward: 75,
  },
  {
    id: 'gratitude-journal',
    title: 'Diário de Gratidão',
    description: 'Liste 5 coisas pelas quais você é grato hoje em seu diário.',
    type: 'journaling',
    xpReward: 60,
  },
  {
    id: 'breathing-power',
    title: 'Respiração Poderosa',
    description: 'Pratique 5 minutos de respiração Wim Hof ou técnica similar.',
    type: 'breathing',
    xpReward: 65,
  },
  {
    id: 'moon-reflection',
    title: 'Reflexão sob a Lua',
    description: 'Medite ao ar livre sob a luz da lua ou em um espaço aberto.',
    type: 'reflection',
    xpReward: 110,
  },
];

function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function dateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

const completedChallenges: Set<string> = new Set();
const completedAtMap: Map<string, string> = new Map();

/**
 * Returns the spiritual challenges for the current week.
 * Each challenge is annotated with completion status.
 */
export function getChallenges(): Challenge[] {
  const { start, end } = getWeekBounds();

  return CHALLENGE_TEMPLATES.map((template) => {
    const uid = `${template.id}-${dateToISO(start)}`;
    return {
      ...template,
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      completed: completedChallenges.has(uid),
      completedAt: completedAtMap.get(uid),
    };
  });
}

/**
 * Marks a challenge as completed for the current week.
 * Returns true if the challenge was found and marked; false otherwise.
 */
export function completeChallenge(challengeId: string): Challenge | null {
  const challenges = getChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) return null;
  if (challenge.completed) return challenge;

  const uid = `${challengeId}-${dateToISO(new Date(challenge.weekStart))}`;
  completedChallenges.add(uid);
  completedAtMap.set(uid, new Date().toISOString());

  // Return the updated challenge
  return {
    ...challenge,
    completed: true,
    completedAt: completedAtMap.get(uid),
  };
}
