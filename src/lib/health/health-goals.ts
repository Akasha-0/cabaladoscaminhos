/**
 * Health goals module
 * Health objectives and tracking for holistic wellbeing
 */

export type GoalPriority = 'essential' | 'important' | 'optional';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalCategory =
  | 'fitness'
  | 'hydration'
  | 'nutrition'
  | 'sleep'
  | 'stress'
  | 'cardiovascular'
  | 'strength'
  | 'flexibility'
  | 'mental-health'
  | 'preventive-care';

export interface HealthGoal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetDaysPerWeek?: number;
  createdAt: Date;
}

const goals: HealthGoal[] = [
  {
    id: 'daily-water',
    name: 'Hydration Practice',
    description: 'Drink adequate water throughout the day for optimal body function',
    category: 'hydration',
    priority: 'essential',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'sleep-consistency',
    name: 'Sleep Hygiene',
    description: 'Maintain consistent sleep schedule for physical and mental restoration',
    category: 'sleep',
    priority: 'essential',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'cardio-training',
    name: 'Cardiovascular Health',
    description: 'Engage in regular cardio exercises for heart health and endurance',
    category: 'cardiovascular',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 5,
    createdAt: new Date(),
  },
  {
    id: 'strength-training',
    name: 'Strength Building',
    description: 'Build muscle strength and maintain bone density through resistance training',
    category: 'strength',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 3,
    createdAt: new Date(),
  },
  {
    id: 'flexibility-work',
    name: 'Flexibility and Mobility',
    description: 'Improve flexibility through stretching and mobility exercises',
    category: 'flexibility',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 4,
    createdAt: new Date(),
  },
  {
    id: 'stress-management',
    name: 'Stress Reduction',
    description: 'Practice stress management techniques for mental equilibrium',
    category: 'stress',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 6,
    createdAt: new Date(),
  },
  {
    id: 'mindful-eating',
    name: 'Conscious Nutrition',
    description: 'Maintain balanced nutrition with mindful eating practices',
    category: 'nutrition',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 7,
    createdAt: new Date(),
  },
  {
    id: 'mental-wellbeing',
    name: 'Mental Health Practice',
    description: 'Engage in activities that support psychological wellbeing',
    category: 'mental-health',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 5,
    createdAt: new Date(),
  },
  {
    id: 'preventive-checkups',
    name: 'Preventive Care',
    description: 'Schedule and maintain regular health screenings and checkups',
    category: 'preventive-care',
    priority: 'important',
    status: 'active',
    targetDaysPerWeek: 1,
    createdAt: new Date(),
  },
  {
    id: 'fitness-goal',
    name: 'Overall Fitness',
    description: 'Maintain regular physical activity for holistic health',
    category: 'fitness',
    priority: 'essential',
    status: 'active',
    targetDaysPerWeek: 5,
    createdAt: new Date(),
  },
];

/**
 * Get all health goals
 */
export function getGoals(): HealthGoal[] {
  return [...goals];
}

/**
 * Get goals by category
 */
export function getGoalsByCategory(category: GoalCategory): HealthGoal[] {
  return goals.filter((g) => g.category === category);
}

/**
 * Get goals by status
 */
export function getGoalsByStatus(status: GoalStatus): HealthGoal[] {
  return goals.filter((g) => g.status === status);
}

/**
 * Get goals by priority
 */
export function getGoalsByPriority(priority: GoalPriority): HealthGoal[] {
  return goals.filter((g) => g.priority === priority);
}

/**
 * Find goal by id
 */
export function getGoalById(id: string): HealthGoal | undefined {
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
  essential: number;
  byCategory: Record<GoalCategory, number>;
} {
  return {
    total: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    paused: goals.filter((g) => g.status === 'paused').length,
    essential: goals.filter((g) => g.priority === 'essential').length,
    byCategory: goals.reduce(
      (acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      },
      {} as Record<GoalCategory, number>
    ),
  };
}