import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Progress bar
    const width = this.scale.width;
    const height = this.scale.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  create(): void {
    this.generatePlaceholderTextures();
    this.scene.start('MenuScene');
  }

  private generatePlaceholderTextures(): void {
<<<<<<< Current (Your changes)
    // Player - green rectangle 80x100
    const playerGfx = this.make.graphics({});
    playerGfx.fillStyle(0x00ff00);
    playerGfx.fillRoundedRect(0, 0, 80, 100, 8);
    playerGfx.generateTexture('player', 80, 100);
    playerGfx.destroy();

    // Gift - yellow square 64x64 (base texture, tint changes color)
    const giftGfx = this.make.graphics({});
    giftGfx.fillStyle(0xffffff);
    giftGfx.fillRoundedRect(0, 0, 64, 64, 6);
    giftGfx.lineStyle(3, 0xcc0000);
    // Ribbon horizontal
    giftGfx.strokeRect(0, 28, 64, 8);
    // Ribbon vertical
    giftGfx.strokeRect(28, 0, 8, 64);
    giftGfx.generateTexture('gift', 64, 64);
    giftGfx.destroy();

    // Obstacle - green rectangle 100x140 (base texture for trees)
    const obstacleGfx = this.make.graphics({});
    obstacleGfx.fillStyle(0xffffff);
    // Tree shape - triangle on top of rectangle
    obstacleGfx.fillTriangle(50, 0, 0, 100, 100, 100);
    obstacleGfx.fillRect(35, 100, 30, 40);
    obstacleGfx.generateTexture('obstacle', 100, 140);
    obstacleGfx.destroy();

    // Booster - circle 64x64 (base texture)
    const boosterGfx = this.make.graphics({});
    boosterGfx.fillStyle(0xffffff);
    boosterGfx.fillCircle(32, 32, 30);
    boosterGfx.lineStyle(4, 0x000000, 0.3);
    boosterGfx.strokeCircle(32, 32, 30);
    boosterGfx.generateTexture('booster', 64, 64);
    boosterGfx.destroy();

    // Background tile - light blue 128x128 with snowflakes
    const bgGfx = this.make.graphics({});
    bgGfx.fillStyle(0xe8f4fc);
    bgGfx.fillRect(0, 0, 128, 128);
    // Add some "snowflake" dots
    bgGfx.fillStyle(0xffffff, 0.6);
    const snowPositions = [
      [20, 15], [80, 25], [45, 50], [100, 70], [15, 90], [60, 110], [110, 100]
    ];
    for (const [x, y] of snowPositions) {
      bgGfx.fillCircle(x, y, 2);
    }
    bgGfx.generateTexture('bg_tile', 128, 128);
    bgGfx.destroy();
=======
    // Player - green rectangle (skier)
    this.generateRect('player', 80, 100, 0x00cc44);

    // Gifts - different sizes and colors
    this.generateRect('gift_small', 48, 48, 0xffdd00);
    this.generateRect('gift_medium', 64, 64, 0xff8800);
    this.generateRect('gift_large', 80, 80, 0xff0088);
    // Generic gift key for compatibility
    this.generateRect('gift', 64, 64, 0xffdd00);

    // Obstacles - trees (green triangles approximated as rects)
    this.generateTree('tree_small', 80, 100, 0x228822);
    this.generateTree('tree_medium', 100, 140, 0x116611);
    this.generateTree('tree_large', 140, 180, 0x004400);
    // Rock - gray
    this.generateRect('rock', 70, 60, 0x666666);
    // Snowman - white
    this.generateSnowman('snowman', 80, 100);
    // Generic obstacle key
    this.generateTree('obstacle', 100, 140, 0x228822);

    // Boosters
    this.generateCircle('booster_magnet', 64, 0xff00ff);
    this.generateCircle('booster_shield', 64, 0x00ffff);
    // Generic booster key
    this.generateCircle('booster', 64, 0xff00ff);

    // Background tile
    this.generateBgTile('bg_tile', 128, 128);
  }

  private generateRect(key: string, width: number, height: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private generateCircle(key: string, size: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 2);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(size / 2, size / 2, size / 2 - 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private generateTree(key: string, width: number, height: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    // Tree trunk
    const trunkWidth = width * 0.2;
    const trunkHeight = height * 0.25;
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect((width - trunkWidth) / 2, height - trunkHeight, trunkWidth, trunkHeight);
    // Tree body (triangle approximation - 3 stacked trapezoids)
    graphics.fillStyle(color, 1);
    const treeHeight = height * 0.8;
    graphics.fillTriangle(
      width / 2, 0,
      0, treeHeight,
      width, treeHeight
    );
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private generateSnowman(key: string, width: number, height: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    // Bottom circle (largest)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(width / 2, height * 0.75, width * 0.35);
    // Middle circle
    graphics.fillCircle(width / 2, height * 0.45, width * 0.28);
    // Top circle (head)
    graphics.fillCircle(width / 2, height * 0.2, width * 0.2);
    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(width * 0.4, height * 0.17, 3);
    graphics.fillCircle(width * 0.6, height * 0.17, 3);
    // Nose (orange carrot)
    graphics.fillStyle(0xff6600, 1);
    graphics.fillTriangle(
      width / 2, height * 0.2,
      width / 2 + 12, height * 0.22,
      width / 2, height * 0.24
    );
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private generateBgTile(key: string, width: number, height: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    // Light blue background
    graphics.fillStyle(0x87ceeb, 1);
    graphics.fillRect(0, 0, width, height);
    // Add some snowflakes/dots for texture
    graphics.fillStyle(0xffffff, 0.6);
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      graphics.fillCircle(x, y, 2 + Math.random() * 3);
    }
    graphics.generateTexture(key, width, height);
    graphics.destroy();
>>>>>>> Incoming (Background Agent changes)
  }
}
