import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  Film,
  Play,
  Sliders,
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
  const textColRef = useRef<HTMLDivElement>(null);
  const photoColRef = useRef<HTMLDivElement>(null);

  // Entrance motion
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        photoColRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 2.0, ease: 'power3.out' }
      );

      gsap.fromTo(
        textColRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 1.8, delay: 0.2, ease: 'power2.out' }
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
      className="relative min-h-screen w-full bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1] text-[#40322F] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Radiant celebratory warm background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/75 to-[#FFF9F2]" />
        <div className="film-grain" />
      </div>

      {/* Top Elegant Navigation */}
      <header className="relative z-20 h-20 px-8 md:px-16 flex items-center justify-between border-b border-[#C5A16E]/20 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#C93442] flex items-center justify-center shadow-sm">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[#C93442] font-sans font-semibold block">
              WEDDING FILM STORY
            </span>
            <span className="text-xs font-serif italic text-[#40322F]/70">
              Modern 3D Cinematic Experience
            </span>
          </div>
        </div>

        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onImportZip}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif text-[#40322F] bg-white border border-[#C5A16E]/30 hover:border-[#C93442] shadow-sm hover:shadow transition-all cursor-pointer"
            title="Nhập dữ liệu dự án từ tệp ZIP"
          >
            <Upload className="w-3.5 h-3.5 text-[#C5A16E]" />
            <span className="hidden sm:inline">Nhập ZIP</span>
          </button>

          <button
            type="button"
            onClick={onExportZip}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif text-[#40322F] bg-white border border-[#C5A16E]/30 hover:border-[#C93442] shadow-sm hover:shadow transition-all cursor-pointer"
            title="Xuất gói sao lưu ZIP đầy đủ"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A16E]" />
            <span className="hidden sm:inline">Xuất ZIP</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-full text-[#40322F] bg-white border border-[#C5A16E]/30 hover:text-[#C93442] hover:border-[#C93442] shadow-sm transition-all cursor-pointer"
            title="Cài đặt dự án"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Editorial Hero Poster Split Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        {/* Left Side: Typography & Story Hook (35%) */}
        <div
          ref={textColRef}
          className="w-full lg:w-[38%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
        >
          {/* Wedding Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0DFD5]/90 border border-[#C93442]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
            <span className="text-[11px] tracking-[0.3em] font-sans font-semibold text-[#C93442] uppercase">
              A LOVE STORY IN MOTION
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
          </div>

          {/* Groom & Bride Big Title */}
          <div className="space-y-2">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#40322F] leading-tight">
              <span className="block">{project.groomName}</span>
              <span className="block font-serif italic text-4xl sm:text-5xl text-[#C5A16E] my-1">
                &amp;
              </span>
              <span className="block">{project.brideName}</span>
            </h1>
          </div>

          <div className="w-16 h-[2px] bg-[#C5A16E]" />

          {/* Wedding Date & Lunar Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-lg md:text-xl tracking-[0.25em] text-[#40322F] font-serif font-medium">
              <span>19</span>
              <span className="text-[#C93442]">•</span>
              <span>10</span>
              <span className="text-[#C93442]">•</span>
              <span>2026</span>
            </div>
            <p className="text-xs md:text-sm tracking-[0.14em] text-[#40322F]/70 italic font-serif">
              (Nhằm ngày 10 tháng 09 năm Bính Ngọ)
            </p>
          </div>

          {/* Emotional quote */}
          <p className="text-sm md:text-base font-serif italic text-[#40322F]/80 max-w-md leading-relaxed">
            "Mọi khoảnh khắc của tình yêu đều là những thước phim vô giá. Hãy cùng chúng mình bước vào hành trình điện ảnh đáng nhớ."
          </p>

          {/* Two Clean Main CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleStartPresentation}
              className="w-full sm:w-auto px-8 py-4 bg-[#C93442] hover:bg-[#9B222E] text-white rounded-full font-serif text-base tracking-[0.2em] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>BẮT ĐẦU TRÌNH CHIẾU</span>
            </button>

            <button
              type="button"
              onClick={handleOpenStudio}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FFF9F2] text-[#40322F] border border-[#C5A16E]/40 hover:border-[#C5A16E] rounded-full font-serif text-base tracking-[0.2em] shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
            >
              <Sliders className="w-4 h-4 text-[#C5A16E]" />
              <span>MỞ STUDIO</span>
            </button>
          </div>
        </div>

        {/* Right Side: Major Hero Poster Photo (62%) */}
        <div
          ref={photoColRef}
          className="w-full lg:w-[62%] h-[58vh] sm:h-[68vh] lg:h-[78vh] relative flex items-center justify-center"
        >
          {posterPhoto ? (
            <div className="relative w-full h-full p-4 bg-white border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg flex flex-col">
              <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative">
                <img
                  src={posterPhoto.url}
                  alt="Wedding Poster"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
              </div>
              {/* Subtle Poster Caption */}
              <div className="mt-2 text-right">
                <span className="text-[10px] font-mono tracking-widest text-[#40322F]/60 uppercase">
                  TUẤN HÙNG &amp; SAO MAI • OFFICIAL WEDDING CINEMA
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full p-12 bg-white/70 border-2 border-dashed border-[#C5A16E]/40 rounded-sm flex flex-col items-center justify-center text-center space-y-4">
              <Sparkles className="w-12 h-12 text-[#C5A16E]" />
              <h3 className="font-serif text-2xl text-[#40322F]">
                Chưa có ảnh cưới
              </h3>
              <p className="text-sm font-serif italic text-[#40322F]/70 max-w-sm">
                Nhấn "Mở Studio" để tải ảnh cưới của bạn vào các chương phim điện ảnh.
              </p>
              <button
                type="button"
                onClick={handleOpenStudio}
                className="px-6 py-2.5 bg-[#C93442] text-white rounded-full font-serif text-xs tracking-widest uppercase cursor-pointer"
              >
                Mở Studio ngay
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Minimalist Info */}
      <footer className="relative z-10 py-4 px-8 md:px-16 flex items-center justify-between text-xs font-serif text-[#40322F]/60 border-t border-[#C5A16E]/20 bg-white/30">
        <div>WEDDING CINEMATIC EXPERIENCE V3</div>
        <div>HÀ NỘI • 19.10.2026</div>
      </footer>
    </div>
  );
};
