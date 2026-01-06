import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { getDifficulty, difficulty } from '../config/difficultyConfig';
import { SPAWN_CONFIG, GIFT_POINTS } from '../config/gameConfig';
import { GiftSize } from '../entities/Gift';
import { ObstacleType } from '../entities/Obstacle';
import { BoosterType } from '../entities/Booster';

export class SpawnManager {
  private scene: GameScene;
  private lastSpawnY: number;
  private laneWidth: number;
  private lastBoosterY = 0;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.laneWidth = scene.gameWidth / SPAWN_CONFIG.laneCount;
    // Start spawning below player position (player is at 70% height)
    // Add buffer so first obstacles appear below the screen
    this.lastSpawnY = scene.scale.height + SPAWN_CONFIG.spawnBuffer;
  }

  reset(): void {
    // Reset spawn position to below screen to avoid spawning on player
    this.lastSpawnY = this.scene.scale.height + SPAWN_CONFIG.spawnBuffer;
    this.lastBoosterY = 0;
  }

  update(cameraY: number, cameraHeight: number, distance: number): void {
    const spawnY = cameraY + cameraHeight + SPAWN_CONFIG.spawnBuffer;

    while (this.lastSpawnY < spawnY) {
      this.lastSpawnY += SPAWN_CONFIG.step;
      this.spawnWave(this.lastSpawnY, distance);
    }
  }

  private spawnWave(y: number, distance: number): void {
    const diff = getDifficulty(distance);
    const occupiedLanes: Set<number> = new Set();

    // Spawn obstacles
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

    // Spawn gifts
    if (Math.random() < diff.giftDensity) {
      const lane = this.getFreeLane(occupiedLanes);
      if (lane !== -1) {
        this.spawnGift(lane, y);
        occupiedLanes.add(lane);
      }
    }

    // Spawn boosters
    if (Math.random() < diff.boosterChance && (y - this.lastBoosterY) > difficulty.boosters.cooldown) {
      const lane = this.getFreeLane(occupiedLanes);
      if (lane !== -1) {
        this.spawnBooster(lane, y);
        this.lastBoosterY = y;
      }
    }
  }

  private getFreeLane(occupied: Set<number>): number {
    const available: number[] = [];
    for (let i = 0; i < SPAWN_CONFIG.laneCount; i++) {
      if (!occupied.has(i)) available.push(i);
    }
    if (available.length === 0) return -1;
    return Phaser.Utils.Array.GetRandom(available);
  }

  private laneToX(lane: number): number {
    const startX = (this.scene.scale.width - this.scene.gameWidth) / 2;
    return startX + (lane + 0.5) * this.laneWidth;
  }

  private spawnGift(lane: number, y: number): void {
    const x = this.laneToX(lane);
    const size = this.getRandomGiftSize();
    const poolKey = `gift_${size}`;
    
    const gift = this.scene.poolManager.acquire(poolKey, x, y);
    if (gift) {
      // Reset gift properties
      const displaySize = size === 'small' ? 48 : size === 'medium' ? 64 : 80;
      gift.setDisplaySize(displaySize, displaySize);
      gift.setData('points', GIFT_POINTS[size]);
      gift.setData('size', size);
      this.scene.giftGroup.add(gift);
    }
  }

  private spawnObstacle(lane: number, y: number): void {
    const x = this.laneToX(lane);
    const type = this.getRandomObstacleType();
    
    const obstacle = this.scene.poolManager.acquire(type, x, y);
    if (obstacle) {
      const sizes: Record<ObstacleType, { w: number; h: number }> = {
        tree_small: { w: 80, h: 100 },
        tree_medium: { w: 100, h: 140 },
        tree_large: { w: 140, h: 180 },
        rock: { w: 70, h: 60 },
        snowman: { w: 80, h: 100 }
      };
      const size = sizes[type];
      obstacle.setDisplaySize(size.w, size.h);
      obstacle.setData('type', type);
      this.scene.obstacleGroup.add(obstacle);
    }
  }

  private spawnBooster(lane: number, y: number): void {
    const x = this.laneToX(lane);
    const type = this.getRandomBoosterType();
    const poolKey = `booster_${type}`;
    
    const booster = this.scene.poolManager.acquire(poolKey, x, y);
    if (booster) {
      booster.setDisplaySize(64, 64);
      booster.setData('type', type);
      this.scene.boosterGroup.add(booster);
    }
  }

  private getRandomGiftSize(): GiftSize {
    const dist = difficulty.gifts.distribution;
    const roll = Math.random() * 100;
    if (roll < dist.small) return 'small';
    if (roll < dist.small + dist.medium) return 'medium';
    return 'large';
  }

  private getRandomObstacleType(): ObstacleType {
    const types: ObstacleType[] = ['tree_small', 'tree_medium', 'tree_large', 'rock', 'snowman'];
    return Phaser.Utils.Array.GetRandom(types);
  }

  private getRandomBoosterType(): BoosterType {
    const weights = difficulty.boosters.weights;
    return Math.random() * 100 < weights.magnet ? 'magnet' : 'shield';
  }
}
