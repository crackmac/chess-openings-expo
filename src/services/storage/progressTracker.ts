/**
 * Progress Tracker Service
 * Manages opening progress persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OpeningProgress, SessionStats } from '../../types';

const PROGRESS_STORAGE_KEY = '@chess_openings:progress';
const SESSION_HISTORY_KEY = '@chess_openings:session_history';

export class ProgressTracker {
  /**
   * Save opening progress
   */
  static async saveOpeningProgress(
    openingId: string,
    progress: OpeningProgress
  ): Promise<void> {
    try {
      // Get raw data from storage (as strings) to avoid double conversion
      const data = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      const allProgress: Record<string, any> = data ? JSON.parse(data) : {};

      // Convert Date objects to ISO strings for storage
      const progressToSave: any = {
        ...progress,
        lastPracticed: progress.lastPracticed.toISOString(),
        lastRated: progress.lastRated ? progress.lastRated.toISOString() : undefined,
        ratingHistory: progress.ratingHistory?.map((entry) => ({
          ...entry,
          date: entry.date.toISOString(),
        })),
      };
      allProgress[openingId] = progressToSave;

      await AsyncStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(allProgress)
      );
    } catch (error) {
      console.error('Error saving opening progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific opening
   */
  static async getOpeningProgress(
    openingId: string
  ): Promise<OpeningProgress | null> {
    try {
      const allProgress = await this.getAllProgress();
      const progress = allProgress[openingId];

      if (!progress) {
        return null;
      }

      // Convert date strings back to Date objects
      return {
        ...progress,
        lastPracticed: new Date(progress.lastPracticed),
        lastRated: progress.lastRated ? new Date(progress.lastRated) : undefined,
        ratingHistory: progress.ratingHistory?.map((entry) => ({
          ...entry,
          date: new Date(entry.date),
        })),
      };
    } catch (error) {
      console.error('Error getting opening progress:', error);
      return null;
    }
  }

  /**
   * Get all progress data
   */
  static async getAllProgress(): Promise<Record<string, OpeningProgress>> {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!data) {
        return {};
      }

      const parsed = JSON.parse(data);
      // Convert date strings to Date objects
      const result: Record<string, OpeningProgress> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const progress = value as any;
        result[key] = {
          ...progress,
          lastPracticed: new Date(progress.lastPracticed),
          lastRated: progress.lastRated ? new Date(progress.lastRated) : undefined,
          ratingHistory: progress.ratingHistory?.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
          })),
        };
      }
      return result;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }

  /**
   * Update difficulty rating for an opening
   */
  static async updateRating(
    openingId: string,
    rating: 'hard' | 'good' | 'easy'
  ): Promise<void> {
    try {
      const progress = await this.getOpeningProgress(openingId);

      if (!progress) {
        // Create new progress entry
        const newProgress: OpeningProgress = {
          openingId,
          timesPracticed: 0,
          lastPracticed: new Date(),
          bestAccuracy: 0,
          averageAccuracy: 0,
          completed: false,
          masteryLevel: 0,
          difficultyRating: rating,
          lastRated: new Date(),
          ratingHistory: [{ date: new Date(), rating }],
        };
        await this.saveOpeningProgress(openingId, newProgress);
        return;
      }

      // Update existing progress
      const updatedProgress: OpeningProgress = {
        ...progress,
        difficultyRating: rating,
        lastRated: new Date(),
        ratingHistory: [
          ...(progress.ratingHistory || []),
          { date: new Date(), rating },
        ],
      };

      await this.saveOpeningProgress(openingId, updatedProgress);
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }

  /**
   * Update progress after a practice session
   */
  static async updateSessionProgress(
    openingId: string,
    accuracy: number,
    correctMoves: number,
    totalMoves: number
  ): Promise<void> {
    try {
      const progress = await this.getOpeningProgress(openingId);
      const now = new Date();

      if (!progress) {
        // Create new progress entry
        const newProgress: OpeningProgress = {
          openingId,
          timesPracticed: 1,
          lastPracticed: now,
          bestAccuracy: accuracy,
          averageAccuracy: accuracy,
          completed: totalMoves > 0 && correctMoves === totalMoves,
          masteryLevel: this.calculateMasteryLevel(accuracy, 1),
        };
        await this.saveOpeningProgress(openingId, newProgress);
        return;
      }

      // Update existing progress
      const timesPracticed = progress.timesPracticed + 1;
      const newAverageAccuracy =
        (progress.averageAccuracy * progress.timesPracticed + accuracy) /
        timesPracticed;
      const newBestAccuracy = Math.max(progress.bestAccuracy, accuracy);
      const completed =
        progress.completed ||
        (totalMoves > 0 && correctMoves === totalMoves);

      const updatedProgress: OpeningProgress = {
        ...progress,
        timesPracticed,
        lastPracticed: now,
        bestAccuracy: newBestAccuracy,
        averageAccuracy: newAverageAccuracy,
        completed,
        masteryLevel: this.calculateMasteryLevel(
          newAverageAccuracy,
          timesPracticed
        ),
      };

      await this.saveOpeningProgress(openingId, updatedProgress);
    } catch (error) {
      console.error('Error updating session progress:', error);
      throw error;
    }
  }

  /**
   * Calculate mastery level (0-5 stars) based on accuracy and practice count
   */
  static calculateMasteryLevel(
    averageAccuracy: number,
    timesPracticed: number
  ): number {
    if (timesPracticed === 0) return 0;
    if (averageAccuracy >= 95 && timesPracticed >= 5) return 5;
    if (averageAccuracy >= 90 && timesPracticed >= 4) return 4;
    if (averageAccuracy >= 80 && timesPracticed >= 3) return 3;
    if (averageAccuracy >= 70 && timesPracticed >= 2) return 2;
    if (averageAccuracy >= 60 && timesPracticed >= 1) return 1;
    return 0;
  }

  /**
   * Save session statistics
   */
  static async saveSessionStats(stats: SessionStats): Promise<void> {
    try {
      const history = await this.getSessionHistory();
      history.push(stats);
      await AsyncStorage.setItem(
        SESSION_HISTORY_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Error saving session stats:', error);
    }
  }

  /**
   * Get session history
   */
  static async getSessionHistory(): Promise<SessionStats[]> {
    try {
      const data = await AsyncStorage.getItem(SESSION_HISTORY_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return parsed.map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }));
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  /**
   * Clear all progress data (for testing/reset)
   */
  static async clearAllProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROGRESS_STORAGE_KEY);
      await AsyncStorage.removeItem(SESSION_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing progress:', error);
      throw error;
    }
  }
}

