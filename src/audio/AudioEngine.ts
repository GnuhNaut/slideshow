// Cinematic Wedding Audio Engine with Web Audio Synthesizer and custom MP3 support

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private isSynthPlaying: boolean = false;
  private synthGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private customAudio: HTMLAudioElement | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private timer: number | null = null;

  constructor() {
    // Lazy AudioContext on first interaction
  }

  public async unlock(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.isUnlocked = true;
      return true;
    } catch (e) {
      console.warn('Audio unlock failed or deferred:', e);
      return false;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.synthGain && this.ctx) {
      this.synthGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.volume);
  }

  public play(customUrl?: string) {
    if (customUrl) {
      this.playCustomTrack(customUrl);
    } else {
      this.playCinematicSynthMusic();
    }
  }

  public pause() {
    this.stopSynthMusic();
    if (this.customAudio && !this.customAudio.paused) {
      this.customAudio.pause();
    }
  }

  public seek(seconds: number) {
    if (this.customAudio) {
      try {
        this.customAudio.currentTime = seconds % (this.customAudio.duration || 1);
      } catch {
        // Ignore seek error if not ready
      }
    }
  }

  private playCustomTrack(url: string) {
    this.stopSynthMusic();
    if (!this.customAudio) {
      this.customAudio = new Audio();
      this.customAudio.loop = true;
    }
    if (this.customAudio.src !== url) {
      this.customAudio.src = url;
    }
    this.customAudio.volume = this.isMuted ? 0 : this.volume;
    this.customAudio.play().catch((err) => {
      console.warn('Autoplay blocked, user interaction required:', err);
    });
  }

  // Generates a warm, romantic, cinematic ambient arpeggio chord progression (Pachelbel / Debussy inspired)
  private playCinematicSynthMusic() {
    if (this.isSynthPlaying || !this.isUnlocked) return;
    if (!this.ctx) return;

    this.isSynthPlaying = true;
    const ctx = this.ctx;

    // Master Synth Gain
    this.synthGain = ctx.createGain();
    this.synthGain.gain.setValueAtTime(0, ctx.currentTime);
    this.synthGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume * 0.25, ctx.currentTime + 3);
    this.synthGain.connect(ctx.destination);

    // Warm chord frequencies: D major / B minor romantic wedding progression
    // D3, F#3, A3, D4, E4, F#4, A4
    const chords = [
      [146.83, 220.0, 277.18, 369.99], // D maj
      [110.0, 164.81, 220.0, 329.63],  // A maj
      [123.47, 185.0, 246.94, 369.99], // B min
      [98.0, 146.83, 196.0, 293.66],   // G maj
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      if (!this.isSynthPlaying || !this.ctx || !this.synthGain) return;
      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Warm triangle / sine hybrid
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.08 / notes.length, ctx.currentTime + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.synthGain!);

        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + 4.0);
        this.activeOscillators.push(osc);
      });

      this.timer = window.setTimeout(playChordStep, 4000);
    };

    playChordStep();
  }

  private stopSynthMusic() {
    this.isSynthPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.synthGain && this.ctx) {
      try {
        this.synthGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      } catch {
        // Context might be closed
      }
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators = [];
  }
}

export const audioEngine = new CinematicAudioEngine();
