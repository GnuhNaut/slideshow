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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1C1718] select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-[#581E2C]/20 via-[#1C1718]/90 to-[#1C1718] pointer-events-none" />

      {/* Main Ending Photo: Stable, Pristine, Indefinite Presentation Hold */}
      {photo ? (
        <div className="relative z-10 max-w-5xl max-h-[84vh] p-4 rounded-lg bg-[#241C1E] border border-[#BFA47D]/50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded bg-[#100B0D] shadow-2xl"
            style={{ maxHeight: '72vh' }}
          >
            <img
              src={photo.url}
              alt={photo.title || 'Our Forever Final Photo'}
              className="w-full h-auto max-h-[70vh] object-contain"
              style={{
                objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
              }}
            />
          </div>

          {/* Minimalist Editorial Monogram Footer */}
          <div className="mt-3.5 w-full flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <span className="font-serif italic font-semibold text-lg text-[#F5EDE1]">
                Tuấn Hùng &amp; Sao Mai
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#BFA47D] uppercase font-mono">
                • OUR FOREVER
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs tracking-[0.2em] text-[#BFA47D] font-serif">
                19.10.2026
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#BFA47D]/50 italic">
          Đang hiển thị ảnh kết thúc (Our Forever)
        </div>
      )}
    </div>
  );
};
