import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX05Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
}

export const FX05_FloatingPhotoGallery: React.FC<FX05Props> = ({
  photos,
  progress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const xScale = Math.min(1, (containerRef.current?.clientWidth || 1280) / 1280);
    // Spatial configuration for up to 4 floating photos
    const configs = [
      { x: -280, y: -40, z: -80, rotateY: 10, rotateZ: -2 }, // Back left
      { x: 300, y: -30, z: -60, rotateY: -12, rotateZ: 3 },  // Back right
      { x: -160, y: 120, z: -20, rotateY: 6, rotateZ: -1 },  // Mid left
      { x: 0, y: 0, z: 40, rotateY: 0, rotateZ: 0 },         // Foreground Hero
    ];

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const base = configs[idx % configs.length];
      const drift = Math.sin(progress * Math.PI) * 15;

      gsap.set(card, {
        x: base.x * xScale + drift * (idx % 2 === 0 ? 1 : -1),
        y: base.y + drift * 0.5,
        z: base.z,
        rotationY: base.rotateY,
        rotationZ: base.rotateZ,
        scale: 1 + progress * 0.04,
        force3D: true,
      });
    });
  }, [progress]);

  if (!photos || photos.length === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  const displayPhotos = photos.slice(0, 4);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F3E9DD] perspective-cinema"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-transparent to-transparent pointer-events-none" />

      {/* Floating Cards Container */}
      <div className="relative w-full h-full flex items-center justify-center preserve-3d">
        {displayPhotos.map((photo, idx) => {
          const isHero = idx === displayPhotos.length - 1;
          return (
            <div
              key={photo.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className={`absolute p-3 bg-white border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg preserve-3d will-change-transform ${
                isHero
                  ? 'w-[76vw] aspect-[2/3] max-h-[72vh] md:w-[420px] md:h-[560px] md:aspect-auto z-30 ring-2 ring-[#E77A93]/40'
                  : 'w-[58vw] aspect-[2/3] max-h-[56vh] md:w-[320px] md:h-[430px] md:aspect-auto z-10 opacity-90'
              }`}
            >
              <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
                <img
                  src={photo.url}
                  alt={photo.title || 'Floating Moment'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
