/**
 * Unit tests for ProgressTracker service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressTracker } from '../progressTracker';
import { OpeningProgress, SessionStats } from '../../../types/progress';

describe('ProgressTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('saveOpeningProgress', () => {
    it('should save new progress', async () => {
      const openingId = 'test-opening';
      const progress: OpeningProgress = {
        openingId,
        timesPracticed: 1,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 100,
        completed: true,
        masteryLevel: 5,
      };

      await ProgressTracker.saveOpeningProgress(openingId, progress);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@chess_openings:progress',
        expect.stringContaining(openingId)
      );
    });

    it('should handle errors when saving', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const progress: OpeningProgress = {
        openingId: 'test',
        timesPracticed: 1,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 100,
        completed: true,
        masteryLevel: 5,
      };

      await expect(
        ProgressTracker.saveOpeningProgress('test', progress)
      ).rejects.toThrow('Storage error');

      // Reset mock after error test
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });
  });

  describe('getOpeningProgress', () => {
    it('should return null if no progress exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await ProgressTracker.getOpeningProgress('test-opening');

      expect(result).toBeNull();
    });

    it('should return progress if it exists', async () => {
      const openingId = 'test-opening';
      const progress: OpeningProgress = {
        openingId,
        timesPracticed: 1,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 100,
        completed: true,
        masteryLevel: 5,
      };

      const storedData = {
        [openingId]: {
          ...progress,
          lastPracticed: progress.lastPracticed.toISOString(),
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(storedData)
      );

      const result = await ProgressTracker.getOpeningProgress(openingId);

      expect(result).not.toBeNull();
      expect(result?.openingId).toBe(openingId);
      expect(result?.timesPracticed).toBe(1);
    });
  });

  describe('updateSessionProgress', () => {
    beforeEach(() => {
      // Reset mocks before each test in this describe block
      jest.clearAllMocks();
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('should create new progress for first practice', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await ProgressTracker.updateSessionProgress('new-opening', 80, 4, 5);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(callArgs[1]);
      expect(savedData['new-opening'].timesPracticed).toBe(1);
      expect(savedData['new-opening'].bestAccuracy).toBe(80);
    });

    it('should update existing progress', async () => {
      const openingId = 'existing-opening';
      const existingProgress = {
        [openingId]: {
          openingId,
          timesPracticed: 2,
          lastPracticed: new Date().toISOString(),
          bestAccuracy: 70,
          averageAccuracy: 70,
          completed: false,
          masteryLevel: 2,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingProgress)
      );

      await ProgressTracker.updateSessionProgress(openingId, 90, 5, 5);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(callArgs[1]);
      expect(savedData[openingId].timesPracticed).toBe(3);
      expect(savedData[openingId].bestAccuracy).toBe(90);
    });
  });

  describe('calculateMasteryLevel', () => {
    it('should return 5 stars for perfect accuracy with multiple practices', () => {
      const level = ProgressTracker.calculateMasteryLevel(100, 5);
      expect(level).toBe(5);
    });

    it('should return 0 stars for low accuracy', () => {
      const level = ProgressTracker.calculateMasteryLevel(30, 1);
      expect(level).toBe(0);
    });

    it('should return appropriate level for intermediate accuracy', () => {
      const level = ProgressTracker.calculateMasteryLevel(75, 3);
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(5);
    });
  });

  describe('saveSessionStats', () => {
    it('should save session stats', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const stats: SessionStats = {
        sessionId: 'test-session',
        openingId: 'test-opening',
        date: new Date(),
        accuracy: 85,
        totalMoves: 10,
        correctMoves: 8,
        duration: 120,
      };

      await ProgressTracker.saveSessionStats(stats);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@chess_openings:session_history',
        expect.stringContaining('test-session')
      );
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array if no history exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const history = await ProgressTracker.getSessionHistory();

      expect(history).toEqual([]);
    });

    it('should return session history', async () => {
      const sessions: SessionStats[] = [
        {
          sessionId: 'session-1',
          openingId: 'opening-1',
          date: new Date('2024-01-01'),
          accuracy: 80,
          totalMoves: 10,
          correctMoves: 8,
          duration: 120,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(sessions.map((s) => ({ ...s, date: s.date.toISOString() })))
      );

      const history = await ProgressTracker.getSessionHistory();

      expect(history).toHaveLength(1);
      expect(history[0].sessionId).toBe('session-1');
    });
  });
});

