import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputManager } from '../managers/InputManager';
import { SpawnManager } from '../managers/SpawnManager';
import { BoosterManager } from '../managers/BoosterManager';
import { PoolManager } from '../managers/PoolManager';
import { ScoreManager } from '../managers/ScoreManager';
import { HUD } from '../ui/HUD';
import { Countdown } from '../ui/Countdown';
import { difficulty, getDifficulty } from '../config/difficultyConfig';
import { POOL_SIZES, CAMERA_CONFIG } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
  // Core
  public player!: Player;
  public gameWidth!: number;

  // Managers
  private inputManager!: InputManager;
  private spawnManager!: SpawnManager;
  private boosterManager!: BoosterManager;
  public poolManager!: PoolManager;
  private scoreManager!: ScoreManager;

  // UI
  private hud!: HUD;

  // Background
  private bgTiles: Phaser.GameObjects.TileSprite[] = [];

  // State
  private cameraSpeed = difficulty.speed.initial;
  private isGameOver = false;
  private isCountdownActive = true;

  // Camera horizontal follow
  private targetScrollX = 0;

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

    // Create tiled background
    this.createBackground();

    // Initialize managers
    this.poolManager = new PoolManager(this);
    this.initializePools();

    this.inputManager = new InputManager(this);
    this.spawnManager = new SpawnManager(this);
    this.boosterManager = new BoosterManager(this);
    this.scoreManager = new ScoreManager();

    // Create groups
    this.giftGroup = this.add.group();
    this.obstacleGroup = this.add.group();
    this.boosterGroup = this.add.group();

    // Create player at center of map (not screen)
    this.player = new Player(this, this.gameWidth / 2, this.scale.height * 0.22);

    // Create HUD
    this.hud = new HUD(this);

    // Connect BoosterManager with HUD
    this.boosterManager.setHUD(this.hud);

    // Setup collisions
    this.setupCollisions();

    // Handle resize
    this.scale.on('resize', this.handleResize, this);

    // Initial camera zoom (closer at start)
    this.cameras.main.setZoom(CAMERA_CONFIG.initialZoom);

    // Initialize camera X position centered on player
    this.initializeCameraX();

    // Start countdown
    this.startCountdown();
  }

  private async startCountdown(): Promise<void> {
    this.isCountdownActive = true;
    const countdown = new Countdown(this);
    await countdown.start();
    this.isCountdownActive = false;

    // Camera zoom out after countdown
    this.tweens.add({
      targets: this.cameras.main,
      zoom: CAMERA_CONFIG.gameZoom,
      duration: 800,
      ease: 'Sine.easeOut'
    });
  }

  private createBackground(): void {
    const { width, height } = this.scale;
    // Create multiple tiled backgrounds to cover scrolling area
    // Each tile covers a height of the screen, we create several for scrolling
    const tileHeight = 128;
    const numTiles = Math.ceil(height / tileHeight) + 2;
    
    for (let i = 0; i < numTiles; i++) {
      const tile = this.add.tileSprite(
        width / 2,
        i * tileHeight,
        width,
        tileHeight,
        'bg_tile'
      );
      tile.setScrollFactor(0, 1); // Only scroll vertically with camera
      tile.setDepth(-100); // Behind everything
      this.bgTiles.push(tile);
    }
  }

  // SFX stubs (no-op if audio not loaded)
  private playSfx(key: string): void {
    try {
      if (this.cache.audio.exists(key)) {
        this.sound.play(key, { volume: 0.5 });
      }
    } catch {
      // Audio not available, ignore
    }
  }

  // Haptic feedback stub (no-op without TG SDK)
  private hapticFeedback(type: 'light' | 'medium' | 'heavy'): void {
    // TODO: Integrate with @twa-dev/sdk WebApp.HapticFeedback
    // For now, this is a no-op placeholder
    void type;
  }

  private initializePools(): void {
    // Gift pools
    this.poolManager.createPool('gift_small', POOL_SIZES.gift_small, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'gift_small');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('gift_medium', POOL_SIZES.gift_medium, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'gift_medium');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('gift_large', POOL_SIZES.gift_large, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'gift_large');
      scene.physics.add.existing(sprite);
      return sprite;
    });

    // Obstacle pools
    this.poolManager.createPool('tree_small', POOL_SIZES.tree_small, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'tree_small');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('tree_medium', POOL_SIZES.tree_medium, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'tree_medium');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('tree_large', POOL_SIZES.tree_large, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'tree_large');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('rock', POOL_SIZES.rock, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'rock');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('snowman', POOL_SIZES.snowman, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'snowman');
      scene.physics.add.existing(sprite);
      return sprite;
    });

    // Booster pools
    this.poolManager.createPool('booster_magnet', POOL_SIZES.booster_magnet, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'booster_magnet');
      scene.physics.add.existing(sprite);
      return sprite;
    });
    this.poolManager.createPool('booster_shield', POOL_SIZES.booster_shield, (scene, x, y) => {
      const sprite = scene.add.sprite(x, y, 'booster_shield');
      scene.physics.add.existing(sprite);
      return sprite;
    });
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isCountdownActive) return;

    const dt = delta / 1000;
    const distance = this.scoreManager.getDistance();

    // Update difficulty
    const diff = getDifficulty(distance);
    this.cameraSpeed = diff.speed;

    // Move camera down
    this.cameras.main.scrollY += this.cameraSpeed * dt;
    this.scoreManager.updateDistance(distance + this.cameraSpeed * dt);

    // Update horizontal camera follow
    this.updateCameraX();

    // Keep player in viewport
    this.player.y = this.cameras.main.scrollY + this.scale.height * 0.22;

    // Update systems
    this.player.update(time, delta);
    this.inputManager.update();
    this.spawnManager.update(
      this.cameras.main.scrollY,
      this.scale.height,
      this.scoreManager.getDistance()
    );
    this.boosterManager.update(time, this.player, this.getActiveGifts(), this.getActiveBoosters());

    // Cleanup objects behind camera
    this.poolManager.cleanup(this.cameras.main.scrollY);

    // Update HUD
    this.hud.updateScore(this.scoreManager.getScore());
    this.hud.updateDistance(this.scoreManager.getDistance());
  }

  private resetState(): void {
    this.cameraSpeed = difficulty.speed.initial;
    this.isGameOver = false;
    this.isCountdownActive = true;
    this.cameras.main.scrollY = 0;
    this.scoreManager?.reset();
    this.spawnManager?.reset();
    this.boosterManager?.reset();
  }

  private calculateGameWidth(): void {
    const { width } = this.scale;
    // Map is wider than screen (e.g., 2x) for camera scrolling
    this.gameWidth = width * CAMERA_CONFIG.fieldWidthMultiplier;
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.calculateGameWidth();
    this.hud?.reposition(gameSize.width, gameSize.height);
  }

  // Initialize camera X to center on player at game start
  private initializeCameraX(): void {
    const camera = this.cameras.main;
    const visibleWidth = this.scale.width / camera.zoom;

    // Map bounds: 0 to gameWidth
    const minScrollX = 0;
    const maxScrollX = Math.max(this.gameWidth - visibleWidth, 0);

    // Center on player, clamped to bounds
    const idealScrollX = this.player.x - visibleWidth / 2;
    camera.scrollX = Phaser.Math.Clamp(idealScrollX, minScrollX, maxScrollX);
    this.targetScrollX = camera.scrollX;
  }

  // Horizontal camera follow with deadzone + edge clamping
  // - Player in center 30% = camera doesn't move (deadzone)
  // - Player outside deadzone = camera follows
  // - Map edge reaches screen edge = camera stops, player continues
  private updateCameraX(): void {
    const camera = this.cameras.main;
    const playerX = this.player.x;
    const screenWidth = this.scale.width;
    const visibleWidth = screenWidth / camera.zoom;

    // Deadzone: center 30% of visible area (15% each side)
    const deadzoneHalfWidth = visibleWidth * CAMERA_CONFIG.deadzoneRatio;
    const cameraCenter = camera.scrollX + visibleWidth / 2;

    // Only move camera if player is outside deadzone
    if (playerX < cameraCenter - deadzoneHalfWidth) {
      // Player left of deadzone - move camera left
      this.targetScrollX = playerX - visibleWidth / 2 + deadzoneHalfWidth;
    } else if (playerX > cameraCenter + deadzoneHalfWidth) {
      // Player right of deadzone - move camera right
      this.targetScrollX = playerX - visibleWidth / 2 - deadzoneHalfWidth;
    }

    // Clamp: keep camera within map bounds (0 to gameWidth)
    const minScrollX = 0;
    const maxScrollX = Math.max(this.gameWidth - visibleWidth, 0);

    this.targetScrollX = Phaser.Math.Clamp(this.targetScrollX, minScrollX, maxScrollX);

    // Smooth follow
    camera.scrollX = Phaser.Math.Linear(
      camera.scrollX,
      this.targetScrollX,
      CAMERA_CONFIG.lerpX
    );
  }

  // Public method for Player to get current camera speed
  public getCurrentCameraSpeed(): number {
    return this.cameraSpeed;
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

  private onObstacleHit(_player: Player, obstacle: Phaser.GameObjects.Sprite): void {
    const isGameOver = this.boosterManager.onObstacleHit();

    if (isGameOver) {
      this.playSfx('sfx_crash');
      this.hapticFeedback('heavy');
      this.gameOver();
    } else {
      // Shield absorbed hit - flash player and release obstacle
      this.playSfx('sfx_shield_hit');
      this.hapticFeedback('medium');
      this.player.flash(200);
      this.poolManager.release(obstacle);
    }
  }

  private onGiftCollect(_player: Player, gift: Phaser.GameObjects.Sprite): void {
    const points = (gift.getData('points') as number) || 10;
    const size = gift.getData('size') as string;
    this.scoreManager.addScore(points);
    this.poolManager.release(gift);

    // Play appropriate sound based on gift size
    this.playSfx(`sfx_gift_${size}`);
    this.hapticFeedback('light');
  }

  private onBoosterCollect(_player: Player, booster: Phaser.GameObjects.Sprite): void {
    const type = booster.getData('type') as 'magnet' | 'shield';
    this.boosterManager.activate(type);
    this.poolManager.release(booster);

    this.playSfx(`sfx_${type}_activate`);
    this.hapticFeedback('medium');
  }

  private getActiveGifts(): Phaser.GameObjects.Sprite[] {
    return this.giftGroup.getChildren().filter(
      (g) => (g as Phaser.GameObjects.Sprite).active
    ) as Phaser.GameObjects.Sprite[];
  }

  private getActiveBoosters(): Phaser.GameObjects.Sprite[] {
    return this.boosterGroup.getChildren().filter(
      (b) => (b as Phaser.GameObjects.Sprite).active
    ) as Phaser.GameObjects.Sprite[];
  }

  private gameOver(): void {
    this.isGameOver = true;
    // Check for new high score BEFORE saving (saveHighScore updates highScore)
    const isNewHighScore = this.scoreManager.isNewHighScore();
    this.scoreManager.saveHighScore();
    this.scene.start('GameOverScene', {
      score: this.scoreManager.getScore(),
      distance: this.scoreManager.getDistance(),
      highScore: this.scoreManager.getHighScore(),
      isNewHighScore
    });
  }

  public addScore(points: number): void {
    this.scoreManager.addScore(points);
  }
}
