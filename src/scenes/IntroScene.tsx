import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { TimelineScene } from '../types/timeline';

interface IntroSceneProps {
  scene: TimelineScene;
  progress: number; // 0 to 1
  isPlaying: boolean;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene, progress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Intro timeline synchronized with progress
      gsap.fromTo(
        sealRef.current,
        { scale: 0.6, opacity: 0, rotation: -12 },
        { scale: 1, opacity: 1, rotation: 0, duration: 2, ease: 'power3.out' }
      );

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 2.2, delay: 0.5, ease: 'power2.out' }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.8, delay: 1.2, ease: 'power2.out' }
      );

      gsap.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1.02, duration: 3, delay: 1.5, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#151114]"
    >
      {/* Background Atmosphere & Ambient Light */}
      <div className="absolute inset-0 bg-radial from-[#81252D]/35 via-[#1e171c]/80 to-[#151114] opacity-90" />

      {/* Hero photo background with soft depth blur */}
      {heroPhoto && (
        <div
          ref={heroRef}
          className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none transform scale-100 transition-transform duration-1000"
          style={{
            transform: `scale(${1 + progress * 0.05})`,
          }}
        >
          <img
            src={heroPhoto.url}
            alt={heroPhoto.title || 'Opening'}
            className="w-full h-full object-cover filter blur-[2px] brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151114] via-transparent to-[#151114]/90" />
        </div>
      )}

      {/* Decorative Traditional Corner Borders */}
      <div className="absolute inset-6 border border-[#ecd28f]/20 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#d4ac59]" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#d4ac59]" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#d4ac59]" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#d4ac59]" />
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Seal Monogram Badge */}
        <div
          ref={sealRef}
          className="mb-6 w-20 h-20 rounded-full border border-[#ecd28f] bg-[#81252D]/80 flex items-center justify-center shadow-[0_0_25px_rgba(212,172,89,0.35)] backdrop-blur-sm"
        >
          <span className="font-serif italic text-2xl text-[#FFF4E4] font-semibold tracking-wider">
            H &amp; M
          </span>
        </div>

        {/* Small Eyebrow Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#ecd28f]" />
          <p className="text-xs tracking-[0.35em] text-[#ecd28f] uppercase font-medium">
            THE WEDDING OF
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#ecd28f]" />
        </div>

        {/* Groom & Bride Names */}
        <div ref={titleRef} className="space-y-2 mb-6">
          <h1 className="font-serif-sc text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider text-[#FFF4E4] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <span className="gold-gradient-text">TUẤN HÙNG</span>
            <span className="font-serif italic font-normal text-3xl md:text-5xl text-[#d4ac59] mx-4 md:mx-6">
              &amp;
            </span>
            <span className="gold-gradient-text">SAO MAI</span>
          </h1>
        </div>

        {/* Wedding Date & Lunar Date */}
        <div ref={subtitleRef} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-sm md:text-base tracking-[0.25em] text-[#ecd28f] font-serif">
            <span>19</span>
            <span className="text-[#81252D]">•</span>
            <span>10</span>
            <span className="text-[#81252D]">•</span>
            <span>2026</span>
          </div>
          <p className="text-xs tracking-[0.18em] text-[#FFF4E4]/70 italic font-serif">
            (Nhằm ngày 10 tháng 09 năm Bính Ngọ)
          </p>
        </div>

        {/* Romantic Quote */}
        {scene.config.quote && (
          <p className="mt-8 text-xs md:text-sm tracking-wide text-[#FFF4E4]/80 font-sans max-w-lg italic border-t border-[#ecd28f]/20 pt-4">
            "{scene.config.quote}"
          </p>
        )}
      </div>

      {/* Filmstrip Sprockets Top & Bottom Bar */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[#0e0a0d] film-sprocket-track border-b border-[#ecd28f]/10" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#0e0a0d] film-sprocket-track border-t border-[#ecd28f]/10" />
    </div>
  );
};
