/**
 * Advanced-level chess openings
 */

import { Opening } from '../../types';

export const advancedOpenings: Opening[] = [
  {
    id: 'najdorf-sicilian',
    name: 'Najdorf Sicilian',
    eco: 'B90',
    difficulty: 'advanced',
    description: 'The most popular variation of the Sicilian Defense. Highly theoretical and sharp.',
    color: 'black',
    category: 'Sicilian Defense',
    tags: ['sharp', 'theoretical', 'complex'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'c7', to: 'c5', san: 'c5', color: 'black' },
      { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
      { from: 'd7', to: 'd6', san: 'd6', color: 'black' },
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'c5', to: 'd4', san: 'cxd4', color: 'black' },
      { from: 'f3', to: 'd4', san: 'Nxd4', color: 'white' },
      { from: 'g8', to: 'f6', san: 'Nf6', color: 'black' },
      { from: 'b1', to: 'c3', san: 'Nc3', color: 'white' },
      { from: 'a7', to: 'a6', san: 'a6', color: 'black' },
    ],
    alternateLines: [],
  },
  {
    id: 'grunfeld-defense',
    name: 'Grunfeld Defense',
    eco: 'D70',
    difficulty: 'advanced',
    description: 'A hypermodern defense where Black allows White to build a strong center, then attacks it.',
    color: 'black',
    category: "Queen's Pawn",
    tags: ['hypermodern', 'dynamic', 'complex'],
    mainLine: [
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'g8', to: 'f6', san: 'Nf6', color: 'black' },
      { from: 'c2', to: 'c4', san: 'c4', color: 'white' },
      { from: 'g7', to: 'g6', san: 'g6', color: 'black' },
      { from: 'b1', to: 'c3', san: 'Nc3', color: 'white' },
      { from: 'd7', to: 'd5', san: 'd5', color: 'black' },
    ],
    alternateLines: [],
  },
  {
    id: 'kings-indian',
    name: "King's Indian Defense",
    eco: 'E60',
    difficulty: 'advanced',
    description: 'A complex defense where Black fianchettoes the king\'s bishop and prepares a central pawn storm.',
    color: 'black',
    category: "King's Indian",
    tags: ['complex', 'fianchetto', 'attacking'],
    mainLine: [
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'g8', to: 'f6', san: 'Nf6', color: 'black' },
      { from: 'c2', to: 'c4', san: 'c4', color: 'white' },
      { from: 'g7', to: 'g6', san: 'g6', color: 'black' },
      { from: 'b1', to: 'c3', san: 'Nc3', color: 'white' },
      { from: 'f8', to: 'g7', san: 'Bg7', color: 'black' },
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'd7', to: 'd6', san: 'd6', color: 'black' },
    ],
    alternateLines: [],
  },
];

