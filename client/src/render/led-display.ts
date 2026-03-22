// Seven-segment LED digit renderer with authentic glow/bloom

// Segment layout (standard 7-segment):
//   aaa
//  f   b
//   ggg
//  e   c
//   ddd   .dp

const SEGMENT_MAP: Record<string, boolean[]> = {
  // [a, b, c, d, e, f, g]
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true],
  '3': [true,  true,  true,  true,  false, false, true],
  '4': [false, true,  true,  false, false, true,  true],
  '5': [true,  false, true,  true,  false, true,  true],
  '6': [true,  false, true,  true,  true,  true,  true],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true],
  '9': [true,  true,  true,  true,  false, true,  true],
  '-': [false, false, false, false, false, false, true],
  ' ': [false, false, false, false, false, false, false],
  'E': [true,  false, false, true,  true,  true,  true],
  'r': [false, false, false, false, true,  false, true],
  'o': [false, false, true,  true,  true,  false, true],
  'F': [true,  false, false, false, true,  true,  true],
  'L': [false, false, false, true,  true,  true,  false],
  'n': [false, false, true,  false, true,  false, true],
  'P': [true,  true,  false, false, true,  true,  true],
};

export class LEDDisplay {
  private onColor: string;
  private offColor: string;

  constructor(
    private digitCount: number,
    onColor = '#ff2211',
    offColor = 'rgba(80, 0, 0, 0.15)',
  ) {
    this.onColor = onColor;
    this.offColor = offColor;
  }

  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    value: string,
    intensity: number = 1.0,
  ): void {
    const digitW = width / this.digitCount;
    const padding = digitW * 0.12;

    // Pad or trim value to digit count (accounting for decimal points)
    const displayVal = this.formatValue(value);

    let digitIndex = 0;
    for (let i = 0; i < displayVal.length && digitIndex < this.digitCount; i++) {
      const char = displayVal[i];
      const nextChar = displayVal[i + 1];

      const dx = x + digitIndex * digitW + padding;
      const dw = digitW - padding * 2;

      this.renderDigit(ctx, dx, y, dw, height, char, intensity);

      // Handle decimal point
      if (nextChar === '.') {
        this.renderDecimalPoint(ctx, dx + dw + padding * 0.3, y + height - height * 0.12, height * 0.08, intensity);
        i++; // skip the dot
      }

      digitIndex++;
    }
  }

  private formatValue(value: string): string {
    // Strip dots for counting purposes, then pad
    const chars = value.replace(/\./g, '');
    const padded = chars.padStart(this.digitCount, ' ');
    // Re-insert dots at original positions
    if (!value.includes('.')) return padded;

    const dotPos = value.indexOf('.');
    const beforeDot = value.substring(0, dotPos);
    const afterDot = value.substring(dotPos + 1);
    const paddedBefore = beforeDot.padStart(this.digitCount - afterDot.length, ' ');
    return paddedBefore + '.' + afterDot;
  }

  private renderDigit(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    char: string,
    intensity: number,
  ): void {
    const segments = SEGMENT_MAP[char] || SEGMENT_MAP[' '];
    const thick = w * 0.16;
    const gap = thick * 0.2;
    const halfH = h / 2;

    // Compute on-color with intensity
    const r = Math.floor(200 + 55 * intensity);
    const g = Math.floor(20 * intensity);
    const b = Math.floor(10 * intensity);
    const onCol = `rgb(${r}, ${g}, ${b})`;

    // Segment positions: [x1, y1, x2, y2, horizontal?]
    const segs: [number, number, number, number, boolean][] = [
      [x + gap,          y,              x + w - gap,       y,              true],   // a - top
      [x + w - thick,    y + gap,        x + w - thick,     y + halfH - gap, false], // b - top right
      [x + w - thick,    y + halfH + gap, x + w - thick,    y + h - gap,    false],  // c - bottom right
      [x + gap,          y + h - thick,  x + w - gap,       y + h - thick,  true],   // d - bottom
      [x,                y + halfH + gap, x,                y + h - gap,    false],  // e - bottom left
      [x,                y + gap,        x,                 y + halfH - gap, false],  // f - top left
      [x + gap,          y + halfH - thick / 2, x + w - gap, y + halfH - thick / 2, true], // g - middle
    ];

    for (let i = 0; i < 7; i++) {
      const isOn = segments[i];
      const [sx, sy, ex, ey, horiz] = segs[i];

      ctx.save();
      if (isOn) {
        ctx.strokeStyle = onCol;
        ctx.shadowColor = `rgba(255, 40, 20, ${0.4 * intensity})`;
        ctx.shadowBlur = 4 + 12 * intensity;
      } else {
        ctx.strokeStyle = this.offColor;
        ctx.shadowBlur = 0;
      }

      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (horiz) {
        ctx.moveTo(sx + thick * 0.3, sy + thick / 2);
        ctx.lineTo(ex - thick * 0.3, ey + thick / 2);
      } else {
        ctx.moveTo(sx + thick / 2, sy + thick * 0.3);
        ctx.lineTo(ex + thick / 2, ey - thick * 0.3);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderDecimalPoint(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    intensity: number,
  ): void {
    const r = Math.floor(200 + 55 * intensity);
    const g = Math.floor(20 * intensity);
    const b = Math.floor(10 * intensity);

    ctx.save();
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowColor = `rgba(255, 40, 20, ${0.4 * intensity})`;
    ctx.shadowBlur = 4 + 8 * intensity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
