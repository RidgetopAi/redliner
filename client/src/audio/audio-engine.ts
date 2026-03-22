// Master audio context manager with user-gesture gate

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private _muted = false;
  private _initialized = false;

  get initialized(): boolean {
    return this._initialized;
  }

  get context(): AudioContext | null {
    return this.ctx;
  }

  get master(): GainNode | null {
    return this.masterGain;
  }

  get muted(): boolean {
    return this._muted;
  }

  // Must be called from a user gesture (click/touch/keydown)
  init(): void {
    if (this._initialized) return;

    this.ctx = new AudioContext();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.15;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    this._initialized = true;
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): void {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : 0.7;
    }
  }

  get currentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  // Create a gain node connected to master output
  createGain(initialGain = 1.0): GainNode | null {
    if (!this.ctx || !this.masterGain) return null;
    const gain = this.ctx.createGain();
    gain.gain.value = initialGain;
    gain.connect(this.masterGain);
    return gain;
  }
}
