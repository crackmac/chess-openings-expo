export interface PiecePalette {
  fill: string;
  stroke: string;
  accent: string;
}

export const getStauntonPalette = (color: 'white' | 'black'): PiecePalette => {
  if (color === 'white') {
    return {
      fill: '#F8FAFC',
      stroke: '#1F2937',
      accent: '#CBD5E1',
    };
  }

  return {
    fill: '#111827',
    stroke: '#E2E8F0',
    accent: '#334155',
  };
};

export interface StauntonPieceProps {
  x: number;
  y: number;
  size: number;
  color: 'white' | 'black';
}

export const getOutlineWidth = (size: number): number => Math.max(1.2, size * 0.045);
