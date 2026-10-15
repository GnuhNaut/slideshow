import { describe, it, expect } from 'vitest';
import { getTransitionBetween } from '../TransitionRegistry';
import { computeTransitionState } from '../TransitionDirector';
import { TimelineScene } from '../../types/timeline';

describe('Transition Director & Registry', () => {
  it('should return specific cinematic transitions between consecutive chapters', () => {
    expect(getTransitionBetween(1, 2).id).toBe('FILM_PORTAL_OPENING');
    expect(getTransitionBetween(2, 3).id).toBe('TRUE_FILM_TO_HERO_MORPH');
    expect(getTransitionBetween(3, 4).id).toBe('PREMIUM_3D_ALBUM_TURN');
    expect(getTransitionBetween(4, 5).id).toBe('GALLERY_SPACE_TRANSFORMATION');
    expect(getTransitionBetween(5, 6).id).toBe('GRAND_WEDDING_CURTAIN_REVEAL');
    expect(getTransitionBetween(6, 7).id).toBe('FOREVER_FINAL_REVEAL');
  });

  it('should compute transition state correctly when in transition window', () => {
    const mockScenes: TimelineScene[] = [
      {
        id: 's1',
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
        id: 's2',
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

    // At 5.0s (mid scene 1): not transitioning
    const stateMid = computeTransitionState(mockScenes, 5.0);
    expect(stateMid.isTransitioning).toBe(false);
    expect(stateMid.activeScene?.id).toBe('s1');

    // At 9.5s (near end of scene 1, within 1.1s transition window): is transitioning to scene 2!
    const stateTrans = computeTransitionState(mockScenes, 9.5);
    expect(stateTrans.isTransitioning).toBe(true);
    expect(stateTrans.outgoingScene?.id).toBe('s1');
    expect(stateTrans.incomingScene?.id).toBe('s2');
    expect(stateTrans.transitionId).toBe('FILM_PORTAL_OPENING');
    expect(stateTrans.transitionProgress).toBeGreaterThan(0);
    expect(stateTrans.transitionProgress).toBeLessThanOrEqual(1);
  });
});
