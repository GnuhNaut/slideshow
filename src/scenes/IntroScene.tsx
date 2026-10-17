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
  const heroCardRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  // 60 FPS Direct Motion Hook
  useSceneMotion(
    scene.id,
    (p) => {
      if (heroCardRef.current) {
        heroCardRef.current.style.transform = `scale(${1 + p * 0.025}) rotateY(${Math.sin(p * Math.PI) * 2.5}deg)`;
      }
      if (textColRef.current) {
        textColRef.current.style.transform = `translateY(${-p * 10}px)`;
      }
    },
    progress
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        textColRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 1.6, ease: 'power3.out' }
      );
      tl.fromTo(
        heroCardRef.current,
        { opacity: 0, scale: 0.92, y: 20, rotationY: -6 },
        { opacity: 1, scale: 1, y: 0, rotationY: 0, duration: 1.8, ease: 'power3.out' },
        '-=1.2'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhoto = scene.heroPhoto || scene.photos[0];
  const title = scene.config.textTitle || scene.chapterTitle || 'Ngày chúng mình bắt đầu';
  const subtitle = scene.config.textSubtitle || 'Có những ánh nhìn mở ra cả một hành trình.';
  const quote = scene.config.quote;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1] select-none perspective-cinema"
    >
      {/* Radiant celebratory warm backdrop */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/70 to-[#FFF9F2] pointer-events-none" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute inset-6 md:inset-8 border border-[#C5A16E]/25 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#C5A16E]" />
      </div>

      {/* Main Split Layout: Editorial Left + Hero Photo Right */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14 preserve-3d">
        {/* Left Column: Editorial Typography */}
        <div
          ref={textColRef}
          className="flex-1 max-w-xl flex flex-col justify-center will-change-transform z-20"
        >
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <span className="h-[2px] w-10 bg-[#C93442]" />
            <span className="font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-[#C93442]">
              TUẤN HÙNG &amp; SAO MAI
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium text-[#40322F] leading-[1.12] tracking-tight">
            {title}
          </h1>

          <p className="mt-4 md:mt-6 font-serif text-base md:text-xl text-[#6D5751] leading-relaxed">
            {subtitle}
          </p>

          {quote && quote !== subtitle && (
            <p className="mt-3 font-serif text-sm md:text-base italic text-[#8E716C]/90 border-l-2 border-[#C5A16E]/60 pl-4 py-1">
              "{quote}"
            </p>
          )}

          <div className="mt-6 md:mt-8 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#C93442]" />
            <span className="font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[#8E716C]">
              19.10.2026
            </span>
          </div>
        </div>

        {/* Right Column: Hero Framed Photo */}
        <div
          ref={heroCardRef}
          className="w-full max-w-[380px] md:max-w-[460px] lg:max-w-[500px] h-[52vh] md:h-[76vh] p-3 bg-white border border-[#E77A93]/40 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex flex-col shrink-0"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative flex items-center justify-center">
            {heroPhoto?.url && (
              <img
                src={heroPhoto.displayUrl || heroPhoto.url}
                alt={heroPhoto.title || 'Wedding Hero'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${heroPhoto.focalPoint?.x ?? 50}% ${heroPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top & Bottom Champagne Perforation Ribbons */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-b border-[#C5A16E]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-t border-[#C5A16E]/30" />
    </div>
  );
};
