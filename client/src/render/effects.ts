import { PhysicsState, CarConfig } from '@redliner/shared';

export interface EffectValues {
  shakeX: number;
  shakeY: number;
  flashAlpha: number;
  flashColor: string;
  vignetteIntensity: number;
  ledIntensity: number;
}

export class EffectsEngine {
  private flashAlpha = 0;
  private flashColor = '#ffffff';

  update(physics: PhysicsState, config: CarConfig, dt: number): EffectValues {
    const rpmRatio = physics.rpm / config.maxRpm;
    const speedRatio = physics.velocity / (config.targetMph / 2.237); // approximate max velocity in m/s
    const gForce = Math.abs(physics.gForce);

    // Screen shake: G-force + redline rattle
    const shakeIntensity = Math.min(1.0,
      gForce * 0.12 +
      speedRatio * 0.06 +
      (rpmRatio > 0.85 ? (rpmRatio - 0.85) * 4 : 0)
    );
    const shakeX = (Math.random() - 0.5) * shakeIntensity * 5;
    const shakeY = (Math.random() - 0.5) * shakeIntensity * 3;

    // LED intensity
    const ledIntensity = 0.7 + 0.3 * rpmRatio;

    // Vignette
    const vignetteIntensity = Math.pow(speedRatio, 1.5) * 0.5;

    // Flash decay
    this.flashAlpha = Math.max(0, this.flashAlpha - dt * 8);

    return {
      shakeX: physics.gasOn ? shakeX : 0,
      shakeY: physics.gasOn ? shakeY : 0,
      flashAlpha: this.flashAlpha,
      flashColor: this.flashColor,
      vignetteIntensity,
      ledIntensity,
    };
  }

  triggerShiftFlash(): void {
    this.flashAlpha = 0.5;
    this.flashColor = 'rgba(255, 255, 255, 0.6)';
  }

  triggerLaunchPunch(): void {
    this.flashAlpha = 0.4;
    this.flashColor = 'rgba(255, 68, 0, 0.4)';
  }

  triggerEngineBlow(): void {
    this.flashAlpha = 0.8;
    this.flashColor = 'rgba(255, 0, 0, 0.6)';
  }

  triggerFinish(): void {
    this.flashAlpha = 0.3;
    this.flashColor = 'rgba(0, 255, 68, 0.3)';
  }
}
