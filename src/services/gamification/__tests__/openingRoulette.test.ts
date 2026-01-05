/**
 * Tests for Opening Roulette Service
 */

import { OpeningRoulette } from '../openingRoulette';
import { Opening, OpeningProgress } from '../../../types';

// Mock opening data
const createMockOpening = (id: string, name: string): Opening => ({
  id,
  name,
  eco: 'A00',
  difficulty: 'beginner',
  description: `Test opening ${name}`,
  mainLine: [],
  alternateLines: [],
  tags: [],
  category: 'test',
  color: 'white',
});

describe('OpeningRoulette', () => {
  let roulette: OpeningRoulette;
  let mockOpenings: Opening[];

  beforeEach(() => {
    roulette = new OpeningRoulette();
    mockOpenings = [
      createMockOpening('opening1', 'Opening 1'),
      createMockOpening('opening2', 'Opening 2'),
      createMockOpening('opening3', 'Opening 3'),
    ];
  });

  describe('selectOpening', () => {
    it('should throw error when no openings available', () => {
      expect(() => roulette.selectOpening([], {})).toThrow('No openings available for selection');
    });

    it('should return single opening when only one available', () => {
      const result = roulette.selectOpening([mockOpenings[0]], {});
      expect(result).toBe(mockOpenings[0]);
    });

    it('should return one of the available openings', () => {
      const result = roulette.selectOpening(mockOpenings, {});
      expect(mockOpenings).toContain(result);
    });

    it('should handle all unrated openings', () => {
      const progressData = {}; // No progress data = all unrated
      const result = roulette.selectOpening(mockOpenings, progressData);
      expect(mockOpenings).toContain(result);
    });

    it('should favor hard-rated openings over easy-rated', () => {
      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 5,
          lastPracticed: new Date(),
          bestAccuracy: 90,
          averageAccuracy: 85,
          completed: false,
          masteryLevel: 3,
          difficultyRating: 'hard',
        },
        opening2: {
          openingId: 'opening2',
          timesPracticed: 5,
          lastPracticed: new Date(),
          bestAccuracy: 95,
          averageAccuracy: 92,
          completed: true,
          masteryLevel: 5,
          difficultyRating: 'easy',
        },
        opening3: {
          openingId: 'opening3',
          timesPracticed: 5,
          lastPracticed: new Date(),
          bestAccuracy: 85,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'good',
        },
      };

      // Run selection 100 times and count results
      const counts: Record<string, number> = { opening1: 0, opening2: 0, opening3: 0 };
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const selected = roulette.selectOpening(mockOpenings, progressData);
        counts[selected.id]++;
      }

      // Hard (opening1) should be selected most often
      // With weights hard=3.0, good=1.0, easy=0.3:
      // Expected ratio approximately 3:1:0.3 or 70%:23%:7%
      // Allow for randomness: hard should be at least 50% of selections
      expect(counts.opening1).toBeGreaterThan(iterations * 0.5);
    });
  });

  describe('getWeightDistribution', () => {
    it('should return weight information for all openings', () => {
      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 80,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'hard',
        },
      };

      const distribution = roulette.getWeightDistribution(mockOpenings, progressData);

      expect(distribution).toHaveLength(3);
      expect(distribution[0].opening).toBe(mockOpenings[0]);
      expect(distribution[0].weight).toBeGreaterThan(0);
      expect(distribution[0].reason).toContain('hard-rated');
    });

    it('should show time decay info for easy openings not practiced recently', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 10,
          lastPracticed: twoWeeksAgo,
          bestAccuracy: 100,
          averageAccuracy: 98,
          completed: true,
          masteryLevel: 5,
          difficultyRating: 'easy',
        },
      };

      const distribution = roulette.getWeightDistribution(mockOpenings, progressData);
      const easyOpening = distribution.find((d) => d.opening.id === 'opening1');

      expect(easyOpening?.reason).toContain('time decay');
      expect(easyOpening?.reason).toContain('14 days');
    });
  });

  describe('weight calculations', () => {
    it('should apply correct base weights for different ratings', () => {
      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 80,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'hard',
        },
        opening2: {
          openingId: 'opening2',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 80,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'good',
        },
        opening3: {
          openingId: 'opening3',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 80,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'easy',
        },
      };

      const distribution = roulette.getWeightDistribution(mockOpenings, progressData);

      // Hard weight should be highest (excluding fuzz factor variation)
      const hardWeight = distribution.find((d) => d.opening.id === 'opening1')?.weight || 0;
      const goodWeight = distribution.find((d) => d.opening.id === 'opening2')?.weight || 0;
      const easyWeight = distribution.find((d) => d.opening.id === 'opening3')?.weight || 0;

      // Hard should be approximately 3x good (with some fuzz variation)
      expect(hardWeight).toBeGreaterThan(goodWeight * 2);

      // Easy should be less than good
      expect(easyWeight).toBeLessThan(goodWeight);
    });

    it('should apply time decay to easy openings', () => {
      const recentDate = new Date();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago

      const recentProgress: OpeningProgress = {
        openingId: 'opening1',
        timesPracticed: 10,
        lastPracticed: recentDate,
        bestAccuracy: 100,
        averageAccuracy: 98,
        completed: true,
        masteryLevel: 5,
        difficultyRating: 'easy',
      };

      const oldProgress: OpeningProgress = {
        openingId: 'opening2',
        timesPracticed: 10,
        lastPracticed: oldDate,
        bestAccuracy: 100,
        averageAccuracy: 98,
        completed: true,
        masteryLevel: 5,
        difficultyRating: 'easy',
      };

      const distribution = roulette.getWeightDistribution(
        [mockOpenings[0], mockOpenings[1]],
        {
          opening1: recentProgress,
          opening2: oldProgress,
        }
      );

      const recentWeight = distribution.find((d) => d.opening.id === 'opening1')?.weight || 0;
      const oldWeight = distribution.find((d) => d.opening.id === 'opening2')?.weight || 0;

      // Opening not practiced in 30 days should have higher weight
      expect(oldWeight).toBeGreaterThan(recentWeight * 1.5);
    });
  });

  describe('custom configuration', () => {
    it('should accept custom weights', () => {
      const customRoulette = new OpeningRoulette({ hard: 5.0, easy: 0.1 });

      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 80,
          averageAccuracy: 80,
          completed: false,
          masteryLevel: 2,
          difficultyRating: 'hard',
        },
        opening2: {
          openingId: 'opening2',
          timesPracticed: 1,
          lastPracticed: new Date(),
          bestAccuracy: 95,
          averageAccuracy: 92,
          completed: true,
          masteryLevel: 5,
          difficultyRating: 'easy',
        },
      };

      // Hard opening should dominate with 5.0 weight vs 0.1
      const counts: Record<string, number> = { opening1: 0, opening2: 0 };
      for (let i = 0; i < 100; i++) {
        const selected = customRoulette.selectOpening(
          [mockOpenings[0], mockOpenings[1]],
          progressData
        );
        counts[selected.id]++;
      }

      expect(counts.opening1).toBeGreaterThan(90);
    });

    it('should accept custom time decay config', () => {
      const customRoulette = new OpeningRoulette(undefined, {
        enabled: false,
      });

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30);

      const progressData: Record<string, OpeningProgress> = {
        opening1: {
          openingId: 'opening1',
          timesPracticed: 10,
          lastPracticed: oldDate,
          bestAccuracy: 100,
          averageAccuracy: 98,
          completed: true,
          masteryLevel: 5,
          difficultyRating: 'easy',
        },
      };

      const distribution = customRoulette.getWeightDistribution([mockOpenings[0]], progressData);

      // With time decay disabled, reason should not mention time decay
      expect(distribution[0].reason).not.toContain('time decay');
    });
  });
});
