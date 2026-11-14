import React from 'react';
import { Line, Path, Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonBishop: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Path
        d={`M ${centerX} ${y + size * 0.12} C ${centerX + size * 0.16} ${y + size * 0.22}, ${centerX + size * 0.16} ${y + size * 0.42}, ${centerX} ${y + size * 0.5} C ${centerX - size * 0.16} ${y + size * 0.42}, ${centerX - size * 0.16} ${y + size * 0.22}, ${centerX} ${y + size * 0.12} Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
      <Line x1={centerX - size * 0.06} y1={y + size * 0.24} x2={centerX + size * 0.06} y2={y + size * 0.38} stroke={palette.stroke} strokeWidth={outlineWidth * 0.8} />
      <Rect x={centerX - size * 0.18} y={y + size * 0.52} width={size * 0.36} height={size * 0.3} rx={size * 0.08} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Rect x={centerX - size * 0.24} y={y + size * 0.82} width={size * 0.48} height={size * 0.08} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
    </>
  );
};
