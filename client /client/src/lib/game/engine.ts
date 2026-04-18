import { 
  GameState, 
  PlayerState, 
  Platform, 
  Button, 
  Door, 
  ShadowFrame, 
  GRAVITY, 
  JUMP_FORCE, 
  MOVE_SPEED, 
  SHADOW_DELAY_MS 
} from './types';
import { LevelData } from '@shared/schema';

export class GameEngine {
  state: GameState;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input: {
    left: boolean;
    right: boolean;
    up: boolean;
  };
  levelWidth: number;
  levelHeight: number;
  
  onGameOver: () => void;
  onVictory: (timeSeconds: number) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    levelData: LevelData,
    onGameOver: () => void,
    onVictory: (timeSeconds: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onGameOver = onGameOver;
    this.onVictory = onVictory;
    this.levelWidth = levelData.width;
    this.levelHeight = levelData.height;

    // Initialize Input
    this.input = { left: false, right: false, up: false };

    // Initialize State
    this.state = {
      player: {
        x: levelData.spawn.x,
        y: levelData.spawn.y,
        vx: 0,
        vy: 0,
        width: 30,
        height: 30,
        isGrounded: false,
        isDead: false,
        hasWon: false,
        frame: 0,
      },
      shadow: {
        x: levelData.spawn.x,
        y: levelData.spawn.y,
        vx: 0,
        vy: 0,
        width: 30,
        height: 30,
        isGrounded: false, // Visual only
        isDead: false,
        hasWon: false,
        frame: 0,
      },
      history: [],
      platforms: levelData.platforms.map(p => ({ ...p, active: true })),
      buttons: levelData.buttons.map(b => ({ ...b, isPressed: false })),
      doors: levelData.doors.map(d => ({ ...d, isOpen: !!d.isOpen })),
      lightZones: levelData.lightZones,
      spawn: levelData.spawn,
      exit: levelData.exit,
      startTime: Date.now(),
      currentTime: 0,
      isPaused: false,
      gameStatus: 'playing',
    };

    this.setupInputListeners();
  }

  setupInputListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  // Mobile input helper
  setMobileInput(direction: 'left' | 'right' | 'up', active: boolean) {
    if (this.state.gameStatus !== 'playing') return;
    
    if (direction === 'left') this.input.left = active;
    if (direction === 'right') this.input.right = active;
    if (direction === 'up') {
      if (active && this.state.player.isGrounded) {
        this.state.player.vy = JUMP_FORCE;
        this.state.player.isGrounded = false;
      }
      this.input.up = active;
    }
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (this.state.gameStatus !== 'playing') return;
    
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.input.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.input.right = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        if (this.state.player.isGrounded) {
          this.state.player.vy = JUMP_FORCE;
          this.state.player.isGrounded = false;
        }
        this.input.up = true;
        break;
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    switch(e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.input.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.input.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.input.up = false;
        break;
    }
  };

  checkCollision(rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, w: number, h: number}) {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.height > rect2.y
    );
  }

  update() {
    if (this.state.gameStatus !== 'playing' || this.state.isPaused) return;

    const { player, platforms, buttons, doors, lightZones, exit } = this.state;
    const now = Date.now();
    this.state.currentTime = (now - this.state.startTime);

    // --- PLAYER MOVEMENT ---
    if (this.input.left) player.vx = -MOVE_SPEED;
    else if (this.input.right) player.vx = MOVE_SPEED;
    else player.vx = 0;

    player.vy += GRAVITY;
    player.x += player.vx;
    this.checkHorizontalCollisions();
    player.y += player.vy;
    this.checkVerticalCollisions();

    // Bounds check
    if (player.y > this.levelHeight) {
      this.die();
      return;
    }

    // --- INTERACTABLES ---
    
    // Buttons
    buttons.forEach(btn => {
      const isColliding = this.checkCollision(player, btn);
      if (isColliding && !btn.isPressed) {
        btn.isPressed = true;
        // Open linked door
        const door = doors.find(d => d.id === btn.targetId);
        if (door) door.isOpen = true;
      }
    });

    // Moving Platforms Logic
    platforms.forEach(plat => {
      if (plat.type === 'moving' && plat.active) {
        if (plat.startY === undefined) plat.startY = plat.y;
        const range = plat.range || 100;
        const speed = plat.speed || 2;
        
        // Use a sine wave for smooth elevator motion
        const offset = Math.sin(this.state.currentTime / 1000 * speed) * range;
        const oldY = plat.y;
        plat.y = plat.startY + offset;
        const dy = plat.y - oldY;

        // Carry player if standing on it
        if (
          player.y + player.height <= oldY + 5 &&
          player.y + player.height >= oldY - 5 &&
          player.x + player.width > plat.x &&
          player.x < plat.x + plat.w
        ) {
          player.y += dy;
          player.isGrounded = true;
          player.vy = 0;
        }
      }

      if (plat.type === 'disappearing' && plat.active) {
        // Simple check: if player is standing on it
        if (
          player.y + player.height === plat.y && 
          player.x + player.width > plat.x && 
          player.x < plat.x + plat.w
        ) {
          if (!plat.disappearTimer) {
            plat.disappearTimer = now;
          }
        }

        if (plat.disappearTimer && now - plat.disappearTimer > 1000) {
          plat.active = false;
        }
      }
    });

    // Exit
    if (this.checkCollision(player, { ...exit, w: 40, h: 60 })) {
      this.win();
      return;
    }

    // --- SHADOW LOGIC ---
    
    // Record history
    this.state.history.push({
      x: player.x,
      y: player.y,
      timestamp: now,
      isGrounded: player.isGrounded
    });

    // Calculate effective delay (slow down in light zones)
    let shadowDelay = SHADOW_DELAY_MS;
    const shadowRect = { x: this.state.shadow.x, y: this.state.shadow.y, width: 30, height: 30 };
    
    for (const zone of lightZones) {
      if (this.checkCollision(shadowRect, zone)) {
        shadowDelay = SHADOW_DELAY_MS * 3; // Slow down significantly
        break;
      }
    }

    // Find historical frame to render shadow
    const targetTime = now - shadowDelay;
    
    // Find closest frame
    let frame: ShadowFrame | undefined;
    
    // Clean up old history to save memory
    while(this.state.history.length > 0 && this.state.history[0].timestamp < targetTime - 1000) {
      this.state.history.shift();
    }

    // Binary search or simple find for closest frame
    for(let i = 0; i < this.state.history.length; i++) {
      if (this.state.history[i].timestamp >= targetTime) {
        frame = this.state.history[i];
        break;
      }
    }

    // Update shadow position
    if (frame) {
      this.state.shadow.x = frame.x;
      this.state.shadow.y = frame.y;
      this.state.shadow.isGrounded = frame.isGrounded;

      // Check SHADOW KILL collision
      // Only kill if shadow has actually started moving (history exists) and is close
      if (this.state.currentTime > shadowDelay) {
        // slightly smaller hit box for shadow to be forgiving
        const killBox = {
          x: this.state.shadow.x + 5,
          y: this.state.shadow.y + 5,
          width: 20,
          height: 20
        };
        
        if (this.checkCollision(player, { ...killBox, w: killBox.width, h: killBox.height })) {
          this.die();
        }
      }
    } else {
      // Before shadow starts moving, it stays at spawn
      this.state.shadow.x = this.state.spawn.x;
      this.state.shadow.y = this.state.spawn.y;
    }
  }

  checkHorizontalCollisions() {
    const { player, platforms, doors } = this.state;
    const colliders = [
      ...platforms.filter(p => p.active),
      ...doors.filter(d => !d.isOpen)
    ];

    for (const obstacle of colliders) {
      if (this.checkCollision(player, obstacle)) {
        if (player.vx > 0) {
          player.x = obstacle.x - player.width;
        } else if (player.vx < 0) {
          player.x = obstacle.x + obstacle.w;
        }
        player.vx = 0;
      }
    }
  }

  checkVerticalCollisions() {
    const { player, platforms, doors } = this.state;
    const colliders = [
      ...platforms.filter(p => p.active),
      ...doors.filter(d => !d.isOpen)
    ];

    player.isGrounded = false;

    for (const obstacle of colliders) {
      if (this.checkCollision(player, obstacle)) {
        if (player.vy > 0) {
          player.y = obstacle.y - player.height;
          player.isGrounded = true;
          player.vy = 0;
        } else if (player.vy < 0) {
          player.y = obstacle.y + obstacle.h;
          player.vy = 0;
        }
      }
    }
  }

  die() {
    this.state.gameStatus = 'dead';
    this.onGameOver();
  }

  win() {
    this.state.gameStatus = 'won';
    this.onVictory(this.state.currentTime / 1000);
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const { player, shadow, platforms, buttons, doors, lightZones, exit } = this.state;

    // Clear Canvas
    ctx.fillStyle = '#0a0a0c'; // --background
    ctx.fillRect(0, 0, width, height);

    // Draw Light Zones
    ctx.fillStyle = 'rgba(255, 200, 0, 0.15)';
    lightZones.forEach(zone => {
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      // Optional: glow effect
      ctx.shadowColor = 'orange';
      ctx.shadowBlur = 20;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.shadowBlur = 0;
    });

    // Draw Spawn point (faint marker)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(this.state.spawn.x, this.state.spawn.y, 30, 30);

    // Draw Exit
    ctx.fillStyle = '#10b981'; // Green
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 15;
    ctx.fillRect(exit.x, exit.y, 40, 60);
    ctx.shadowBlur = 0;
    // Door details
    ctx.fillStyle = '#000';
    ctx.fillRect(exit.x + 5, exit.y + 5, 30, 50);

    // Draw Platforms
    platforms.forEach(plat => {
      if (!plat.active) return;
      
      if (plat.type === 'disappearing') {
         ctx.fillStyle = '#f97316'; // Orange
         if (plat.disappearTimer) {
           // Flicker if about to disappear
           if (Math.floor(Date.now() / 100) % 2 === 0) ctx.fillStyle = '#fed7aa';
         }
      } else {
        ctx.fillStyle = '#3f3f46'; // Muted grey
      }
      
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      
      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(plat.x, plat.y, plat.w, 4);
    });

    // Draw Doors (Obstacles)
    doors.forEach(door => {
      if (door.isOpen) {
        // Draw open door (outline or faded)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(door.x, door.y, door.w, door.h);
      } else {
        // Closed door (solid block)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(door.x, door.y, door.w, door.h);
        // Lock icon representation
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(door.x + door.w/2 - 4, door.y + door.h/2 - 6, 8, 12);
      }
    });

    // Draw Buttons
    buttons.forEach(btn => {
      ctx.fillStyle = btn.isPressed ? '#991b1b' : '#ef4444'; // Dark red if pressed
      
      // Determine if button is inverted (on bottom of a platform)
      const isInverted = platforms.some(p => 
        p.active && 
        btn.x >= p.x - 5 && 
        btn.x + btn.w <= p.x + p.w + 5 && 
        Math.abs(btn.y - (p.y + p.h)) < 5
      );

      const h = btn.isPressed ? btn.h / 2 : btn.h;
      let y;
      
      if (isInverted) {
        // Inverted button: grows upwards when pressed
        y = btn.isPressed ? btn.y : btn.y;
        ctx.fillRect(btn.x, y, btn.w, h);
      } else {
        // Normal button: grows downwards when pressed
        y = btn.isPressed ? btn.y + btn.h / 2 : btn.y;
        ctx.fillRect(btn.x, y, btn.w, h);
      }
    });

    // Draw Shadow (Ghost)
    if (this.state.currentTime > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent black
      ctx.strokeStyle = '#dc2626'; // Red outline
      ctx.lineWidth = 2;
      
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      
      ctx.fillRect(shadow.x, shadow.y, shadow.width, shadow.height);
      ctx.strokeRect(shadow.x, shadow.y, shadow.width, shadow.height);
      
      ctx.shadowBlur = 0;
      
      // Shadow Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(shadow.x + 6, shadow.y + 8, 6, 4);
      ctx.fillRect(shadow.x + 18, shadow.y + 8, 6, 4);
    }

    // Draw Player
    ctx.fillStyle = '#8b5cf6'; // Violet-500
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
    
    // Player Face (cute eyes)
    ctx.fillStyle = '#fff';
    // Decide look direction
    const lookRight = this.input.right || (!this.input.left);
    const eyeOffset = lookRight ? 4 : 0;
    
    ctx.fillRect(player.x + 6 + eyeOffset, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 18 - (4-eyeOffset), player.y + 8, 6, 6);
  }
}
