import { WeddingProject, ChapterConfig, PhotoItem } from '../types/project';
import { TimelineScene, CompiledTimeline, ChapterTimelineMeta } from '../types/timeline';

export function calculateChapterAutoDuration(
  chapter: ChapterConfig,
  _project?: WeddingProject
): number {
  const photos = chapter.photos || [];
  switch (chapter.chapterIndex) {
    case 1:
      return 14;
    case 2:
      return Math.max(16, photos.length * 3.5);
    case 3: {
      if (photos.length <= 1) return 5.5;
      const otherCount = photos.length - 1;
      const chunkCount = Math.ceil(otherCount / 2);
      return 5.5 + chunkCount * 6.0;
    }
    case 4:
      if (photos.length === 0) return 10;
      return Math.ceil(photos.length / 2) * 7.0;
    case 5: {
      if (photos.length === 0) return 12;
      let dur = 0;
      let pIdx = 0;
      let sc = 1;
      while (pIdx < photos.length) {
        const rem = photos.length - pIdx;
        const cycle = sc % 5;
        if (cycle === 0 || rem === 1) {
          dur += 5.5;
          pIdx += 1;
        } else if (cycle === 1) {
          dur += 6.5;
          pIdx += Math.min(rem, 2);
        } else if (cycle === 2) {
          dur += 7.5;
          pIdx += Math.min(rem, 3);
        } else if (cycle === 3) {
          dur += 8.5;
          pIdx += Math.min(rem, 4);
        } else {
          dur += 9.5;
          pIdx += Math.min(rem, 5);
        }
        sc++;
      }
      return dur;
    }
    case 6:
      return 14;
    case 7:
      return 2.0; // Realistic finite entrance reveal before permanent FINAL_HOLD
    default:
      return 15;
  }
}

export function getChapterEffectiveDuration(
  chapter: ChapterConfig,
  project?: WeddingProject
): number {
  if (chapter.mode === 'custom' && typeof chapter.durationOverride === 'number' && chapter.durationOverride > 0) {
    return chapter.durationOverride;
  }
  return calculateChapterAutoDuration(chapter, project);
}

export function compileProjectTimeline(project: WeddingProject): CompiledTimeline {
  const scenes: TimelineScene[] = [];
  const chaptersMeta: ChapterTimelineMeta[] = [];
  let currentCursor = 0;

  for (const chapter of project.chapters) {
    if (!chapter.enabled) continue;

    const chapterStart = currentCursor;
    const chapterScenes = compileChapterScenes(chapter, currentCursor, project);

    for (const scene of chapterScenes) {
      scenes.push(scene);
      currentCursor += scene.duration;
    }

    const chapterDuration = currentCursor - chapterStart;
    chaptersMeta.push({
      chapterId: chapter.id,
      chapterIndex: chapter.chapterIndex,
      title: chapter.vietnameseTitle,
      startTime: chapterStart,
      duration: chapterDuration,
      endTime: currentCursor,
      sceneCount: chapterScenes.length,
    });
  }

  return {
    totalDuration: currentCursor,
    scenes,
    chaptersMeta,
  };
}

function compileChapterScenes(
  chapter: ChapterConfig,
  startTimeCursor: number,
  project: WeddingProject
): TimelineScene[] {
  const scenes: TimelineScene[] = [];
  let cursor = startTimeCursor;
  const photos = chapter.photos || [];
  const isCustom = chapter.mode === 'custom' && typeof chapter.durationOverride === 'number' && chapter.durationOverride > 0;
  const customDuration = chapter.durationOverride || 0;

  switch (chapter.chapterIndex) {
    case 1: {
      // CHƯƠNG 1 — INTRO: THE BEGINNING
      const duration = isCustom ? Math.max(3, customDuration) : 14;
      const heroPhoto = photos[0];
      scenes.push({
        id: `${chapter.id}_scene_intro`,
        chapterId: chapter.id,
        chapterIndex: 1,
        chapterTitle: chapter.vietnameseTitle,
        type: 'intro',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: photos.slice(0, 1),
        heroPhoto,
        config: {
          textTitle: project.title,
          textSubtitle: `${project.groomName} & ${project.brideName}`,
          quote: chapter.accentQuote || 'Mọi câu chuyện tình yêu đều đẹp, nhưng câu chuyện của chúng mình là điều tuyệt vời nhất.',
          ambientLight: 'gold',
        },
        transitionIn: 'soft_light',
        transitionOut: 'cut',
      });
      cursor += duration;
      break;
    }

    case 2: {
      // CHƯƠNG 2 — NHỮNG NGÀY BÊN NHAU (Continuous / Dual Film Roll)
      const autoDuration = Math.max(16, photos.length * 3.5);
      const duration = isCustom ? Math.max(5, customDuration) : autoDuration;
      const isDual = chapter.effectMode === 'f02_dual_roll' || (chapter.effectMode !== 'f01_continuous_roll' && photos.length >= 8);

      scenes.push({
        id: `${chapter.id}_scene_filmroll`,
        chapterId: chapter.id,
        chapterIndex: 2,
        chapterTitle: chapter.vietnameseTitle,
        type: isDual ? 'dual_film_roll' : 'film_roll',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: [...photos],
        config: {
          speed: chapter.speed || 48,
          ambientLight: 'warm',
          quote: chapter.accentQuote || 'Từ những buổi hẹn hò đầu tiên đến những chuyến đi đầy ắp tiếng cười.',
        },
        transitionIn: 'cut',
        transitionOut: 'film_wipe',
      });
      cursor += duration;
      break;
    }

    case 3: {
      // CHƯƠNG 3 — LỜI CẦU HÔN (Hero Frame Morph Sequence)
      const heroPhoto = photos.find((p) => p.isHero) || photos[0];
      const otherPhotos = photos.filter((p) => p.id !== heroPhoto?.id);

      if (photos.length <= 1) {
        const duration = isCustom ? Math.max(2, customDuration) : 5.5;
        scenes.push({
          id: `${chapter.id}_scene_proposal_single_hero`,
          chapterId: chapter.id,
          chapterIndex: 3,
          chapterTitle: chapter.vietnameseTitle,
          type: 'film_to_hero',
          startTime: cursor,
          duration,
          endTime: cursor + duration,
          photos: heroPhoto ? [heroPhoto] : [],
          heroPhoto,
          config: {
            textTitle: 'LỜI CẦU HÔN',
            quote: chapter.accentQuote || 'Khoảnh khắc em nói "Em đồng ý", cả thế giới như ngừng lại.',
            ambientLight: 'rose',
          },
          transitionIn: 'soft_light',
          transitionOut: 'album_flip',
        });
        cursor += duration;
      } else {
        // Multi-photo Proposal
        const chunkSize = 2;
        const chunks: PhotoItem[][] = [];
        for (let i = 0; i < otherPhotos.length; i += chunkSize) {
          chunks.push(otherPhotos.slice(i, i + chunkSize));
        }

        const baseHeroDur = 5.5;
        const baseChunkDurs = chunks.map((c) => Math.max(5, c.length * 3.0));
        const baseTotal = baseHeroDur + baseChunkDurs.reduce((a, b) => a + b, 0);
        const targetTotal = isCustom ? Math.max(photos.length * 1.5, customDuration) : baseTotal;
        const scale = targetTotal / baseTotal;

        // Proportional distribution
        let distributed = 0;
        const heroDuration = chunks.length === 0
          ? targetTotal
          : Number((baseHeroDur * scale).toFixed(1));
        distributed += heroDuration;

        scenes.push({
          id: `${chapter.id}_scene_proposal_hero`,
          chapterId: chapter.id,
          chapterIndex: 3,
          chapterTitle: chapter.vietnameseTitle,
          type: 'film_to_hero',
          startTime: cursor,
          duration: heroDuration,
          endTime: cursor + heroDuration,
          photos: heroPhoto ? [heroPhoto] : [],
          heroPhoto,
          config: {
            textTitle: 'LỜI CẦU HÔN',
            quote: chapter.accentQuote || 'Khoảnh khắc em nói "Em đồng ý", cả thế giới như ngừng lại.',
            ambientLight: 'rose',
          },
          transitionIn: 'soft_light',
          transitionOut: 'dissolve',
        });
        cursor += heroDuration;

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const isLast = i === chunks.length - 1;
          const chunkDur = isLast
            ? Math.max(1.0, Number((targetTotal - distributed).toFixed(1)))
            : Math.max(1.0, Number((baseChunkDurs[i] * scale).toFixed(1)));
          distributed += chunkDur;

          scenes.push({
            id: `${chapter.id}_scene_proposal_others_${i}`,
            chapterId: chapter.id,
            chapterIndex: 3,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration: chunkDur,
            endTime: cursor + chunkDur,
            photos: chunk,
            config: {
              layout: chunk.length === 1 ? 'single' : 'split_2',
              ambientLight: 'warm',
            },
            transitionIn: 'dissolve',
            transitionOut: isLast ? 'album_flip' : 'dissolve',
          });
          cursor += chunkDur;
        }
      }
      break;
    }

    case 4: {
      // CHƯƠNG 4 — HAI GIA ĐÌNH, MỘT HẠNH PHÚC (Family, Engagement)
      if (photos.length === 0) {
        const duration = isCustom ? Math.max(3, customDuration) : 10;
        scenes.push({
          id: `${chapter.id}_empty`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: 'family_gallery',
          startTime: cursor,
          duration,
          endTime: cursor + duration,
          photos: [],
          config: { layout: 'single', ambientLight: 'warm' },
          transitionIn: 'soft_light',
          transitionOut: 'fade',
        });
        cursor += duration;
        break;
      }

      const chunkSize = 2;
      const chunks: PhotoItem[][] = [];
      for (let i = 0; i < photos.length; i += chunkSize) {
        chunks.push(photos.slice(i, i + chunkSize));
      }

      const baseChunkDurs = chunks.map((c) => Math.max(6, c.length * 4));
      const baseTotal = baseChunkDurs.reduce((a, b) => a + b, 0);
      const targetTotal = isCustom ? Math.max(photos.length * 1.5, customDuration) : baseTotal;
      const scale = targetTotal / baseTotal;

      let distributed = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isLast = i === chunks.length - 1;
        const sceneDuration = isLast
          ? Math.max(1.0, Number((targetTotal - distributed).toFixed(1)))
          : Math.max(1.0, Number((baseChunkDurs[i] * scale).toFixed(1)));
        distributed += sceneDuration;

        scenes.push({
          id: `${chapter.id}_scene_family_chunk_${i}`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: chunk.length === 1 ? 'family_gallery' : 'family_split',
          startTime: cursor,
          duration: sceneDuration,
          endTime: cursor + sceneDuration,
          photos: chunk,
          config: {
            layout: chunk.length === 1 ? 'single' : 'split_2',
            ambientLight: 'warm',
            quote:
              i === 0
                ? 'Lễ dạm ngõ ấm cúng — Hai gia đình chung một niềm hạnh phúc.'
                : chapter.accentQuote || 'Hạnh phúc trọn vẹn trong tình thương yêu của đấng sinh thành.',
          },
          transitionIn: i === 0 ? 'soft_light' : 'dissolve',
          transitionOut: isLast ? 'fade' : 'dissolve',
        });
        cursor += sceneDuration;
      }
      break;
    }

    case 5: {
      // CHƯƠNG 5 — FOREVER TOGETHER (Wedding Climax Montage)
      if (photos.length === 0) {
        const duration = isCustom ? Math.max(3, customDuration) : 12;
        scenes.push({
          id: `${chapter.id}_empty`,
          chapterId: chapter.id,
          chapterIndex: 5,
          chapterTitle: chapter.vietnameseTitle,
          type: 'hero_moment',
          startTime: cursor,
          duration,
          endTime: cursor + duration,
          photos: [],
          config: { ambientLight: 'gold' },
          transitionIn: 'film_wipe',
          transitionOut: 'dissolve',
        });
        cursor += duration;
        break;
      }

      // Step 1: Build scene definitions with base durations using rich 5-cycle pattern
      interface SceneDraft {
        id: string;
        type: TimelineScene['type'];
        photos: PhotoItem[];
        heroPhoto?: PhotoItem;
        baseDuration: number;
        config: TimelineScene['config'];
        transitionIn: TimelineScene['transitionIn'];
        transitionOut: TimelineScene['transitionOut'];
      }

      const drafts: SceneDraft[] = [];
      let photoIndex = 0;
      let sceneCounter = 1;

      while (photoIndex < photos.length) {
        const remainingCount = photos.length - photoIndex;
        const cycle = sceneCounter % 5;

        if (cycle === 0 || remainingCount === 1) {
          const photo = photos[photoIndex];
          drafts.push({
            id: `${chapter.id}_scene_wedding_hero_${sceneCounter}`,
            type: 'hero_moment',
            photos: [photo],
            heroPhoto: photo,
            baseDuration: 5.5,
            config: {
              panDirection: 'zoom_in',
              ambientLight: 'gold',
              textTitle: 'FOREVER TOGETHER',
              quote: photo.title || chapter.accentQuote || 'Vẻ đẹp tinh khôi của ngày trọng đại nhất.',
            },
            transitionIn: sceneCounter === 1 ? 'film_wipe' : 'depth_push',
            transitionOut: 'dissolve',
          });
          photoIndex += 1;
        } else if (cycle === 1) {
          const countToTake = Math.min(remainingCount, 2);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          drafts.push({
            id: `${chapter.id}_scene_wedding_split_${sceneCounter}`,
            type: 'living_collage',
            photos: chunk,
            baseDuration: 6.5,
            config: {
              layout: 'split_2',
              ambientLight: 'gold',
              quote: chapter.accentQuote || 'Tay trong tay, bước vào lễ đường của cuộc đời.',
            },
            transitionIn: 'dissolve',
            transitionOut: 'soft_light',
          });
          photoIndex += countToTake;
        } else if (cycle === 2) {
          const countToTake = Math.min(remainingCount, 3);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          drafts.push({
            id: `${chapter.id}_scene_wedding_mosaic_${sceneCounter}`,
            type: 'living_collage',
            photos: chunk,
            baseDuration: 7.5,
            config: {
              layout: 'hero_and_2',
              ambientLight: 'gold',
              quote: 'Từng nụ cười, từng ánh mắt hòa quyện vào khúc ca hạnh phúc.',
            },
            transitionIn: 'soft_light',
            transitionOut: 'dissolve',
          });
          photoIndex += countToTake;
        } else if (cycle === 3) {
          const countToTake = Math.min(remainingCount, 4);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          drafts.push({
            id: `${chapter.id}_scene_wedding_floating_${sceneCounter}`,
            type: 'living_collage',
            photos: chunk,
            baseDuration: 8.5,
            config: {
              layout: 'grid_4',
              ambientLight: 'gold',
              quote: 'Những khoảnh khắc lãng mạn khắc sâu vào tâm trí.',
            },
            transitionIn: 'dissolve',
            transitionOut: 'depth_push',
          });
          photoIndex += countToTake;
        } else {
          const countToTake = Math.min(remainingCount, 5);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          drafts.push({
            id: `${chapter.id}_scene_wedding_carousel_${sceneCounter}`,
            type: 'living_collage',
            photos: chunk,
            baseDuration: 9.5,
            config: {
              layout: 'staggered_3',
              ambientLight: 'gold',
              quote: 'Hành trình tình yêu nở hoa rực rỡ.',
            },
            transitionIn: 'depth_push',
            transitionOut: 'dissolve',
          });
          photoIndex += countToTake;
        }
        sceneCounter++;
      }

      // Step 2: Scale durations proportionally if custom duration is set
      const baseTotal = drafts.reduce((sum, d) => sum + d.baseDuration, 0);
      const targetTotal = isCustom ? Math.max(photos.length * 1.5, customDuration) : baseTotal;
      const scale = targetTotal / baseTotal;

      let distributed = 0;
      for (let i = 0; i < drafts.length; i++) {
        const d = drafts[i];
        const isLast = i === drafts.length - 1;
        const dur = isLast
          ? Math.max(1.0, Number((targetTotal - distributed).toFixed(1)))
          : Math.max(1.0, Number((d.baseDuration * scale).toFixed(1)));
        distributed += dur;

        scenes.push({
          id: d.id,
          chapterId: chapter.id,
          chapterIndex: 5,
          chapterTitle: chapter.vietnameseTitle,
          type: d.type,
          startTime: cursor,
          duration: dur,
          endTime: cursor + dur,
          photos: d.photos,
          heroPhoto: d.heroPhoto,
          config: d.config,
          transitionIn: d.transitionIn,
          transitionOut: d.transitionOut,
        });
        cursor += dur;
      }
      break;
    }

    case 6: {
      // CHƯƠNG 6 — LỜI CẢM ƠN (Thank You Message)
      const autoDuration = 14;
      const duration = isCustom ? Math.max(3, customDuration) : autoDuration;
      const chapterPhotos = [...photos];
      if (chapterPhotos.length < 2) {
        const weddingPhotos = project.chapters.find((c) => c.chapterIndex === 5)?.photos || [];
        for (const wp of weddingPhotos) {
          if (chapterPhotos.length >= 2) break;
          chapterPhotos.push(wp);
        }
      }

      scenes.push({
        id: `${chapter.id}_scene_thank_you`,
        chapterId: chapter.id,
        chapterIndex: 6,
        chapterTitle: chapter.vietnameseTitle,
        type: 'thank_you',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: chapterPhotos.slice(0, 2),
        heroPhoto: chapterPhotos[0],
        config: {
          textTitle: 'LỜI CẢM ƠN',
          quote: project.thankYouMessage,
          ambientLight: 'warm',
        },
        transitionIn: 'soft_light',
        transitionOut: 'fade',
      });
      cursor += duration;
      break;
    }

    case 7: {
      // CHƯƠNG 7 — OUR FOREVER (FINAL FREEZE / FINAL HOLD)
      // Reveal duration is finite (2.0s or user custom) before permanent FINAL_HOLD
      const autoDuration = 2.0;
      const duration = isCustom ? Math.max(1.0, customDuration) : autoDuration;

      // GLOBAL ENDING PHOTO LOOKUP:
      // Searches across ALL chapters in the project, so picking a photo from Chapter 5, 2, etc. works seamlessly!
      const allProjectPhotos = project.chapters.flatMap((c) => c.photos || []);
      const finalPhoto =
        (project.endingPhotoId ? allProjectPhotos.find((p) => p.id === project.endingPhotoId) : null) ||
        photos[0] ||
        allProjectPhotos[allProjectPhotos.length - 1] || {
          id: 'default_ending',
          chapterId: chapter.id,
          title: 'Our Forever',
          url: '',
          originalWidth: 1920,
          originalHeight: 1080,
          aspectRatio: 16 / 9,
          cropMode: 'cover' as const,
          focalPoint: { x: 50, y: 50 },
          order: 0,
          createdAt: Date.now(),
        };

      scenes.push({
        id: `${chapter.id}_scene_final_freeze`,
        chapterId: chapter.id,
        chapterIndex: 7,
        chapterTitle: chapter.vietnameseTitle,
        type: 'final_freeze',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: [finalPhoto],
        heroPhoto: finalPhoto,
        config: {
          textTitle: `${project.groomName} & ${project.brideName}`,
          textSubtitle: `${project.weddingDate} • ${project.lunarDate}`,
          quote: chapter.accentQuote || 'Hạnh phúc đong đầy theo năm tháng',
          ambientLight: 'gold',
        },
        transitionIn: 'soft_light',
        transitionOut: 'cut',
      });
      cursor += duration;
      break;
    }

    default:
      break;
  }

  return scenes;
}
