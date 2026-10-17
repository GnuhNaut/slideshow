// High-Performance Master Playback Clock decoupled from React re-renders

export type PlaybackStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'FINAL_HOLD';

export interface ClockState {
  currentTime: number;
  totalDuration: number;
  status: PlaybackStatus;
  playbackSpeed: number;
}

type FrameListener = (time: number, state: ClockState) => void;
type StatusListener = (status: PlaybackStatus) => void;
type ThrottledTimeListener = (time: number, totalDuration: number) => void;
type SeekListener = (time: number) => void;

class MasterPlaybackClock {
  private currentTime: number = 0;
  private totalDuration: number = 0;
  private status: PlaybackStatus = 'IDLE';
  private playbackSpeed: number = 1.0;

  private rafId: number | null = null;
  private lastTimestamp: number = 0;

  private frameListeners: Set<FrameListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private throttledListeners: Set<ThrottledTimeListener> = new Set();
  private seekListeners: Set<SeekListener> = new Set();

  private lastThrottleTime: number = 0;
  private throttleIntervalMs: number = 100; // 10Hz updates for UI timecode

  public init(totalDuration: number, initialTime: number = 0) {
    this.totalDuration = Math.max(0, totalDuration);
    this.currentTime = Math.max(0, Math.min(initialTime, this.totalDuration));
    this.emitThrottled();
  }

  public setTotalDuration(duration: number) {
    this.totalDuration = Math.max(0, duration);
    if (this.currentTime > this.totalDuration && this.status !== 'FINAL_HOLD') {
      this.currentTime = this.totalDuration;
    }
    this.emitThrottled();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getTotalDuration(): number {
    return this.totalDuration;
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public isPlaying(): boolean {
    return this.status === 'PLAYING';
  }

  public isFinalHold(): boolean {
    return this.status === 'FINAL_HOLD';
  }

  public play() {
    if (this.status === 'FINAL_HOLD') {
      // If restarting from final hold, seek to 0
      this.seek(0);
    }

    if (this.status === 'PLAYING') return;

    this.status = 'PLAYING';
    this.lastTimestamp = performance.now();
    this.emitStatus();
    this.startLoop();
  }

  public pause() {
    if (this.status !== 'PLAYING') return;
    this.status = 'PAUSED';
    this.stopLoop();
    this.emitStatus();
  }

  public togglePlay() {
    if (this.status === 'PLAYING') {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.totalDuration));
    this.currentTime = clamped;

    if (this.status === 'FINAL_HOLD' && clamped < this.totalDuration) {
      this.status = 'PAUSED';
      this.emitStatus();
    }

    // Immediately notify frame listeners
    this.emitFrame();
    this.emitThrottled();
    this.emitSeek();
  }

  public setSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.25, Math.min(3.0, speed));
  }

  public enterFinalHold() {
    this.status = 'FINAL_HOLD';
    this.currentTime = this.totalDuration;
    this.stopLoop();
    this.emitFrame();
    this.emitStatus();
    this.emitThrottled();
  }

  // Subscribe to raw 60 FPS animation frame ticks (used by Canvas / Filmstrip / GSAP)
  public onFrame(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    // Send immediate initial frame
    listener(this.currentTime, this.getState());
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  // Subscribe to throttled UI updates (for timecode text, scrubber bars)
  public onThrottledTime(listener: ThrottledTimeListener): () => void {
    this.throttledListeners.add(listener);
    listener(this.currentTime, this.totalDuration);
    return () => {
      this.throttledListeners.delete(listener);
    };
  }

  // Subscribe to status changes (PLAYING, PAUSED, FINAL_HOLD)
  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  // Subscribe to explicit timeline jumps so audio and other time-based systems
  // stay aligned no matter whether the seek came from the HUD, hotkeys or remote.
  public onSeek(listener: SeekListener): () => void {
    this.seekListeners.add(listener);
    return () => {
      this.seekListeners.delete(listener);
    };
  }

  public resume() {
    this.play();
  }

  private startLoop() {
    const cancelFrame = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout;
    const requestFrame =
      typeof requestAnimationFrame !== 'undefined'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;

    if (this.rafId) cancelFrame(this.rafId);
    this.lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const loop = (now: number) => {
      if (this.status !== 'PLAYING') return;

      const deltaSec = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;

      // Advance time
      this.currentTime += deltaSec * this.playbackSpeed;

      // Check if film has reached the end
      if (this.currentTime >= this.totalDuration) {
        this.enterFinalHold();
        return;
      }

      this.emitFrame();

      // Throttled UI tick
      if (now - this.lastThrottleTime >= this.throttleIntervalMs) {
        this.lastThrottleTime = now;
        this.emitThrottled();
      }

      this.rafId = requestFrame(loop);
    };

    this.rafId = requestFrame(loop);
  }

  private stopLoop() {
    if (this.rafId) {
      const cancelFrame = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout;
      cancelFrame(this.rafId);
      this.rafId = null;
    }
  }

  private emitFrame() {
    const state = this.getState();
    this.frameListeners.forEach((listener) => {
      try {
        listener(this.currentTime, state);
      } catch (err) {
        console.error('Frame listener error:', err);
      }
    });
  }

  private emitStatus() {
    this.statusListeners.forEach((listener) => {
      try {
        listener(this.status);
      } catch (err) {
        console.error('Status listener error:', err);
      }
    });
  }

  private emitThrottled() {
    this.throttledListeners.forEach((listener) => {
      try {
        listener(this.currentTime, this.totalDuration);
      } catch (err) {
        console.error('Throttled listener error:', err);
      }
    });
  }

  private emitSeek() {
    this.seekListeners.forEach((listener) => {
      try {
        listener(this.currentTime);
      } catch (err) {
        console.error('Seek listener error:', err);
      }
    });
  }

  public getState(): ClockState {
    return {
      currentTime: this.currentTime,
      totalDuration: this.totalDuration,
      status: this.status,
      playbackSpeed: this.playbackSpeed,
    };
  }

  public destroy() {
    this.stopLoop();
    this.frameListeners.clear();
    this.statusListeners.clear();
    this.throttledListeners.clear();
    this.seekListeners.clear();
  }
}

export const masterClock = new MasterPlaybackClock();
