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
