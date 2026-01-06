import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { HITBOXES, PLAYER_PHYSICS } from '../config/gameConfig';

export class Player extends Phaser.GameObjects.Sprite {
  // Angle-based movement system
  private movementAngle = 0;              // Current angle (radians), 0 = straight down
  private targetAngle = 0;                // Target angle to interpolate to
  private inputDirection = 0;             // -1 | 0 | 1 (input command)

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 'player');

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
    const physics = PLAYER_PHYSICS;

    // 1. Update target angle based on input
    if (this.inputDirection !== 0) {
      // When pressing a direction, increase angle in that direction
      this.targetAngle += this.inputDirection * physics.angleChangeSpeed * dt;
      this.targetAngle = Phaser.Math.Clamp(
        this.targetAngle,
        -physics.maxAngle,
        physics.maxAngle
      );
    }
    // When not pressing, targetAngle stays the same (player continues at angle!)

    // 2. Smooth interpolation to target angle
    this.movementAngle = Phaser.Math.Linear(
      this.movementAngle,
      this.targetAngle,
      physics.angleSmoothness
    );

    // 3. Calculate horizontal speed from angle
    // If camera moves at cameraSpeed, horizontal component = cameraSpeed * tan(angle)
    const cameraSpeed = gameScene.getCurrentCameraSpeed();
    const horizontalSpeed = cameraSpeed * Math.tan(this.movementAngle);

    // 4. Apply horizontal movement
    this.x += horizontalSpeed * dt;

    // 5. Check bounds and reflect angle on wall hit
    const margin = 60;
    const bounds = gameScene.gameWidth || this.scene.scale.width;
    const centerX = this.scene.scale.width / 2;
    const halfWidth = bounds / 2 - margin;
    const minX = centerX - halfWidth;
    const maxX = centerX + halfWidth;

    if (this.x <= minX) {
      this.x = minX + 2; // Small offset to prevent sticking
      // Reflect angle: if going left, now go right
      this.targetAngle = Math.abs(this.targetAngle) * 0.85; // Slight damping on bounce
      this.movementAngle = Math.abs(this.movementAngle) * 0.85;
    } else if (this.x >= maxX) {
      this.x = maxX - 2;
      // Reflect angle: if going right, now go left
      this.targetAngle = -Math.abs(this.targetAngle) * 0.85;
      this.movementAngle = -Math.abs(this.movementAngle) * 0.85;
    }

    // 6. Visual sprite rotation (proportional to movement angle)
    this.rotation = this.movementAngle * physics.visualTiltFactor;
  }

  turnLeft(): void {
    this.inputDirection = -1;
  }

  turnRight(): void {
    this.inputDirection = 1;
  }

  stopTurn(): void {
    this.inputDirection = 0;
    // NOTE: We do NOT reset targetAngle here - player continues at current angle!
  }

  // Reset movement (e.g., on respawn or game restart)
  resetMovement(): void {
    this.movementAngle = 0;
    this.targetAngle = 0;
    this.inputDirection = 0;
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
