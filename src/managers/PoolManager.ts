import Phaser from 'phaser';

export class PoolManager {
  private scene: Phaser.Scene;
  private pools: Map<string, Phaser.GameObjects.Group> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createPool(key: string, classType: typeof Phaser.GameObjects.Sprite, size: number): void {
    const pool = this.scene.add.group({
      classType,
      maxSize: size,
      runChildUpdate: false
    });

    this.pools.set(key, pool);
  }

  acquire<T extends Phaser.GameObjects.Sprite>(key: string, x: number, y: number): T | null {
    const pool = this.pools.get(key);
    if (!pool) return null;

    const obj = pool.getFirstDead(false) as T;
    if (obj) {
      obj.setPosition(x, y);
      obj.setActive(true).setVisible(true);
    }
    return obj;
  }

  release(obj: Phaser.GameObjects.Sprite): void {
    obj.setActive(false).setVisible(false);
    obj.setPosition(-1000, -1000);
  }

  cleanup(cameraY: number, buffer: number = 200): void {
    this.pools.forEach(pool => {
      pool.getChildren().forEach((child) => {
        const obj = child as Phaser.GameObjects.Sprite;
        if (obj.active && obj.y < cameraY - buffer) {
          this.release(obj);
        }
      });
    });
  }

  getPool(key: string): Phaser.GameObjects.Group | undefined {
    return this.pools.get(key);
  }
}
