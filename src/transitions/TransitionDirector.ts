import { TimelineScene } from '../types/timeline';
import { getTransitionBetween, ChapterTransitionId } from './TransitionRegistry';

export const TRANSITION_LOOKAHEAD_WINDOW = 0.4; // 400ms pre-mount and warm-up window

export interface TransitionState {
  isTransitioning: boolean;
  outgoingScene: TimelineScene | null;
  outgoingSceneProgress: number; // scene-local progress (not locked to 1.0)
  incomingScene: TimelineScene | null;
  incomingSceneProgress: number; // scene-local progress (not locked to 0.0)
  activeScene: TimelineScene | null;
  transitionProgress: number; // 0.0 to 1.0
  transitionId: ChapterTransitionId;
  sceneProgress: number; // 0.0 to 1.0 for active scene
  upcomingScene: TimelineScene | null; // Lookahead pre-mount target
  isPrepared: boolean; // True when incoming scene is being pre-warmed
}

export function computeTransitionState(
  scenes: TimelineScene[],
  currentTime: number
): TransitionState {
  if (!scenes || scenes.length === 0) {
    return {
      isTransitioning: false,
      outgoingScene: null,
      outgoingSceneProgress: 0,
      incomingScene: null,
      incomingSceneProgress: 0,
      activeScene: null,
      transitionProgress: 0,
      transitionId: 'DEFAULT_DISSOLVE',
      sceneProgress: 0,
      upcomingScene: null,
      isPrepared: false,
    };
  }

  // Find index of current scene
  let currentIndex = scenes.findIndex(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  );

  // If beyond last scene, hold on last scene
  if (currentIndex === -1) {
    if (currentTime >= scenes[scenes.length - 1].endTime) {
      currentIndex = scenes.length - 1;
    } else {
      currentIndex = 0;
    }
  }

  const currentScene = scenes[currentIndex];
  const nextScene = currentIndex < scenes.length - 1 ? scenes[currentIndex + 1] : null;

  // Calculate regular scene progress
  const sceneElapsed = Math.max(0, currentTime - currentScene.startTime);
  const sceneProgress =
    currentScene.duration > 0 ? Math.min(1, sceneElapsed / currentScene.duration) : 0;

  // Check if we are approaching a transition to nextScene
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
    const lookaheadStartTime = Math.max(currentScene.startTime, transStartTime - TRANSITION_LOOKAHEAD_WINDOW);

    // 1. In Active Transition Phase
    if (currentTime >= transStartTime) {
      const transElapsed = currentTime - transStartTime;
      const transitionProgress = Math.min(1, Math.max(0, transElapsed / transDuration));

      const outElapsed = currentTime - currentScene.startTime;
      const outgoingSceneProgress = Math.min(1, outElapsed / currentScene.duration);

      const inElapsed = Math.max(0, currentTime - nextScene.startTime);
      const incomingSceneProgress =
        nextScene.duration > 0 ? Math.min(1, inElapsed / nextScene.duration) : 0;

      return {
        isTransitioning: true,
        outgoingScene: currentScene,
        outgoingSceneProgress,
        incomingScene: nextScene,
        incomingSceneProgress,
        activeScene: currentScene,
        transitionProgress,
        transitionId: transitionSpec.id,
        sceneProgress,
        upcomingScene: nextScene,
        isPrepared: true,
      };
    }

    // 2. In Lookahead Preparation Phase (Pre-mount and decode before T)
    if (currentTime >= lookaheadStartTime) {
      return {
        isTransitioning: false,
        outgoingScene: null,
        outgoingSceneProgress: 0,
        incomingScene: null,
        incomingSceneProgress: 0,
        activeScene: currentScene,
        transitionProgress: 0,
        transitionId: transitionSpec.id,
        sceneProgress,
        upcomingScene: nextScene,
        isPrepared: true,
      };
    }
  }

  return {
    isTransitioning: false,
    outgoingScene: null,
    outgoingSceneProgress: 0,
    incomingScene: null,
    incomingSceneProgress: 0,
    activeScene: currentScene,
    transitionProgress: 0,
    transitionId: 'DEFAULT_DISSOLVE',
    sceneProgress,
    upcomingScene: null,
    isPrepared: false,
  };
}
