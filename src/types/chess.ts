/**
 * Chess-related type definitions
 */

export interface Move {
  from: string; // Square notation (e.g., "e2")
  to: string; // Square notation (e.g., "e4")
  san: string; // Standard Algebraic Notation (e.g., "e4")
  color?: 'white' | 'black';
  promotion?: 'q' | 'r' | 'b' | 'n'; // For pawn promotion
}

export interface GameState {
  gameId: string;
  openingId: string;
  userColor: 'white' | 'black';
  currentPosition: string; // FEN notation
  moveHistory: Move[];
  isUserTurn: boolean;
  status: 'active' | 'completed' | 'abandoned';
  accuracy: number; // Percentage of correct moves
  correctMoves: number;
  totalMoves: number;
}

export interface Square {
  file: string; // a-h
  rank: number; // 1-8
}

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  square: string; // Square notation
}

