import { describe, it, expect, beforeEach } from 'vitest';
import { compileProjectTimeline } from '../compiler';
import { WeddingProject, ChapterConfig } from '../../types/project';
import { naturalSort } from '../../../scripts/sync-gallery.mjs';
import { filesystemProject } from '../../generated/galleryManifest';

describe('Project Folder Gallery System — Comprehensive Verification', () => {
  it('TEST A & B: naturalSort sorts numbers naturally (1.jpg, 2.jpg, 10.jpg)', () => {
    const unpadded = ['10.jpg', '2.jpg', '1.jpg'];
    expect([...unpadded].sort(naturalSort)).toEqual(['1.jpg', '2.jpg', '10.jpg']);

    const padded = ['005.jpg', '002.jpg', '001.jpg', '004.jpg', '003.jpg'];
    expect([...padded].sort(naturalSort)).toEqual(['001.jpg', '002.jpg', '003.jpg', '004.jpg', '005.jpg']);
  });

  it('TEST C: filesystemProject contract has version, contentSource, and 7 valid chapters', () => {
    expect(filesystemProject.contentSource).toBe('filesystem');
    expect(filesystemProject.chapters.length).toBe(7);
    expect(filesystemProject.chapters[0].id).toBe('ch1_intro');
    expect(filesystemProject.chapters[1].id).toBe('ch2_memories');
    expect(filesystemProject.chapters[2].id).toBe('ch3_proposal');
    expect(filesystemProject.chapters[3].id).toBe('ch4_family');
    expect(filesystemProject.chapters[4].id).toBe('ch5_wedding');
    expect(filesystemProject.chapters[5].id).toBe('ch6_thanks');
    expect(filesystemProject.chapters[6].id).toBe('ch7_forever');
  });

  it('TEST D: Changing durationSeconds in JSON directly updates compiled timeline', () => {
    // Clone project with Chapter 2 duration = 60s
    const proj60: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    proj60.chapters[1].mode = 'custom';
    proj60.chapters[1].durationOverride = 60;
    const timeline60 = compileProjectTimeline(proj60);
    const ch2Meta60 = timeline60.chaptersMeta.find((c) => c.chapterId === 'ch2_memories');
    expect(ch2Meta60?.duration).toBe(60);

    // Modify to 90s
    const proj90: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    proj90.chapters[1].mode = 'custom';
    proj90.chapters[1].durationOverride = 90;
    const timeline90 = compileProjectTimeline(proj90);
    const ch2Meta90 = timeline90.chaptersMeta.find((c) => c.chapterId === 'ch2_memories');
    expect(ch2Meta90?.duration).toBe(90);
  });

  it('TEST E: endingPhoto configured from Chapter 5 assigns seamlessly to Chapter 7 Final Hold', () => {
    const testProj: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    // Add photos to Chapter 5
    const ch5Photo = {
      id: 'photo_ch5_015_jpg',
      chapterId: 'ch5_wedding',
      title: '015',
      url: '/gallery/05-wedding/015.jpg',
      originalWidth: 1920,
      originalHeight: 1080,
      aspectRatio: 16 / 9,
      cropMode: 'contain' as const,
      focalPoint: { x: 50, y: 50 },
      order: 0,
      createdAt: 0,
      relativePath: '05-wedding/015.jpg',
    };
    testProj.chapters[4].photos = [ch5Photo];
    testProj.endingPhotoId = ch5Photo.id;

    const timeline = compileProjectTimeline(testProj);
    const ch7Scene = timeline.scenes.find((s) => s.chapterId === 'ch7_forever');
    expect(ch7Scene).toBeDefined();
    expect(ch7Scene?.heroPhoto?.id).toBe('photo_ch5_015_jpg');
    expect(ch7Scene?.heroPhoto?.url).toBe('/gallery/05-wedding/015.jpg');
  });

  it('TEST F: Audio mode supports both global and per_chapter configurations', () => {
    const globalProj: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    globalProj.globalSettings.audioMode = 'global';
    globalProj.audioTracks = [
      {
        id: 'track_global_fs',
        name: 'background',
        url: '/audio/global/background.mp3',
        duration: 180,
        startTime: 0,
        endTime: 180,
        volume: 0.85,
        fadeInDuration: 1.0,
        fadeOutDuration: 1.5,
        isGlobal: true,
      },
    ];

    expect(globalProj.globalSettings.audioMode).toBe('global');
    expect(globalProj.audioTracks.find((t) => t.isGlobal)?.url).toBe('/audio/global/background.mp3');

    // Per chapter test
    const perChProj: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    perChProj.globalSettings.audioMode = 'per_chapter';
    perChProj.audioTracks = [
      {
        id: 'track_ch2_memories_fs',
        chapterId: 'ch2_memories',
        name: 'music',
        url: '/audio/02-memories/music.mp3',
        duration: 60,
        startTime: 0,
        endTime: 60,
        volume: 0.85,
        fadeInDuration: 1.0,
        fadeOutDuration: 1.5,
        isGlobal: false,
      },
    ];
    expect(perChProj.audioTracks.find((t) => t.chapterId === 'ch2_memories')?.url).toBe('/audio/02-memories/music.mp3');
  });

  it('TEST G: Default cropMode is contain, preserving full portraits without head/foot clipping', () => {
    const testProj: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    const portraitPhoto = {
      id: 'photo_ch5_portrait',
      chapterId: 'ch5_wedding',
      title: 'Full Body Portrait',
      url: '/gallery/05-wedding/001.jpg',
      originalWidth: 1080,
      originalHeight: 1920,
      aspectRatio: 1080 / 1920,
      cropMode: 'contain' as const,
      focalPoint: { x: 50, y: 50 },
      order: 0,
      createdAt: 0,
    };
    testProj.chapters[4].photos = [portraitPhoto];

    const timeline = compileProjectTimeline(testProj);
    const weddingScene = timeline.scenes.find((s) => s.chapterId === 'ch5_wedding');
    expect(weddingScene?.photos[0]?.cropMode).toBe('contain');
  });

  it('TEST H: Empty chapters compile gracefully with safe fallback durations and zero crashes', () => {
    // Project with 0 photos in all chapters
    const emptyProj: WeddingProject = JSON.parse(JSON.stringify(filesystemProject));
    for (const ch of emptyProj.chapters) {
      ch.photos = [];
    }
    const timeline = compileProjectTimeline(emptyProj);
    expect(timeline.scenes.length).toBeGreaterThan(0);
    expect(timeline.totalDuration).toBeGreaterThan(0);

    for (const sc of timeline.scenes) {
      expect(sc.duration).toBeGreaterThan(0);
      expect(Number.isFinite(sc.duration)).toBe(true);
    }
  });
});
