// MotionRuntime: Dedicated 60 FPS Motion Coordination Engine
// Decouples animation transforms and transition compositing from React 10Hz UI state re-renders

import { masterClock, ClockState } from '../player/PlaybackClock';
import { TimelineScene } from '../types/timeline';
import { ChapterTransitionId } from '../transitions/TransitionRegistry';
import { computeTransitionState } from '../transitions/TransitionDirector';

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
  upcomingScene: TimelineScene | null; // Pre-warmed upcoming scene target
  isPrepared: boolean;
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
        upcomingScene: null,
        isPrepared: false,
        isPlaying,
        isFinalHold,
        playbackSpeed: speed,
      };
    }

    const transState = computeTransitionState(this.scenes, currentTime);
    const activeScene = transState.activeScene || this.scenes[0];
    const activeElapsed = Math.max(0, currentTime - activeScene.startTime);

    return {
      currentTime,
      totalDuration,
      activeScene,
      activeSceneProgress: transState.sceneProgress,
      activeSceneElapsed: activeElapsed,
      isTransitioning: transState.isTransitioning,
      transitionId: transState.transitionId,
      transitionProgress: transState.transitionProgress,
      outgoingScene: transState.outgoingScene,
      outgoingSceneProgress: transState.outgoingSceneProgress,
      incomingScene: transState.incomingScene,
      incomingSceneProgress: transState.incomingSceneProgress,
      upcomingScene: transState.upcomingScene,
      isPrepared: transState.isPrepared,
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
