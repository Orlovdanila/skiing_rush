# Snow Rush 2026 — План реализации v2.1

## Статус реализации

| Фаза | Статус | Описание |
|------|--------|----------|
| Фаза 1: MVP + Foundation | ✅ DONE | Базовая структура, сцены, placeholder-текстуры |
| Фаза 2: Core Gameplay | ✅ DONE | Спавнер, коллизии, очки, прогрессия |
| Фаза 3: Бустеры + Polish | ✅ DONE | Магнит, щит, HUD, countdown (без звуков) |
| Фаза 4: Assets + VFX | ⏳ TODO | Реальные спрайты, анимации |
| Фаза 5: Backend | ⏳ TODO | API, лидерборд, anti-cheat |
| Фаза 6: TG Integration | ⏳ TODO | TWA SDK, haptics |
| Фаза 7: Deploy | ⏳ TODO | Оптимизация, CDN |

---

## Решения

| Параметр | Выбор |
|----------|-------|
| Движок | **Phaser 3 + TypeScript** |
| Бэкенд | **Свой API + PostgreSQL** |
| Сложность | **Скорость + плотность препятствий** |
| Ассеты | **Placeholder (цветные фигуры)** → Кастомные |

---

## Часть 1: Техническая архитектура

### Стек
```
Frontend:
├── Phaser 3.80+
├── TypeScript
├── Vite
└── @twa-dev/sdk (Telegram)

Backend:
├── Node.js + Hono/Express
├── PostgreSQL
└── Cloudflare Workers/Vercel
```

### Бюджеты размера
| Компонент | Лимит | Стратегия |
|-----------|-------|-----------|
| JS бандл | **< 400 KB** gzip | Tree-shaking, code splitting |
| Спрайты | **< 1.5 MB** | TexturePacker atlas, WebP (quality 80) |
| Аудио | **< 500 KB** | Opus/WebM + MP3 fallback для iOS |
| **Итого** | **< 2.5 MB** | Lazy loading, CDN cache |

### Загрузка ассетов

**Текущая реализация (placeholder):**
Текстуры генерируются программно в `BootScene.generatePlaceholderTextures()`:

| Текстура | Размер | Описание |
|----------|--------|----------|
| `player` | 80×100 | Зелёный прямоугольник |
| `gift` | 64×64 | Белый квадрат с красными лентами |
| `obstacle` | 100×140 | Белая ёлка (треугольник + ствол) |
| `booster` | 64×64 | Белый круг с обводкой |
| `bg_tile` | 128×128 | Светло-голубой тайл со снежинками |

**Целевая реализация (с реальными ассетами):**
```typescript
// Стратегия загрузки
Phase 1: Critical (Boot)
├── player.webp (128KB)
├── bg_snow.webp (200KB)
└── ui_atlas.webp (100KB)

Phase 2: Deferred (во время меню)
├── obstacles_atlas.webp
├── gifts_atlas.webp
├── vfx_atlas.webp
└── audio/*.webm

// Аудио fallback
this.load.audio('music_game', [
  'audio/music_game.webm',  // Opus — Chrome/Firefox
  'audio/music_game.mp3'    // Fallback — iOS Safari
]);
```

### Структура проекта
```
snow-rush/
├── src/
│   ├── scenes/
│   │   ├── BootScene.ts       # Прелоадер (critical assets)
│   │   ├── MenuScene.ts       # Меню + deferred loading
│   │   ├── GameScene.ts       # Основной геймплей
│   │   └── GameOverScene.ts   # Результаты + рестарт
│   ├── entities/
│   │   ├── Player.ts          # Лыжник с инерцией
│   │   ├── Gift.ts            # Подарки 3 размеров
│   │   ├── Obstacle.ts        # Деревья, камни
│   │   └── Booster.ts         # Магнит, Щит
│   ├── managers/
│   │   ├── InputManager.ts    # Touch + Keyboard
│   │   ├── SpawnManager.ts    # Генерация объектов + пулы
│   │   ├── BoosterManager.ts  # Активные бустеры + UI
│   │   ├── ScoreManager.ts    # Счёт + дистанция + checksum
│   │   ├── PoolManager.ts     # Object pooling
│   │   └── AudioManager.ts    # Музыка + SFX
│   ├── ui/
│   │   ├── HUD.ts             # Счёт, бустеры, таймеры
│   │   └── Countdown.ts       # 3-2-1-Go
│   ├── config/
│   │   ├── gameConfig.ts      # Константы игры
│   │   └── difficultyConfig.ts # Прогрессия сложности
│   ├── api/
│   │   ├── leaderboard.ts     # API клиент
│   │   └── anticheat.ts       # Подпись результатов
│   └── main.ts
├── server/
│   ├── index.ts               # Express/Hono
│   ├── middleware/
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── validateTG.ts      # initData валидация
│   ├── routes/
│   │   ├── auth.ts            # TG initData валидация
│   │   └── leaderboard.ts     # CRUD лидерборда
│   └── db/
│       └── schema.sql
├── public/
│   ├── assets/
│   │   ├── sprites/           # WebP atlases
│   │   └── audio/             # WebM + MP3
│   └── index.html
└── package.json
```

### Ориентация экрана
```typescript
// Поддержка portrait + landscape
const config: Phaser.Types.Core.GameConfig = {
  scale: {
    mode: Phaser.Scale.RESIZE,        // Адаптивный размер
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,                        // Base width
    height: 1280,                      // Base height (portrait)
    min: { width: 320, height: 480 },
    max: { width: 1920, height: 1920 }
  }
};

// В GameScene — адаптация под ориентацию
handleResize() {
  const { width, height } = this.scale.gameSize;
  const isPortrait = height > width;

  // Ширина игрового поля
  this.gameWidth = isPortrait ? width : width * 0.6;

  // Позиционирование HUD
  this.hud.reposition(width, height, isPortrait);
}
```

---

## Часть 2: Игровая логика

### Движение камеры и игрока
```typescript
class GameScene extends Phaser.Scene {
  private cameraSpeed = 300;
  private distanceTraveled = 0;

  update(time: number, delta: number) {
    const dt = delta / 1000;

    // Камера движется вниз
    this.cameras.main.scrollY += this.cameraSpeed * dt;
    this.distanceTraveled += this.cameraSpeed * dt;

    // Игрок остаётся в viewport
    this.player.y = this.cameras.main.scrollY + this.scale.height * 0.7;

    // Границы уровня (бесконечный)
    // Объекты за камерой — возвращаются в пул
  }
}
```

### Angle-Based движение игрока (NEW!)
```typescript
// Новая механика: угол сохраняется после отпускания кнопки (как лыжник)
class Player extends Phaser.GameObjects.Sprite {
  private movementAngle = 0;              // Текущий угол (радианы), 0 = прямо
  private targetAngle = 0;                // Целевой угол
  private inputDirection = 0;             // -1 | 0 | 1

  // Конфиг из PLAYER_PHYSICS
  // maxAngle: Math.PI / 4        (~45 градусов)
  // angleChangeSpeed: 1.2        (рад/сек)
  // angleSmoothness: 0.08        (lerp factor)
  // visualTiltFactor: 0.6        (множитель наклона спрайта)

  update(time: number, delta: number) {
    const dt = delta / 1000;

    // 1. При нажатии — увеличиваем угол
    if (this.inputDirection !== 0) {
      this.targetAngle += this.inputDirection * angleChangeSpeed * dt;
      this.targetAngle = clamp(this.targetAngle, -maxAngle, maxAngle);
    }
    // При отпускании — угол СОХРАНЯЕТСЯ (ключевое отличие!)

    // 2. Плавная интерполяция к целевому углу
    this.movementAngle = lerp(this.movementAngle, this.targetAngle, 0.08);

    // 3. Горизонтальная скорость = cameraSpeed * tan(angle)
    const horizontalSpeed = cameraSpeed * Math.tan(this.movementAngle);
    this.x += horizontalSpeed * dt;

    // 4. Отражение от стен (угол меняет знак)
    if (this.x <= minX) {
      this.targetAngle = Math.abs(this.targetAngle) * 0.85;
      this.movementAngle = Math.abs(this.movementAngle) * 0.85;
    } else if (this.x >= maxX) {
      this.targetAngle = -Math.abs(this.targetAngle) * 0.85;
      this.movementAngle = -Math.abs(this.movementAngle) * 0.85;
    }

    // 5. Визуальный наклон спрайта
    this.rotation = this.movementAngle * 0.6;
  }

  turnLeft()  { this.inputDirection = -1; }
  turnRight() { this.inputDirection = 1;  }
  stopTurn()  { this.inputDirection = 0;  } // НЕ сбрасывает targetAngle!
}
```

### Камера с горизонтальным следованием (NEW!)
```typescript
// Камера следит за игроком по горизонтали с "коридором"
// Зум 1.4 = видно 50-55% ширины поля

// CAMERA_CONFIG:
// initialZoom: 1.5       (приближение на старте)
// gameZoom: 1.4          (после countdown)
// corridorWidth: 0.25    (25% экрана — "мёртвая зона")
// lerpX: 0.08            (плавность следования)

private updateCameraX(): void {
  const visibleWidth = screenWidth / camera.zoom;
  const corridorHalfWidth = visibleWidth * 0.25 / 2;

  // Камера следует только когда игрок выходит за коридор
  if (playerX < cameraCenter - corridorHalfWidth) {
    targetScrollX = playerX - visibleWidth/2 + corridorHalfWidth;
  } else if (playerX > cameraCenter + corridorHalfWidth) {
    targetScrollX = playerX - visibleWidth/2 - corridorHalfWidth;
  }

  // Камера НЕ показывает пустоту за полем
  targetScrollX = clamp(targetScrollX, fieldLeft, fieldRight - visibleWidth);

  // Плавная интерполяция
  camera.scrollX = lerp(camera.scrollX, targetScrollX, 0.08);
}
```

### Object Pooling (обязательно!)
```typescript
class PoolManager {
  private pools: Map<string, Phaser.GameObjects.Group> = new Map();

  createPool(scene: Phaser.Scene, key: string, classType: any, size: number) {
    const pool = scene.add.group({
      classType,
      maxSize: size,
      runChildUpdate: true
    });

    // Предсоздаём объекты
    for (let i = 0; i < size; i++) {
      const obj = pool.create(0, 0, key);
      obj.setActive(false).setVisible(false);
    }

    this.pools.set(key, pool);
  }

  acquire(key: string, x: number, y: number): Phaser.GameObjects.Sprite | null {
    const pool = this.pools.get(key);
    if (!pool) return null;

    const obj = pool.getFirstDead(false);
    if (obj) {
      obj.setPosition(x, y);
      obj.setActive(true).setVisible(true);
    }
    return obj;
  }

  release(obj: Phaser.GameObjects.Sprite) {
    obj.setActive(false).setVisible(false);
    obj.setPosition(-1000, -1000); // За пределы экрана
  }

  // Очистка объектов за камерой
  cleanup(cameraY: number, buffer: number = 200) {
    this.pools.forEach(pool => {
      pool.getChildren().forEach((obj: any) => {
        if (obj.active && obj.y < cameraY - buffer) {
          this.release(obj);
        }
      });
    });
  }
}

// Размеры пулов
const POOL_SIZES = {
  gift_small: 30,
  gift_medium: 20,
  gift_large: 10,
  tree_small: 25,
  tree_medium: 15,
  tree_large: 10,
  rock: 15,
  booster_magnet: 3,
  booster_shield: 3
};
```

### Спавнер с точными параметрами
```typescript
class SpawnManager {
  private lastSpawnY = 0;
  private readonly SPAWN_STEP = 150;      // Пиксели между волнами спавна
  private readonly LANE_COUNT = 5;        // Количество дорожек
  private readonly LANE_WIDTH: number;    // Вычисляется от gameWidth

  constructor(scene: GameScene) {
    this.LANE_WIDTH = scene.gameWidth / this.LANE_COUNT;
  }

  update(cameraY: number, cameraHeight: number, distance: number) {
    const spawnY = cameraY + cameraHeight + 100; // Спавн за нижней границей

    while (this.lastSpawnY < spawnY) {
      this.lastSpawnY += this.SPAWN_STEP;
      this.spawnWave(this.lastSpawnY, distance);
    }
  }

  private spawnWave(y: number, distance: number) {
    const diff = this.getDifficulty(distance);
    const occupiedLanes: Set<number> = new Set();

    // 1. Спавн препятствий
    if (Math.random() < diff.obstacleDensity) {
      const count = Phaser.Math.Between(1, diff.maxObstaclesPerWave);
      for (let i = 0; i < count; i++) {
        const lane = this.getFreeLane(occupiedLanes);
        if (lane !== -1) {
          this.spawnObstacle(lane, y);
          occupiedLanes.add(lane);
        }
      }
    }

    // 2. Спавн подарков (в свободных дорожках)
    if (Math.random() < diff.giftDensity) {
      const lane = this.getFreeLane(occupiedLanes);
      if (lane !== -1) {
        this.spawnGift(lane, y);
        occupiedLanes.add(lane);
      }
    }

    // 3. Спавн бустеров (редко)
    if (Math.random() < diff.boosterChance) {
      const lane = this.getFreeLane(occupiedLanes);
      if (lane !== -1) {
        this.spawnBooster(lane, y);
      }
    }
  }

  private getFreeLane(occupied: Set<number>): number {
    const available = [];
    for (let i = 0; i < this.LANE_COUNT; i++) {
      if (!occupied.has(i)) available.push(i);
    }
    if (available.length === 0) return -1;
    return Phaser.Utils.Array.GetRandom(available);
  }

  private laneToX(lane: number): number {
    const startX = (this.scene.scale.width - this.scene.gameWidth) / 2;
    return startX + (lane + 0.5) * this.LANE_WIDTH;
  }
}
```

### Коллизии и хитбоксы
```typescript
// Размеры хитбоксов (меньше визуального спрайта для fair gameplay)
const HITBOXES = {
  player: { width: 50, height: 60 },      // Визуал: 128×128
  gift_small: { radius: 20 },              // Визуал: 48×48
  gift_medium: { radius: 28 },             // Визуал: 64×64
  gift_large: { radius: 35 },              // Визуал: 80×80
  tree_small: { width: 40, height: 60 },   // Визуал: 80×100
  tree_medium: { width: 50, height: 80 },  // Визуал: 100×140
  tree_large: { width: 70, height: 100 },  // Визуал: 140×180
  rock: { width: 50, height: 40 },         // Визуал: 70×60
  booster: { radius: 28 }                  // Визуал: 64×64
};

// В GameScene — настройка коллизий
setupCollisions() {
  // Игрок vs препятствия
  this.physics.add.overlap(
    this.player,
    this.obstacleGroup,
    this.onObstacleHit,
    null,
    this
  );

  // Игрок vs подарки
  this.physics.add.overlap(
    this.player,
    this.giftGroup,
    this.onGiftCollect,
    null,
    this
  );

  // Игрок vs бустеры
  this.physics.add.overlap(
    this.player,
    this.boosterGroup,
    this.onBoosterCollect,
    null,
    this
  );
}

// Arcade Physics body setup
setupPlayerBody() {
  this.player.body.setSize(
    HITBOXES.player.width,
    HITBOXES.player.height
  );
  this.player.body.setOffset(
    (128 - HITBOXES.player.width) / 2,
    (128 - HITBOXES.player.height) / 2
  );
}
```

---

## Часть 3: Система сложности (детальная)

```typescript
// difficultyConfig.ts
export const difficulty = {
  // Скорость камеры
  speed: {
    initial: 300,           // пикс/сек
    max: 700,               // максимум
    increment: 0.02,        // +0.02 за пиксель дистанции
    // Формула: speed = min(initial + distance * increment, max)
  },

  // Препятствия (обновлено!)
  obstacles: {
    initialDensity: 0.20,   // 20% шанс спавна на волну
    maxDensity: 0.45,       // 45% максимум (было 65%)
    densityIncrement: 0.00003, // +0.03 за 1000px дистанции
    maxPerWave: {
      initial: 1,
      max: 3,
      threshold: 5000,      // После 5000px — до 2
      threshold2: 15000,    // После 15000px — до 3
    }
  },

  // Подарки (обновлено!)
  gifts: {
    density: 0.5,           // 50% шанс базово
    earlyBonusDistance: 3000,  // Первые 3000px
    earlyBonusMultiplier: 1.5, // x1.5 = 75% в начале
    distribution: {         // Веса размеров
      small: 60,            // +10 очков
      medium: 30,           // +20 очков (было 30)
      large: 10,            // +30 очков (было 50)
      // bonus: +40 очков (новый тип)
    }
  },

  // Бустеры (обновлено!)
  boosters: {
    chance: 0.12,           // 12% шанс на волну (было 5%)
    minDistance: 0,         // Сразу с начала
    cooldown: 900,          // 900px между бустерами (было 1500)
    types: ['magnet', 'shield'],
    weights: { magnet: 50, shield: 50 }
  }
};

// Вычисление текущей сложности
function getDifficulty(distance: number) {
  const d = difficulty;

  // Скорость
  const speed = Math.min(
    d.speed.initial + distance * d.speed.increment,
    d.speed.max
  );

  // Плотность препятствий
  const obstacleDensity = Math.min(
    d.obstacles.initialDensity + distance * d.obstacles.densityIncrement,
    d.obstacles.maxDensity
  );

  // Максимум препятствий на волну
  let maxObstaclesPerWave = d.obstacles.maxPerWave.initial;
  if (distance > d.obstacles.maxPerWave.threshold2) {
    maxObstaclesPerWave = d.obstacles.maxPerWave.max;
  } else if (distance > d.obstacles.maxPerWave.threshold) {
    maxObstaclesPerWave = 2;
  }

  // Шанс бустера
  const boosterChance = distance > d.boosters.minDistance
    ? d.boosters.chance
    : 0;

  // Gift density с бонусом в начале игры
  let giftDensity = d.gifts.density;
  if (distance < d.gifts.earlyBonusDistance) {
    giftDensity *= d.gifts.earlyBonusMultiplier;
  }

  return {
    speed,
    obstacleDensity,
    maxObstaclesPerWave,
    giftDensity,
    boosterChance
  };
}

// Пороги прогрессии (обновлено!)
const DIFFICULTY_PHASES = [
  { distance: 0,     name: 'Tutorial',     speed: 300, density: 0.20 },
  { distance: 2000,  name: 'Easy',         speed: 350, density: 0.28 },
  { distance: 5000,  name: 'Medium',       speed: 450, density: 0.35 },
  { distance: 10000, name: 'Hard',         speed: 550, density: 0.40 },
  { distance: 20000, name: 'Insane',       speed: 650, density: 0.45 },
  { distance: 30000, name: 'Max',          speed: 700, density: 0.45 },
];
```

---

## Часть 4: Бустеры (полная система)

### Политика стакинга
```typescript
// Магнит и Щит могут быть активны ОДНОВРЕМЕННО
// Повторный подбор того же бустера:
// - Магнит: ПРОДЛЕВАЕТ время (текущее + новое)
// - Щит: ВОССТАНАВЛИВАЕТ хиты до 3

const BOOSTER_CONFIG = {
  magnet: {
    duration: 5000,           // 5 секунд
    radius: 180,              // Радиус притяжения
    attractSpeed: 0.12,       // Lerp factor (плавнее чем 0.1)
    stackable: true,          // Время суммируется
    maxDuration: 15000,       // Максимум 15 сек
  },
  shield: {
    hits: 3,                  // Защита от 3 ударов
    stackable: false,         // Восстанавливает до 3
    flashDuration: 200,       // Мигание при ударе
  }
};
```

### Booster Manager с UI
```typescript
class BoosterManager {
  private magnet: { active: boolean; endTime: number } = { active: false, endTime: 0 };
  private shield: { active: boolean; hits: number } = { active: false, hits: 0 };
  private hud: HUD;

  activate(type: 'magnet' | 'shield') {
    if (type === 'magnet') {
      const config = BOOSTER_CONFIG.magnet;
      if (this.magnet.active) {
        // Продлеваем
        this.magnet.endTime = Math.min(
          this.magnet.endTime + config.duration,
          Date.now() + config.maxDuration
        );
      } else {
        this.magnet.active = true;
        this.magnet.endTime = Date.now() + config.duration;
      }
      this.hud.showMagnetTimer(this.getRemainingTime('magnet'));
      this.scene.sound.play('sfx_magnet_activate');
    }

    if (type === 'shield') {
      this.shield.active = true;
      this.shield.hits = BOOSTER_CONFIG.shield.hits;
      this.hud.showShieldHits(this.shield.hits);
      this.scene.sound.play('sfx_shield_activate');
    }
  }

  update(time: number, player: Player, gifts: Gift[]) {
    // Магнит
    if (this.magnet.active) {
      if (Date.now() > this.magnet.endTime) {
        this.magnet.active = false;
        this.hud.hideMagnetTimer();
      } else {
        this.attractGifts(player, gifts);
        this.hud.updateMagnetTimer(this.getRemainingTime('magnet'));
      }
    }
  }

  private attractGifts(player: Player, gifts: Gift[]) {
    const config = BOOSTER_CONFIG.magnet;

    for (const gift of gifts) {
      if (!gift.active) continue;

      const dist = Phaser.Math.Distance.Between(
        player.x, player.y, gift.x, gift.y
      );

      if (dist < config.radius) {
        // Плавное притяжение с интерполяцией
        gift.x = Phaser.Math.Linear(gift.x, player.x, config.attractSpeed);
        gift.y = Phaser.Math.Linear(gift.y, player.y, config.attractSpeed);
      }
    }
  }

  onObstacleHit(): boolean {
    if (this.shield.active) {
      this.shield.hits--;
      this.hud.showShieldHits(this.shield.hits);
      this.scene.sound.play('sfx_shield_hit');

      // Визуальный эффект
      this.scene.cameras.main.shake(100, 0.01);
      this.player.flash(BOOSTER_CONFIG.shield.flashDuration);

      if (this.shield.hits <= 0) {
        this.shield.active = false;
        this.hud.hideShield();
        this.scene.sound.play('sfx_shield_break');
      }
      return false; // НЕ Game Over
    }
    return true; // Game Over
  }

  private getRemainingTime(type: string): number {
    if (type === 'magnet') {
      return Math.max(0, this.magnet.endTime - Date.now());
    }
    return 0;
  }
}
```

### HUD для бустеров
```typescript
class HUD extends Phaser.GameObjects.Container {
  private scoreText: Phaser.GameObjects.Text;
  private magnetIcon: Phaser.GameObjects.Sprite;
  private magnetTimer: Phaser.GameObjects.Text;
  private shieldIcon: Phaser.GameObjects.Sprite;
  private shieldHits: Phaser.GameObjects.Text;

  // Позиционирование (адаптивное)
  reposition(width: number, height: number, isPortrait: boolean) {
    const padding = 20;
    const safeTop = 50; // Safe area для TG

    // Счёт — верхний центр
    this.scoreText.setPosition(width / 2, safeTop);

    // Магнит — левый верх
    this.magnetIcon.setPosition(padding + 24, safeTop + 60);
    this.magnetTimer.setPosition(padding + 60, safeTop + 60);

    // Щит — правый верх
    this.shieldIcon.setPosition(width - padding - 60, safeTop + 60);
    this.shieldHits.setPosition(width - padding - 24, safeTop + 60);
  }

  showMagnetTimer(ms: number) {
    this.magnetIcon.setVisible(true);
    this.magnetTimer.setVisible(true);
    this.updateMagnetTimer(ms);
  }

  updateMagnetTimer(ms: number) {
    const seconds = Math.ceil(ms / 1000);
    this.magnetTimer.setText(`${seconds}s`);

    // Цвет: зелёный > жёлтый > красный
    if (seconds > 3) {
      this.magnetTimer.setColor('#00ff00');
    } else if (seconds > 1) {
      this.magnetTimer.setColor('#ffff00');
    } else {
      this.magnetTimer.setColor('#ff0000');
    }
  }

  hideMagnetTimer() {
    this.magnetIcon.setVisible(false);
    this.magnetTimer.setVisible(false);
  }

  showShieldHits(hits: number) {
    this.shieldIcon.setVisible(true);
    this.shieldHits.setVisible(true);
    this.shieldHits.setText(`×${hits}`);

    // Цвет по количеству хитов
    const colors = { 3: '#00ff00', 2: '#ffff00', 1: '#ff0000' };
    this.shieldHits.setColor(colors[hits] || '#ffffff');
  }

  hideShield() {
    this.shieldIcon.setVisible(false);
    this.shieldHits.setVisible(false);
  }
}
```

---

## Часть 5: Спецификация ассетов

### СПРАЙТЫ (WebP, прозрачный фон)

**Atlas 1: player_atlas.webp** (~150KB)
| Фрейм | Размер | Описание |
|-------|--------|----------|
| `player_idle` | 128×128 | Лыжник анфас |
| `player_left` | 128×128 | Наклон влево |
| `player_right` | 128×128 | Наклон вправо |
| `player_shield` | 128×128 | С glow щита |

**Atlas 2: objects_atlas.webp** (~300KB)
| Фрейм | Размер | Очки | Hitbox |
|-------|--------|------|--------|
| `gift_small` | 48×48 | +10 | r=20 |
| `gift_medium` | 64×64 | +30 | r=28 |
| `gift_large` | 80×80 | +50 | r=35 |
| `booster_magnet` | 64×64 | — | r=28 |
| `booster_shield` | 64×64 | — | r=28 |
| `tree_small` | 80×100 | — | 40×60 |
| `tree_medium` | 100×140 | — | 50×80 |
| `tree_large` | 140×180 | — | 70×100 |
| `rock` | 70×60 | — | 50×40 |
| `snowman` | 80×100 | — | 50×70 |

**Atlas 3: ui_atlas.webp** (~200KB)
| Фрейм | Размер | Описание |
|-------|--------|----------|
| `btn_play` | 300×80 | Кнопка "Играть" |
| `btn_leaderboard` | 300×80 | Кнопка "Лидерборд" |
| `btn_restart` | 300×80 | Кнопка "Ещё раз" |
| `icon_score` | 48×48 | Иконка очков |
| `icon_magnet` | 48×48 | HUD магнита |
| `icon_shield` | 48×48 | HUD щита |
| `countdown_3` | 128×128 | Цифра 3 |
| `countdown_2` | 128×128 | Цифра 2 |
| `countdown_1` | 128×128 | Цифра 1 |
| `countdown_go` | 256×128 | "GO!" |

**Atlas 4: vfx_atlas.webp** (~200KB)
| Фрейм | Размер | Кадры | Описание |
|-------|--------|-------|----------|
| `vfx_snow_trail` | 64×64 | 4 | След от лыж |
| `vfx_gift_collect` | 64×64 | 6 | Искры сбора |
| `vfx_magnet_aura` | 256×256 | 8 | Аура магнита |
| `vfx_shield_hit` | 128×128 | 4 | Удар по щиту |
| `vfx_shield_break` | 128×128 | 6 | Разрушение щита |

**Фоны** (~400KB)
| Файл | Размер | Описание |
|------|--------|----------|
| `bg_snow_tile.webp` | 512×512 | Тайловый фон (repeating) |
| `bg_menu.webp` | 720×1280 | Фон меню (portrait) |

---

### АУДИО

**Формат:** WebM/Opus (primary) + MP3 (iOS fallback)

**Бюджет:** < 500KB total

| Файл | Размер | Описание |
|------|--------|----------|
| `music_menu.webm` | ~150KB | Loop, праздничная |
| `music_game.webm` | ~200KB | Loop, динамичная |
| `music_gameover.webm` | ~50KB | 5 сек джингл |

| SFX | Размер | Описание |
|-----|--------|----------|
| `sfx_countdown_tick.webm` | ~5KB | Тик 3-2-1 |
| `sfx_countdown_go.webm` | ~10KB | "Go!" |
| `sfx_gift_small.webm` | ~5KB | Сбор маленького |
| `sfx_gift_medium.webm` | ~5KB | Сбор среднего |
| `sfx_gift_large.webm` | ~8KB | Сбор большого |
| `sfx_magnet_activate.webm` | ~10KB | Активация магнита |
| `sfx_shield_activate.webm` | ~10KB | Активация щита |
| `sfx_shield_hit.webm` | ~5KB | Удар по щиту |
| `sfx_shield_break.webm` | ~10KB | Разрушение щита |
| `sfx_crash.webm` | ~15KB | Game Over |
| `sfx_button_click.webm` | ~3KB | Клик UI |

---

## Часть 6: Backend + Anti-cheat

### Эндпоинты с защитой
```
POST /api/auth/telegram
  Body: { initData: string }
  Validate: HMAC-SHA256 с bot token
  Response: { token: string (JWT), user: {...} }
  Rate limit: 10 req/min per IP

GET /api/leaderboard
  Query: ?limit=100&offset=0
  Response: [{ rank, userId, name, score, date }]
  Cache: 60 секунд

GET /api/leaderboard/me
  Headers: Authorization: Bearer <token>
  Response: { rank, score, bestScore, gamesPlayed }

POST /api/leaderboard/submit
  Headers: Authorization: Bearer <token>
  Body: {
    score: number,
    distance: number,
    checksum: string,      // Anti-cheat
    sessionId: string,     // Уникальный ID сессии
    timestamp: number      // Время окончания
  }
  Validate:
    - checksum = HMAC(score + distance + sessionId, secret)
    - timestamp в пределах 5 минут
    - score/distance ratio правдоподобный
    - Нет дублей sessionId
  Rate limit: 5 req/min per user
  Response: { success, newHighScore, rank }
```

### initData валидация
```typescript
// server/middleware/validateTG.ts
import crypto from 'crypto';

function validateInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // Сортируем параметры
  const checkString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Вычисляем секретный ключ
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Вычисляем хеш
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  return calculatedHash === hash;
}
```

### Anti-cheat на клиенте
```typescript
// src/api/anticheat.ts
class AntiCheat {
  private sessionId: string;
  private events: GameEvent[] = [];
  private secret = 'CLIENT_SECRET'; // Обфусцировать!

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  // Логируем события для валидации
  logEvent(type: string, data: any) {
    this.events.push({
      type,
      data,
      time: Date.now()
    });
  }

  // Генерируем checksum
  generateChecksum(score: number, distance: number): string {
    const payload = `${score}:${distance}:${this.sessionId}`;
    // Простой HMAC (в проде использовать Web Crypto API)
    return this.hmacSHA256(payload, this.secret);
  }

  // Подготовка данных для отправки
  prepareSubmission(score: number, distance: number) {
    return {
      score,
      distance,
      sessionId: this.sessionId,
      checksum: this.generateChecksum(score, distance),
      timestamp: Date.now()
    };
  }
}
```

### База данных с защитой от дублей
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  first_name VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_played_at TIMESTAMP
);

CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  score INT NOT NULL,
  distance INT NOT NULL,
  session_id UUID UNIQUE,     -- Защита от повторной отправки
  checksum VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Индексы
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 1000000),
  CONSTRAINT valid_distance CHECK (distance >= 0)
);

CREATE INDEX idx_scores_leaderboard ON scores (score DESC, created_at);
CREATE INDEX idx_scores_user ON scores (user_id, score DESC);

-- Функция для топ-100 с рангом
CREATE OR REPLACE FUNCTION get_leaderboard(lim INT DEFAULT 100)
RETURNS TABLE (
  rank BIGINT,
  user_id BIGINT,
  username VARCHAR,
  first_name VARCHAR,
  score INT,
  created_at TIMESTAMP
) AS $$
  SELECT
    RANK() OVER (ORDER BY s.score DESC) as rank,
    u.id,
    u.username,
    u.first_name,
    s.score,
    s.created_at
  FROM scores s
  JOIN users u ON s.user_id = u.id
  WHERE s.score = (
    SELECT MAX(score) FROM scores WHERE user_id = s.user_id
  )
  ORDER BY s.score DESC
  LIMIT lim;
$$ LANGUAGE SQL;
```

---

## Часть 7: Telegram интеграция + PWA/TWA

### Конфигурация для TWA
```typescript
import WebApp from '@twa-dev/sdk';

// Инициализация
WebApp.ready();
WebApp.expand();
WebApp.enableClosingConfirmation(); // Подтверждение выхода

// Тема
const theme = WebApp.themeParams;
document.body.style.backgroundColor = theme.bg_color || '#1a1a2e';

// Viewport
WebApp.onEvent('viewportChanged', ({ isStateStable }) => {
  if (isStateStable) {
    game.scale.resize(window.innerWidth, window.innerHeight);
  }
});
```

### Haptic feedback
```typescript
class HapticManager {
  static light() {
    WebApp.HapticFeedback.impactOccurred('light');
  }

  static medium() {
    WebApp.HapticFeedback.impactOccurred('medium');
  }

  static heavy() {
    WebApp.HapticFeedback.impactOccurred('heavy');
  }

  static success() {
    WebApp.HapticFeedback.notificationOccurred('success');
  }

  static error() {
    WebApp.HapticFeedback.notificationOccurred('error');
  }
}

// Использование
onGiftCollect() { HapticManager.light(); }
onBoosterCollect() { HapticManager.medium(); }
onCrash() { HapticManager.heavy(); }
onNewHighScore() { HapticManager.success(); }
```

### Кэширование (без Service Worker)
```html
<!-- index.html -->
<head>
  <!-- Агрессивное кэширование через headers -->
  <meta http-equiv="Cache-Control" content="public, max-age=31536000, immutable">
</head>
```

```typescript
// vite.config.ts — хеши в именах файлов
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
});
```

```
# Cloudflare/Vercel headers
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache

/api/*
  Cache-Control: no-store
```

### CSP для TWA
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://telegram.org;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  media-src 'self' blob:;
  connect-src 'self' https://api.yourdomain.com;
  frame-ancestors https://web.telegram.org https://t.me;
">
```

---

## Часть 8: Этапы реализации (обновлённые)

### Фаза 1: MVP + Foundation ✅ DONE
1. ✅ Phaser 3 + Vite + TypeScript setup
2. ✅ Portrait + Landscape режимы
3. ✅ Сцены: Boot → Menu → Game → GameOver
4. ✅ Игрок с инерцией + touch/keyboard
5. ✅ Камера с вертикальным скроллом
6. ✅ Object pooling (PoolManager)
7. ✅ Placeholder спрайты (генерация через Graphics)

### Фаза 2: Core Gameplay ✅ DONE
1. ✅ SpawnManager с дорожками (5 lanes)
2. ✅ Подарки (3 типа: small/medium/large) + коллизии + очки
3. ✅ Препятствия (tree_small/medium/large, rock, snowman) + Game Over
4. ✅ HUD (счёт, дистанция)
5. ✅ Прогрессия сложности (difficultyConfig)

### Фаза 3: Бустеры + Polish ✅ DONE
1. ✅ Магнит (притяжение подарков, 5 сек, стакается)
2. ✅ Щит (3 хита, UI индикатор)
3. ✅ UI таймеров/индикаторов бустеров в HUD
4. ✅ Отсчёт 3-2-1-Go (Countdown)
5. ⏳ Звуки (TODO — нужны аудио файлы)

### Фаза 4: Assets + VFX ⏳ TODO
1. ⏳ TexturePacker atlases
2. ⏳ Реальные спрайты (замена placeholder)
3. ⏳ VFX анимации
4. ⏳ Музыка

### Фаза 5: Backend + Anti-cheat ⏳ TODO
1. ⏳ API endpoints (структура готова в server/)
2. ⏳ initData валидация
3. ⏳ Checksum + rate limiting
4. ⏳ PostgreSQL + миграции (schema.sql готов)
5. ⏳ Лидерборд UI

### Фаза 6: TG Integration ⏳ TODO
1. ⏳ @twa-dev/sdk
2. ⏳ Haptic feedback
3. ⏳ Theme adaptation
4. ⏳ MainButton + шаринг

### Фаза 7: Deploy + Optimize ⏳ TODO
1. ⏳ Bundle analysis (<400KB)
2. ⏳ Asset compression
3. ⏳ CDN + cache headers
4. ⏳ CSP
5. ⏳ Cloudflare Pages deploy
6. ⏳ Bot webhook

---

## Чеклист готовности

### Core Game (Фазы 1-3) ✅
- [x] Сцены: Boot → Menu → Game → GameOver
- [x] **Angle-based движение (угол сохраняется после отпускания)** ← NEW!
- [x] **Отражение от стен (угол меняет знак)** ← NEW!
- [x] Touch + Keyboard управление
- [x] Portrait + Landscape работают
- [x] **Камера с горизонтальным следованием + коридор** ← NEW!
- [x] **Зум 1.4 (видно 50-55% поля)** ← NEW!
- [x] Подарки 3 размеров (10/20/30 очков) ← обновлено!
- [x] **Ранний бонус подарков (75% в первые 3000px)**
- [x] Препятствия 5 типов (деревья, камни, снеговик)
- [x] **Плотность препятствий снижена (45% макс)** ← NEW!
- [x] Магнит (притяжение подарков И бустеров, 5 сек) ← обновлено!
- [x] Щит (3 хита, UI индикатор)
- [x] **Бустеры чаще (12% шанс, cooldown 900px)** ← NEW!
- [x] HUD (счёт, дистанция, бустеры)
- [x] Countdown 3-2-1-Go
- [x] Прогрессия сложности
- [x] Placeholder текстуры (цветные фигуры)

### Assets (Фаза 4) ⏳
- [ ] Реальные спрайты
- [ ] VFX анимации
- [ ] Аудио (музыка + SFX)

### Backend (Фаза 5) ⏳
- [ ] initData валидация работает
- [ ] Checksum защита активна
- [ ] Rate limiting настроен
- [ ] Лидерборд загружается < 1сек

### Production (Фазы 6-7) ⏳
- [ ] Бандл JS < 400KB gzip
- [ ] Ассеты < 2MB total
- [ ] FPS стабильный 60 на mid-tier Android
- [ ] Object pooling — нет GC spikes
- [ ] Haptic feedback на всех событиях
- [ ] CSP настроен для TWA

---

## Как запустить

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Сборка в dist/
```

---

## Next Tasks

> Приоритетный список задач для реализации. Обновляй после выполнения каждой задачи.

### Приоритет 1: Критичные для запуска
| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| NT-001 | Добавить AudioManager и звуки | `src/managers/AudioManager.ts`, GameScene | ⏳ TODO |
| NT-002 | Заменить placeholder на реальные спрайты | `BootScene.ts`, public/assets/ | ⏳ TODO |
| NT-003 | Подключить @twa-dev/sdk | `src/main.ts`, package.json | ⏳ TODO |

### Приоритет 2: Backend + Лидерборд
| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| NT-004 | Реализовать server/index.ts | `server/index.ts` | ⏳ TODO |
| NT-005 | initData валидация TG | `server/middleware/validateTG.ts` | ⏳ TODO |
| NT-006 | API /leaderboard endpoints | `server/routes/leaderboard.ts` | ⏳ TODO |
| NT-007 | Leaderboard UI компонент | `src/scenes/LeaderboardScene.ts` | ⏳ TODO |
| NT-008 | Anti-cheat checksum | `src/api/anticheat.ts` | ⏳ TODO |

### Приоритет 3: Polish + Оптимизация
| ID | Задача | Файлы | Статус |
|----|--------|-------|--------|
| NT-009 | VFX анимации (сбор, удар) | `src/vfx/` | ⏳ TODO |
| NT-010 | Haptic feedback | `src/managers/HapticManager.ts` | ⏳ TODO |
| NT-011 | Интеграция PoolManager в SpawnManager | `SpawnManager.ts` | ⏳ TODO |
| NT-012 | Bundle optimization (<400KB) | vite.config.ts | ⏳ TODO |

### Заглушки в коде (требуют замены)
| Файл | Строка | Описание |
|------|--------|----------|
| `BootScene.ts` | `generatePlaceholderTextures()` | Заменить на загрузку реальных ассетов |
| `GameScene.ts` | `// TODO: Play sound` | Добавить вызовы AudioManager |
| `GameOverScene.ts` | `// TODO: Submit score` | Отправка результата на сервер |
| `MenuScene.ts` | `// TODO: show leaderboard` | Переход на LeaderboardScene |

---

**Версия:** 2.3
**Дата:** 6 января 2026
**Статус:** Играбельный прототип с angle-based движением, камерой с горизонтальным следованием, улучшенным балансом
