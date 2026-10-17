import { describe, expect, it } from 'vitest';
import { getSceneMotionTiming } from '../sceneTiming';
import { TimelineScene } from '../../types/timeline';

const previous = { chapterIndex: 2, startTime: 0, endTime: 10, duration: 10 } as TimelineScene;
const scene = { chapterIndex: 3, startTime: 10, endTime: 16, duration: 6 } as TimelineScene;

describe('Scene motion across the overlap', () => {
  it('begins the entrance during the incoming overlap instead of keeping content invisible', () => {
    expect(getSceneMotionTiming(scene, previous, 8).progress).toBe(0);
    expect(getSceneMotionTiming(scene, previous, 9.3).progress).toBeGreaterThan(0);
  });

  it('keeps the pose continuous when incoming content becomes the active scene', () => {
    const before = getSceneMotionTiming(scene, previous, 10 - 0.000001);
    const after = getSceneMotionTiming(scene, previous, 10);
    expect(after.progress).toBeCloseTo(before.progress, 5);
    expect(after.elapsed).toBeCloseTo(1.3);
    expect(getSceneMotionTiming(scene, previous, 16).progress).toBe(1);
  });

  it('uses the capped overlap of a short preceding scene', () => {
    const shortScene = { ...previous, duration: 0.5 };
    expect(getSceneMotionTiming(scene, shortScene, 10).elapsed).toBeCloseTo(0.2);
  });

  it('keeps the first scene and backwards seeks deterministic', () => {
    expect(getSceneMotionTiming(previous, undefined, 5)).toEqual({ elapsed: 5, progress: 0.5 });
    expect(getSceneMotionTiming(scene, previous, 12).progress).toBeCloseTo(3.3 / 7.3);
    expect(getSceneMotionTiming(scene, previous, 7)).toEqual({ elapsed: 0, progress: 0 });
  });
});
