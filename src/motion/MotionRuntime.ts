// MotionRuntime: Dedicated 60 FPS Motion Coordination Engine
// Decouples animation transforms and transition compositing from React 10Hz UI state re-renders

import { masterClock, ClockState } from '../player/PlaybackClock';
import { TimelineScene } from '../types/timeline';
import { ChapterTransitionId, getTransitionBetween } from '../transitions/TransitionRegistry';

export interface MotionFrameState {
  currentTime: number;
  totalDuration: number;
  activeScene: TimelineScene | null;
  activeSceneProgress: number; // 0.0 to 1.0 (scene-local continuous progress)
  activeSceneElapsed: number;  // seconds elapsed inside active scene
  isTransitioning: boolean;
  transitionId: ChapterTransitionId;
  transitionProgress: number;  // 0.0 to 1.0 (transition-specific progress)
  outgoingScene: TimelineScene | null;
  outgoingSceneProgress: number; // real scene-local progress of outgoing scene (e.g. 0.85 -> 1.0)
  incomingScene: TimelineScene | null;
  incomingSceneProgress: number; // real scene-local progress of incoming scene (e.g. 0.0 -> 0.15)
  isPlaying: boolean;
  isFinalHold: boolean;
  playbackSpeed: number;
}

export type MotionTickListener = (state: MotionFrameState) => void;

class MotionRuntimeEngine {
  private scenes: TimelineScene[] = [];
  private listeners: Set<MotionTickListener> = new Set();
  private currentState: MotionFrameState;
  private unsubClock: (() => void) | null = null;

  constructor() {
    this.currentState = this.computeState(0, masterClock.getState());
    this.initClockListener();
  }

  public setScenes(scenes: TimelineScene[]) {
    this.scenes = scenes;
    this.currentState = this.computeState(masterClock.getCurrentTime(), masterClock.getState());
    this.emit();
  }

  public getScenes(): TimelineScene[] {
    return this.scenes;
  }

  public getState(): MotionFrameState {
    return this.currentState;
  }

  public subscribe(listener: MotionTickListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private initClockListener() {
    if (this.unsubClock) this.unsubClock();
    this.unsubClock = masterClock.onFrame((currentTime, clockState) => {
      this.currentState = this.computeState(currentTime, clockState);
      this.emit();
    });
  }

  public computeState(currentTime: number, clockState: ClockState): MotionFrameState {
    const isPlaying = clockState.status === 'PLAYING';
    const isFinalHold = clockState.status === 'FINAL_HOLD';
    const totalDuration = clockState.totalDuration;
    const speed = clockState.playbackSpeed;

    if (!this.scenes || this.scenes.length === 0) {
      return {
        currentTime,
        totalDuration,
        activeScene: null,
        activeSceneProgress: 0,
        activeSceneElapsed: 0,
        isTransitioning: false,
        transitionId: 'DEFAULT_DISSOLVE',
        transitionProgress: 0,
        outgoingScene: null,
        outgoingSceneProgress: 0,
        incomingScene: null,
        incomingSceneProgress: 0,
        isPlaying,
        isFinalHold,
        playbackSpeed: speed,
      };
    }

    // Find current scene index
    let currentIndex = this.scenes.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );

    if (currentIndex === -1) {
      if (currentTime >= this.scenes[this.scenes.length - 1].endTime) {
        currentIndex = this.scenes.length - 1;
      } else {
        currentIndex = 0;
      }
    }

    const currentScene = this.scenes[currentIndex];
    const nextScene = currentIndex < this.scenes.length - 1 ? this.scenes[currentIndex + 1] : null;

    // Continuous scene-local progress (not clamped to 1.0 prematurely during transitions!)
    const activeElapsed = Math.max(0, currentTime - currentScene.startTime);
    const activeSceneProgress =
      currentScene.duration > 0 ? Math.min(1, activeElapsed / currentScene.duration) : 0;

    // Check transition window
    if (nextScene) {
      const isChapterChange = currentScene.chapterIndex !== nextScene.chapterIndex;
      const transitionSpec = isChapterChange
        ? getTransitionBetween(currentScene.chapterIndex, nextScene.chapterIndex)
        : {
            id: 'DEFAULT_DISSOLVE' as ChapterTransitionId,
            duration: 0.8,
            fromChapter: currentScene.chapterIndex,
            toChapter: nextScene.chapterIndex,
          };

      const transDuration = Math.min(transitionSpec.duration, currentScene.duration * 0.4);
      const transStartTime = currentScene.endTime - transDuration;

      if (currentTime >= transStartTime) {
        const transElapsed = currentTime - transStartTime;
        const transitionProgress = Math.min(1, Math.max(0, transElapsed / transDuration));

        // Real continuous local progress for outgoing scene (approaching 1.0)
        const outElapsed = currentTime - currentScene.startTime;
        const outgoingSceneProgress = Math.min(1, outElapsed / currentScene.duration);

        // Real continuous local progress for incoming scene (entering from 0.0)
        const inElapsed = Math.max(0, currentTime - nextScene.startTime);
        const incomingSceneProgress =
          nextScene.duration > 0 ? Math.min(1, inElapsed / nextScene.duration) : 0;

        return {
          currentTime,
          totalDuration,
          activeScene: currentScene,
          activeSceneProgress,
          activeSceneElapsed: activeElapsed,
          isTransitioning: true,
          transitionId: transitionSpec.id,
          transitionProgress,
          outgoingScene: currentScene,
          outgoingSceneProgress,
          incomingScene: nextScene,
          incomingSceneProgress,
          isPlaying,
          isFinalHold,
          playbackSpeed: speed,
        };
      }
    }

    return {
      currentTime,
      totalDuration,
      activeScene: currentScene,
      activeSceneProgress,
      activeSceneElapsed: activeElapsed,
      isTransitioning: false,
      transitionId: 'DEFAULT_DISSOLVE',
      transitionProgress: 0,
      outgoingScene: null,
      outgoingSceneProgress: 0,
      incomingScene: null,
      incomingSceneProgress: 0,
      isPlaying,
      isFinalHold,
      playbackSpeed: speed,
    };
  }

  private emit() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Error in MotionRuntime listener:', err);
      }
    });
  }

  public destroy() {
    if (this.unsubClock) {
      this.unsubClock();
      this.unsubClock = null;
    }
    this.listeners.clear();
  }
}

export const motionRuntime = new MotionRuntimeEngine();
