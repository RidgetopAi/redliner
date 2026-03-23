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
import { PlayerDifficulty } from '../ai/types.js';

export class PhysicsEngine {
  private config: CarConfig;
  private state: PhysicsState;
  private greenLightTime: number = 0;
  private hasLaunched: boolean = false;
  private rpmBuildScale: number;
  private blowThreshold: number;

  constructor(config: CarConfig, playerDifficulty?: PlayerDifficulty) {
    this.config = config;
    this.rpmBuildScale = playerDifficulty?.rpmBuildScale ?? 1.0;
    this.blowThreshold = playerDifficulty?.engineBlowThreshold ?? ENGINE_BLOW_THRESHOLD;
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

    // Gear shift — RPM drops by the ratio between old and new gear
    if (input.shiftUp && s.gear < 4) {
      const oldRatio = c.gearRatios[s.gear - 1];
      s.gear++;
      const newRatio = c.gearRatios[s.gear - 1];
      // RPM drops proportionally: new_rpm = old_rpm * (newRatio / oldRatio)
      // If shiftDropRpm is set (legacy), use it as a fallback
      if (c.shiftDropRpm > 0) {
        s.rpm = Math.max(c.idleRpm, s.rpm - c.shiftDropRpm);
      } else {
        s.rpm = Math.max(c.idleRpm, s.rpm * (newRatio / oldRatio));
      }
    }

    // Effective gear ratio
    const gearRatio = c.gearRatios[s.gear - 1] * c.finalDrive;

    // RPM calculation - load-based, gear-aware
    // In lower gears the engine has more mechanical advantage (less load),
    // so RPM climbs quickly. In higher gears the load is greater, slowing RPM climb.
    // This naturally creates the "shift or blow" tension per gear.
    // RPM calculation
    // At speed, RPM is mechanically coupled to wheel speed via the drivetrain.
    // Free-rev (RPM climbing independent of wheel speed) only happens at very
    // low speed when there's effective clutch slip (launch scenario).
    const wheelRpm = (s.velocity / (2 * Math.PI * c.tireRadius)) * 60;
    const drivetrainRpm = Math.max(wheelRpm * gearRatio, c.idleRpm);

    if (input.gasDown) {
      // How much the engine is ahead of the wheels (clutch slip / launch zone)
      const rpmExcess = s.rpm - drivetrainRpm;

      // Free-rev: only applies when engine RPM is above what the wheels demand.
      // This happens at launch (wheels barely moving, engine revving) and right
      // after a shift (RPM drops but car speed hasn't changed yet).
      // As drivetrain RPM catches up to engine RPM, free-rev contribution vanishes.
      const gearLoadRatio = c.gearRatios[0] / c.gearRatios[s.gear - 1];
      const gearLoad = Math.pow(gearLoadRatio, 1.5);
      const freeRevRate = c.rpmBuildRate * this.rpmBuildScale * 2000 / gearLoad * PHYSICS_DT;

      if (rpmExcess <= 0) {
        // Engine is at or below drivetrain RPM — fully coupled.
        // RPM tracks drivetrain (which rises as the car accelerates).
        // Add a small free-rev to let RPM creep slightly above drivetrain,
        // creating the tension of "RPM is climbing, do I need to shift?"
        s.rpm = drivetrainRpm + freeRevRate;
      } else {
        // Engine is above drivetrain RPM (launch / post-shift).
        // Free-rev continues but the gap closes as the car accelerates
        // and drivetrain RPM rises to meet engine RPM.
        s.rpm = s.rpm + freeRevRate;
      }

      // Hard cap at blow threshold
      s.rpm = Math.min(s.rpm, c.maxRpm * this.blowThreshold + 200);
    } else {
      // Gas off — RPM decays but can't go below drivetrain RPM (engine braking)
      const decayRate = 2000 + (s.rpm - c.idleRpm) * 0.3;
      s.rpm = Math.max(drivetrainRpm, s.rpm - decayRate * PHYSICS_DT);
    }

    // Telemetry: log state every 30 frames in gear 4, and always on blow
    if (s.gear === 4 && Math.round(s.time * 60) % 30 === 0) {
      console.log(`[G4] rpm=${s.rpm.toFixed(0)} drivetrain=${drivetrainRpm.toFixed(0)} maxRpm=${c.maxRpm} blowAt=${(c.maxRpm * this.blowThreshold).toFixed(0)} mph=${s.mph.toFixed(1)} gas=${input.gasDown} dist=${s.distance.toFixed(0)}m`);
    }

    // Engine blow check
    if (s.rpm > c.maxRpm * this.blowThreshold) {
      console.warn(`[ENGINE BLOW] gear=${s.gear} rpm=${s.rpm.toFixed(0)} drivetrainRpm=${drivetrainRpm.toFixed(0)} blowThreshold=${(c.maxRpm * this.blowThreshold).toFixed(0)} maxRpm=${c.maxRpm} mph=${s.mph.toFixed(1)} velocity=${s.velocity.toFixed(2)} gas=${input.gasDown} distance=${s.distance.toFixed(0)}m time=${s.time.toFixed(2)}s`);
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
      return c.peakTorqueNm * 0.40;
    }

    // Normalize RPM position between idle and max
    const normalizedRpm = (rpm - c.idleRpm) / (c.maxRpm - c.idleRpm);
    const peakNormalized = (c.peakTorqueRpm - c.idleRpm) / (c.maxRpm - c.idleRpm);

    if (normalizedRpm <= peakNormalized) {
      // Rising side: quadratic rise from 40% at idle to 100% at peak
      const t = normalizedRpm / peakNormalized;
      return c.peakTorqueNm * (0.40 + 0.60 * (1 - Math.pow(1 - t, 2)));
    }

    // Falling side past peak torque
    const hpNormalized = (c.peakHpRpm - c.idleRpm) / (c.maxRpm - c.idleRpm);

    if (normalizedRpm <= hpNormalized) {
      // Gentle decline from peak torque to peak HP (~88% of peak)
      const t = (normalizedRpm - peakNormalized) / (hpNormalized - peakNormalized);
      return c.peakTorqueNm * (1.0 - 0.12 * t);
    }

    // Steeper falloff above peak HP toward redline (~62% at redline)
    const t = (normalizedRpm - hpNormalized) / (1.0 - hpNormalized);
    return c.peakTorqueNm * (0.88 - 0.26 * Math.pow(Math.min(t, 1), 1.5));
  }
}
