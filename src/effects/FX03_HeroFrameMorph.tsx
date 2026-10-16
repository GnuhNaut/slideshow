import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX03Props {
  photo: PhotoItem;
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
  title?: string;
  subtitle?: string;
  quote?: string;
  sceneId?: string;
}

export const FX03_HeroFrameMorph: React.FC<FX03Props> = ({
  photo,
  progress,
  title = 'LỜI CẦU HÔN',
  subtitle = 'KHOẢNH KHẮC MÃI MÃI',
  quote = 'Khoảnh khắc em nói "Em đồng ý", cả thế giới như ngừng lại.',
  sceneId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const applyMorph = useCallback((p: number) => {
    if (!frameRef.current) return;

    if (p < 0.3) {
      const normP = p / 0.3;
      const ease = gsap.parseEase('power2.out')(normP);
      gsap.set(frameRef.current, {
        scale: 0.82 + ease * 0.18,
        rotationY: (1 - ease) * 12,
        rotationX: (1 - ease) * -6,
        z: (1 - ease) * -120,
        opacity: Math.min(1, ease * 1.5),
        force3D: true,
      });
      if (textRef.current) {
        gsap.set(textRef.current, {
          opacity: Math.max(0, (ease - 0.4) / 0.6),
          y: (1 - ease) * 20,
        });
      }
    } else if (p <= 0.85) {
      const normP = (p - 0.3) / 0.55;
      gsap.set(frameRef.current, {
        scale: 1.0 + normP * 0.03, // Micro breathing
        rotationY: 0,
        rotationX: 0,
        z: 0,
        opacity: 1,
        force3D: true,
      });
      if (textRef.current) {
        gsap.set(textRef.current, {
          opacity: 1,
          y: 0,
        });
      }
    } else {
      const normP = (p - 0.85) / 0.15;
      gsap.set(frameRef.current, {
        scale: 1.03 - normP * 0.02,
        opacity: 1 - normP * 0.2,
        force3D: true,
      });
    }
  }, []);

  // 60 FPS direct RAF motion
  useSceneMotion(sceneId || '', applyMorph, progress);

  useEffect(() => {
    applyMorph(progress);
  }, [progress, applyMorph]);

  if (!photo) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa chọn ảnh Hero
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F3E9DD] perspective-cinema"
    >
      {/* Luxury radial ambiance */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/80 to-[#FFF9F2] pointer-events-none" />

      {/* Main Hero Card */}
      <div
        ref={frameRef}
        className="relative z-10 w-[82vw] max-w-[1100px] h-[72vh] max-h-[680px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg preserve-3d will-change-transform flex flex-col md:flex-row items-center gap-6"
      >
        {/* Photo Container */}
        <div className="w-full md:w-3/5 h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative">
          <img
            src={photo.url}
            alt={photo.title || 'Proposal Hero'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
        </div>

        {/* Narrative Sidecard */}
        <div
          ref={textRef}
          className="w-full md:w-2/5 flex flex-col justify-center px-4 py-6 text-left"
        >
          <div className="inline-block px-3 py-1 mb-3 text-[11px] uppercase tracking-[0.25em] font-sans font-medium text-[#C93442] bg-[#F0DFD5]/60 rounded-full w-fit">
            {subtitle}
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif text-[#40322F] tracking-wide mb-4">
            {title}
          </h2>
          <div className="w-12 h-[1px] bg-[#C5A16E] mb-5" />
          <p className="text-base lg:text-lg font-serif italic text-[#40322F]/85 leading-relaxed">
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
};
