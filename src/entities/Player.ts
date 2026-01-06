import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { HITBOXES } from '../config/gameConfig';

export class Player extends Phaser.GameObjects.Sprite {
  private velocityX = 0;
  private readonly turnAcceleration = 800;
  private readonly maxHorizontalSpeed = 400;
  private readonly friction = 0.92;
  private targetDirection = 0; // -1 | 0 | 1

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 'player'); // TODO: Use actual texture

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Placeholder graphics until real sprite
    this.setDisplaySize(80, 100);
    this.setTint(0x00ff00);

    // Setup hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(HITBOXES.player.width, HITBOXES.player.height);
    body.setOffset(
      (this.displayWidth - HITBOXES.player.width) / 2,
      (this.displayHeight - HITBOXES.player.height) / 2
    );
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;
    const gameScene = this.scene as GameScene;

    // Apply acceleration
    this.velocityX += this.targetDirection * this.turnAcceleration * dt;

    // Apply friction (creates inertia/arc)
    this.velocityX *= this.friction;

    // Clamp velocity
    this.velocityX = Phaser.Math.Clamp(
      this.velocityX,
      -this.maxHorizontalSpeed,
      this.maxHorizontalSpeed
    );

    // Apply horizontal movement
    this.x += this.velocityX * dt;

    // Rotate sprite based on velocity
    this.rotation = (this.velocityX / this.maxHorizontalSpeed) * 0.25;

    // Clamp to game bounds
    const margin = 60;
    const bounds = gameScene.gameWidth || this.scene.scale.width;
    const centerX = this.scene.scale.width / 2;
    const halfWidth = bounds / 2 - margin;
    this.x = Phaser.Math.Clamp(this.x, centerX - halfWidth, centerX + halfWidth);
  }

  turnLeft(): void {
    this.targetDirection = -1;
  }

  turnRight(): void {
    this.targetDirection = 1;
  }

  stopTurn(): void {
    this.targetDirection = 0;
  }

  flash(duration: number): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: duration / 2,
      yoyo: true,
      repeat: 2
    });
  }
}
