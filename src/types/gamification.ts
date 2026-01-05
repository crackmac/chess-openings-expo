/**
 * Gamification System Types
 *
 * This file contains type definitions for:
 * - Opening Roulette (weighted random selection)
 * - XP/Level system
 * - Streaks and achievements
 */

// ============================================================================
// Opening Roulette Types
// ============================================================================

/**
 * Weight multipliers for different difficulty ratings
 * - hard: 3.0 (3x more likely to be selected)
 * - good: 1.0 (standard frequency)
 * - easy: 0.3 (appear less often)
 * - unrated: 1.0 (neutral weight)
 */
export interface RouletteWeights {
  hard: number;
  good: number;
  easy: number;
  unrated: number;
}

/**
 * Configuration for time-based weight decay
 * Increases weight of easy openings that haven't been practiced recently
 */
export interface TimeDecayConfig {
  enabled: boolean;
  decayDays: number;          // Days before decay starts (e.g., 7 days)
  maxDecayMultiplier: number; // Max weight increase (e.g., 2.0 = 200%)
}

/**
 * Result of a roulette selection with debug information
 */
export interface RouletteSelection {
  opening: any; // Opening type - using any to avoid circular dependency
  weight: number;
  reason: string; // Debug info: "hard-rated", "time-decay", etc.
  lastPracticed?: Date;
}

// ============================================================================
// Gamification Data Types
// ============================================================================

/**
 * Main gamification data structure stored in AsyncStorage
 */
export interface GamificationData {
  // XP/Level System
  totalXP: number;
  level: number;
  xpForNextLevel: number;

  // Streaks
  currentStreak: number;        // consecutive days
  longestStreak: number;
  lastPracticeDate: Date;       // for streak calculation

  // Achievements
  unlockedAchievements: string[]; // achievement IDs
  achievementProgress: Record<string, number>; // partial progress
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;              // emoji or icon name
  category: AchievementCategory;
  requirement: number;       // threshold to unlock
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * Achievement categories
 */
export type AchievementCategory =
  | 'mastery'      // Master N openings
  | 'streak'       // Practice N days in a row
  | 'accuracy'     // Perfect sessions
  | 'dedication'   // Total practice time
  | 'exploration'; // Try different openings

/**
 * XP event for tracking XP awards
 */
export interface XPEvent {
  type: 'session_complete' | 'achievement_unlock' | 'streak_bonus' | 'perfect_session';
  xp: number;
  timestamp: Date;
  metadata?: Record<string, any>; // opening ID, accuracy, etc.
}

/**
 * Result of awarding XP
 */
export interface XPAwardResult {
  leveledUp: boolean;
  newLevel?: number;
  newAchievements?: Achievement[];
}

/**
 * Result of updating streak
 */
export interface StreakUpdateResult {
  streakContinued: boolean;
  currentStreak: number;
  newAchievements?: Achievement[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Achievement progress tracker
 */
export interface AchievementProgressTracker {
  achievementId: string;
  currentProgress: number;
  requirement: number;
  progressPercentage: number;
}

/**
 * XP configuration constants
 */
export interface XPConfig {
  baseSessionXP: number;
  accuracyMultiplier: number;
  completionBonus: number;
  firstTimeBonus: number;
  difficultyMultipliers: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}
