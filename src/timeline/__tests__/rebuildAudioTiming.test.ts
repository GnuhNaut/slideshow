import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInitialWeddingProject } from '../../project/defaultProject';
import { compileProjectTimeline } from '../compiler';
import { AudioDirectorEngine, audioDirector } from '../../audio/AudioDirector';
import { masterClock } from '../../player/PlaybackClock';

describe('FINAL REBUILD — TIMING & AUDIO DIRECTOR ACCEPTANCE TESTS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-101: All 7 chapters accept custom duration overrides in compiler', () => {
    const project = createInitialWeddingProject();

    // Set custom durations across all 7 chapters
    project.chapters[0].mode = 'custom';
    project.chapters[0].durationOverride = 10; // Ch 1: Intro

    project.chapters[1].mode = 'custom';
    project.chapters[1].durationOverride = 25; // Ch 2: Memories

    project.chapters[2].mode = 'custom';
    project.chapters[2].durationOverride = 15; // Ch 3: Proposal

    project.chapters[3].mode = 'custom';
    project.chapters[3].durationOverride = 20; // Ch 4: Family

    project.chapters[4].mode = 'custom';
    project.chapters[4].durationOverride = 45; // Ch 5: Wedding

    project.chapters[5].mode = 'custom';
    project.chapters[5].durationOverride = 30; // Ch 6: Thank You

    project.chapters[6].mode = 'custom';
    project.chapters[6].durationOverride = 5.0; // Ch 7: Our Forever reveal

    const compiled = compileProjectTimeline(project);

    const ch1Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 1);
    const ch2Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 2);
    const ch3Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 3);
    const ch4Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 4);
    const ch5Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 5);
    const ch6Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 6);
    const ch7Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 7);

    expect(ch1Meta?.duration).toBe(10);
    expect(ch2Meta?.duration).toBe(25);
    expect(ch3Meta?.duration).toBe(15);
    expect(ch4Meta?.duration).toBe(20);
    expect(ch5Meta?.duration).toBe(45);
    expect(ch6Meta?.duration).toBe(30);
    expect(ch7Meta?.duration).toBe(5.0);
  });

  it('TC-102: Scene duration overrides take precedence inside multi-scene chapters', () => {
    const project = createInitialWeddingProject();
    const ch5 = project.chapters.find((c) => c.chapterIndex === 5)!;

    // Overriding a specific scene inside Chapter 5
    ch5.sceneDurationOverrides = {
      [`${ch5.id}_scene_wedding_split_1`]: 9.5,
    };

    const compiled = compileProjectTimeline(project);
    const overriddenScene = compiled.scenes.find((s) => s.id === `${ch5.id}_scene_wedding_split_1`);

    expect(overriddenScene).toBeDefined();
    expect(overriddenScene?.duration).toBe(9.5);
  });

  it('TC-103: Chapter 2 speed modes adjust px/sec accurately', () => {
    const project = createInitialWeddingProject();
    const ch2 = project.chapters.find((c) => c.chapterIndex === 2)!;

    // Test slow mode
    ch2.filmstripSpeedMode = 'slow';
    let compiled = compileProjectTimeline(project);
    let scene = compiled.scenes.find((s) => s.chapterIndex === 2);
    expect(scene?.config.speed).toBe(34);

    // Test medium mode
    ch2.filmstripSpeedMode = 'medium';
    compiled = compileProjectTimeline(project);
    scene = compiled.scenes.find((s) => s.chapterIndex === 2);
    expect(scene?.config.speed).toBe(50);

    // Test fast mode
    ch2.filmstripSpeedMode = 'fast';
    compiled = compileProjectTimeline(project);
    scene = compiled.scenes.find((s) => s.chapterIndex === 2);
    expect(scene?.config.speed).toBe(72);

    // Test custom mode
    ch2.filmstripSpeedMode = 'custom';
    ch2.filmstripSpeedCustom = 88;
    compiled = compileProjectTimeline(project);
    scene = compiled.scenes.find((s) => s.chapterIndex === 2);
    expect(scene?.config.speed).toBe(88);
  });

  it('TC-104: Chapter 2 visual toggles default names to OFF as requested by user', () => {
    const project = createInitialWeddingProject();
    const ch2 = project.chapters.find((c) => c.chapterIndex === 2)!;

    const compiled = compileProjectTimeline(project);
    const ch2Scene = compiled.scenes.find((s) => s.chapterIndex === 2)!;

    // By default, center names, frame names, and metadata must be FALSE
    expect(ch2Scene.config.showCenterNames).toBe(false);
    expect(ch2Scene.config.showFrameNames).toBe(false);
    expect(ch2Scene.config.showMetadata35mm).toBe(false);
    expect(ch2Scene.config.showCenterTitle).toBe(true);
    expect(ch2Scene.config.showQuote).toBe(true);

    // Enabling frame names passes to scene.config
    ch2.showFrameNames = true;
    const compiled2 = compileProjectTimeline(project);
    const ch2Scene2 = compiled2.scenes.find((s) => s.chapterIndex === 2)!;
    expect(ch2Scene2.config.showFrameNames).toBe(true);
  });

  it('TC-105: AudioDirector switches between Global Mode and Per-Chapter Mode', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);

    // Add 2 audio tracks
    project.audioTracks = [
      {
        id: 'track_global',
        name: 'A Thousand Years',
        url: 'https://test.com/track1.mp3',
        duration: 180,
        startTime: 0,
        endTime: 180,
        volume: 0.85,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        isGlobal: true,
      },
      {
        id: 'track_ch2',
        name: 'Canon in D',
        url: 'https://test.com/track2.mp3',
        duration: 120,
        startTime: 0,
        endTime: 120,
        volume: 0.9,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        isGlobal: false,
      },
    ];

    project.chapters[1].musicTrackId = 'track_ch2'; // Assign Ch 2
    project.globalSettings.audioMode = 'global';

    audioDirector.setProject(project, compiled);
    expect(audioDirector.getState().mode).toBe('global');
    expect(audioDirector.getActiveTrack()?.id).toBe('track_global');

    // Switch to Per-Chapter Mode
    project.globalSettings.audioMode = 'per_chapter';
    audioDirector.setProject(project, compiled);
    expect(audioDirector.getState().mode).toBe('per_chapter');
  });

  it('TC-106: AudioDirector seek accurately maps chapter offsets in Per-Chapter mode', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);

    project.audioTracks = [
      {
        id: 'track_ch1',
        name: 'Opening Ch1',
        url: 'https://test.com/ch1.mp3',
        duration: 60,
        startTime: 0,
        endTime: 60,
        volume: 0.8,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        isGlobal: false,
      },
      {
        id: 'track_ch2',
        name: 'Memories Ch2',
        url: 'https://test.com/ch2.mp3',
        duration: 60,
        startTime: 0,
        endTime: 60,
        volume: 0.8,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        isGlobal: false,
      },
    ];

    project.chapters[0].musicTrackId = 'track_ch1';
    project.chapters[1].musicTrackId = 'track_ch2';
    project.globalSettings.audioMode = 'per_chapter';

    audioDirector.setProject(project, compiled);

    const ch2Meta = compiled.chaptersMeta.find((c) => c.chapterIndex === 2)!;
    // Seek to 5 seconds inside Chapter 2
    audioDirector.seek(ch2Meta.startTime + 5);

    expect(audioDirector.getState().activeChapterIndex).toBe(2);
  });

  it('TC-107: Final image hold does not fade or pause the soundtrack', () => {
    const fadeSpy = vi.spyOn(audioDirector as any, 'fadeOutAndStop');
    const silenceSpy = vi.spyOn(audioDirector as any, 'fadeToSilence');
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);

    project.globalSettings.audioMode = 'per_chapter';
    project.audioTracks = [{
      id: 'track_ch6',
      chapterId: project.chapters[5].id,
      name: 'Final song',
      url: 'https://test.com/final.mp3',
      duration: 180,
      startTime: 0,
      endTime: 180,
      volume: 0.85,
      fadeInDuration: 1,
      fadeOutDuration: 1,
      isGlobal: false,
    }];
    project.chapters[5].musicTrackId = 'track_ch6';
    audioDirector.setProject(project, compiled);

    const switchChapterTrack = (audioDirector as any).switchChapterTrack.bind(audioDirector);
    switchChapterTrack(6, 0, false);
    switchChapterTrack(7, 0, false);
    masterClock.enterFinalHold();

    expect(silenceSpy).not.toHaveBeenCalled();
    expect(fadeSpy).not.toHaveBeenCalled();

    silenceSpy.mockRestore();
    fadeSpy.mockRestore();
    masterClock.play();
    masterClock.pause();
  });

  it('TC-108: Pause and resume preserves the exact soundtrack position', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);
    project.globalSettings.audioMode = 'global';
    project.globalSettings.loopGlobalAudio = true;
    project.audioTracks = [{
      id: 'track_resume',
      name: 'Continuous soundtrack',
      url: '/audio/global/resume.mp3',
      duration: 180,
      startTime: 0,
      endTime: 180,
      volume: 0.85,
      fadeInDuration: 1,
      fadeOutDuration: 1,
      isGlobal: true,
    }];

    let sourceAssignments = 0;
    let source = '';
    const fakeAudio = {
      currentTime: 0,
      duration: 180,
      volume: 1,
      loop: false,
      paused: true,
      preload: 'auto',
      play: vi.fn(function (this: { paused: boolean }) {
        this.paused = false;
        return Promise.resolve();
      }),
      pause: vi.fn(function (this: { paused: boolean }) {
        this.paused = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as HTMLAudioElement;

    Object.defineProperty(fakeAudio, 'src', {
      configurable: true,
      get: () => source,
      set: (value: string) => {
        source = value;
        sourceAssignments += 1;
        fakeAudio.currentTime = 0;
      },
    });

    const director = new AudioDirectorEngine();
    (director as unknown as { channelA: HTMLAudioElement }).channelA = fakeAudio;
    masterClock.init(compiled.totalDuration, 42);
    director.setProject(project, compiled);

    director.resume();
    expect(fakeAudio.currentTime).toBe(42);
    expect(sourceAssignments).toBe(1);

    fakeAudio.currentTime = 57.25;
    director.pause();
    director.resume();

    expect(sourceAssignments).toBe(1);
    expect(fakeAudio.currentTime).toBe(57.25);
    director.destroy();
  });

  it('TC-109: Final hold keeps audio running while the last image stays visible', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);
    project.globalSettings.audioMode = 'global';
    project.audioTracks = [{
      id: 'track_final_hold',
      name: 'Final hold soundtrack',
      url: '/audio/global/final-hold.mp3',
      duration: 180,
      startTime: 0,
      endTime: 180,
      volume: 0.85,
      fadeInDuration: 1,
      fadeOutDuration: 1,
      isGlobal: true,
    }];

    const fakeAudio = {
      src: '/audio/global/final-hold.mp3',
      currentTime: 75,
      duration: 180,
      volume: 0.85,
      loop: true,
      paused: true,
      preload: 'auto',
      play: vi.fn(function (this: { paused: boolean }) {
        this.paused = false;
        return Promise.resolve();
      }),
      pause: vi.fn(function (this: { paused: boolean }) {
        this.paused = true;
      }),
      addEventListener: vi.fn(),
    } as unknown as HTMLAudioElement;

    const director = new AudioDirectorEngine();
    (director as unknown as { channelA: HTMLAudioElement }).channelA = fakeAudio;
    director.setProject(project, compiled);
    masterClock.init(compiled.totalDuration, compiled.totalDuration);
    masterClock.enterFinalHold();

    expect(fakeAudio.play).toHaveBeenCalledTimes(1);
    expect(fakeAudio.pause).not.toHaveBeenCalled();
    expect(fakeAudio.currentTime).toBe(75);
    director.destroy();
  });
});
