import React from 'react';
import { Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonRook: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Rect x={centerX - size * 0.24} y={y + size * 0.18} width={size * 0.48} height={size * 0.13} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX - size * 0.27} y={y + size * 0.12} width={size * 0.12} height={size * 0.08} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX - size * 0.06} y={y + size * 0.12} width={size * 0.12} height={size * 0.08} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX + size * 0.15} y={y + size * 0.12} width={size * 0.12} height={size * 0.08} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX - size * 0.18} y={y + size * 0.32} width={size * 0.36} height={size * 0.5} rx={size * 0.06} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX - size * 0.24} y={y + size * 0.82} width={size * 0.48} height={size * 0.08} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
    </>
  );
};
