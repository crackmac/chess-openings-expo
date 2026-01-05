/**
 * Opening Roulette Service
 *
 * Implements weighted random selection of chess openings based on:
 * - Difficulty ratings (Hard/Good/Easy/Unrated)
 * - Time decay (Easy openings gain weight over time)
 * - Fuzz factor (±10% randomness to prevent predictability)
 *
 * Algorithm:
 * 1. Calculate base weight from difficulty rating
 * 2. Apply time decay for easy openings
 * 3. Add fuzz factor for randomness
 * 4. Perform weighted random selection
 */

import { Opening, OpeningProgress } from '../../types';
import { RouletteWeights, TimeDecayConfig, RouletteSelection } from '../../types/gamification';

/**
 * Default weights for different difficulty ratings
 * - Hard-rated openings appear 3x more often (need more practice)
 * - Easy-rated openings appear 0.3x as often (already mastered)
 * - Good and unrated openings at standard frequency
 */
const DEFAULT_WEIGHTS: RouletteWeights = {
  hard: 3.0,
  good: 1.0,
  easy: 0.3,
  unrated: 1.0,
};

/**
 * Default time decay configuration
 * After 7 days without practice, easy openings gradually increase in weight
 * to prevent them from being forgotten
 */
const DEFAULT_TIME_DECAY: TimeDecayConfig = {
  enabled: true,
  decayDays: 7,              // Start decay after 1 week
  maxDecayMultiplier: 2.0,   // Up to 2x weight increase
};

/**
 * Fuzz factor: adds ±10% randomness to weights
 * Prevents predictable patterns in selection
 */
const FUZZ_FACTOR = 0.1;

/**
 * Opening Roulette Service
 * Handles weighted random selection of openings
 */
export class OpeningRoulette {
  private weights: RouletteWeights;
  private timeDecayConfig: TimeDecayConfig;

  constructor(
    weights?: Partial<RouletteWeights>,
    timeDecayConfig?: Partial<TimeDecayConfig>
  ) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.timeDecayConfig = { ...DEFAULT_TIME_DECAY, ...timeDecayConfig };
  }

  /**
   * Select a random opening using weighted random selection
   *
   * @param openings - Array of available openings
   * @param progressData - Progress data keyed by opening ID
   * @returns Selected opening
   */
  selectOpening(
    openings: Opening[],
    progressData: Record<string, OpeningProgress>
  ): Opening {
    if (openings.length === 0) {
      throw new Error('No openings available for selection');
    }

    if (openings.length === 1) {
      return openings[0];
    }

    // Calculate weight for each opening
    const weightedOpenings = openings.map((opening) => ({
      opening,
      weight: this.calculateWeight(opening, progressData[opening.id] || null),
    }));

    // Perform weighted random selection
    return this.weightedRandomSelect(weightedOpenings);
  }

  /**
   * Get weight distribution for all openings (for debugging)
   *
   * @param openings - Array of available openings
   * @param progressData - Progress data keyed by opening ID
   * @returns Array of selections with weights and reasons
   */
  getWeightDistribution(
    openings: Opening[],
    progressData: Record<string, OpeningProgress>
  ): RouletteSelection[] {
    return openings.map((opening) => {
      const progress = progressData[opening.id] || null;
      const weight = this.calculateWeight(opening, progress);
      const rating = progress?.difficultyRating || 'unrated';

      let reason = `${rating}-rated`;
      if (rating === 'easy' && progress?.lastPracticed && this.timeDecayConfig.enabled) {
        const daysSince = this.getDaysSinceLastPractice(progress.lastPracticed);
        if (daysSince > this.timeDecayConfig.decayDays) {
          reason += ` (time decay: ${daysSince} days)`;
        }
      }

      return {
        opening,
        weight,
        reason,
        lastPracticed: progress?.lastPracticed,
      };
    });
  }

  /**
   * Calculate weight for a single opening
   *
   * @param opening - The opening to calculate weight for
   * @param progress - Progress data for this opening (null if never practiced)
   * @returns Calculated weight
   */
  private calculateWeight(
    opening: Opening,
    progress: OpeningProgress | null
  ): number {
    // Get base weight from difficulty rating
    const rating = progress?.difficultyRating || 'unrated';
    let weight = this.weights[rating];

    // Apply time decay for easy openings
    if (
      rating === 'easy' &&
      progress?.lastPracticed &&
      this.timeDecayConfig.enabled
    ) {
      weight = this.applyTimeDecay(weight, progress.lastPracticed);
    }

    // Add fuzz factor to prevent predictability
    weight = this.applyFuzzFactor(weight);

    // Ensure weight is never negative or zero
    return Math.max(weight, 0.01);
  }

  /**
   * Apply time decay to weight for easy openings
   * Increases weight if opening hasn't been practiced recently
   *
   * @param baseWeight - Base weight from difficulty rating
   * @param lastPracticed - Date when opening was last practiced
   * @returns Adjusted weight
   */
  private applyTimeDecay(baseWeight: number, lastPracticed: Date): number {
    const daysSince = this.getDaysSinceLastPractice(lastPracticed);

    // No decay if within decay period
    if (daysSince <= this.timeDecayConfig.decayDays) {
      return baseWeight;
    }

    // Calculate decay multiplier
    // Formula: 1 + ((days - decayDays) / decayDays)
    // Example: 14 days since last practice, decayDays=7
    //   multiplier = 1 + ((14 - 7) / 7) = 1 + 1 = 2.0
    const daysOverThreshold = daysSince - this.timeDecayConfig.decayDays;
    const decayMultiplier = 1 + daysOverThreshold / this.timeDecayConfig.decayDays;

    // Cap at max multiplier
    const cappedMultiplier = Math.min(
      decayMultiplier,
      this.timeDecayConfig.maxDecayMultiplier
    );

    return baseWeight * cappedMultiplier;
  }

  /**
   * Apply fuzz factor (±10% randomness) to weight
   *
   * @param weight - Base weight
   * @returns Weight with random variation
   */
  private applyFuzzFactor(weight: number): number {
    // Generate random value between -FUZZ_FACTOR and +FUZZ_FACTOR
    const fuzz = (Math.random() - 0.5) * 2 * FUZZ_FACTOR;
    return weight * (1 + fuzz);
  }

  /**
   * Perform weighted random selection
   * Uses the standard algorithm: generate random number, iterate through items
   * subtracting weights until we reach 0
   *
   * @param items - Array of openings with calculated weights
   * @returns Selected opening
   */
  private weightedRandomSelect(
    items: Array<{ opening: Opening; weight: number }>
  ): Opening {
    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    // Generate random number between 0 and totalWeight
    let random = Math.random() * totalWeight;

    // Iterate through items, subtracting weights
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item.opening;
      }
    }

    // Fallback (should never reach here due to floating point precision)
    return items[items.length - 1].opening;
  }

  /**
   * Calculate days since last practice
   *
   * @param lastPracticed - Date of last practice
   * @returns Number of days since last practice
   */
  private getDaysSinceLastPractice(lastPracticed: Date): number {
    const now = Date.now();
    const lastPracticedTime =
      lastPracticed instanceof Date ? lastPracticed.getTime() : new Date(lastPracticed).getTime();
    const diffMs = now - lastPracticedTime;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

/**
 * Export default instance with standard configuration
 */
export const defaultRoulette = new OpeningRoulette();
