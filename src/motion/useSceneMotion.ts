import { useLayoutEffect, useRef } from 'react';
import { motionRuntime, MotionFrameState } from './MotionRuntime';
import { getSceneMotionTiming } from './sceneTiming';

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
  const scenes = motionRuntime.getScenes();

  useLayoutEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useLayoutEffect(() => {
    initialProgressRef.current = initialProgress;
  }, [initialProgress]);

  useLayoutEffect(() => {
    // Subscribe before paint, including an immediate frame on mount/seek.
    let lastProgress = Number.NaN;
    let lastElapsed = Number.NaN;
    const index = scenes.findIndex((scene) => scene.id === sceneId);
    const scene = scenes[index];
    return motionRuntime.subscribe((frame) => {
      const { progress, elapsed } = scene
        ? getSceneMotionTiming(scene, scenes[index - 1], frame.currentTime)
        : { progress: initialProgressRef.current, elapsed: 0 };

      if (progress === lastProgress && elapsed === lastElapsed) return;
      lastProgress = progress;
      lastElapsed = elapsed;
      onTickRef.current(progress, elapsed, frame);
    });
  }, [sceneId, scenes]);
}
