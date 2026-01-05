/**
 * Tests for GamificationTracker Service
 */

import { GamificationTracker } from '../gamificationTracker';
import { Opening, OpeningProgress, SessionStats } from '../../../types';
import { ACHIEVEMENTS } from '../../../data/achievements';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock opening for testing
const createMockOpening = (difficulty: 'beginner' | 'intermediate' | 'advanced'): Opening => ({
  id: 'test-opening',
  name: 'Test Opening',
  eco: 'A00',
  difficulty,
  description: 'Test description',
  mainLine: [],
  alternateLines: [],
  tags: [],
  category: 'test',
  color: 'white',
});

describe('GamificationTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);
  });

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const data = await GamificationTracker.initialize();

      expect(data.totalXP).toBe(0);
      expect(data.level).toBe(1);
      expect(data.xpForNextLevel).toBe(100);
      expect(data.currentStreak).toBe(0);
      expect(data.longestStreak).toBe(0);
      expect(data.unlockedAchievements).toEqual([]);
      expect(data.lastPracticeDate).toBeInstanceOf(Date);
    });

    it('should save to AsyncStorage on initialization', async () => {
      await GamificationTracker.initialize();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@chess_openings:gamification',
        expect.any(String)
      );
    });
  });

  describe('XP calculation', () => {
    it('should calculate base XP correctly', () => {
      const stats: SessionStats = {
        sessionId: 'test',
        openingId: 'test-opening',
        date: new Date(),
        accuracy: 0,
        totalMoves: 10,
        correctMoves: 0,
        duration: 60,
      };

      const progress: OpeningProgress = {
        openingId: 'test-opening',
        timesPracticed: 2,
        lastPracticed: new Date(),
        bestAccuracy: 80,
        averageAccuracy: 75,
        completed: false,
        masteryLevel: 2,
      };

      const opening = createMockOpening('beginner');

      const xp = GamificationTracker.calculateSessionXP(stats, progress, opening);

      // Base XP (10) * beginner multiplier (1.0) = 10
      expect(xp).toBe(10);
    });

    it('should apply accuracy bonus', () => {
      const stats: SessionStats = {
        sessionId: 'test',
        openingId: 'test-opening',
        date: new Date(),
        accuracy: 100, // Perfect accuracy
        totalMoves: 10,
        correctMoves: 10,
        duration: 60,
      };

      const progress: OpeningProgress = {
        openingId: 'test-opening',
        timesPracticed: 2,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 95,
        completed: true,
        masteryLevel: 5,
      };

      const opening = createMockOpening('beginner');

      const xp = GamificationTracker.calculateSessionXP(stats, progress, opening);

      // Base (10) + Accuracy bonus (100 * 0.4 = 40) + Completion bonus (20) = 70
      expect(xp).toBe(70);
    });

    it('should apply first-time bonus', () => {
      const stats: SessionStats = {
        sessionId: 'test',
        openingId: 'test-opening',
        date: new Date(),
        accuracy: 50,
        totalMoves: 10,
        correctMoves: 5,
        duration: 60,
      };

      const progress: OpeningProgress = {
        openingId: 'test-opening',
        timesPracticed: 1, // First time
        lastPracticed: new Date(),
        bestAccuracy: 50,
        averageAccuracy: 50,
        completed: false,
        masteryLevel: 1,
      };

      const opening = createMockOpening('beginner');

      const xp = GamificationTracker.calculateSessionXP(stats, progress, opening);

      // Base (10) + Accuracy (50 * 0.4 = 20) + First-time (30) = 60
      expect(xp).toBe(60);
    });

    it('should apply difficulty multipliers', () => {
      const stats: SessionStats = {
        sessionId: 'test',
        openingId: 'test-opening',
        date: new Date(),
        accuracy: 0,
        totalMoves: 10,
        correctMoves: 0,
        duration: 60,
      };

      const progress: OpeningProgress = {
        openingId: 'test-opening',
        timesPracticed: 2,
        lastPracticed: new Date(),
        bestAccuracy: 50,
        averageAccuracy: 50,
        completed: false,
        masteryLevel: 1,
      };

      // Beginner: base XP * 1.0
      const beginnerOpening = createMockOpening('beginner');
      const beginnerXP = GamificationTracker.calculateSessionXP(stats, progress, beginnerOpening);
      expect(beginnerXP).toBe(10);

      // Intermediate: base XP * 1.5
      const intermediateOpening = createMockOpening('intermediate');
      const intermediateXP = GamificationTracker.calculateSessionXP(stats, progress, intermediateOpening);
      expect(intermediateXP).toBe(15);

      // Advanced: base XP * 2.0
      const advancedOpening = createMockOpening('advanced');
      const advancedXP = GamificationTracker.calculateSessionXP(stats, progress, advancedOpening);
      expect(advancedXP).toBe(20);
    });
  });

  describe('level calculation', () => {
    it('should start at level 1 with 0 XP', () => {
      const result = GamificationTracker.calculateLevel(0);

      expect(result.level).toBe(1);
      expect(result.xpForNext).toBe(100);
    });

    it('should level up at correct thresholds', () => {
      // Level 1: 0-99 XP (need 100)
      expect(GamificationTracker.calculateLevel(99).level).toBe(1);

      // Level 2: 100-249 XP (need 150)
      expect(GamificationTracker.calculateLevel(100).level).toBe(2);
      expect(GamificationTracker.calculateLevel(249).level).toBe(2);

      // Level 3: 250-474 XP (need 225)
      expect(GamificationTracker.calculateLevel(250).level).toBe(3);
    });

    it('should use exponential curve', () => {
      // Test formula: XP_needed = 100 * 1.5^(level-1)
      const level5 = GamificationTracker.calculateLevel(1000);
      expect(level5.level).toBeGreaterThanOrEqual(5);

      const level10 = GamificationTracker.calculateLevel(10000);
      expect(level10.level).toBeGreaterThanOrEqual(10);
    });
  });

  describe('streak system', () => {
    it('should start streak on first practice', async () => {
      const today = new Date();

      const result = await GamificationTracker.updateStreak(today);

      expect(result.currentStreak).toBe(1);
      expect(result.streakContinued).toBe(false);
    });

    it('should increment streak on consecutive days', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Initialize with yesterday
      await GamificationTracker.initialize();
      const data = await GamificationTracker.load();
      data.lastPracticeDate = yesterday;
      data.currentStreak = 5;
      data.longestStreak = 5;
      await AsyncStorage.setItem(
        '@chess_openings:gamification',
        JSON.stringify({
          ...data,
          lastPracticeDate: yesterday.toISOString(),
        })
      );

      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          ...data,
          lastPracticeDate: yesterday.toISOString(),
        })
      );

      // Practice today
      const today = new Date();
      const result = await GamificationTracker.updateStreak(today);

      expect(result.currentStreak).toBe(6);
      expect(result.streakContinued).toBe(true);
    });

    it('should not change streak on same day', async () => {
      const today = new Date();

      // Initialize with today
      await GamificationTracker.initialize();
      const data = await GamificationTracker.load();
      data.lastPracticeDate = today;
      data.currentStreak = 5;

      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          ...data,
          lastPracticeDate: today.toISOString(),
        })
      );

      // Practice again today
      const result = await GamificationTracker.updateStreak(today);

      expect(result.currentStreak).toBe(5);
      expect(result.streakContinued).toBe(false);
    });

    it('should reset streak after missed day', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Initialize with 2 days ago
      await GamificationTracker.initialize();
      const data = await GamificationTracker.load();
      data.lastPracticeDate = twoDaysAgo;
      data.currentStreak = 10;
      data.longestStreak = 10;

      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          ...data,
          lastPracticeDate: twoDaysAgo.toISOString(),
        })
      );

      // Practice today (missed yesterday)
      const today = new Date();
      const result = await GamificationTracker.updateStreak(today);

      expect(result.currentStreak).toBe(1);
      expect(result.streakContinued).toBe(false);
    });
  });

  describe('achievement system', () => {
    it('should track mastery achievements', () => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'first_master')!;

      const progress: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 10,
          lastPracticed: new Date(),
          bestAccuracy: 100,
          averageAccuracy: 95,
          completed: true,
          masteryLevel: 5,
        },
      };

      const data = {
        totalXP: 0,
        level: 1,
        xpForNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: new Date(),
        unlockedAchievements: [],
        achievementProgress: {},
      };

      const currentProgress = GamificationTracker.getAchievementProgress(
        achievement,
        data,
        progress,
        []
      );

      expect(currentProgress).toBe(1); // 1 mastered opening
    });

    it('should track streak achievements', () => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'week_warrior')!;

      const data = {
        totalXP: 0,
        level: 1,
        xpForNextLevel: 100,
        currentStreak: 5,
        longestStreak: 7,
        lastPracticeDate: new Date(),
        unlockedAchievements: [],
        achievementProgress: {},
      };

      const currentProgress = GamificationTracker.getAchievementProgress(
        achievement,
        data,
        {},
        []
      );

      expect(currentProgress).toBe(7); // Uses longest streak
    });

    it('should track accuracy achievements', () => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'perfectionist')!;

      const sessionHistory: SessionStats[] = [
        {
          sessionId: '1',
          openingId: 'test',
          date: new Date(),
          accuracy: 100,
          totalMoves: 10,
          correctMoves: 10,
          duration: 60,
        },
        {
          sessionId: '2',
          openingId: 'test',
          date: new Date(),
          accuracy: 100,
          totalMoves: 8,
          correctMoves: 8,
          duration: 45,
        },
        {
          sessionId: '3',
          openingId: 'test',
          date: new Date(),
          accuracy: 90,
          totalMoves: 10,
          correctMoves: 9,
          duration: 50,
        },
      ];

      const data = {
        totalXP: 0,
        level: 1,
        xpForNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: new Date(),
        unlockedAchievements: [],
        achievementProgress: {},
      };

      const currentProgress = GamificationTracker.getAchievementProgress(
        achievement,
        data,
        {},
        sessionHistory
      );

      expect(currentProgress).toBe(2); // 2 perfect sessions
    });

    it('should track exploration achievements', () => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'explorer')!;

      const progress: Record<string, OpeningProgress> = {
        opening1: { openingId: 'opening1', timesPracticed: 1, lastPracticed: new Date(), bestAccuracy: 50, averageAccuracy: 50, completed: false, masteryLevel: 1 },
        opening2: { openingId: 'opening2', timesPracticed: 1, lastPracticed: new Date(), bestAccuracy: 50, averageAccuracy: 50, completed: false, masteryLevel: 1 },
        opening3: { openingId: 'opening3', timesPracticed: 1, lastPracticed: new Date(), bestAccuracy: 50, averageAccuracy: 50, completed: false, masteryLevel: 1 },
      };

      const data = {
        totalXP: 0,
        level: 1,
        xpForNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: new Date(),
        unlockedAchievements: [],
        achievementProgress: {},
      };

      const currentProgress = GamificationTracker.getAchievementProgress(
        achievement,
        data,
        progress,
        []
      );

      expect(currentProgress).toBe(3); // 3 unique openings
    });

    it('should track dedication achievements', () => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'first_hour')!;

      const sessionHistory: SessionStats[] = [
        {
          sessionId: '1',
          openingId: 'test',
          date: new Date(),
          accuracy: 80,
          totalMoves: 10,
          correctMoves: 8,
          duration: 30, // 30 minutes
        },
        {
          sessionId: '2',
          openingId: 'test',
          date: new Date(),
          accuracy: 85,
          totalMoves: 10,
          correctMoves: 8,
          duration: 35, // 35 minutes
        },
      ];

      const data = {
        totalXP: 0,
        level: 1,
        xpForNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: new Date(),
        unlockedAchievements: [],
        achievementProgress: {},
      };

      const currentProgress = GamificationTracker.getAchievementProgress(
        achievement,
        data,
        {},
        sessionHistory
      );

      expect(currentProgress).toBe(65); // 65 minutes total
    });
  });
});
