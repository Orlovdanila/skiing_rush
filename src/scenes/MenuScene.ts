import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height * 0.3, 'SNOW RUSH', {
      font: 'bold 64px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.38, '2026', {
      font: 'bold 32px Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Play button
    const playBtn = this.add.rectangle(width / 2, height * 0.55, 200, 60, 0x00aa00)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.55, 'PLAY', {
      font: 'bold 28px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    playBtn.on('pointerover', () => playBtn.setFillStyle(0x00cc00));
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x00aa00));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // Leaderboard button
    const lbBtn = this.add.rectangle(width / 2, height * 0.68, 200, 60, 0x0066aa)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.68, 'LEADERBOARD', {
      font: 'bold 20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    lbBtn.on('pointerover', () => lbBtn.setFillStyle(0x0088cc));
    lbBtn.on('pointerout', () => lbBtn.setFillStyle(0x0066aa));
    // TODO: lbBtn.on('pointerdown', () => show leaderboard);

    // Handle resize
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    // Reposition elements on resize
  }
}
