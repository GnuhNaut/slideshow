import { WeddingProject, ChapterConfig, PhotoItem } from '../types/project';
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
      // CHƯƠNG 1 — INTRO: THE BEGINNING
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
      // Displays ALL photos in the 35mm filmstrip without truncation!
      // Minimum duration guarantees guests can clearly view the photos
      const secPerPhoto = 3.5;
      const calculatedDuration = Math.max(20, photos.length * secPerPhoto);
      const duration = chapter.durationOverride || calculatedDuration;
      const isDual = chapter.effectMode === 'f02_dual_roll' || photos.length >= 8;

      scenes.push({
        id: `${chapter.id}_scene_filmroll`,
        chapterId: chapter.id,
        chapterIndex: 2,
        chapterTitle: chapter.vietnameseTitle,
        type: isDual ? 'dual_film_roll' : 'film_roll',
        startTime: cursor,
        duration,
        endTime: cursor + duration,
        photos: [...photos], // ALL photos included!
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
      // CHƯƠNG 3 — LỜI CẦU HÔN (Film-to-Hero + Emotional Ken Burns Zoom)
      const heroPhoto = photos.find((p) => p.isHero) || photos[0];
      const otherPhotos = photos.filter((p) => p.id !== heroPhoto?.id);

      // Part 1: Strip decelerating into hero
      const filmDuration = 7;
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

      // Part 2: Hero proposal moment
      const heroDuration = 9;
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

      // Part 3: Any additional proposal photos partitioned into sequential scenes so NONE are skipped!
      if (otherPhotos.length > 0) {
        // Chunk other proposal photos into groups of max 3
        const chunkSize = 3;
        for (let i = 0; i < otherPhotos.length; i += chunkSize) {
          const chunk = otherPhotos.slice(i, i + chunkSize);
          const chunkDuration = Math.max(6, chunk.length * 3.5);

          scenes.push({
            id: `${chapter.id}_scene_proposal_others_${i}`,
            chapterId: chapter.id,
            chapterIndex: 3,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration: chunkDuration,
            endTime: cursor + chunkDuration,
            photos: chunk,
            config: {
              layout: chunk.length === 1 ? 'single' : chunk.length === 2 ? 'split_2' : 'hero_and_2',
              ambientLight: 'warm',
            },
            transitionIn: 'soft_light',
            transitionOut: 'fade',
          });
          cursor += chunkDuration;
        }
      }
      break;
    }

    case 4: {
      // CHƯƠNG 4 — HAI GIA ĐÌNH, MỘT HẠNH PHÚC (Family, Engagement)
      // ALL family photos partitioned into safe contain layout scenes!
      // Groups of 1 or 2 photos per scene to guarantee faces are never cropped.
      if (photos.length === 0) {
        // Fallback placeholder
        scenes.push({
          id: `${chapter.id}_empty`,
          chapterId: chapter.id,
          chapterIndex: 4,
          chapterTitle: chapter.vietnameseTitle,
          type: 'family_gallery',
          startTime: cursor,
          duration: 10,
          endTime: cursor + 10,
          photos: [],
          config: { layout: 'single', ambientLight: 'warm' },
          transitionIn: 'soft_light',
          transitionOut: 'fade',
        });
        cursor += 10;
        break;
      }

      // Chunking: 2 photos per scene for elegance, or 1 photo if portrait/collective
      const chunkSize = 2;
      for (let i = 0; i < photos.length; i += chunkSize) {
        const chunk = photos.slice(i, i + chunkSize);
        const sceneDuration = Math.max(6, chunk.length * 4);

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
          transitionOut: i + chunkSize >= photos.length ? 'fade' : 'dissolve',
        });
        cursor += sceneDuration;
      }
      break;
    }

    case 5: {
      // CHƯƠNG 5 — FOREVER TOGETHER (Wedding Climax Montage)
      // Must present ALL photos without skipping any!
      // Sequenced through varied montage scenes:
      // Hero moments (1 photo), Editorial Duos (2 photos), Living Collages (3-4 photos).
      if (photos.length === 0) {
        scenes.push({
          id: `${chapter.id}_empty`,
          chapterId: chapter.id,
          chapterIndex: 5,
          chapterTitle: chapter.vietnameseTitle,
          type: 'hero_moment',
          startTime: cursor,
          duration: 12,
          endTime: cursor + 12,
          photos: [],
          config: { ambientLight: 'gold' },
          transitionIn: 'film_wipe',
          transitionOut: 'dissolve',
        });
        cursor += 12;
        break;
      }

      let photoIndex = 0;
      let sceneCounter = 1;

      while (photoIndex < photos.length) {
        const remainingCount = photos.length - photoIndex;

        // Pattern cycle for variety:
        // Scene 1: Single Hero (1 photo, 7s)
        // Scene 2: Living Collage / Duo (2 or 3 photos, 8s)
        // Scene 3: Editorial Reveal (1 photo, 6s)
        // Scene 4: Collage (3 or 4 photos, 9s)
        const cycle = sceneCounter % 4;

        if (cycle === 1 || cycle === 3 || remainingCount === 1) {
          // Single dramatic photo
          const photo = photos[photoIndex];
          const duration = 6.5;

          scenes.push({
            id: `${chapter.id}_scene_wedding_hero_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'hero_moment',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: [photo],
            heroPhoto: photo,
            config: {
              panDirection: cycle === 1 ? 'zoom_in' : 'zoom_out',
              ambientLight: 'gold',
              textTitle: 'FOREVER TOGETHER',
              quote: photo.title || chapter.accentQuote || 'Vẻ đẹp tinh khôi của ngày trọng đại nhất.',
            },
            transitionIn: sceneCounter === 1 ? 'film_wipe' : 'dissolve',
            transitionOut: 'dissolve',
          });
          cursor += duration;
          photoIndex += 1;
        } else {
          // Multi-photo group: 2 or 3 photos
          const countToTake = Math.min(remainingCount, cycle === 2 ? 2 : 3);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          const duration = Math.max(7, chunk.length * 3.5);

          scenes.push({
            id: `${chapter.id}_scene_wedding_collage_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: chunk,
            config: {
              layout: chunk.length === 2 ? 'split_2' : 'hero_and_2',
              ambientLight: 'gold',
              quote: chapter.accentQuote || 'Tay trong tay, bước vào lễ đường của cuộc đời.',
            },
            transitionIn: 'dissolve',
            transitionOut: 'soft_light',
          });
          cursor += duration;
          photoIndex += countToTake;
        }

        sceneCounter++;
      }
      break;
    }

    case 6: {
      // CHƯƠNG 6 — LỜI CẢM ƠN (Thank You Message)
      const duration = chapter.durationOverride || 14;
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
      // CHƯƠNG 7 — OUR FOREVER (FINAL FREEZE / FINAL HOLD)
      // Real finite duration (12 seconds) for the entrance reveal.
      // Once currentTime reaches endTime, the Playback Clock enters FINAL_HOLD and pauses permanently!
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

      const duration = 12; // Realistic finite entrance duration!
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
