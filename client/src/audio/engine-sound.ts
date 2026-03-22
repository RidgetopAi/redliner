// Engine sound synthesis: 4-oscillator stack with RPM-linked pitch
// Fundamental (sawtooth) + 2nd harmonic (sawtooth) + sub-bass (sine) + noise (exhaust)
// LFO modulates fundamental for cylinder-firing chug at idle

import { AudioEngine } from './audio-engine.js';

export class EngineSoundSynth {
  private audio: AudioEngine;
  private fundamental: OscillatorNode | null = null;
  private harmonic: OscillatorNode | null = null;
  private subBass: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private fundamentalGain: GainNode | null = null;
  private harmonicGain: GainNode | null = null;
  private subBassGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private running = false;
  private currentRpm = 0;

  constructor(audio: AudioEngine) {
    this.audio = audio;
  }

  start(): void {
    if (this.running || !this.audio.initialized) return;
    const ctx = this.audio.context!;

    // Output gain (connected to master)
    this.outputGain = this.audio.createGain(0.15)!;

    // Fundamental: sawtooth
    this.fundamentalGain = ctx.createGain();
    this.fundamentalGain.gain.value = 0.3;
    this.fundamentalGain.connect(this.outputGain);

    this.fundamental = ctx.createOscillator();
    this.fundamental.type = 'sawtooth';
    this.fundamental.frequency.value = 55;
    this.fundamental.connect(this.fundamentalGain);

    // 2nd harmonic: sawtooth at 2x
    this.harmonicGain = ctx.createGain();
    this.harmonicGain.gain.value = 0.05;
    this.harmonicGain.connect(this.outputGain);

    this.harmonic = ctx.createOscillator();
    this.harmonic.type = 'sawtooth';
    this.harmonic.frequency.value = 110;
    this.harmonic.connect(this.harmonicGain);

    // Sub-bass: sine at 0.5x
    this.subBassGain = ctx.createGain();
    this.subBassGain.gain.value = 0.25;
    this.subBassGain.connect(this.outputGain);

    this.subBass = ctx.createOscillator();
    this.subBass.type = 'sine';
    this.subBass.frequency.value = 27.5;
    this.subBass.connect(this.subBassGain);

    // Exhaust noise: white noise -> bandpass filter
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.02;
    this.noiseGain.connect(this.outputGain);

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 800;
    this.noiseFilter.Q.value = 0.5;
    this.noiseFilter.connect(this.noiseGain);

    const noiseBuffer = this.createNoiseBuffer(ctx);
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.noiseFilter);

    // LFO: modulates fundamental gain for cylinder-firing chug
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 0.3;
    this.lfoGain.connect(this.fundamentalGain.gain);

    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 8;
    this.lfo.connect(this.lfoGain);

    // Start all
    this.fundamental.start();
    this.harmonic.start();
    this.subBass.start();
    this.noiseSource.start();
    this.lfo.start();

    this.running = true;
  }

  stop(): void {
    if (!this.running) return;
    this.fundamental?.stop();
    this.harmonic?.stop();
    this.subBass?.stop();
    this.noiseSource?.stop();
    this.lfo?.stop();
    this.outputGain?.disconnect();
    this.running = false;
  }

  updateRpm(rpm: number, maxRpm: number, gasOn: boolean): void {
    if (!this.running || !this.audio.context) return;

    this.currentRpm = rpm;
    const ctx = this.audio.context;
    const now = ctx.currentTime;
    const ramp = 0.03; // 30ms ramp for click-free transitions

    const rpmRatio = Math.min(1, rpm / maxRpm);

    // Frequency mapping: 55Hz (idle) -> 220Hz (redline), exponential
    const baseFreq = 55 * Math.pow(4, rpmRatio);

    this.fundamental!.frequency.linearRampToValueAtTime(baseFreq, now + ramp);
    this.harmonic!.frequency.linearRampToValueAtTime(baseFreq * 2, now + ramp);
    this.subBass!.frequency.linearRampToValueAtTime(baseFreq * 0.5, now + ramp);

    // Volume curves
    this.fundamentalGain!.gain.linearRampToValueAtTime(
      0.3 + 0.2 * rpmRatio, now + ramp);
    this.harmonicGain!.gain.linearRampToValueAtTime(
      0.05 + 0.25 * rpmRatio, now + ramp);
    this.subBassGain!.gain.linearRampToValueAtTime(
      0.25 * (1 - rpmRatio * 0.5), now + ramp);

    // Exhaust noise louder at high RPM
    this.noiseGain!.gain.linearRampToValueAtTime(
      0.02 + 0.08 * rpmRatio, now + ramp);
    this.noiseFilter!.frequency.linearRampToValueAtTime(
      600 + 2400 * rpmRatio, now + ramp);

    // LFO: chug at idle (8Hz), smooth at high RPM (30Hz)
    this.lfo!.frequency.linearRampToValueAtTime(
      8 + 22 * rpmRatio, now + ramp);
    this.lfoGain!.gain.linearRampToValueAtTime(
      0.3 * (1 - rpmRatio * 0.7), now + ramp);

    // Master volume: louder when gas is on
    const targetGain = gasOn ? 0.15 : 0.04;
    this.outputGain!.gain.linearRampToValueAtTime(targetGain, now + 0.05);
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
