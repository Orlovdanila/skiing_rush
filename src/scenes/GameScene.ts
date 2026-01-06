import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputManager } from '../managers/InputManager';
import { SpawnManager } from '../managers/SpawnManager';
import { BoosterManager } from '../managers/BoosterManager';
import { PoolManager } from '../managers/PoolManager';
import { HUD } from '../ui/HUD';
import { difficulty, getDifficulty } from '../config/difficultyConfig';

export class GameScene extends Phaser.Scene {
  // Core
  public player!: Player;
  public gameWidth!: number;

  // Managers
  private inputManager!: InputManager;
  private spawnManager!: SpawnManager;
  private boosterManager!: BoosterManager;
  private poolManager!: PoolManager;

  // UI
  private hud!: HUD;

  // State
  private cameraSpeed = difficulty.speed.initial;
  private distanceTraveled = 0;
  private score = 0;
  private isGameOver = false;

  // Groups
  public giftGroup!: Phaser.GameObjects.Group;
  public obstacleGroup!: Phaser.GameObjects.Group;
  public boosterGroup!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.resetState();
    this.calculateGameWidth();

    // Initialize managers
    this.poolManager = new PoolManager(this);
    this.inputManager = new InputManager(this);
    this.spawnManager = new SpawnManager(this);
    this.boosterManager = new BoosterManager(this);

    // Create groups
    this.giftGroup = this.add.group();
    this.obstacleGroup = this.add.group();
    this.boosterGroup = this.add.group();

    // Create player
    this.player = new Player(this, this.scale.width / 2, this.scale.height * 0.7);

    // Create HUD
    this.hud = new HUD(this);

    // Setup collisions
    this.setupCollisions();

    // Handle resize
    this.scale.on('resize', this.handleResize, this);
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;

    const dt = delta / 1000;

    // Update difficulty
    const diff = getDifficulty(this.distanceTraveled);
    this.cameraSpeed = diff.speed;

    // Move camera down
    this.cameras.main.scrollY += this.cameraSpeed * dt;
    this.distanceTraveled += this.cameraSpeed * dt;

    // Keep player in viewport
    this.player.y = this.cameras.main.scrollY + this.scale.height * 0.7;

    // Update systems
    this.player.update(time, delta);
    this.inputManager.update();
    this.spawnManager.update(
      this.cameras.main.scrollY,
      this.scale.height,
      this.distanceTraveled
    );
    this.boosterManager.update(time, this.player, this.getActiveGifts());

    // Cleanup objects behind camera
    this.poolManager.cleanup(this.cameras.main.scrollY);

    // Update HUD
    this.hud.updateScore(this.score);
    this.hud.updateDistance(Math.floor(this.distanceTraveled));
  }

  private resetState(): void {
    this.cameraSpeed = difficulty.speed.initial;
    this.distanceTraveled = 0;
    this.score = 0;
    this.isGameOver = false;
    this.cameras.main.scrollY = 0;
  }

  private calculateGameWidth(): void {
    const { width, height } = this.scale;
    const isPortrait = height > width;
    this.gameWidth = isPortrait ? width : width * 0.6;
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.calculateGameWidth();
    this.hud?.reposition(gameSize.width, gameSize.height);
  }

  private setupCollisions(): void {
    // Player vs Obstacles
    this.physics.add.overlap(
      this.player,
      this.obstacleGroup,
      this.onObstacleHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player vs Gifts
    this.physics.add.overlap(
      this.player,
      this.giftGroup,
      this.onGiftCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player vs Boosters
    this.physics.add.overlap(
      this.player,
      this.boosterGroup,
      this.onBoosterCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private onObstacleHit(player: Player, obstacle: Phaser.GameObjects.Sprite): void {
    const isGameOver = this.boosterManager.onObstacleHit();

    if (isGameOver) {
      this.gameOver();
    } else {
      // Shield absorbed hit
      this.poolManager.release(obstacle);
    }
  }

  private onGiftCollect(player: Player, gift: Phaser.GameObjects.Sprite): void {
    const points = (gift.getData('points') as number) || 10;
    this.score += points;
    this.poolManager.release(gift);

    // TODO: Play sound, haptic feedback
  }

  private onBoosterCollect(player: Player, booster: Phaser.GameObjects.Sprite): void {
    const type = booster.getData('type') as 'magnet' | 'shield';
    this.boosterManager.activate(type);
    this.poolManager.release(booster);

    // TODO: Play sound, haptic feedback
  }

  private getActiveGifts(): Phaser.GameObjects.Sprite[] {
    return this.giftGroup.getChildren().filter(
      (g) => (g as Phaser.GameObjects.Sprite).active
    ) as Phaser.GameObjects.Sprite[];
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.scene.start('GameOverScene', {
      score: this.score,
      distance: Math.floor(this.distanceTraveled)
    });
  }

  public addScore(points: number): void {
    this.score += points;
  }
}
