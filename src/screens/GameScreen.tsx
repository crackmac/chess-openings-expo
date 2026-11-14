/**
 * Main Game Screen
 * Displays chess board with opening practice functionality
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChessBoard } from '../components/ChessBoard';
import { DifficultyRating } from '../components/DifficultyRating';
import { Badge } from '../components/ui';
import { useOpeningPractice } from '../hooks/useOpeningPractice';
import { useProgress } from '../hooks/useProgress';
import { RootStackParamList } from '../navigation/AppNavigator';
import { allOpenings } from '../data/openings';
import { OpeningRoulette } from '../services/gamification/openingRoulette';
import { useAppTheme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export const GameScreen: React.FC = () => {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { opening: initialOpening, userColor: initialUserColor } = route.params;
  const { getOpeningProgress, progress } = useProgress();
  const { theme } = useAppTheme();

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
  const moveTapeRef = React.useRef<ScrollView | null>(null);

  const openingName = opening?.name ?? initialOpening.name;
  const openingEco = opening?.eco ?? initialOpening.eco;
  const expectedLineLength = opening?.mainLine.length ?? initialOpening.mainLine.length;
  const currentPly = Math.min(moveHistory.length + 1, expectedLineLength || 1);

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

    // Default user color should match opening repertoire side
    const randomUserColor = nextOpening.color;

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
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderSubtle, borderWidth: 1 }]}
              onPress={resetSession}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.info }]}
              onPress={() => {
                const completed = checkOpeningCompletion();
                endSession(completed);
                // Navigate away after manually ending session
                navigation.navigate('MainTabs');
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>End Drill</Text>
            </TouchableOpacity>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.accentGold }]}
              onPress={handleNextOpening}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textOnAccent }]}>Next Drill</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.info }]}
              onPress={handleBrowseOpenings}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>Browse</Text>
            </TouchableOpacity>
          </View>
        );

      case 'failed':
        return (
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.accentGold }]}
              onPress={handleTryAgain}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textOnAccent }]}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonHalf, { backgroundColor: theme.colors.info }]}
              onPress={() => {
                // For failed sessions, show rating prompt first
                setPendingAction('browse');
                triggerRatingPrompt();
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.white }]}>Choose Different</Text>
            </TouchableOpacity>
          </View>
        );

      case 'theory_exhausted':
        return (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.accentGold }]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textOnAccent }]}>Browse Openings</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}> 
      <View style={[styles.topBar, { borderBottomColor: theme.colors.borderSubtle }]}> 
        <TouchableOpacity
          style={[styles.backButton, { borderColor: theme.colors.borderSubtle, backgroundColor: theme.colors.bgElevated }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.openingHeaderGroup}>
          <Text style={[styles.openingTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {openingName}
          </Text>
          <View style={styles.openingMetaRow}>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{openingEco}</Text>
            <Badge
              label={userColor === 'white' ? 'White' : 'Black'}
              tone="accent"
              style={styles.repertoireBadge}
            />
          </View>
        </View>

        <Text style={[styles.progressCounter, { color: theme.colors.textMuted }]}>
          {`Move ${currentPly} of ${expectedLineLength || 1}`}
        </Text>
      </View>

      <View style={[styles.feedbackStrip, { backgroundColor: theme.colors.bgSecondary }]}> 
        {lastMoveCorrect === null ? (
          <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}> 
            {isUserTurn ? 'Your move' : 'AI is thinking...'}
          </Text>
        ) : (
          <>
            <Text
              style={[
                styles.feedbackText,
                { color: lastMoveCorrect ? theme.colors.success : theme.colors.danger },
              ]}
            >
              {lastMoveCorrect ? 'Correct move' : 'Not in opening theory'}
            </Text>
            {!lastMoveCorrect && expectedMove && (
              <Text style={[styles.expectedMoveText, { color: theme.colors.warning }]}> 
                Expected: {expectedMove.san}
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.boardZone}>
        <View style={[styles.boardContainer, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
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
      </View>

      <View style={[styles.moveTape, { borderTopColor: theme.colors.borderSubtle, borderBottomColor: theme.colors.borderSubtle }]}> 
        <ScrollView
          ref={moveTapeRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={() => moveTapeRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.moveTapeContent}
        >
          <Text style={[styles.moveTapeText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {moveHistory.length > 0
              ? moveHistory
                  .map((move, idx) => (
                    `${idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ''} ${move.san}`
                  ))
                  .join(' ')
              : 'No moves yet'}
          </Text>
        </ScrollView>
      </View>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.bgSecondary, borderTopColor: theme.colors.borderSubtle }]}> 
        <View style={styles.statsCompact}>
          <Text style={[styles.statCompactText, { color: theme.colors.textSecondary }]}>Accuracy {accuracy.toFixed(0)}%</Text>
          <Text style={[styles.statCompactText, { color: theme.colors.textSecondary }]}>Correct {correctMoves}/{totalMoves}</Text>
        </View>
        {renderActionButtons()}
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  openingHeaderGroup: {
    flex: 1,
    minWidth: 0,
  },
  openingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  openingMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repertoireBadge: {
    paddingVertical: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 70,
  },
  feedbackStrip: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '700',
  },
  expectedMoveText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  boardZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  boardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  moveTape: {
    height: 44,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  moveTapeContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  moveTapeText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  statsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCompactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
  },
  buttonHalf: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 15,
  },
});
