/**
 * Opening-related type definitions
 */

import { Move } from './chess';

export interface AlternateLine {
  id?: string;
  name: string;
  moves: Move[];
  deviationMove: number; // Move number where this line deviates from main line
  description?: string;
}

export interface Opening {
  id: string;
  name: string;
  eco: string; // Encyclopedia of Chess Openings code
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  mainLine: Move[];
  alternateLines: AlternateLine[];
  tags: string[];
  category: string; // e.g., "King's Pawn", "Queen's Pawn", etc.
  color: 'white' | 'black'; // Which side plays this opening
}

