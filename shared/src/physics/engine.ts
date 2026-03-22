import { CarConfig, PhysicsState, PhysicsInput } from './types.js';
import {
  QUARTER_MILE_METERS,
  PHYSICS_DT,
  AIR_DENSITY,
  ROLLING_RESISTANCE,
  DRIVETRAIN_EFFICIENCY,
  ENGINE_BLOW_THRESHOLD,
  GRAVITY,
  MPS_TO_MPH,
} from './constants.js';

export class PhysicsEngine {
  private config: CarConfig;
  private state: PhysicsState;
  private greenLightTime: number = 0;
  private hasLaunched: boolean = false;

  constructor(config: CarConfig) {
    this.config = config;
    this.state = this.createInitialState();
  }

  private createInitialState(): PhysicsState {
    return {
      time: 0,
      distance: 0,
      velocity: 0,
      rpm: this.config.idleRpm,
      gear: 1,
      gasOn: false,
      engineBlown: false,
      finished: false,
      fouled: false,
      reactionTime: 0,
      wheelSlip: 1,
      gForce: 0,
      mph: 0,
      peakMph: 0,
      et: 0,
    };
  }

  reset(): void {
    this.state = this.createInitialState();
    this.greenLightTime = 0;
    this.hasLaunched = false;
  }

  setGreenLightTime(time: number): void {
    this.greenLightTime = time;
  }

  getState(): PhysicsState {
    return { ...this.state };
  }

  tick(input: PhysicsInput, absoluteTime: number): PhysicsState {
    const s = this.state;
    const c = this.config;

    // After finish: wind down RPM (for audio/visual), but no more physics
    if (s.finished || s.engineBlown) {
      s.gasOn = false;
      s.rpm = Math.max(c.idleRpm * 0.5, s.rpm - 3000 * PHYSICS_DT);
      s.gForce = 0;
      return this.getState();
    }

    // Foul detection: gas before green
    if (input.gasDown && !this.hasLaunched && this.greenLightTime > 0 && absoluteTime < this.greenLightTime) {
      s.fouled = true;
    }

    // Track if race has started (green light passed)
    const raceActive = this.greenLightTime > 0 && absoluteTime >= this.greenLightTime && !s.fouled;

    if (!raceActive) {
      // Pre-race: rev engine while staged
      s.gasOn = input.gasDown;
      if (input.gasDown) {
        s.rpm = Math.min(s.rpm + c.rpmBuildRate * 4000 * PHYSICS_DT, c.maxRpm * 0.6);
      } else {
        s.rpm = Math.max(c.idleRpm, s.rpm - 1500 * PHYSICS_DT);
      }
      return this.getState();
    }

    // Race is active
    s.time += PHYSICS_DT;
    s.gasOn = input.gasDown;

    // Reaction time tracking
    if (!this.hasLaunched && input.gasDown) {
      this.hasLaunched = true;
      s.reactionTime = absoluteTime - this.greenLightTime;
    }

    // Gear shift
    if (input.shiftUp && s.gear < 4) {
      s.gear++;
      s.rpm = Math.max(c.idleRpm, s.rpm - c.shiftDropRpm);
    }

    // Effective gear ratio
    const gearRatio = c.gearRatios[s.gear - 1] * c.finalDrive;

    // RPM calculation - load-based, gear-aware
    // In lower gears the engine has more mechanical advantage (less load),
    // so RPM climbs quickly. In higher gears the load is greater, slowing RPM climb.
    // This naturally creates the "shift or blow" tension per gear.
    if (input.gasDown) {
      const wheelRpm = (s.velocity / (2 * Math.PI * c.tireRadius)) * 60;
      const targetRpm = Math.max(wheelRpm * gearRatio, c.idleRpm);

      // Gear load: ratio of 1st gear to current gear, raised to 1.5 for gameplay feel
      // 1st gear: load=1.0 (fastest RPM climb), 4th gear: load~4.3 (slowest)
      const gearLoadRatio = c.gearRatios[0] / c.gearRatios[s.gear - 1];
      const gearLoad = Math.pow(gearLoadRatio, 1.5);
      const freeRevRate = c.rpmBuildRate * 2000 / gearLoad * PHYSICS_DT;

      // RPM is the higher of wheel-demanded RPM (mechanical coupling)
      // or current RPM + free-rev rate (engine spinning up under gas)
      s.rpm = Math.max(targetRpm, s.rpm + freeRevRate);

      // Hard cap just above blow threshold (allows blow detection next frame)
      s.rpm = Math.min(s.rpm, c.maxRpm * ENGINE_BLOW_THRESHOLD + 200);
    } else {
      s.rpm = Math.max(c.idleRpm, s.rpm - 2000 * PHYSICS_DT);
    }

    // Engine blow check
    if (s.rpm > c.maxRpm * ENGINE_BLOW_THRESHOLD) {
      s.engineBlown = true;
      s.rpm = 0;
      return this.getState();
    }

    // Torque from engine
    const torque = input.gasDown ? this.calculateTorque(s.rpm) : 0;

    // Wheel force
    const wheelForce = (torque * gearRatio * DRIVETRAIN_EFFICIENCY) / c.tireRadius;

    // Traction limit
    const maxTraction = c.mass * GRAVITY * c.tireGrip;
    const appliedForce = Math.min(wheelForce, maxTraction);
    s.wheelSlip = wheelForce > 0 ? appliedForce / wheelForce : 1;

    // Aerodynamic drag
    const dragForce = 0.5 * AIR_DENSITY * c.dragCoeffArea * s.velocity * s.velocity;

    // Rolling resistance
    const rollResist = c.mass * GRAVITY * ROLLING_RESISTANCE;

    // Net force and acceleration
    const netForce = appliedForce - dragForce - rollResist;
    const acceleration = netForce / c.mass;
    s.gForce = acceleration / GRAVITY;

    // Integrate
    s.velocity = Math.max(0, s.velocity + acceleration * PHYSICS_DT);
    s.distance += s.velocity * PHYSICS_DT;

    // Speed tracking
    s.mph = s.velocity * MPS_TO_MPH;
    s.peakMph = Math.max(s.peakMph, s.mph);

    // Finish line
    if (s.distance >= QUARTER_MILE_METERS) {
      s.finished = true;
      s.et = s.time;
    }

    return this.getState();
  }

  private calculateTorque(rpm: number): number {
    const c = this.config;

    if (rpm <= c.idleRpm) {
      return c.peakTorqueNm * 0.4;
    }

    if (rpm <= c.peakTorqueRpm) {
      // Rising: sqrt curve for aggressive early feel
      const t = (rpm - c.idleRpm) / (c.peakTorqueRpm - c.idleRpm);
      return c.peakTorqueNm * (0.6 + 0.4 * Math.sqrt(t));
    }

    if (rpm <= c.peakHpRpm) {
      // Gentle decline from peak torque to peak HP
      const t = (rpm - c.peakTorqueRpm) / (c.peakHpRpm - c.peakTorqueRpm);
      return c.peakTorqueNm * (1.0 - 0.12 * t);
    }

    // Fall off above peak HP toward redline
    const t = (rpm - c.peakHpRpm) / (c.maxRpm - c.peakHpRpm);
    return c.peakTorqueNm * (0.88 - 0.35 * Math.min(t, 1));
  }
}
