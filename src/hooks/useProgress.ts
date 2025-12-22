/**
 * Custom hook for managing opening progress
 */

import { useState, useEffect, useCallback } from 'react';
import { ProgressTracker } from '../services/storage/progressTracker';
import { OpeningProgress, SessionStats, UserStats } from '../types';

interface UseProgressReturn {
  progress: Record<string, OpeningProgress>;
  loading: boolean;
  getOpeningProgress: (openingId: string) => OpeningProgress | null;
  updateProgress: (
    openingId: string,
    accuracy: number,
    correctMoves: number,
    totalMoves: number
  ) => Promise<void>;
  updateRating: (
    openingId: string,
    rating: 'hard' | 'good' | 'easy'
  ) => Promise<void>;
  saveSessionStats: (stats: SessionStats) => Promise<void>;
  getUserStats: () => UserStats;
  refreshProgress: () => Promise<void>;
}

export const useProgress = (): UseProgressReturn => {
  const [progress, setProgress] = useState<Record<string, OpeningProgress>>({});
  const [loading, setLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const allProgress = await ProgressTracker.getAllProgress();
      setProgress(allProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOpeningProgress = useCallback(
    (openingId: string): OpeningProgress | null => {
      return progress[openingId] || null;
    },
    [progress]
  );

  const updateProgress = useCallback(
    async (
      openingId: string,
      accuracy: number,
      correctMoves: number,
      totalMoves: number
    ) => {
      try {
        await ProgressTracker.updateSessionProgress(
          openingId,
          accuracy,
          correctMoves,
          totalMoves
        );
        await loadProgress(); // Refresh progress
      } catch (error) {
        console.error('Error updating progress:', error);
        throw error;
      }
    },
    [loadProgress]
  );

  const updateRating = useCallback(
    async (openingId: string, rating: 'hard' | 'good' | 'easy') => {
      try {
        await ProgressTracker.updateRating(openingId, rating);
        await loadProgress(); // Refresh progress
      } catch (error) {
        console.error('Error updating rating:', error);
        throw error;
      }
    },
    [loadProgress]
  );

  const saveSessionStats = useCallback(async (stats: SessionStats) => {
    try {
      await ProgressTracker.saveSessionStats(stats);
    } catch (error) {
      console.error('Error saving session stats:', error);
    }
  }, []);

  const getUserStats = useCallback((): UserStats => {
    const openings = Object.values(progress);
    const openingsWithProgress = openings.filter((p) => p.timesPracticed > 0);

    const totalSessions = openings.reduce(
      (sum, p) => sum + p.timesPracticed,
      0
    );
    const totalOpeningsPracticed = openingsWithProgress.length;
    const averageAccuracy =
      openingsWithProgress.length > 0
        ? openingsWithProgress.reduce((sum, p) => sum + p.averageAccuracy, 0) /
          openingsWithProgress.length
        : 0;

    // Calculate streaks (simplified - would need date tracking for real streaks)
    const currentStreak = 0; // TODO: Implement streak calculation
    const longestStreak = 0; // TODO: Implement streak calculation

    return {
      totalSessions,
      totalOpeningsPracticed,
      averageAccuracy,
      currentStreak,
      longestStreak,
    };
  }, [progress]);

  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    getOpeningProgress,
    updateProgress,
    updateRating,
    saveSessionStats,
    getUserStats,
    refreshProgress,
  };
};

