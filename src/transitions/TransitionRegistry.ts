// Registry of cinematic chapter transitions and their durations

export type ChapterTransitionId =
  | 'FILM_PORTAL_OPENING'           // Ch 1 -> 2 (1.2s): lightweight ivory dissolve into the filmstrip
  | 'TRUE_FILM_TO_HERO_MORPH'        // Ch 2 -> 3 (1.3s): Proposal photo detaches from filmstrip and zooms to center
  | 'PREMIUM_3D_ALBUM_TURN'          // Ch 3 -> 4 (1.1s): True 3D album page flip with hinge at left edge
  | 'GALLERY_SPACE_TRANSFORMATION'   // Ch 4 -> 5 (1.2s): Family album recedes into 3D Z-space, wedding photos surge forward
  | 'GRAND_WEDDING_CURTAIN_REVEAL'   // Ch 5 -> 6 (1.3s): Wedding photos part left/right, revealing majestic central Lời Cảm Ơn
  | 'FOREVER_FINAL_REVEAL'           // Ch 6 -> 7 (1.2s): Typography softens, ending photo occupies full frame into FINAL_HOLD
  | 'DEFAULT_DISSOLVE';

export interface TransitionSpec {
  id: ChapterTransitionId;
  duration: number; // in seconds
  fromChapter: number;
  toChapter: number;
}

export const CHAPTER_TRANSITIONS: Record<string, TransitionSpec> = {
  '1_to_2': {
    id: 'FILM_PORTAL_OPENING',
    duration: 1.2,
    fromChapter: 1,
    toChapter: 2,
  },
  '2_to_3': {
    id: 'TRUE_FILM_TO_HERO_MORPH',
    duration: 1.3,
    fromChapter: 2,
    toChapter: 3,
  },
  '3_to_4': {
    id: 'PREMIUM_3D_ALBUM_TURN',
    duration: 1.1,
    fromChapter: 3,
    toChapter: 4,
  },
  '4_to_5': {
    id: 'GALLERY_SPACE_TRANSFORMATION',
    duration: 1.2,
    fromChapter: 4,
    toChapter: 5,
  },
  '5_to_6': {
    id: 'GRAND_WEDDING_CURTAIN_REVEAL',
    duration: 1.3,
    fromChapter: 5,
    toChapter: 6,
  },
  '6_to_7': {
    id: 'FOREVER_FINAL_REVEAL',
    duration: 1.2,
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
