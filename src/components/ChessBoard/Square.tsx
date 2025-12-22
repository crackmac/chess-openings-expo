/**
 * Chess Board Square Component
 */

import React from 'react';
import { Rect } from 'react-native-svg';
import { StyleSheet } from 'react-native';

interface SquareProps {
  x: number;
  y: number;
  size: number;
  isLight: boolean;
  isHighlighted?: boolean;
  isLastMove?: boolean;
  isSelected?: boolean;
}

export const Square: React.FC<SquareProps> = ({
  x,
  y,
  size,
  isLight,
  isHighlighted,
  isLastMove,
  isSelected,
}) => {
  const getFillColor = () => {
    if (isSelected) return '#b0c4de'; // Light blue for selected
    if (isLastMove) return '#f0e68c'; // Khaki for last move
    if (isHighlighted) return '#90ee90'; // Light green for valid moves
    return isLight ? '#f0d9b5' : '#b58863'; // Standard light/dark squares
  };

  return (
    <Rect
      x={x}
      y={y}
      width={size}
      height={size}
      fill={getFillColor()}
    />
  );
};

