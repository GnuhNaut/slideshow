import { describe, it, expect, beforeEach, vi } from 'vitest';
import { motionRuntime } from '../MotionRuntime';
import { masterClock } from '../../player/PlaybackClock';
import { TimelineScene } from '../../types/timeline';

describe('MotionRuntime - 60 FPS Motion Coordination Engine', () => {
  const mockScenes: TimelineScene[] = [
    {
      id: 'scene_intro',
      chapterId: 'ch1',
      chapterIndex: 1,
      chapterTitle: 'Intro',
      type: 'intro',
      startTime: 0,
      duration: 10,
      endTime: 10,
      photos: [],
      config: {},
      transitionIn: 'soft_light',
      transitionOut: 'cut',
    },
    {
      id: 'scene_memories',
      chapterId: 'ch2',
      chapterIndex: 2,
      chapterTitle: 'Memories',
      type: 'film_roll',
      startTime: 10,
      duration: 20,
      endTime: 30,
      photos: [],
      config: {},
      transitionIn: 'cut',
      transitionOut: 'cut',
    },
  ];

  beforeEach(() => {
    masterClock.init(30, 0);
    motionRuntime.setScenes(mockScenes);
  });

  it('TEST 1: Should compute continuous scene-local progress at 60 FPS without stepping', () => {
    masterClock.seek(5.0);
    const state = motionRuntime.getState();

    expect(state.activeScene?.id).toBe('scene_intro');
    expect(state.activeSceneProgress).toBeCloseTo(0.5, 2);
    expect(state.isTransitioning).toBe(false);
  });

  it('TEST 2: Should preserve true continuous progress for outgoing and incoming scenes during transition', () => {
    // Transition 1 -> 2 starts 1.1s before scene 1 ends (at t = 8.9s)
    masterClock.seek(9.45); // midway through 1.1s transition
    const state = motionRuntime.getState();

    expect(state.isTransitioning).toBe(true);
    expect(state.transitionId).toBe('FILM_PORTAL_OPENING');
    expect(state.outgoingScene?.id).toBe('scene_intro');
    expect(state.incomingScene?.id).toBe('scene_memories');

    // Outgoing scene progress is real (0.945), NOT clamped to 1.0!
    expect(state.outgoingSceneProgress).toBeCloseTo(0.945, 2);
    // Transition progress is halfway (~0.5)
    expect(state.transitionProgress).toBeGreaterThan(0.4);
    expect(state.transitionProgress).toBeLessThan(0.6);
  });

  it('TEST 3: Should accurately update on seek', () => {
    masterClock.seek(15.0);
    const state = motionRuntime.getState();

    expect(state.activeScene?.id).toBe('scene_memories');
    expect(state.activeSceneProgress).toBeCloseTo(0.25, 2);
    expect(state.isTransitioning).toBe(false);
  });

  it('keeps the React layout snapshot stable during ordinary animation frames', () => {
    const layout = motionRuntime.getLayoutState();
    const onLayout = vi.fn();
    const unsubscribe = motionRuntime.subscribeLayout(onLayout);
    try {
      for (let frame = 1; frame <= 120; frame++) masterClock.seek(frame / 60);
      expect(motionRuntime.getLayoutState()).toBe(layout);
      expect(onLayout).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
    }
  });

  it('notifies React at preparation, overlap and activation, including backwards seeks', () => {
    const onLayout = vi.fn();
    const unsubscribe = motionRuntime.subscribeLayout(onLayout);
    try {
      masterClock.seek(8.2);
      expect(motionRuntime.getLayoutState().upcomingScene).toBe(mockScenes[1]);
      expect(motionRuntime.getLayoutState().isTransitioning).toBe(false);
      masterClock.seek(9.0);
      expect(motionRuntime.getLayoutState().isTransitioning).toBe(true);
      masterClock.seek(10.0);
      expect(motionRuntime.getLayoutState().activeScene).toBe(mockScenes[1]);
      expect(motionRuntime.getLayoutState().upcomingScene).toBeNull();
      masterClock.seek(1.0);
      expect(motionRuntime.getLayoutState().activeScene).toBe(mockScenes[0]);
      expect(onLayout).toHaveBeenCalledTimes(4);
    } finally {
      unsubscribe();
    }
  });
});
