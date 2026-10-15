import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX09Props {
  photo: PhotoItem;
  progress: number;
  isPlaying: boolean;
  title?: string;
  quote?: string;
}

export const FX09_CinematicMaskReveal: React.FC<FX09Props> = ({
  photo,
  progress,
  title = 'KHOẢNH KHẮC THIÊNG LIÊNG',
  quote = 'Tình yêu tìm thấy nơi bình yên nhất giữa cuộc đời.',
}) => {
  const maskRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!maskRef.current) return;

    // Geometric mask expands from center vertical line (inset 0 45% 0 45%) to full (inset 0% 0% 0% 0%)
    const revealP = Math.min(1, progress / 0.35);
    const ease = gsap.parseEase('power2.out')(revealP);
    const insetH = (1 - ease) * 45; // 45% to 0%

    gsap.set(maskRef.current, {
      clipPath: `inset(0% ${insetH}% 0% ${insetH}%)`,
      force3D: true,
    });

    if (textRef.current) {
      gsap.set(textRef.current, {
        opacity: Math.max(0, (ease - 0.3) / 0.7),
        y: (1 - ease) * 20,
      });
    }
  }, [progress]);

  if (!photo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa có ảnh cho Mask Reveal
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD]">
      {/* Expanding Mask Window */}
      <div
        ref={maskRef}
        className="relative w-[88vw] max-w-[1280px] h-[78vh] max-h-[760px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg overflow-hidden will-change-[clip-path]"
      >
        <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative">
          <img
            src={photo.url}
            alt={photo.title || 'Cinematic Moment'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Elegant Text Overlay */}
          <div
            ref={textRef}
            className="absolute bottom-10 left-10 right-10 text-white space-y-2 pointer-events-none"
          >
            <span className="text-xs uppercase tracking-[0.25em] font-sans text-[#F3E9DD] font-semibold drop-shadow">
              FOREVER & ALWAYS
            </span>
            <h3 className="text-2xl lg:text-4xl font-serif tracking-wide drop-shadow-md">
              {title}
            </h3>
            <p className="text-sm lg:text-base font-serif italic text-white/90 drop-shadow">
              "{quote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
