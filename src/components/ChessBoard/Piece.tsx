/**
 * Chess Piece Component
 * Renders chess pieces using Unicode symbols
 */

import React from 'react';
import { Text } from 'react-native-svg';
import { StyleSheet } from 'react-native';

interface PieceProps {
  x: number;
  y: number;
  size: number;
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: 'white' | 'black';
}

const PIECE_SYMBOLS: Record<string, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  r: { white: '♖', black: '♜' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

export const Piece: React.FC<PieceProps> = ({ x, y, size, type, color }) => {
  const symbol = PIECE_SYMBOLS[type]?.[color] || '';

  return (
    <Text
      x={x + size / 2}
      y={y + size / 2 + size * 0.35}
      fontSize={size * 0.7}
      textAnchor="middle"
      fill={color === 'white' ? '#fff' : '#000'}
      fontWeight="bold"
    >
      {symbol}
    </Text>
  );
};
