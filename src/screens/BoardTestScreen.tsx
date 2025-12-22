/**
 * Test Screen for Chess Board Component
 */

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChessBoard } from '../components/ChessBoard';
import { ChessEngine } from '../services/chess/chessEngine';
import { Move } from '../types';

export const BoardTestScreen: React.FC = () => {
  const [engine] = useState(() => new ChessEngine());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  const handleMove = (move: Move) => {
    setLastMove(move);
    setMoveHistory((prev) => [...prev, move]);
    setSelectedSquare(null);
  };

  const handleSquareSelect = (square: string | null) => {
    setSelectedSquare(square);
  };

  const handleReset = () => {
    engine.reset();
    setSelectedSquare(null);
    setLastMove(null);
    setMoveHistory([]);
  };

  const handleUndo = () => {
    const undone = engine.undo();
    if (undone) {
      setMoveHistory((prev) => prev.slice(0, -1));
      setLastMove(moveHistory[moveHistory.length - 2] || null);
    }
  };

  const currentTurn = engine.getTurn();
  const isCheck = engine.isCheck();
  const isCheckmate = engine.isCheckmate();
  const isStalemate = engine.isStalemate();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Chess Board Test</Text>
        <Text style={styles.subtitle}>
          Turn: {currentTurn === 'white' ? 'White' : 'Black'}
        </Text>
        {isCheck && <Text style={styles.warning}>Check!</Text>}
        {isCheckmate && <Text style={styles.warning}>Checkmate!</Text>}
        {isStalemate && <Text style={styles.warning}>Stalemate!</Text>}
      </View>

      <View style={styles.boardContainer}>
        <ChessBoard
          engine={engine}
          onMove={handleMove}
          flipped={flipped}
          showValidMoves={true}
          selectedSquare={selectedSquare}
          onSquareSelect={handleSquareSelect}
          lastMove={lastMove}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUndo}>
          <Text style={styles.buttonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setFlipped(!flipped)}
        >
          <Text style={styles.buttonText}>
            {flipped ? 'White View' : 'Black View'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedSquare && (
        <View style={styles.info}>
          <Text style={styles.infoText}>
            Selected: {selectedSquare}
          </Text>
        </View>
      )}

      {moveHistory.length > 0 && (
        <View style={styles.moveHistory}>
          <Text style={styles.moveHistoryTitle}>Move History:</Text>
          <Text style={styles.moveHistoryText}>
            {moveHistory.map((move, idx) => (
              <Text key={idx}>
                {idx % 2 === 0 ? `\n${Math.floor(idx / 2) + 1}. ` : ' '}
                {move.san}
              </Text>
            ))}
          </Text>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  warning: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginTop: 4,
  },
  boardContainer: {
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
    width: '100%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  moveHistory: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
  },
  moveHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moveHistoryText: {
    fontSize: 14,
    color: '#333',
  },
});

