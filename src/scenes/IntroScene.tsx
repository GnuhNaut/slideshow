import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { TimelineScene } from '../types/timeline';

interface IntroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene, progress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 2.4, ease: 'power3.out' }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.8, delay: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 0.45, scale: 1.03, duration: 3.2, delay: 0.4, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1C1718] select-none"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#581E2C]/30 via-[#1C1718]/85 to-[#1C1718] pointer-events-none" />

      {/* Hero photo background with gentle scale */}
      {heroPhoto && (
        <div
          ref={heroRef}
          className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none transition-transform duration-1000 ease-out"
          style={{ transform: `scale(${1 + progress * 0.05})` }}
        >
          <img
            src={heroPhoto.url}
            alt={heroPhoto.title || 'Opening'}
            className="w-full h-full object-cover filter blur-[1px] brightness-75 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1718] via-transparent to-[#1C1718]/90" />
        </div>
      )}

      {/* Subtle Editorial Inner Frame */}
      <div className="absolute inset-8 border border-[#BFA47D]/20 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#BFA47D]" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#BFA47D]" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#BFA47D]" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#BFA47D]" />
      </div>

      {/* Central Editorial Typography Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Subtle Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-[1px] bg-[#BFA47D]/60" />
          <p className="text-[11px] tracking-[0.35em] text-[#BFA47D] uppercase font-serif font-medium">
            THE WEDDING OF
          </p>
          <div className="w-8 h-[1px] bg-[#BFA47D]/60" />
        </div>

        {/* Groom & Bride Names */}
        <div ref={titleRef} className="space-y-3 mb-6">
          <h1 className="font-serif-sc text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider text-[#F5EDE1] drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
            <span className="text-[#F5EDE1]">TUẤN HÙNG</span>
            <span className="font-serif italic font-normal text-3xl sm:text-5xl text-[#BFA47D] mx-4 md:mx-6">
              &amp;
            </span>
            <span className="text-[#F5EDE1]">SAO MAI</span>
          </h1>
        </div>

        {/* Wedding Date & Lunar Calendar */}
        <div ref={subtitleRef} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-sm md:text-base tracking-[0.25em] text-[#BFA47D] font-serif">
            <span>19</span>
            <span className="text-[#581E2C]">•</span>
            <span>10</span>
            <span className="text-[#581E2C]">•</span>
            <span>2026</span>
          </div>
          <p className="text-xs tracking-[0.16em] text-[#F5EDE1]/70 italic font-serif">
            (Nhằm ngày 10 tháng 09 năm Bính Ngọ)
          </p>
        </div>

        {/* Editorial Subtitle Quote */}
        {scene.config.quote && (
          <p className="mt-8 text-xs md:text-sm tracking-wide text-[#F5EDE1]/85 font-serif max-w-md italic border-t border-[#BFA47D]/20 pt-4">
            "{scene.config.quote}"
          </p>
        )}
      </div>

      {/* 35mm Minimal Perforations */}
      <div className="absolute top-0 left-0 right-0 h-3.5 bg-[#140F11] film-sprocket-track border-b border-[#3A2933]" />
      <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-[#140F11] film-sprocket-track border-t border-[#3A2933]" />
    </div>
  );
};
