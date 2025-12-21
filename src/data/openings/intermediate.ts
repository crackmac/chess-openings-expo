/**
 * Intermediate-level chess openings
 */

import { Opening } from '../../types';

export const intermediateOpenings: Opening[] = [
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    eco: 'B20',
    difficulty: 'intermediate',
    description: 'The most popular and aggressive response to 1.e4. Black immediately challenges White\'s central control.',
    color: 'black',
    category: 'Sicilian Defense',
    tags: ['aggressive', 'popular', 'tactical'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'c7', to: 'c5', san: 'c5', color: 'black' },
    ],
    alternateLines: [
      {
        id: 'sicilian-open',
        name: 'Open Sicilian',
        deviationMove: 2,
        description: 'White plays Nf3 and d4',
        moves: [
          { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
          { from: 'c7', to: 'c5', san: 'c5', color: 'black' },
          { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
          { from: 'd7', to: 'd6', san: 'd6', color: 'black' },
          { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
          { from: 'c5', to: 'd4', san: 'cxd4', color: 'black' },
          { from: 'f3', to: 'd4', san: 'Nxd4', color: 'white' },
        ],
      },
    ],
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    eco: 'C00',
    difficulty: 'intermediate',
    description: 'A solid defense where Black plays e6, preparing d5 to challenge White\'s center.',
    color: 'black',
    category: 'French Defense',
    tags: ['solid', 'strategic', 'defensive'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'e7', to: 'e6', san: 'e6', color: 'black' },
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'd7', to: 'd5', san: 'd5', color: 'black' },
    ],
    alternateLines: [],
  },
  {
    id: 'catalan',
    name: 'Catalan Opening',
    eco: 'E00',
    difficulty: 'intermediate',
    description: 'A sophisticated opening combining Queen\'s Gambit with a fianchettoed bishop.',
    color: 'white',
    category: "Queen's Pawn",
    tags: ['strategic', 'positional', 'sophisticated'],
    mainLine: [
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
      { from: 'c2', to: 'c4', san: 'c4', color: 'white' },
      { from: 'e7', to: 'e6', san: 'e6', color: 'black' },
      { from: 'g2', to: 'g3', san: 'g3', color: 'white' },
      { from: 'f1', to: 'g2', san: 'Bg2', color: 'white' },
    ],
    alternateLines: [],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B12',
    difficulty: 'intermediate',
    description: 'A solid defense where Black plays c6, preparing d5. Known for its solid pawn structure.',
    color: 'black',
    category: 'Caro-Kann Defense',
    tags: ['solid', 'defensive', 'pawn-structure'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'c7', to: 'c6', san: 'c6', color: 'black' },
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'd7', to: 'd5', san: 'd5', color: 'black' },
    ],
    alternateLines: [],
  },
];

