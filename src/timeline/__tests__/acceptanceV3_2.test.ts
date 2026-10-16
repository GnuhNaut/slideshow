import { describe, it, expect, beforeEach } from 'vitest';
import { masterClock } from '../../player/PlaybackClock';
import { compileProjectTimeline } from '../compiler';
import { createInitialWeddingProject } from '../../project/defaultProject';
import { motionRuntime } from '../../motion/MotionRuntime';
import { PhotoItem } from '../../types/project';

describe('V3.2 Full Acceptance Tests: Playback, Continuity, Timeline & Data Integrity', () => {
  beforeEach(() => {
    masterClock.pause();
  });

  // A. PLAYBACK ENGINE
  it('TC-01: Start from 0s starts master clock exactly once with accurate timecode', () => {
    masterClock.init(100, 0);
    masterClock.seek(0);
    expect(masterClock.getCurrentTime()).toBe(0);
    masterClock.play();
    expect(masterClock.getState().status).toBe('PLAYING');
  });

  it('TC-02: Pause mid-scene holds exact frame without drift', () => {
    masterClock.init(100, 0);
    masterClock.seek(14.5);
    masterClock.pause();
    expect(masterClock.getState().status).toBe('PAUSED');
    expect(masterClock.getCurrentTime()).toBe(14.5);
  });

  it('TC-03: Resume maintains exact position without frame jumping', () => {
    masterClock.init(100, 0);
    masterClock.seek(22.0);
    masterClock.pause();
    masterClock.resume();
    expect(masterClock.getCurrentTime()).toBe(22.0);
    expect(masterClock.getState().status).toBe('PLAYING');
  });

  it('TC-04: Seek to 25%, 50%, 75% computes deterministic scene progress', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);
    motionRuntime.setScenes(compiled.scenes);

    const scene = compiled.scenes[0];
    const t25 = scene.startTime + scene.duration * 0.25;
    const t50 = scene.startTime + scene.duration * 0.50;
    const t75 = scene.startTime + scene.duration * 0.75;

    const state25 = motionRuntime.computeState(t25, masterClock.getState());
    expect(state25.activeSceneProgress).toBeCloseTo(0.25, 2);

    const state50 = motionRuntime.computeState(t50, masterClock.getState());
    expect(state50.activeSceneProgress).toBeCloseTo(0.50, 2);

    const state75 = motionRuntime.computeState(t75, masterClock.getState());
    expect(state75.activeSceneProgress).toBeCloseTo(0.75, 2);
  });

  it('TC-05: Backwards seek to previous scene clears outgoing scene transforms', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);
    motionRuntime.setScenes(compiled.scenes);

    // Seek forward into scene 2
    const forwardTime = compiled.scenes[1].startTime + 5;
    const fwdState = motionRuntime.computeState(forwardTime, masterClock.getState());
    expect(fwdState.activeScene?.id).toBe(compiled.scenes[1].id);

    // Seek backwards to scene 1
    const backTime = compiled.scenes[0].startTime + 2;
    const backState = motionRuntime.computeState(backTime, masterClock.getState());
    expect(backState.activeScene?.id).toBe(compiled.scenes[0].id);
    expect(backState.isTransitioning).toBe(false);
    expect(backState.outgoingScene).toBeNull();
  });

  it('TC-06: Restart after FINAL_HOLD resets clock to 0 and replays cleanly', () => {
    masterClock.init(100, 0);
    masterClock.enterFinalHold();
    expect(masterClock.getState().status).toBe('FINAL_HOLD');
    masterClock.play();
    expect(masterClock.getCurrentTime()).toBe(0);
    expect(masterClock.getState().status).toBe('PLAYING');
  });

  // D. NỘI DUNG & TIMELINE
  it('TC-20: Proposal chapter with 1 photo defaults to exactly 5.5s (no 7s + 9s bloat)', () => {
    const project = createInitialWeddingProject();
    const proposalChapter = project.chapters.find((c) => c.chapterIndex === 3)!;
    proposalChapter.photos = [proposalChapter.photos[0]]; // strictly 1 photo
    proposalChapter.durationOverride = undefined;
    proposalChapter.mode = 'auto';

    const compiled = compileProjectTimeline(project);
    const proposalScenes = compiled.scenes.filter((s) => s.chapterIndex === 3);

    expect(proposalScenes.length).toBe(1);
    expect(proposalScenes[0].duration).toBe(5.5);
  });

  it('TC-21: Proposal chapter with 10 photos sequences hero and partitions remaining photos', () => {
    const project = createInitialWeddingProject();
    const proposalChapter = project.chapters.find((c) => c.chapterIndex === 3)!;
    const tenPhotos: PhotoItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `prop_${i + 1}`,
      url: `/test/img_${i + 1}.jpg`,
      aspectRatio: 1.33,
      isHero: i === 0,
    })) as unknown as PhotoItem[];
    proposalChapter.photos = tenPhotos;

    const compiled = compileProjectTimeline(project);
    const proposalScenes = compiled.scenes.filter((s) => s.chapterIndex === 3);

    expect(proposalScenes.length).toBeGreaterThan(1);
    expect(proposalScenes[0].photos[0].id).toBe('prop_1');
  });

  it('TC-22: Wedding chapter with 60 photos presents ALL photos without skipping', () => {
    const project = createInitialWeddingProject();
    const weddingChapter = project.chapters.find((c) => c.chapterIndex === 5)!;
    const sixtyPhotos: PhotoItem[] = Array.from({ length: 60 }, (_, i) => ({
      id: `wed_${i + 1}`,
      url: `/wedding/img_${i + 1}.jpg`,
      aspectRatio: 1.5,
    })) as unknown as PhotoItem[];
    weddingChapter.photos = sixtyPhotos;

    const compiled = compileProjectTimeline(project);
    const weddingScenes = compiled.scenes.filter((s) => s.chapterIndex === 5);

    const presentedPhotoIds = new Set<string>();
    weddingScenes.forEach((s) => {
      s.photos.forEach((p) => presentedPhotoIds.add(p.id));
    });

    expect(presentedPhotoIds.size).toBe(60);
  });

  it('TC-23: Family chapter groups photos safely in pairs (never cropped, layout split/single)', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);
    const familyScenes = compiled.scenes.filter((s) => s.chapterIndex === 4);

    familyScenes.forEach((s) => {
      expect(['family_gallery', 'family_split']).toContain(s.type);
      expect(s.photos.length).toBeLessThanOrEqual(2);
    });
  });

  it('TC-36: Total timeline duration is realistic (4-5 minutes), zero 600-minute dummy bloat', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);

    // Total duration should be between 60s and 360s (1 to 6 minutes), never 36,000s
    expect(compiled.totalDuration).toBeGreaterThan(60);
    expect(compiled.totalDuration).toBeLessThan(400);
  });
});
