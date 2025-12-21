/**
 * Opening Database Service
 * Manages chess opening data and provides lookup functionality
 */

import { Opening, AlternateLine, Move } from '../../types';
import { ChessEngine } from './chessEngine';

export class OpeningDatabase {
  private openings: Opening[] = [];

  /**
   * Load openings into database
   */
  loadOpenings(openings: Opening[]): void {
    this.openings = openings;
  }

  /**
   * Get all openings
   */
  getAllOpenings(): Opening[] {
    return this.openings;
  }

  /**
   * Get opening by ID
   */
  getOpeningById(id: string): Opening | undefined {
    return this.openings.find((opening) => opening.id === id);
  }

  /**
   * Get openings by difficulty
   */
  getOpeningsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Opening[] {
    return this.openings.filter((opening) => opening.difficulty === difficulty);
  }

  /**
   * Get openings by category
   */
  getOpeningsByCategory(category: string): Opening[] {
    return this.openings.filter((opening) => opening.category === category);
  }

  /**
   * Search openings by name or ECO code
   */
  searchOpenings(query: string): Opening[] {
    const lowerQuery = query.toLowerCase();
    return this.openings.filter(
      (opening) =>
        opening.name.toLowerCase().includes(lowerQuery) ||
        opening.eco.toLowerCase().includes(lowerQuery) ||
        opening.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get expected move for a given position and color
   * Returns the next move in the main line or alternate line if applicable
   */
  static getExpectedMove(
    opening: Opening,
    moveHistory: Move[],
    color: 'white' | 'black'
  ): Move | null {
    // Check if we're still in the main line
    const mainLineMoves = opening.mainLine.filter(
      (move) => move.color === color
    );
    const moveIndex = moveHistory.length;

    // Find matching line (main or alternate)
    const matchingLine = OpeningDatabase.findMatchingLine(
      opening,
      moveHistory
    );

    if (!matchingLine) {
      return null;
    }

    // Get next move for the current color
    const nextMoves = matchingLine.moves.filter((move) => move.color === color);
    const expectedMoveIndex = Math.floor(moveIndex / 2);

    if (expectedMoveIndex < nextMoves.length) {
      return nextMoves[expectedMoveIndex];
    }

    return null;
  }

  /**
   * Check if a move matches opening theory
   */
  static isMoveInTheory(
    opening: Opening,
    moveHistory: Move[],
    move: Move
  ): boolean {
    const matchingLine = OpeningDatabase.findMatchingLine(
      opening,
      moveHistory
    );

    if (!matchingLine) {
      return false;
    }

    const expectedMove = OpeningDatabase.getExpectedMove(
      opening,
      moveHistory,
      move.color || 'white'
    );

    if (!expectedMove) {
      return false;
    }

    return (
      expectedMove.from === move.from &&
      expectedMove.to === move.to &&
      expectedMove.promotion === move.promotion
    );
  }

  /**
   * Find which line (main or alternate) matches the current move history
   */
  private static findMatchingLine(
    opening: Opening,
    moveHistory: Move[]
  ): { moves: Move[] } | null {
    // Check main line first
    if (OpeningDatabase.matchesLine(opening.mainLine, moveHistory)) {
      return { moves: opening.mainLine };
    }

    // Check alternate lines
    for (const altLine of opening.alternateLines) {
      if (OpeningDatabase.matchesLine(altLine.moves, moveHistory)) {
        return { moves: altLine.moves };
      }
    }

    return null;
  }

  /**
   * Check if move history matches a line
   */
  private static matchesLine(line: Move[], moveHistory: Move[]): boolean {
    if (moveHistory.length === 0) {
      return true; // Starting position matches any line
    }

    if (moveHistory.length > line.length) {
      return false; // Too many moves
    }

    // Check if all moves match up to current point
    for (let i = 0; i < moveHistory.length; i++) {
      const historyMove = moveHistory[i];
      const lineMove = line[i];

      if (
        historyMove.from !== lineMove.from ||
        historyMove.to !== lineMove.to ||
        historyMove.promotion !== lineMove.promotion
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all possible theory moves for current position
   */
  static getTheoryMoves(
    opening: Opening,
    moveHistory: Move[],
    color: 'white' | 'black'
  ): Move[] {
    const matchingLine = OpeningDatabase.findMatchingLine(
      opening,
      moveHistory
    );

    if (!matchingLine) {
      return [];
    }

    const moveIndex = moveHistory.length;
    const nextMoves = matchingLine.moves
      .filter((move) => move.color === color)
      .slice(Math.floor(moveIndex / 2));

    return nextMoves;
  }
}

