import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { TimelineScene } from '../types/timeline';
import { useSceneMotion } from '../motion/useSceneMotion';

interface IntroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene, progress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  // 60 FPS Direct Motion Hook
  useSceneMotion(
    scene.id,
    (p) => {
      if (heroCardRef.current) {
        heroCardRef.current.style.transform = `scale(${1 + p * 0.03}) rotateY(${Math.sin(p * Math.PI) * 3}deg)`;
      }
    },
    progress
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Intro entrance GSAP timeline
      const tl = gsap.timeline();

      tl.fromTo(
        heroCardRef.current,
        { opacity: 0, scale: 0.9, y: 30, rotationY: -8 },
        { opacity: 1, scale: 1, y: 0, rotationY: 0, duration: 2.0, ease: 'power3.out' }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1.6, ease: 'power2.out' },
          '-=1.2'
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' },
          '-=0.8'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1] select-none perspective-cinema"
    >
      {/* Radiant celebratory warm backdrop */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/70 to-[#FFF9F2] pointer-events-none" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute inset-8 border border-[#C5A16E]/25 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#C5A16E]" />
      </div>

      {/* Main Split / Hero Composition */}
      <div className="relative z-10 w-full max-w-[1300px] h-[78vh] flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-14 px-8 preserve-3d">
        {/* Left Side: Floating 3D Wedding Hero Frame */}
        <div
          ref={heroCardRef}
          className="w-full md:w-[48%] h-[55vh] md:h-[72vh] p-4 bg-white border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative flex items-center justify-center">
            {heroPhoto && heroPhoto.url ? (
              <img
                src={heroPhoto.displayUrl || heroPhoto.url}
                alt={heroPhoto.title || 'Wedding Hero'}
                className={`w-full h-full ${heroPhoto.cropMode === 'cover' ? 'object-cover' : 'object-contain'} mx-auto`}
                style={{
                  objectPosition: `${heroPhoto.focalPoint?.x ?? 50}% ${heroPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full border border-[#C5A16E]/40 flex items-center justify-center bg-[#FAF3EB] shadow-inner">
                  <span className="font-serif text-2xl text-[#C93442] italic">H&amp;M</span>
                </div>
                <div className="font-serif text-lg font-medium text-[#40322F] tracking-wider uppercase">
                  {scene.config?.textSubtitle || 'Tuấn Hùng & Sao Mai'}
                </div>
                <p className="text-xs text-[#C5A16E] italic font-serif">
                  Chương I: Lời Mở Đầu
                </p>
                <span className="text-[10px] text-[#40322F]/60 font-mono">
                  (Thêm ảnh vào public/gallery/01-intro/)
                </span>
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Editorial Typography */}
        <div className="w-full md:w-[52%] flex flex-col items-center md:items-start text-center md:text-left z-20">
          {/* Wedding Red Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 bg-[#F0DFD5]/90 border border-[#C93442]/30 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
            <span className="text-[11px] tracking-[0.3em] font-sans font-semibold text-[#C93442] uppercase">
              THE WEDDING OF
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
          </div>

          {/* Couple Names */}
          <div ref={titleRef} className="space-y-2 mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#40322F] tracking-wide leading-tight">
              <span className="block font-medium">TUẤN HÙNG</span>
              <span className="block font-serif italic text-3xl sm:text-4xl text-[#C5A16E] my-1">
                &amp;
              </span>
              <span className="block font-medium">SAO MAI</span>
            </h1>
          </div>

          <div className="w-16 h-[2px] bg-[#C5A16E] mb-6" />

          {/* Wedding Date */}
          <div ref={subtitleRef} className="space-y-2">
            <div className="flex items-center gap-3 text-base lg:text-lg tracking-[0.25em] text-[#40322F] font-serif font-medium">
              <span>19</span>
              <span className="text-[#C93442]">•</span>
              <span>10</span>
              <span className="text-[#C93442]">•</span>
              <span>2026</span>
            </div>
            <p className="text-xs lg:text-sm tracking-[0.12em] text-[#40322F]/75 italic font-serif">
              (Nhằm ngày 10 tháng 09 năm Bính Ngọ)
            </p>
          </div>

          {/* Accent quote */}
          {scene.config.quote && (
            <p className="mt-8 text-sm lg:text-base tracking-wide text-[#40322F]/85 font-serif italic max-w-lg border-l-2 border-[#C5A16E]/40 pl-4">
              "{scene.config.quote}"
            </p>
          )}
        </div>
      </div>

      {/* Top & Bottom Champagne Perforation Ribbons */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-b border-[#C5A16E]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-t border-[#C5A16E]/30" />
    </div>
  );
};
