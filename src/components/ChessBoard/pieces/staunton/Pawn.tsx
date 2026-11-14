import React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonPawn: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Circle cx={centerX} cy={y + size * 0.27} r={size * 0.12} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
      <Path
        d={`M ${centerX - size * 0.17} ${size * 0.85 + y} C ${centerX - size * 0.15} ${y + size * 0.6}, ${centerX - size * 0.12} ${y + size * 0.46}, ${centerX} ${y + size * 0.42} C ${centerX + size * 0.12} ${y + size * 0.46}, ${centerX + size * 0.15} ${y + size * 0.6}, ${centerX + size * 0.17} ${size * 0.85 + y} Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
      <Rect
        x={centerX - size * 0.2}
        y={y + size * 0.82}
        width={size * 0.4}
        height={size * 0.08}
        rx={size * 0.02}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
    </>
  );
};
