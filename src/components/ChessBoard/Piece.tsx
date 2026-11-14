/**
 * Chess Piece Component
 * Renders chess pieces as vector Staunton shapes
 */

import React from 'react';
import { G } from 'react-native-svg';
import {
  StauntonBishop,
  StauntonKing,
  StauntonKnight,
  StauntonPawn,
  StauntonQueen,
  StauntonRook,
} from './pieces/staunton';

interface PieceProps {
  x: number;
  y: number;
  size: number;
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: 'white' | 'black';
}

export const Piece: React.FC<PieceProps> = ({ x, y, size, type, color }) => {
  const renderByType = () => {
    switch (type) {
      case 'p':
        return <StauntonPawn x={x} y={y} size={size} color={color} />;
      case 'r':
        return <StauntonRook x={x} y={y} size={size} color={color} />;
      case 'n':
        return <StauntonKnight x={x} y={y} size={size} color={color} />;
      case 'b':
        return <StauntonBishop x={x} y={y} size={size} color={color} />;
      case 'q':
        return <StauntonQueen x={x} y={y} size={size} color={color} />;
      case 'k':
        return <StauntonKing x={x} y={y} size={size} color={color} />;
      default:
        return null;
    }
  };

  return <G>{renderByType()}</G>;
};
