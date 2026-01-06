import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { BOOSTER_CONFIG } from '../config/gameConfig';
import { HUD } from '../ui/HUD';

export class BoosterManager {
  private scene: GameScene;
  private magnet: { active: boolean; endTime: number } = { active: false, endTime: 0 };
  private shield: { active: boolean; hits: number } = { active: false, hits: 0 };
  private hud: HUD | null = null;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  setHUD(hud: HUD): void {
    this.hud = hud;
  }

  reset(): void {
    this.magnet = { active: false, endTime: 0 };
    this.shield = { active: false, hits: 0 };
    this.hud?.hideMagnetTimer();
    this.hud?.hideShield();
  }

  activate(type: 'magnet' | 'shield'): void {
    if (type === 'magnet') {
      const config = BOOSTER_CONFIG.magnet;
      if (this.magnet.active) {
        this.magnet.endTime = Math.min(
          this.magnet.endTime + config.duration,
          Date.now() + config.maxDuration
        );
      } else {
        this.magnet.active = true;
        this.magnet.endTime = Date.now() + config.duration;
      }
      this.hud?.showMagnetTimer(this.getRemainingTime('magnet'));
    }

    if (type === 'shield') {
      this.shield.active = true;
      this.shield.hits = BOOSTER_CONFIG.shield.hits;
      this.hud?.showShieldHits(this.shield.hits);
    }
  }

  update(time: number, player: Player, gifts: Phaser.GameObjects.Sprite[]): void {
    if (this.magnet.active) {
      if (Date.now() > this.magnet.endTime) {
        this.magnet.active = false;
        this.hud?.hideMagnetTimer();
      } else {
        this.attractGifts(player, gifts);
        this.hud?.updateMagnetTimer(this.getRemainingTime('magnet'));
      }
    }
  }

  private attractGifts(player: Player, gifts: Phaser.GameObjects.Sprite[]): void {
    const config = BOOSTER_CONFIG.magnet;

    for (const gift of gifts) {
      if (!gift.active) continue;

      const dist = Phaser.Math.Distance.Between(
        player.x, player.y, gift.x, gift.y
      );

      if (dist < config.radius) {
        gift.x = Phaser.Math.Linear(gift.x, player.x, config.attractSpeed);
        gift.y = Phaser.Math.Linear(gift.y, player.y, config.attractSpeed);
      }
    }
  }

  onObstacleHit(): boolean {
    if (this.shield.active) {
      this.shield.hits--;
      this.hud?.showShieldHits(this.shield.hits);

      this.scene.cameras.main.shake(100, 0.01);

      if (this.shield.hits <= 0) {
        this.shield.active = false;
        this.hud?.hideShield();
      }
      return false; // Not game over
    }
    return true; // Game over
  }

  private getRemainingTime(type: string): number {
    if (type === 'magnet') {
      return Math.max(0, this.magnet.endTime - Date.now());
    }
    return 0;
  }

  isMagnetActive(): boolean {
    return this.magnet.active;
  }

  isShieldActive(): boolean {
    return this.shield.active;
  }
}
