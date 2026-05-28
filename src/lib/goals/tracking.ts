const STORAGE_KEY = 'goals_tracking';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Milestone {
  id: string;
  title: string;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  milestones: Milestone[];
  progress: number; // 0-100
  category?: string;
}

interface GoalsStore {
  goals: Goal[];
}

function loadState(): GoalsStore {
  if (typeof window === 'undefined') {
    return { goals: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { goals: [] };
  } catch {
    return { goals: [] };
  }
}

function saveState(state: GoalsStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function trackGoal(
  id: string,
  title: string,
  options?: {
    description?: string;
    category?: string;
    milestones?: Array<{ id: string; title: string }>;
  }
): Goal {
  const state = loadState();
  const existing = state.goals.find((g) => g.id === id);

  if (existing) {
    existing.updatedAt = new Date().toISOString();
    if (existing.status === 'active') {
      existing.progress = Math.min(100, existing.progress + 10);
    }
    saveState(state);
    return existing;
  }

  const goal: Goal = {
    id,
    title,
    description: options?.description,
    category: options?.category,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    milestones: (options?.milestones ?? []).map((m) => ({
      id: m.id,
      title: m.title,
    })),
  };

  state.goals.push(goal);
  saveState(state);
  return goal;
}

export function getGoalProgress(id?: string): Goal | Goal[] {
  const state = loadState();
  if (id) {
    return state.goals.find((g) => g.id === id) ?? ([] as unknown as Goal);
  }
  return state.goals;
}

export function completeGoal(id: string): Goal | null {
  const state = loadState();
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return null;

  goal.status = 'completed';
  goal.completedAt = new Date().toISOString();
  goal.updatedAt = goal.completedAt;
  goal.progress = 100;

  saveState(state);
  return goal;
}

export function updateGoalProgress(id: string, progress: number): Goal | null {
  const state = loadState();
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return null;

  goal.progress = Math.max(0, Math.min(100, progress));
  goal.updatedAt = new Date().toISOString();

  if (goal.progress === 100) {
    goal.status = 'completed';
    goal.completedAt = goal.updatedAt;
  }

  saveState(state);
  return goal;
}

export function completeMilestone(goalId: string, milestoneId: string): Goal | null {
  const state = loadState();
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return null;

  const milestone = goal.milestones.find((m) => m.id === milestoneId);
  if (!milestone || milestone.completedAt) return goal;

  milestone.completedAt = new Date().toISOString();
  goal.updatedAt = new Date().toISOString();

  if (goal.milestones.length > 0) {
    const completedCount = goal.milestones.filter((m) => m.completedAt).length;
    goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
  }

  if (goal.progress === 100) {
    goal.status = 'completed';
    goal.completedAt = goal.updatedAt;
  }

  saveState(state);
  return goal;
}

export function pauseGoal(id: string): Goal | null {
  const state = loadState();
  const goal = state.goals.find((g) => g.id === id);
  if (!goal || goal.status !== 'active') return null;

  goal.status = 'paused';
  goal.updatedAt = new Date().toISOString();
  saveState(state);
  return goal;
}

export function resumeGoal(id: string): Goal | null {
  const state = loadState();
  const goal = state.goals.find((g) => g.id === id);
  if (!goal || goal.status !== 'paused') return null;

  goal.status = 'active';
  goal.updatedAt = new Date().toISOString();
  saveState(state);
  return goal;
}

export function deleteGoal(id: string): boolean {
  const state = loadState();
  const index = state.goals.findIndex((g) => g.id === id);
  if (index === -1) return false;

  state.goals.splice(index, 1);
  saveState(state);
  return true;
}

export function getActiveGoals(): Goal[] {
  return loadState().goals.filter((g) => g.status === 'active');
}

export function getCompletedGoals(): Goal[] {
  return loadState().goals.filter((g) => g.status === 'completed');
}
