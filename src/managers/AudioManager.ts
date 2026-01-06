import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;
  private musicEnabled = true;
  private sfxEnabled = true;
  private currentMusic: Phaser.Sound.BaseSound | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.musicEnabled) return;

    this.stopMusic();
    this.currentMusic = this.scene.sound.add(key, { loop: true, volume: 0.5, ...config });
    this.currentMusic.play();
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
    }
  }

  playSFX(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.sfxEnabled) return;
    this.scene.sound.play(key, { volume: 0.7, ...config });
  }

  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  setMusicVolume(volume: number): void {
    if (this.currentMusic && 'volume' in this.currentMusic) {
      (this.currentMusic as Phaser.Sound.WebAudioSound).volume = volume;
    }
  }
}
