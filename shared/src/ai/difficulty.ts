import { AIDifficulty, DifficultyLevel, PlayerDifficulty } from './types.js';

export const DIFFICULTIES: Record<DifficultyLevel, AIDifficulty> = {
  rookie: {
    name: 'Rookie',
    reactionTimeMs: 600,
    reactionVariance: 200,
    shiftAccuracy: 0.7,
    shiftVariance: 500,
    overRevChance: 0.15,
    gasReleaseChance: 0.02,
    optimalShiftRpm: 0.82,
  },
  amateur: {
    name: 'Amateur',
    reactionTimeMs: 400,
    reactionVariance: 150,
    shiftAccuracy: 0.82,
    shiftVariance: 350,
    overRevChance: 0.08,
    gasReleaseChance: 0.005,
    optimalShiftRpm: 0.87,
  },
  pro: {
    name: 'Pro',
    reactionTimeMs: 250,
    reactionVariance: 80,
    shiftAccuracy: 0.92,
    shiftVariance: 200,
    overRevChance: 0.03,
    gasReleaseChance: 0.001,
    optimalShiftRpm: 0.91,
  },
  legend: {
    name: 'Legend',
    reactionTimeMs: 150,
    reactionVariance: 40,
    shiftAccuracy: 0.97,
    shiftVariance: 80,
    overRevChance: 0.005,
    gasReleaseChance: 0,
    optimalShiftRpm: 0.94,
  },
};

export const DIFFICULTY_ORDER: DifficultyLevel[] = ['rookie', 'amateur', 'pro', 'legend'];

/**
 * Player-facing difficulty scaling.
 *
 * Rookie:  RPM climbs 55% as fast, engine tolerates 15% over redline → ~5.5s per gear
 * Amateur: RPM climbs 75% as fast, engine tolerates 10% over redline → ~4.0s per gear
 * Pro:     RPM climbs at full rate, engine tolerates 5% over (original) → ~3.0s per gear
 * Legend:  RPM climbs 15% faster, engine tolerates only 2% over → ~2.6s per gear, punishing
 */
export const PLAYER_DIFFICULTIES: Record<DifficultyLevel, PlayerDifficulty> = {
  rookie:  { rpmBuildScale: 0.55, engineBlowThreshold: 1.15 },
  amateur: { rpmBuildScale: 0.75, engineBlowThreshold: 1.10 },
  pro:     { rpmBuildScale: 1.00, engineBlowThreshold: 1.05 },
  legend:  { rpmBuildScale: 1.15, engineBlowThreshold: 1.02 },
};
