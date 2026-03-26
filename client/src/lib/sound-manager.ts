/**
 * Sound Manager - مدير الأصوات والتأثيرات الصوتية
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundsEnabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    }
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.soundsEnabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Error playing tone:', e);
    }
  }

  playMoveSound(): void {
    this.playTone(800, 0.1, 0.2);
  }

  playCaptureSound(): void {
    this.playTone(1000, 0.15, 0.3);
    setTimeout(() => this.playTone(800, 0.1, 0.2), 100);
  }

  playCheckSound(): void {
    this.playTone(1200, 0.2, 0.4);
    setTimeout(() => this.playTone(1000, 0.2, 0.3), 150);
  }

  playCheckmateSound(): void {
    this.playTone(1500, 0.3, 0.5);
    setTimeout(() => this.playTone(1200, 0.3, 0.4), 200);
    setTimeout(() => this.playTone(1000, 0.4, 0.3), 400);
  }

  playInvalidMoveSound(): void {
    this.playTone(400, 0.2, 0.2);
  }

  playStalemateSound(): void {
    this.playTone(600, 0.3, 0.3);
    setTimeout(() => this.playTone(700, 0.3, 0.3), 200);
  }

  toggleSound(enabled: boolean): void {
    this.soundsEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundsEnabled;
  }
}

export const soundManager = new SoundManager();
