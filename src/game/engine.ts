import type {
  Player, Enemy, Bullet, Asteroid, Particle, Star,
  GameState, GameData, InputState, LevelConfig,
} from './types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, BULLET_SPEED,
  ENEMY_BULLET_SPEED, PLAYER_FIRE_RATE, INVINCIBLE_TIME,
  COMBO_TIMEOUT, LEVELS, ENEMY_CHARS, PARTICLE_CHARS,
  loadSave, saveSave,
} from './config';

// ============================================================
// LUNAR DEFENDER — Game Engine
// ============================================================

let nextId = 1;
function genId() { return nextId++; }

// ---- Entity Factories ----

export function createPlayer(): Player {
  return {
    id: genId(), x: GAME_WIDTH / 2, y: GAME_HEIGHT - 80,
    width: 16, height: 16, char: 'A', color: '#FFFFFF',
    fontSize: 24, active: true, hp: 1, maxHp: 1,
    speed: PLAYER_SPEED, shield: 3, maxShield: 3,
    invincible: false, invincibleTimer: 0,
    fireRate: PLAYER_FIRE_RATE, fireCooldown: 0,
    lastDir: 'none',
  };
}

function createEnemy(x: number, type: LevelConfig, _levelId: number): Enemy {
  const isLateral = type.hasLateral && Math.random() < 0.3;
  const isHeavy = type.hasHeavy && Math.random() < 0.15;
  const isShooter = type.hasShooter && Math.random() < 0.25;

  if (isHeavy) {
    return {
      id: genId(), x, y: -20,
      width: 22, height: 22, char: '@', color: '#FFFFFF',
      fontSize: 22, active: true, hp: 5, maxHp: 5,
      speed: type.enemySpeed * 0.6,
      vx: 0, vy: type.enemySpeed * 0.6,
      type: 'heavy', shootRate: 0, shootCooldown: 0,
      phase: 0, scoreValue: 300,
    };
  }
  if (isLateral) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    return {
      id: genId(), x, y: -20,
      width: 16, height: 16,
      char: dir < 0 ? '<' : '>', color: '#AAAAAA',
      fontSize: 20, active: true, hp: 1, maxHp: 1,
      speed: type.enemySpeed,
      vx: dir * 40, vy: type.enemySpeed,
      type: 'lateral', shootRate: 0, shootCooldown: 0,
      phase: 0, scoreValue: 150,
    };
  }
  return {
    id: genId(), x, y: -20,
    width: 15, height: 15,
    char: ENEMY_CHARS.basic[Math.floor(Math.random() * ENEMY_CHARS.basic.length)],
    color: '#AAAAAA', fontSize: 20, active: true,
    hp: type.enemyHp, maxHp: type.enemyHp,
    speed: type.enemySpeed, vx: 0, vy: type.enemySpeed,
    type: 'basic',
    shootRate: isShooter ? 2000 : 0,
    shootCooldown: Math.random() * 2000,
    phase: 0, scoreValue: 100,
  };
}

function createAsteroid(x: number, speed: number): Asteroid {
  return {
    id: genId(), x, y: -25,
    width: 20, height: 20, char: 'O', color: '#FFFFFF',
    fontSize: 22, active: true, hp: 2, maxHp: 2,
    speed, vx: (Math.random() - 0.5) * 15,
    rotSpeed: (Math.random() - 0.5) * 2,
    rotation: 0,
  };
}

function createBullet(x: number, y: number, isPlayer: boolean, speed: number, vx = 0): Bullet {
  return {
    id: genId(), x, y,
    width: 4, height: 8,
    char: isPlayer ? '|' : '!',
    color: isPlayer ? '#FFFFFF' : '#FF3333',
    fontSize: 14, active: true, hp: 1, maxHp: 1,
    speed, vx, vy: isPlayer ? -speed : speed,
    isPlayerBullet: isPlayer, damage: 1,
  };
}

function createBoss(level: LevelConfig): Enemy {
  return {
    id: genId(),
    x: GAME_WIDTH / 2,
    y: 60,
    width: 48,
    height: 48,
    char: 'M',
    color: '#FFFFFF',
    fontSize: 48,
    active: true,
    hp: level.bossHp,
    maxHp: level.bossHp,
    speed: 40,
    vx: 40,
    vy: 0,
    type: 'boss',
    shootRate: level.id >= 9 ? 400 : level.id >= 6 ? 600 : 800,
    shootCooldown: 1000,
    phase: 0,
    scoreValue: 5000,
  };
}

function createParticle(x: number, y: number, color: string, count = 1): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)],
      color,
      fontSize: 8 + Math.random() * 8,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.04,
      active: true,
    });
  }
  return particles;
}

function createStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      speed: 10 + Math.random() * 60,
      brightness: 0.1 + Math.random() * 0.6,
      size: Math.random() < 0.8 ? 1 : 2,
    });
  }
  return stars;
}

// ---- Collision ----

function aabb(ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number): boolean {
  return ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    ay - ah / 2 < by + bh / 2 &&
    ay + ah / 2 > by - bh / 2;
}

// ---- Save Data ----

const save = loadSave();

// ============================================================
// Main Engine Class
// ============================================================

export class GameEngine {
  // State
  state: GameState = 'MENU';
  player: Player = createPlayer();
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  asteroids: Asteroid[] = [];
  particles: Particle[] = [];
  stars: Star[] = createStars();
  gameData: GameData = {
    score: 0, highScore: save.highScore, level: 1, maxLevel: save.maxLevel,
    stars: save.stars, progress: 0, isPaused: false,
    screenShake: { intensity: 0, duration: 0, timer: 0 },
    combo: 0, comboTimer: 0, perfectRun: true,
  };
  input: InputState = {
    left: false, right: false, up: false, down: false,
    fire: false, pause: false, touchX: null, touchY: null,
  };

  // Timing
  lastTime = 0;
  spawnTimer = 0;
  bossSpawned = false;
  bossDefeated = false;
  levelProgressScore = 0;
  animFrame = 0;
  running = false;
  menuBlinkTimer = 0;
  gameOverTimer = 0;

  // Callbacks
  onStateChange?: (state: GameState) => void;
  onScoreChange?: (score: number, highScore: number) => void;
  onLevelChange?: (level: number) => void;

  // Boss
  boss: Enemy | null = null;

  // Canvas
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
  }

  // ---- Input ----

  setInput(key: string, pressed: boolean) {
    switch (key) {
      case 'ArrowLeft': case 'a': case 'A': this.input.left = pressed; break;
      case 'ArrowRight': case 'd': case 'D': this.input.right = pressed; break;
      case 'ArrowUp': case 'w': case 'W': this.input.up = pressed; break;
      case 'ArrowDown': case 's': case 'S': this.input.down = pressed; break;
      case ' ': this.input.fire = pressed; break;
      case 'p': case 'P':
        if (pressed && this.state === 'PLAYING') this.pause();
        else if (pressed && this.state === 'PAUSED') this.resume();
        break;
      case 'Enter':
        if (pressed && this.state === 'MENU') this.startLevel(1);
        break;
    }
  }

  setTouch(x: number | null, y: number | null) {
    this.input.touchX = x;
    this.input.touchY = y;
  }

  // ---- State Transitions ----

  startLevel(levelId: number) {
    this.gameData.level = Math.min(levelId, LEVELS.length);
    this.resetLevel();
    this.state = 'PLAYING';
    this.running = true;
    this.lastTime = performance.now();
    this.onStateChange?.('PLAYING');
    this.onLevelChange?.(this.gameData.level);
    this.loop(this.lastTime);
  }

  resetLevel() {
    this.player = createPlayer();
    this.enemies = [];
    this.bullets = [];
    this.asteroids = [];
    this.particles = [];
    this.boss = null;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.spawnTimer = 0;
    this.levelProgressScore = 0;
    this.gameData.progress = 0;
    this.gameData.combo = 0;
    this.gameData.comboTimer = 0;
    this.gameData.perfectRun = true;
    this.gameData.isPaused = false;
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.gameData.isPaused = true;
    this.onStateChange?.('PAUSED');
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.gameData.isPaused = false;
    this.onStateChange?.('PLAYING');
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  gameOver() {
    this.state = 'GAME_OVER';
    this.gameOverTimer = 0;
    // Save high score
    if (this.gameData.score > this.gameData.highScore) {
      this.gameData.highScore = this.gameData.score;
    }
    saveSave({
      highScore: this.gameData.highScore,
      maxLevel: this.gameData.maxLevel,
      stars: this.gameData.stars,
    });
    this.onStateChange?.('GAME_OVER');
  }

  levelComplete() {
    this.state = 'LEVEL_END';
    // Calculate stars
    let stars = 1; // completed
    if (this.player.shield > this.player.maxShield * 0.5) stars = 2;
    if (this.gameData.perfectRun) stars = 3;
    const key = this.gameData.level;
    const prevStars = this.gameData.stars[key] || 0;
    if (stars > prevStars) this.gameData.stars[key] = stars;
    // Unlock next level
    if (this.gameData.level >= this.gameData.maxLevel && this.gameData.level < LEVELS.length) {
      this.gameData.maxLevel = this.gameData.level + 1;
    }
    // Bonus score
    this.gameData.score += this.player.shield * 500;
    if (this.gameData.score > this.gameData.highScore) {
      this.gameData.highScore = this.gameData.score;
    }
    saveSave({
      highScore: this.gameData.highScore,
      maxLevel: this.gameData.maxLevel,
      stars: this.gameData.stars,
    });
    this.onStateChange?.('LEVEL_END');
  }

  backToMenu() {
    this.state = 'MENU';
    this.resetLevel();
    this.gameData.score = 0;
    this.onStateChange?.('MENU');
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  // ---- Main Loop ----

  loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = now;

    if (this.state === 'PLAYING') {
      this.update(dt);
    } else if (this.state === 'MENU') {
      this.updateMenu(dt);
    } else if (this.state === 'GAME_OVER') {
      this.gameOverTimer += dt;
      this.updateParticlesOnly(dt);
    } else if (this.state === 'LEVEL_END') {
      this.updateParticlesOnly(dt);
    } else if (this.state === 'PAUSED') {
      // Nothing updates, just render
    }

    this.render();

    if (this.state !== 'PAUSED') {
      this.animFrame = requestAnimationFrame(this.loop);
    }
  };

  // ---- Update Logic ----

  update(dt: number) {
    const level = LEVELS[this.gameData.level - 1];
    if (!level) return;

    // 1. Player movement
    let dx = 0, dy = 0;
    if (this.input.left) dx -= 1;
    if (this.input.right) dx += 1;
    if (this.input.up) dy -= 1;
    if (this.input.down) dy += 1;

    // Touch control
    if (this.input.touchX !== null) {
      const tx = this.input.touchX - this.player.x;
      if (Math.abs(tx) > 5) dx += tx > 0 ? 1 : -1;
    }

    // Normalize
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 1) { dx /= len; dy /= len; }

    this.player.x += dx * this.player.speed * dt;
    this.player.y += dy * this.player.speed * dt;

    // Clamp
    this.player.x = Math.max(this.player.width / 2, Math.min(GAME_WIDTH - this.player.width / 2, this.player.x));
    this.player.y = Math.max(this.player.height / 2, Math.min(GAME_HEIGHT - this.player.height / 2, this.player.y));

    // Track facing
    if (dx < 0) this.player.lastDir = 'left';
    else if (dx > 0) this.player.lastDir = 'right';

    // 2. Player fire
    this.player.fireCooldown -= dt * 1000;
    if (this.player.fireCooldown <= 0) {
      this.bullets.push(createBullet(this.player.x, this.player.y - 12, true, BULLET_SPEED));
      this.player.fireCooldown = this.player.fireRate;
    }

    // 3. Invincibility
    if (this.player.invincible) {
      this.player.invincibleTimer -= dt;
      if (this.player.invincibleTimer <= 0) {
        this.player.invincible = false;
      }
    }

    // 4. Combo timer
    if (this.gameData.combo > 0) {
      this.gameData.comboTimer -= dt;
      if (this.gameData.comboTimer <= 0) {
        this.gameData.combo = 0;
      }
    }

    // 5. Screen shake decay
    if (this.gameData.screenShake.timer > 0) {
      this.gameData.screenShake.timer -= dt;
      if (this.gameData.screenShake.timer <= 0) {
        this.gameData.screenShake.intensity = 0;
      }
    }

    // 6. Spawning
    if (!this.bossSpawned) {
      this.spawnTimer -= dt * 1000;
      if (this.spawnTimer <= 0) {
        const spawnX = 20 + Math.random() * (GAME_WIDTH - 40);
        // Decide: enemy or asteroid
        if (Math.random() < level.asteroidChance) {
          this.asteroids.push(createAsteroid(spawnX, level.enemySpeed * 0.8));
        } else {
          this.enemies.push(createEnemy(spawnX, level, this.gameData.level));
        }
        this.spawnTimer = level.spawnRate;
      }

      // Check progress for boss
      if (this.gameData.progress >= 100) {
        this.bossSpawned = true;
        // Clear remaining enemies
        this.enemies = [];
        this.boss = createBoss(level);
        this.triggerShake(12, 0.5);
      }
    }

    // 7. Update enemies
    for (const e of this.enemies) {
      if (!e.active) continue;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      // Lateral bounce
      if (e.type === 'lateral') {
        if (e.x < 15) e.vx = Math.abs(e.vx);
        if (e.x > GAME_WIDTH - 15) e.vx = -Math.abs(e.vx);
      }
      // Clamp X
      if (e.x < 10) e.x = 10;
      if (e.x > GAME_WIDTH - 10) e.x = GAME_WIDTH - 10;
      // Out of bounds
      if (e.y > GAME_HEIGHT + 30) e.active = false;

      // Enemy shooting
      if (e.shootRate > 0) {
        e.shootCooldown -= dt * 1000;
        if (e.shootCooldown <= 0) {
          this.bullets.push(createBullet(e.x, e.y + 10, false, ENEMY_BULLET_SPEED));
          e.shootCooldown = e.shootRate + Math.random() * 500;
        }
      }
    }

    // 8. Update boss
    if (this.boss && this.boss.active) {
      this.boss.x += this.boss.vx * dt;
      this.boss.y += Math.sin(performance.now() / 1000) * 0.3;
      // Bounce
      if (this.boss.x < this.boss.width / 2) this.boss.vx = Math.abs(this.boss.vx);
      if (this.boss.x > GAME_WIDTH - this.boss.width / 2) this.boss.vx = -Math.abs(this.boss.vx);

      // Boss phases
      const hpPercent = this.boss.hp / this.boss.maxHp;
      if (level.bossPhases >= 3) {
        if (hpPercent > 0.7) this.boss.phase = 0;
        else if (hpPercent > 0.3) this.boss.phase = 1;
        else this.boss.phase = 2;
      } else if (level.bossPhases >= 2) {
        this.boss.phase = hpPercent > 0.5 ? 0 : 1;
      }

      // Boss shooting
      this.boss.shootCooldown -= dt * 1000;
      if (this.boss.shootCooldown <= 0) {
        if (this.boss.phase === 0) {
          // Spread shot
          for (let i = -1; i <= 1; i++) {
            this.bullets.push(createBullet(this.boss.x + i * 12, this.boss.y + 20, false, ENEMY_BULLET_SPEED, i * 30));
          }
        } else if (this.boss.phase === 1) {
          // Aimed shot + spread
          const angle = Math.atan2(this.player.y - this.boss.y, this.player.x - this.boss.x);
          this.bullets.push(createBullet(
            this.boss.x, this.boss.y + 20, false,
            ENEMY_BULLET_SPEED * 1.2,
            Math.cos(angle) * 60
          ));
          this.bullets.push(createBullet(this.boss.x - 15, this.boss.y + 15, false, ENEMY_BULLET_SPEED, -20));
          this.bullets.push(createBullet(this.boss.x + 15, this.boss.y + 15, false, ENEMY_BULLET_SPEED, 20));
        } else {
          // Barrage
          for (let i = -2; i <= 2; i++) {
            this.bullets.push(createBullet(this.boss.x + i * 10, this.boss.y + 20, false, ENEMY_BULLET_SPEED * 1.3, i * 25));
          }
        }
        this.boss.shootCooldown = this.boss.shootRate;
      }
    }

    // 9. Update asteroids
    for (const a of this.asteroids) {
      if (!a.active) continue;
      a.x += a.vx * dt;
      a.y += a.speed * dt;
      a.rotation += a.rotSpeed * dt;
      if (a.y > GAME_HEIGHT + 30) a.active = false;
    }

    // 10. Update bullets
    for (const b of this.bullets) {
      if (!b.active) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y < -20 || b.y > GAME_HEIGHT + 20 || b.x < -20 || b.x > GAME_WIDTH + 20) {
        b.active = false;
      }
    }

    // 11. Collision: player bullets vs enemies
    for (const b of this.bullets) {
      if (!b.active || !b.isPlayerBullet) continue;
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (aabb(b.x, b.y, b.width, b.height, e.x, e.y, e.width, e.height)) {
          b.active = false;
          e.hp -= b.damage;
          if (e.hp <= 0) {
            e.active = false;
            this.addScore(e.scoreValue);
            this.particles.push(...createParticle(e.x, e.y, '#FFFFFF', 6));
            this.triggerShake(3, 0.05);
          } else {
            // Hit but not destroyed - flash
            e.color = '#FFFFFF';
            setTimeout(() => { if (e.active) e.color = '#AAAAAA'; }, 100);
            // Heavy enemy visual change
            if (e.type === 'heavy') {
              if (e.hp <= 2) e.char = '.';
              else if (e.hp <= 3) e.char = '*';
            }
          }
          break;
        }
      }
      // vs boss
      if (this.boss && this.boss.active && b.active && b.isPlayerBullet) {
        if (aabb(b.x, b.y, b.width, b.height, this.boss.x, this.boss.y, this.boss.width, this.boss.height)) {
          b.active = false;
          this.boss.hp -= b.damage;
          this.boss.color = '#FF3333';
          setTimeout(() => { if (this.boss?.active) this.boss.color = '#FFFFFF'; }, 80);
          this.particles.push(...createParticle(b.x, b.y, '#FF3333', 2));
          if (this.boss.hp <= 0) {
            this.boss.active = false;
            this.addScore(this.boss.scoreValue);
            this.particles.push(...createParticle(this.boss.x, this.boss.y, '#FFFFFF', 20));
            this.particles.push(...createParticle(this.boss.x, this.boss.y, '#FF3333', 10));
            this.triggerShake(18, 0.6);
            this.bossDefeated = true;
            setTimeout(() => this.levelComplete(), 1500);
          }
        }
      }
      // vs asteroids
      for (const a of this.asteroids) {
        if (!a.active || !b.active || !b.isPlayerBullet) continue;
        if (aabb(b.x, b.y, b.width, b.height, a.x, a.y, a.width, a.height)) {
          b.active = false;
          a.hp -= b.damage;
          if (a.hp <= 0) {
            a.active = false;
            this.addScore(50);
            this.particles.push(...createParticle(a.x, a.y, '#AAAAAA', 4));
          } else {
            a.char = 'o';
            a.color = '#AAAAAA';
            a.fontSize = 18;
          }
          break;
        }
      }
    }

    // 12. Collision: player vs enemies/asteroids/enemy bullets
    if (!this.player.invincible) {
      // vs enemies
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (aabb(this.player.x, this.player.y, this.player.width, this.player.height,
          e.x, e.y, e.width, e.height)) {
          e.active = false;
          this.playerHit();
          this.particles.push(...createParticle(e.x, e.y, '#FF3333', 8));
          break;
        }
      }
      // vs asteroids
      for (const a of this.asteroids) {
        if (!a.active) continue;
        if (aabb(this.player.x, this.player.y, this.player.width, this.player.height,
          a.x, a.y, a.width, a.height)) {
          a.active = false;
          this.playerHit();
          this.particles.push(...createParticle(a.x, a.y, '#FF3333', 6));
          break;
        }
      }
      // vs enemy bullets
      for (const b of this.bullets) {
        if (!b.active || b.isPlayerBullet) continue;
        if (aabb(this.player.x, this.player.y, this.player.width, this.player.height,
          b.x, b.y, b.width, b.height)) {
          b.active = false;
          this.playerHit();
          break;
        }
      }
      // vs boss
      if (this.boss && this.boss.active) {
        if (aabb(this.player.x, this.player.y, this.player.width, this.player.height,
          this.boss.x, this.boss.y, this.boss.width, this.boss.height)) {
          this.playerHit();
        }
      }
    }

    // 13. Update particles
    this.updateParticles(dt);

    // 14. Update stars
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > GAME_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * GAME_WIDTH;
      }
    }

    // 15. Cleanup inactive
    this.enemies = this.enemies.filter(e => e.active);
    this.bullets = this.bullets.filter(b => b.active);
    this.asteroids = this.asteroids.filter(a => a.active);

    // 16. Check game over
    if (this.player.shield <= 0 && this.state === 'PLAYING') {
      this.player.active = false;
      this.particles.push(...createParticle(this.player.x, this.player.y, '#FF3333', 15));
      this.particles.push(...createParticle(this.player.x, this.player.y, '#FFFFFF', 10));
      this.triggerShake(15, 0.5);
      setTimeout(() => this.gameOver(), 1000);
    }
  }

  updateMenu(dt: number) {
    this.menuBlinkTimer += dt;
    this.updateParticles(dt);
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > GAME_HEIGHT) { s.y = 0; s.x = Math.random() * GAME_WIDTH; }
    }
  }

  updateParticlesOnly(dt: number) {
    this.updateParticles(dt);
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > GAME_HEIGHT) { s.y = 0; s.x = Math.random() * GAME_WIDTH; }
    }
  }

  updateParticles(_dt: number) {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= p.decay;
      if (p.life <= 0) p.active = false;
    }
    this.particles = this.particles.filter(p => p.active);
  }

  // ---- Helpers ----

  playerHit() {
    this.player.shield--;
    this.player.invincible = true;
    this.player.invincibleTimer = INVINCIBLE_TIME;
    this.gameData.perfectRun = false;
    this.triggerShake(10, 0.25);
    this.particles.push(...createParticle(this.player.x, this.player.y, '#FF3333', 5));
  }

  addScore(amount: number) {
    // Combo system
    this.gameData.combo++;
    this.gameData.comboTimer = COMBO_TIMEOUT;
    const comboMult = Math.min(this.gameData.combo, 10);
    const total = amount * (1 + (comboMult - 1) * 0.1);
    this.gameData.score += Math.floor(total);

    // Progress
    const level = LEVELS[this.gameData.level - 1];
    if (level && !this.bossSpawned) {
      this.levelProgressScore += amount;
      this.gameData.progress = Math.min(100, (this.levelProgressScore / level.targetScore) * 100);
    }

    this.onScoreChange?.(this.gameData.score, this.gameData.highScore);
  }

  triggerShake(intensity: number, duration: number) {
    this.gameData.screenShake = { intensity, duration, timer: duration };
  }

  // ---- Rendering ----

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    // Screen shake offset
    let sx = 0, sy = 0;
    if (this.gameData.screenShake.timer > 0) {
      const t = this.gameData.screenShake.timer / this.gameData.screenShake.duration;
      const decay = t * t; // quadratic decay
      sx = (Math.random() - 0.5) * 2 * this.gameData.screenShake.intensity * decay;
      sy = (Math.random() - 0.5) * 2 * this.gameData.screenShake.intensity * decay;
    }

    ctx.save();
    ctx.translate(sx, sy);

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20);

    // Stars
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const gridOffset = (performance.now() / 50) % 40;
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = gridOffset; y < GAME_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }

    // State-specific rendering
    if (this.state === 'MENU') {
      this.renderMenu(ctx);
    } else if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'GAME_OVER' || this.state === 'LEVEL_END') {
      this.renderGame(ctx);
    }

    ctx.restore();
  }

  renderMenu(ctx: CanvasRenderingContext2D) {
    // Title
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Blink effect
    const alpha = this.menuBlinkTimer % 1.5 < 0.75 ? 1 : 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillText('LUNAR', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);
    ctx.fillText('DEFENDER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    ctx.globalAlpha = 1;

    // Subtitle
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('ASCII SPACE SHOOTER', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);

    // Start prompt
    const blink = this.menuBlinkTimer % 1 < 0.5;
    if (blink) {
      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('> PRESS ENTER TO START <', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
    }

    // Controls
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText('ARROWS / WASD : MOVE', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130);
    ctx.fillText('SPACE : FIRE    P : PAUSE', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 148);

    // High score
    if (this.gameData.highScore > 0) {
      ctx.font = '14px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`HI-SCORE: ${String(this.gameData.highScore).padStart(6, '0')}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 190);
    }

    // Level select hint
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText(`MAX LEVEL REACHED: ${this.gameData.maxLevel}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 215);
  }

  renderGame(ctx: CanvasRenderingContext2D) {
    // Asteroids
    for (const a of this.asteroids) {
      if (!a.active) continue;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.font = `${a.fontSize}px "Courier New", monospace`;
      ctx.fillStyle = a.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.char, 0, 0);
      ctx.restore();
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.active) continue;
      ctx.font = `${e.fontSize}px "Courier New", monospace`;
      ctx.fillStyle = e.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.char, e.x, e.y);
    }

    // Boss
    if (this.boss && this.boss.active) {
      ctx.font = `${this.boss.fontSize}px "Courier New", monospace`;
      ctx.fillStyle = this.boss.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.boss.char, this.boss.x, this.boss.y);

      // Boss HP bar
      const barWidth = 80;
      const barHeight = 4;
      const bx = this.boss.x - barWidth / 2;
      const by = this.boss.y - 35;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(bx, by, barWidth, barHeight);
      const hpPct = this.boss.hp / this.boss.maxHp;
      ctx.fillStyle = hpPercent > 0.3 ? '#FFFFFF' : '#FF3333';
      ctx.fillRect(bx, by, barWidth * hpPct, barHeight);
    }

    // Bullets
    for (const b of this.bullets) {
      if (!b.active) continue;
      ctx.font = `${b.fontSize}px "Courier New", monospace`;
      ctx.fillStyle = b.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.char, b.x, b.y);
    }

    // Player
    if (this.player.active && this.state !== 'GAME_OVER') {
      // Invincibility blink
      let drawPlayer = true;
      if (this.player.invincible) {
        drawPlayer = Math.floor(performance.now() / 80) % 2 === 0;
      }
      if (drawPlayer) {
        ctx.font = `${this.player.fontSize}px "Courier New", monospace`;
        ctx.fillStyle = this.player.invincible ? 'rgba(255,255,255,0.6)' : '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Bobbing animation
        const bob = Math.sin(performance.now() / 300) * 1.5;
        ctx.fillText(this.player.char, this.player.x, this.player.y + bob);
      }
    }

    // Particles
    for (const p of this.particles) {
      if (!p.active) continue;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.font = `${p.fontSize}px "Courier New", monospace`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.globalAlpha = 1;

    // HUD
    this.renderHUD(ctx);

    // Paused overlay
    if (this.state === 'PAUSED') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.font = '24px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText('PRESS P TO RESUME', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    }

    // Game Over overlay
    if (this.state === 'GAME_OVER') {
      const alpha = Math.min(1, this.gameOverTimer * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.7 * alpha})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.globalAlpha = alpha;

      // Blink red
      const redBlink = Math.floor(performance.now() / 400) % 2 === 0;
      ctx.font = 'bold 22px "Courier New", monospace';
      ctx.fillStyle = redBlink ? '#FF3333' : '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('MISSION FAILED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);

      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`SCORE: ${String(this.gameData.score).padStart(6, '0')}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = '12px "Courier New", monospace';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText('CLICK TO RETRY', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
      ctx.fillText('PRESS ESC FOR MENU', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);

      ctx.globalAlpha = 1;
    }

    // Level End overlay
    if (this.state === 'LEVEL_END') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.font = '20px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('MISSION COMPLETE', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);

      const level = LEVELS[this.gameData.level - 1];
      if (level) {
        ctx.font = '14px "Courier New", monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(`${level.id}. ${level.nameEn}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
      }

      // Stars
      const stars = this.gameData.stars[this.gameData.level] || 0;
      ctx.font = '28px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      ctx.fillText(starStr, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 5);

      ctx.font = '16px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`SCORE: ${String(this.gameData.score).padStart(6, '0')}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45);

      ctx.font = '14px "Courier New", monospace';
      ctx.fillStyle = '#AAAAAA';
      if (this.gameData.level < LEVELS.length) {
        ctx.fillText('CLICK FOR NEXT LEVEL', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 85);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText('ALL MISSIONS COMPLETE!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 85);
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('YOU ARE THE LUNAR DEFENDER', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 108);
      }
    }
  }

  renderHUD(ctx: CanvasRenderingContext2D) {
    // Score
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE ${String(this.gameData.score).padStart(6, '0')}`, GAME_WIDTH / 2, 22);

    // Level info
    const level = LEVELS[this.gameData.level - 1];
    if (level) {
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText(`LV.${level.id} ${level.nameEn}`, GAME_WIDTH / 2, 38);
    }

    // Progress bar
    if (!this.bossSpawned) {
      const barY = 48;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(GAME_WIDTH / 2 - 60, barY, 120, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(GAME_WIDTH / 2 - 60, barY, 120 * (this.gameData.progress / 100), 4);
    } else if (this.boss && this.boss.active) {
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#FF3333';
      ctx.fillText('!! BOSS !!', GAME_WIDTH / 2, 52);
    }

    // Shield
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'left';
    for (let i = 0; i < this.player.maxShield; i++) {
      ctx.fillStyle = i < this.player.shield ? '#FFFFFF' : '#333333';
      ctx.fillText('+', 10 + i * 16, 24);
    }

    // Combo
    if (this.gameData.combo > 1) {
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = this.gameData.combo >= 10 ? '#FF3333' : '#AAAAAA';
      ctx.fillText(`x${this.gameData.combo}`, GAME_WIDTH - 10, 24);
    }

    // Pause button (visual)
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555555';
    ctx.fillText('[||]', GAME_WIDTH - 10, GAME_HEIGHT - 14);
  }

  // ---- Cleanup ----

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animFrame);
  }
}

// Helper for boss HP bar
const hpPercent = 1.0;
