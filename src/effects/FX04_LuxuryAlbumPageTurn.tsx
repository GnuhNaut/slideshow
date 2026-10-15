import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX04Props {
  leftPhoto?: PhotoItem;
  rightPhoto?: PhotoItem;
  nextPhoto?: PhotoItem;
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
  chapterTitle?: string;
  quote?: string;
}

export const FX04_LuxuryAlbumPageTurn: React.FC<FX04Props> = ({
  leftPhoto,
  rightPhoto,
  nextPhoto,
  progress,
  chapterTitle = 'HAI GIA ĐÌNH, MỘT HẠNH PHÚC',
  quote = 'Tình yêu được đơm hoa kết trái trong lời chúc phúc của hai gia đình.',
}) => {
  const turningPageRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!turningPageRef.current) return;

    // Flip transition happens between progress 0.6 to 0.95
    if (progress < 0.6) {
      gsap.set(turningPageRef.current, {
        rotationY: 0,
        force3D: true,
      });
      if (shadowRef.current) gsap.set(shadowRef.current, { opacity: 0 });
    } else {
      const p = Math.min(1, (progress - 0.6) / 0.35);
      const angle = -p * 180;
      gsap.set(turningPageRef.current, {
        rotationY: angle,
        force3D: true,
      });
      if (shadowRef.current) {
        // Shadow peaks at 90 deg
        const shadowOpacity = Math.sin(p * Math.PI) * 0.45;
        gsap.set(shadowRef.current, { opacity: shadowOpacity });
      }
    }
  }, [progress]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#F8F1E7] to-[#F3E9DD] perspective-wide">
      {/* Warm ambient radiance */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-transparent to-transparent pointer-events-none" />

      {/* Luxury Wedding Album Book Container */}
      <div className="relative w-[90vw] max-w-[1200px] h-[75vh] max-h-[700px] flex rounded-md album-shadow bg-[#FFFDF9] border border-[#C5A16E]/30 preserve-3d">
        {/* Book Spine Center Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -ml-[2px] w-[4px] bg-gradient-to-r from-[#D0BA9B] via-[#EADBCA] to-[#C5A16E] z-30 shadow-inner" />

        {/* LEFT PAGE (Static) */}
        <div className="w-1/2 h-full p-8 md:p-12 flex flex-col justify-between border-r border-[#EADBCA]/60 bg-[#FFFDF9]">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] font-sans text-[#C93442] font-semibold">
              WEDDING ALBUM SPREAD
            </span>
            <h3 className="text-2xl lg:text-3xl font-serif text-[#40322F]">
              {chapterTitle}
            </h3>
          </div>

          <div className="w-full h-[62%] rounded-sm overflow-hidden border border-[#C5A16E]/20 bg-[#FAF5EE] relative shadow-sm">
            {leftPhoto ? (
              <img
                src={leftPhoto.url}
                alt={leftPhoto.title || 'Family'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-serif text-[#C5A16E]">
                Ảnh Gia Đình
              </div>
            )}
          </div>

          <p className="text-sm lg:text-base font-serif italic text-[#40322F]/80">
            "{quote}"
          </p>
        </div>

        {/* RIGHT UNDER-PAGE (Visible after turning) */}
        <div className="w-1/2 h-full p-8 md:p-12 flex flex-col items-center justify-center bg-[#FFFDF9] relative">
          <div className="w-full h-[85%] rounded-sm overflow-hidden border border-[#C5A16E]/20 bg-[#FAF5EE] shadow-sm">
            {nextPhoto ? (
              <img
                src={nextPhoto.url}
                alt={nextPhoto.title || 'Next moment'}
                className="w-full h-full object-cover"
              />
            ) : rightPhoto ? (
              <img
                src={rightPhoto.url}
                alt={rightPhoto.title || 'Family right'}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* TURNING PAGE (3D Rotated from right to left) */}
        <div
          ref={turningPageRef}
          className="absolute right-0 top-0 bottom-0 w-1/2 h-full preserve-3d will-change-transform z-20 origin-left"
        >
          {/* Front side of turning page (rightPhoto) */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col items-center justify-center bg-[#FFFDF9] backface-hidden border-l border-[#EADBCA]/40">
            <div className="w-full h-[85%] rounded-sm overflow-hidden border border-[#C5A16E]/20 bg-[#FAF5EE] shadow-sm">
              {rightPhoto && (
                <img
                  src={rightPhoto.url}
                  alt={rightPhoto.title || 'Family right'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Dynamic page shadow */}
            <div
              ref={shadowRef}
              className="absolute inset-0 bg-black/40 pointer-events-none opacity-0 transition-opacity"
            />
          </div>

          {/* Back side of turning page */}
          <div
            className="absolute inset-0 p-8 md:p-12 flex items-center justify-center bg-[#FFFDF9] border-r border-[#EADBCA]/40 backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-[85%] rounded-sm overflow-hidden border border-[#C5A16E]/20 bg-[#FAF5EE] shadow-sm">
              {nextPhoto && (
                <img
                  src={nextPhoto.url}
                  alt={nextPhoto.title || 'Next moment back'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
