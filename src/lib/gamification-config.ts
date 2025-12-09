// Gamification configuration - achievements, levels, and point values

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'savings' | 'transactions' | 'budgets' | 'streaks' | 'goals' | 'debts';
}

export interface Level {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
}

export interface ChallengeTemplate {
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  targetAmount: number;
  pointsReward: number;
}

// Point values for different actions
export const POINT_VALUES = {
  TRANSACTION_LOGGED: 10,
  SAVINGS_GOAL_CREATED: 50,
  SAVINGS_GOAL_50_PERCENT: 100,
  SAVINGS_GOAL_COMPLETED: 200,
  BUDGET_CREATED: 25,
  BUDGET_UNDER_LIMIT: 50,
  DEBT_PAYMENT: 30,
  DEBT_PAID_OFF: 250,
  DAILY_LOGIN: 5,
  STREAK_BONUS_PER_DAY: 2,
  CHALLENGE_COMPLETED: 0, // Uses challenge's own reward
} as const;

// Level definitions
export const LEVELS: Level[] = [
  { level: 1, name: 'Saver Novice', minPoints: 0, maxPoints: 100, icon: '🌱' },
  { level: 2, name: 'Budget Builder', minPoints: 101, maxPoints: 500, icon: '🏗️' },
  { level: 3, name: 'Finance Pro', minPoints: 501, maxPoints: 1500, icon: '📊' },
  { level: 4, name: 'Money Master', minPoints: 1501, maxPoints: 5000, icon: '💎' },
  { level: 5, name: 'Wealth Champion', minPoints: 5001, maxPoints: Infinity, icon: '👑' },
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Transaction achievements
  {
    id: 'first_transaction',
    name: 'First Steps',
    description: 'Log your first transaction',
    icon: '📝',
    points: 10,
    category: 'transactions',
  },
  {
    id: 'transaction_tracker_10',
    name: 'Transaction Tracker',
    description: 'Log 10 transactions',
    icon: '📋',
    points: 50,
    category: 'transactions',
  },
  {
    id: 'transaction_master_50',
    name: 'Transaction Master',
    description: 'Log 50 transactions',
    icon: '📚',
    points: 150,
    category: 'transactions',
  },
  
  // Savings achievements
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Create your first savings goal',
    icon: '🎯',
    points: 50,
    category: 'goals',
  },
  {
    id: 'halfway_there',
    name: 'Halfway There',
    description: 'Reach 50% of any savings goal',
    icon: '🚀',
    points: 100,
    category: 'goals',
  },
  {
    id: 'goal_achieved',
    name: 'Goal Achieved',
    description: 'Complete a savings goal',
    icon: '🏆',
    points: 200,
    category: 'goals',
  },
  {
    id: 'triple_goals',
    name: 'Triple Threat',
    description: 'Complete 3 savings goals',
    icon: '🥇',
    points: 500,
    category: 'goals',
  },
  
  // Budget achievements
  {
    id: 'budget_creator',
    name: 'Budget Creator',
    description: 'Create your first budget',
    icon: '💰',
    points: 25,
    category: 'budgets',
  },
  {
    id: 'budget_keeper',
    name: 'Budget Keeper',
    description: 'Stay under budget for a month',
    icon: '🛡️',
    points: 100,
    category: 'budgets',
  },
  
  // Streak achievements
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day activity streak',
    icon: '🔥',
    points: 75,
    category: 'streaks',
  },
  {
    id: 'fortnight_fighter',
    name: 'Fortnight Fighter',
    description: '14-day activity streak',
    icon: '⚡',
    points: 150,
    category: 'streaks',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: '30-day activity streak',
    icon: '🌟',
    points: 300,
    category: 'streaks',
  },
  
  // Debt achievements
  {
    id: 'debt_destroyer',
    name: 'Debt Destroyer',
    description: 'Pay off a debt completely',
    icon: '💪',
    points: 250,
    category: 'debts',
  },
  {
    id: 'debt_free',
    name: 'Debt Free',
    description: 'Pay off all debts',
    icon: '🎉',
    points: 500,
    category: 'debts',
  },
];

// Challenge templates
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Daily challenges
  {
    type: 'daily',
    title: 'Daily Tracker',
    description: 'Log at least one transaction today',
    targetAmount: 1,
    pointsReward: 15,
  },
  {
    type: 'daily',
    title: 'Save Something',
    description: 'Add any amount to your savings today',
    targetAmount: 1,
    pointsReward: 20,
  },
  
  // Weekly challenges
  {
    type: 'weekly',
    title: 'Weekly Logger',
    description: 'Log 5 transactions this week',
    targetAmount: 5,
    pointsReward: 50,
  },
  {
    type: 'weekly',
    title: 'Budget Check',
    description: 'Stay under budget in all categories this week',
    targetAmount: 1,
    pointsReward: 75,
  },
  
  // Monthly challenges
  {
    type: 'monthly',
    title: 'Savings Boost',
    description: 'Increase your total savings by 10% this month',
    targetAmount: 10,
    pointsReward: 150,
  },
  {
    type: 'monthly',
    title: 'Consistent Saver',
    description: 'Add to savings at least 4 times this month',
    targetAmount: 4,
    pointsReward: 100,
  },
];

// Helper functions
export function getLevelForPoints(points: number): Level {
  return LEVELS.find(level => points >= level.minPoints && points <= level.maxPoints) || LEVELS[0];
}

export function getProgressToNextLevel(points: number): { current: number; required: number; percentage: number } {
  const currentLevel = getLevelForPoints(points);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) {
    return { current: points, required: points, percentage: 100 };
  }
  
  const pointsInCurrentLevel = points - currentLevel.minPoints;
  const pointsRequiredForNextLevel = nextLevel.minPoints - currentLevel.minPoints;
  const percentage = Math.min(100, (pointsInCurrentLevel / pointsRequiredForNextLevel) * 100);
  
  return {
    current: pointsInCurrentLevel,
    required: pointsRequiredForNextLevel,
    percentage,
  };
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
