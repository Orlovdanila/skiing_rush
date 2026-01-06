import Phaser from 'phaser';
import { HITBOXES, GIFT_POINTS } from '../config/gameConfig';

export type GiftSize = 'small' | 'medium' | 'large';

export class Gift extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, size: GiftSize = 'small') {
    super(scene, x, y, `gift_${size}`); // TODO: Use actual texture

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setGiftSize(size);
  }

  setGiftSize(size: GiftSize): void {

    // Set display size based on type
    const sizes = { small: 48, medium: 64, large: 80 };
    const displaySize = sizes[size];
    this.setDisplaySize(displaySize, displaySize);

    // Placeholder colors
    const colors = { small: 0xffff00, medium: 0xff8800, large: 0xff0088 };
    this.setTint(colors[size]);

    // Set hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitbox = HITBOXES[`gift_${size}`];
    if (hitbox && 'radius' in hitbox) {
      body.setCircle(hitbox.radius);
      body.setOffset(
        (displaySize - hitbox.radius * 2) / 2,
        (displaySize - hitbox.radius * 2) / 2
      );
    }

    // Store points value
    this.setData('points', GIFT_POINTS[size]);
    this.setData('size', size);
  }

  reset(x: number, y: number, size: GiftSize): void {
    this.setPosition(x, y);
    this.setGiftSize(size);
    this.setActive(true);
    this.setVisible(true);
  }
}
