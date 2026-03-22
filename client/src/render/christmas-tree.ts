export interface TreeState {
  prestage: number;  // 0-1 intensity
  staged: number;
  amber1: number;
  amber2: number;
  amber3: number;
  green: number;
  foul: number;
}

export function createEmptyTreeState(): TreeState {
  return { prestage: 0, staged: 0, amber1: 0, amber2: 0, amber3: 0, green: 0, foul: 0 };
}

export class ChristmasTreeRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    state: TreeState,
  ): void {
    const lights: { label: string; color: string; offColor: string; intensity: number }[] = [
      { label: 'PRE STAGE', color: '#ffaa00', offColor: '#2a1a00', intensity: state.prestage },
      { label: 'STAGED',    color: '#ffaa00', offColor: '#2a1a00', intensity: state.staged },
      { label: '',          color: '#ffaa00', offColor: '#2a1a00', intensity: state.amber1 },
      { label: '',          color: '#ffaa00', offColor: '#2a1a00', intensity: state.amber2 },
      { label: '',          color: '#ffaa00', offColor: '#2a1a00', intensity: state.amber3 },
      { label: 'GO',        color: '#00ff44', offColor: '#002a0a', intensity: state.green },
    ];

    const spacing = height / (lights.length + 1);
    const radius = Math.min(spacing * 0.28, width * 0.18);

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      const cy = y + spacing * (i + 1);
      const cx = x + width / 2;

      this.drawLight(ctx, cx, cy, radius, light.color, light.offColor, light.intensity);

      // Label
      if (light.label) {
        ctx.save();
        ctx.font = `${radius * 0.55}px monospace`;
        ctx.fillStyle = light.intensity > 0.5 ? '#cccccc' : '#444444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(light.label, cx, cy + radius + radius * 0.7);
        ctx.restore();
      }
    }
  }

  private drawLight(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    onColor: string,
    offColor: string,
    intensity: number,
  ): void {
    // Housing
    ctx.save();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();

    if (intensity > 0) {
      // Glow
      ctx.shadowColor = onColor;
      ctx.shadowBlur = 10 + 15 * intensity;

      ctx.globalAlpha = 0.3 + 0.7 * intensity;
      ctx.fillStyle = onColor;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Hot center
      ctx.globalAlpha = 0.5 * intensity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = offColor;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
