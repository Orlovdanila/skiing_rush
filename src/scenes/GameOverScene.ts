import Phaser from 'phaser';
import { AntiCheat } from '../api/anticheat';

interface GameOverData {
  score: number;
  distance: number;
  highScore?: number;
  isNewHighScore?: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private score = 0;
  private distance = 0;
  private highScore = 0;
  private isNewHighScore = false;
  private submitStatusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.score = data.score || 0;
    this.distance = data.distance || 0;
    this.highScore = data.highScore || 0;
    this.isNewHighScore = data.isNewHighScore || false;
  }

  create(): void {
    const { width, height } = this.scale;

    // Game Over text
    this.add.text(width / 2, height * 0.2, 'GAME OVER', {
      font: 'bold 48px Arial',
      color: '#ff4444'
    }).setOrigin(0.5);

    // New high score indicator
    if (this.isNewHighScore) {
      this.add.text(width / 2, height * 0.28, 'NEW HIGH SCORE!', {
        font: 'bold 24px Arial',
        color: '#ffdd00'
      }).setOrigin(0.5);
    }

    // Score
    this.add.text(width / 2, height * 0.36, `Score: ${this.score}`, {
      font: 'bold 36px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Distance
    this.add.text(width / 2, height * 0.44, `Distance: ${this.distance}m`, {
      font: '24px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // High score
    this.add.text(width / 2, height * 0.52, `Best: ${this.highScore}`, {
      font: '20px Arial',
      color: '#88ff88'
    }).setOrigin(0.5);

    // Submit status text
    this.submitStatusText = this.add.text(width / 2, height * 0.58, '', {
      font: '16px Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Restart button
    const restartBtn = this.add.rectangle(width / 2, height * 0.68, 220, 60, 0x00aa00)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.68, 'PLAY AGAIN', {
      font: 'bold 24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x00cc00));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x00aa00));
    restartBtn.on('pointerdown', () => this.scene.start('GameScene'));

    // Menu button
    const menuBtn = this.add.rectangle(width / 2, height * 0.81, 220, 60, 0x666666)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.81, 'MENU', {
      font: 'bold 24px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x888888));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x666666));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Submit score to leaderboard (stub)
    this.submitScore();
  }

  private async submitScore(): Promise<void> {
    this.submitStatusText.setText('Submitting score...');

    try {
      // Create anticheat data
      const anticheat = new AntiCheat();
      const submission = await anticheat.prepareSubmission(this.score, this.distance);

      // TODO: Replace with real API call when backend is ready
      // For now, simulate successful submission
      await this.mockSubmitToLeaderboard(submission);

      this.submitStatusText.setText('Score submitted!');
      this.submitStatusText.setColor('#88ff88');
    } catch (error) {
      console.error('Failed to submit score:', error);
      this.submitStatusText.setText('Failed to submit score');
      this.submitStatusText.setColor('#ff8888');
    }
  }

  // Mock submission - replace with real API call
  private async mockSubmitToLeaderboard(data: {
    score: number;
    distance: number;
    sessionId: string;
    checksum: string;
    timestamp: number;
  }): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log for debugging
    console.log('Score submission (mock):', data);

    // In production, this would be:
    // const token = getAuthToken();
    // await submitScore(token, data);
  }
}
