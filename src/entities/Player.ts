import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { HITBOXES } from '../config/gameConfig';

export class Player extends Phaser.GameObjects.Sprite {
  private velocityX = 0;
  private readonly turnAcceleration = 2000;
  private readonly maxHorizontalSpeed = 700;
  private readonly friction = 0.92;
  private targetDirection = 0; // -1 | 0 | 1

  // Фазовая модуляция для эффекта "слалом-качания"
  private turnPhase = 0; // 0..1, фаза текущего поворота
  private lastDirection = 0; // предыдущее направление
  private readonly phaseSpeed = 3; // скорость накопления фазы (сек^-1)

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 'player'); // TODO: Use actual texture

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Placeholder graphics until real sprite
    this.setDisplaySize(60, 75);
    this.setTint(0x00ff00);

    // Setup hitbox
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(HITBOXES.player.width, HITBOXES.player.height);
    body.setOffset(
      (this.displayWidth - HITBOXES.player.width) / 2,
      (this.displayHeight - HITBOXES.player.height) / 2
    );
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const gameScene = this.scene as GameScene;

    // Детект смены направления → сброс фазы
    if (
      this.targetDirection !== 0 &&
      this.targetDirection !== this.lastDirection
    ) {
      this.turnPhase = 0;
    }
    this.lastDirection = this.targetDirection;

    // Накопление фазы при активном повороте
    if (this.targetDirection !== 0) {
      this.turnPhase = Math.min(1, this.turnPhase + this.phaseSpeed * dt);
    }

    // S-образный модификатор (средний эффект)
    // sin(0) = 0, sin(π/2) = 1, sin(π) = 0
    // Ремаппим: 0.7 + 0.6 * sin(phase * π) → от 0.7 до 1.3
    const phaseMultiplier = 0.7 + 0.6 * Math.sin(this.turnPhase * Math.PI);

    // Apply acceleration with phase modulation
    this.velocityX +=
      this.targetDirection * this.turnAcceleration * phaseMultiplier * dt;

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
