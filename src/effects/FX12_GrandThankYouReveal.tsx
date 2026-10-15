import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX12Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  message?: string;
}

export const FX12_GrandThankYouReveal: React.FC<FX12Props> = ({
  photos,
  progress,
  groomName = 'Tuấn Hùng',
  brideName = 'Sao Mai',
  weddingDate = '19.10.2026',
  message = 'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.',
}) => {
  const leftPhotoRef = useRef<HTMLDivElement>(null);
  const rightPhotoRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 0.0 -> 0.35: Grand 3D curtain opening
    if (progress < 0.35) {
      const p = progress / 0.35;
      const ease = gsap.parseEase('power2.out')(p);

      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: (1 - ease) * -120,
          rotationY: (1 - ease) * 18,
          opacity: ease,
          force3D: true,
        });
      }

      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: (1 - ease) * 120,
          rotationY: (1 - ease) * -18,
          opacity: ease,
          force3D: true,
        });
      }

      if (centerTextRef.current) {
        gsap.set(centerTextRef.current, {
          scale: 0.9 + ease * 0.1,
          opacity: Math.max(0, (ease - 0.2) / 0.8),
          force3D: true,
        });
      }
    } else {
      // Steady breathing state
      const drift = (progress - 0.35) / 0.65;
      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: drift * -8,
          rotationY: 4,
          opacity: 1,
          force3D: true,
        });
      }
      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: drift * 8,
          rotationY: -4,
          opacity: 1,
          force3D: true,
        });
      }
      if (centerTextRef.current) {
        gsap.set(centerTextRef.current, {
          scale: 1.0 + drift * 0.02,
          opacity: 1,
          force3D: true,
        });
      }
    }
  }, [progress]);

  const leftPhoto = photos[0];
  const rightPhoto = photos[1] || photos[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-14 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] perspective-wide">
      {/* Radiant celebratory warm backdrop glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/80 to-[#FFF9F2] pointer-events-none" />

      {/* Main Grand Stage */}
      <div className="relative z-10 w-full max-w-[1400px] h-full flex items-center justify-between gap-8 preserve-3d">
        {/* Left Flanking Wedding Photo */}
        <div
          ref={leftPhotoRef}
          className="hidden md:flex w-[28%] h-[68vh] p-3 bg-white border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex-col"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
            {leftPhoto && (
              <img
                src={leftPhoto.url}
                alt="Thank You Left"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Center Grand Typography Stage */}
        <div
          ref={centerTextRef}
          className="w-full md:w-[44%] flex flex-col items-center justify-center text-center px-4 py-8 z-30 will-change-transform"
        >
          {/* Wedding Red Accent Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-[#F0DFD5]/90 border border-[#C93442]/30 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
            <span className="text-xs uppercase tracking-[0.3em] font-sans font-semibold text-[#C93442]">
              TRI ÂN & HẠNH PHÚC
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
          </div>

          {/* Grand Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#40322F] tracking-wide mb-6">
            LỜI CẢM ƠN
          </h1>

          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#C5A16E] to-transparent mb-8" />

          {/* Heartfelt Message */}
          <p className="text-lg md:text-xl lg:text-2xl font-serif italic text-[#40322F]/90 leading-relaxed max-w-[540px] mb-10">
            "{message}"
          </p>

          {/* Couple Signature & Wedding Date */}
          <div className="space-y-2 pt-4 border-t border-[#C5A16E]/30 w-full max-w-[360px]">
            <div className="text-2xl lg:text-3xl font-serif text-[#C93442] tracking-wider">
              {groomName} & {brideName}
            </div>
            <div className="text-xs lg:text-sm font-sans tracking-[0.25em] text-[#40322F]/70 uppercase">
              {weddingDate}
            </div>
          </div>
        </div>

        {/* Right Flanking Wedding Photo */}
        <div
          ref={rightPhotoRef}
          className="hidden md:flex w-[28%] h-[68vh] p-3 bg-white border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex-col"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
            {rightPhoto && (
              <img
                src={rightPhoto.url}
                alt="Thank You Right"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
