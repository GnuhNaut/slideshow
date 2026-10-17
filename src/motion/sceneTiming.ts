import { TimelineScene } from '../types/timeline';
import { getSceneTransitionDuration } from '../transitions/TransitionDirector';

// Visual entrances begin during the preceding scene's overlap. Extending the
// motion interval keeps the same pose when an incoming scene becomes active.
export function getSceneMotionTiming(
  scene: TimelineScene,
  previousScene: TimelineScene | undefined,
  currentTime: number
) {
  const leadIn = previousScene ? getSceneTransitionDuration(previousScene, scene) : 0;
  const elapsed = Math.max(0, currentTime - scene.startTime + leadIn);
  const duration = scene.duration + leadIn;
  return { elapsed, progress: duration > 0 ? Math.min(1, elapsed / duration) : 0 };
}
