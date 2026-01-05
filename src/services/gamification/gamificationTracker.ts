/**
 * Gamification Tracker Service
 *
 * Manages XP, levels, streaks, and achievements.
 * Persists data to AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GamificationData,
  XPEvent,
  Achievement,
  XPAwardResult,
  StreakUpdateResult,
} from '../../types/gamification';
import { OpeningProgress, SessionStats, Opening } from '../../types';
import { ACHIEVEMENTS } from '../../data/achievements';

/**
 * XP Configuration
 */
const XP_CONFIG = {
  baseSessionXP: 10,
  accuracyMultiplier: 0.4, // Max 40 XP from accuracy
  completionBonus: 20,
  firstTimeBonus: 30,
  difficultyMultipliers: {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
  },
};

/**
 * Gamification Tracker Service
 * Handles all gamification-related operations
 */
export class GamificationTracker {
  private static STORAGE_KEY = '@chess_openings:gamification';
  private static XP_HISTORY_KEY = '@chess_openings:xp_history';

  // ============================================================================
  // Initialization & Loading
  // ============================================================================

  /**
   * Initialize new gamification data for a user
   */
  static async initialize(): Promise<GamificationData> {
    const data: GamificationData = {
      totalXP: 0,
      level: 1,
      xpForNextLevel: 100,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: new Date(),
      unlockedAchievements: [],
      achievementProgress: {},
    };

    await this.save(data);
    return data;
  }

  /**
   * Load gamification data from AsyncStorage
   */
  static async load(): Promise<GamificationData> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return await this.initialize();
      }

      return this.deserialize(JSON.parse(data));
    } catch (error) {
      console.error('Error loading gamification data:', error);
      return await this.initialize();
    }
  }

  /**
   * Save gamification data to AsyncStorage
   */
  private static async save(data: GamificationData): Promise<void> {
    try {
      const serialized = this.serialize(data);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving gamification data:', error);
      throw error;
    }
  }

  // ============================================================================
  // XP System
  // ============================================================================

  /**
   * Award XP and check for level up
   */
  static async awardXP(event: XPEvent): Promise<XPAwardResult> {
    const data = await this.load();
    data.totalXP += event.xp;

    // Check level up
    const { level, xpForNext } = this.calculateLevel(data.totalXP);
    const leveledUp = level > data.level;

    data.level = level;
    data.xpForNextLevel = xpForNext;

    await this.save(data);
    await this.saveXPEvent(event);

    return {
      leveledUp,
      newLevel: leveledUp ? level : undefined,
    };
  }

  /**
   * Calculate session XP based on performance
   */
  static calculateSessionXP(
    stats: SessionStats,
    progress: OpeningProgress,
    opening: Opening
  ): number {
    let baseXP = XP_CONFIG.baseSessionXP;

    // Accuracy bonus (0-40 XP)
    const accuracyBonus = Math.floor(stats.accuracy * XP_CONFIG.accuracyMultiplier);

    // Completion bonus (20 XP)
    const completionBonus =
      stats.correctMoves === stats.totalMoves ? XP_CONFIG.completionBonus : 0;

    // First-time bonus (30 XP)
    const firstTimeBonus =
      progress.timesPracticed === 1 ? XP_CONFIG.firstTimeBonus : 0;

    // Difficulty multiplier
    const difficultyMultiplier =
      XP_CONFIG.difficultyMultipliers[opening.difficulty] || 1.0;

    const totalXP =
      (baseXP + accuracyBonus + completionBonus + firstTimeBonus) *
      difficultyMultiplier;

    return Math.floor(totalXP);
  }

  /**
   * Calculate level from XP using exponential curve
   * Formula: XP_needed = 100 * 1.5^(level-1)
   */
  static calculateLevel(xp: number): { level: number; xpForNext: number } {
    let level = 1;
    let xpRequired = 100;
    let totalXP = 0;

    while (totalXP + xpRequired <= xp) {
      totalXP += xpRequired;
      level += 1;
      xpRequired = Math.floor(100 * Math.pow(1.5, level - 1));
    }

    return { level, xpForNext: xpRequired };
  }

  /**
   * Save XP event to history
   */
  private static async saveXPEvent(event: XPEvent): Promise<void> {
    try {
      const history = await this.getXPHistory();
      history.unshift(event); // Add to beginning

      // Keep only last 100 events
      const limited = history.slice(0, 100);

      await AsyncStorage.setItem(
        this.XP_HISTORY_KEY,
        JSON.stringify(this.serializeXPEvents(limited))
      );
    } catch (error) {
      console.error('Error saving XP event:', error);
    }
  }

  /**
   * Get XP history
   */
  static async getXPHistory(limit: number = 20): Promise<XPEvent[]> {
    try {
      const data = await AsyncStorage.getItem(this.XP_HISTORY_KEY);
      if (!data) return [];

      const events = this.deserializeXPEvents(JSON.parse(data));
      return events.slice(0, limit);
    } catch (error) {
      console.error('Error loading XP history:', error);
      return [];
    }
  }

  // ============================================================================
  // Streak System
  // ============================================================================

  /**
   * Update streak based on practice date
   */
  static async updateStreak(practiceDate: Date): Promise<StreakUpdateResult> {
    const data = await this.load();

    const daysDiff = Math.floor(
      (practiceDate.getTime() - data.lastPracticeDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let streakContinued = false;

    if (daysDiff === 0) {
      // Same day - no change
      return { streakContinued: false, currentStreak: data.currentStreak };
    } else if (daysDiff === 1) {
      // Next day - increment streak
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
      data.lastPracticeDate = practiceDate;
      streakContinued = true;
    } else {
      // Missed day(s) - reset streak
      data.currentStreak = 1;
      data.lastPracticeDate = practiceDate;
      streakContinued = false;
    }

    await this.save(data);

    return { streakContinued, currentStreak: data.currentStreak };
  }

  // ============================================================================
  // Achievement System
  // ============================================================================

  /**
   * Check all achievements and unlock any that meet requirements
   */
  static async checkAchievements(
    data: GamificationData,
    progress: Record<string, OpeningProgress>,
    sessionHistory: SessionStats[]
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip already unlocked
      if (data.unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      const currentProgress = this.getAchievementProgress(
        achievement,
        data,
        progress,
        sessionHistory
      );

      // Update progress tracking
      data.achievementProgress[achievement.id] = currentProgress;

      // Check if unlocked
      if (currentProgress >= achievement.requirement) {
        data.unlockedAchievements.push(achievement.id);
        newAchievements.push(achievement);

        // Award achievement XP
        await this.awardXP({
          type: 'achievement_unlock',
          xp: achievement.xpReward,
          timestamp: new Date(),
          metadata: { achievementId: achievement.id },
        });
      }
    }

    await this.save(data);
    return newAchievements;
  }

  /**
   * Get progress toward a specific achievement
   */
  static getAchievementProgress(
    achievement: Achievement,
    data: GamificationData,
    progress: Record<string, OpeningProgress>,
    sessionHistory: SessionStats[]
  ): number {
    switch (achievement.category) {
      case 'mastery': {
        // Count openings with 5-star mastery
        const masteredCount = Object.values(progress).filter(
          (p) => p.masteryLevel === 5
        ).length;
        return masteredCount;
      }

      case 'streak': {
        // Use longest streak for streak achievements
        return data.longestStreak;
      }

      case 'accuracy': {
        // Count perfect sessions (100% accuracy)
        const perfectSessions = sessionHistory.filter(
          (s) => s.accuracy === 100
        ).length;
        return perfectSessions;
      }

      case 'exploration': {
        // Count unique openings practiced
        const uniqueOpenings = Object.keys(progress).length;
        return uniqueOpenings;
      }

      case 'dedication': {
        // Sum total practice time in minutes
        const totalMinutes = sessionHistory.reduce(
          (sum, s) => sum + (s.duration || 0),
          0
        );
        return totalMinutes;
      }

      default:
        return 0;
    }
  }

  /**
   * Get all unlocked achievements
   */
  static async getUnlockedAchievements(): Promise<Achievement[]> {
    const data = await this.load();
    return ACHIEVEMENTS.filter((a) =>
      data.unlockedAchievements.includes(a.id)
    );
  }

  /**
   * Get locked achievements with progress
   */
  static async getLockedAchievementsWithProgress(
    progress: Record<string, OpeningProgress>,
    sessionHistory: SessionStats[]
  ): Promise<Array<{ achievement: Achievement; progress: number; percentage: number }>> {
    const data = await this.load();

    return ACHIEVEMENTS.filter(
      (a) => !data.unlockedAchievements.includes(a.id)
    ).map((achievement) => {
      const currentProgress = this.getAchievementProgress(
        achievement,
        data,
        progress,
        sessionHistory
      );
      const percentage = Math.min(
        (currentProgress / achievement.requirement) * 100,
        100
      );

      return {
        achievement,
        progress: currentProgress,
        percentage,
      };
    });
  }

  // ============================================================================
  // Serialization
  // ============================================================================

  /**
   * Serialize gamification data for storage
   */
  private static serialize(data: GamificationData): any {
    return {
      ...data,
      lastPracticeDate: data.lastPracticeDate.toISOString(),
    };
  }

  /**
   * Deserialize gamification data from storage
   */
  private static deserialize(data: any): GamificationData {
    return {
      ...data,
      lastPracticeDate: new Date(data.lastPracticeDate),
    };
  }

  /**
   * Serialize XP events for storage
   */
  private static serializeXPEvents(events: XPEvent[]): any[] {
    return events.map((event) => ({
      ...event,
      timestamp: event.timestamp.toISOString(),
    }));
  }

  /**
   * Deserialize XP events from storage
   */
  private static deserializeXPEvents(data: any[]): XPEvent[] {
    return data.map((event) => ({
      ...event,
      timestamp: new Date(event.timestamp),
    }));
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Clear all gamification data (for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.XP_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing gamification data:', error);
    }
  }
}
