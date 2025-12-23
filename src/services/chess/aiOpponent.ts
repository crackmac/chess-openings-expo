/**
 * AI Opponent Service
 * AI that follows opening theory and handles deviations
 */

import { ChessEngine } from "./chessEngine";
import { OpeningDatabase } from "./openingDatabase";
import { Opening, Move } from "../../types";

export class AIOpponent {
  private engine: ChessEngine;
  private opening: Opening | null = null;
  private moveHistory: Move[] = [];
  private openingDatabase: OpeningDatabase;

  constructor(engine: ChessEngine, openingDatabase: OpeningDatabase) {
    this.engine = engine;
    this.openingDatabase = openingDatabase;
  }

  /**
   * Set the opening to follow
   */
  setOpening(opening: Opening): void {
    this.opening = opening;
    this.moveHistory = [];
  }

  /**
   * Record a move made by the user
   */
  recordUserMove(move: Move): void {
    this.moveHistory.push(move);
  }

  /**
   * Get the AI's next move
   * Returns null if no move is available or opening theory is exhausted
   */
  getNextMove(): Move | null {
    if (!this.opening) {
      return this.getRandomValidMove();
    }

    // Try to follow opening theory
    const theoryMove = OpeningDatabase.getExpectedMove(
      this.opening,
      this.moveHistory,
      this.engine.getTurn()
    );

    if (theoryMove) {
      // Verify the move is still valid
      if (this.engine.isMoveValid(theoryMove.from, theoryMove.to)) {
        return theoryMove;
      }
    }

    // If no theory move or theory exhausted, make a reasonable move
    return this.getRandomValidMove();
  }

  /**
   * Get the AI's move (without executing it)
   * Returns the move to make, or null if no move is available
   * The caller should execute the move on the engine
   */
  getMove(): Move | null {
    return this.getNextMove();
  }

  /**
   * Make the AI's move
   * Returns the move made, or null if no move was possible
   * @deprecated Use getMove() instead and let the caller execute the move
   */
  makeMove(): Move | null {
    const move = this.getNextMove();
    if (!move) {
      return null;
    }

    const result = this.engine.makeMove(move.from, move.to, move.promotion);
    if (result) {
      this.moveHistory.push(result);
      return result;
    }

    return null;
  }

  /**
   * Check if user's move follows opening theory
   */
  isMoveInTheory(move: Move): boolean {
    if (!this.opening) {
      return false;
    }

    return OpeningDatabase.isMoveInTheory(this.opening, this.moveHistory, move);
  }

  /**
   * Get a random valid move (fallback when theory is exhausted)
   */
  private getRandomValidMove(): Move | null {
    const validMoves = this.engine.getValidMoves();
    if (validMoves.length === 0) {
      return null;
    }

    // Prefer captures and checks
    const captures = validMoves.filter((move) => {
      const piece = this.engine.getPiece(move.to);
      return piece !== null;
    });

    const checks = validMoves.filter((move) => {
      // Make a temporary move to check if it results in check
      const tempEngine = new ChessEngine(this.engine.getFen());
      const tempMove = tempEngine.makeMove(move.from, move.to);
      if (tempMove) {
        tempEngine.makeMove(move.from, move.to);
        return tempEngine.isCheck();
      }
      return false;
    });

    // Prioritize checks, then captures, then random
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  /**
   * Reset AI state
   */
  reset(): void {
    this.moveHistory = [];
  }
}
