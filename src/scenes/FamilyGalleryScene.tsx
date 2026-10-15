import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FamilyGallerySceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FamilyGalleryScene: React.FC<FamilyGallerySceneProps> = ({ scene, progress }) => {
  const photos = scene.photos;
  const isDuo = photos.length >= 2;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#1C1718] p-6 md:p-8 select-none">
      {/* Warm Ambient Family Lighting */}
      <div className="absolute inset-0 bg-radial from-[#581E2C]/20 via-[#1C1718]/90 to-[#1C1718] pointer-events-none" />

      {/* Top Header Tag */}
      <div className="relative z-10 mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#581E2C]/50 border border-[#BFA47D]/35 mb-1.5">
          <span className="text-[10px] tracking-[0.25em] text-[#BFA47D] uppercase font-serif font-semibold">
            {scene.chapterTitle}
          </span>
        </div>
        <p className="text-xs text-[#F5EDE1]/85 italic font-serif">
          {scene.config.quote || 'Tình thân ấm áp — Hai gia đình chung một niềm vui'}
        </p>
      </div>

      {/* Family Photos: STRICT CONTAIN RATIO (Zero face cropping at edges!) */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center">
        {isDuo ? (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[72vh] items-center">
            {photos.slice(0, 2).map((photo, i) => (
              <div
                key={photo.id}
                className="relative flex flex-col items-center justify-center p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/30 shadow-2xl overflow-hidden"
                style={{
                  transform: `translateY(${i % 2 === 0 ? progress * 5 : -progress * 5}px)`,
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-[#100B0D] rounded overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title || 'Ảnh gia đình'}
                    className="w-full h-full object-contain max-h-[58vh]"
                  />
                </div>
                <span className="mt-2 text-xs font-serif text-[#BFA47D] tracking-wide">
                  {photo.title || `Gia Đình Sum Vầy #${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        ) : photos.length === 1 ? (
          <div className="relative flex flex-col items-center p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/35 shadow-2xl max-h-[72vh]">
            <div className="relative w-full h-full flex items-center justify-center bg-[#100B0D] rounded overflow-hidden">
              <img
                src={photos[0].url}
                alt={photos[0].title || 'Gia Đình'}
                className="w-full h-full object-contain max-h-[64vh]"
              />
            </div>
            <span className="mt-2 text-xs font-serif text-[#BFA47D] tracking-wide">
              {photos[0].title || 'Hai Gia Đình, Một Hạnh Phúc'}
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#BFA47D]/50 italic">Đang tải ảnh gia đình...</div>
        )}
      </div>

      {/* Preservation indicator */}
      <div className="relative z-10 mt-2 text-[9px] text-[#BFA47D]/50 font-mono tracking-widest uppercase">
        FAMILY PHOTO PROTECTION • RATIO PRESERVED
      </div>
    </div>
  );
};
