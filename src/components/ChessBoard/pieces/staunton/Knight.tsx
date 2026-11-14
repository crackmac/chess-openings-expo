import React from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import { StauntonPieceProps, getOutlineWidth, getStauntonPalette } from './palette';

export const StauntonKnight: React.FC<StauntonPieceProps> = ({ x, y, size, color }) => {
  const palette = getStauntonPalette(color);
  const centerX = x + size / 2;
  const outlineWidth = getOutlineWidth(size);

  return (
    <>
      <Path
        d={`M ${centerX - size * 0.2} ${y + size * 0.84} C ${centerX - size * 0.18} ${y + size * 0.64}, ${centerX - size * 0.06} ${y + size * 0.42}, ${centerX + size * 0.05} ${y + size * 0.33} C ${centerX + size * 0.17} ${y + size * 0.23}, ${centerX + size * 0.21} ${y + size * 0.17}, ${centerX + size * 0.15} ${y + size * 0.1} C ${centerX + size * 0.05} ${y + size * 0.14}, ${centerX - size * 0.03} ${y + size * 0.2}, ${centerX - size * 0.02} ${y + size * 0.27} C ${centerX - size * 0.15} ${y + size * 0.32}, ${centerX - size * 0.24} ${y + size * 0.49}, ${centerX - size * 0.23} ${y + size * 0.84} Z`}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={outlineWidth}
      />
      <Circle cx={centerX + size * 0.06} cy={y + size * 0.2} r={size * 0.02} fill={palette.stroke} />
      <Rect x={centerX - size * 0.25} y={y + size * 0.82} width={size * 0.5} height={size * 0.08} rx={size * 0.02} fill={palette.fill} stroke={palette.stroke} strokeWidth={outlineWidth} />
    </>
  );
};
