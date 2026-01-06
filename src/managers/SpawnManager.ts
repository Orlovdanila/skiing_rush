import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { getDifficulty, difficulty } from '../config/difficultyConfig';
import { SPAWN_CONFIG } from '../config/gameConfig';
import { GiftSize } from '../entities/Gift';
import { ObstacleType } from '../entities/Obstacle';
import { BoosterType } from '../entities/Booster';

export class SpawnManager {
  private scene: GameScene;
  private lastSpawnY = 0;
  private laneWidth: number;
  private lastBoosterY = 0;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.laneWidth = scene.gameWidth / SPAWN_CONFIG.laneCount;
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
    
    // Create placeholder sprite
    const gift = this.scene.add.sprite(x, y, 'gift');
    gift.setDisplaySize(size === 'small' ? 48 : size === 'medium' ? 64 : 80, size === 'small' ? 48 : size === 'medium' ? 64 : 80);
    gift.setTint(size === 'small' ? 0xffff00 : size === 'medium' ? 0xff8800 : 0xff0088);
    gift.setData('points', size === 'small' ? 10 : size === 'medium' ? 30 : 50);
    gift.setData('size', size);
    
    this.scene.physics.add.existing(gift);
    this.scene.giftGroup.add(gift);
  }

  private spawnObstacle(lane: number, y: number): void {
    const x = this.laneToX(lane);
    const type = this.getRandomObstacleType();
    
    const sizes: Record<ObstacleType, { w: number; h: number }> = {
      tree_small: { w: 80, h: 100 },
      tree_medium: { w: 100, h: 140 },
      tree_large: { w: 140, h: 180 },
      rock: { w: 70, h: 60 },
      snowman: { w: 80, h: 100 }
    };
    
    const colors: Record<ObstacleType, number> = {
      tree_small: 0x228822,
      tree_medium: 0x116611,
      tree_large: 0x004400,
      rock: 0x666666,
      snowman: 0xffffff
    };
    
    const obstacle = this.scene.add.sprite(x, y, 'obstacle');
    obstacle.setDisplaySize(sizes[type].w, sizes[type].h);
    obstacle.setTint(colors[type]);
    obstacle.setData('type', type);
    
    this.scene.physics.add.existing(obstacle);
    this.scene.obstacleGroup.add(obstacle);
  }

  private spawnBooster(lane: number, y: number): void {
    const x = this.laneToX(lane);
    const type = this.getRandomBoosterType();
    
    const booster = this.scene.add.sprite(x, y, 'booster');
    booster.setDisplaySize(64, 64);
    booster.setTint(type === 'magnet' ? 0xff00ff : 0x00ffff);
    booster.setData('type', type);
    
    this.scene.physics.add.existing(booster);
    this.scene.boosterGroup.add(booster);
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
