import React from 'react';
import { TimelineScene } from '../types/timeline';

interface LivingCollageSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const LivingCollageScene: React.FC<LivingCollageSceneProps> = ({ scene, progress }) => {
  const photos = scene.photos;
  const count = photos.length;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#1C1718] p-6 md:p-10 select-none">
      {/* Background Editorial Glow */}
      <div className="absolute inset-0 bg-radial from-[#581E2C]/25 via-[#1C1718]/90 to-[#1C1718] pointer-events-none" />

      {/* Chapter Tag & Quote */}
      <div className="relative z-20 mb-4 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#BFA47D] font-serif font-semibold">
          {scene.chapterTitle}
        </span>
        {scene.config.quote && (
          <p className="text-xs text-[#F5EDE1]/80 italic font-serif mt-1 max-w-xl mx-auto">
            "{scene.config.quote}"
          </p>
        )}
      </div>

      {/* Dynamic Adaptive Editorial Layout */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex items-center justify-center">
        {count === 1 ? (
          /* Single photo centered with rich margins */
          <div className="relative max-h-[72vh] p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/35 shadow-2xl flex flex-col items-center">
            <div className="relative overflow-hidden rounded bg-[#100B0D]" style={{ maxHeight: '64vh' }}>
              <img
                src={photos[0].url}
                alt={photos[0].title || 'Photo'}
                className="w-full h-auto max-h-[64vh] object-contain"
                style={{
                  objectPosition: `${photos[0].focalPoint?.x ?? 50}% ${photos[0].focalPoint?.y ?? 50}%`,
                }}
              />
            </div>
            <span className="mt-2 text-xs font-serif text-[#BFA47D] tracking-wide">
              {photos[0].title}
            </span>
          </div>
        ) : count === 2 ? (
          /* Duo Split */
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[72vh] items-center">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative flex flex-col items-center p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/30 shadow-2xl overflow-hidden"
                style={{
                  transform: `translateY(${i % 2 === 0 ? progress * 6 : -progress * 6}px)`,
                }}
              >
                <div className="relative w-full h-[58vh] bg-[#100B0D] rounded overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title || 'Photo'}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                    }}
                  />
                </div>
                <span className="mt-2 text-xs font-serif text-[#BFA47D] tracking-wide">
                  {photo.title}
                </span>
              </div>
            ))}
          </div>
        ) : count === 3 ? (
          /* Trio: 1 Main + 2 Supporting */
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[72vh] items-center">
            <div className="md:col-span-2 relative flex flex-col p-3 rounded-lg bg-[#241C1E] border border-[#BFA47D]/40 shadow-2xl">
              <div className="relative w-full h-[58vh] bg-[#100B0D] rounded overflow-hidden">
                <img
                  src={photos[0].url}
                  alt={photos[0].title || 'Photo'}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${photos[0].focalPoint?.x ?? 50}% ${photos[0].focalPoint?.y ?? 50}%`,
                  }}
                />
              </div>
              <span className="mt-2 text-xs font-serif text-[#BFA47D] font-medium tracking-wide">
                {photos[0].title}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {photos.slice(1, 3).map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col p-2 rounded-lg bg-[#1E1719] border border-[#BFA47D]/25 shadow-lg"
                >
                  <div className="relative w-full h-[26vh] bg-[#100B0D] rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                      }}
                    />
                  </div>
                  <span className="mt-1 text-[11px] font-serif text-[#F5EDE1]/80 text-center truncate">
                    {photo.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 4-Photo Living Collage Grid */
          <div className="w-full h-full max-h-[70vh] grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {photos.slice(0, 4).map((photo, index) => {
              const floatDir = index % 2 === 0 ? 1 : -1;
              const floatY = floatDir * Math.sin(progress * Math.PI * 2) * 6;

              return (
                <div
                  key={photo.id}
                  className="relative h-[60vh] flex flex-col p-2.5 rounded-lg bg-[#241C1E] border border-[#BFA47D]/30 shadow-2xl transition-transform duration-300"
                  style={{ transform: `translateY(${floatY}px)` }}
                >
                  <div className="relative flex-1 bg-[#100B0D] rounded overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title || `Collage ${index}`}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-[11px] font-serif text-[#BFA47D] truncate px-1">
                      {photo.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
