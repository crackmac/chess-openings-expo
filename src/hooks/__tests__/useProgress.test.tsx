/**
 * Unit tests for useProgress hook
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useProgress } from '../useProgress';
import { ProgressTracker } from '../../services/storage/progressTracker';
import { OpeningProgress, SessionStats } from '../../types/progress';

// Mock ProgressTracker
jest.mock('../../services/storage/progressTracker', () => ({
  ProgressTracker: {
    getAllProgress: jest.fn(),
    getSessionHistory: jest.fn(),
    updateSessionProgress: jest.fn(),
    updateRating: jest.fn(),
    saveSessionStats: jest.fn(),
  },
}));

describe('useProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load progress on mount', async () => {
    const mockProgress: Record<string, OpeningProgress> = {
      'test-opening': {
        openingId: 'test-opening',
        timesPracticed: 1,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 100,
        completed: true,
        masteryLevel: 5,
      },
    };

    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue(
      mockProgress
    );
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toEqual(mockProgress);
  });

  it('should get opening progress', async () => {
    const mockProgress: Record<string, OpeningProgress> = {
      'test-opening': {
        openingId: 'test-opening',
        timesPracticed: 1,
        lastPracticed: new Date(),
        bestAccuracy: 100,
        averageAccuracy: 100,
        completed: true,
        masteryLevel: 5,
      },
    };

    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue(
      mockProgress
    );
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const progress = result.current.getOpeningProgress('test-opening');
    expect(progress).not.toBeNull();
    expect(progress?.openingId).toBe('test-opening');
  });

  it('should return null for non-existent opening', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const progress = result.current.getOpeningProgress('non-existent');
    expect(progress).toBeNull();
  });

  it('should update progress', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);
    (ProgressTracker.updateSessionProgress as jest.Mock).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateProgress('test-opening', 85, 8, 10);

    expect(ProgressTracker.updateSessionProgress).toHaveBeenCalledWith(
      'test-opening',
      85,
      8,
      10
    );
  });

  it('should update rating', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);
    (ProgressTracker.updateRating as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateRating('test-opening', 'hard');

    expect(ProgressTracker.updateRating).toHaveBeenCalledWith(
      'test-opening',
      'hard'
    );
  });

  it('should save session stats', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);
    (ProgressTracker.saveSessionStats as jest.Mock).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stats: SessionStats = {
      sessionId: 'test-session',
      openingId: 'test-opening',
      date: new Date(),
      accuracy: 85,
      totalMoves: 10,
      correctMoves: 8,
      duration: 120,
    };

    await result.current.saveSessionStats(stats);

    expect(ProgressTracker.saveSessionStats).toHaveBeenCalledWith(stats);
  });

  it('should calculate user stats', async () => {
    const mockProgress: Record<string, OpeningProgress> = {
      'opening-1': {
        openingId: 'opening-1',
        timesPracticed: 3,
        lastPracticed: new Date(),
        bestAccuracy: 90,
        averageAccuracy: 85,
        completed: true,
        masteryLevel: 4,
      },
      'opening-2': {
        openingId: 'opening-2',
        timesPracticed: 2,
        lastPracticed: new Date(),
        bestAccuracy: 80,
        averageAccuracy: 75,
        completed: false,
        masteryLevel: 3,
      },
    };

    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue(
      mockProgress
    );
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const userStats = result.current.getUserStats();

    expect(userStats.totalSessions).toBe(5); // 3 + 2
    expect(userStats.totalOpeningsPracticed).toBe(2);
    expect(userStats.averageAccuracy).toBe(80); // (85 + 75) / 2
  });

  it('should refresh progress', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.refreshProgress();

    expect(ProgressTracker.getAllProgress).toHaveBeenCalledTimes(2);
  });

  it('should refresh session history', async () => {
    (ProgressTracker.getAllProgress as jest.Mock).mockResolvedValue({});
    (ProgressTracker.getSessionHistory as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.refreshSessionHistory();

    expect(ProgressTracker.getSessionHistory).toHaveBeenCalledTimes(2);
  });
});

