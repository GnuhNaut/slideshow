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
      // CHƯƠNG 3 — LỜI CẦU HÔN (Hero Frame Morph Sequence)
      const heroPhoto = photos.find((p) => p.isHero) || photos[0];
      const otherPhotos = photos.filter((p) => p.id !== heroPhoto?.id);

      if (photos.length <= 1) {
        // NẾU CHỈ CÓ 1 ẢNH: Single 5.5s sequence (0-0.8s entrance, 0.8-1.7s 3D motion, 1.7-4.8s stable view, 4.8-5.5s exit)
        const duration = (chapter.mode === 'custom' && chapter.durationOverride) ? chapter.durationOverride : 5.5;
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
        // NẾU CÓ NHIỀU ẢNH: Hero photo gets 5.5s, remaining photos sequenced through photo stack / collage
        const heroDuration = 5.5;
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

        // Partition remaining photos into groups of 2-3 photos (4-6s per scene)
        const chunkSize = 2;
        for (let i = 0; i < otherPhotos.length; i += chunkSize) {
          const chunk = otherPhotos.slice(i, i + chunkSize);
          const chunkDuration = Math.max(5, chunk.length * 3.0);

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
              layout: chunk.length === 1 ? 'single' : 'split_2',
              ambientLight: 'warm',
            },
            transitionIn: 'dissolve',
            transitionOut: i + chunkSize >= otherPhotos.length ? 'album_flip' : 'dissolve',
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

        // Rich 5-scene pattern cycle for high visual diversity:
        // Cycle 0: Fullscreen Hero (1 photo, 5.5s)
        // Cycle 1: Editorial Split 60/40 (2 photos, 6.5s)
        // Cycle 2: Asymmetric Photo Mosaic (3 photos, 7.5s)
        // Cycle 3: Multi-Depth Floating Gallery (4 photos, 8.5s)
        // Cycle 4: 3D Arc Carousel (5+ photos, 9.5s)
        const cycle = sceneCounter % 5;

        if (cycle === 0 || remainingCount === 1) {
          // Single dramatic photo
          const photo = photos[photoIndex];
          const duration = 5.5;

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
              panDirection: 'zoom_in',
              ambientLight: 'gold',
              textTitle: 'FOREVER TOGETHER',
              quote: photo.title || chapter.accentQuote || 'Vẻ đẹp tinh khôi của ngày trọng đại nhất.',
            },
            transitionIn: sceneCounter === 1 ? 'film_wipe' : 'depth_push',
            transitionOut: 'dissolve',
          });
          cursor += duration;
          photoIndex += 1;
        } else if (cycle === 1) {
          // Editorial Split 60/40 (2 photos)
          const countToTake = Math.min(remainingCount, 2);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          const duration = 6.5;

          scenes.push({
            id: `${chapter.id}_scene_wedding_split_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: chunk,
            config: {
              layout: 'split_2',
              ambientLight: 'gold',
              quote: chapter.accentQuote || 'Tay trong tay, bước vào lễ đường của cuộc đời.',
            },
            transitionIn: 'dissolve',
            transitionOut: 'soft_light',
          });
          cursor += duration;
          photoIndex += countToTake;
        } else if (cycle === 2) {
          // Photo Mosaic (3 photos)
          const countToTake = Math.min(remainingCount, 3);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          const duration = 7.5;

          scenes.push({
            id: `${chapter.id}_scene_wedding_mosaic_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: chunk,
            config: {
              layout: 'hero_and_2',
              ambientLight: 'gold',
              quote: 'Từng nụ cười, từng ánh mắt hòa quyện vào khúc ca hạnh phúc.',
            },
            transitionIn: 'soft_light',
            transitionOut: 'dissolve',
          });
          cursor += duration;
          photoIndex += countToTake;
        } else if (cycle === 3) {
          // Multi-Depth Floating Gallery (4 photos)
          const countToTake = Math.min(remainingCount, 4);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          const duration = 8.5;

          scenes.push({
            id: `${chapter.id}_scene_wedding_floating_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: chunk,
            config: {
              layout: 'grid_4',
              ambientLight: 'gold',
              quote: 'Những khoảnh khắc lãng mạn khắc sâu vào tâm trí.',
            },
            transitionIn: 'dissolve',
            transitionOut: 'depth_push',
          });
          cursor += duration;
          photoIndex += countToTake;
        } else {
          // 3D Arc Carousel (up to 5 photos)
          const countToTake = Math.min(remainingCount, 5);
          const chunk = photos.slice(photoIndex, photoIndex + countToTake);
          const duration = 9.5;

          scenes.push({
            id: `${chapter.id}_scene_wedding_carousel_${sceneCounter}`,
            chapterId: chapter.id,
            chapterIndex: 5,
            chapterTitle: chapter.vietnameseTitle,
            type: 'living_collage',
            startTime: cursor,
            duration,
            endTime: cursor + duration,
            photos: chunk,
            config: {
              layout: 'staggered_3',
              ambientLight: 'gold',
              quote: 'Hành trình tình yêu nở hoa rực rỡ.',
            },
            transitionIn: 'depth_push',
            transitionOut: 'dissolve',
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
      const chapterPhotos = [...photos];
      if (chapterPhotos.length < 2) {
        // Fallback to wedding photos from chapter 5 to flank left & right
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
