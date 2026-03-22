import { COLORS } from './colors.js';

export class Tachometer {
  private segmentCount = 20;

  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    rpm: number,
    maxRpm: number,
    time: number,
  ): void {
    const fillRatio = Math.min(1, rpm / maxRpm);
    const litSegments = Math.floor(fillRatio * this.segmentCount);
    const segW = width / this.segmentCount;
    const segGap = segW * 0.2;
    const segFill = segW - segGap;

    for (let i = 0; i < this.segmentCount; i++) {
      const sx = x + i * segW;

      ctx.save();

      if (i < litSegments) {
        const t = i / this.segmentCount;
        let color: string;

        if (t < 0.5) {
          color = this.lerpColor(COLORS.TACH_GREEN, COLORS.TACH_YELLOW, t * 2);
        } else if (t < 0.75) {
          color = this.lerpColor(COLORS.TACH_YELLOW, COLORS.TACH_ORANGE, (t - 0.5) / 0.25);
        } else {
          color = COLORS.TACH_RED;
          // Redline pulse
          const pulseRate = 4 + (t - 0.75) * 40;
          const pulse = 0.5 + 0.5 * Math.sin(time * pulseRate);
          ctx.shadowColor = `rgba(255, 0, 0, ${0.5 + 0.5 * pulse})`;
          ctx.shadowBlur = 4 + 8 * pulse;
        }

        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = COLORS.TACH_OFF;
        ctx.shadowBlur = 0;
      }

      // Rounded rect for each segment
      const radius = Math.min(segFill * 0.2, height * 0.2);
      this.roundRect(ctx, sx, y, segFill, height, radius);
      ctx.fill();

      ctx.restore();
    }
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

  private lerpColor(a: string, b: string, t: number): string {
    const ar = parseInt(a.slice(1, 3), 16);
    const ag = parseInt(a.slice(3, 5), 16);
    const ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16);
    const bg = parseInt(b.slice(3, 5), 16);
    const bb = parseInt(b.slice(5, 7), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r}, ${g}, ${bl})`;
  }
}
