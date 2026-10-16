import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX01Props {
  photos: PhotoItem[];
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
  speed?: number;
  reversed?: boolean;
}

export const FX01_FilmRibbon: React.FC<FX01Props> = ({
  photos,
  progress,
  reversed = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate photos for smooth seamless loop
  const displayPhotos = photos?.length
    ? photos.length < 5
      ? [...photos, ...photos, ...photos, ...photos]
      : [...photos, ...photos]
    : [];

  useEffect(() => {
    if (!trackRef.current || displayPhotos.length === 0) return;
    const totalCount = displayPhotos.length;
    const cardWidth = 360; // 360px per card with gap
    const totalDistance = (totalCount / 2) * cardWidth;

    const offset = (progress * totalDistance) % totalDistance;
    const xPos = reversed ? offset : -offset;

    gsap.set(trackRef.current, {
      x: xPos,
      force3D: true,
    });
  }, [progress, displayPhotos.length, reversed]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa có ảnh trong dải phim
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#F3E9DD]/60 to-[#FFF9F2] perspective-cinema"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/10 via-transparent to-transparent pointer-events-none" />

      {/* Floating 3D Film Track */}
      <div
        ref={trackRef}
        className="flex items-center gap-6 px-12 preserve-3d will-change-transform"
        style={{
          transform: 'rotateX(4deg) rotateY(-3deg) translateZ(10px)',
        }}
      >
        {displayPhotos.map((photo, idx) => {
          const isLandscape = (photo.aspectRatio || 1) >= 1.2;
          return (
            <div
              key={`${photo.id}_${idx}`}
              className="relative shrink-0 p-3 bg-white border border-[#C5A16E]/30 rounded-sm luxury-shadow-md transition-transform duration-300 hover:scale-105"
              style={{
                width: isLandscape ? '420px' : '300px',
                height: '420px',
              }}
            >
              {/* 35mm Sprocket Accent Top */}
              <div className="w-full h-3 mb-2 film-sprocket-track opacity-30" />

              {/* Photo Frame */}
              <div className="w-full h-[350px] overflow-hidden bg-[#FAF5EE] rounded-[1px] relative">
                <img
                  src={photo.url}
                  alt={photo.title || 'Wedding Photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Sprocket Accent Bottom */}
              <div className="w-full h-3 mt-2 film-sprocket-track opacity-30" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
