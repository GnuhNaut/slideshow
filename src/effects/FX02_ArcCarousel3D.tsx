import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX02Props {
  photos: PhotoItem[];
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export const FX02_ArcCarousel3D: React.FC<FX02Props> = ({
  photos,
  progress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const count = photos?.length || 0;
  // Step through photos based on progress
  const activeFloat = count > 0 ? progress * (count - 1) : 0;

  useEffect(() => {
    if (count === 0) return;
    cardsRef.current.forEach((el, idx) => {
      if (!el) return;
      const diff = idx - activeFloat;
      const angle = diff * 22; // 22 degrees per step
      const zDist = -Math.abs(diff) * 140; // Depth pushback
      const xOffset = diff * 280; // Lateral separation
      const scale = Math.max(0.7, 1 - Math.abs(diff) * 0.12);
      const opacity = Math.max(0.15, 1 - Math.abs(diff) * 0.35);

      gsap.set(el, {
        x: xOffset,
        z: zDist,
        rotationY: angle,
        scale,
        opacity,
        zIndex: Math.round(100 - Math.abs(diff) * 10),
        force3D: true,
      });
    });
  }, [activeFloat, count]);

  if (!photos || photos.length === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F5EDE1] perspective-cinema"
    >
      {/* Ambient warm champagne glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/15 via-transparent to-transparent pointer-events-none" />

      {/* 3D Carousel Stage */}
      <div className="relative w-full h-[80vh] md:h-[600px] flex items-center justify-center preserve-3d">
        {photos.map((photo, idx) => {
          return (
            <div
              key={photo.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="absolute w-[76vw] aspect-[2/3] max-h-[78vh] p-3 md:p-4 md:w-[440px] md:h-[580px] md:aspect-auto bg-white rounded-md border border-[#E77A93]/35 luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
              style={{
                transformOrigin: '50% 50%',
              }}
            >
              <div className="w-full h-full overflow-hidden rounded-sm bg-[#F5EDE1] relative">
                <img
                  src={photo.url}
                  alt={photo.title || 'Wedding Moment'}
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
