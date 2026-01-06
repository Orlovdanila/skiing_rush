import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class InputManager {
  private scene: GameScene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchStartX: number | null = null;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
    }
  }

  private setupTouch(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.handleTouchPosition(pointer.x);
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.handleTouchPosition(pointer.x);
      }
    });

    this.scene.input.on('pointerup', () => {
      this.touchStartX = null;
      this.scene.player.stopTurn();
    });
  }

  private handleTouchPosition(x: number): void {
    const centerX = this.scene.scale.width / 2;
    const deadzone = 50;

    if (x < centerX - deadzone) {
      this.scene.player.turnLeft();
    } else if (x > centerX + deadzone) {
      this.scene.player.turnRight();
    } else {
      this.scene.player.stopTurn();
    }
  }

  update(): void {
    if (!this.cursors) return;

    if (this.cursors.left.isDown) {
      this.scene.player.turnLeft();
    } else if (this.cursors.right.isDown) {
      this.scene.player.turnRight();
    } else if (this.touchStartX === null) {
      this.scene.player.stopTurn();
    }
  }
}
