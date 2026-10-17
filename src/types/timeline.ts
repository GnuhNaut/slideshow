import { PhotoItem } from './project';

export type SceneType =
  | 'intro'
  | 'film_roll'
  | 'dual_film_roll'
  | 'film_to_hero'
  | 'hero_moment'
  | 'family_gallery'
  | 'family_split'
  | 'living_collage'
  | 'climax_wipe'
  | 'thank_you'
  | 'final_freeze'
  | 'arc_carousel_3d'
  | 'floating_gallery'
  | 'editorial_split'
  | 'photo_mosaic'
  | 'album_page_turn';

export interface TimelineScene {
  id: string;
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  type: SceneType;
  startTime: number; // in seconds
  duration: number;  // in seconds
  endTime: number;    // startTime + duration
  photos: PhotoItem[];
  heroPhoto?: PhotoItem;
  config: {
    speed?: number; // for film strips: px per sec
    panDirection?: 'left' | 'right' | 'up' | 'down' | 'zoom_in' | 'zoom_out';
    layout?: 'single' | 'split_2' | 'hero_and_2' | 'grid_4' | 'staggered_3';
    textTitle?: string;
    textSubtitle?: string;
    quote?: string;
    reversed?: boolean;
    layerDepth?: number;
    ambientLight?: 'warm' | 'rose' | 'gold' | 'ivory' | 'red';
    showCenterTitle?: boolean;
    showCenterNames?: boolean;
    showFrameNames?: boolean;
    showMetadata35mm?: boolean;
    showQuote?: boolean;
    coupleNames?: string;
    weddingDate?: string;
    showChapterIntro?: boolean;
  };
  transitionIn: 'cut' | 'fade' | 'soft_light' | 'film_wipe' | 'dissolve' | 'depth_push' | 'album_flip' | 'film_morph';
  transitionOut: 'cut' | 'fade' | 'soft_light' | 'film_wipe' | 'dissolve' | 'depth_push' | 'album_flip' | 'film_morph';
}

export interface ChapterTimelineMeta {
  chapterId: string;
  chapterIndex: number;
  title: string;
  startTime: number;
  duration: number;
  endTime: number;
  sceneCount: number;
}

export interface CompiledTimeline {
  totalDuration: number;
  scenes: TimelineScene[];
  chaptersMeta: ChapterTimelineMeta[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  currentScene: TimelineScene | null;
  currentChapter: ChapterTimelineMeta | null;
  currentChapterIndex: number;
  playbackSpeed: number; // 0.5, 0.75, 1, 1.25, 1.5
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isFinished: boolean; // Frozen on final photo
}
