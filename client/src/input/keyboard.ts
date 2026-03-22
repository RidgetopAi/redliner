export interface KeyboardState {
  gasDown: boolean;
  shiftPressed: boolean;  // edge-triggered: true only on the frame it was pressed
}

export class KeyboardHandler {
  private gasKeys = new Set(['Space', 'ArrowRight']);
  private shiftKeys = new Set(['ShiftLeft', 'ShiftRight', 'ArrowLeft', 'KeyS']);
  private gasDown = false;
  private shiftPressed = false;
  private shiftConsumed = false;

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    e.preventDefault();
    if (this.gasKeys.has(e.code)) {
      this.gasDown = true;
    }
    if (this.shiftKeys.has(e.code) && !this.shiftConsumed) {
      this.shiftPressed = true;
      this.shiftConsumed = true;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (this.gasKeys.has(e.code)) {
      this.gasDown = false;
    }
    if (this.shiftKeys.has(e.code)) {
      this.shiftConsumed = false;
    }
  }

  poll(): KeyboardState {
    const state = {
      gasDown: this.gasDown,
      shiftPressed: this.shiftPressed,
    };
    // Consume the edge-triggered shift
    this.shiftPressed = false;
    return state;
  }
}
