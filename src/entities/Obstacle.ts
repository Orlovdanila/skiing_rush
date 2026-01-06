import Phaser from 'phaser';
import { HITBOXES } from '../config/gameConfig';

export type ObstacleType = 'tree_small' | 'tree_medium' | 'tree_large' | 'rock' | 'snowman';

export class Obstacle extends Phaser.GameObjects.Sprite {

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType = 'tree_small') {
    super(scene, x, y, type); // TODO: Use actual texture

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setType(type);
  }

  setType(type: ObstacleType): void {
    // Set display size based on type
    const sizes: Record<ObstacleType, { width: number; height: number }> = {
      tree_small: { width: 80, height: 100 },
      tree_medium: { width: 100, height: 140 },
      tree_large: { width: 140, height: 180 },
      rock: { width: 70, height: 60 },
      snowman: { width: 80, height: 100 }
    };

    const size = sizes[type];
    this.setDisplaySize(size.width, size.height);

    // Placeholder colors
    const colors: Record<ObstacleType, number> = {
      tree_small: 0x228822,
      tree_medium: 0x116611,
      tree_large: 0x004400,
      rock: 0x666666,
      snowman: 0xffffff
    };
    this.setTint(colors[type]);

    // Set hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitbox = HITBOXES[type];
    if (hitbox && 'width' in hitbox) {
      body.setSize(hitbox.width, hitbox.height);
      // Trees: hitbox at base (trunk), others: centered
      if (type.startsWith('tree_')) {
        body.setOffset(
          (size.width - hitbox.width) / 2,
          size.height - hitbox.height - 5
        );
      } else {
        body.setOffset(
          (size.width - hitbox.width) / 2,
          (size.height - hitbox.height) / 2
        );
      }
    }

    this.setData('type', type);
  }

  reset(x: number, y: number, type: ObstacleType): void {
    this.setPosition(x, y);
    this.setType(type);
    this.setActive(true);
    this.setVisible(true);
  }
}
