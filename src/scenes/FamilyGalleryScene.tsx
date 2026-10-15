import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FamilyGallerySceneProps {
  scene: TimelineScene;
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export const FamilyGalleryScene: React.FC<FamilyGallerySceneProps> = ({ scene, progress }) => {
  const photos = scene.photos;
  const layout = scene.config.layout || (photos.length === 2 ? 'split_2' : 'hero_and_2');

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#151114] p-6">
      {/* Warm Ambient Family Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#95161b]/25 via-[#1a1317]/80 to-[#151114] pointer-events-none" />

      {/* Top Header Tag */}
      <div className="relative z-10 mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#81252D]/60 border border-[#ecd28f]/40 mb-1">
          <span className="text-[10px] tracking-[0.25em] text-[#ecd28f] uppercase font-serif-sc">
            {scene.chapterTitle}
          </span>
        </div>
        <p className="text-xs text-[#FFF4E4]/70 italic font-serif">
          {scene.config.quote || 'Tình thân ấm áp — Hai gia đình chung một niềm vui'}
        </p>
      </div>

      {/* Family Photos Layout: SAFE CONTAIN MODE (no one cropped at borders) */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center">
        {layout === 'split_2' && photos.length >= 2 ? (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[72vh]">
            {photos.slice(0, 2).map((photo, i) => (
              <div
                key={photo.id}
                className="relative flex flex-col items-center justify-center p-3 rounded-lg bg-[#1e151b] border border-[#ecd28f]/35 shadow-2xl overflow-hidden"
                style={{
                  transform: `translateY(${i % 2 === 0 ? progress * 6 : -progress * 6}px)`,
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-[#0d090b] rounded overflow-hidden">
                  {/* Contain mode to protect whole family! */}
                  <img
                    src={photo.url}
                    alt={photo.title || 'Ảnh gia đình'}
                    className="w-full h-full object-contain max-h-[60vh]"
                  />
                </div>
                <span className="mt-2 text-xs font-serif text-[#ecd28f] tracking-wide">
                  {photo.title || `Gia Đình Sum Vầy #${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        ) : layout === 'hero_and_2' && photos.length >= 3 ? (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[72vh]">
            {/* Main Center/Left Hero */}
            <div className="md:col-span-2 relative flex flex-col p-3 rounded-lg bg-[#1e151b] border-2 border-[#ecd28f]/50 shadow-2xl overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d090b] rounded overflow-hidden">
                <img
                  src={photos[0].url}
                  alt={photos[0].title || 'Ảnh gia đình chính'}
                  className="w-full h-full object-contain max-h-[60vh]"
                />
              </div>
              <span className="mt-2 text-xs font-serif text-[#ecd28f] font-medium tracking-wide">
                {photos[0].title || 'Lễ Dạm Ngõ & Ăn Hỏi'}
              </span>
            </div>

            {/* 2 Supporting Side Photos */}
            <div className="flex flex-col gap-4">
              {photos.slice(1, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="flex-1 flex flex-col p-2 rounded-lg bg-[#1a1317] border border-[#ecd28f]/30 shadow-lg overflow-hidden"
                >
                  <div className="relative w-full h-full flex items-center justify-center bg-[#0d090b] rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title || 'Ảnh chi tiết'}
                      className="w-full h-full object-contain max-h-[26vh]"
                    />
                  </div>
                  <span className="mt-1 text-[11px] font-serif text-[#FFF4E4]/80 text-center">
                    {photo.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single photo full display with safe margins */
          <div className="relative flex flex-col items-center p-3 rounded-lg bg-[#1e151b] border border-[#ecd28f]/40 shadow-2xl max-h-[72vh]">
            <div className="relative w-full h-full flex items-center justify-center bg-[#0d090b] rounded overflow-hidden">
              <img
                src={photos[0]?.url}
                alt={photos[0]?.title || 'Gia Đình'}
                className="w-full h-full object-contain max-h-[64vh]"
              />
            </div>
            <span className="mt-2 text-xs font-serif text-[#ecd28f] tracking-wide">
              {photos[0]?.title || 'Hai Gia Đình, Một Hạnh Phúc'}
            </span>
          </div>
        )}
      </div>

      {/* Protective Notice */}
      <div className="relative z-10 mt-3 text-[10px] text-[#ecd28f]/40 font-mono tracking-widest uppercase">
        FAMILY PHOTO PROTECTION • FULL RATIO PRESERVED
      </div>
    </div>
  );
};
