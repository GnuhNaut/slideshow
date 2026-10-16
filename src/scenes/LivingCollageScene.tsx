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
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border border-[#C5A16E]/40 flex items-center justify-center bg-white shadow-sm">
          <span className="font-serif text-2xl text-[#C93442] italic">◈</span>
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#40322F]">
          {scene.chapterTitle || 'BỘ SƯU TẬP ẢNH'}
        </h2>
        <p className="text-xs text-[#C5A16E] italic font-serif max-w-md">
          {scene.config.quote || 'Khoảnh khắc thiêng liêng khi hai trái tim chung một nhịp đập.'}
        </p>
        <span className="text-[11px] text-[#40322F]/60 font-mono">
          (Thêm ảnh vào thư mục tương ứng trong public/gallery/)
        </span>
      </div>
    );
  }

  // Single photo: Cinematic Mask Reveal
  if (count === 1) {
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
