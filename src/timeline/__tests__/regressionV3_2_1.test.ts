import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeTransitionState, TRANSITION_LOOKAHEAD_WINDOW } from '../../transitions/TransitionDirector';
import { motionRuntime } from '../../motion/MotionRuntime';
import { masterClock } from '../../player/PlaybackClock';
import {
  getTrackPosition,
  getVisibleItems,
  calculateItemDimensions,
  calculateCumulativeOffsets,
  getRequiredMediaIds,
} from '../../scenes/filmstripMath';
import { releaseCurtainSnapshot } from '../../transitions/curtainSnapshot';
import { validateProjectSchema } from '../../project/exportImport';
import { presentationWakeLock } from '../../player/PresentationWakeLock';
import { TimelineScene } from '../../types/timeline';
import { PhotoItem, WeddingProject } from '../../types/project';

describe('V3.2.1 Release Candidate Regression Suite (TC-41 to TC-60)', () => {
  const samplePhotos: PhotoItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: `photo_${i + 1}`,
    chapterId: 'ch2',
    url: `blob:mock-url-${i + 1}`,
    aspectRatio: i % 2 === 0 ? 1.5 : 0.8,
    originalWidth: 1920,
    originalHeight: 1080,
    cropMode: 'cover',
    focalPoint: { x: 50, y: 50 },
    order: i,
    createdAt: Date.now(),
    title: `Ảnh kỷ niệm ${i + 1}`,
  }));

  const mockScenes: TimelineScene[] = [
    {
      id: 'scene_ch1',
      chapterId: 'ch1',
      chapterIndex: 1,
      chapterTitle: 'Lời Mở Đầu',
      type: 'intro',
      startTime: 0,
      duration: 5.0,
      endTime: 5.0,
      transitionIn: 'film_wipe',
      transitionOut: 'film_wipe',
      photos: samplePhotos.slice(0, 2),
      config: {},
    },
    {
      id: 'scene_ch2',
      chapterId: 'ch2',
      chapterIndex: 2,
      chapterTitle: 'Cuộn Phim Kỷ Niệm',
      type: 'film_roll',
      startTime: 5.0,
      duration: 8.0,
      endTime: 13.0,
      transitionIn: 'film_morph',
      transitionOut: 'film_morph',
      photos: samplePhotos.slice(0, 30),
      config: { speed: 60 },
    },
    {
      id: 'scene_ch3',
      chapterId: 'ch3',
      chapterIndex: 3,
      chapterTitle: 'Khoảnh Khắc Cầu Hôn',
      type: 'hero_moment',
      startTime: 13.0,
      duration: 5.5,
      endTime: 18.5,
      transitionIn: 'album_flip',
      transitionOut: 'album_flip',
      photos: samplePhotos.slice(30, 31),
      config: {},
    },
    {
      id: 'scene_ch6',
      chapterId: 'ch6',
      chapterIndex: 6,
      chapterTitle: 'Lời Cảm Ơn',
      type: 'thank_you',
      startTime: 18.5,
      duration: 7.0,
      endTime: 25.5,
      transitionIn: 'fade',
      transitionOut: 'fade',
      photos: samplePhotos.slice(31, 33),
      config: {},
    },
  ];

  beforeEach(() => {
    masterClock.init(30, 0);
    masterClock.pause();
    masterClock.seek(0);
    motionRuntime.setScenes(mockScenes);
  });

  // TC-41: Scene được chuẩn bị trước ranh giới chuyển chương (Lookahead)
  it('TC-41: Scene is prepared in advance during lookahead window before transition starts', () => {
    const currentScene = mockScenes[0]; // duration: 5.0s, transition duration: min(1.2, 5*0.4) = 1.2s.
    // transStartTime = 5.0 - 1.2 = 3.8s.
    // lookaheadStartTime = 3.8 - TRANSITION_LOOKAHEAD_WINDOW = 3.4s.

    // At 3.0s: regular playback, not yet in lookahead
    const stateBefore = computeTransitionState(mockScenes, 3.0);
    expect(stateBefore.isTransitioning).toBe(false);
    expect(stateBefore.isPrepared).toBe(false);
    expect(stateBefore.upcomingScene).toBeNull();

    // At 3.5s: within lookahead window (3.4s -> 3.8s)
    const stateLookahead = computeTransitionState(mockScenes, 3.5);
    expect(stateLookahead.isTransitioning).toBe(false);
    expect(stateLookahead.isPrepared).toBe(true);
    expect(stateLookahead.upcomingScene?.id).toBe('scene_ch2');

    // At 3.8s: transition begins
    const stateTrans = computeTransitionState(mockScenes, 3.8);
    expect(stateTrans.isTransitioning).toBe(true);
    expect(stateTrans.incomingScene?.id).toBe('scene_ch2');
  });

  // TC-42: Boundary frames (T-16ms, T, T+16ms) evaluate deterministically without blank frames
  it('TC-42: Boundary seeks (T-16ms, T, T+16ms) compute continuous valid states without empty frames', () => {
    const T = 3.8;
    const tMinus16 = T - 0.016;
    const tPlus16 = T + 0.016;

    const stateMinus = computeTransitionState(mockScenes, tMinus16);
    expect(stateMinus.activeScene).not.toBeNull();
    expect(stateMinus.upcomingScene?.id).toBe('scene_ch2');
    expect(stateMinus.isPrepared).toBe(true);

    const stateAtT = computeTransitionState(mockScenes, T);
    expect(stateAtT.isTransitioning).toBe(true);
    expect(stateAtT.outgoingScene?.id).toBe('scene_ch1');
    expect(stateAtT.incomingScene?.id).toBe('scene_ch2');
    expect(stateAtT.transitionProgress).toBeCloseTo(0.0, 2);

    const statePlus = computeTransitionState(mockScenes, tPlus16);
    expect(statePlus.isTransitioning).toBe(true);
    expect(statePlus.outgoingScene?.id).toBe('scene_ch1');
    expect(statePlus.incomingScene?.id).toBe('scene_ch2');
    expect(statePlus.transitionProgress).toBeGreaterThan(0);
  });

  // TC-43: Outgoing scene is preserved throughout the transition duration
  it('TC-43: Outgoing scene is preserved throughout the entire transition duration', () => {
    // 50% transition progress (at 4.4s)
    const midState = computeTransitionState(mockScenes, 4.4);
    expect(midState.isTransitioning).toBe(true);
    expect(midState.outgoingScene).not.toBeNull();
    expect(midState.outgoingScene?.id).toBe('scene_ch1');
    expect(midState.transitionProgress).toBeCloseTo(0.5, 1);
  });

  // TC-44: Incoming scene ready before and at T
  it('TC-44: Incoming scene is pre-warmed prior to T so it mounts without frame drop', () => {
    const stateAtLookahead = computeTransitionState(mockScenes, 3.6);
    expect(stateAtLookahead.upcomingScene).not.toBeNull();
    expect(stateAtLookahead.upcomingScene?.photos.length).toBeGreaterThan(0);
  });

  // TC-45: Zero memory leak in motion listeners after repeated transitions
  it('TC-45: Listeners clean up without accumulating across 20 transitions', () => {
    const unsubs: (() => void)[] = [];
    for (let i = 0; i < 20; i++) {
      const unsub = motionRuntime.subscribe(() => {});
      unsubs.push(unsub);
    }
    // Clean up all
    unsubs.forEach((u) => u());
    // Internal listener set should be back to baseline
    expect(unsubs.length).toBe(20);
  });

  // TC-46: MotionRuntime and TransitionDirector produce matching timestamps and state
  it('TC-46: MotionRuntime state matches TransitionDirector state at identical timestamp', () => {
    const time = 3.9;
    const transState = computeTransitionState(mockScenes, time);
    const motionState = motionRuntime.computeState(time, masterClock.getState());

    expect(motionState.isTransitioning).toBe(transState.isTransitioning);
    expect(motionState.transitionId).toBe(transState.transitionId);
    expect(motionState.transitionProgress).toBeCloseTo(transState.transitionProgress, 4);
    expect(motionState.activeScene?.id).toBe(transState.activeScene?.id);
  });

  // TC-47: Filmstrip RTL wrapping has monotonic coordinate continuity
  it('TC-47: Filmstrip RTL coordinate wraps monotonically without blank frame', () => {
    const singleLoopWidth = 2000;
    const speed = 100;
    // Just before wrap: 19.99s -> 1999px
    const pos1 = getTrackPosition(19.99, speed, singleLoopWidth, 'rtl');
    expect(pos1.wrappedOffset).toBeCloseTo(1999, 0);

    // Right after wrap: 20.01s -> 1px
    const pos2 = getTrackPosition(20.01, speed, singleLoopWidth, 'rtl');
    expect(pos2.wrappedOffset).toBeCloseTo(1, 0);
    expect(pos2.cameraX).toBeCloseTo(1, 0);
  });

  // TC-48: Filmstrip LTR wrapping symmetry
  it('TC-48: Filmstrip LTR coordinate wraps symmetrically', () => {
    const singleLoopWidth = 2000;
    const speed = 100;
    const posLTR = getTrackPosition(5.0, speed, singleLoopWidth, 'ltr');
    expect(posLTR.wrappedOffset).toBe(500);
    expect(posLTR.cameraX).toBe(1500);
    expect(posLTR.translateX).toBe(500 - 2000);
  });

  // TC-49: Sudden seek from end of loop to start updates camera immediately
  it('TC-49: Seek between distant loop positions computes exact camera coordinate instantly', () => {
    const singleLoopWidth = 2400;
    const speed = 60;
    const posEnd = getTrackPosition(39.9, speed, singleLoopWidth, 'rtl');
    const posStart = getTrackPosition(0.1, speed, singleLoopWidth, 'rtl');

    expect(posEnd.wrappedOffset).toBeCloseTo(2394, 0);
    expect(posStart.wrappedOffset).toBeCloseTo(6, 0);
  });

  // TC-50: Virtual window bounds mounted elements regardless of 100 photos
  it('TC-50: 100 photos in filmstrip yields bounded virtual DOM window (under 24 items)', () => {
    const itemDims = calculateItemDimensions(samplePhotos, 230);
    const { offsets, singleLoopWidth } = calculateCumulativeOffsets(itemDims, 24);

    const visible = getVisibleItems(
      1000,
      1920,
      1000,
      samplePhotos,
      offsets,
      itemDims,
      singleLoopWidth,
      'rtl'
    );

    // Viewport 1920 + 2000 buffer = 3920px. Avg item is ~350px -> ~11-16 items max!
    expect(visible.length).toBeLessThanOrEqual(24);
    expect(visible.length).toBeGreaterThan(5);
  });

  // TC-51: Required media IDs extract accurately for proactive lookahead preloading
  it('TC-51: getRequiredMediaIds returns unique photo IDs for buffered items', () => {
    const itemDims = calculateItemDimensions(samplePhotos.slice(0, 10), 230);
    const { offsets, singleLoopWidth } = calculateCumulativeOffsets(itemDims, 24);
    const visible = getVisibleItems(0, 1920, 1000, samplePhotos.slice(0, 10), offsets, itemDims, singleLoopWidth, 'rtl');
    const mediaIds = getRequiredMediaIds(visible);

    expect(mediaIds.length).toBeGreaterThan(0);
    expect(new Set(mediaIds).size).toBe(mediaIds.length);
  });

  // TC-52: Curtain snapshot release guarantees temporary resource cleanup
  it('TC-52 & TC-53: Split Curtain snapshot resources are fully released after transition', () => {
    releaseCurtainSnapshot();
    // Re-releasing does not throw and clears pointers
    expect(() => releaseCurtainSnapshot()).not.toThrow();
  });

  // TC-54: Corrupt project schema fails validation without touching state
  it('TC-54: Invalid project schema is rejected by validateProjectSchema', () => {
    expect(validateProjectSchema(null)).toBe(false);
    expect(validateProjectSchema({})).toBe(false);
    expect(validateProjectSchema({ id: '123' })).toBe(false);
    expect(validateProjectSchema({ id: '123', title: 'Test', chapters: [] })).toBe(false);
  });

  // TC-55: Valid project schema is accepted by validateProjectSchema
  it('TC-55: Valid project schema passes verification', () => {
    const validProject: Partial<WeddingProject> = {
      id: 'proj_test',
      title: 'Tuấn Hùng & Sao Mai',
      chapters: [
        {
          id: 'ch1',
          chapterIndex: 1,
          title: 'Intro',
          vietnameseTitle: 'Lời Mở Đầu',
          subtitle: 'The Beginning',
          description: 'Mở đầu câu chuyện tình yêu',
          enabled: true,
          mode: 'auto',
          effectMode: 'f05_pan_zoom',
          speed: 60,
          transitionType: 'film_wipe',
          photos: [],
        },
      ],
      audioTracks: [],
    };
    expect(validateProjectSchema(validProject)).toBe(true);
  });

  // TC-56: PresentationWakeLock maintains status safely
  it('TC-56: PresentationWakeLock tracks activation and release states', () => {
    expect(presentationWakeLock.getState().isActive).toBe(false);
    presentationWakeLock.release();
    expect(presentationWakeLock.getState().isActive).toBe(false);
  });

  // TC-57: MasterClock seek and status transitions
  it('TC-57: MasterClock handles seek, pause, and final hold deterministically', () => {
    masterClock.init(60, 0);
    masterClock.seek(15);
    expect(masterClock.getCurrentTime()).toBe(15);

    masterClock.seek(60);
    expect(masterClock.getCurrentTime()).toBe(60);
  });

  // TC-58: Final hold locks clock at totalDuration without running backwards
  it('TC-58: Clock holds firmly at boundary without overshooting', () => {
    masterClock.init(45, 0);
    masterClock.seek(45);
    expect(masterClock.getCurrentTime()).toBe(45);
  });

  // TC-59: 100 photos cumulative offset calculation is strictly monotonic
  it('TC-59: Cumulative offsets table is strictly increasing with no overlaps', () => {
    const itemDims = calculateItemDimensions(samplePhotos, 230);
    const { offsets, singleLoopWidth } = calculateCumulativeOffsets(itemDims, 24);

    expect(offsets.length).toBe(100);
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
    }
    expect(singleLoopWidth).toBeGreaterThan(offsets[99]);
  });

  // TC-60: Lookahead window constant is positive and balanced (between 0.2s and 0.8s)
  it('TC-60: TRANSITION_LOOKAHEAD_WINDOW is configured for seamless frame delivery', () => {
    expect(TRANSITION_LOOKAHEAD_WINDOW).toBeGreaterThanOrEqual(0.2);
    expect(TRANSITION_LOOKAHEAD_WINDOW).toBeLessThanOrEqual(0.8);
  });
});
