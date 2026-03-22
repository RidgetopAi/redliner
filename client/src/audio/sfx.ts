// All sound effects synthesized with Web Audio API - zero audio files

import { AudioEngine } from './audio-engine.js';

export class SFX {
  private audio: AudioEngine;

  constructor(audio: AudioEngine) {
    this.audio = audio;
  }

  playShiftClunk(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.4)!;

    // Noise burst: mechanical clunk
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noiseGain.connect(output);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 2;
    filter.connect(noiseGain);

    const noise = this.createNoiseBurst(ctx, 0.1);
    noise.connect(filter);
    noise.start(now);

    // Low thump
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.4, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    thumpGain.connect(output);

    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(80, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    thump.connect(thumpGain);
    thump.start(now);
    thump.stop(now + 0.12);

    this.autoDisconnect(output, 0.15);
  }

  playTreeBeep(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.2)!;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.15);

    this.autoDisconnect(output, 0.2);
  }

  playTreeGo(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.25)!;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1760;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.3);

    this.autoDisconnect(output, 0.35);
  }

  playEngineBlow(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.6)!;

    // Harsh noise burst
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    noiseGain.connect(output);

    const noise = this.createNoiseBurst(ctx, 1.0);
    noise.connect(noiseGain);
    noise.start(now);

    // Descending tone (engine dying)
    const deathGain = ctx.createGain();
    deathGain.gain.setValueAtTime(0.5, now);
    deathGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    deathGain.connect(output);

    const death = ctx.createOscillator();
    death.type = 'sawtooth';
    death.frequency.setValueAtTime(180, now);
    death.frequency.exponentialRampToValueAtTime(25, now + 1.2);
    death.connect(deathGain);
    death.start(now);
    death.stop(now + 1.5);

    this.autoDisconnect(output, 2.0);
  }

  playFoul(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.3)!;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.setValueAtTime(0.4, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.55);

    this.autoDisconnect(output, 0.6);
  }

  playWin(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.2)!;

    // Ascending arpeggio: C5 -> E5 -> G5
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.25);
    });

    this.autoDisconnect(output, 0.6);
  }

  playLose(): void {
    if (!this.audio.initialized) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.2)!;

    // Descending two-tone
    const notes = [330, 262];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const start = now + i * 0.2;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.35);
    });

    this.autoDisconnect(output, 0.8);
  }

  playTireScreech(intensity: number): void {
    if (!this.audio.initialized || intensity < 0.1) return;
    const ctx = this.audio.context!;
    const now = ctx.currentTime;
    const output = this.audio.createGain(0.15 * intensity)!;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000 + 3000 * intensity;
    filter.Q.value = 5;
    filter.connect(output);

    const noise = this.createNoiseBurst(ctx, 0.3);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    noise.start(now);

    this.autoDisconnect(output, 0.35);
  }

  private createNoiseBurst(ctx: AudioContext, duration: number): AudioBufferSourceNode {
    const length = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  private autoDisconnect(node: GainNode, afterSeconds: number): void {
    setTimeout(() => {
      try { node.disconnect(); } catch { /* already disconnected */ }
    }, afterSeconds * 1000);
  }
}
