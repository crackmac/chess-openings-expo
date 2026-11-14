/**
 * Chess Board Square Component
 */

import React from 'react';
import { Circle, Rect } from 'react-native-svg';
import { useAppTheme } from '../../theme';

type HighlightType = 'dot' | 'capture' | null;

interface SquareProps {
  x: number;
  y: number;
  size: number;
  isLight: boolean;
  highlightType?: HighlightType;
  isLastMove?: boolean;
  isSelected?: boolean;
  isCheckSquare?: boolean;
}

export const Square: React.FC<SquareProps> = ({
  x,
  y,
  size,
  isLight,
  highlightType,
  isLastMove,
  isSelected,
  isCheckSquare,
}) => {
  const { theme } = useAppTheme();

  const baseFill = isLight ? theme.colors.boardLight : theme.colors.boardDark;

  return (
    <>
      <Rect x={x} y={y} width={size} height={size} fill={baseFill} />

      {isLastMove && (
        <Rect x={x} y={y} width={size} height={size} fill={theme.colors.boardLastMove} />
      )}

      {isSelected && (
        <Rect x={x} y={y} width={size} height={size} fill={theme.colors.boardSelected} />
      )}

      {isCheckSquare && (
        <Rect x={x} y={y} width={size} height={size} fill={theme.colors.boardCheck} />
      )}

      {highlightType === 'dot' && (
        <Circle
          cx={x + size / 2}
          cy={y + size / 2}
          r={size * 0.14}
          fill={theme.colors.boardMoveDot}
        />
      )}

      {highlightType === 'capture' && (
        <Circle
          cx={x + size / 2}
          cy={y + size / 2}
          r={size * 0.42}
          fill="transparent"
          stroke={theme.colors.boardCaptureRing}
          strokeWidth={size * 0.08}
        />
      )}
    </>
  );
};
