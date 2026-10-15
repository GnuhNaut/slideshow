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
      {photo ? (
        <div className="relative z-10 w-[86vw] max-w-[1240px] max-h-[84vh] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col items-center">
          <div
            className="relative w-full overflow-hidden rounded-[2px] bg-[#FAF5EE]"
            style={{ maxHeight: '72vh' }}
          >
            <img
              src={photo.url}
              alt={photo.title || 'Our Forever Final Photo'}
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
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
        <div className="text-sm text-[#C5A16E] italic font-serif">
          Đang hiển thị ảnh kết thúc (Our Forever)
        </div>
      )}
    </div>
  );
};
