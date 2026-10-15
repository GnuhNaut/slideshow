import { describe, it, expect } from 'vitest';
import { compileProjectTimeline } from '../compiler';
import { createInitialWeddingProject } from '../../project/defaultProject';
import { PhotoItem } from '../../types/project';

function makeMockPhotos(chapterId: string, count: number): PhotoItem[] {
  const list: PhotoItem[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `${chapterId}_p_${i}`,
      chapterId,
      title: `Photo ${i + 1}`,
      url: `data:image/svg+xml;utf8,<svg></svg>`,
      originalWidth: i % 2 === 0 ? 1920 : 1080,
      originalHeight: i % 2 === 0 ? 1080 : 1440,
      aspectRatio: i % 2 === 0 ? 16 / 9 : 3 / 4,
      cropMode: 'cover',
      focalPoint: { x: 50, y: 50 },
      order: i,
      createdAt: Date.now() + i,
    });
  }
  return list;
}

describe('V2 Auto Director Compiler — No Photos Left Behind', () => {
  it('should include all 20 photos in Chapter 2 (Memories) filmstrip without truncation', () => {
    const project = createInitialWeddingProject();
    const ch2 = project.chapters.find((c) => c.id === 'ch2_memories')!;
    ch2.photos = makeMockPhotos('ch2_memories', 20);

    const compiled = compileProjectTimeline(project);
    const filmrollScene = compiled.scenes.find((s) => s.chapterId === 'ch2_memories')!;

    expect(filmrollScene).toBeDefined();
    expect(filmrollScene.photos.length).toBe(20);
    // Verified: all 20 photos present in order
    expect(filmrollScene.photos[0].id).toBe('ch2_memories_p_0');
    expect(filmrollScene.photos[19].id).toBe('ch2_memories_p_19');
  });

  it('should partition all 20 photos in Chapter 4 (Family) without leaving any photo behind', () => {
    const project = createInitialWeddingProject();
    const ch4 = project.chapters.find((c) => c.id === 'ch4_family')!;
    ch4.photos = makeMockPhotos('ch4_family', 20);

    const compiled = compileProjectTimeline(project);
    const familyScenes = compiled.scenes.filter((s) => s.chapterId === 'ch4_family');

    const totalPresentedPhotos = familyScenes.reduce((acc, s) => acc + s.photos.length, 0);
    expect(totalPresentedPhotos).toBe(20);
  });

  it('should sequence all 60 photos in Chapter 5 (Wedding Montage) with 0 photos dropped', () => {
    const project = createInitialWeddingProject();
    const ch5 = project.chapters.find((c) => c.id === 'ch5_wedding')!;
    ch5.photos = makeMockPhotos('ch5_wedding', 60);

    const compiled = compileProjectTimeline(project);
    const weddingScenes = compiled.scenes.filter((s) => s.chapterId === 'ch5_wedding');

    const totalPresentedPhotos = weddingScenes.reduce((acc, s) => acc + s.photos.length, 0);
    expect(totalPresentedPhotos).toBe(60);
  });

  it('should have a realistic finite timeline duration without 10-hour fake final hold', () => {
    const project = createInitialWeddingProject();
    const compiled = compileProjectTimeline(project);

    const finalScene = compiled.scenes.find((s) => s.chapterId === 'ch7_forever')!;
    expect(finalScene.duration).toBe(12);

    // Total duration should be in reasonable minutes (between 100s and 300s), NOT 36000s+!
    expect(compiled.totalDuration).toBeLessThan(600);
    expect(compiled.totalDuration).toBeGreaterThan(60);
  });
});
