import React from 'react';
import {
  Film,
  Play,
  Maximize2,
  Download,
  Upload,
  Calendar,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Sliders,
  Heart,
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
  const timeline = useWeddingStore((s) => s.timeline);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const saveStatus = useWeddingStore((s) => s.saveStatus);
  const play = useWeddingStore((s) => s.play);
  const seek = useWeddingStore((s) => s.seek);

  // Total photos count across all chapters
  const totalPhotosCount = project.chapters.reduce(
    (acc, ch) => acc + (ch.enabled ? ch.photos.length : 0),
    0
  );

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins} phút ${s < 10 ? '0' : ''}${s} giây`;
  };

  const handlePreviewMovie = () => {
    seek(0);
    play();
    setViewMode('studio');
  };

  const handleStartPresentation = () => {
    seek(0);
    play();
    setViewMode('player');
  };

  // Find opening or hero photo for poster
  const posterPhoto =
    project.chapters[0]?.photos[0] ||
    project.chapters[4]?.photos[0] ||
    null;

  return (
    <div className="relative min-h-screen w-full bg-[#151114] text-[#FFF4E4] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background Poster Artwork & Cinematic Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {posterPhoto && (
          <div className="absolute inset-0 opacity-20 filter blur-sm scale-105">
            <img src={posterPhoto.url} alt="Wedding Poster" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-radial from-[#81252D]/35 via-[#1a1317]/90 to-[#151114]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151114] via-transparent to-[#151114]/90" />
        <div className="film-grain" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 h-20 px-6 md:px-12 flex items-center justify-between border-b border-[#ecd28f]/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#81252D] to-[#4d090d] border border-[#ecd28f]/50 flex items-center justify-center shadow-lg">
            <Film className="w-5 h-5 text-[#ecd28f]" />
          </div>
          <div>
            <span className="text-xs tracking-[0.28em] text-[#ecd28f] uppercase font-serif-sc font-semibold block">
              CINEMATIC WEDDING STORY
            </span>
            <span className="text-sm font-serif italic text-[#FFF4E4]/90">
              35mm Film Experience
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onImportZip}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#ecd28f]/30 bg-[#1e151b] hover:bg-[#81252D]/40 text-xs font-serif text-[#FFF4E4] transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#ecd28f]" />
            <span>Nhập Dự Án</span>
          </button>
          <button
            onClick={onExportZip}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#ecd28f]/30 bg-[#1e151b] hover:bg-[#81252D]/40 text-xs font-serif text-[#FFF4E4] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#ecd28f]" />
            <span>Xuất Gói ZIP</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg border border-[#ecd28f]/20 hover:bg-[#81252D]/40 text-[#ecd28f] transition-colors"
            title="Cài đặt dự án"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Center Poster Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-5xl mx-auto text-center">
        {/* Monogram Seal */}
        <div className="mb-6 w-20 h-20 rounded-full border-2 border-[#ecd28f] bg-[#81252D]/80 flex items-center justify-center shadow-[0_0_30px_rgba(212,172,89,0.35)] backdrop-blur-md">
          <span className="font-serif italic text-2xl text-[#FFF4E4] font-semibold">H &amp; M</span>
        </div>

        {/* Small Eyebrow Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#ecd28f]" />
          <p className="text-xs tracking-[0.35em] text-[#ecd28f] uppercase font-serif-sc font-medium">
            WEDDING FILM STORY
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#ecd28f]" />
        </div>

        {/* Main Title / Couple Names */}
        <h1 className="font-serif-sc text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider text-[#FFF4E4] mb-4">
          <span className="gold-gradient-text">{project.groomName}</span>
          <span className="font-serif italic font-normal text-3xl md:text-5xl text-[#d4ac59] mx-4 md:mx-6">
            &amp;
          </span>
          <span className="gold-gradient-text">{project.brideName}</span>
        </h1>

        {/* Date Display */}
        <div className="flex items-center gap-3 text-sm md:text-base tracking-[0.25em] text-[#ecd28f] font-serif mb-8">
          <span>{project.weddingDate}</span>
          <span className="text-[#81252D]">•</span>
          <span>{project.lunarDate}</span>
        </div>

        {/* Project Statistics Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-10 text-xs font-serif text-[#FFF4E4]/80">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e151b]/80 border border-[#ecd28f]/20">
            <ImageIcon className="w-4 h-4 text-[#d4ac59]" />
            <span>Tổng cộng: <b className="text-[#ecd28f]">{totalPhotosCount} bức ảnh</b></span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e151b]/80 border border-[#ecd28f]/20">
            <Clock className="w-4 h-4 text-[#d4ac59]" />
            <span>Thời lượng: <b className="text-[#ecd28f]">{formatDuration(timeline.totalDuration)}</b></span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e151b]/80 border border-[#ecd28f]/20">
            <Sparkles className="w-4 h-4 text-[#d4ac59]" />
            <span>7 Chương điện ảnh</span>
          </div>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="relative z-20 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
          {/* Open Studio */}
          <button
            type="button"
            onClick={() => setViewMode('studio')}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#81252D] to-[#691014] border border-[#ecd28f]/60 text-[#FFF4E4] font-serif font-bold tracking-wider hover:scale-[1.02] shadow-[0_8px_25px_rgba(129,37,45,0.4)] cursor-pointer transition-all"
          >
            <Film className="w-4 h-4 text-[#ecd28f]" />
            <span>MỞ STUDIO BIÊN TẬP</span>
          </button>

          {/* Preview Movie */}
          <button
            type="button"
            onClick={handlePreviewMovie}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#ecd28f]/40 bg-[#1e151b]/90 text-[#ecd28f] font-serif font-medium tracking-wide hover:bg-[#81252D]/40 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4 fill-[#ecd28f]" />
            <span>XEM THỬ PHIM</span>
          </button>

          {/* Start Presentation (Stage Mode) */}
          <button
            type="button"
            onClick={handleStartPresentation}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d4ac59] via-[#ecd28f] to-[#c6a477] text-[#151114] font-serif font-bold tracking-wider hover:brightness-105 shadow-[0_8px_25px_rgba(212,172,89,0.35)] cursor-pointer transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            <span>TRÌNH CHIẾU</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 h-16 px-6 md:px-12 flex items-center justify-between border-t border-[#ecd28f]/15 text-xs text-[#ecd28f]/60 font-serif">
        <div className="flex items-center gap-2">
          <span>Tuấn Hùng &amp; Sao Mai — Hạnh phúc trọn vẹn</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>35MM CINEMATIC HYBRID FILM JOURNEY</span>
        </div>
      </footer>
    </div>
  );
};
