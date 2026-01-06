import Phaser from 'phaser';

interface GameOverData {
  score: number;
  distance: number;
}

export class GameOverScene extends Phaser.Scene {
  private score = 0;
  private distance = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.score = data.score || 0;
    this.distance = data.distance || 0;
  }

  create(): void {
    const { width, height } = this.scale;

    // Game Over text
    this.add.text(width / 2, height * 0.25, 'GAME OVER', {
      font: 'bold 48px Arial',
      color: '#ff4444'
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.4, `Score: ${this.score}`, {
      font: 'bold 36px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Distance
    this.add.text(width / 2, height * 0.48, `Distance: ${this.distance}m`, {
      font: '24px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Restart button
    const restartBtn = this.add.rectangle(width / 2, height * 0.65, 220, 60, 0x00aa00)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.65, 'PLAY AGAIN', {
      font: 'bold 24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x00cc00));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x00aa00));
    restartBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // Menu button
    const menuBtn = this.add.rectangle(width / 2, height * 0.78, 220, 60, 0x666666)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.78, 'MENU', {
      font: 'bold 24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x888888));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x666666));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // TODO: Submit score to leaderboard
    // TODO: Show leaderboard position
  }
}
