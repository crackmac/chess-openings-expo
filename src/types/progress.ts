/**
 * Progress tracking type definitions
 */

export interface OpeningProgress {
  openingId: string;
  timesPracticed: number;
  lastPracticed: Date;
  bestAccuracy: number;
  averageAccuracy: number;
  completed: boolean;
  masteryLevel: number; // 0-5 stars
}

export interface SessionStats {
  sessionId: string;
  openingId: string;
  date: Date;
  accuracy: number;
  totalMoves: number;
  correctMoves: number;
  duration: number; // seconds
}

export interface UserStats {
  totalSessions: number;
  totalOpeningsPracticed: number;
  averageAccuracy: number;
  currentStreak: number; // days
  longestStreak: number; // days
}

