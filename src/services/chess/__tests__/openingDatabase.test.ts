/**
 * Unit tests for OpeningDatabase service
 */

import { OpeningDatabase } from '../openingDatabase';
import { Opening, Move } from '../../../types';
import { allOpenings } from '../../../data/openings';

describe('OpeningDatabase', () => {
  let database: OpeningDatabase;

  beforeEach(() => {
    database = new OpeningDatabase();
    database.loadOpenings(allOpenings);
  });

  describe('loadOpenings', () => {
    it('should load openings into database', () => {
      const openings = database.getAllOpenings();
      expect(openings.length).toBeGreaterThan(0);
    });
  });

  describe('getOpeningById', () => {
    it('should return opening by ID', () => {
      const opening = database.getOpeningById('london-system');
      expect(opening).not.toBeNull();
      expect(opening?.id).toBe('london-system');
    });

    it('should return undefined for non-existent opening', () => {
      const opening = database.getOpeningById('non-existent');
      expect(opening).toBeUndefined();
    });
  });

  describe('getOpeningsByDifficulty', () => {
    it('should return openings filtered by difficulty', () => {
      const beginnerOpenings = database.getOpeningsByDifficulty('beginner');
      expect(beginnerOpenings.length).toBeGreaterThan(0);
      beginnerOpenings.forEach((opening) => {
        expect(opening.difficulty).toBe('beginner');
      });
    });
  });

  describe('searchOpenings', () => {
    it('should find openings by name', () => {
      const results = database.searchOpenings('London');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((o) => o.name.includes('London'))).toBe(true);
    });

    it('should find openings by ECO code', () => {
      const results = database.searchOpenings('D02');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = database.searchOpenings('NonExistentOpening');
      expect(results).toEqual([]);
    });
  });

  describe('getExpectedMove', () => {
    it('should return expected move for main line', () => {
      const opening = database.getOpeningById('london-system');
      if (!opening) return;

      const moveHistory: Move[] = [
        { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      ];

      const expectedMove = OpeningDatabase.getExpectedMove(
        opening,
        moveHistory,
        'white'
      );

      expect(expectedMove).not.toBeNull();
      expect(expectedMove?.color).toBe('white');
    });

    it('should return null when line is exhausted', () => {
      const opening = database.getOpeningById('london-system');
      if (!opening) return;

      // Use all moves from main line
      const moveHistory = [...opening.mainLine];

      const expectedMove = OpeningDatabase.getExpectedMove(
        opening,
        moveHistory,
        'white'
      );

      expect(expectedMove).toBeNull();
    });
  });

  describe('isMoveInTheory', () => {
    it('should return true for correct move', () => {
      const opening = database.getOpeningById('london-system');
      if (!opening) return;

      const moveHistory: Move[] = [
        { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      ];

      const nextMove: Move = {
        from: 'g1',
        to: 'f3',
        san: 'Nf3',
        color: 'white',
      };

      const isInTheory = OpeningDatabase.isMoveInTheory(
        opening,
        moveHistory,
        nextMove
      );

      expect(isInTheory).toBe(true);
    });

    it('should return false for incorrect move', () => {
      const opening = database.getOpeningById('london-system');
      if (!opening) return;

      const moveHistory: Move[] = [
        { from: 'd2', to: 'd4', san: 'd4', color: 'white' },
      ];

      const wrongMove: Move = {
        from: 'e2',
        to: 'e4',
        san: 'e4',
        color: 'white',
      };

      const isInTheory = OpeningDatabase.isMoveInTheory(
        opening,
        moveHistory,
        wrongMove
      );

      expect(isInTheory).toBe(false);
    });
  });

  describe('findMatchingLine', () => {
    it('should find main line match', () => {
      const opening = database.getOpeningById('london-system');
      if (!opening) return;

      const moveHistory = opening.mainLine.slice(0, 2);

      const matchingLine = OpeningDatabase.findMatchingLine(
        opening,
        moveHistory
      );

      expect(matchingLine).not.toBeNull();
      expect(matchingLine?.moves).toEqual(opening.mainLine);
    });

    it('should find alternate line match', () => {
      const opening = database.getOpeningById('sicilian-defense');
      if (!opening || opening.alternateLines.length === 0) return;

      const altLine = opening.alternateLines[0];
      const moveHistory = altLine.moves.slice(0, 3);

      const matchingLine = OpeningDatabase.findMatchingLine(
        opening,
        moveHistory
      );

      expect(matchingLine).not.toBeNull();
    });
  });
});

