export interface AIDifficulty {
  name: string;
  reactionTimeMs: number;
  reactionVariance: number;
  shiftAccuracy: number;       // 0-1: how close to optimal RPM
  shiftVariance: number;       // +/- RPM randomness
  overRevChance: number;       // probability of blowing engine
  gasReleaseChance: number;    // per-frame chance of gas lift
  optimalShiftRpm: number;     // fraction of maxRpm to target
}

export type DifficultyLevel = 'rookie' | 'amateur' | 'pro' | 'legend';

/** Player-facing difficulty scaling — affects the player's car physics */
export interface PlayerDifficulty {
  rpmBuildScale: number;       // multiplier on rpmBuildRate (lower = more time per gear)
  engineBlowThreshold: number; // fraction above maxRpm before blow (higher = more forgiving)
}
