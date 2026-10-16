export type EffectMode =
  | 'f01_continuous_roll'
  | 'f02_dual_roll'
  | 'f03_multi_layer'
  | 'f04_film_to_hero'
  | 'f05_pan_zoom'
  | 'f06_living_collage'
  | 'f07_soft_light'
  | 'f08_final_freeze'
  | 'custom';

export type CropMode = 'contain' | 'cover' | 'fill';

export interface PhotoItem {
  id: string;
  chapterId: string;
  mediaId?: string; // Stable key in Dexie db.media
  title?: string;
  url: string; // ObjectURL or data URL
  thumbnail?: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number; // width / height
  cropMode: CropMode;
  focalPoint: { x: number; y: number }; // 0 to 100 percentage
  isHero?: boolean;
  duration?: number; // Override duration in seconds
  caption?: string;
  order: number;
  createdAt: number;
}

export interface ChapterConfig {
  id: string;
  chapterIndex: number; // 1 to 7
  title: string;
  vietnameseTitle: string;
  subtitle: string;
  description: string;
  enabled: boolean;
  mode: 'auto' | 'custom';
  effectMode: EffectMode;
  speed: number; // pixels per second or seconds per photo
  durationOverride?: number; // custom total duration in seconds
  transitionType: 'fade' | 'soft_light' | 'film_wipe' | 'blur_dissolve';
  photos: PhotoItem[];
  musicTrackId?: string;
  accentQuote?: string;

  // Granular Scene & Presentation Controls
  sceneDurationOverrides?: Record<string, number>;
  filmstripSpeedMode?: 'auto' | 'slow' | 'medium' | 'fast' | 'custom';
  filmstripSpeedCustom?: number;

  // Chapter 2 Visual Elegance Toggles (User Requested)
  showCenterTitle?: boolean; // Default true
  showCenterNames?: boolean; // Default false (User explicit directive)
  showFrameNames?: boolean;  // Default false (User explicit directive)
  showMetadata35mm?: boolean;// Default false (User explicit directive)
  showQuote?: boolean;       // Default true

  // Per-Chapter Audio Settings
  musicVolume?: number;      // 0.0 to 1.0 (default: 0.85)
  musicLoop?: boolean;       // default: true
  musicStartOffset?: number; // start offset in seconds
}

export interface AudioTrack {
  id: string;
  mediaId?: string; // Stable key in Dexie db.audio
  name: string;
  artist?: string;
  url: string;
  blob?: Blob;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  volume: number; // 0.0 to 1.0
  fadeInDuration: number;
  fadeOutDuration: number;
  isGlobal: boolean; // Plays across chapters
  chapterId?: string; // If specific to chapter
}

export interface GlobalSettings {
  aspectRatio: '16:9' | '4:3' | '21:9';
  cinemaPace: 'slow' | 'cinematic' | 'brisk';
  quality: 'preview' | 'presentation';
  enableFilmGrain: boolean;
  enableVignette: boolean;
  enableSprockets: boolean;
  filmColorTone: 'warm_classic' | 'burgundy_luxe' | 'monochrome_gold' | 'natural';

  // Performance & Audio Architecture
  performanceMode?: 'balanced' | 'high_performance'; // Balanced is standard luxury, High Performance reduces heavy filters
  audioMode?: 'global' | 'per_chapter'; // Global: 1 song throughout; Per-Chapter: dedicated track per chapter
  crossfadeDuration?: number; // Crossfade in seconds (default: 0.8s, range: 0.2 to 2.0s)
  loopGlobalAudio?: boolean;  // Loop global song if shorter than movie (default: true)
}

export interface WeddingProject {
  id: string;
  version: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  lunarDate: string;
  venueName?: string;
  thankYouMessage: string;
  openingPhotoId?: string;
  endingPhotoId?: string;
  proposalPhotoId?: string;
  chapters: ChapterConfig[];
  audioTracks: AudioTrack[];
  globalSettings: GlobalSettings;
  createdAt: number;
  updatedAt: number;
}
