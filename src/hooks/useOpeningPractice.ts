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
import { GamificationTracker } from "../services/gamification/gamificationTracker";
import { ProgressTracker } from "../services/storage/progressTracker";

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
  expectedMove: Move | null;
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
  const [expectedMove, setExpectedMove] = useState<Move | null>(null);
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

      if (currentEngineTurn !== userColor || sessionEnded) {
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

        if (isCompleted) {
          // Opening completed successfully - mark as completed and end session
          setOpeningCompleted(true);
          endSession(true);
          return true; // Return early, don't continue with AI move if opening is completed
        }
      } else {
        // User made a mistake - get the expected move and show it
        let expected: Move | null = null;
        if (opening && aiOpponent) {
          // Get the expected move for the current position
          expected = OpeningDatabase.getExpectedMove(
            opening,
            moveHistory,
            userColor
          );
        }
        setExpectedMove(expected);
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
          return;
        }

        // Check current turn from engine directly to avoid stale closure
        const currentEngineTurn = engine.getTurn();

        if (aiOpponent && currentEngineTurn !== userColor && !sessionEnded) {
          const aiMove = aiOpponent.getMove();
          if (aiMove) {
            // Execute the move on the engine
            const executedMove = makeMove(
              aiMove.from,
              aiMove.to,
              aiMove.promotion
            );
            if (executedMove && aiOpponent) {
              // Record the executed move in AI's history
              aiOpponent.recordUserMove(executedMove);
              // currentTurn state will be updated by makeMove in useChessGame,
              // which will trigger a re-render and update isUserTurn

              // Check if opening is completed AFTER AI move
              // Check immediately with updated moveHistory (AI move was just added)
              // Note: moveHistory state might not be updated yet, so we manually add the move
              const updatedMoveHistory = [...moveHistory, executedMove];
              const isCompleted =
                checkOpeningCompletionWithHistory(updatedMoveHistory);

              if (isCompleted) {
                // Opening completed successfully - mark as completed and show rating prompt
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
          await updateProgress(
            opening.id,
            currentAccuracy,
            correctMoves,
            totalMoves
          );

          // Save session stats
          const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
          const sessionStats = {
            sessionId: `${opening.id}-${Date.now()}`,
            openingId: opening.id,
            date: new Date(),
            accuracy: currentAccuracy,
            totalMoves,
            correctMoves,
            duration,
          };
          await saveSessionStats(sessionStats);

          // Award XP for session
          try {
            const currentProgress = await ProgressTracker.getOpeningProgress(opening.id);
            if (currentProgress) {
              const sessionXP = GamificationTracker.calculateSessionXP(
                sessionStats,
                currentProgress,
                opening
              );

              const xpResult = await GamificationTracker.awardXP({
                type: 'session_complete',
                xp: sessionXP,
                timestamp: new Date(),
                metadata: {
                  openingId: opening.id,
                  accuracy: currentAccuracy,
                  completed: openingCompleted,
                },
              });

              // Update streak
              const streakResult = await GamificationTracker.updateStreak(new Date());

              // Check for new achievements
              const allProgress = await ProgressTracker.getAllProgress();
              const allSessionHistory = await ProgressTracker.getSessionHistory();
              const gamificationData = await GamificationTracker.load();
              const newAchievements = await GamificationTracker.checkAchievements(
                gamificationData,
                allProgress,
                allSessionHistory
              );

              // Log results for visibility
              console.log('Session XP awarded:', sessionXP);
              if (xpResult.leveledUp) {
                console.log('🎉 Level up! New level:', xpResult.newLevel);
              }
              if (streakResult.streakContinued) {
                console.log('🔥 Streak continued! Current:', streakResult.currentStreak);
              }
              if (newAchievements.length > 0) {
                console.log('🏆 Achievements unlocked:', newAchievements.map(a => a.name).join(', '));
              }
            }
          } catch (error) {
            console.error('Error processing gamification:', error);
          }
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
    setExpectedMove(null);
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
    expectedMove,
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
