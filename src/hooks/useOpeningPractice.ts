/**
 * Custom hook for managing opening practice session
 */

import { useState, useCallback, useEffect } from 'react';
import { ChessEngine } from '../services/chess/chessEngine';
import { AIOpponent } from '../services/chess/aiOpponent';
import { OpeningDatabase } from '../services/chess/openingDatabase';
import { Opening, Move } from '../types';
import { useChessGame } from './useChessGame';

interface UseOpeningPracticeReturn {
  opening: Opening | null;
  userColor: 'white' | 'black';
  engine: ChessEngine;
  aiOpponent: AIOpponent | null;
  selectedSquare: string | null;
  lastMove: Move | null;
  moveHistory: Move[];
  isUserTurn: boolean;
  correctMoves: number;
  totalMoves: number;
  accuracy: number;
  lastMoveCorrect: boolean | null;
  setOpening: (opening: Opening, userColor: 'white' | 'black') => void;
  selectSquare: (square: string | null) => void;
  makeUserMove: (from: string, to: string) => boolean;
  resetSession: () => void;
}

export const useOpeningPractice = (): UseOpeningPracticeReturn => {
  const [opening, setOpeningState] = useState<Opening | null>(null);
  const [userColor, setUserColor] = useState<'white' | 'black'>('white');
  const [openingDatabase] = useState(() => new OpeningDatabase());
  const [aiOpponent, setAIOpponent] = useState<AIOpponent | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [lastMoveCorrect, setLastMoveCorrect] = useState<boolean | null>(null);

  const {
    engine,
    moveHistory,
    lastMove,
    currentTurn,
    makeMove,
    resetGame,
  } = useChessGame();

  // Initialize AI opponent when engine is ready
  useEffect(() => {
    if (engine) {
      const ai = new AIOpponent(engine, openingDatabase);
      setAIOpponent(ai);
    }
  }, [engine, openingDatabase]);

  const setOpening = useCallback(
    (newOpening: Opening, color: 'white' | 'black') => {
      setOpeningState(newOpening);
      setUserColor(color);
      resetGame();
      setCorrectMoves(0);
      setTotalMoves(0);
      setLastMoveCorrect(null);
      setSelectedSquare(null);

      if (aiOpponent && newOpening) {
        aiOpponent.setOpening(newOpening);
        aiOpponent.reset();

        // If user is black, AI makes first move
        if (color === 'black' && engine.getTurn() === 'white' && aiOpponent) {
          setTimeout(() => {
            const aiMove = aiOpponent.makeMove();
            if (aiMove) {
              makeMove(aiMove.from, aiMove.to, aiMove.promotion);
            }
          }, 300);
        }
      }
    },
    [aiOpponent, engine, resetGame, makeMove]
  );

  const selectSquare = useCallback((square: string | null) => {
    setSelectedSquare(square);
  }, []);

  const makeUserMove = useCallback(
    (from: string, to: string): boolean => {
      if (currentTurn !== userColor) {
        return false;
      }

      const move = makeMove(from, to);
      if (!move) {
        return false;
      }

      // Check if move follows opening theory
      const isCorrect = opening && aiOpponent
        ? aiOpponent.isMoveInTheory(move)
        : true; // If no opening set, consider all moves correct

      setTotalMoves((prev) => prev + 1);
      if (isCorrect) {
        setCorrectMoves((prev) => prev + 1);
      }
      setLastMoveCorrect(isCorrect);

      // Record move for AI
      if (aiOpponent) {
        aiOpponent.recordUserMove(move);
      }

      // AI makes move after a short delay
      setTimeout(() => {
        if (aiOpponent && engine.getTurn() !== userColor) {
          const aiMove = aiOpponent.makeMove();
          if (aiMove) {
            makeMove(aiMove.from, aiMove.to, aiMove.promotion);
            if (aiOpponent) {
              aiOpponent.recordUserMove(aiMove);
            }
          }
        }
      }, 500);

      return true;
    },
    [currentTurn, userColor, makeMove, opening, aiOpponent, engine]
  );

  const resetSession = useCallback(() => {
    resetGame();
    setCorrectMoves(0);
    setTotalMoves(0);
    setLastMoveCorrect(null);
    setSelectedSquare(null);

    if (aiOpponent) {
      aiOpponent.reset();
    }

    // If user is black, AI makes first move after reset
    if (opening && userColor === 'black' && engine.getTurn() === 'white') {
      setTimeout(() => {
        if (aiOpponent) {
          const aiMove = aiOpponent.makeMove();
          if (aiMove) {
            makeMove(aiMove.from, aiMove.to, aiMove.promotion);
          }
        }
      }, 300);
    }
  }, [resetGame, aiOpponent, opening, userColor, engine, makeMove]);

  const accuracy = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;
  const isUserTurn = currentTurn === userColor;

  return {
    opening,
    userColor,
    engine,
    aiOpponent,
    selectedSquare,
    lastMove,
    moveHistory,
    isUserTurn,
    correctMoves,
    totalMoves,
    accuracy,
    lastMoveCorrect,
    setOpening,
    selectSquare,
    makeUserMove,
    resetSession,
  };
};

