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

  // Single photo: Cinematic Mask Reveal
  if (count <= 1) {
    return (
      <FX09_CinematicMaskReveal
        photo={photos[0]}
        progress={progress}
        isPlaying={isPlaying}
        title={scene.config.textTitle || 'KHOẢNH KHẮC THIÊNG LIÊNG'}
        quote={scene.config.quote || 'Tình yêu tìm thấy nơi bình yên nhất giữa cuộc đời.'}
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
        title={scene.config.textTitle || 'FOREVER TOGETHER'}
        subtitle={scene.chapterTitle || 'KỶ NIỆM NGÀY CƯỚI'}
        quote={scene.config.quote || 'Khoảnh khắc thiêng liêng khi hai trái tim chung một nhịp đập.'}
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
        accentQuote={scene.config.quote || 'Từng khoảnh khắc đong đầy dư vị ngọt ngào.'}
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
        accentQuote={scene.config.quote || 'Những khoảnh khắc đẹp nhất trên hành trình hạnh phúc.'}
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
