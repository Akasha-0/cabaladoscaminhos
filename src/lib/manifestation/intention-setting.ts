/**
 * Intention Setting & Goal Tracking
 * Cabala Dos Caminhos - Manifestation Module
 */

export interface Intention {
  id: string;
  text: string;
  createdAt: Date;
  targetDate?: Date;
  category?: string;
  status: 'active' | 'completed' | 'archived';
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Goal {
  id: string;
  title: string;
  intentionId: string;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store (replace with DB/Redis in production)
const intentions = new Map<string, Intention>();
const goals = new Map<string, Goal>();

/**
 * Set a new intention with optional goal tracking
 */
export function setIntention(
  text: string,
  options?: {
    targetDate?: Date;
    category?: string;
    milestones?: string[];
  }
): Intention {
  const id = crypto.randomUUID();
  const now = new Date();

  const intention: Intention = {
    id,
    text,
    createdAt: now,
    targetDate: options?.targetDate,
    category: options?.category,
    status: 'active',
    milestones: (options?.milestones ?? []).map((desc) => ({
      id: crypto.randomUUID(),
      description: desc,
      completed: false,
    })),
  };

  intentions.set(id, intention);

  return intention;
}

/**
 * Get an intention by ID
 */
export function getIntention(id: string): Intention | undefined {
  return intentions.get(id);
}

/**
 * Get all active intentions
 */
export function getActiveIntentions(): Intention[] {
  return [...intentions.values()].filter((i) => i.status === 'active');
}

/**
 * Complete a milestone within an intention
 */
export function completeMilestone(
  intentionId: string,
  milestoneId: string
): boolean {
  const intention = intentions.get(intentionId);
  if (!intention) return false;

  const milestone = intention.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return false;

  milestone.completed = true;
  milestone.completedAt = new Date();

  // Auto-complete intention if all milestones done
  if (intention.milestones.every((m) => m.completed)) {
    intention.status = 'completed';
  }

  return true;
}

/**
 * Archive an intention
 */
export function archiveIntention(id: string): boolean {
  const intention = intentions.get(id);
  if (!intention) return false;

  intention.status = 'archived';
  return true;
}

/**
 * Create or update a goal linked to an intention
 */
export function trackGoal(intentionId: string, title: string): Goal {
  const existing = [...goals.values()].find(
    (g) => g.intentionId === intentionId && g.title === title
  );

  if (existing) return existing;

  const goal: Goal = {
    id: crypto.randomUUID(),
    title,
    intentionId,
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  goals.set(goal.id, goal);
  return goal;
}

/**
 * Update goal progress
 */
export function updateGoalProgress(goalId: string, progress: number): Goal | undefined {
  const goal = goals.get(goalId);
  if (!goal) return undefined;

  goal.progress = Math.max(0, Math.min(100, progress));
  goal.updatedAt = new Date();
  return goal;
}

/**
 * Get goals for an intention
 */
export function getGoalsForIntention(intentionId: string): Goal[] {
  return [...goals.values()].filter((g) => g.intentionId === intentionId);
}