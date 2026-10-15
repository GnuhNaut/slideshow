import { WeddingProject, ChapterConfig } from '../types/project';
import { TimelineScene, CompiledTimeline, ChapterTimelineMeta } from '../types/timeline';

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
  const photos = chapter.photos;

  switch (chapter.chapterIndex) {
    case 1: {
      // INTRO: THE BEGINNING
      const duration = chapter.durationOverride || 14;
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
          quote: chapter.accentQuote,
          ambientLight: 'gold',
        },
        transitionIn: 'soft_light',
        transitionOut: 'cut',
      });
      cursor += duration;
      break;
    }

    case 2: {
      // NHỮNG NGÀY BÊN NHAU (Continuous / Dual Film Roll)
      const duration = chapter.durationOverride || Math.max(20, photos.length * 3.5);
      const isDual = chapter.effectMode === 'f02_dual_roll' || photos.length >= 6;
      
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
          quote: chapter.accentQuote,
        },
        transitionIn: 'cut',
        transitionOut: 'film_wipe',
      });
      cursor += duration;
      break;
    }

    case 3: {
      // LỜI CẦU HÔN (Film-to-Hero + Emotional Zoom)
      const heroPhoto = photos.find((p) => p.isHero) || photos[0];
      const otherPhotos = photos.filter((p) => p.id !== heroPhoto?.id);

      // Part 1: Strip decelerating into hero
      const filmDuration = 8;
      scenes.push({
        id: `${chapter.id}_scene_film_to_hero`,
        chapterId: chapter.id,
        chapterIndex: 3,
        chapterTitle: chapter.vietnameseTitle,
        type: 'film_to_hero',
        startTime: cursor,
        duration: filmDuration,
        endTime: cursor + filmDuration,
        photos: photos,
        heroPhoto,
        config: {
          speed: 35,
          ambientLight: 'rose',
        },
        transitionIn: 'soft_light',
        transitionOut: 'dissolve',
      });
      cursor += filmDuration;

      // Part 2: Hero proposal presentation with slow pan/zoom
      const heroDuration = 10;
      scenes.push({
        id: `${chapter.id}_scene_proposal_hero`,
        chapterId: chapter.id,
        chapterIndex: 3,
        chapterTitle: chapter.vietnameseTitle,
        type: 'hero_moment',
        startTime: cursor,
        duration: heroDuration,
        endTime: cursor + heroDuration,
        photos: heroPhoto ? [heroPhoto] : [],
        heroPhoto,
        config: {
          panDirection: 'zoom_in',
          ambientLight: 'rose',
          textTitle: 'LỜI CẦU HÔN',
          quote: 'Khoảnh khắc em nói "Em đồng ý", cả thế giới như ngừng lại.',
        },
        transitionIn: 'dissolve',
        transitionOut: 'soft_light',
      });
      cursor += heroDuration;

      // Part 3: Other proposal moments if present
      if (otherPhotos.length > 0) {
        const othersDuration = Math.min(12, otherPhotos.length * 4);
        scenes.push({
          id: `${chapter.id}_scene_proposal_others`,
          chapterId: chapter.id,
          chapterIndex: 3,
          chapterTitle: chapter.vietnameseTitle,
          type: 'living_collage',
          startTime: cursor,
          duration: othersDuration,
          endTime: cursor + othersDuration,
          photos: otherPhotos,
          config: {
            layout: otherPhotos.length >= 3 ? 'hero_and_2' : 'split_2',
            ambientLight: 'warm',
          },
          transitionIn: 'soft_light',
          transitionOut: 'fade',
        });
        cursor += othersDuration;
      }
      break;
    }

    case 4: {
      // HAI GIA ĐÌNH, MỘT HẠNH PHÚC (Family, Engagement)
      // Strict aspect ratio protection: ensure no group members are cropped
      const duration = chapter.durationOverride || Math.max(18, photos.length * 4);
      
      // Auto Director creates 2 sub-scenes if > 3 photos
      if (photos.length > 3) {
        const half = Math.ceil(photos.length / 2);
        const p1 = photos.slice(0, half);
        const p2 = photos.slice(half);

        scenes.push({
          id: `${chapter.id}_scene_family_1`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: 'family_split',
          startTime: cursor,
          duration: duration / 2,
          endTime: cursor + duration / 2,
          photos: p1,
          config: {
            layout: p1.length === 2 ? 'split_2' : 'hero_and_2',
            ambientLight: 'warm',
            quote: 'Lễ dạm ngõ ấm cúng - Hai gia đình cùng chung vui.',
          },
          transitionIn: 'soft_light',
          transitionOut: 'dissolve',
        });
        cursor += duration / 2;

        scenes.push({
          id: `${chapter.id}_scene_family_2`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: 'family_gallery',
          startTime: cursor,
          duration: duration / 2,
          endTime: cursor + duration / 2,
          photos: p2,
          config: {
            layout: 'single',
            ambientLight: 'warm',
            quote: chapter.accentQuote,
          },
          transitionIn: 'dissolve',
          transitionOut: 'fade',
        });
        cursor += duration / 2;
      } else {
        scenes.push({
          id: `${chapter.id}_scene_family_all`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: 'family_gallery',
          startTime: cursor,
          duration,
          endTime: cursor + duration,
          photos,
          config: {
            layout: photos.length === 1 ? 'single' : 'split_2',
            ambientLight: 'warm',
            quote: chapter.accentQuote,
          },
          transitionIn: 'soft_light',
          transitionOut: 'fade',
        });
        cursor += duration;
      }
      break;
    }

    case 5: {
      // FOREVER TOGETHER (Pre-wedding, Climax visual effects)
      const duration = chapter.durationOverride || Math.max(26, photos.length * 4);
      const heroPhotos = photos.filter((p) => p.isHero);
      const mainHero = heroPhotos[0] || photos[0];
      const remaining = photos.filter((p) => p.id !== mainHero?.id);

      // Scene 5A: Cinematic reveal
      const d1 = Math.floor(duration * 0.4);
      scenes.push({
        id: `${chapter.id}_scene_climax_reveal`,
        chapterId: chapter.id,
        chapterIndex: 5,
        chapterTitle: chapter.vietnameseTitle,
        type: 'hero_moment',
        startTime: cursor,
        duration: d1,
        endTime: cursor + d1,
        photos: mainHero ? [mainHero] : [],
        heroPhoto: mainHero,
        config: {
          panDirection: 'zoom_out',
          ambientLight: 'gold',
          textTitle: 'FOREVER TOGETHER',
          quote: 'Vẻ đẹp tinh khôi của ngày trọng đại nhất.',
        },
        transitionIn: 'film_wipe',
        transitionOut: 'dissolve',
      });
      cursor += d1;

      // Scene 5B: Multi-photo living collage or wipe
      const d2 = duration - d1;
      scenes.push({
        id: `${chapter.id}_scene_climax_collage`,
        chapterId: chapter.id,
        chapterIndex: 5,
        chapterTitle: chapter.vietnameseTitle,
        type: 'living_collage',
        startTime: cursor,
        duration: d2,
        endTime: cursor + d2,
        photos: remaining.length > 0 ? remaining : photos,
        config: {
          layout: remaining.length >= 4 ? 'grid_4' : 'hero_and_2',
          ambientLight: 'gold',
          quote: chapter.accentQuote,
        },
        transitionIn: 'dissolve',
        transitionOut: 'soft_light',
      });
      cursor += d2;
      break;
    }

    case 6: {
      // LỜI CẢM ƠN (Thank you card)
      const duration = chapter.durationOverride || 16;
      scenes.push({
        id: `${chapter.id}_scene_thank_you`,
        chapterId: chapter.id,
        chapterIndex: 6,
        chapterTitle: chapter.vietnameseTitle,
        type: 'thank_you',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: photos.slice(0, 1),
        heroPhoto: photos[0],
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
      // OUR FOREVER (FINAL FREEZE)
      // The final photo holds indefinitely (e.g. 10 hours = 36000s).
      const finalPhoto =
        photos.find((p) => p.id === project.endingPhotoId) ||
        photos[0] || {
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

      const duration = 36000; // Indefinite presentation hold!
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
