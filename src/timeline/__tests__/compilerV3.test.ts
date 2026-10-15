import { describe, it, expect } from 'vitest';
import { compileProjectTimeline } from '../compiler';
import { createInitialWeddingProject } from '../../project/defaultProject';
import { PhotoItem } from '../../types/project';

describe('Compiler V3 - Cinematic Architecture & Pacing', () => {
  it('TEST 1: Chapter 3 Proposal with 1 single photo compiles to exactly 5.5s in 1 sequence', () => {
    const project = createInitialWeddingProject();
    const ch3 = project.chapters.find((c) => c.chapterIndex === 3)!;

    // Set exactly 1 photo in proposal chapter
    ch3.photos = [
      {
        id: 'prop_hero_1',
        chapterId: ch3.id,
        url: 'blob:test-hero',
        originalWidth: 1920,
        originalHeight: 1080,
        aspectRatio: 16 / 9,
        cropMode: 'cover',
        focalPoint: { x: 50, y: 50 },
        order: 0,
        createdAt: Date.now(),
        isHero: true,
      },
    ];

    const timeline = compileProjectTimeline(project);
    const ch3Scenes = timeline.scenes.filter((s) => s.chapterIndex === 3);

    // Exactly 1 scene, total duration 5.5 seconds!
    expect(ch3Scenes.length).toBe(1);
    expect(ch3Scenes[0].duration).toBe(5.5);
    expect(ch3Scenes[0].type).toBe('film_to_hero');
  });

  it('TEST 2: Chapter 3 Proposal with multiple photos includes hero (5.5s) and paginated remaining photos', () => {
    const project = createInitialWeddingProject();
    const ch3 = project.chapters.find((c) => c.chapterIndex === 3)!;

    const mockPhotos: PhotoItem[] = Array.from({ length: 5 }, (_, i) => ({
      id: `prop_${i}`,
      chapterId: ch3.id,
      url: `blob:test-${i}`,
      originalWidth: 1920,
      originalHeight: 1080,
      aspectRatio: 16 / 9,
      cropMode: 'cover',
      focalPoint: { x: 50, y: 50 },
      order: i,
      createdAt: Date.now(),
      isHero: i === 0,
    }));

    ch3.photos = mockPhotos;

    const timeline = compileProjectTimeline(project);
    const ch3Scenes = timeline.scenes.filter((s) => s.chapterIndex === 3);

    // Hero scene (5.5s) + 2 collage scenes for remaining 4 photos
    expect(ch3Scenes.length).toBe(3);
    expect(ch3Scenes[0].duration).toBe(5.5);
    // All 5 photos must be accounted for across ch3Scenes
    const totalPhotosRendered = ch3Scenes.reduce((acc, s) => acc + s.photos.length, 0);
    expect(totalPhotosRendered).toBe(5);
  });

  it('TEST 3: Chapter 5 Wedding Climax with 30 photos compiles without skipping any photo and provides diverse layouts', () => {
    const project = createInitialWeddingProject();
    const ch5 = project.chapters.find((c) => c.chapterIndex === 5)!;

    const mock30Photos: PhotoItem[] = Array.from({ length: 30 }, (_, i) => ({
      id: `wedding_p_${i}`,
      chapterId: ch5.id,
      url: `blob:wedding-${i}`,
      originalWidth: 1920,
      originalHeight: 1080,
      aspectRatio: 16 / 9,
      cropMode: 'cover',
      focalPoint: { x: 50, y: 50 },
      order: i,
      createdAt: Date.now(),
    }));

    ch5.photos = mock30Photos;

    const timeline = compileProjectTimeline(project);
    const ch5Scenes = timeline.scenes.filter((s) => s.chapterIndex === 5);

    // Verify all 30 photos are represented
    const compiledIds = new Set<string>();
    ch5Scenes.forEach((s) => s.photos.forEach((p) => compiledIds.add(p.id)));
    expect(compiledIds.size).toBe(30);

    // Verify layout diversity across scenes (not just a single scene type!)
    const sceneTypes = new Set(ch5Scenes.map((s) => s.type));
    expect(sceneTypes.size).toBeGreaterThanOrEqual(2);
  });

  it('TEST 4: Chapter 6 Thank You has ~14s duration and valid typography metadata', () => {
    const project = createInitialWeddingProject();
    const timeline = compileProjectTimeline(project);
    const ch6Scenes = timeline.scenes.filter((s) => s.chapterIndex === 6);

    expect(ch6Scenes.length).toBe(1);
    expect(ch6Scenes[0].duration).toBeGreaterThanOrEqual(14);
    expect(ch6Scenes[0].type).toBe('thank_you');
  });

  it('TEST 5: Total movie duration is finite and reasonable (not 36000 seconds)', () => {
    const project = createInitialWeddingProject();
    const timeline = compileProjectTimeline(project);

    expect(timeline.totalDuration).toBeGreaterThan(60);
    expect(timeline.totalDuration).toBeLessThan(600); // 1 to 10 minutes, realistic wedding movie!
  });
});
