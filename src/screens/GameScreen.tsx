/**
 * Main Game Screen
 * Displays chess board with opening practice functionality
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChessBoard } from '../components/ChessBoard';
import { DifficultyRating } from '../components/DifficultyRating';
import { useOpeningPractice } from '../hooks/useOpeningPractice';
import { useProgress } from '../hooks/useProgress';
import { RootStackParamList } from '../navigation/AppNavigator';
import { allOpenings } from '../data/openings';
import { OpeningRoulette } from '../services/gamification/openingRoulette';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export const GameScreen: React.FC = () => {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { opening: initialOpening, userColor: initialUserColor } = route.params;
  const { getOpeningProgress, progress } = useProgress();

  const {
    opening,
    userColor,
    engine,
    selectedSquare,
    lastMove,
    moveHistory,
    isUserTurn,
    correctMoves,
    totalMoves,
    accuracy,
    lastMoveCorrect,
    expectedMove,
    sessionEnded,
    showRatingPrompt,
    sessionOutcome,
    setOpening,
    selectSquare,
    makeUserMove,
    resetSession,
    endSession,
    rateOpening,
    skipRating,
    checkOpeningCompletion,
    triggerRatingPrompt,
  } = useOpeningPractice();

  // Initialize opening when component mounts
  React.useEffect(() => {
    setOpening(initialOpening, initialUserColor);
  }, [initialOpening.id, initialUserColor, setOpening]);

  // Update navigation title when opening changes
  React.useEffect(() => {
    if (opening) {
      navigation.setOptions({ title: opening.name });
    }
  }, [opening, navigation]);

  const currentProgress = opening ? getOpeningProgress(opening.id) : null;

  // Track pending action after rating (for completion/failure flow)
  const [pendingAction, setPendingAction] = React.useState<'next' | 'browse' | 'retry' | null>(null);

  const handleMove = (move: { from: string; to: string; san: string }) => {
    if (selectedSquare) {
      const success = makeUserMove(selectedSquare, move.to);
      if (success) {
        selectSquare(null);
      }
    }
  };

  const handleSquarePress = React.useCallback((square: string | null) => {
    // Check turn directly from engine to avoid stale state
    const currentEngineTurn = engine.getTurn();

    if (!square || currentEngineTurn !== userColor || sessionEnded) {
      return;
    }

    if (selectedSquare === square) {
      selectSquare(null);
    } else if (selectedSquare) {
      // Try to make move
      const success = makeUserMove(selectedSquare, square);
      if (success) {
        selectSquare(null);
      }
    } else {
      // Select square
      const piece = engine.getPiece(square);
      if (piece && piece.color === userColor) {
        selectSquare(square);
      }
    }
  }, [engine, userColor, sessionEnded, selectedSquare, makeUserMove, selectSquare]);

  const handleTryAgain = React.useCallback(() => {
    // For failed sessions, show rating prompt first
    if (sessionOutcome === 'failed') {
      setPendingAction('retry');
      triggerRatingPrompt();
    } else {
      resetSession();
    }
  }, [sessionOutcome, resetSession, triggerRatingPrompt]);

  const loadNextOpening = React.useCallback(async () => {
    const roulette = new OpeningRoulette();

    // Select next opening (avoid same opening)
    let nextOpening = roulette.selectOpening(allOpenings, progress);
    let attempts = 0;
    while (opening && nextOpening.id === opening.id && attempts < 5) {
      nextOpening = roulette.selectOpening(allOpenings, progress);
      attempts++;
    }

    // Random color assignment
    const randomUserColor = Math.random() < 0.5 ? 'white' : 'black';

    // Load new opening in same session
    setOpening(nextOpening, randomUserColor);
  }, [opening, setOpening, progress]);

  const handleNextOpening = React.useCallback(() => {
    // For completed sessions, show rating prompt first
    if (sessionOutcome === 'completed') {
      setPendingAction('next');
      triggerRatingPrompt();
    } else {
      loadNextOpening();
    }
  }, [sessionOutcome, loadNextOpening, triggerRatingPrompt]);

  const handleBrowseOpenings = React.useCallback(() => {
    // For completed sessions, show rating prompt first
    if (sessionOutcome === 'completed') {
      setPendingAction('browse');
      triggerRatingPrompt();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [sessionOutcome, navigation, triggerRatingPrompt]);

  const renderActionButtons = () => {
    switch (sessionOutcome) {
      case 'active':
        return (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                const completed = checkOpeningCompletion();
                endSession(completed);
                // Navigate away after manually ending session
                navigation.navigate('MainTabs');
              }}
            >
              <Text style={styles.buttonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleNextOpening}
            >
              <Text style={styles.buttonText}>Next Opening</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBrowseOpenings}
            >
              <Text style={styles.buttonText}>Browse Openings</Text>
            </TouchableOpacity>
          </View>
        );

      case 'failed':
        return (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleTryAgain}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                // For failed sessions, show rating prompt first
                setPendingAction('browse');
                triggerRatingPrompt();
              }}
            >
              <Text style={styles.buttonText}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        );

      case 'theory_exhausted':
        return (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.buttonText}>Browse Openings</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Playing as {userColor === 'white' ? 'White' : 'Black'}
        </Text>
      </View>

      {sessionOutcome === 'completed' && opening && (
        <View style={styles.completionBanner}>
          <Text style={styles.completionText}>
            🎉 You know the {opening.name} opening!
          </Text>
        </View>
      )}

      {sessionOutcome === 'active' && opening && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{accuracy.toFixed(0)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={styles.statValue}>
              {correctMoves}/{totalMoves}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Turn</Text>
            <Text style={styles.statValue}>
              {isUserTurn ? 'Your Turn' : 'AI Turn'}
            </Text>
          </View>
        </View>
      )}

      {lastMoveCorrect !== null && (
        <View
          style={[
            styles.feedback,
            lastMoveCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
          ]}
        >
          <Text style={styles.feedbackText}>
            {lastMoveCorrect ? '✓ Correct Move!' : '✗ Not in Opening Theory'}
          </Text>
          {!lastMoveCorrect && expectedMove && (
            <Text style={styles.expectedMoveText}>
              Expected: {expectedMove.san}
            </Text>
          )}
        </View>
      )}

      <View style={styles.boardContainer}>
        <ChessBoard
          engine={engine}
          onMove={handleMove}
          flipped={userColor === 'black'}
          showValidMoves={true}
          selectedSquare={selectedSquare}
          onSquareSelect={handleSquarePress}
          lastMove={lastMove}
        />
      </View>

      {renderActionButtons()}

      <DifficultyRating
        visible={showRatingPrompt}
        currentRating={currentProgress?.difficultyRating}
        openingName={opening?.name || ''}
        onRate={async (rating) => {
          const success = await rateOpening(rating);
          if (success) {
            // Execute pending action after rating
            if (pendingAction === 'next') {
              setPendingAction(null);
              loadNextOpening();
            } else if (pendingAction === 'browse') {
              setPendingAction(null);
              navigation.navigate('MainTabs');
            } else if (pendingAction === 'retry') {
              setPendingAction(null);
              resetSession();
            } else {
              // Default: navigate back to main screen
              navigation.navigate('MainTabs');
            }
          }
        }}
        onSkip={() => {
          skipRating();
          // Execute pending action after skipping
          if (pendingAction === 'next') {
            setPendingAction(null);
            loadNextOpening();
          } else if (pendingAction === 'browse') {
            setPendingAction(null);
            navigation.navigate('MainTabs');
          } else if (pendingAction === 'retry') {
            setPendingAction(null);
            resetSession();
          } else {
            // Default: navigate back to main screen
            navigation.navigate('MainTabs');
          }
        }}
      />

      {moveHistory.length > 0 && (
        <View style={styles.moveHistory}>
          <Text style={styles.moveHistoryTitle}>Move History:</Text>
          <ScrollView horizontal style={styles.moveHistoryScroll}>
            <Text style={styles.moveHistoryText}>
              {moveHistory.map((move, idx) => (
                <Text key={idx}>
                  {idx % 2 === 0 ? `\n${Math.floor(idx / 2) + 1}. ` : ' '}
                  {move.san}
                </Text>
              ))}
            </Text>
          </ScrollView>
        </View>
      )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completionBanner: {
    backgroundColor: '#4caf50',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tapToContinueText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    fontStyle: 'italic',
  },
  feedback: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#c8e6c9',
  },
  feedbackIncorrect: {
    backgroundColor: '#ffcdd2',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expectedMoveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  boardContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonPrimary: {
    backgroundColor: '#4caf50', // Green
  },
  buttonSecondary: {
    backgroundColor: '#2196f3', // Blue
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  moveHistory: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  moveHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moveHistoryScroll: {
    maxHeight: 100,
  },
  moveHistoryText: {
    fontSize: 14,
    color: '#333',
  },
});

