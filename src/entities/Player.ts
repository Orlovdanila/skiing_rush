import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { HITBOXES, PLAYER_PHYSICS, BOUNDARY_CONFIG } from '../config/gameConfig';

export class Player extends Phaser.GameObjects.Sprite {
  // Angle-based movement system (direct angle change for sharp arcs)
  private movementAngle = 0;              // Current angle (radians), 0 = straight down
  private inputDirection = 0;             // -1 | 0 | 1 (input command)

  // Boundary collision cooldown (prevents oscillation dampening when holding toward wall)
  private boundaryCooldown = 0;           // Time remaining until input unblocked (ms)
  private lastBoundaryHitDirection = 0;   // -1 = hit left, 1 = hit right, 0 = none

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

    // 0. Update boundary cooldown
    if (this.boundaryCooldown > 0) {
      this.boundaryCooldown -= delta;
      if (this.boundaryCooldown <= 0) {
        this.boundaryCooldown = 0;
        this.lastBoundaryHitDirection = 0;
      }
    }

    // 1. Get effective input direction (blocked toward boundary during cooldown)
    let effectiveInput = this.inputDirection;
    if (this.boundaryCooldown > 0 && this.inputDirection === this.lastBoundaryHitDirection) {
      // Block input toward the boundary we just hit
      effectiveInput = 0;
    }

    // 2. Update angle with ease-out (fast start, slow at max angle = arc feel)
    if (effectiveInput !== 0) {
      // Target angle = max in input direction
      const targetAngle = effectiveInput * physics.maxAngle;
      // How far from target (0 = at target, 2*maxAngle = opposite side)
      const remainingAngle = Math.abs(targetAngle - this.movementAngle);
      const normalizedRemaining = remainingAngle / (2 * physics.maxAngle);
      
      // Ease-out: fast at start, slow near max
      // minSpeedFactor prevents complete stop at max angle
      const minFactor = physics.minSpeedFactor ?? 0.2;
      const speedFactor = minFactor + (1 - minFactor) * normalizedRemaining;
      const actualSpeed = physics.angleChangeSpeed * speedFactor;
      
      this.movementAngle += effectiveInput * actualSpeed * dt;
      this.movementAngle = Phaser.Math.Clamp(
        this.movementAngle,
        -physics.maxAngle,
        physics.maxAngle
      );
    }
    // When not pressing - angle stays fixed (linear movement at current angle)

    // 3. Calculate horizontal speed from angle
    const cameraSpeed = gameScene.getCurrentCameraSpeed();
    const speedFactor = physics.horizontalSpeedFactor ?? 1;
    const horizontalSpeed = cameraSpeed * Math.tan(this.movementAngle) * speedFactor;

    // 4. Apply horizontal movement
    this.x += horizontalSpeed * dt;

    // 5. Clamp to VISIBLE screen bounds (intersection of camera view and map)
    const camera = this.scene.cameras.main;
    const visibleWidth = this.scene.scale.width / camera.zoom;
    
    // Dynamic margin based on fence asset width (scaled to current screen)
    const scale = this.scene.scale.width / BOUNDARY_CONFIG.baseWidth;
    const margin = (BOUNDARY_CONFIG.fenceWidth + BOUNDARY_CONFIG.playerMargin) * scale;

    // Screen bounds in world coordinates
    const screenLeft = camera.scrollX;
    const screenRight = camera.scrollX + visibleWidth;

    // Map bounds: 0 to gameWidth
    const mapLeft = 0;
    const mapRight = gameScene.gameWidth;

    // Final bounds = intersection of screen and map
    const minX = Math.max(screenLeft + margin, mapLeft + margin);
    const maxX = Math.min(screenRight - margin, mapRight - margin);

    // 6. Bounce off boundaries (reflect movement angle like a bumper)
    if (this.x < minX) {
      this.x = minX;
      this.movementAngle = -this.movementAngle * 0.7; // Reflect with damping
      // Set cooldown to block input toward left boundary
      this.boundaryCooldown = physics.boundaryCooldownTime;
      this.lastBoundaryHitDirection = -1;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.movementAngle = -this.movementAngle * 0.7; // Reflect with damping
      // Set cooldown to block input toward right boundary
      this.boundaryCooldown = physics.boundaryCooldownTime;
      this.lastBoundaryHitDirection = 1;
    }

    // 7. Visual sprite rotation (proportional to movement angle)
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
    // Angle stays fixed - player continues linear movement at current angle
  }

  // Reset movement (e.g., on respawn or game restart)
  resetMovement(): void {
    this.movementAngle = 0;
    this.inputDirection = 0;
    this.boundaryCooldown = 0;
    this.lastBoundaryHitDirection = 0;
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
