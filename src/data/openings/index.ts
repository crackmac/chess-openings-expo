/**
 * Opening Database - All Openings
 */

import { Opening } from '../../types';
import { beginnerOpenings } from './beginner';
import { intermediateOpenings } from './intermediate';
import { advancedOpenings } from './advanced';

export const allOpenings: Opening[] = [
  ...beginnerOpenings,
  ...intermediateOpenings,
  ...advancedOpenings,
];

export { beginnerOpenings, intermediateOpenings, advancedOpenings };

