import { CarConfig, PhysicsState, PhysicsInput } from '../physics/types.js';
import { AIDifficulty } from './types.js';

export class AIDriver {
  private config: AIDifficulty;
  private carConfig: CarConfig;
  private reactionTime: number = 0;
  private shiftPoints: number[] = [];
  private willOverRev: boolean = false;
  private overRevGear: number = 4;
  private lastGear: number = 1;

  constructor(config: AIDifficulty, carConfig: CarConfig) {
    this.config = config;
    this.carConfig = carConfig;
  }

  // Call once before each race to pre-decide behavior
  prepareForRace(): void {
    this.lastGear = 1;

    // Reaction time with gaussian-ish variance
    this.reactionTime = (this.config.reactionTimeMs + this.gaussRandom() * this.config.reactionVariance) / 1000;
    this.reactionTime = Math.max(0.05, this.reactionTime); // minimum 50ms

    // Shift points for gears 1->2, 2->3, 3->4
    const optimalRpm = this.carConfig.maxRpm * this.config.optimalShiftRpm;
    this.shiftPoints = [0, 1, 2].map(() =>
      optimalRpm + this.gaussRandom() * this.config.shiftVariance
    );

    // Over-rev decision
    this.willOverRev = Math.random() < this.config.overRevChance;
    this.overRevGear = 2 + Math.floor(Math.random() * 3); // gears 2-4
  }

  // Call each physics frame to get AI input
  getInput(physics: PhysicsState, raceElapsed: number): PhysicsInput {
    // Before reaction time: no input
    if (raceElapsed < this.reactionTime) {
      return { gasDown: false, shiftUp: false };
    }

    // Gas: always on unless mistake
    let gasDown = true;
    if (this.config.gasReleaseChance > 0 && Math.random() < this.config.gasReleaseChance) {
      gasDown = false;
    }

    // Shift decision
    let shiftUp = false;
    const gear = physics.gear;

    if (gear < 4 && gear > this.lastGear) {
      // Just shifted last frame, don't shift again immediately
      this.lastGear = gear;
    } else if (gear < 4) {
      const targetRpm = this.shiftPoints[gear - 1];

      if (this.willOverRev && gear === this.overRevGear) {
        // Intentionally hold too long
        shiftUp = false;
      } else if (physics.rpm >= targetRpm) {
        shiftUp = true;
        this.lastGear = gear;
      }
    }

    return { gasDown, shiftUp };
  }

  getReactionTime(): number {
    return this.reactionTime;
  }

  private gaussRandom(): number {
    // Box-Muller transform for gaussian distribution
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
