export class ScoreManager {
  private score = 0;
  private distance = 0;
  private highScore = 0;

  constructor() {
    this.loadHighScore();
  }

  addScore(points: number): void {
    this.score += points;
  }

  updateDistance(dist: number): void {
    this.distance = dist;
  }

  getScore(): number {
    return this.score;
  }

  getDistance(): number {
    return Math.floor(this.distance);
  }

  getHighScore(): number {
    return this.highScore;
  }

  isNewHighScore(): boolean {
    return this.score > this.highScore;
  }

  reset(): void {
    this.score = 0;
    this.distance = 0;
  }

  saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('snow_rush_high_score', String(this.highScore));
      } catch {
        // localStorage not available
      }
    }
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem('snow_rush_high_score');
      this.highScore = saved ? parseInt(saved, 10) : 0;
    } catch {
      this.highScore = 0;
    }
  }
}
