import type { LevelConfig } from './types';

// ============================================================
// LUNAR DEFENDER — Level & Game Configurations
// ============================================================

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const PLAYER_SPEED = 250; // px/s
export const BULLET_SPEED = 400; // px/s
export const ENEMY_BULLET_SPEED = 200; // px/s
export const PLAYER_FIRE_RATE = 180; // ms between shots
export const INVINCIBLE_TIME = 2.0; // seconds
export const COMBO_TIMEOUT = 3.0; // seconds

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '初次接触',
    nameEn: 'FIRST CONTACT',
    spawnRate: 1500,
    enemySpeed: 50,
    asteroidChance: 0.0,
    enemyHp: 1,
    hasLateral: false,
    hasShooter: false,
    hasHeavy: false,
    bossHp: 20,
    bossPhases: 1,
    targetScore: 2000,
    description: '基础射击训练',
  },
  {
    id: 2,
    name: '陨石带',
    nameEn: 'ASTEROID FIELD',
    spawnRate: 1200,
    enemySpeed: 60,
    asteroidChance: 0.3,
    enemyHp: 1,
    hasLateral: false,
    hasShooter: false,
    hasHeavy: false,
    bossHp: 25,
    bossPhases: 1,
    targetScore: 2500,
    description: '陨石首次出现',
  },
  {
    id: 3,
    name: '机动部队',
    nameEn: 'MANEUVERS',
    spawnRate: 1000,
    enemySpeed: 70,
    asteroidChance: 0.2,
    enemyHp: 1,
    hasLateral: true,
    hasShooter: false,
    hasHeavy: false,
    bossHp: 30,
    bossPhases: 1,
    targetScore: 3000,
    description: '横向移动敌机',
  },
  {
    id: 4,
    name: '弹幕洗礼',
    nameEn: 'BULLET HELL',
    spawnRate: 900,
    enemySpeed: 75,
    asteroidChance: 0.2,
    enemyHp: 1,
    hasLateral: false,
    hasShooter: true,
    hasHeavy: false,
    bossHp: 35,
    bossPhases: 1,
    targetScore: 3500,
    description: '敌人开始射击',
  },
  {
    id: 5,
    name: '混合编队',
    nameEn: 'MIXED SQUADRON',
    spawnRate: 700,
    enemySpeed: 85,
    asteroidChance: 0.4,
    enemyHp: 1,
    hasLateral: true,
    hasShooter: true,
    hasHeavy: false,
    bossHp: 40,
    bossPhases: 1,
    targetScore: 4000,
    description: '高密度混合攻击',
  },
  {
    id: 6,
    name: '重型装甲',
    nameEn: 'HEAVY ARMOR',
    spawnRate: 800,
    enemySpeed: 80,
    asteroidChance: 0.3,
    enemyHp: 1,
    hasLateral: false,
    hasShooter: true,
    hasHeavy: true,
    bossHp: 50,
    bossPhases: 2,
    targetScore: 4500,
    description: '高HP重型敌人',
  },
  {
    id: 7,
    name: '极速下坠',
    nameEn: 'TERMINAL VELOCITY',
    spawnRate: 600,
    enemySpeed: 130,
    asteroidChance: 0.3,
    enemyHp: 1,
    hasLateral: true,
    hasShooter: true,
    hasHeavy: false,
    bossHp: 45,
    bossPhases: 2,
    targetScore: 5000,
    description: '极速敌人考验',
  },
  {
    id: 8,
    name: '太空垃圾',
    nameEn: 'SPACE DEBRIS',
    spawnRate: 800,
    enemySpeed: 80,
    asteroidChance: 0.7,
    enemyHp: 1,
    hasLateral: false,
    hasShooter: false,
    hasHeavy: true,
    bossHp: 55,
    bossPhases: 2,
    targetScore: 5500,
    description: '陨石海来袭',
  },
  {
    id: 9,
    name: '包围网',
    nameEn: 'SIEGE',
    spawnRate: 500,
    enemySpeed: 100,
    asteroidChance: 0.3,
    enemyHp: 2,
    hasLateral: true,
    hasShooter: true,
    hasHeavy: true,
    bossHp: 60,
    bossPhases: 3,
    targetScore: 6000,
    description: '交叉火力覆盖',
  },
  {
    id: 10,
    name: '月球核心',
    nameEn: 'LUNAR CORE',
    spawnRate: 600,
    enemySpeed: 90,
    asteroidChance: 0.5,
    enemyHp: 2,
    hasLateral: true,
    hasShooter: true,
    hasHeavy: true,
    bossHp: 80,
    bossPhases: 3,
    targetScore: 8000,
    description: '最终决战',
  },
];

export const ENEMY_CHARS: Record<string, string[]> = {
  basic: ['V', 'v', 'Y'],
  lateral: ['<', '>'],
  heavy: ['@', '*', '.'],
  boss: ['M', 'W', '#'],
};

export const PARTICLE_CHARS = ['*', '.', '+', '-', '~', ':', '^'];

export const SAVE_KEY = 'lunar_defender_save';

export interface SaveData {
  highScore: number;
  maxLevel: number;
  stars: Record<string, number>;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { highScore: 0, maxLevel: 1, stars: {} };
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}
