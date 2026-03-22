export interface TouchState {
  gasDown: boolean;
  shiftPressed: boolean;
}

export class TouchHandler {
  private gasDown = false;
  private shiftPressed = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });

    // Also support mouse for desktop testing
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.handlePress(touch.clientX);
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.handleRelease(touch.clientX);
    }
  }

  private onMouseDown(e: MouseEvent): void {
    this.handlePress(e.clientX);
  }

  private onMouseUp(e: MouseEvent): void {
    this.handleRelease(e.clientX);
  }

  private handlePress(clientX: number): void {
    const midpoint = this.canvas.width / (window.devicePixelRatio || 1) / 2;
    if (clientX < midpoint) {
      // Left half = gear shift (tap)
      this.shiftPressed = true;
    } else {
      // Right half = gas (hold)
      this.gasDown = true;
    }
  }

  private handleRelease(clientX: number): void {
    const midpoint = this.canvas.width / (window.devicePixelRatio || 1) / 2;
    if (clientX >= midpoint) {
      this.gasDown = false;
    }
  }

  poll(): TouchState {
    const state = {
      gasDown: this.gasDown,
      shiftPressed: this.shiftPressed,
    };
    this.shiftPressed = false; // edge-triggered
    return state;
  }
}
