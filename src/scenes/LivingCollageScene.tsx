import React from 'react';
import { TimelineScene } from '../types/timeline';

interface LivingCollageSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const LivingCollageScene: React.FC<LivingCollageSceneProps> = ({ scene, progress }) => {
  const photos = scene.photos;
  const displayPhotos = photos.slice(0, 4);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#151114] p-8">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#81252D]/20 via-[#151114] to-[#1e151b] pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-20 mb-4 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#ecd28f] font-serif-sc">
          {scene.chapterTitle}
        </span>
        {scene.config.quote && (
          <p className="text-xs text-[#FFF4E4]/70 italic font-serif mt-1">
            "{scene.config.quote}"
          </p>
        )}
      </div>

      {/* Living Collage Grid with Micro-floating animation based on progress */}
      <div className="relative z-10 w-full max-w-5xl h-[68vh] grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {displayPhotos.map((photo, index) => {
          // Floating offset alternates per photo
          const floatDir = index % 2 === 0 ? 1 : -1;
          const floatY = floatDir * Math.sin(progress * Math.PI * 2) * 8;
          const rotation = (index - 1.5) * 1.5;

          return (
            <div
              key={photo.id}
              className="relative h-full max-h-[60vh] flex flex-col p-2.5 rounded-lg bg-[#1a1317] border border-[#ecd28f]/30 shadow-2xl transition-transform duration-300 hover:z-30 hover:scale-105"
              style={{
                transform: `translateY(${floatY}px) rotate(${rotation}deg)`,
                boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
              }}
            >
              <div className="relative flex-1 bg-[#0d090b] rounded overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title || `Collage ${index}`}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                  }}
                />
                <div className="absolute inset-0 bg-radial from-transparent to-black/30 pointer-events-none" />
              </div>

              <div className="mt-2 text-center">
                <p className="text-[11px] font-serif text-[#ecd28f] truncate px-1">
                  {photo.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
