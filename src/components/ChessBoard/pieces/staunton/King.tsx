import React from 'react';
import { Line, Path, Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonKing: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Line x1={centerX} y1={y + size * 0.07} x2={centerX} y2={y + size * 0.2} stroke={palette.stroke} strokeWidth={outlineWidth} strokeLinecap="round" />
      <Line x1={centerX - size * 0.05} y1={y + size * 0.12} x2={centerX + size * 0.05} y2={y + size * 0.12} stroke={palette.stroke} strokeWidth={outlineWidth} strokeLinecap="round" />
      <Path
        d={`M ${centerX - size * 0.19} ${y + size * 0.8} C ${centerX - size * 0.16} ${y + size * 0.52}, ${centerX - size * 0.12} ${y + size * 0.3}, ${centerX} ${y + size * 0.22} C ${centerX + size * 0.12} ${y + size * 0.3}, ${centerX + size * 0.16} ${y + size * 0.52}, ${centerX + size * 0.19} ${y + size * 0.8} Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
      <Rect x={centerX - size * 0.24} y={y + size * 0.82} width={size * 0.48} height={size * 0.08} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
    </>
  );
};
