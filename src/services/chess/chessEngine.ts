/**
 * Chess Engine Wrapper
 * Wraps chess.js library to provide game logic and state management
 */

import { Chess, Square as ChessSquare } from 'chess.js';
import { Move, GameState } from '../../types/chess';

export class ChessEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  /**
   * Get current FEN position
   */
  getFen(): string {
    return this.game.fen();
  }

  /**
   * Get current position as FEN
   */
  getPosition(): string {
    return this.game.fen();
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  /**
   * Check if game is in check
   */
  isCheck(): boolean {
    return this.game.isCheck();
  }

  /**
   * Check if game is in checkmate
   */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /**
   * Check if game is in stalemate
   */
  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  /**
   * Check if game is a draw
   */
  isDraw(): boolean {
    return this.game.isDraw();
  }

  /**
   * Get whose turn it is
   */
  getTurn(): 'white' | 'black' {
    return this.game.turn() === 'w' ? 'white' : 'black';
  }

  /**
   * Get move history
   */
  getHistory(): Move[] {
    const history = this.game.history({ verbose: true });
    return history.map((move) => ({
      from: move.from,
      to: move.to,
      san: move.san,
      color: move.color === 'w' ? 'white' : 'black',
      promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    }));
  }

  /**
   * Get all valid moves for a square
   */
  getValidMoves(square?: string): Move[] {
    const moves = square
      ? this.game.moves({ square: square as ChessSquare, verbose: true })
      : this.game.moves({ verbose: true });

    return moves.map((move) => ({
      from: move.from,
      to: move.to,
      san: move.san,
      color: move.color === 'w' ? 'white' : 'black',
      promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    }));
  }

  /**
   * Check if a move is valid
   */
  isMoveValid(from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): boolean {
    try {
      const moves = this.game.moves({
        square: from as ChessSquare,
        verbose: true,
      });
      return moves.some(
        (move) =>
          move.to === to && (!promotion || move.promotion === promotion)
      );
    } catch {
      return false;
    }
  }

  /**
   * Make a move
   * @returns Move object if successful, null if invalid
   */
  makeMove(from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): Move | null {
    try {
      const move = this.game.move({
        from: from as ChessSquare,
        to: to as ChessSquare,
        promotion: promotion,
      });

      if (move) {
        return {
          from: move.from,
          to: move.to,
          san: move.san,
          color: move.color === 'w' ? 'white' : 'black',
          promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Make a move from SAN notation
   */
  makeMoveFromSan(san: string): Move | null {
    try {
      const move = this.game.move(san);
      if (move) {
        return {
          from: move.from,
          to: move.to,
          san: move.san,
          color: move.color === 'w' ? 'white' : 'black',
          promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Undo last move
   */
  undo(): Move | null {
    const move = this.game.undo();
    if (move) {
      return {
        from: move.from,
        to: move.to,
        san: move.san,
        color: move.color === 'w' ? 'white' : 'black',
        promotion: move.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      };
    }
    return null;
  }

  /**
   * Reset game to starting position
   */
  reset(): void {
    this.game.reset();
  }

  /**
   * Load position from FEN
   */
  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get board representation (for rendering)
   */
  getBoard(): Array<{ square: string; piece: { type: string; color: 'white' | 'black' } | null }> {
    const board: Array<{ square: string; piece: { type: string; color: 'white' | 'black' } | null }> = [];

    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const piece = this.game.get(square as ChessSquare);

        board.push({
          square,
          piece: piece
            ? {
                type: piece.type,
                color: piece.color === 'w' ? 'white' : 'black',
              }
            : null,
        });
      }
    }

    return board;
  }

  /**
   * Get piece on a square
   */
  getPiece(square: string): { type: string; color: 'white' | 'black' } | null {
    const piece = this.game.get(square as ChessSquare);
    if (!piece) return null;

    return {
      type: piece.type,
      color: piece.color === 'w' ? 'white' : 'black',
    };
  }
}

