/**
 * Custom hook for managing gamification state
 *
 * Provides access to XP, levels, streaks, and achievements.
 * Similar to useProgress but for gamification data.
 */

import { useState, useEffect, useCallback } from 'react';
import { GamificationTracker } from '../services/gamification/gamificationTracker';
import {
  GamificationData,
  XPEvent,
  Achievement,
  XPAwardResult,
  StreakUpdateResult,
} from '../types/gamification';
import { OpeningProgress, SessionStats } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

interface UseGamificationReturn {
  gamificationData: GamificationData | null;
  loading: boolean;
  xpHistory: XPEvent[];

  // XP methods
  awardXP: (event: XPEvent) => Promise<XPAwardResult>;

  // Achievement methods
  getAllAchievements: () => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievementsWithProgress: (
    progress: Record<string, OpeningProgress>,
    sessionHistory: SessionStats[]
  ) => Promise<Array<{ achievement: Achievement; progress: number; percentage: number }>>;
  getAchievementProgress: (achievementId: string) => number;

  // Streak methods
  updateStreak: (date: Date) => Promise<StreakUpdateResult>;

  // Utility methods
  refreshGamification: () => Promise<void>;
}

/**
 * Hook for accessing and managing gamification data
 */
export const useGamification = (): UseGamificationReturn => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [xpHistory, setXpHistory] = useState<XPEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load gamification data on mount
  useEffect(() => {
    loadGamification();
    loadXPHistory();
  }, []);

  /**
   * Load gamification data from storage
   */
  const loadGamification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await GamificationTracker.load();
      setGamificationData(data);
    } catch (error) {
      console.error('Error loading gamification:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load XP history
   */
  const loadXPHistory = useCallback(async () => {
    try {
      const history = await GamificationTracker.getXPHistory(20);
      setXpHistory(history);
    } catch (error) {
      console.error('Error loading XP history:', error);
    }
  }, []);

  /**
   * Award XP and check for level up
   */
  const awardXP = useCallback(
    async (event: XPEvent): Promise<XPAwardResult> => {
      try {
        const result = await GamificationTracker.awardXP(event);
        await loadGamification();
        await loadXPHistory();
        return result;
      } catch (error) {
        console.error('Error awarding XP:', error);
        throw error;
      }
    },
    [loadGamification, loadXPHistory]
  );

  /**
   * Update streak
   */
  const updateStreak = useCallback(
    async (date: Date): Promise<StreakUpdateResult> => {
      try {
        const result = await GamificationTracker.updateStreak(date);
        await loadGamification();
        return result;
      } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
      }
    },
    [loadGamification]
  );

  /**
   * Get all available achievements
   */
  const getAllAchievements = useCallback((): Achievement[] => {
    return ACHIEVEMENTS;
  }, []);

  /**
   * Get unlocked achievements
   */
  const getUnlockedAchievements = useCallback((): Achievement[] => {
    if (!gamificationData) return [];
    return ACHIEVEMENTS.filter((a) =>
      gamificationData.unlockedAchievements.includes(a.id)
    );
  }, [gamificationData]);

  /**
   * Get locked achievements with progress
   */
  const getLockedAchievementsWithProgress = useCallback(
    async (
      progress: Record<string, OpeningProgress>,
      sessionHistory: SessionStats[]
    ): Promise<Array<{ achievement: Achievement; progress: number; percentage: number }>> => {
      try {
        return await GamificationTracker.getLockedAchievementsWithProgress(
          progress,
          sessionHistory
        );
      } catch (error) {
        console.error('Error getting locked achievements:', error);
        return [];
      }
    },
    []
  );

  /**
   * Get progress toward a specific achievement
   */
  const getAchievementProgress = useCallback(
    (achievementId: string): number => {
      if (!gamificationData) return 0;
      return gamificationData.achievementProgress[achievementId] || 0;
    },
    [gamificationData]
  );

  /**
   * Refresh all gamification data
   */
  const refreshGamification = useCallback(async () => {
    await loadGamification();
    await loadXPHistory();
  }, [loadGamification, loadXPHistory]);

  return {
    gamificationData,
    loading,
    xpHistory,
    awardXP,
    getAllAchievements,
    getUnlockedAchievements,
    getLockedAchievementsWithProgress,
    getAchievementProgress,
    updateStreak,
    refreshGamification,
  };
};
