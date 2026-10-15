import React from 'react';
import { TimelineScene } from '../types/timeline';

interface HeroMomentSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const HeroMomentScene: React.FC<HeroMomentSceneProps> = ({ scene, progress }) => {
  const photo = scene.heroPhoto || scene.photos[0];
  const panDir = scene.config.panDirection || 'zoom_in';

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const focalX = photo?.focalPoint?.x ?? 50;
  const focalY = photo?.focalPoint?.y ?? 50;

  if (panDir === 'zoom_in') {
    scale = 1 + progress * 0.10;
  } else if (panDir === 'zoom_out') {
    scale = 1.12 - progress * 0.10;
  } else if (panDir === 'left') {
    scale = 1.06;
    translateX = (progress - 0.5) * 30;
  } else if (panDir === 'right') {
    scale = 1.06;
    translateX = (0.5 - progress) * 30;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1C1718] select-none">
      {/* Background ambient layer */}
      {photo && (
        <div className="absolute inset-0 pointer-events-none opacity-20 filter blur-xl scale-110">
          <img src={photo.url} alt="Ambiance" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#1C1718]/40 to-[#1C1718]/90 z-10 pointer-events-none" />

      {/* Main Photo Frame with Ken Burns motion */}
      {photo ? (
        <div className="relative z-10 max-w-5xl max-h-[84vh] p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded bg-[#100B0D] shadow-inner"
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
          </div>

          {/* Bottom Title Bar */}
          <div className="mt-3 w-full flex items-center justify-between px-2">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#BFA47D] font-serif font-semibold">
                {scene.config.textTitle || scene.chapterTitle}
              </p>
              <h3 className="text-sm md:text-base font-serif text-[#F5EDE1] font-medium">
                {photo.title}
              </h3>
            </div>
            {scene.config.quote && (
              <p className="text-xs text-[#F5EDE1]/70 italic font-serif max-w-sm text-right hidden sm:block">
                "{scene.config.quote}"
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#BFA47D]/50 italic">Đang tải ảnh...</div>
      )}
    </div>
  );
};
