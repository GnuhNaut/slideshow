// Registry of cinematic chapter transitions and their durations

export type ChapterTransitionId =
  | 'CINEMATIC_FILM_OPENING'    // Ch 1 -> 2 (0.9s - 1.3s)
  | 'FILM_TO_HERO_3D_MORPH'     // Ch 2 -> 3 (1.0s - 1.3s)
  | 'ALBUM_PAGE_TURN_3D'        // Ch 3 -> 4 (0.8s - 1.1s)
  | 'PREMIUM_GALLERY_REVEAL'    // Ch 4 -> 5 (0.9s - 1.4s)
  | 'GRAND_THANK_YOU_TRANSITION'// Ch 5 -> 6 (1.0s - 1.3s)
  | 'FINAL_PHOTO_REVEAL'        // Ch 6 -> 7 (0.9s - 1.4s)
  | 'DEFAULT_DISSOLVE';

export interface TransitionSpec {
  id: ChapterTransitionId;
  duration: number; // in seconds
  fromChapter: number;
  toChapter: number;
}

export const CHAPTER_TRANSITIONS: Record<string, TransitionSpec> = {
  '1_to_2': {
    id: 'CINEMATIC_FILM_OPENING',
    duration: 1.1,
    fromChapter: 1,
    toChapter: 2,
  },
  '2_to_3': {
    id: 'FILM_TO_HERO_3D_MORPH',
    duration: 1.2,
    fromChapter: 2,
    toChapter: 3,
  },
  '3_to_4': {
    id: 'ALBUM_PAGE_TURN_3D',
    duration: 1.0,
    fromChapter: 3,
    toChapter: 4,
  },
  '4_to_5': {
    id: 'PREMIUM_GALLERY_REVEAL',
    duration: 1.2,
    fromChapter: 4,
    toChapter: 5,
  },
  '5_to_6': {
    id: 'GRAND_THANK_YOU_TRANSITION',
    duration: 1.2,
    fromChapter: 5,
    toChapter: 6,
  },
  '6_to_7': {
    id: 'FINAL_PHOTO_REVEAL',
    duration: 1.1,
    fromChapter: 6,
    toChapter: 7,
  },
};

export function getTransitionBetween(fromChapter: number, toChapter: number): TransitionSpec {
  const key = `${fromChapter}_to_${toChapter}`;
  return (
    CHAPTER_TRANSITIONS[key] || {
      id: 'DEFAULT_DISSOLVE',
      duration: 0.8,
      fromChapter,
      toChapter,
    }
  );
}
