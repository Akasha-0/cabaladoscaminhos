/**
 * Wellness goals module
 * Sacred intentions and wellness objectives for spiritual journey
 */

export type GoalPriority = 'essential' | 'important' | 'optional';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalCategory = 
  | 'meditation'
  | 'ritual'
  | 'movement'
  | 'nutrition'
  | 'sleep'
  | 'mindfulness'
  | 'breathwork'
  | 'nature';

export interface WellnessGoal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetDaysPerWeek?: number;
  createdAt: Date;
}

const goals: WellnessGoal[] = [
  {
    id: 'daily-meditation',
    name: 'Daily Meditation Practice',
    description: 'Maintain consistent daily meditation sessions for spiritual alignment',
    category: 'meditation',
    priority: 'essential',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'morning-ritual',
    name: 'Morning Sacred Ritual',
    description: 'Begin each day with grounding and invocation practices',
    category: 'ritual',
    priority: 'essential',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'evening-meditation',
    name: 'Evening Reflection',
    description: 'Close the day with gratitude and release practices',
    category: 'meditation',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'weekly-sabbath',
    name: 'Weekly Spiritual Rest',
    description: 'Dedicate one day for deeper spiritual practice and rest',
    category: 'ritual',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 1,
    createdAt: new Date(),
  },
  {
    id: 'breathwork-practice',
    name: 'Sacred Breathwork',
    description: 'Practice pranayama or sacred breathing techniques',
    category: 'breathwork',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 5,
    createdAt: new Date(),
  },
  {
    id: 'movement-practice',
    name: 'Embodied Movement',
    description: 'Practice yoga, tai chi, or sacred movement for body-spirit connection',
    category: 'movement',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 4,
    createdAt: new Date(),
  },
  {
    id: 'nature-connection',
    name: 'Earth Communion',
    description: 'Spend time in nature for grounding and elemental balance',
    category: 'nature',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 3,
    createdAt: new Date(),
  },
  {
    id: 'sleep-hygiene',
    name: 'Sacred Sleep',
    description: 'Maintain consistent sleep schedule for spiritual integration',
    category: 'sleep',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'mindful-eating',
    name: 'Conscious Nutrition',
    description: 'Practice mindful eating with gratitude for nourishment',
    category: 'nutrition',
    priority: 'optional',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'gratitude-practice',
    name: 'Gratitude Devotion',
    description: 'Cultivate gratitude through daily acknowledgment of blessings',
    category: 'mindfulness',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
];

/**
 * Get all wellness goals
 */
export function getGoals(): WellnessGoal[] {
  return [...goals];
}

/**
 * Get goals by category
 */
export function getGoalsByCategory(category: GoalCategory): WellnessGoal[] {
  return goals.filter((g) => g.category === category);
}

/**
 * Get goals by status
 */
export function getGoalsByStatus(status: GoalStatus): WellnessGoal[] {
  return goals.filter((g) => g.status === status);
}

/**
 * Get goals by priority
 */
export function getGoalsByPriority(priority: GoalPriority): WellnessGoal[] {
  return goals.filter((g) => g.priority === priority);
}

/**
 * Find goal by id
 */
export function getGoalById(id: string): WellnessGoal | undefined {
  return goals.find((g) => g.id === id);
}

/**
 * Update goal status
 */
export function updateGoalStatus(id: string, status: GoalStatus): boolean {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return false;
  goal.status = status;
  return true;
}

/**
 * Get goal statistics
 */
export function getGoalStats(): {
  total: number;
  active: number;
  completed: number;
  paused: number;
  byCategory: Record<GoalCategory, number>;
  byPriority: Record<GoalPriority, number>;
} {
  const byCategory = goals.reduce(
    (acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    },
    {} as Record<GoalCategory, number>
  );

  const byPriority = goals.reduce(
    (acc, g) => {
      acc[g.priority] = (acc[g.priority] || 0) + 1;
      return acc;
    },
    {} as Record<GoalPriority, number>
  );

  return {
    total: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    paused: goals.filter((g) => g.status === 'paused').length,
    byCategory,
    byPriority,
  };
}