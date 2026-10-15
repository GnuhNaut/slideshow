import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FilmToHeroSceneProps {
  scene: TimelineScene;
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export const FilmToHeroScene: React.FC<FilmToHeroSceneProps> = ({ scene, progress }) => {
  const heroPhoto = scene.heroPhoto || scene.photos[0];
  const photos = scene.photos;

  // In the first 40% of the scene, strip is rolling and decelerating.
  // In the next 60%, the hero photo scales up and moves to center stage.
  const phase1Progress = Math.min(1, progress / 0.4);
  const phase2Progress = Math.max(0, (progress - 0.35) / 0.65);

  // Eased expansion for phase 2
  const heroScale = 1 + phase2Progress * 0.45;
  const stripOpacity = Math.max(0, 1 - phase2Progress * 1.5);
  const heroGlow = phase2Progress * 40;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#151114]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#81252D]/30 via-[#151114]/90 to-[#151114] pointer-events-none" />

      {/* Decelerating background filmstrip */}
      <div
        className="absolute inset-x-0 flex items-center justify-center transition-opacity duration-700 pointer-events-none"
        style={{ opacity: stripOpacity }}
      >
        <div
          className="flex items-center gap-6 py-4 will-change-transform"
          style={{
            transform: `translate3d(${-phase1Progress * 180}px, 0, 0)`,
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={`fth_${photo.id}_${i}`}
              className="w-64 h-48 bg-[#1e151b] border border-[#ecd28f]/20 rounded p-2 shrink-0 opacity-60"
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
            transform: `scale(${heroScale}) translateY(${-phase2Progress * 15}px)`,
          }}
        >
          <div
            className="relative rounded-lg overflow-hidden border-2 border-[#ecd28f] bg-[#1a1418] shadow-2xl transition-all duration-700"
            style={{
              boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 ${heroGlow}px rgba(212,172,89,${phase2Progress * 0.5})`,
              maxHeight: '62vh',
            }}
          >
            <img
              src={heroPhoto.url}
              alt={heroPhoto.title || 'Proposal Hero'}
              className="w-full h-auto max-h-[58vh] object-contain rounded"
              style={{
                objectPosition: `${heroPhoto.focalPoint?.x ?? 50}% ${heroPhoto.focalPoint?.y ?? 50}%`,
              }}
            />
            {/* Film Frame Perforation Line on the hero card */}
            <div className="absolute top-0 inset-x-0 h-2 bg-[#0b080a] film-sprocket-track border-b border-[#ecd28f]/20" />
            <div className="absolute bottom-0 inset-x-0 h-2 bg-[#0b080a] film-sprocket-track border-t border-[#ecd28f]/20" />
          </div>

          {/* Caption & Title emerging in phase 2 */}
          <div
            className="mt-6 text-center transition-all duration-500"
            style={{
              opacity: phase2Progress,
              transform: `translateY(${20 * (1 - phase2Progress)}px)`,
            }}
          >
            <div className="inline-block px-4 py-1 rounded-full bg-[#81252D]/80 border border-[#ecd28f]/50 mb-2">
              <span className="text-[11px] tracking-[0.25em] text-[#ecd28f] uppercase font-serif-sc">
                {scene.chapterTitle}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-[#FFF4E4] tracking-wide font-medium">
              {heroPhoto.title || 'Khoảnh Khắc Cầu Hôn Thiêng Liêng'}
            </h2>
            <p className="text-xs md:text-sm text-[#ecd28f]/80 italic font-serif mt-1">
              "Yes, I Do — Hai trái tim nguyện chung một nhịp đập"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
