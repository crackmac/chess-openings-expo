/**
 * Beginner-level chess openings
 */

import { Opening } from '../../types';

export const beginnerOpenings: Opening[] = [
  {
    id: 'kings-pawn-e4',
    name: "King's Pawn Opening",
    eco: 'B00',
    difficulty: 'beginner',
    description: 'The most popular opening move. White immediately takes control of the center.',
    color: 'white',
    category: "King's Pawn",
    tags: ['center', 'classical', 'popular'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
    ],
    alternateLines: [],
  },
  {
    id: 'italian-game',
    name: 'Italian Game',
    eco: 'C50',
    difficulty: 'beginner',
    description: 'A classical opening focusing on rapid development and center control.',
    color: 'white',
    category: "King's Pawn",
    tags: ['classical', 'development', 'center'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'e7', to: 'e5', san: 'e5', color: 'black' },
      { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
      { from: 'b8', to: 'c6', san: 'Nc6', color: 'black' },
      { from: 'f1', to: 'c4', san: 'Bc4', color: 'white' },
    ],
    alternateLines: [
      {
        id: 'italian-two-knights',
        name: 'Two Knights Defense',
        deviationMove: 4,
        description: 'Black plays Nf6 instead of Bc5',
        moves: [
          { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
          { from: 'e7', to: 'e5', san: 'e5', color: 'black' },
          { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
          { from: 'b8', to: 'c6', san: 'Nc6', color: 'black' },
          { from: 'f1', to: 'c4', san: 'Bc4', color: 'white' },
          { from: 'g8', to: 'f6', san: 'Nf6', color: 'black' },
        ],
      },
    ],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    difficulty: 'beginner',
    description: 'One of the oldest and most respected openings. White develops the bishop to b5.',
    color: 'white',
    category: "King's Pawn",
    tags: ['classical', 'popular', 'strategic'],
    mainLine: [
      { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
      { from: 'e7', to: 'e5', san: 'e5', color: 'black' },
      { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
      { from: 'b8', to: 'c6', san: 'Nc6', color: 'black' },
      { from: 'f1', to: 'b5', san: 'Bb5', color: 'white' },
    ],
    alternateLines: [],
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    eco: 'D06',
    difficulty: 'beginner',
    description: 'A solid opening where White offers a pawn to gain central control.',
    color: 'white',
    category: "Queen's Pawn",
    tags: ['classical', 'strategic', 'popular'],
    mainLine: [
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'd7', to: 'd5', san: 'd5', color: 'black' },
      { from: 'c2', to: 'c4', san: 'c4', color: 'white' },
    ],
    alternateLines: [
      {
        id: 'queens-gambit-declined',
        name: "Queen's Gambit Declined",
        deviationMove: 2,
        description: 'Black declines the gambit by playing e6',
        moves: [
          { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
          { from: 'd7', to: 'd5', san: 'd5', color: 'black' },
          { from: 'c2', to: 'c4', san: 'c4', color: 'white' },
          { from: 'e7', to: 'e6', san: 'e6', color: 'black' },
        ],
      },
    ],
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    difficulty: 'beginner',
    description: 'A solid, easy-to-learn system that works against many defenses.',
    color: 'white',
    category: "Queen's Pawn",
    tags: ['system', 'solid', 'easy'],
    mainLine: [
      { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
      { from: 'c1', to: 'f4', san: 'Bf4', color: 'white' },
    ],
    alternateLines: [],
  },
];

