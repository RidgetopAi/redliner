import {
  PhysicsEngine, CAR_CLASSES, CAR_CLASS_ORDER,
  CarClass, CarConfig,
  AIDriver, DIFFICULTIES, DIFFICULTY_ORDER, DifficultyLevel,
} from '@redliner/shared';
import { Renderer, RenderState, DisplayMode, createDefaultRenderState } from './render/renderer.js';
import { InputManager } from './input/input-manager.js';
import { EffectsEngine } from './render/effects.js';
import { AudioEngine } from './audio/audio-engine.js';
import { EngineSoundSynth } from './audio/engine-sound.js';
import { SFX } from './audio/sfx.js';
import { TreeState, createEmptyTreeState } from './render/christmas-tree.js';

type GameState =
  | 'boot'
  | 'menu'
  | 'difficulty_select'
  | 'class_select'
  | 'staging'
  | 'countdown'
  | 'racing'
  | 'finished'
  | 'results';

interface RaceResults {
  playerEt: number;
  playerMph: number;
  playerReaction: number;
  playerFouled: boolean;
  playerBlown: boolean;
  aiEt: number;
  aiMph: number;
  aiReaction: number;
  aiFouled: boolean;
  aiBlown: boolean;
  playerWon: boolean;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private input: InputManager;
  private effects: EffectsEngine;
  private audioEngine: AudioEngine;
  private engineSound: EngineSoundSynth;
  private sfx: SFX;

  // Physics
  private playerPhysics!: PhysicsEngine;
  private aiPhysics!: PhysicsEngine;
  private aiDriver!: AIDriver;
  private config!: CarConfig;

  // State
  private state: GameState = 'boot';
  private carClass: CarClass = 'stock';
  private difficulty: DifficultyLevel = 'amateur';
  private renderState!: RenderState;
  private treeState: TreeState = createEmptyTreeState();
  private displayMode: DisplayMode = 'rpm';

  // Menu state
  private menuSelection = 0;
  private classSelection = 0;
  private difficultySelection = 1; // default to amateur

  // Timing
  private absoluteTime = 0;
  private greenLightTime = 0;
  private countdownStart = 0;
  private lastFrame = 0;
  private stateEnteredAt = 0;

  // Race tracking
  private wasEngineBlown = false;
  private wasFinished = false;
  private wasFouled = false;
  private lastGear = 1;
  private displayCycleTimer = 0;
  private results: RaceResults | null = null;

  // Tree beep tracking
  private treeBeepState = { amber1: false, amber2: false, amber3: false, green: false };

  // Countdown timing
  private readonly PRESTAGE_DELAY = 0.5;
  private readonly STAGE_DELAY = 1.0;
  private readonly AMBER_INTERVAL = 0.5;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.effects = new EffectsEngine();
    this.audioEngine = new AudioEngine();
    this.engineSound = new EngineSoundSynth(this.audioEngine);
    this.sfx = new SFX(this.audioEngine);

    this.config = CAR_CLASSES[this.carClass];
    this.playerPhysics = new PhysicsEngine(this.config);
    this.aiPhysics = new PhysicsEngine(this.config);
    this.aiDriver = new AIDriver(DIFFICULTIES[this.difficulty], this.config);
    this.renderState = createDefaultRenderState(this.config);
  }

  start(): void {
    this.lastFrame = performance.now();
    this.enterState('boot');
    requestAnimationFrame((t) => this.loop(t));
  }

  private enterState(state: GameState): void {
    this.state = state;
    this.stateEnteredAt = this.absoluteTime;
  }

  private timeInState(): number {
    return this.absoluteTime - this.stateEnteredAt;
  }

  private loop(timestamp: number): void {
    const dt = Math.min((timestamp - this.lastFrame) / 1000, 0.05);
    this.lastFrame = timestamp;
    this.absoluteTime += dt;

    const ctx = this.canvas.getContext('2d')!;

    switch (this.state) {
      case 'boot':
        this.updateBoot(ctx);
        break;
      case 'menu':
        this.updateMenu(ctx);
        break;
      case 'difficulty_select':
        this.updateDifficultySelect(ctx);
        break;
      case 'class_select':
        this.updateClassSelect(ctx);
        break;
      case 'staging':
      case 'countdown':
      case 'racing':
      case 'finished':
        this.updateRace(dt);
        break;
      case 'results':
        this.updateResults(ctx);
        break;
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  // ─── BOOT ──────────────────────────────────────
  private updateBoot(ctx: CanvasRenderingContext2D): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // RED LINE logo
    const fontSize = Math.min(w * 0.1, 80);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = '#ff2211';
    ctx.shadowColor = 'rgba(255, 34, 17, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('RED', w / 2 - fontSize * 1.2, h * 0.35);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('LINE', w / 2 + fontSize * 1.0, h * 0.35);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.font = `${fontSize * 0.25}px monospace`;
    ctx.fillStyle = '#666666';
    ctx.fillText('DRAG RACING', w / 2, h * 0.45);

    // Click prompt (pulsing)
    const pulse = 0.5 + 0.5 * Math.sin(this.absoluteTime * 3);
    ctx.font = `${fontSize * 0.3}px monospace`;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + 0.5 * pulse})`;
    ctx.fillText('CLICK OR PRESS ANY KEY TO START', w / 2, h * 0.65);

    // Controls hint
    ctx.font = `${fontSize * 0.18}px monospace`;
    ctx.fillStyle = '#444444';
    ctx.fillText('SPACE = GAS  |  SHIFT = GEAR  |  M = MUTE', w / 2, h * 0.78);
    ctx.fillText('TOUCH: RIGHT SIDE = GAS  |  LEFT SIDE = GEAR', w / 2, h * 0.83);

    ctx.restore();

    // Wait for any input
    const menu = this.input.pollMenu();
    const game = this.input.pollGame();
    if (menu.confirm || game.gasDown || game.shiftPressed) {
      this.audioEngine.init();
      this.audioEngine.resume();
      this.enterState('menu');
    }
  }

  // ─── MENU ──────────────────────────────────────
  private updateMenu(ctx: CanvasRenderingContext2D): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const menu = this.input.pollMenu();
    this.input.pollGame(); // consume

    const options = ['SINGLE PLAYER', 'QUICK MATCH (COMING SOON)', 'ROOM CODE (COMING SOON)'];

    if (menu.down) this.menuSelection = (this.menuSelection + 1) % options.length;
    if (menu.up) this.menuSelection = (this.menuSelection - 1 + options.length) % options.length;
    if (menu.confirm && this.menuSelection === 0) {
      this.enterState('difficulty_select');
      return;
    }

    // Mute toggle
    this.checkMuteToggle();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const fontSize = Math.min(w * 0.06, 48);

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize * 1.5}px monospace`;
    ctx.fillStyle = '#ff2211';
    ctx.shadowColor = 'rgba(255, 34, 17, 0.6)';
    ctx.shadowBlur = 15;
    ctx.fillText('RED', w / 2 - fontSize * 2, h * 0.2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('LINE', w / 2 + fontSize * 1.5, h * 0.2);
    ctx.shadowBlur = 0;

    // Menu options
    options.forEach((opt, i) => {
      const y = h * 0.4 + i * fontSize * 2;
      const selected = i === this.menuSelection;

      if (selected) {
        ctx.fillStyle = '#ff2211';
        ctx.shadowColor = 'rgba(255, 34, 17, 0.5)';
        ctx.shadowBlur = 10;
        ctx.font = `bold ${fontSize}px monospace`;
        // Selection indicator
        ctx.fillText('>', w / 2 - fontSize * 5, y);
      } else {
        ctx.fillStyle = i === 0 ? '#666666' : '#333333';
        ctx.shadowBlur = 0;
        ctx.font = `${fontSize * 0.9}px monospace`;
      }

      ctx.fillText(opt, w / 2, y);
    });

    ctx.shadowBlur = 0;
    ctx.font = `${fontSize * 0.35}px monospace`;
    ctx.fillStyle = '#333333';
    ctx.fillText('v1.0 | ARROWS TO NAVIGATE | ENTER TO SELECT', w / 2, h * 0.92);

    ctx.restore();
  }

  // ─── DIFFICULTY SELECT ─────────────────────────
  private updateDifficultySelect(ctx: CanvasRenderingContext2D): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const menu = this.input.pollMenu();
    this.input.pollGame();
    this.checkMuteToggle();

    if (menu.down) this.difficultySelection = (this.difficultySelection + 1) % DIFFICULTY_ORDER.length;
    if (menu.up) this.difficultySelection = (this.difficultySelection - 1 + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length;
    if (menu.back) { this.enterState('menu'); return; }
    if (menu.confirm) {
      this.difficulty = DIFFICULTY_ORDER[this.difficultySelection];
      this.enterState('class_select');
      return;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const fontSize = Math.min(w * 0.05, 40);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize * 1.2}px monospace`;
    ctx.fillStyle = '#cccccc';
    ctx.fillText('SELECT DIFFICULTY', w / 2, h * 0.15);

    const descriptions: Record<DifficultyLevel, string> = {
      rookie: '600ms reaction | frequent mistakes | beatable by anyone',
      amateur: '400ms reaction | occasional errors | good challenge',
      pro: '250ms reaction | rare mistakes | demands precision',
      legend: '150ms reaction | near perfect | only the best win',
    };

    DIFFICULTY_ORDER.forEach((diff, i) => {
      const y = h * 0.32 + i * fontSize * 2.8;
      const selected = i === this.difficultySelection;
      const d = DIFFICULTIES[diff];

      if (selected) {
        ctx.fillStyle = '#ff2211';
        ctx.shadowColor = 'rgba(255, 34, 17, 0.5)';
        ctx.shadowBlur = 10;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText('> ' + d.name.toUpperCase(), w / 2, y);
        ctx.shadowBlur = 0;
        ctx.font = `${fontSize * 0.45}px monospace`;
        ctx.fillStyle = '#888888';
        ctx.fillText(descriptions[diff], w / 2, y + fontSize * 0.9);
      } else {
        ctx.fillStyle = '#555555';
        ctx.shadowBlur = 0;
        ctx.font = `${fontSize * 0.9}px monospace`;
        ctx.fillText(d.name.toUpperCase(), w / 2, y);
      }
    });

    ctx.shadowBlur = 0;
    ctx.font = `${fontSize * 0.4}px monospace`;
    ctx.fillStyle = '#333333';
    ctx.fillText('ENTER TO SELECT | ESC TO GO BACK', w / 2, h * 0.92);

    ctx.restore();
  }

  // ─── CLASS SELECT ──────────────────────────────
  private updateClassSelect(ctx: CanvasRenderingContext2D): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const menu = this.input.pollMenu();
    this.input.pollGame();
    this.checkMuteToggle();

    if (menu.down) this.classSelection = (this.classSelection + 1) % CAR_CLASS_ORDER.length;
    if (menu.up) this.classSelection = (this.classSelection - 1 + CAR_CLASS_ORDER.length) % CAR_CLASS_ORDER.length;
    if (menu.back) { this.enterState('difficulty_select'); return; }
    if (menu.confirm) {
      this.carClass = CAR_CLASS_ORDER[this.classSelection];
      this.initRace();
      return;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const fontSize = Math.min(w * 0.05, 40);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize * 1.2}px monospace`;
    ctx.fillStyle = '#cccccc';
    ctx.fillText('SELECT CAR CLASS', w / 2, h * 0.12);

    ctx.font = `${fontSize * 0.4}px monospace`;
    ctx.fillStyle = '#666666';
    ctx.fillText(`VS ${DIFFICULTIES[this.difficulty].name.toUpperCase()} AI`, w / 2, h * 0.2);

    CAR_CLASS_ORDER.forEach((cls, i) => {
      const car = CAR_CLASSES[cls];
      const y = h * 0.32 + i * fontSize * 3;
      const selected = i === this.classSelection;

      if (selected) {
        ctx.fillStyle = '#ff2211';
        ctx.shadowColor = 'rgba(255, 34, 17, 0.5)';
        ctx.shadowBlur = 10;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText('> ' + car.name.toUpperCase(), w / 2, y);
        ctx.shadowBlur = 0;
        ctx.font = `${fontSize * 0.4}px monospace`;
        ctx.fillStyle = '#888888';
        ctx.fillText(`TARGET: ${car.targetEt}s ET | ${car.targetMph} MPH | ${car.maxRpm} RPM REDLINE`, w / 2, y + fontSize * 0.85);
      } else {
        ctx.fillStyle = '#555555';
        ctx.shadowBlur = 0;
        ctx.font = `${fontSize * 0.9}px monospace`;
        ctx.fillText(car.name.toUpperCase(), w / 2, y);
      }
    });

    ctx.shadowBlur = 0;
    ctx.font = `${fontSize * 0.4}px monospace`;
    ctx.fillStyle = '#333333';
    ctx.fillText('ENTER TO RACE | ESC TO GO BACK', w / 2, h * 0.92);

    ctx.restore();
  }

  // ─── RACE INIT ─────────────────────────────────
  private initRace(): void {
    this.config = CAR_CLASSES[this.carClass];
    this.playerPhysics = new PhysicsEngine(this.config);
    this.aiPhysics = new PhysicsEngine(this.config);
    this.aiDriver = new AIDriver(DIFFICULTIES[this.difficulty], this.config);
    this.aiDriver.prepareForRace();
    this.renderState = createDefaultRenderState(this.config);
    this.treeState = createEmptyTreeState();
    this.treeBeepState = { amber1: false, amber2: false, amber3: false, green: false };
    this.displayMode = 'rpm';
    this.greenLightTime = 0;
    this.wasEngineBlown = false;
    this.wasFinished = false;
    this.wasFouled = false;
    this.lastGear = 1;
    this.displayCycleTimer = 0;
    this.results = null;

    // Start engine sound
    this.engineSound.start();

    this.countdownStart = this.absoluteTime + 0.8;
    this.enterState('staging');
  }

  // ─── RACE UPDATE ───────────────────────────────
  private updateRace(dt: number): void {
    const input = this.input.pollGame();
    this.input.pollMenu(); // consume
    this.checkMuteToggle();

    // Update tree
    this.updateTree();

    // Player physics
    const playerState = this.playerPhysics.tick(
      { gasDown: input.gasDown, shiftUp: input.shiftPressed },
      this.absoluteTime,
    );

    // AI physics (only after green)
    let aiState = this.aiPhysics.getState();
    if (this.greenLightTime > 0) {
      const raceElapsed = Math.max(0, this.absoluteTime - this.greenLightTime);
      const aiInput = this.aiDriver.getInput(aiState, raceElapsed);
      aiState = this.aiPhysics.tick(aiInput, this.absoluteTime);
    }

    // Engine sound
    this.engineSound.updateRpm(playerState.rpm, this.config.maxRpm, playerState.gasOn);

    // Detect events
    if (input.shiftPressed && playerState.gear > this.lastGear) {
      this.effects.triggerShiftFlash();
      this.sfx.playShiftClunk();
    }
    this.lastGear = playerState.gear;

    // Wheel slip sound
    if (playerState.wheelSlip < 0.8 && playerState.gasOn && this.state === 'racing') {
      this.sfx.playTireScreech(1 - playerState.wheelSlip);
    }

    // Engine blow
    if (playerState.engineBlown && !this.wasEngineBlown) {
      this.wasEngineBlown = true;
      this.effects.triggerEngineBlow();
      this.sfx.playEngineBlow();
      this.engineSound.stop();
      this.finishRace(playerState, aiState);
    }

    // Foul
    if (playerState.fouled && !this.wasFouled) {
      this.wasFouled = true;
      this.sfx.playFoul();
    }

    // Finish
    if ((playerState.finished || aiState.finished) && !this.wasFinished) {
      // Wait for both to finish or a timeout
      if (playerState.finished && (aiState.finished || aiState.engineBlown)) {
        this.wasFinished = true;
        this.finishRace(playerState, aiState);
      } else if (playerState.finished && !aiState.finished) {
        // Player finished first, give AI time to finish
        if (!this.wasFinished) {
          this.displayMode = 'et';
          this.displayCycleTimer = this.absoluteTime;
        }
      } else if (aiState.finished && !playerState.finished) {
        // AI finished first, keep racing
      }
    }

    // Both done check
    if (!this.wasFinished && (playerState.finished || playerState.engineBlown || playerState.fouled)
        && (aiState.finished || aiState.engineBlown)) {
      this.wasFinished = true;
      this.finishRace(playerState, aiState);
    }

    // Display mode cycling after finish
    if (this.state === 'finished' && !playerState.engineBlown) {
      const sinceFinish = this.absoluteTime - this.displayCycleTimer;
      if (sinceFinish > 2.5) {
        this.displayMode = this.displayMode === 'et' ? 'mph' : 'et';
        this.displayCycleTimer = this.absoluteTime;
      }
    }

    // Transition to results after showing finish for a bit
    if (this.state === 'finished' && this.timeInState() > 4) {
      this.engineSound.stop();
      this.enterState('results');
      return;
    }

    // Effects
    const effectValues = this.effects.update(playerState, this.config, dt);

    // Build render state
    this.renderState = {
      physics: playerState,
      config: this.config,
      treeState: this.treeState,
      displayMode: this.displayMode,
      shakeX: effectValues.shakeX,
      shakeY: effectValues.shakeY,
      flashAlpha: effectValues.flashAlpha,
      flashColor: effectValues.flashColor,
      vignetteIntensity: effectValues.vignetteIntensity,
      ledIntensity: effectValues.ledIntensity,
    };

    this.renderer.render(this.renderState, this.absoluteTime);
  }

  private finishRace(playerState: ReturnType<PhysicsEngine['getState']>, aiState: ReturnType<PhysicsEngine['getState']>): void {
    const playerDNF = playerState.engineBlown || playerState.fouled;
    const aiDNF = aiState.engineBlown;

    let playerWon: boolean;
    if (playerDNF && aiDNF) {
      playerWon = false;
    } else if (playerDNF) {
      playerWon = false;
    } else if (aiDNF) {
      playerWon = true;
    } else {
      playerWon = playerState.et <= aiState.et;
    }

    this.results = {
      playerEt: playerState.et,
      playerMph: playerState.peakMph,
      playerReaction: playerState.reactionTime,
      playerFouled: playerState.fouled,
      playerBlown: playerState.engineBlown,
      aiEt: aiState.et,
      aiMph: aiState.peakMph,
      aiReaction: this.aiDriver.getReactionTime(),
      aiFouled: false,
      aiBlown: aiState.engineBlown,
      playerWon,
    };

    if (playerWon) {
      this.sfx.playWin();
    } else {
      this.sfx.playLose();
    }

    this.effects.triggerFinish();
    this.displayMode = 'et';
    this.displayCycleTimer = this.absoluteTime;
    this.enterState('finished');
  }

  // ─── RESULTS ───────────────────────────────────
  private updateResults(ctx: CanvasRenderingContext2D): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const menu = this.input.pollMenu();
    this.input.pollGame();
    this.checkMuteToggle();

    if (menu.confirm) {
      this.initRace(); // rematch
      return;
    }
    if (menu.back) {
      this.enterState('class_select');
      return;
    }

    const r = this.results!;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const fontSize = Math.min(w * 0.05, 40);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Winner banner
    const pulse = 0.7 + 0.3 * Math.sin(this.absoluteTime * 4);
    if (r.playerWon) {
      ctx.font = `bold ${fontSize * 1.8}px monospace`;
      ctx.fillStyle = `rgba(0, 255, 68, ${pulse})`;
      ctx.shadowColor = 'rgba(0, 255, 68, 0.6)';
      ctx.shadowBlur = 20;
      ctx.fillText('YOU WIN!', w / 2, h * 0.12);
    } else {
      ctx.font = `bold ${fontSize * 1.5}px monospace`;
      ctx.fillStyle = `rgba(255, 34, 17, ${pulse})`;
      ctx.shadowColor = 'rgba(255, 34, 17, 0.6)';
      ctx.shadowBlur = 15;
      if (r.playerBlown) {
        ctx.fillText('ENGINE BLOWN!', w / 2, h * 0.12);
      } else if (r.playerFouled) {
        ctx.fillText('FOUL!', w / 2, h * 0.12);
      } else {
        ctx.fillText('YOU LOSE', w / 2, h * 0.12);
      }
    }
    ctx.shadowBlur = 0;

    // Results table
    const col1 = w * 0.35;
    const col2 = w * 0.65;
    const rowStart = h * 0.28;
    const rowH = fontSize * 1.6;

    // Headers
    ctx.font = `bold ${fontSize * 0.7}px monospace`;
    ctx.fillStyle = '#888888';
    ctx.fillText('YOU', col1, rowStart);
    ctx.fillText(`AI (${DIFFICULTIES[this.difficulty].name})`, col2, rowStart);

    // Separator
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, rowStart + rowH * 0.5);
    ctx.lineTo(w * 0.9, rowStart + rowH * 0.5);
    ctx.stroke();

    const rows = [
      {
        label: 'E.T.',
        p: r.playerBlown ? 'DNF' : r.playerFouled ? 'FOUL' : r.playerEt.toFixed(3) + 's',
        a: r.aiBlown ? 'DNF' : r.aiEt.toFixed(3) + 's',
      },
      {
        label: 'MPH',
        p: r.playerBlown ? '--' : Math.round(r.playerMph).toString(),
        a: r.aiBlown ? '--' : Math.round(r.aiMph).toString(),
      },
      {
        label: 'REACTION',
        p: r.playerFouled ? 'FOUL' : r.playerReaction > 0 ? r.playerReaction.toFixed(3) + 's' : '--',
        a: r.aiReaction.toFixed(3) + 's',
      },
    ];

    rows.forEach((row, i) => {
      const y = rowStart + rowH * (i + 1.2);

      // Label
      ctx.font = `${fontSize * 0.5}px monospace`;
      ctx.fillStyle = '#555555';
      ctx.textAlign = 'center';
      ctx.fillText(row.label, w / 2, y);

      // Player value
      ctx.font = `bold ${fontSize * 0.9}px monospace`;
      ctx.fillStyle = r.playerWon ? '#00ff44' : '#ff2211';
      ctx.fillText(row.p, col1, y);

      // AI value
      ctx.fillStyle = r.playerWon ? '#ff2211' : '#00ff44';
      ctx.fillText(row.a, col2, y);
    });

    // Car class
    ctx.font = `${fontSize * 0.45}px monospace`;
    ctx.fillStyle = '#444444';
    ctx.fillText(`${this.config.name} | ${DIFFICULTIES[this.difficulty].name} AI`, w / 2, h * 0.72);

    // Actions
    ctx.font = `bold ${fontSize * 0.55}px monospace`;
    ctx.fillStyle = '#888888';
    ctx.fillText('ENTER = REMATCH  |  ESC = CHANGE CLASS', w / 2, h * 0.85);

    ctx.restore();
  }

  // ─── TREE COUNTDOWN ────────────────────────────
  private updateTree(): void {
    if (this.state !== 'staging' && this.state !== 'countdown') return;

    const t = this.absoluteTime;
    const cs = this.countdownStart;
    if (t < cs) return;

    const elapsed = t - cs;

    this.treeState.prestage = elapsed >= 0 ? 1 : 0;
    this.treeState.staged = elapsed >= this.PRESTAGE_DELAY ? 1 : 0;

    const amberStart = this.PRESTAGE_DELAY + this.STAGE_DELAY;

    if (elapsed >= amberStart) {
      if (this.state === 'staging') this.enterState('countdown');
      this.treeState.amber1 = 1;
      if (!this.treeBeepState.amber1) {
        this.treeBeepState.amber1 = true;
        this.sfx.playTreeBeep();
      }
    }
    if (elapsed >= amberStart + this.AMBER_INTERVAL) {
      this.treeState.amber2 = 1;
      if (!this.treeBeepState.amber2) {
        this.treeBeepState.amber2 = true;
        this.sfx.playTreeBeep();
      }
    }
    if (elapsed >= amberStart + this.AMBER_INTERVAL * 2) {
      this.treeState.amber3 = 1;
      if (!this.treeBeepState.amber3) {
        this.treeBeepState.amber3 = true;
        this.sfx.playTreeBeep();
      }
    }

    if (elapsed >= amberStart + this.AMBER_INTERVAL * 3) {
      this.treeState.green = 1;
      this.treeState.amber1 = 0;
      this.treeState.amber2 = 0;
      this.treeState.amber3 = 0;

      if (this.greenLightTime === 0) {
        this.greenLightTime = cs + amberStart + this.AMBER_INTERVAL * 3;
        this.playerPhysics.setGreenLightTime(this.greenLightTime);
        this.aiPhysics.setGreenLightTime(this.greenLightTime);
        this.enterState('racing');
        this.effects.triggerLaunchPunch();
        if (!this.treeBeepState.green) {
          this.treeBeepState.green = true;
          this.sfx.playTreeGo();
        }
      }
    }
  }

  // ─── UTILITIES ─────────────────────────────────
  private checkMuteToggle(): void {
    if (this.input.pollMute()) {
      this.audioEngine.toggleMute();
    }
  }
}
