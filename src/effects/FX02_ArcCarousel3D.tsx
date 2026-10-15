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

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa có ảnh cho 3D Arc Carousel
      </div>
    );
  }

  const count = photos.length;
  // Step through photos based on progress
  const activeFloat = progress * (count - 1);

  useEffect(() => {
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
  }, [activeFloat]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F5EDE1] perspective-cinema"
    >
      {/* Ambient warm champagne glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/15 via-transparent to-transparent pointer-events-none" />

      {/* 3D Carousel Stage */}
      <div className="relative w-full h-[600px] flex items-center justify-center preserve-3d">
        {photos.map((photo, idx) => {
          return (
            <div
              key={photo.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="absolute w-[440px] h-[580px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
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
