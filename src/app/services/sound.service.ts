import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private audioCtx: AudioContext | null = null;
  public enabled = signal<boolean>(true);

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleSound(): boolean {
    const next = !this.enabled();
    this.enabled.set(next);
    if (next) {
      this.playClick();
    }
    return next;
  }

  public playTick(pitchMultiplier: number = 1.0): void {
    if (!this.enabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sharp ratchet peg click
      osc.type = 'triangle';
      const baseFreq = 950 * Math.max(0.6, Math.min(1.8, pitchMultiplier));
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.028);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 1.2, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playLeverPull(): void {
    if (!this.enabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Mechanical ratchet pull (spring stretch)
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const t = now + i * 0.06;
        osc.frequency.setValueAtTime(220 + i * 80, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.04);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      }

      // Final heavy release clunk
      const clunkOsc = ctx.createOscillator();
      const clunkGain = ctx.createGain();
      const releaseTime = now + 0.28;
      clunkOsc.type = 'sine';
      clunkOsc.frequency.setValueAtTime(180, releaseTime);
      clunkOsc.frequency.exponentialRampToValueAtTime(40, releaseTime + 0.15);
      clunkGain.gain.setValueAtTime(0.4, releaseTime);
      clunkGain.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.16);

      clunkOsc.connect(clunkGain);
      clunkGain.connect(ctx.destination);
      clunkOsc.start(releaseTime);
      clunkOsc.stop(releaseTime + 0.18);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playWinFanfare(): void {
    if (!this.enabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Vegas Casino fanfare: bright chord progression followed by coins
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.18 }, // C major
        { freqs: [587.33, 739.99, 880.0], time: 0.2, dur: 0.18 }, // D major
        { freqs: [659.25, 830.61, 987.77], time: 0.4, dur: 0.22 }, // E major
        { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.65, dur: 0.8 }, // Grand G major chord
      ];

      chords.forEach((c) => {
        c.freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = now + c.time;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + c.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + c.dur + 0.05);
        });
      });

      // Shimmering coin drops
      for (let i = 0; i < 8; i++) {
        const coinOsc = ctx.createOscillator();
        const coinGain = ctx.createGain();
        const t = now + 1.1 + i * 0.11;
        coinOsc.type = 'sine';
        coinOsc.frequency.setValueAtTime(2000 + (i % 3) * 600 + Math.random() * 300, t);
        coinGain.gain.setValueAtTime(0.15, t);
        coinGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        coinOsc.connect(coinGain);
        coinGain.connect(ctx.destination);
        coinOsc.start(t);
        coinOsc.stop(t + 0.15);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playClick(): void {
    if (!this.enabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public playEliminate(): void {
    if (!this.enabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }
}
