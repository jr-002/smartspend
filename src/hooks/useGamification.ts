import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  ACHIEVEMENTS,
  LEVELS,
  CHALLENGE_TEMPLATES,
  POINT_VALUES,
  getLevelForPoints,
  getProgressToNextLevel,
  getAchievementById,
  type Achievement,
  type Level,
} from '@/lib/gamification-config';
import { gamificationEvents } from '@/lib/gamification-events';

interface GamificationData {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

interface Challenge {
  id: string;
  user_id: string;
  challenge_type: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  points_reward: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface UseGamificationReturn {
  // Data
  gamificationData: GamificationData | null;
  achievements: UserAchievement[];
  challenges: Challenge[];
  allAchievements: Achievement[];
  currentLevel: Level;
  levelProgress: { current: number; required: number; percentage: number };
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  addPoints: (points: number, reason?: string) => Promise<void>;
  checkAndAwardAchievement: (achievementId: string) => Promise<boolean>;
  updateStreak: () => Promise<void>;
  createChallenge: (type: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  updateChallengeProgress: (challengeId: string, amount: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useGamification(): UseGamificationReturn {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate current level and progress
  const currentLevel = gamificationData 
    ? getLevelForPoints(gamificationData.total_points)
    : LEVELS[0];
  
  const levelProgress = gamificationData
    ? getProgressToNextLevel(gamificationData.total_points)
    : { current: 0, required: 100, percentage: 0 };

  // Initialize or fetch gamification data
  const initializeGamification = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Try to fetch existing data
      const { data, error: fetchError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No data exists, create initial record
        const { data: newData, error: insertError } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setGamificationData(newData);
      } else if (fetchError) {
        throw fetchError;
      } else {
        setGamificationData(data);
      }
    } catch (err) {
      console.error('Error initializing gamification:', err);
      setError('Failed to load gamification data');
    }
  }, [user?.id]);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  }, [user?.id]);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('savings_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('end_date', { ascending: true });

      if (fetchError) throw fetchError;
      setChallenges(data || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }, [user?.id]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([
      initializeGamification(),
      fetchAchievements(),
      fetchChallenges(),
    ]);
    setLoading(false);
  }, [initializeGamification, fetchAchievements, fetchChallenges]);

  // Add points
  const addPoints = useCallback(async (points: number, reason?: string) => {
    if (!user?.id || !gamificationData) return;

    const newTotal = gamificationData.total_points + points;
    const newLevel = getLevelForPoints(newTotal);
    const leveledUp = newLevel.level > gamificationData.current_level;

    try {
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update({
          total_points: newTotal,
          current_level: newLevel.level,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setGamificationData(prev => prev ? {
        ...prev,
        total_points: newTotal,
        current_level: newLevel.level,
      } : null);

      // Show toast for points earned
      if (reason) {
        toast({
          title: `+${points} Points!`,
          description: reason,
        });
      }

      // Show level up toast
      if (leveledUp) {
        toast({
          title: `🎉 Level Up!`,
          description: `You're now ${newLevel.icon} ${newLevel.name}!`,
        });
      }
    } catch (err) {
      console.error('Error adding points:', err);
    }
  }, [user?.id, gamificationData]);

  // Check and award achievement
  const checkAndAwardAchievement = useCallback(async (achievementId: string): Promise<boolean> => {
    if (!user?.id) return false;

    // Check if already earned
    const alreadyEarned = achievements.some(a => a.achievement_id === achievementId);
    if (alreadyEarned) return false;

    const achievement = getAchievementById(achievementId);
    if (!achievement) return false;

    try {
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (insertError) {
        if (insertError.code === '23505') return false; // Already exists
        throw insertError;
      }

      // Award points for the achievement
      await addPoints(achievement.points, `Achievement unlocked: ${achievement.name}`);

      // Update local state
      setAchievements(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: user.id,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
      }]);

      // Show achievement toast
      toast({
        title: `${achievement.icon} Achievement Unlocked!`,
        description: achievement.name,
      });

      return true;
    } catch (err) {
      console.error('Error awarding achievement:', err);
      return false;
    }
  }, [user?.id, achievements, addPoints]);

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!user?.id || !gamificationData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gamificationData.last_activity_date;

    if (lastActivity === today) return; // Already updated today

    let newStreak = 1;
    if (lastActivity) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === yesterdayStr) {
        newStreak = gamificationData.current_streak + 1;
      }
    }

    const newLongestStreak = Math.max(newStreak, gamificationData.longest_streak);

    try {
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setGamificationData(prev => prev ? {
        ...prev,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
      } : null);

      // Award streak bonus points
      const streakBonus = POINT_VALUES.DAILY_LOGIN + (newStreak * POINT_VALUES.STREAK_BONUS_PER_DAY);
      await addPoints(streakBonus, `Day ${newStreak} streak bonus!`);

      // Check streak achievements
      if (newStreak >= 7) await checkAndAwardAchievement('week_warrior');
      if (newStreak >= 14) await checkAndAwardAchievement('fortnight_fighter');
      if (newStreak >= 30) await checkAndAwardAchievement('month_master');
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [user?.id, gamificationData, addPoints, checkAndAwardAchievement]);

  // Create a challenge
  const createChallenge = useCallback(async (type: 'daily' | 'weekly' | 'monthly') => {
    if (!user?.id) return;

    const templates = CHALLENGE_TEMPLATES.filter(t => t.type === type);
    const template = templates[Math.floor(Math.random() * templates.length)];
    if (!template) return;

    const startDate = new Date();
    const endDate = new Date();
    
    switch (type) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('savings_challenges')
        .insert({
          user_id: user.id,
          challenge_type: type,
          title: template.title,
          description: template.description,
          target_amount: template.targetAmount,
          points_reward: template.pointsReward,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setChallenges(prev => [...prev, data]);

      toast({
        title: 'New Challenge!',
        description: template.title,
      });
    } catch (err) {
      console.error('Error creating challenge:', err);
    }
  }, [user?.id]);

  // Update challenge progress
  const updateChallengeProgress = useCallback(async (challengeId: string, amount: number) => {
    if (!user?.id) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const newAmount = challenge.current_amount + amount;

    try {
      const { error: updateError } = await supabase
        .from('savings_challenges')
        .update({ current_amount: newAmount })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      setChallenges(prev => prev.map(c =>
        c.id === challengeId ? { ...c, current_amount: newAmount } : c
      ));

      // Auto-complete if target reached
      if (newAmount >= challenge.target_amount) {
        await completeChallenge(challengeId);
      }
    } catch (err) {
      console.error('Error updating challenge:', err);
    }
  }, [user?.id, challenges]);

  // Complete a challenge
  const completeChallenge = useCallback(async (challengeId: string) => {
    if (!user?.id) return;

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    try {
      const { error: updateError } = await supabase
        .from('savings_challenges')
        .update({ status: 'completed' })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      setChallenges(prev => prev.filter(c => c.id !== challengeId));

      await addPoints(challenge.points_reward, `Challenge completed: ${challenge.title}`);

      toast({
        title: '🎉 Challenge Completed!',
        description: `You earned ${challenge.points_reward} points!`,
      });
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  }, [user?.id, challenges, addPoints]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user?.id, refreshData]);

  // Listen for gamification events
  useEffect(() => {
    if (!user?.id || !gamificationData) return;

    const unsubscribe = gamificationEvents.subscribe(async (event) => {
      switch (event.type) {
        case 'transaction_added':
          await addPoints(POINT_VALUES.TRANSACTION_LOGGED, 'Transaction logged');
          await checkAndAwardAchievement('first_transaction');
          break;
        case 'savings_goal_created':
          await addPoints(POINT_VALUES.SAVINGS_GOAL_CREATED, 'New savings goal created');
          await checkAndAwardAchievement('goal_setter');
          break;
        case 'savings_goal_updated':
          const { currentAmount, targetAmount } = event.data as { currentAmount: number; targetAmount: number };
          const percentage = (currentAmount / targetAmount) * 100;
          if (percentage >= 50 && percentage < 100) {
            await checkAndAwardAchievement('halfway_there');
          }
          break;
        case 'savings_goal_completed':
          await addPoints(POINT_VALUES.SAVINGS_GOAL_COMPLETED, 'Savings goal completed!');
          await checkAndAwardAchievement('goal_achieved');
          break;
        case 'budget_created':
          await addPoints(POINT_VALUES.BUDGET_CREATED, 'Budget created');
          await checkAndAwardAchievement('budget_creator');
          break;
        case 'debt_payment':
          await addPoints(POINT_VALUES.DEBT_PAYMENT, 'Debt payment made');
          break;
        case 'debt_paid_off':
          await addPoints(POINT_VALUES.DEBT_PAID_OFF, 'Debt paid off!');
          await checkAndAwardAchievement('debt_destroyer');
          break;
      }
    });

    return unsubscribe;
  }, [user?.id, gamificationData?.id, addPoints, checkAndAwardAchievement]);

  return {
    gamificationData,
    achievements,
    challenges,
    allAchievements: ACHIEVEMENTS,
    currentLevel,
    levelProgress,
    loading,
    error,
    addPoints,
    checkAndAwardAchievement,
    updateStreak,
    createChallenge,
    updateChallengeProgress,
    completeChallenge,
    refreshData,
  };
}
