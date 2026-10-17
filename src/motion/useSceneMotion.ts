import { useEffect, useRef } from 'react';
import { motionRuntime, MotionFrameState } from './MotionRuntime';

export type SceneMotionCallback = (
  progress: number,
  elapsed: number,
  frame: MotionFrameState
) => void;

/**
 * useSceneMotion: High-performance 60 FPS motion hook.
 * Bypasses React VDOM re-rendering and invokes callback directly on RAF frame ticks.
 */
export function useSceneMotion(
  sceneId: string,
  onTick: SceneMotionCallback,
  initialProgress: number = 0
) {
  const onTickRef = useRef<SceneMotionCallback>(onTick);
  const initialProgressRef = useRef(initialProgress);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    initialProgressRef.current = initialProgress;
  }, [initialProgress]);

  useEffect(() => {
    // Initial call on mount
    const state = motionRuntime.getState();
    if (state.activeScene?.id === sceneId) {
      onTickRef.current(state.activeSceneProgress, state.activeSceneElapsed, state);
    } else {
      onTickRef.current(initialProgressRef.current, 0, state);
    }

    // Subscribe to 60 FPS master animation loop
    return motionRuntime.subscribe((frame) => {
      if (frame.activeScene?.id === sceneId) {
        onTickRef.current(frame.activeSceneProgress, frame.activeSceneElapsed, frame);
      } else if (frame.outgoingScene?.id === sceneId) {
        onTickRef.current(frame.outgoingSceneProgress, 0, frame);
      } else if (frame.incomingScene?.id === sceneId) {
        onTickRef.current(frame.incomingSceneProgress, 0, frame);
      }
    });
  }, [sceneId]);
}
