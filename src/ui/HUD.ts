import Phaser from 'phaser';

export class HUD extends Phaser.GameObjects.Container {
  private scoreText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private magnetIcon!: Phaser.GameObjects.Rectangle;
  private magnetTimer!: Phaser.GameObjects.Text;
  private shieldIcon!: Phaser.GameObjects.Rectangle;
  private shieldHits!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.createElements();
    this.reposition(scene.scale.width, scene.scale.height);
  }

  private createElements(): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    };

    // Score
    this.scoreText = this.scene.add.text(0, 0, '0', {
      ...textStyle,
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Distance
    this.distanceText = this.scene.add.text(0, 0, '0m', textStyle).setOrigin(0.5, 0);

    // Magnet indicator
    this.magnetIcon = this.scene.add.rectangle(0, 0, 40, 40, 0xff00ff);
    this.magnetTimer = this.scene.add.text(0, 0, '0s', textStyle);
    this.magnetIcon.setVisible(false);
    this.magnetTimer.setVisible(false);

    // Shield indicator
    this.shieldIcon = this.scene.add.rectangle(0, 0, 40, 40, 0x00ffff);
    this.shieldHits = this.scene.add.text(0, 0, '×3', textStyle);
    this.shieldIcon.setVisible(false);
    this.shieldHits.setVisible(false);

    this.add([
      this.scoreText,
      this.distanceText,
      this.magnetIcon,
      this.magnetTimer,
      this.shieldIcon,
      this.shieldHits
    ]);
  }

  reposition(width: number, _height: number): void {
    const padding = 20;
    const safeTop = 50;

    // Score - top center
    this.scoreText.setPosition(width / 2, safeTop);

    // Distance - below score
    this.distanceText.setPosition(width / 2, safeTop + 40);

    // Magnet - top left
    this.magnetIcon.setPosition(padding + 20, safeTop + 80);
    this.magnetTimer.setPosition(padding + 50, safeTop + 70);

    // Shield - top right
    this.shieldIcon.setPosition(width - padding - 60, safeTop + 80);
    this.shieldHits.setPosition(width - padding - 30, safeTop + 70);
  }

  updateScore(score: number): void {
    this.scoreText.setText(String(score));
  }

  updateDistance(distance: number): void {
    this.distanceText.setText(`${distance}m`);
  }

  showMagnetTimer(ms: number): void {
    this.magnetIcon.setVisible(true);
    this.magnetTimer.setVisible(true);
    this.updateMagnetTimer(ms);
  }

  updateMagnetTimer(ms: number): void {
    const seconds = Math.ceil(ms / 1000);
    this.magnetTimer.setText(`${seconds}s`);

    if (seconds > 3) {
      this.magnetTimer.setColor('#00ff00');
    } else if (seconds > 1) {
      this.magnetTimer.setColor('#ffff00');
    } else {
      this.magnetTimer.setColor('#ff0000');
    }
  }

  hideMagnetTimer(): void {
    this.magnetIcon.setVisible(false);
    this.magnetTimer.setVisible(false);
  }

  showShieldHits(hits: number): void {
    this.shieldIcon.setVisible(true);
    this.shieldHits.setVisible(true);
    this.shieldHits.setText(`×${hits}`);

    const colors: Record<number, string> = { 3: '#00ff00', 2: '#ffff00', 1: '#ff0000' };
    this.shieldHits.setColor(colors[hits] || '#ffffff');
  }

  hideShield(): void {
    this.shieldIcon.setVisible(false);
    this.shieldHits.setVisible(false);
  }
}
