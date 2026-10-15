import { create } from 'zustand';
import { WeddingProject, ChapterConfig, PhotoItem, AudioTrack } from '../types/project';
import { CompiledTimeline, PlaybackState } from '../types/timeline';
import { createInitialWeddingProject } from '../project/defaultProject';
import { compileProjectTimeline } from '../timeline/compiler';
import { db } from '../storage/db';
import { masterClock } from '../player/PlaybackClock';
import { mediaManager } from '../media/mediaManager';
import { motionRuntime } from '../motion/MotionRuntime';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface WeddingStore {
  // Project State
  project: WeddingProject;
  timeline: CompiledTimeline;
  saveStatus: SaveStatus;
  activeChapterId: string;
  selectedPhotoId: string | null;
  viewMode: 'home' | 'studio' | 'player';

  // Playback State
  playback: PlaybackState;

  // History for Undo / Redo
  undoStack: WeddingProject[];
  redoStack: WeddingProject[];

  // Actions
  initStore: () => Promise<void>;
  saveProjectToDb: () => Promise<void>;
  replaceProject: (newProject: WeddingProject) => Promise<void>;
  updateProjectMeta: (updates: Partial<WeddingProject>) => void;
  updateChapter: (chapterId: string, updates: Partial<ChapterConfig>) => void;
  setActiveChapter: (chapterId: string) => void;
  setSelectedPhoto: (photoId: string | null) => void;
  setViewMode: (mode: 'home' | 'studio' | 'player') => void;

  // Photo management
  addPhotosToChapter: (chapterId: string, newPhotos: PhotoItem[]) => void;
  removePhoto: (chapterId: string, photoId: string) => void;
  updatePhoto: (chapterId: string, photoId: string, updates: Partial<PhotoItem>) => void;
  reorderPhotos: (chapterId: string, activeId: string, overId: string) => void;
  movePhotoToChapter: (sourceChapterId: string, targetChapterId: string, photoId: string) => void;

  // Audio management
  addAudioTrack: (track: AudioTrack) => void;
  removeAudioTrack: (trackId: string) => void;
  updateAudioTrack: (trackId: string, updates: Partial<AudioTrack>) => void;

  // Playback control
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (timeSeconds: number) => void;
  seekToChapter: (chapterId: string) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setFullscreen: (val: boolean) => void;
  restart: () => void;
  updateCurrentTime: (timeSeconds: number) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useWeddingStore = create<WeddingStore>((set, get) => {
  const initialProj = createInitialWeddingProject();
  const initialTimeline = compileProjectTimeline(initialProj);

  // Initialize master clock
  masterClock.init(initialTimeline.totalDuration, 0);

  function pushUndo(currentProj: WeddingProject) {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-15), JSON.parse(JSON.stringify(currentProj))],
      redoStack: [],
    }));
  }

  function triggerAutosave() {
    set({ saveStatus: 'unsaved' });
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      get().saveProjectToDb();
    }, 1200);
  }

  return {
    project: initialProj,
    timeline: initialTimeline,
    saveStatus: 'saved',
    activeChapterId: initialProj.chapters[0].id,
    selectedPhotoId: initialProj.chapters[0].photos[0]?.id || null,
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

    undoStack: [],
    redoStack: [],

    initStore: async () => {
      try {
        const storedProjects = await db.projects.toArray();
        if (storedProjects && storedProjects.length > 0) {
          const rawProj = storedProjects[0];
          // Restore media blobs from IndexedDB!
          const loadedProj = await mediaManager.restoreProjectMedia(rawProj);
          const newTimeline = compileProjectTimeline(loadedProj);

          masterClock.init(newTimeline.totalDuration, 0);

          set({
            project: loadedProj,
            timeline: newTimeline,
            activeChapterId: loadedProj.chapters[0]?.id || 'ch1_intro',
            selectedPhotoId: loadedProj.chapters[0]?.photos[0]?.id || null,
            saveStatus: 'saved',
            playback: {
              ...get().playback,
              totalDuration: newTimeline.totalDuration,
              currentScene: newTimeline.scenes[0] || null,
              currentChapter: newTimeline.chaptersMeta[0] || null,
            },
          });
        } else {
          await db.projects.put(initialProj);
          set({ saveStatus: 'saved' });
        }
      } catch (err) {
        console.warn('Could not read from IndexedDB, using in-memory defaults:', err);
      }

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

    saveProjectToDb: async () => {
      set({ saveStatus: 'saving' });
      try {
        const proj = get().project;
        await db.projects.put({
          ...proj,
          updatedAt: Date.now(),
        });
        set({ saveStatus: 'saved' });
      } catch (err) {
        console.error('Failed to save to IndexedDB:', err);
        set({ saveStatus: 'error' });
      }
    },

    replaceProject: async (newProject: WeddingProject) => {
      try {
        // 1. Restore media blobs / object URLs
        const restored = await mediaManager.restoreProjectMedia(newProject);
        // 2. Compile fresh timeline
        const newTimeline = compileProjectTimeline(restored);
        // 3. Reset master clock
        masterClock.init(newTimeline.totalDuration, 0);
        masterClock.seek(0);
        // 4. Sync motionRuntime
        motionRuntime.setScenes(newTimeline.scenes);
        // 5. Update Zustand store state atomically
        set({
          project: restored,
          timeline: newTimeline,
          activeChapterId: restored.chapters[0]?.id || 'ch1_intro',
          selectedPhotoId: restored.chapters[0]?.photos[0]?.id || null,
          saveStatus: 'saved',
          undoStack: [],
          redoStack: [],
          playback: {
            ...get().playback,
            isPlaying: false,
            isFinished: false,
            currentTime: 0,
            totalDuration: newTimeline.totalDuration,
            currentScene: newTimeline.scenes[0] || null,
            currentChapter: newTimeline.chaptersMeta[0] || null,
            currentChapterIndex: 1,
          },
        });
        // 6. Save to IndexedDB
        await get().saveProjectToDb();
      } catch (err) {
        console.error('Failed to replace project atomically:', err);
        throw err;
      }
    },

    updateProjectMeta: (updates) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedProj: WeddingProject = {
        ...currentProj,
        ...updates,
        updatedAt: Date.now(),
      };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      masterClock.setTotalDuration(updatedTimeline.totalDuration);

      set({
        project: updatedProj,
        timeline: updatedTimeline,
        playback: {
          ...get().playback,
          totalDuration: updatedTimeline.totalDuration,
        },
      });
      triggerAutosave();
    },

    updateChapter: (chapterId, updates) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedChapters = currentProj.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, ...updates } : ch
      );
      const updatedProj = { ...currentProj, chapters: updatedChapters, updatedAt: Date.now() };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      masterClock.setTotalDuration(updatedTimeline.totalDuration);

      set({
        project: updatedProj,
        timeline: updatedTimeline,
        playback: {
          ...get().playback,
          totalDuration: updatedTimeline.totalDuration,
        },
      });
      triggerAutosave();
    },

    setActiveChapter: (chapterId) => {
      const ch = get().project.chapters.find((c) => c.id === chapterId);
      set({
        activeChapterId: chapterId,
        selectedPhotoId: ch?.photos[0]?.id || null,
      });
    },

    setSelectedPhoto: (photoId) => {
      set({ selectedPhotoId: photoId });
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
    },

    addPhotosToChapter: (chapterId, newPhotos) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedChapters = currentProj.chapters.map((ch) => {
        if (ch.id === chapterId) {
          const currentPhotos = ch.photos;
          const merged = [...currentPhotos, ...newPhotos].map((p, idx) => ({
            ...p,
            order: idx,
          }));
          return { ...ch, photos: merged };
        }
        return ch;
      });
      const updatedProj = { ...currentProj, chapters: updatedChapters, updatedAt: Date.now() };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      masterClock.setTotalDuration(updatedTimeline.totalDuration);

      set({
        project: updatedProj,
        timeline: updatedTimeline,
        selectedPhotoId: newPhotos[0]?.id || get().selectedPhotoId,
      });
      triggerAutosave();
    },

    removePhoto: (chapterId, photoId) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedChapters = currentProj.chapters.map((ch) => {
        if (ch.id === chapterId) {
          const filtered = ch.photos.filter((p) => p.id !== photoId).map((p, idx) => ({
            ...p,
            order: idx,
          }));
          return { ...ch, photos: filtered };
        }
        return ch;
      });
      const updatedProj = { ...currentProj, chapters: updatedChapters, updatedAt: Date.now() };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      masterClock.setTotalDuration(updatedTimeline.totalDuration);

      set({
        project: updatedProj,
        timeline: updatedTimeline,
        selectedPhotoId: null,
      });
      triggerAutosave();
    },

    updatePhoto: (chapterId, photoId, updates) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedChapters = currentProj.chapters.map((ch) => {
        if (ch.id === chapterId) {
          const photos = ch.photos.map((p) => {
            if (p.id === photoId) {
              return { ...p, ...updates };
            }
            if (updates.isHero && p.id !== photoId) {
              return { ...p, isHero: false };
            }
            return p;
          });
          return { ...ch, photos };
        }
        return ch;
      });
      const updatedProj = { ...currentProj, chapters: updatedChapters, updatedAt: Date.now() };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      masterClock.setTotalDuration(updatedTimeline.totalDuration);

      set({ project: updatedProj, timeline: updatedTimeline });
      triggerAutosave();
    },

    reorderPhotos: (chapterId, activeId, overId) => {
      if (activeId === overId) return;
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedChapters = currentProj.chapters.map((ch) => {
        if (ch.id === chapterId) {
          const items = [...ch.photos];
          const oldIndex = items.findIndex((p) => p.id === activeId);
          const newIndex = items.findIndex((p) => p.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const [moved] = items.splice(oldIndex, 1);
            items.splice(newIndex, 0, moved);
            return {
              ...ch,
              photos: items.map((p, idx) => ({ ...p, order: idx })),
            };
          }
        }
        return ch;
      });
      const updatedProj = { ...currentProj, chapters: updatedChapters, updatedAt: Date.now() };
      const updatedTimeline = compileProjectTimeline(updatedProj);
      set({ project: updatedProj, timeline: updatedTimeline });
      triggerAutosave();
    },

    movePhotoToChapter: (sourceChapterId, targetChapterId, photoId) => {
      if (sourceChapterId === targetChapterId) return;
      const currentProj = get().project;
      pushUndo(currentProj);
      let photoToMove: PhotoItem | undefined;

      const updatedChapters = currentProj.chapters.map((ch) => {
        if (ch.id === sourceChapterId) {
          photoToMove = ch.photos.find((p) => p.id === photoId);
          return {
            ...ch,
            photos: ch.photos.filter((p) => p.id !== photoId).map((p, idx) => ({ ...p, order: idx })),
          };
        }
        return ch;
      });

      if (photoToMove) {
        const finalChapters = updatedChapters.map((ch) => {
          if (ch.id === targetChapterId) {
            const updatedPhoto = { ...photoToMove!, chapterId: targetChapterId, order: ch.photos.length };
            return { ...ch, photos: [...ch.photos, updatedPhoto] };
          }
          return ch;
        });
        const updatedProj = { ...currentProj, chapters: finalChapters, updatedAt: Date.now() };
        const updatedTimeline = compileProjectTimeline(updatedProj);
        set({ project: updatedProj, timeline: updatedTimeline, activeChapterId: targetChapterId });
        triggerAutosave();
      }
    },

    addAudioTrack: (track) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedProj = {
        ...currentProj,
        audioTracks: [...currentProj.audioTracks, track],
        updatedAt: Date.now(),
      };
      set({ project: updatedProj });
      triggerAutosave();
    },

    removeAudioTrack: (trackId) => {
      const currentProj = get().project;
      pushUndo(currentProj);
      const updatedProj = {
        ...currentProj,
        audioTracks: currentProj.audioTracks.filter((t) => t.id !== trackId),
        updatedAt: Date.now(),
      };
      set({ project: updatedProj });
      triggerAutosave();
    },

    updateAudioTrack: (trackId, updates) => {
      const currentProj = get().project;
      const updatedProj = {
        ...currentProj,
        audioTracks: currentProj.audioTracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
        updatedAt: Date.now(),
      };
      set({ project: updatedProj });
      triggerAutosave();
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
        set({ activeChapterId: chapterId });
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

    setPlaybackSpeed: (speed) => {
      masterClock.setSpeed(speed);
      set((state) => ({ playback: { ...state.playback, playbackSpeed: speed } }));
    },

    setVolume: (volume) => {
      set((state) => ({ playback: { ...state.playback, volume, isMuted: volume === 0 } }));
    },

    toggleMute: () => {
      set((state) => ({
        playback: { ...state.playback, isMuted: !state.playback.isMuted },
      }));
    },

    setFullscreen: (val) => {
      set((state) => ({ playback: { ...state.playback, isFullscreen: val } }));
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

    undo: () => {
      const stack = get().undoStack;
      if (stack.length === 0) return;
      const previous = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);
      const currentProj = get().project;

      const newTimeline = compileProjectTimeline(previous);
      masterClock.setTotalDuration(newTimeline.totalDuration);

      set({
        project: previous,
        timeline: newTimeline,
        undoStack: newStack,
        redoStack: [...get().redoStack, JSON.parse(JSON.stringify(currentProj))],
      });
      triggerAutosave();
    },

    redo: () => {
      const stack = get().redoStack;
      if (stack.length === 0) return;
      const next = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);
      const currentProj = get().project;

      const newTimeline = compileProjectTimeline(next);
      masterClock.setTotalDuration(newTimeline.totalDuration);

      set({
        project: next,
        timeline: newTimeline,
        redoStack: newStack,
        undoStack: [...get().undoStack, JSON.parse(JSON.stringify(currentProj))],
      });
      triggerAutosave();
    },
  };
});
