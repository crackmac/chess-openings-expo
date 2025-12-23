/**
 * Custom hook for managing opening progress
 */

import { useState, useEffect, useCallback } from 'react';
import { ProgressTracker } from '../services/storage/progressTracker';
import { OpeningProgress, SessionStats, UserStats } from '../types';

interface UseProgressReturn {
  progress: Record<string, OpeningProgress>;
  sessionHistory: SessionStats[];
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
  refreshSessionHistory: () => Promise<void>;
}

export const useProgress = (): UseProgressReturn => {
  const [progress, setProgress] = useState<Record<string, OpeningProgress>>({});
  const [sessionHistory, setSessionHistory] = useState<SessionStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load progress and session history on mount
  useEffect(() => {
    loadProgress();
    loadSessionHistory();
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

  const loadSessionHistory = useCallback(async () => {
    try {
      const history = await ProgressTracker.getSessionHistory();
      // Sort by date, most recent first
      const sorted = history.sort((a, b) => b.date.getTime() - a.date.getTime());
      setSessionHistory(sorted);
    } catch (error) {
      console.error('Error loading session history:', error);
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

  const saveSessionStats = useCallback(
    async (stats: SessionStats) => {
      try {
        await ProgressTracker.saveSessionStats(stats);
        // Refresh session history after saving
        await loadSessionHistory();
      } catch (error) {
        console.error('Error saving session stats:', error);
      }
    },
    [loadSessionHistory]
  );

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

  const refreshSessionHistory = useCallback(async () => {
    await loadSessionHistory();
  }, [loadSessionHistory]);

  return {
    progress,
    sessionHistory,
    loading,
    getOpeningProgress,
    updateProgress,
    updateRating,
    saveSessionStats,
    getUserStats,
    refreshProgress,
    refreshSessionHistory,
  };
};

