import Phaser from 'phaser';

type PoolFactory<T> = (scene: Phaser.Scene, x: number, y: number) => T;

export class PoolManager {
  private scene: Phaser.Scene;
  private pools: Map<string, Phaser.GameObjects.Sprite[]> = new Map();
  private factories: Map<string, PoolFactory<Phaser.GameObjects.Sprite>> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createPool<T extends Phaser.GameObjects.Sprite>(
    key: string,
    size: number,
    factory: PoolFactory<T>
  ): void {
    const pool: Phaser.GameObjects.Sprite[] = [];
    this.factories.set(key, factory as PoolFactory<Phaser.GameObjects.Sprite>);

    // Pre-create objects
    for (let i = 0; i < size; i++) {
      const obj = factory(this.scene, -1000, -1000);
      obj.setActive(false).setVisible(false);
      pool.push(obj);
    }

    this.pools.set(key, pool);
  }

  acquire<T extends Phaser.GameObjects.Sprite>(key: string, x: number, y: number): T | null {
    const pool = this.pools.get(key);
    if (!pool) return null;

    // Find first inactive object
    const obj = pool.find(o => !o.active) as T | undefined;
    if (obj) {
      obj.setPosition(x, y);
      obj.setActive(true).setVisible(true);
      return obj;
    }

    // If no inactive object, try to create a new one using factory
    const factory = this.factories.get(key);
    if (factory) {
      const newObj = factory(this.scene, x, y) as T;
      newObj.setActive(true).setVisible(true);
      pool.push(newObj);
      return newObj;
    }

    return null;
  }

  release(obj: Phaser.GameObjects.Sprite): void {
    obj.setActive(false).setVisible(false);
    obj.setPosition(-1000, -1000);
  }

  cleanup(cameraY: number, buffer: number = 200): void {
    this.pools.forEach(pool => {
      pool.forEach(obj => {
        if (obj.active && obj.y < cameraY - buffer) {
          this.release(obj);
        }
      });
    });
  }

  getPool(key: string): Phaser.GameObjects.Sprite[] | undefined {
    return this.pools.get(key);
  }

  getActiveObjects(key: string): Phaser.GameObjects.Sprite[] {
    const pool = this.pools.get(key);
    if (!pool) return [];
    return pool.filter(obj => obj.active);
  }
}
