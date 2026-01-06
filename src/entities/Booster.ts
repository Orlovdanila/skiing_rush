import Phaser from 'phaser';
import { HITBOXES } from '../config/gameConfig';

export type BoosterType = 'magnet' | 'shield';

export class Booster extends Phaser.GameObjects.Sprite {
  private boosterType: BoosterType = 'magnet';

  constructor(scene: Phaser.Scene, x: number, y: number, type: BoosterType = 'magnet') {
    super(scene, x, y, `booster_${type}`); // TODO: Use actual texture

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBoosterType(type);
  }

  setBoosterType(type: BoosterType): void {
    this.boosterType = type;

    // Display size
    this.setDisplaySize(64, 64);

    // Placeholder colors
    const colors: Record<BoosterType, number> = {
      magnet: 0xff00ff,
      shield: 0x00ffff
    };
    this.setTint(colors[type]);

    // Set hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitbox = HITBOXES.booster;
    if ('radius' in hitbox) {
      body.setCircle(hitbox.radius);
      body.setOffset(
        (64 - hitbox.radius * 2) / 2,
        (64 - hitbox.radius * 2) / 2
      );
    }

    this.setData('type', type);
  }

  reset(x: number, y: number, type: BoosterType): void {
    this.setPosition(x, y);
    this.setBoosterType(type);
    this.setActive(true);
    this.setVisible(true);
  }
}
