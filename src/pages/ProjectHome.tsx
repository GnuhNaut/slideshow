import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  Film,
  Maximize2,
  Download,
  Upload,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useWeddingStore } from '../app/store';

interface ProjectHomeProps {
  onOpenSettings: () => void;
  onExportZip: () => void;
  onImportZip: () => void;
}

export const ProjectHome: React.FC<ProjectHomeProps> = ({
  onOpenSettings,
  onExportZip,
  onImportZip,
}) => {
  const project = useWeddingStore((s) => s.project);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const play = useWeddingStore((s) => s.play);
  const seek = useWeddingStore((s) => s.seek);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const photoCardRef = useRef<HTMLDivElement>(null);

  // Entrance motion
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.8, ease: 'power3.out' }
      );

      gsap.fromTo(
        photoCardRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 2.2, delay: 0.3, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleOpenStudio = () => {
    setViewMode('studio');
  };

  const handleStartPresentation = () => {
    seek(0);
    play();
    setViewMode('player');
  };

  // Main poster photo (first photo of Intro or Wedding chapter)
  const posterPhoto =
    project.chapters[0]?.photos[0] ||
    project.chapters[4]?.photos[0] ||
    null;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#1C1718] text-[#F5EDE1] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Background Editorial Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-radial from-[#581E2C]/25 via-[#1C1718]/90 to-[#1C1718]" />
        <div className="film-grain" />
      </div>

      {/* Top Minimalist Navigation */}
      <header className="relative z-20 h-20 px-8 md:px-16 flex items-center justify-between border-b border-[#BFA47D]/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#581E2C] border border-[#BFA47D]/40 flex items-center justify-center">
            <Film className="w-4 h-4 text-[#BFA47D]" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#BFA47D] font-serif font-semibold block">
              WEDDING FILM STORY
            </span>
            <span className="text-xs font-serif italic text-[#F5EDE1]/75">
              Cinematic Experience
            </span>
          </div>
        </div>

        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onImportZip}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#BFA47D]/25 bg-[#241C1E] hover:bg-[#581E2C]/40 text-xs font-serif text-[#F5EDE1] cursor-pointer transition-colors"
            title="Nhập dự án ZIP"
          >
            <Upload className="w-3.5 h-3.5 text-[#BFA47D]" />
            <span>Nhập Dự Án</span>
          </button>
          <button
            type="button"
            onClick={onExportZip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#BFA47D]/25 bg-[#241C1E] hover:bg-[#581E2C]/40 text-xs font-serif text-[#F5EDE1] cursor-pointer transition-colors"
            title="Xuất dự án ZIP"
          >
            <Download className="w-3.5 h-3.5 text-[#BFA47D]" />
            <span>Xuất Gói ZIP</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded border border-[#BFA47D]/20 hover:bg-[#581E2C]/40 text-[#BFA47D] cursor-pointer transition-colors"
            title="Cài đặt thông tin"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Editorial Hero Split Poster */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 py-10 max-w-7xl mx-auto w-full gap-12">
        {/* Left Side: Dramatic Editorial Typography & CTAs */}
        <div ref={titleRef} className="flex-1 flex flex-col justify-center max-w-xl text-left">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-[#BFA47D]" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-[#BFA47D] font-serif font-semibold">
              A LOVE STORY IN MOTION
            </span>
          </div>

          {/* Couple Names */}
          <div className="space-y-1 mb-6">
            <h1 className="font-serif-sc text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#F5EDE1] leading-[0.95]">
              TUẤN HÙNG
            </h1>
            <div className="flex items-center gap-4 my-2">
              <span className="font-serif italic font-normal text-3xl sm:text-4xl text-[#BFA47D]">
                &amp;
              </span>
              <span className="w-24 h-[1px] bg-[#BFA47D]/40" />
            </div>
            <h1 className="font-serif-sc text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#F5EDE1] leading-[0.95]">
              SAO MAI
            </h1>
          </div>

          {/* Wedding Date Display */}
          <div className="flex items-center gap-4 text-sm sm:text-base tracking-[0.25em] text-[#BFA47D] font-serif mb-10">
            <span>{project.weddingDate}</span>
            <span className="text-[#581E2C]">•</span>
            <span className="text-[#F5EDE1]/70 italic">{project.lunarDate}</span>
          </div>

          {/* Primary Two Main CTAs (Only 2 Clean Buttons!) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* CTA 1: MỞ STUDIO */}
            <button
              type="button"
              onClick={handleOpenStudio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded bg-[#581E2C] border border-[#BFA47D]/50 text-[#F5EDE1] font-serif font-semibold tracking-widest text-sm hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              <Film className="w-4 h-4 text-[#BFA47D]" />
              <span>MỞ STUDIO</span>
            </button>

            {/* CTA 2: BẮT ĐẦU TRÌNH CHIẾU */}
            <button
              type="button"
              onClick={handleStartPresentation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded bg-[#BFA47D] text-[#1C1718] font-serif font-bold tracking-widest text-sm hover:brightness-105 shadow-[0_8px_25px_rgba(191,164,125,0.25)] cursor-pointer transition-all"
            >
              <Maximize2 className="w-4 h-4" />
              <span>BẮT ĐẦU TRÌNH CHIẾU</span>
            </button>
          </div>
        </div>

        {/* Right Side: Large Dramatic Wedding Poster Photo Card */}
        <div
          ref={photoCardRef}
          className="flex-1 w-full max-w-lg lg:max-w-xl aspect-[3/4] max-h-[72vh] relative rounded-lg overflow-hidden border border-[#BFA47D]/35 bg-[#241C1E] shadow-[0_30px_70px_rgba(0,0,0,0.85)] flex items-center justify-center p-3"
        >
          {posterPhoto ? (
            <div className="relative w-full h-full rounded overflow-hidden bg-[#100B0D]">
              <img
                src={posterPhoto.url}
                alt="Wedding Hero Poster"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                style={{
                  objectPosition: `${posterPhoto.focalPoint?.x ?? 50}% ${posterPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1718]/90 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Card Editorial Mark */}
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none">
                <span className="text-[11px] font-serif tracking-[0.2em] text-[#BFA47D] uppercase">
                  HA NOI • 2026
                </span>
                <span className="text-[10px] font-mono text-[#F5EDE1]/60">
                  35MM CINEMATIC HYBRID
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Sparkles className="w-8 h-8 text-[#BFA47D] mx-auto mb-3 opacity-60" />
              <p className="font-serif text-sm text-[#F5EDE1]/80">
                Chưa có ảnh bìa. Nhấp "Mở Studio" để tải ảnh cưới thật của bạn.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 h-16 px-8 md:px-16 flex items-center justify-between border-t border-[#BFA47D]/15 text-xs text-[#BFA47D]/60 font-serif">
        <div>Tuấn Hùng &amp; Sao Mai — 19.10.2026</div>
        <div className="font-mono text-[10px] tracking-widest uppercase">
          MODERN EDITORIAL WEDDING CINEMA
        </div>
      </footer>
    </div>
  );
};
