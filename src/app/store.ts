import { create } from 'zustand';
import { WeddingProject } from '../types/project';
import { CompiledTimeline, PlaybackState } from '../types/timeline';
import { filesystemProject } from '../generated/galleryManifest';
import { compileProjectTimeline } from '../timeline/compiler';
import { masterClock } from '../player/PlaybackClock';

interface WeddingStore {
  project: WeddingProject;
  timeline: CompiledTimeline;
  viewMode: 'home' | 'player';
  playback: PlaybackState;

  initStore: () => Promise<void>;
  setViewMode: (mode: 'home' | 'player') => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (timeSeconds: number) => void;
  seekToChapter: (chapterId: string) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  restart: () => void;
  updateCurrentTime: (timeSeconds: number) => void;
}

export const useWeddingStore = create<WeddingStore>((set, get) => {
  const initialProj = filesystemProject;
  const initialTimeline = compileProjectTimeline(initialProj);

  masterClock.init(initialTimeline.totalDuration, 0);

  return {
    project: initialProj,
    timeline: initialTimeline,
    viewMode: 'home',

    playback: {
      isPlaying: false,
      currentTime: 0,
      totalDuration: initialTimeline.totalDuration,
      currentScene: initialTimeline.scenes[0] || null,
      currentChapter: initialTimeline.chaptersMeta[0] || null,
      currentChapterIndex: 1,
      playbackSpeed: 1,
      volume: 0.85,
      isMuted: false,
      isFullscreen: false,
      isFinished: false,
    },

    initStore: async () => {
      const newTimeline = compileProjectTimeline(initialProj);
      masterClock.init(newTimeline.totalDuration, 0);
      set({
        project: initialProj,
        timeline: newTimeline,
        playback: {
          ...get().playback,
          currentTime: 0,
          isPlaying: false,
          isFinished: false,
          totalDuration: newTimeline.totalDuration,
          currentScene: newTimeline.scenes[0] || null,
          currentChapter: newTimeline.chaptersMeta[0] || null,
          currentChapterIndex: 1,
        },
      });

      // Attach MasterClock status listener
      masterClock.onStatusChange((status) => {
        const isPlaying = status === 'PLAYING';
        const isFinished = status === 'FINAL_HOLD';
        set((state) => ({
          playback: {
            ...state.playback,
            isPlaying,
            isFinished,
          },
        }));
      });

      // Attach MasterClock throttled UI listener (10Hz)
      masterClock.onThrottledTime((time) => {
        get().updateCurrentTime(time);
      });
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
    },

    // Master Clock Integrated Playback Controls
    play: () => {
      masterClock.play();
    },

    pause: () => {
      masterClock.pause();
    },

    togglePlay: () => {
      masterClock.togglePlay();
    },

    seek: (timeSeconds) => {
      masterClock.seek(timeSeconds);
    },

    seekToChapter: (chapterId) => {
      const meta = get().timeline.chaptersMeta.find((c) => c.chapterId === chapterId);
      if (meta) {
        masterClock.seek(meta.startTime);
      }
    },

    nextChapter: () => {
      const currentIdx = get().playback.currentChapterIndex;
      const nextMeta = get().timeline.chaptersMeta.find((c) => c.chapterIndex === currentIdx + 1);
      if (nextMeta) {
        masterClock.seek(nextMeta.startTime);
      }
    },

    prevChapter: () => {
      const currentIdx = get().playback.currentChapterIndex;
      const prevMeta = get().timeline.chaptersMeta.find((c) => c.chapterIndex === currentIdx - 1);
      if (prevMeta) {
        masterClock.seek(prevMeta.startTime);
      } else {
        masterClock.seek(0);
      }
    },

    setVolume: (volume) => {
      set((state) => ({ playback: { ...state.playback, volume, isMuted: volume === 0 } }));
    },

    toggleMute: () => {
      set((state) => ({
        playback: { ...state.playback, isMuted: !state.playback.isMuted },
      }));
    },

    restart: () => {
      masterClock.seek(0);
      masterClock.play();
    },

    updateCurrentTime: (timeSeconds) => {
      const timeline = get().timeline;
      const clampedTime = Math.max(0, Math.min(timeSeconds, timeline.totalDuration));
      const currentScene =
        timeline.scenes.find((s) => clampedTime >= s.startTime && clampedTime < s.endTime) ||
        timeline.scenes[timeline.scenes.length - 1] ||
        null;
      const currentChapter =
        timeline.chaptersMeta.find(
          (c) => clampedTime >= c.startTime && clampedTime < c.endTime
        ) ||
        timeline.chaptersMeta[timeline.chaptersMeta.length - 1] ||
        null;

      const isFinished = masterClock.isFinalHold();

      set((state) => ({
        playback: {
          ...state.playback,
          currentTime: clampedTime,
          currentScene,
          currentChapter,
          currentChapterIndex: currentChapter?.chapterIndex || 1,
          isFinished,
        },
      }));
    },

  };
});
