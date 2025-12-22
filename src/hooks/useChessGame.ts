/**
 * Custom hook for managing chess game state
 */

import { useState, useCallback, useRef } from 'react';
import { ChessEngine } from '../services/chess/chessEngine';
import { Move, GameState } from '../types';

interface UseChessGameReturn {
  engine: ChessEngine;
  moveHistory: Move[];
  lastMove: Move | null;
  currentTurn: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isGameOver: boolean;
  makeMove: (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') => Move | null;
  undoMove: () => Move | null;
  resetGame: () => void;
  getValidMoves: (square?: string) => Move[];
}

export const useChessGame = (initialFen?: string): UseChessGameReturn => {
  const [engine] = useState(() => new ChessEngine(initialFen));
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>(() => engine.getTurn());

  const makeMove = useCallback(
    (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): Move | null => {
      const move = engine.makeMove(from, to, promotion);
      if (move) {
        setMoveHistory((prev) => [...prev, move]);
        setLastMove(move);
        setCurrentTurn(engine.getTurn()); // Update turn after move
        return move;
      }
      return null;
    },
    [engine]
  );

  const undoMove = useCallback((): Move | null => {
    const move = engine.undo();
    if (move) {
      setMoveHistory((prev) => prev.slice(0, -1));
      setLastMove(moveHistory[moveHistory.length - 2] || null);
      setCurrentTurn(engine.getTurn()); // Update turn after undo
      return move;
    }
    return null;
  }, [engine, moveHistory]);

  const resetGame = useCallback(() => {
    engine.reset();
    setMoveHistory([]);
    setLastMove(null);
    setCurrentTurn(engine.getTurn()); // Update turn after reset
  }, [engine]);

  const getValidMoves = useCallback(
    (square?: string): Move[] => {
      return engine.getValidMoves(square);
    },
    [engine]
  );

  return {
    engine,
    moveHistory,
    lastMove,
    currentTurn,
    isCheck: engine.isCheck(),
    isCheckmate: engine.isCheckmate(),
    isStalemate: engine.isStalemate(),
    isGameOver: engine.isGameOver(),
    makeMove,
    undoMove,
    resetGame,
    getValidMoves,
  };
};

