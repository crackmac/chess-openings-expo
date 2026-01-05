/**
 * Achievement Definitions
 *
 * All achievements available in the gamification system.
 * Achievements are unlocked based on progress and behavior.
 */

import { Achievement } from '../types/gamification';

/**
 * All available achievements
 * Organized by category: mastery, streak, accuracy, exploration, dedication
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ============================================================================
  // Mastery Achievements - Achieving high mastery levels in openings
  // ============================================================================
  {
    id: 'first_master',
    name: 'First Master',
    description: 'Achieve 5-star mastery in any opening',
    icon: '⭐',
    category: 'mastery',
    requirement: 1,
    xpReward: 50,
    tier: 'bronze',
  },
  {
    id: 'opening_scholar',
    name: 'Opening Scholar',
    description: 'Master 5 different openings',
    icon: '🎓',
    category: 'mastery',
    requirement: 5,
    xpReward: 200,
    tier: 'gold',
  },
  {
    id: 'opening_expert',
    name: 'Opening Expert',
    description: 'Master 10 different openings',
    icon: '📚',
    category: 'mastery',
    requirement: 10,
    xpReward: 350,
    tier: 'gold',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Master 15 openings',
    icon: '👑',
    category: 'mastery',
    requirement: 15,
    xpReward: 500,
    tier: 'platinum',
  },

  // ============================================================================
  // Streak Achievements - Practicing consistently
  // ============================================================================
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    xpReward: 25,
    tier: 'bronze',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    xpReward: 100,
    tier: 'silver',
  },
  {
    id: 'fortnight_champion',
    name: 'Fortnight Champion',
    description: 'Practice 14 days in a row',
    icon: '🔥',
    category: 'streak',
    requirement: 14,
    xpReward: 250,
    tier: 'gold',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Practice 30 days in a row',
    icon: '🔥🔥',
    category: 'streak',
    requirement: 30,
    xpReward: 500,
    tier: 'platinum',
  },
  {
    id: 'century_legend',
    name: 'Century Legend',
    description: 'Practice 100 days in a row',
    icon: '🏆',
    category: 'streak',
    requirement: 100,
    xpReward: 1000,
    tier: 'platinum',
  },

  // ============================================================================
  // Accuracy Achievements - Perfect performance
  // ============================================================================
  {
    id: 'first_perfect',
    name: 'First Perfect',
    description: 'Complete your first perfect session (100% accuracy)',
    icon: '✨',
    category: 'accuracy',
    requirement: 1,
    xpReward: 30,
    tier: 'bronze',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 perfect sessions',
    icon: '💯',
    category: 'accuracy',
    requirement: 10,
    xpReward: 150,
    tier: 'gold',
  },
  {
    id: 'flawless_master',
    name: 'Flawless Master',
    description: 'Complete 25 perfect sessions',
    icon: '💎',
    category: 'accuracy',
    requirement: 25,
    xpReward: 400,
    tier: 'platinum',
  },

  // ============================================================================
  // Exploration Achievements - Trying different openings
  // ============================================================================
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Try 5 different openings',
    icon: '🧭',
    category: 'exploration',
    requirement: 5,
    xpReward: 40,
    tier: 'bronze',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try 10 different openings',
    icon: '🗺️',
    category: 'exploration',
    requirement: 10,
    xpReward: 100,
    tier: 'silver',
  },
  {
    id: 'repertoire_builder',
    name: 'Repertoire Builder',
    description: 'Try 20 different openings',
    icon: '🎯',
    category: 'exploration',
    requirement: 20,
    xpReward: 250,
    tier: 'gold',
  },
  {
    id: 'opening_encyclopedia',
    name: 'Opening Encyclopedia',
    description: 'Try all available openings',
    icon: '📖',
    category: 'exploration',
    requirement: 30, // Adjust based on total openings
    xpReward: 500,
    tier: 'platinum',
  },

  // ============================================================================
  // Dedication Achievements - Total practice time and sessions
  // ============================================================================
  {
    id: 'first_hour',
    name: 'First Hour',
    description: 'Practice for 1 hour total',
    icon: '⏰',
    category: 'dedication',
    requirement: 60, // minutes
    xpReward: 30,
    tier: 'bronze',
  },
  {
    id: 'committed_learner',
    name: 'Committed Learner',
    description: 'Practice for 5 hours total',
    icon: '📚',
    category: 'dedication',
    requirement: 300, // minutes
    xpReward: 150,
    tier: 'silver',
  },
  {
    id: 'dedicated_student',
    name: 'Dedicated Student',
    description: 'Practice for 10 hours total',
    icon: '🎓',
    category: 'dedication',
    requirement: 600, // minutes
    xpReward: 200,
    tier: 'gold',
  },
  {
    id: 'chess_devotee',
    name: 'Chess Devotee',
    description: 'Practice for 25 hours total',
    icon: '♟️',
    category: 'dedication',
    requirement: 1500, // minutes
    xpReward: 500,
    tier: 'platinum',
  },
];

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (
  category: Achievement['category']
): Achievement[] => {
  return ACHIEVEMENTS.filter((a) => a.category === category);
};

/**
 * Get achievements by tier
 */
export const getAchievementsByTier = (
  tier: Achievement['tier']
): Achievement[] => {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};

/**
 * Get total XP available from all achievements
 */
export const getTotalAchievementXP = (): number => {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
};
