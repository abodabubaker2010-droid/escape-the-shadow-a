export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {
  type: 'static' | 'disappearing' | 'moving';
  active: boolean; // For disappearing platforms
  disappearTimer?: number;
  // Moving platform properties
  startY?: number;
  range?: number;
  speed?: number;
}

export interface Button extends Rect {
  id: string;
  targetId: string; // ID of the door it opens
  isPressed: boolean;
}

export interface Door extends Rect {
  id: string;
  isOpen: boolean;
}

export interface LightZone extends Rect {}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isDead: boolean;
  hasWon: boolean;
  frame: number; // For animation timing
}

export interface ShadowFrame {
  x: number;
  y: number;
  timestamp: number;
  isGrounded: boolean;
}

export interface GameState {
  player: PlayerState;
  shadow: PlayerState; // Reuse player struct for drawing simplicity
  history: ShadowFrame[];
  platforms: Platform[];
  buttons: Button[];
  doors: Door[];
  lightZones: LightZone[];
  spawn: Point;
  exit: Point;
  startTime: number;
  currentTime: number;
  isPaused: boolean;
  gameStatus: 'playing' | 'dead' | 'won' | 'menu';
}

// Config constants
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 5;
export const SHADOW_DELAY_MS = 2000;
export const RECORD_INTERVAL_MS = 16; // Record every frame (~60fps)
