import React from 'react';
import { TimelineScene } from '../types/timeline';
import { PhotoItem } from '../types/project';

interface CurtainSurfaceProps {
  scene?: TimelineScene | null;
  progress?: number;
  side: 'left' | 'right';
}

/**
 * CurtainSurface — Lightweight Static Presentation Surface for Grand Wedding Curtain Reveal
 *
 * Characteristics:
 * 1. ZERO GSAP animation loops or timelines.
 * 2. ZERO motionRuntime or clock subscriptions.
 * 3. ZERO audio playback or duplicate media loaders.
 * 4. Exact visual continuity at transition start (p = 0%):
 *    - Perfectly matches the outgoing scene's active subscene layout, aspect ratios, and focal points.
 *    - Clips precisely to the left half (side="left") or right half (side="right") without duplicating heavy React component instances.
 */
export const CurtainSurface: React.FC<CurtainSurfaceProps> = ({
  scene,
  progress = 0.9,
  side,
}) => {
  if (!scene) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  const photos = scene.photos || [];
  const count = photos.length;

  // Offset inner container based on which curtain door this surface lives in
  const positionClass =
    side === 'left'
      ? 'absolute inset-y-0 left-0 w-[200%] h-full pointer-events-none'
      : 'absolute inset-y-0 -left-full w-[200%] h-full pointer-events-none';

  // Render static representation of Chapter 5 (LivingCollageScene) or other scenes
  const renderStaticSceneContent = () => {
    // 1. Single photo or hero moment: Fullscreen dramatic presentation
    if (count <= 1 || scene.type === 'hero_moment') {
      const photo: PhotoItem | undefined = scene.heroPhoto || photos[0];
      return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F5EDE1]">
          {photo && (
            <div className="relative w-[900px] h-[600px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col">
              <div className="w-full h-full overflow-hidden rounded-sm bg-[#F5EDE1] relative">
                <img
                  src={photo.url}
                  alt={photo.title || 'Wedding Photo'}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                  }}
                />
              </div>
              {photo.title && (
                <div className="mt-3 text-center text-xs tracking-widest uppercase font-serif text-[#40322F]">
                  {photo.title}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 2. Two photos: Editorial Split Reveal 60/40
    if (count === 2) {
      return (
        <div className="relative w-full h-full flex items-center justify-center px-12 py-8 bg-[#FFF9F2]">
          <div className="w-full max-w-6xl h-[85%] flex items-center gap-8">
            <div className="w-[60%] h-full p-3 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg">
              <img
                src={photos[0].url}
                alt={photos[0].title || 'Primary'}
                className="w-full h-full object-cover rounded-sm"
                style={{
                  objectPosition: `${photos[0].focalPoint?.x ?? 50}% ${photos[0].focalPoint?.y ?? 50}%`,
                }}
              />
            </div>
            <div className="w-[40%] h-[75%] p-3 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col justify-between">
              <img
                src={photos[1].url}
                alt={photos[1].title || 'Secondary'}
                className="w-full h-[70%] object-cover rounded-sm"
                style={{
                  objectPosition: `${photos[1].focalPoint?.x ?? 50}% ${photos[1].focalPoint?.y ?? 50}%`,
                }}
              />
              <div className="p-3 text-center">
                <div className="text-xs uppercase tracking-widest text-[#C5A16E] font-serif">
                  {scene.chapterTitle || 'ALBUM ẢNH CƯỚI'}
                </div>
                <div className="text-sm font-serif italic text-[#40322F] mt-1">
                  {scene.config?.quote || 'Khoảnh khắc yêu thương đong đầy'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Three photos: Asymmetric Photo Mosaic
    if (count === 3) {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-12 bg-[#FFF9F2]">
          <div className="w-full max-w-6xl h-[85%] grid grid-cols-12 gap-6">
            <div className="col-span-7 h-full p-3 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg">
              <img
                src={photos[0].url}
                alt={photos[0].title || 'Mosaic 1'}
                className="w-full h-full object-cover rounded-sm"
                style={{
                  objectPosition: `${photos[0].focalPoint?.x ?? 50}% ${photos[0].focalPoint?.y ?? 50}%`,
                }}
              />
            </div>
            <div className="col-span-5 h-full flex flex-col gap-6">
              <div className="h-1/2 p-2 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg">
                <img
                  src={photos[1].url}
                  alt={photos[1].title || 'Mosaic 2'}
                  className="w-full h-full object-cover rounded-sm"
                  style={{
                    objectPosition: `${photos[1].focalPoint?.x ?? 50}% ${photos[1].focalPoint?.y ?? 50}%`,
                  }}
                />
              </div>
              <div className="h-1/2 p-2 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg">
                <img
                  src={photos[2].url}
                  alt={photos[2].title || 'Mosaic 3'}
                  className="w-full h-full object-cover rounded-sm"
                  style={{
                    objectPosition: `${photos[2].focalPoint?.x ?? 50}% ${photos[2].focalPoint?.y ?? 50}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Four photos: Multi-Depth Floating Gallery
    if (count === 4) {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-12 bg-[#FFF9F2]">
          <div className="w-full max-w-6xl h-[85%] grid grid-cols-2 gap-6">
            {photos.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg overflow-hidden"
              >
                <img
                  src={p.url}
                  alt={p.title || 'Floating'}
                  className="w-full h-full object-cover rounded-sm"
                  style={{
                    objectPosition: `${p.focalPoint?.x ?? 50}% ${p.focalPoint?.y ?? 50}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. 5+ photos: 3D Arc Carousel Stage (Static layout computed via inline CSS)
    const activeFloat = progress * (count - 1);

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F5EDE1] perspective-cinema">
        {/* Ambient warm champagne glow */}
        <div className="absolute inset-0 bg-radial from-[#C5A16E]/15 via-transparent to-transparent pointer-events-none" />

        {/* 3D Carousel Stage */}
        <div className="relative w-full h-[600px] flex items-center justify-center preserve-3d">
          {photos.map((photo, idx) => {
            const diff = idx - activeFloat;
            const angle = diff * 22;
            const zDist = -Math.abs(diff) * 140;
            const xOffset = diff * 280;
            const scale = Math.max(0.7, 1 - Math.abs(diff) * 0.12);
            const opacity = Math.max(0.15, 1 - Math.abs(diff) * 0.35);
            const zIndex = Math.round(100 - Math.abs(diff) * 10);

            return (
              <div
                key={photo.id}
                className="absolute w-[440px] h-[580px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg preserve-3d flex flex-col"
                style={{
                  transform: `translate3d(${xOffset}px, 0px, ${zDist}px) rotateY(${angle}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformOrigin: '50% 50%',
                }}
              >
                <div className="w-full h-full overflow-hidden rounded-sm bg-[#F5EDE1] relative">
                  <img
                    src={photo.url}
                    alt={photo.title || 'Wedding Moment'}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                    }}
                  />
                </div>
                {photo.title && (
                  <div className="mt-3 text-center text-xs tracking-widest uppercase font-serif text-[#40322F]">
                    {photo.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={positionClass}>
      {renderStaticSceneContent()}
    </div>
  );
};
