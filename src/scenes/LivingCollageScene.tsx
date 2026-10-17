import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX02_ArcCarousel3D } from '../effects/FX02_ArcCarousel3D';
import { FX05_FloatingPhotoGallery } from '../effects/FX05_FloatingPhotoGallery';
import { FX06_EditorialSplitReveal } from '../effects/FX06_EditorialSplitReveal';
import { FX09_CinematicMaskReveal } from '../effects/FX09_CinematicMaskReveal';
import { FX11_PhotoMosaicTransformation } from '../effects/FX11_PhotoMosaicTransformation';
import { WeddingStoryOverlay } from '../components/story/WeddingStoryOverlay';

interface LivingCollageSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

const LivingCollageSceneComponent: React.FC<LivingCollageSceneProps> = ({
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

  let content: React.ReactNode;

  // Single photo: Cinematic Mask Reveal
  if (count === 1) {
    content = (
      <FX09_CinematicMaskReveal
        photo={photos[0]}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  } else if (count === 2) {
    // 2 photos: Editorial Split Reveal 60/40
    content = (
      <FX06_EditorialSplitReveal
        primaryPhoto={photos[0]}
        secondaryPhoto={photos[1]}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  } else if (count === 3) {
    // 3 photos: Asymmetric Photo Mosaic
    content = (
      <FX11_PhotoMosaicTransformation
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  } else if (count === 4) {
    // 4 photos: Multi-Depth Floating Photo Gallery
    content = (
      <FX05_FloatingPhotoGallery
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  } else {
    // 5+ photos: 3D Arc Carousel with smooth cylindrical depth
    content = (
      <FX02_ArcCarousel3D
        photos={photos}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {content}
      {scene.chapterIndex === 5 && (
        <WeddingStoryOverlay
          scene={scene}
          featured={scene.config.showChapterIntro === true}
        />
      )}
    </div>
  );
};

// Visual motion is driven directly from MotionRuntime; avoid reconciling the
// complete collage tree on the 10 Hz UI timecode updates.
export const LivingCollageScene = React.memo(
  LivingCollageSceneComponent,
  (previous, next) => previous.scene === next.scene && previous.isPlaying === next.isPlaying
);

LivingCollageScene.displayName = 'LivingCollageScene';
