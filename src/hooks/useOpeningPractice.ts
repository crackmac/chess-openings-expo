/**
 * Custom hook for managing opening practice session
 */

import { useState, useCallback, useEffect } from "react";
import { ChessEngine } from "../services/chess/chessEngine";
import { AIOpponent } from "../services/chess/aiOpponent";
import { OpeningDatabase } from "../services/chess/openingDatabase";
import { Opening, Move } from "../types";
import { useChessGame } from "./useChessGame";
import { useProgress } from "./useProgress";

interface UseOpeningPracticeReturn {
  opening: Opening | null;
  userColor: "white" | "black";
  engine: ChessEngine;
  aiOpponent: AIOpponent | null;
  selectedSquare: string | null;
  lastMove: Move | null;
  moveHistory: Move[];
  currentTurn: "white" | "black";
  isUserTurn: boolean;
  correctMoves: number;
  totalMoves: number;
  accuracy: number;
  lastMoveCorrect: boolean | null;
  sessionEnded: boolean;
  showRatingPrompt: boolean;
  openingCompleted: boolean;
  waitingForInteraction: boolean;
  setOpening: (opening: Opening, userColor: "white" | "black") => void;
  selectSquare: (square: string | null) => void;
  makeUserMove: (from: string, to: string) => boolean;
  resetSession: () => void;
  endSession: (showRating?: boolean) => void;
  rateOpening: (rating: "hard" | "good" | "easy") => Promise<boolean>;
  skipRating: () => void;
  checkOpeningCompletion: () => boolean;
  handleInteraction: () => void;
}

export const useOpeningPractice = (): UseOpeningPracticeReturn => {
  const [opening, setOpeningState] = useState<Opening | null>(null);
  const [userColor, setUserColor] = useState<"white" | "black">("white");
  const [openingDatabase] = useState(() => new OpeningDatabase());
  const [aiOpponent, setAIOpponent] = useState<AIOpponent | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [lastMoveCorrect, setLastMoveCorrect] = useState<boolean | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [hasMadeMistake, setHasMadeMistake] = useState(false);
  const [openingCompleted, setOpeningCompleted] = useState(false);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());

  const { updateProgress, updateRating, saveSessionStats } = useProgress();

  const { engine, moveHistory, lastMove, currentTurn, makeMove, resetGame } =
    useChessGame();

  // Initialize AI opponent when engine is ready
  useEffect(() => {
    if (engine) {
      const ai = new AIOpponent(engine, openingDatabase);
      setAIOpponent(ai);
    }
  }, [engine, openingDatabase]);

  // Debug: Log when currentTurn changes
  useEffect(() => {
    console.log(
      "currentTurn changed:",
      currentTurn,
      "userColor:",
      userColor,
      "isUserTurn:",
      currentTurn === userColor && !sessionEnded
    );
  }, [currentTurn, userColor, sessionEnded]);

  const setOpening = useCallback(
    (newOpening: Opening, color: "white" | "black") => {
      setOpeningState(newOpening);
      setUserColor(color);
      resetGame();
      setCorrectMoves(0);
      setTotalMoves(0);
      setLastMoveCorrect(null);
      setSelectedSquare(null);
      setSessionEnded(false);
      setShowRatingPrompt(false);
      setHasMadeMistake(false);

      if (aiOpponent && newOpening) {
        aiOpponent.setOpening(newOpening);
        aiOpponent.reset();

        // If user is black, AI makes first move
        if (color === "black" && engine.getTurn() === "white" && aiOpponent) {
          setTimeout(() => {
            const aiMove = aiOpponent.getMove();
            if (aiMove) {
              const executedMove = makeMove(
                aiMove.from,
                aiMove.to,
                aiMove.promotion
              );
              if (executedMove && aiOpponent) {
                aiOpponent.recordUserMove(executedMove);
              }
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

  // Check if opening sequence is completed (with optional moveHistory override)
  const checkOpeningCompletionWithHistory = useCallback(
    (history: Move[]) => {
      if (!opening || history.length === 0) {
        return false;
      }

      // Check if we've completed the main line
      const mainLineLength = opening.mainLine.length;
      if (history.length >= mainLineLength) {
        return true;
      }

      // Check if we've completed any alternate line
      for (const altLine of opening.alternateLines) {
        if (history.length >= altLine.moves.length) {
          return true;
        }
      }

      return false;
    },
    [opening]
  );

  // Check if opening sequence is completed (uses current moveHistory)
  const checkOpeningCompletion = useCallback(() => {
    return checkOpeningCompletionWithHistory(moveHistory);
  }, [checkOpeningCompletionWithHistory, moveHistory]);

  // Check if opening theory is exhausted
  const checkTheoryExhausted = useCallback(() => {
    if (!opening || !aiOpponent) {
      return false;
    }

    // Check if we're still in opening theory by checking if expected move exists
    const expectedMove = OpeningDatabase.getExpectedMove(
      opening,
      moveHistory,
      engine.getTurn()
    );
    return expectedMove === null;
  }, [opening, moveHistory, engine]);

  const makeUserMove = useCallback(
    (from: string, to: string): boolean => {
      // Check current turn from engine directly to avoid stale closure
      const currentEngineTurn = engine.getTurn();
      console.log("User move attempt:", {
        from,
        to,
        currentTurn,
        currentEngineTurn,
        userColor,
        sessionEnded,
        canMove: currentEngineTurn === userColor && !sessionEnded,
      });

      if (currentEngineTurn !== userColor || sessionEnded) {
        console.log("Move blocked - not user turn or session ended");
        return false;
      }

      const move = makeMove(from, to);
      if (!move) {
        return false;
      }

      // Check if move follows opening theory
      const isCorrect =
        opening && aiOpponent ? aiOpponent.isMoveInTheory(move) : true; // If no opening set, consider all moves correct

      setTotalMoves((prev) => prev + 1);
      if (isCorrect) {
        setCorrectMoves((prev) => prev + 1);

        // Check if opening is completed after this correct move
        // Check immediately with updated moveHistory (move was just added)
        // Note: moveHistory state might not be updated yet, so we manually add the move
        const updatedMoveHistory = [...moveHistory, move];
        const isCompleted =
          checkOpeningCompletionWithHistory(updatedMoveHistory);

        console.log("Completion check after user move:", {
          moveHistoryLength: moveHistory.length,
          updatedMoveHistoryLength: updatedMoveHistory.length,
          mainLineLength: opening?.mainLine.length,
          isCompleted,
        });

        if (isCompleted) {
          // Opening completed successfully - mark as completed and end session
          console.log("Opening completed! Ending session.");
          setOpeningCompleted(true);
          endSession(true);
          return true; // Return early, don't continue with AI move if opening is completed
        }
      } else {
        // User made a mistake - mark it and end session with rating prompt
        setHasMadeMistake(true);
        setTimeout(() => {
          endSession(true); // Show rating prompt
        }, 100);
        setLastMoveCorrect(isCorrect);
        return true; // Return early, don't continue with AI move
      }
      setLastMoveCorrect(isCorrect);

      // Record move for AI
      if (aiOpponent) {
        aiOpponent.recordUserMove(move);
      }

      // AI makes move after a short delay
      setTimeout(() => {
        // Don't proceed if session already ended (e.g., opening completed)
        if (sessionEnded) {
          console.log("AI move skipped - session already ended");
          return;
        }

        // Check current turn from engine directly to avoid stale closure
        const currentEngineTurn = engine.getTurn();
        console.log("AI move check:", {
          currentEngineTurn,
          userColor,
          sessionEnded,
          shouldMakeMove: currentEngineTurn !== userColor && !sessionEnded,
        });

        if (aiOpponent && currentEngineTurn !== userColor && !sessionEnded) {
          const aiMove = aiOpponent.getMove();
          console.log("AI move calculated:", aiMove);
          if (aiMove) {
            // Execute the move on the engine
            const executedMove = makeMove(
              aiMove.from,
              aiMove.to,
              aiMove.promotion
            );
            console.log("AI move executed:", executedMove);
            if (executedMove && aiOpponent) {
              // Record the executed move in AI's history
              aiOpponent.recordUserMove(executedMove);
              const newTurn = engine.getTurn();
              console.log(
                "Turn after AI move:",
                newTurn,
                "Expected user turn:",
                userColor
              );
              // currentTurn state will be updated by makeMove in useChessGame,
              // which will trigger a re-render and update isUserTurn

              // Check if opening is completed AFTER AI move
              // Check immediately with updated moveHistory (AI move was just added)
              // Note: moveHistory state might not be updated yet, so we manually add the move
              const updatedMoveHistory = [...moveHistory, executedMove];
              const isCompleted =
                checkOpeningCompletionWithHistory(updatedMoveHistory);

              console.log("Completion check after AI move:", {
                moveHistoryLength: moveHistory.length,
                updatedMoveHistoryLength: updatedMoveHistory.length,
                mainLineLength: opening?.mainLine.length,
                isCompleted,
              });

              if (isCompleted) {
                // Opening completed successfully - mark as completed and show rating prompt
                console.log("Opening completed! Ending session.");
                setOpeningCompleted(true);
                endSession(true);
              }
              // Don't check theory exhaustion here - let the user make their move first
            }
          } else {
            // AI can't make a move - check if theory is exhausted
            // Get current moveHistory (user's move is already recorded)
            const currentTurnAfterUserMove = engine.getTurn();
            const userExpectedMove = OpeningDatabase.getExpectedMove(
              opening!,
              moveHistory,
              currentTurnAfterUserMove
            );
            const aiColor = userColor === "white" ? "black" : "white";
            const aiExpectedMove = OpeningDatabase.getExpectedMove(
              opening!,
              moveHistory,
              aiColor
            );

            console.log("AI can't make move - checking theory:", {
              userExpectedMove: userExpectedMove !== null,
              aiExpectedMove: aiExpectedMove !== null,
            });

            // Only end if neither player has an expected move
            if (!userExpectedMove && !aiExpectedMove) {
              endSession(false);
            }
          }
        }
      }, 500);

      return true;
    },
    [
      currentTurn,
      userColor,
      makeMove,
      opening,
      aiOpponent,
      engine,
      sessionEnded,
      checkOpeningCompletionWithHistory,
    ]
  );

  const endSession = useCallback(
    async (showRating: boolean = false) => {
      if (sessionEnded) {
        return;
      }

      setSessionEnded(true);

      // Calculate current accuracy
      const currentAccuracy =
        totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;

      // Save progress
      if (opening && totalMoves > 0) {
        try {
          console.log("Saving progress:", {
            openingId: opening.id,
            accuracy: currentAccuracy,
            correctMoves,
            totalMoves,
          });
          await updateProgress(
            opening.id,
            currentAccuracy,
            correctMoves,
            totalMoves
          );

          // Save session stats
          const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
          await saveSessionStats({
            sessionId: `${opening.id}-${Date.now()}`,
            openingId: opening.id,
            date: new Date(),
            accuracy: currentAccuracy,
            totalMoves,
            correctMoves,
            duration,
          });
        } catch (error) {
          console.error("Error saving session progress:", error);
        }
      }

      // Show rating prompt only if requested (opening completed or mistake made)
      // But wait for user interaction first
      if (showRating) {
        setWaitingForInteraction(true);
      }
    },
    [
      sessionEnded,
      opening,
      totalMoves,
      correctMoves,
      updateProgress,
      saveSessionStats,
      sessionStartTime,
    ]
  );

  const rateOpening = useCallback(
    async (rating: "hard" | "good" | "easy"): Promise<boolean> => {
      if (!opening) {
        return false;
      }

      try {
        await updateRating(opening.id, rating);
        setShowRatingPrompt(false);
        setWaitingForInteraction(false);
        // Return true to indicate rating was completed (for navigation)
        return true;
      } catch (error) {
        console.error("Error rating opening:", error);
        return false;
      }
    },
    [opening, updateRating]
  );

  const skipRating = useCallback(() => {
    setShowRatingPrompt(false);
    setWaitingForInteraction(false);
  }, []);

  const handleInteraction = useCallback(() => {
    if (waitingForInteraction) {
      setWaitingForInteraction(false);
      setShowRatingPrompt(true);
    }
  }, [waitingForInteraction]);

  const resetSession = useCallback(() => {
    resetGame();
    setCorrectMoves(0);
    setTotalMoves(0);
    setLastMoveCorrect(null);
    setSelectedSquare(null);
    setSessionEnded(false);
    setShowRatingPrompt(false);
    setHasMadeMistake(false);
    setOpeningCompleted(false);
    setWaitingForInteraction(false);

    if (aiOpponent) {
      aiOpponent.reset();
    }

    // If user is black, AI makes first move after reset
    if (opening && userColor === "black" && engine.getTurn() === "white") {
      setTimeout(() => {
        if (aiOpponent) {
          const aiMove = aiOpponent.getMove();
          if (aiMove) {
            const executedMove = makeMove(
              aiMove.from,
              aiMove.to,
              aiMove.promotion
            );
            if (executedMove && aiOpponent) {
              aiOpponent.recordUserMove(executedMove);
            }
          }
        }
      }, 300);
    }
  }, [resetGame, aiOpponent, opening, userColor, engine, makeMove]);

  const accuracy = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;
  // Use currentTurn from useChessGame which updates reactively when moves are made
  // This ensures the component re-renders when the turn changes
  const isUserTurn = currentTurn === userColor && !sessionEnded;

  return {
    opening,
    userColor,
    engine,
    aiOpponent,
    selectedSquare,
    lastMove,
    moveHistory,
    currentTurn,
    isUserTurn,
    correctMoves,
    totalMoves,
    accuracy,
    lastMoveCorrect,
    sessionEnded,
    showRatingPrompt,
    openingCompleted,
    waitingForInteraction,
    setOpening,
    selectSquare,
    makeUserMove,
    resetSession,
    endSession,
    rateOpening,
    skipRating,
    checkOpeningCompletion,
    handleInteraction,
  };
};
