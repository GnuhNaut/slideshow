import { describe, it, expect } from 'vitest';
import { compileProjectTimeline, calculateChapterAutoDuration, getChapterEffectiveDuration } from '../compiler';
import { createInitialWeddingProject } from '../../project/defaultProject';
import { WeddingProject, ChapterConfig, PhotoItem } from '../../types/project';

describe('Emergency Production Release - Functional Validation', () => {
  it('P0-1: Chapter 1 duration override applies correctly in custom mode', () => {
    const project = createInitialWeddingProject();
    const ch1 = project.chapters.find((c) => c.chapterIndex === 1)!;
    ch1.mode = 'custom';
    ch1.durationOverride = 25;

    const compiled = compileProjectTimeline(project);
    const meta = compiled.chaptersMeta.find((m) => m.chapterIndex === 1)!;
    expect(meta.duration).toBe(25);
    expect(compiled.scenes.find((s) => s.chapterId === ch1.id)?.duration).toBe(25);
  });

  it('P0-1: Chapter 2 duration override applies correctly in custom mode', () => {
    const project = createInitialWeddingProject();
    const ch2 = project.chapters.find((c) => c.chapterIndex === 2)!;
    ch2.mode = 'custom';
    ch2.durationOverride = 45;

    const compiled = compileProjectTimeline(project);
    const meta = compiled.chaptersMeta.find((m) => m.chapterIndex === 2)!;
    expect(meta.duration).toBe(45);
    expect(compiled.scenes.find((s) => s.chapterId === ch2.id)?.duration).toBe(45);
  });

  it('P0-1: Chapter 3 duration override scales proportionally across scenes in custom mode', () => {
    const project = createInitialWeddingProject();
    const ch3 = project.chapters.find((c) => c.chapterIndex === 3)!;
    ch3.mode = 'custom';
    ch3.durationOverride = 30;

    const compiled = compileProjectTimeline(project);
    const meta = compiled.chaptersMeta.find((m) => m.chapterIndex === 3)!;
    expect(meta.duration).toBeCloseTo(30, 1);
  });

  it('P0-1: Chapter 4 duration override scales proportionally across scenes in custom mode', () => {
    const project = createInitialWeddingProject();
    const ch4 = project.chapters.find((c) => c.chapterIndex === 4)!;
    ch4.mode = 'custom';
    ch4.durationOverride = 40;

    const compiled = compileProjectTimeline(project);
    const meta = compiled.chaptersMeta.find((m) => m.chapterIndex === 4)!;
    expect(meta.duration).toBeCloseTo(40, 1);
  });

  it('P0-1: Chapter 5 with multiple photos respects 60s, 90s, and switches back to AUTO', () => {
    const project = createInitialWeddingProject();
    const ch5 = project.chapters.find((c) => c.chapterIndex === 5)!;

    // 1. AUTO mode check
    ch5.mode = 'auto';
    ch5.durationOverride = undefined;
    const autoCompiled = compileProjectTimeline(project);
    const autoMeta = autoCompiled.chaptersMeta.find((m) => m.chapterIndex === 5)!;
    const autoDuration = calculateChapterAutoDuration(ch5, project);
    expect(autoMeta.duration).toBeCloseTo(autoDuration, 1);

    // 2. CUSTOM 60s check
    ch5.mode = 'custom';
    ch5.durationOverride = 60;
    const compiled60 = compileProjectTimeline(project);
    const meta60 = compiled60.chaptersMeta.find((m) => m.chapterIndex === 5)!;
    expect(meta60.duration).toBeCloseTo(60, 1);

    // 3. CUSTOM 90s check
    ch5.durationOverride = 90;
    const compiled90 = compileProjectTimeline(project);
    const meta90 = compiled90.chaptersMeta.find((m) => m.chapterIndex === 5)!;
    expect(meta90.duration).toBeCloseTo(90, 1);

    // 4. Return to AUTO mode check
    ch5.mode = 'auto';
    const compiledAutoAgain = compileProjectTimeline(project);
    const metaAutoAgain = compiledAutoAgain.chaptersMeta.find((m) => m.chapterIndex === 5)!;
    expect(metaAutoAgain.duration).toBeCloseTo(autoDuration, 1);
  });

  it('P0-1: Chapter 6 duration override applies correctly in custom mode', () => {
    const project = createInitialWeddingProject();
    const ch6 = project.chapters.find((c) => c.chapterIndex === 6)!;
    ch6.mode = 'custom';
    ch6.durationOverride = 22;

    const compiled = compileProjectTimeline(project);
    const meta = compiled.chaptersMeta.find((m) => m.chapterIndex === 6)!;
    expect(meta.duration).toBe(22);
  });

  it('P0-1 & P0-2: Chapter 7 has realistic finite 2s reveal and resolves ending photo from Chapter 5', () => {
    const project = createInitialWeddingProject();
    const ch5 = project.chapters.find((c) => c.chapterIndex === 5)!;
    expect(ch5.photos.length).toBeGreaterThan(0);
    const targetPhotoFromCh5 = ch5.photos[2];

    // User chooses a photo from Chapter 5 as the ending photo!
    project.endingPhotoId = targetPhotoFromCh5.id;

    const compiled = compileProjectTimeline(project);
    const finalScene = compiled.scenes.find((s) => s.chapterId === 'ch7_forever')!;
    expect(finalScene).toBeDefined();
    expect(finalScene.duration).toBe(2.0); // Clean 2-second entrance reveal
    expect(finalScene.heroPhoto?.id).toBe(targetPhotoFromCh5.id);
    expect(finalScene.photos[0]?.id).toBe(targetPhotoFromCh5.id);
  });

  it('P0-2: If endingPhotoId references photo in Chapter 2, Chapter 7 resolves to it seamlessly', () => {
    const project = createInitialWeddingProject();
    const ch2 = project.chapters.find((c) => c.chapterIndex === 2)!;
    const photoFromCh2 = ch2.photos[1];
    project.endingPhotoId = photoFromCh2.id;

    const compiled = compileProjectTimeline(project);
    const finalScene = compiled.scenes.find((s) => s.chapterId === 'ch7_forever')!;
    expect(finalScene.heroPhoto?.id).toBe(photoFromCh2.id);
  });
});
