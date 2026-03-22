import { PhysicsState, CarConfig } from '@redliner/shared';
import { COLORS } from './colors.js';
import { LEDDisplay } from './led-display.js';
import { Tachometer } from './tachometer.js';
import { ChristmasTreeRenderer, TreeState, createEmptyTreeState } from './christmas-tree.js';

export type DisplayMode = 'rpm' | 'et' | 'mph';

export interface RenderState {
  physics: PhysicsState;
  config: CarConfig;
  treeState: TreeState;
  displayMode: DisplayMode;
  shakeX: number;
  shakeY: number;
  flashAlpha: number;
  flashColor: string;
  vignetteIntensity: number;
  ledIntensity: number;
}

export function createDefaultRenderState(config: CarConfig): RenderState {
  return {
    physics: {
      time: 0, distance: 0, velocity: 0, rpm: config.idleRpm,
      gear: 1, gasOn: false, engineBlown: false, finished: false,
      fouled: false, reactionTime: 0, wheelSlip: 1, gForce: 0,
      mph: 0, peakMph: 0, et: 0,
    },
    config,
    treeState: createEmptyTreeState(),
    displayMode: 'rpm',
    shakeX: 0, shakeY: 0,
    flashAlpha: 0, flashColor: '#ffffff',
    vignetteIntensity: 0, ledIntensity: 0.8,
  };
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gearDisplay: LEDDisplay;
  private mainDisplay: LEDDisplay;
  private tachometer: Tachometer;
  private tree: ChristmasTreeRenderer;
  private dpr: number = 1;
  private width: number = 0;
  private height: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gearDisplay = new LEDDisplay(1);
    this.mainDisplay = new LEDDisplay(4);
    this.tachometer = new Tachometer();
    this.tree = new ChristmasTreeRenderer();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  render(state: RenderState, time: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Screen shake
    ctx.translate(state.shakeX, state.shakeY);

    // Background: dark with subtle gradient
    ctx.fillStyle = '#111111';
    ctx.fillRect(-10, -10, w + 20, h + 20);

    // Dashboard body (red housing)
    this.drawBody(ctx, w, h);

    // Instrument panel (black face)
    const panel = this.getPanelRect(w, h);
    this.drawPanel(ctx, panel);

    // RED LINE logo
    this.drawLogo(ctx, panel, time);

    // Christmas tree
    const treeX = panel.x + panel.w * 0.35;
    const treeY = panel.y + panel.h * 0.02;
    const treeW = panel.w * 0.3;
    const treeH = panel.h * 0.38;
    this.tree.render(ctx, treeX, treeY, treeW, treeH, state.treeState);

    // Gear display (left side)
    const gearX = panel.x + panel.w * 0.08;
    const gearY = panel.y + panel.h * 0.45;
    const gearW = panel.w * 0.12;
    const gearH = panel.h * 0.12;
    this.drawDisplayLabel(ctx, gearX, gearY - gearH * 0.25, gearW, 'GEAR', state.ledIntensity);
    this.gearDisplay.render(ctx, gearX, gearY, gearW, gearH, state.physics.gear.toString(), state.ledIntensity);

    // Main display (center-right)
    const mainX = panel.x + panel.w * 0.28;
    const mainY = panel.y + panel.h * 0.45;
    const mainW = panel.w * 0.55;
    const mainH = panel.h * 0.12;
    const mainValue = this.getDisplayValue(state);
    this.mainDisplay.render(ctx, mainX, mainY, mainW, mainH, mainValue, state.ledIntensity);

    // Display mode label
    const modeLabel = this.getModeLabel(state.displayMode);
    this.drawDisplayLabel(ctx, mainX, mainY + mainH + mainH * 0.15, mainW, modeLabel, state.ledIntensity);

    // Tachometer bar
    const tachX = panel.x + panel.w * 0.08;
    const tachY = panel.y + panel.h * 0.65;
    const tachW = panel.w * 0.84;
    const tachH = panel.h * 0.05;
    this.tachometer.render(ctx, tachX, tachY, tachW, tachH, state.physics.rpm, state.config.maxRpm, time);

    // Car class display
    this.drawCarClass(ctx, panel, state.config.name);

    // Control labels (GEAR / GAS)
    this.drawControlLabels(ctx, w, h);

    // Status indicators
    this.drawStatusIndicators(ctx, panel, state);

    // Vignette overlay
    if (state.vignetteIntensity > 0) {
      this.drawVignette(ctx, w, h, state.vignetteIntensity);
    }

    // Flash overlay
    if (state.flashAlpha > 0) {
      ctx.fillStyle = state.flashColor;
      ctx.globalAlpha = state.flashAlpha;
      ctx.fillRect(-10, -10, w + 20, h + 20);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private getPanelRect(w: number, h: number) {
    // Dashboard panel centered, ~70% width, ~65% height
    const pw = w * 0.7;
    const ph = h * 0.7;
    const px = (w - pw) / 2;
    const py = (h - ph) / 2 - h * 0.02;
    return { x: px, y: py, w: pw, h: ph };
  }

  private drawBody(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const panel = this.getPanelRect(w, h);

    // Red housing with wing grips
    ctx.fillStyle = COLORS.BODY_RED;

    // Main body
    const bodyPad = 15;
    const bodyRadius = 12;
    this.roundRect(ctx, panel.x - bodyPad, panel.y - bodyPad,
      panel.w + bodyPad * 2, panel.h + bodyPad * 2, bodyRadius);
    ctx.fill();

    // Left wing (GEAR grip)
    const wingW = panel.x - bodyPad;
    if (wingW > 20) {
      ctx.fillStyle = COLORS.BODY_RED;
      this.roundRect(ctx, 10, panel.y + panel.h * 0.2, wingW - 10, panel.h * 0.6, 8);
      ctx.fill();
      // Darker edge
      ctx.fillStyle = COLORS.BODY_RED_DARK;
      this.roundRect(ctx, 10, panel.y + panel.h * 0.22, wingW * 0.3, panel.h * 0.56, 6);
      ctx.fill();
    }

    // Right wing (GAS grip)
    const rightX = panel.x + panel.w + bodyPad;
    const rightW = w - rightX;
    if (rightW > 20) {
      ctx.fillStyle = COLORS.BODY_RED;
      this.roundRect(ctx, rightX, panel.y + panel.h * 0.2, rightW - 10, panel.h * 0.6, 8);
      ctx.fill();
      ctx.fillStyle = COLORS.BODY_RED_DARK;
      this.roundRect(ctx, rightX + rightW * 0.5, panel.y + panel.h * 0.22, rightW * 0.4, panel.h * 0.56, 6);
      ctx.fill();
    }

    // Bevel shadow on body
    ctx.fillStyle = COLORS.BODY_BEVEL;
    this.roundRect(ctx, panel.x - bodyPad, panel.y + panel.h + bodyPad - 4,
      panel.w + bodyPad * 2, 4, 2);
    ctx.fill();
  }

  private drawPanel(ctx: CanvasRenderingContext2D, panel: { x: number; y: number; w: number; h: number }): void {
    // Main instrument face
    ctx.fillStyle = COLORS.PANEL_BLACK;
    this.roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 6);
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = COLORS.PANEL_BORDER;
    ctx.lineWidth = 1;
    this.roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 6);
    ctx.stroke();
  }

  private drawLogo(ctx: CanvasRenderingContext2D, panel: { x: number; y: number; w: number; h: number }, _time: number): void {
    const logoX = panel.x + panel.w * 0.5;
    const logoY = panel.y - 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // RED text
    ctx.font = `bold ${panel.h * 0.06}px monospace`;
    ctx.fillStyle = '#ff2211';
    ctx.shadowColor = 'rgba(255, 34, 17, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText('RED', logoX - panel.w * 0.06, logoY + panel.h * 0.01);

    // LINE text
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('LINE', logoX + panel.w * 0.06, logoY + panel.h * 0.01);

    ctx.restore();
  }

  private drawDisplayLabel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    label: string,
    _intensity: number,
  ): void {
    ctx.save();
    ctx.font = `bold ${Math.max(10, width * 0.12)}px monospace`;
    ctx.fillStyle = COLORS.LABEL_WHITE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y);
    ctx.restore();
  }

  private getDisplayValue(state: RenderState): string {
    const p = state.physics;

    if (p.engineBlown) return '----';

    switch (state.displayMode) {
      case 'rpm':
        return Math.round(p.rpm).toString();
      case 'et':
        return p.et > 0 ? p.et.toFixed(2) : p.time.toFixed(2);
      case 'mph':
        return Math.round(p.mph).toString();
    }
  }

  private getModeLabel(mode: DisplayMode): string {
    switch (mode) {
      case 'rpm': return 'RPM';
      case 'et': return 'E.T.';
      case 'mph': return 'MPH';
    }
  }

  private drawCarClass(
    ctx: CanvasRenderingContext2D,
    panel: { x: number; y: number; w: number; h: number },
    className: string,
  ): void {
    const classes = ['Stock', 'Modified', 'Funny Car', 'Top Fuel'];
    const baseX = panel.x + panel.w * 0.15;
    const baseY = panel.y + panel.h * 0.76;
    const lineH = panel.h * 0.045;

    ctx.save();
    ctx.font = `bold ${lineH * 0.75}px monospace`;

    for (let i = 0; i < classes.length; i++) {
      const isActive = classes[i] === className;
      ctx.fillStyle = isActive ? '#ffffff' : '#333333';
      if (isActive) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 4;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(classes[i].toUpperCase(), baseX, baseY + i * lineH);
    }

    ctx.restore();
  }

  private drawControlLabels(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const panel = this.getPanelRect(w, h);
    const fontSize = Math.max(14, w * 0.025);

    ctx.save();
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // GEAR label (left)
    ctx.fillStyle = '#000000';
    ctx.fillText('GEAR', panel.x * 0.5, panel.y + panel.h * 0.5);

    // GAS label (right)
    ctx.fillText('GAS', panel.x + panel.w + (w - panel.x - panel.w) * 0.5, panel.y + panel.h * 0.5);

    ctx.restore();
  }

  private drawStatusIndicators(
    ctx: CanvasRenderingContext2D,
    panel: { x: number; y: number; w: number; h: number },
    state: RenderState,
  ): void {
    const p = state.physics;
    const indX = panel.x + panel.w * 0.78;
    const indY = panel.y + panel.h * 0.08;
    const dotR = panel.h * 0.02;
    const spacing = dotR * 4;

    // START indicator
    this.drawIndicatorDot(ctx, indX, indY, dotR, COLORS.START_GREEN, p.finished ? 1 : 0, 'START');

    // FOUL indicator
    this.drawIndicatorDot(ctx, indX, indY + spacing, dotR, COLORS.FOUL_RED, p.fouled ? 1 : 0, 'FOUL');
  }

  private drawIndicatorDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    intensity: number,
    label: string,
  ): void {
    ctx.save();

    // Housing
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Light
    if (intensity > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 * intensity;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4 + 0.6 * intensity;
    } else {
      ctx.fillStyle = '#1a0a0a';
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.font = `bold ${radius * 0.9}px monospace`;
    ctx.fillStyle = intensity > 0 ? '#cccccc' : '#444444';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + radius * 2, y);

    ctx.restore();
  }

  private drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number): void {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(200, 0, 0, ${0.4 * intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
