/**
 * Data integrity tests for every opening line.
 *
 * Each main line and alternate line is replayed from the starting position
 * with chess.js, so a typo or a missing reply in the data is caught here
 * instead of silently breaking a practice session.
 */

import { Chess } from 'chess.js';
import { allOpenings } from '..';
import { OpeningDatabase } from '../../../services/chess/openingDatabase';
import { Move } from '../../../types';

const lines = allOpenings.flatMap((opening) => [
  { opening, label: `${opening.id} main line`, moves: opening.mainLine },
  ...opening.alternateLines.map((alt) => ({
    opening,
    label: `${opening.id} / ${alt.name}`,
    moves: alt.moves,
  })),
]);

describe('opening lines', () => {
  it.each(lines.map((l) => [l.label, l.moves] as [string, Move[]]))(
    '%s is a legal, alternating sequence from the start position',
    (_label, moves) => {
      const chess = new Chess();

      moves.forEach((move) => {
        const sideToMove = chess.turn() === 'w' ? 'white' : 'black';
        expect({ san: move.san, color: move.color }).toEqual({
          san: move.san,
          color: sideToMove,
        });

        const played = chess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
        expect(played.san).toBe(move.san);
      });
    }
  );

  it.each(allOpenings.map((o) => [o.id, o] as const))(
    '%s main line can be followed move by move with getExpectedMove',
    (_id, opening) => {
      // Mirrors a practice session: each ply asks for the move of the side to move.
      const history: Move[] = [];

      opening.mainLine.forEach((_move, ply) => {
        const sideToMove = ply % 2 === 0 ? 'white' : 'black';
        const expected = OpeningDatabase.getExpectedMove(
          opening,
          history,
          sideToMove
        );
        expect(expected).not.toBeNull();
        history.push(expected as Move);
      });

      expect(history).toHaveLength(opening.mainLine.length);
    }
  );
});
