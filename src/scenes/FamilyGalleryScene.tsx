import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX04_LuxuryAlbumPageTurn } from '../effects/FX04_LuxuryAlbumPageTurn';
import { FX08_PhotoStackReveal } from '../effects/FX08_PhotoStackReveal';

interface FamilyGallerySceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FamilyGalleryScene: React.FC<FamilyGallerySceneProps> = ({
  scene,
  progress,
  isPlaying,
}) => {
  const photos = scene.photos;

  // If 3 or more photos, use PhotoStackReveal
  if (photos.length >= 3) {
    return (
      <FX08_PhotoStackReveal
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
        accentQuote={scene.config.quote || 'Tình thân ấm áp — Hai gia đình chung một niềm hạnh phúc.'}
      />
    );
  }

  // Double-page Luxury Album Turn for 1-2 family photos
  return (
    <FX04_LuxuryAlbumPageTurn
      leftPhoto={photos[0]}
      rightPhoto={photos[1] || photos[0]}
      nextPhoto={photos[1]}
      progress={progress}
      isPlaying={isPlaying}
      chapterTitle={scene.chapterTitle || 'HAI GIA ĐÌNH, MỘT HẠNH PHÚC'}
      quote={scene.config.quote || 'Hạnh phúc đong đầy trong tình thương yêu của đấng sinh thành.'}
    />
  );
};
