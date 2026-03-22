import { AIDifficulty, DifficultyLevel } from './types.js';

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
