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

  if (photos.length === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  // If 3 or more photos, use PhotoStackReveal
  if (photos.length >= 3) {
    return (
      <FX08_PhotoStackReveal
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
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
    />
  );
};
