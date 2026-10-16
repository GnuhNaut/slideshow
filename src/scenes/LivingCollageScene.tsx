import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX02_ArcCarousel3D } from '../effects/FX02_ArcCarousel3D';
import { FX05_FloatingPhotoGallery } from '../effects/FX05_FloatingPhotoGallery';
import { FX06_EditorialSplitReveal } from '../effects/FX06_EditorialSplitReveal';
import { FX09_CinematicMaskReveal } from '../effects/FX09_CinematicMaskReveal';
import { FX11_PhotoMosaicTransformation } from '../effects/FX11_PhotoMosaicTransformation';

interface LivingCollageSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const LivingCollageScene: React.FC<LivingCollageSceneProps> = ({
  scene,
  progress,
  isPlaying,
}) => {
  const photos = scene.photos;
  const count = photos.length;

  // Empty state guard
  if (count === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  // Single photo: Cinematic Mask Reveal
  if (count === 1) {
    return (
      <FX09_CinematicMaskReveal
        photo={photos[0]}
        progress={progress}
        isPlaying={isPlaying}
      />
    );
  }

  // 2 photos: Editorial Split Reveal 60/40
  if (count === 2) {
    return (
      <FX06_EditorialSplitReveal
        primaryPhoto={photos[0]}
        secondaryPhoto={photos[1]}
        progress={progress}
        isPlaying={isPlaying}
      />
    );
  }

  // 3 photos: Asymmetric Photo Mosaic
  if (count === 3) {
    return (
      <FX11_PhotoMosaicTransformation
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
      />
    );
  }

  // 4 photos: Multi-Depth Floating Photo Gallery
  if (count === 4) {
    return (
      <FX05_FloatingPhotoGallery
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
      />
    );
  }

  // 5+ photos: 3D Arc Carousel with smooth cylindrical depth
  return (
    <FX02_ArcCarousel3D
      photos={photos}
      progress={progress}
      isPlaying={isPlaying}
    />
  );
};
