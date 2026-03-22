import { KeyboardHandler } from './keyboard.js';
import { TouchHandler } from './touch.js';

export interface InputState {
  gasDown: boolean;
  shiftPressed: boolean;
}

export interface MenuInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  confirm: boolean;
  back: boolean;
}

export class InputManager {
  private keyboard: KeyboardHandler;
  private touch: TouchHandler;

  // Menu input tracking
  private menuKeys = {
    up: false, down: false, left: false, right: false,
    confirm: false, back: false,
  };
  private menuConsumed = {
    up: false, down: false, left: false, right: false,
    confirm: false, back: false,
  };

  // Mute toggle
  private _mutePressed = false;
  private _muteConsumed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.keyboard = new KeyboardHandler();
    this.touch = new TouchHandler(canvas);

    window.addEventListener('keydown', (e) => this.onMenuKeyDown(e));
    window.addEventListener('keyup', (e) => this.onMenuKeyUp(e));
  }

  private onMenuKeyDown(e: KeyboardEvent): void {
    if (e.code === 'KeyM' && !this._muteConsumed) {
      this._mutePressed = true;
      this._muteConsumed = true;
    }

    const map: Record<string, keyof typeof this.menuKeys> = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Enter': 'confirm', 'Space': 'confirm',
      'Escape': 'back', 'Backspace': 'back',
    };
    const key = map[e.code];
    if (key && !this.menuConsumed[key]) {
      this.menuKeys[key] = true;
      this.menuConsumed[key] = true;
    }
  }

  private onMenuKeyUp(e: KeyboardEvent): void {
    if (e.code === 'KeyM') {
      this._muteConsumed = false;
    }

    const map: Record<string, keyof typeof this.menuKeys> = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Enter': 'confirm', 'Space': 'confirm',
      'Escape': 'back', 'Backspace': 'back',
    };
    const key = map[e.code];
    if (key) {
      this.menuConsumed[key] = false;
    }
  }

  pollGame(): InputState {
    const kb = this.keyboard.poll();
    const touch = this.touch.poll();
    return {
      gasDown: kb.gasDown || touch.gasDown,
      shiftPressed: kb.shiftPressed || touch.shiftPressed,
    };
  }

  pollMenu(): MenuInput {
    const result = { ...this.menuKeys };
    // Reset edge-triggered
    this.menuKeys = {
      up: false, down: false, left: false, right: false,
      confirm: false, back: false,
    };
    return result;
  }

  pollMute(): boolean {
    const pressed = this._mutePressed;
    this._mutePressed = false;
    return pressed;
  }
}
