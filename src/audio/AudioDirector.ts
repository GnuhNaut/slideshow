// AudioDirector: Dual-Mode Cinematic Wedding Audio Engine
// Manages Global Soundtrack vs Per-Chapter Dedicated Tracks with Seamless Crossfading

import { WeddingProject, AudioTrack, ChapterConfig } from '../types/project';
import { CompiledTimeline } from '../types/timeline';
import { masterClock, PlaybackStatus } from '../player/PlaybackClock';
import { audioEngine } from './AudioEngine';

export interface AudioPlaybackState {
  mode: 'global' | 'per_chapter';
  activeTrack: AudioTrack | null;
  activeChapterIndex: number;
  isCrossfading: boolean;
  crossfadeProgress: number;
  volume: number;
  isMuted: boolean;
}

type AudioStateListener = (state: AudioPlaybackState) => void;

class AudioDirectorEngine {
  private project: WeddingProject | null = null;
  private timeline: CompiledTimeline | null = null;

  // Dual-channel audio elements for seamless crossfading without memory leaks
  private channelA: HTMLAudioElement | null = null;
  private channelB: HTMLAudioElement | null = null;
  private activeChannel: 'A' | 'B' = 'A';

  private currentTrackId: string | null = null;
  private currentChapterIndex: number = -1;
  private isCrossfading: boolean = false;
  private crossfadeTimer: number | null = null;

  private volume: number = 0.85;
  private isMuted: boolean = false;
  private listeners: Set<AudioStateListener> = new Set();

  private unsubClockStatus: (() => void) | null = null;
  private unsubClockFrame: (() => void) | null = null;

  constructor() {
    this.initChannels();
    this.initClock();
  }

  private initChannels() {
    if (typeof window === 'undefined') return;

    this.channelA = new Audio();
    this.channelA.preload = 'auto';

    this.channelB = new Audio();
    this.channelB.preload = 'auto';

    // Global volume error guards
    const onEnded = () => {
      this.handleTrackEnded();
    };
    this.channelA.addEventListener('ended', onEnded);
    this.channelB.addEventListener('ended', onEnded);
  }

  private initClock() {
    this.unsubClockStatus = masterClock.onStatusChange((status) => {
      this.handleStatusChange(status);
    });

    this.unsubClockFrame = masterClock.onFrame((currentTime) => {
      this.handleFrameTick(currentTime);
    });
  }

  public setProject(project: WeddingProject, timeline: CompiledTimeline) {
    this.project = project;
    this.timeline = timeline;
    this.volume = this.project.audioTracks[0]?.volume ?? 0.85;
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): AudioPlaybackState {
    const activeTrack = this.getActiveTrack();
    return {
      mode: this.project?.globalSettings.audioMode || 'global',
      activeTrack,
      activeChapterIndex: this.currentChapterIndex,
      isCrossfading: this.isCrossfading,
      crossfadeProgress: 0,
      volume: this.volume,
      isMuted: this.isMuted,
    };
  }

  public getActiveTrack(): AudioTrack | null {
    if (!this.project) return null;
    const mode = this.project.globalSettings.audioMode || 'global';

    if (mode === 'global') {
      return (
        this.project.audioTracks.find((t) => t.isGlobal) ||
        this.project.audioTracks[0] ||
        null
      );
    }

    // Per-chapter mode
    if (this.currentChapterIndex < 1) return null;
    const chapter = this.project.chapters.find(
      (c) => c.chapterIndex === this.currentChapterIndex
    );
    if (!chapter) return null;

    if (chapter.musicTrackId) {
      return this.project.audioTracks.find((t) => t.id === chapter.musicTrackId) || null;
    }

    // Fallback: search for track dedicated to this chapterId
    return this.project.audioTracks.find((t) => t.chapterId === chapter.id) || null;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    const effectiveVol = this.isMuted ? 0 : this.volume;
    if (this.channelA && !this.isCrossfading) {
      this.channelA.volume = effectiveVol;
    }
    if (this.channelB && !this.isCrossfading) {
      this.channelB.volume = effectiveVol;
    }
    audioEngine.setVolume(vol);
    this.emit();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.volume);
  }

  public seek(seconds: number) {
    if (!this.project || !this.timeline) return;

    const mode = this.project.globalSettings.audioMode || 'global';

    if (mode === 'global') {
      const track = this.getActiveTrack();
      const activeEl = this.getActiveElement();
      if (activeEl && track && activeEl.duration > 0) {
        try {
          const loop = this.project.globalSettings.loopGlobalAudio ?? true;
          activeEl.currentTime = loop
            ? seconds % activeEl.duration
            : Math.min(seconds, activeEl.duration);
        } catch {
          // In case audio is not fully buffered yet
        }
      }
    } else {
      // Per-chapter: find target chapter
      const chapterMeta = this.timeline.chaptersMeta.find(
        (m) => seconds >= m.startTime && seconds < m.endTime
      ) || this.timeline.chaptersMeta[this.timeline.chaptersMeta.length - 1];

      if (chapterMeta && chapterMeta.chapterIndex !== this.currentChapterIndex) {
        // Immediate jump across chapters without lingering crossfade sound
        this.switchChapterTrack(chapterMeta.chapterIndex, seconds - chapterMeta.startTime, false);
      } else if (chapterMeta) {
        // Within same chapter: seek local offset
        const activeEl = this.getActiveElement();
        const localOffset = Math.max(0, seconds - chapterMeta.startTime);
        if (activeEl && activeEl.duration > 0) {
          try {
            activeEl.currentTime = localOffset % activeEl.duration;
          } catch {
            // Buffer pending
          }
        }
      }
    }
  }

  private handleStatusChange(status: PlaybackStatus) {
    if (status === 'PLAYING') {
      this.resume();
    } else if (status === 'PAUSED') {
      this.pause();
    } else if (status === 'FINAL_HOLD') {
      this.fadeOutAndStop();
    }
  }

  private handleFrameTick(currentTime: number) {
    if (!this.project || !this.timeline) return;
    if (masterClock.getStatus() !== 'PLAYING') return;

    const mode = this.project.globalSettings.audioMode || 'global';
    if (mode === 'global') {
      // Global track plays continuously
      return;
    }

    // Per-chapter: detect chapter boundary crossing
    const chapterMeta = this.timeline.chaptersMeta.find(
      (m) => currentTime >= m.startTime && currentTime < m.endTime
    );

    if (chapterMeta && chapterMeta.chapterIndex !== this.currentChapterIndex) {
      const localOffset = currentTime - chapterMeta.startTime;
      this.switchChapterTrack(chapterMeta.chapterIndex, localOffset, true);
    }
  }

  private switchChapterTrack(newChapterIndex: number, startOffset: number = 0, useCrossfade: boolean = true) {
    if (!this.project) return;
    this.currentChapterIndex = newChapterIndex;

    const chapter = this.project.chapters.find((c) => c.chapterIndex === newChapterIndex);
    if (!chapter) return;

    // Get track for this chapter
    let targetTrack: AudioTrack | null = null;
    if (chapter.musicTrackId) {
      targetTrack = this.project.audioTracks.find((t) => t.id === chapter.musicTrackId) || null;
    } else {
      targetTrack = this.project.audioTracks.find((t) => t.chapterId === chapter.id) || null;
    }

    if (!targetTrack || !targetTrack.url) {
      // Chapter has no music assigned: fade out existing audio to silence
      this.fadeToSilence();
      this.currentTrackId = null;
      this.emit();
      return;
    }

    // If same track is already playing continuously across adjacent chapters, do not interrupt
    if (targetTrack.id === this.currentTrackId && !this.isCrossfading) {
      return;
    }

    this.currentTrackId = targetTrack.id;

    if (!useCrossfade) {
      this.playTrackImmediate(targetTrack, startOffset);
    } else {
      const crossfadeSec = this.project.globalSettings.crossfadeDuration ?? 0.8;
      this.executeCrossfade(targetTrack, startOffset, crossfadeSec);
    }
    this.emit();
  }

  private playTrackImmediate(track: AudioTrack, startOffset: number) {
    const el = this.getActiveElement();
    const otherEl = this.getInactiveElement();

    if (otherEl) {
      otherEl.pause();
      otherEl.currentTime = 0;
    }

    if (!el) return;
    el.src = track.url;
    el.volume = this.isMuted ? 0 : this.volume * (track.volume ?? 1);
    el.loop = true;

    try {
      if (startOffset > 0) {
        el.currentTime = startOffset;
      }
    } catch {
      // Handled on loadedmetadata
    }

    el.play().catch(() => {});
  }

  private executeCrossfade(newTrack: AudioTrack, startOffset: number, crossfadeSec: number) {
    const outgoingEl = this.getActiveElement();
    const incomingEl = this.getInactiveElement();

    if (!incomingEl) return;

    // Flip active channel
    this.activeChannel = this.activeChannel === 'A' ? 'B' : 'A';
    this.isCrossfading = true;

    incomingEl.src = newTrack.url;
    incomingEl.volume = 0;
    incomingEl.loop = true;

    try {
      if (startOffset > 0) incomingEl.currentTime = startOffset;
    } catch {
      // Ignored
    }

    incomingEl.play().catch(() => {});

    const steps = 20;
    const intervalMs = (crossfadeSec * 1000) / steps;
    let step = 0;

    if (this.crossfadeTimer) clearInterval(this.crossfadeTimer);

    const baseTargetVol = this.isMuted ? 0 : this.volume * (newTrack.volume ?? 1);
    const startOutVol = outgoingEl ? outgoingEl.volume : 0;

    this.crossfadeTimer = window.setInterval(() => {
      step++;
      const progress = step / steps;

      if (incomingEl) {
        incomingEl.volume = baseTargetVol * progress;
      }
      if (outgoingEl) {
        outgoingEl.volume = Math.max(0, startOutVol * (1 - progress));
      }

      if (step >= steps) {
        if (this.crossfadeTimer) clearInterval(this.crossfadeTimer);
        this.crossfadeTimer = null;
        this.isCrossfading = false;
        if (outgoingEl) {
          outgoingEl.pause();
          outgoingEl.currentTime = 0;
        }
      }
    }, intervalMs);
  }

  private fadeToSilence() {
    const el = this.getActiveElement();
    if (!el || el.paused) return;

    const initialVol = el.volume;
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 0.1;
      el.volume = Math.max(0, initialVol * (1 - progress));
      if (progress >= 1) {
        clearInterval(interval);
        el.pause();
      }
    }, 40);
  }

  private fadeOutAndStop() {
    const el = this.getActiveElement();
    if (!el || el.paused) return;

    const initialVol = el.volume;
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 0.08;
      el.volume = Math.max(0, initialVol * (1 - progress));
      if (progress >= 1) {
        clearInterval(interval);
        el.pause();
        el.currentTime = 0;
      }
    }, 40);
  }

  public resume() {
    if (!this.project) return;
    const mode = this.project.globalSettings.audioMode || 'global';

    if (mode === 'global') {
      const track = this.getActiveTrack();
      const el = this.getActiveElement();
      if (!track || !track.url || !el) return;

      if (el.src !== track.url) {
        el.src = track.url;
        el.loop = this.project.globalSettings.loopGlobalAudio ?? true;
      }
      el.volume = this.isMuted ? 0 : this.volume * (track.volume ?? 1);
      el.play().catch(() => {});
    } else {
      // Per-chapter: sync to current time
      const currentTime = masterClock.getCurrentTime();
      this.handleFrameTick(currentTime);
      const el = this.getActiveElement();
      if (el && el.src) {
        el.volume = this.isMuted ? 0 : this.volume;
        el.play().catch(() => {});
      }
    }
  }

  public pause() {
    if (this.channelA && !this.channelA.paused) this.channelA.pause();
    if (this.channelB && !this.channelB.paused) this.channelB.pause();
  }

  public restart() {
    this.seek(0);
    this.resume();
  }

  private handleTrackEnded() {
    const mode = this.project?.globalSettings.audioMode || 'global';
    if (mode === 'global' && (this.project?.globalSettings.loopGlobalAudio ?? true)) {
      const el = this.getActiveElement();
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    }
  }

  private getActiveElement(): HTMLAudioElement | null {
    return this.activeChannel === 'A' ? this.channelA : this.channelB;
  }

  private getInactiveElement(): HTMLAudioElement | null {
    return this.activeChannel === 'A' ? this.channelB : this.channelA;
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  public destroy() {
    if (this.unsubClockStatus) this.unsubClockStatus();
    if (this.unsubClockFrame) this.unsubClockFrame();
    if (this.channelA) {
      this.channelA.pause();
      this.channelA.src = '';
    }
    if (this.channelB) {
      this.channelB.pause();
      this.channelB.src = '';
    }
    this.listeners.clear();
  }
}

export const audioDirector = new AudioDirectorEngine();
