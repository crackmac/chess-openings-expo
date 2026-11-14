import React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonQueen: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Circle cx={centerX - size * 0.14} cy={y + size * 0.16} r={size * 0.04} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth * 0.8} />
      <Circle cx={centerX} cy={y + size * 0.12} r={size * 0.04} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth * 0.8} />
      <Circle cx={centerX + size * 0.14} cy={y + size * 0.16} r={size * 0.04} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth * 0.8} />
      <Path
        d={`M ${centerX - size * 0.22} ${y + size * 0.8} C ${centerX - size * 0.2} ${y + size * 0.48}, ${centerX - size * 0.16} ${y + size * 0.32}, ${centerX - size * 0.08} ${y + size * 0.22} C ${centerX - size * 0.03} ${y + size * 0.28}, ${centerX + size * 0.03} ${y + size * 0.28}, ${centerX + size * 0.08} ${y + size * 0.22} C ${centerX + size * 0.16} ${y + size * 0.32}, ${centerX + size * 0.2} ${y + size * 0.48}, ${centerX + size * 0.22} ${y + size * 0.8} Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
      <Rect x={centerX - size * 0.26} y={y + size * 0.82} width={size * 0.52} height={size * 0.08} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
    </>
  );
};
