import { TimelineScene } from '../types/timeline';
import { getTransitionBetween, ChapterTransitionId } from './TransitionRegistry';

export interface TransitionState {
  isTransitioning: boolean;
  outgoingScene: TimelineScene | null;
  incomingScene: TimelineScene | null;
  activeScene: TimelineScene | null;
  transitionProgress: number; // 0.0 to 1.0
  transitionId: ChapterTransitionId;
  sceneProgress: number; // 0.0 to 1.0 for active scene
}

export function computeTransitionState(
  scenes: TimelineScene[],
  currentTime: number
): TransitionState {
  if (!scenes || scenes.length === 0) {
    return {
      isTransitioning: false,
      outgoingScene: null,
      incomingScene: null,
      activeScene: null,
      transitionProgress: 0,
      transitionId: 'DEFAULT_DISSOLVE',
      sceneProgress: 0,
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
  const sceneProgress = currentScene.duration > 0 ? Math.min(1, sceneElapsed / currentScene.duration) : 0;

  // Check if we are approaching a transition to nextScene
  if (nextScene) {
    const isChapterChange = currentScene.chapterIndex !== nextScene.chapterIndex;
    const transitionSpec = isChapterChange
      ? getTransitionBetween(currentScene.chapterIndex, nextScene.chapterIndex)
      : { id: 'DEFAULT_DISSOLVE' as ChapterTransitionId, duration: 0.8, fromChapter: currentScene.chapterIndex, toChapter: nextScene.chapterIndex };

    const transDuration = Math.min(transitionSpec.duration, currentScene.duration * 0.4);
    const transStartTime = currentScene.endTime - transDuration;

    if (currentTime >= transStartTime) {
      const transElapsed = currentTime - transStartTime;
      const transitionProgress = Math.min(1, Math.max(0, transElapsed / transDuration));

      return {
        isTransitioning: true,
        outgoingScene: currentScene,
        incomingScene: nextScene,
        activeScene: currentScene,
        transitionProgress,
        transitionId: transitionSpec.id,
        sceneProgress,
      };
    }
  }

  return {
    isTransitioning: false,
    outgoingScene: null,
    incomingScene: null,
    activeScene: currentScene,
    transitionProgress: 0,
    transitionId: 'DEFAULT_DISSOLVE',
    sceneProgress,
  };
}
