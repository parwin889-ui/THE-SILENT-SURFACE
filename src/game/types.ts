// ============================================================
// LUNAR DEFENDER — Type Definitions
// ============================================================

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_END';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  char: string;
  color: string;
  fontSize: number;
  active: boolean;
  hp: number;
  maxHp: number;
}

export interface Player extends Entity {
  speed: number;
  shield: number;
  maxShield: number;
  invincible: boolean;
  invincibleTimer: number;
  fireRate: number;
  fireCooldown: number;
  lastDir: 'left' | 'right' | 'none';
}

export interface Enemy extends Entity {
  speed: number;
  vx: number;
  vy: number;
  type: 'basic' | 'lateral' | 'heavy' | 'boss';
  shootRate: number;
  shootCooldown: number;
  phase: number; // For boss phases
  scoreValue: number;
}

export interface Bullet extends Entity {
  speed: number;
  vx: number;
  vy: number;
  isPlayerBullet: boolean;
  damage: number;
}

export interface Asteroid extends Entity {
  speed: number;
  vx: number;
  rotSpeed: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
  fontSize: number;
  life: number;
  decay: number;
  active: boolean;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  brightness: number;
  size: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  nameEn: string;
  spawnRate: number;     // ms between spawns
  enemySpeed: number;    // px/s
  asteroidChance: number; // 0-1
  enemyHp: number;
  hasLateral: boolean;
  hasShooter: boolean;
  hasHeavy: boolean;
  bossHp: number;
  bossPhases: number;
  targetScore: number;   // Progress bar target
  description: string;
}

export interface GameData {
  score: number;
  highScore: number;
  level: number;
  maxLevel: number;
  stars: Record<number, number>; // level -> stars
  progress: number; // 0-100
  isPaused: boolean;
  screenShake: { intensity: number; duration: number; timer: number };
  combo: number;
  comboTimer: number;
  perfectRun: boolean; // no hits taken this level
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  pause: boolean;
  touchX: number | null;
  touchY: number | null;
}
