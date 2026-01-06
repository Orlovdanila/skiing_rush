import Phaser from 'phaser';

export class Countdown {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private countdownText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    const { width, height } = this.scene.scale;

    this.countdownText = this.scene.add.text(width / 2, height / 2, '', {
      fontFamily: 'Arial',
      fontSize: '128px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.container = this.scene.add.container(0, 0, [this.countdownText]);
  }

  async start(): Promise<void> {
    const steps = ['3', '2', '1', 'GO!'];
    
    for (const step of steps) {
      await this.showStep(step);
    }

    this.container.destroy();
  }

  private showStep(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.countdownText.setText(text);
      this.countdownText.setScale(0.5);
      this.countdownText.setAlpha(1);

      this.scene.tweens.add({
        targets: this.countdownText,
        scale: 1.2,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }
}
