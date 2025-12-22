/**
 * Main Game Screen
 * Displays chess board with opening practice functionality
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChessBoard } from '../components/ChessBoard';
import { DifficultyRating } from '../components/DifficultyRating';
import { useOpeningPractice } from '../hooks/useOpeningPractice';
import { useProgress } from '../hooks/useProgress';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, 'Game'>;

export const GameScreen: React.FC = () => {
  const route = useRoute<GameRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { opening, userColor } = route.params;
  const { getOpeningProgress } = useProgress();

  const {
    engine,
    selectedSquare,
    lastMove,
    moveHistory,
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
    currentTurn,
  } = useOpeningPractice();

  // Initialize opening when component mounts
  React.useEffect(() => {
    setOpening(opening, userColor);
  }, [opening.id, userColor, setOpening]);

  const currentProgress = opening ? getOpeningProgress(opening.id) : null;

  const handleMove = (move: { from: string; to: string; san: string }) => {
    if (selectedSquare) {
      const success = makeUserMove(selectedSquare, move.to);
      if (success) {
        selectSquare(null);
      }
    }
  };

  const handleSquarePress = React.useCallback((square: string) => {
    // Check turn directly from engine to avoid stale state
    const currentEngineTurn = engine.getTurn();
    console.log('handleSquarePress called:', {
      square,
      currentEngineTurn,
      currentTurn,
      userColor,
      sessionEnded,
      isUserTurn,
      canSelect: currentEngineTurn === userColor && !sessionEnded,
    });

    if (currentEngineTurn !== userColor || sessionEnded) {
      console.log('Square press blocked - not user turn or session ended');
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
      console.log('Checking piece:', { square, piece, pieceColor: piece?.color, userColor });
      if (piece && piece.color === userColor) {
        console.log('Selecting square:', square);
        selectSquare(square);
      } else {
        console.log('Cannot select - no piece or wrong color');
      }
    }
  }, [engine, userColor, sessionEnded, selectedSquare, makeUserMove, selectSquare, isUserTurn, currentTurn]);

  return (
    <Pressable
      onPress={waitingForInteraction ? handleInteraction : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Playing as {userColor === 'white' ? 'White' : 'Black'}
        </Text>
      </View>

      {openingCompleted ? (
        <View style={styles.completionBanner}>
          <Text style={styles.completionText}>
            🎉 You know the {opening.name} opening!
          </Text>
          {waitingForInteraction && (
            <Text style={styles.tapToContinueText}>
              Tap anywhere to continue...
            </Text>
          )}
        </View>
      ) : (
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

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={resetSession}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => selectSquare(null)}
        >
          <Text style={styles.buttonText}>Deselect</Text>
        </TouchableOpacity>
        {!sessionEnded && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // Only show rating if opening was completed correctly
              const completed = checkOpeningCompletion();
              endSession(completed);
            }}
          >
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
        )}
      </View>

      <DifficultyRating
        visible={showRatingPrompt}
        currentRating={currentProgress?.difficultyRating}
        openingName={opening.name}
        onRate={async (rating) => {
          const success = await rateOpening(rating);
          if (success) {
            // Navigate back to main screen after rating
            navigation.navigate('MainTabs');
          }
        }}
        onSkip={() => {
          skipRating();
          // Navigate back to main screen after skipping
          navigation.navigate('MainTabs');
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
    </Pressable>
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
    backgroundColor: '#2196f3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
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

