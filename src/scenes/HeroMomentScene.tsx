import React from 'react';
import { TimelineScene } from '../types/timeline';

interface HeroMomentSceneProps {
  scene: TimelineScene;
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export const HeroMomentScene: React.FC<HeroMomentSceneProps> = ({ scene, progress }) => {
  const photo = scene.heroPhoto || scene.photos[0];
  const panDir = scene.config.panDirection || 'zoom_in';

  // Calculate smooth Ken Burns transform
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const focalX = photo?.focalPoint?.x ?? 50;
  const focalY = photo?.focalPoint?.y ?? 50;

  if (panDir === 'zoom_in') {
    scale = 1 + progress * 0.12;
  } else if (panDir === 'zoom_out') {
    scale = 1.15 - progress * 0.12;
  } else if (panDir === 'left') {
    scale = 1.08;
    translateX = (progress - 0.5) * 35;
  } else if (panDir === 'right') {
    scale = 1.08;
    translateX = (0.5 - progress) * 35;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#151114]">
      {/* Background blurred ambiance for portrait or contain photos */}
      {photo && (
        <div className="absolute inset-0 pointer-events-none opacity-25 filter blur-xl scale-110">
          <img src={photo.url} alt="Ambiance" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#151114]/40 to-[#151114]/90 z-10 pointer-events-none" />

      {/* Main Photo Frame with Ken Burns camera motion */}
      {photo ? (
        <div className="relative z-10 max-w-5xl max-h-[82vh] p-3 rounded-lg bg-[#1a1418] border border-[#ecd28f]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded shadow-inner"
            style={{ maxHeight: '72vh' }}
          >
            <img
              src={photo.url}
              alt={photo.title || 'Cinematic Hero'}
              className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-100 ease-linear"
              style={{
                transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`,
                transformOrigin: `${focalX}% ${focalY}%`,
              }}
            />
            {/* 35mm film marking line at bottom edge */}
            <div className="absolute bottom-1 inset-x-2 flex items-center justify-between text-[8px] text-[#ecd28f]/50 font-mono pointer-events-none">
              <span>CINEMATIC HYBRID 35MM</span>
              <span>TUẤN HÙNG &amp; SAO MAI</span>
            </div>
          </div>

          {/* Bottom Title / Quote Bar */}
          <div className="mt-3 w-full flex items-center justify-between px-2">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#ecd28f] font-serif-sc">
                {scene.config.textTitle || scene.chapterTitle}
              </p>
              <h3 className="text-sm md:text-base font-serif text-[#FFF4E4] font-medium">
                {photo.title}
              </h3>
            </div>
            {scene.config.quote && (
              <p className="text-xs text-[#FFF4E4]/70 italic font-serif max-w-sm text-right hidden sm:block">
                "{scene.config.quote}"
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#ecd28f]/50 italic">Chưa có ảnh trong cảnh này</div>
      )}
    </div>
  );
};
