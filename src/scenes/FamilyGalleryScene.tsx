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
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border border-[#C5A16E]/40 flex items-center justify-center bg-white shadow-sm">
          <span className="font-serif text-2xl text-[#C93442] italic">IV</span>
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#40322F]">
          {scene.chapterTitle || 'HAI GIA ĐÌNH, MỘT HẠNH PHÚC'}
        </h2>
        <p className="text-xs text-[#C5A16E] italic font-serif max-w-md">
          {scene.config.quote || 'Hạnh phúc đong đầy trong tình thương yêu của đấng sinh thành.'}
        </p>
        <span className="text-[11px] text-[#40322F]/60 font-mono">
          (Thêm ảnh vào public/gallery/04-family/)
        </span>
      </div>
    );
  }

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
