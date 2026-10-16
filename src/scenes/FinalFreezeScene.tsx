import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FinalFreezeSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FinalFreezeScene: React.FC<FinalFreezeSceneProps> = ({ scene }) => {
  const photo = scene.heroPhoto || scene.photos[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] select-none perspective-wide">
      {/* Radiant celebratory warm backdrop */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/75 to-[#FFF9F2] pointer-events-none" />

      {/* Main Ending Photo: Pristine Full-Res Presentation Hold */}
      {photo && photo.url ? (
        <div className="relative z-10 w-[86vw] max-w-[1240px] max-h-[84vh] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col items-center">
          <div
            className="relative w-full overflow-hidden rounded-[2px] bg-[#FAF5EE]"
            style={{ maxHeight: '72vh' }}
          >
            <img
              src={photo.displayUrl || photo.url}
              alt={photo.title || 'Our Forever Final Photo'}
              className={`w-full h-auto max-h-[70vh] ${photo.cropMode === 'cover' ? 'object-cover' : 'object-contain'} mx-auto`}
              style={{
                objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
              }}
            />
          </div>

          {/* Minimalist Editorial Monogram Footer */}
          <div className="mt-4 w-full flex items-center justify-between px-3 border-t border-[#C5A16E]/20 pt-3">
            <div className="flex items-center gap-3">
              <span className="font-serif italic font-medium text-xl text-[#C93442]">
                Tuấn Hùng &amp; Sao Mai
              </span>
              <span className="text-[11px] tracking-[0.25em] text-[#40322F]/70 uppercase font-sans font-semibold">
                • OUR FOREVER
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs tracking-[0.2em] text-[#C5A16E] font-serif font-medium">
                19.10.2026
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-[86vw] max-w-[800px] p-8 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-2 border-[#C5A16E]/40 flex items-center justify-center bg-[#FAF3EB] shadow-inner">
            <span className="font-serif text-3xl text-[#C93442] italic">H&amp;M</span>
          </div>
          <h2 className="font-serif text-3xl font-medium text-[#40322F] tracking-wide">
            TUẤN HÙNG &amp; SAO MAI
          </h2>
          <div className="w-16 h-[2px] bg-[#C5A16E]" />
          <p className="text-sm tracking-[0.25em] text-[#C5A16E] font-serif font-medium uppercase">
            OUR FOREVER • 19.10.2026
          </p>
          <span className="text-[11px] text-[#40322F]/60 font-mono">
            (Thêm ảnh vào public/gallery/07-final/ hoặc cấu hình "endingPhoto" trong wedding.config.json)
          </span>
        </div>
      )}
    </div>
  );
};
