import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FilmToHeroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FilmToHeroScene: React.FC<FilmToHeroSceneProps> = ({ scene, progress }) => {
  const heroPhoto = scene.heroPhoto || scene.photos[0];
  const photos = scene.photos;

  const phase1Progress = Math.min(1, progress / 0.4);
  const phase2Progress = Math.max(0, (progress - 0.35) / 0.65);

  const heroScale = 1 + phase2Progress * 0.38;
  const stripOpacity = Math.max(0, 1 - phase2Progress * 1.6);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#1C1718] select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#581E2C]/25 via-[#1C1718]/90 to-[#1C1718] pointer-events-none" />

      {/* Decelerating background filmstrip */}
      <div
        className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: stripOpacity }}
      >
        <div
          className="flex items-center gap-6 py-4 will-change-transform"
          style={{ transform: `translate3d(${-phase1Progress * 150}px, 0, 0)` }}
        >
          {photos.map((photo, i) => (
            <div
              key={`fth_${photo.id}_${i}`}
              className="w-64 h-48 bg-[#241C1E] border border-[#BFA47D]/20 rounded-sm p-2 shrink-0 opacity-50"
            >
              <img src={photo.url} alt="strip" className="w-full h-full object-cover rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Hero Expanding Photo */}
      {heroPhoto && (
        <div
          className="relative z-20 flex flex-col items-center max-w-4xl px-4 will-change-transform transition-all duration-300"
          style={{
            transform: `scale(${heroScale}) translateY(${-phase2Progress * 12}px)`,
          }}
        >
          <div
            className="relative rounded-lg overflow-hidden border border-[#BFA47D]/60 bg-[#1E1719] shadow-2xl transition-all duration-700"
            style={{
              boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 ${phase2Progress * 30}px rgba(191,164,125,${phase2Progress * 0.3})`,
              maxHeight: '64vh',
            }}
          >
            <img
              src={heroPhoto.url}
              alt={heroPhoto.title || 'Proposal Hero'}
              className="w-full h-auto max-h-[60vh] object-contain"
              style={{
                objectPosition: `${heroPhoto.focalPoint?.x ?? 50}% ${heroPhoto.focalPoint?.y ?? 50}%`,
              }}
            />
          </div>

          {/* Editorial Caption emerging in phase 2 */}
          <div
            className="mt-5 text-center transition-all duration-500"
            style={{
              opacity: phase2Progress,
              transform: `translateY(${16 * (1 - phase2Progress)}px)`,
            }}
          >
            <div className="inline-block px-3 py-0.5 rounded-full bg-[#581E2C]/70 border border-[#BFA47D]/40 mb-1.5">
              <span className="text-[10px] tracking-[0.25em] text-[#BFA47D] uppercase font-serif font-semibold">
                {scene.chapterTitle}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#F5EDE1] tracking-wide font-medium">
              {heroPhoto.title || 'Khoảnh Khắc Cầu Hôn Thiêng Liêng'}
            </h2>
            <p className="text-xs md:text-sm text-[#BFA47D] italic font-serif mt-1">
              "Yes, I Do — Hai trái tim nguyện chung một nhịp đập"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
