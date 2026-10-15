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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#151114]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-[#81252D]/20 via-[#151114]/90 to-[#151114] pointer-events-none" />

      {/* Main Frozen Photo: ZERO MOVEMENT, PERFECT STABILITY */}
      {photo ? (
        <div className="relative z-10 max-w-5xl max-h-[82vh] p-4 rounded-xl bg-[#1e151b] border-2 border-[#ecd28f]/60 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded shadow-2xl bg-[#0d090b]"
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

            {/* Subtle corner golden photo mounts */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#d4ac59]" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#d4ac59]" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#d4ac59]" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#d4ac59]" />
          </div>

          {/* Bottom Permanent Monogram & Date Badge */}
          <div className="mt-4 w-full flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="font-serif italic font-semibold text-lg text-[#ecd28f]">
                Tuấn Hùng &amp; Sao Mai
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#FFF4E4]/60 font-mono">
                • OUR FOREVER
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs tracking-[0.2em] text-[#ecd28f] font-serif">
                19.10.2026
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#ecd28f]/50 italic">
          Đang hiển thị ảnh kết thúc (Our Forever)
        </div>
      )}
    </div>
  );
};
