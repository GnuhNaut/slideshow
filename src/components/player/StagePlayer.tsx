import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { SceneRenderer } from '../../scenes/SceneRenderer';
import { usePlaybackController } from '../../player/usePlaybackController';

export const StagePlayer: React.FC = () => {
  const project = useWeddingStore((s) => s.project);
  const playback = useWeddingStore((s) => s.playback);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const play = useWeddingStore((s) => s.play);
  const togglePlay = useWeddingStore((s) => s.togglePlay);
  const restart = useWeddingStore((s) => s.restart);
  const prevChapter = useWeddingStore((s) => s.prevChapter);
  const nextChapter = useWeddingStore((s) => s.nextChapter);
  const toggleMute = useWeddingStore((s) => s.toggleMute);
  const seek = useWeddingStore((s) => s.seek);

  // Run the playback engine loop in stage mode
  usePlaybackController(true);

  // Pre-show presentation start gate
  const [isStarted, setIsStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-hide cursor and floating controls after 2.8 seconds of mouse inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          handleMouseMove();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextChapter();
          handleMouseMove();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevChapter();
          handleMouseMove();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          handleMouseMove();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          handleMouseMove();
          break;
        case 'KeyR':
          e.preventDefault();
          restart();
          handleMouseMove();
          break;
        case 'Escape':
          // If already exited browser fullscreen, return to studio
          if (!document.fullscreenElement) {
            setViewMode('studio');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextChapter, prevChapter, toggleMute, restart, setViewMode]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not allowed:', err);
    }
  };

  const handleStartPresentation = async () => {
    setIsStarted(true);
    // Request fullscreen during valid user gesture
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Fallback: stay in max theater window
    }
    // Seek to 0 and begin playback
    seek(0);
    play();
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen bg-[#151114] overflow-hidden select-none flex items-center justify-center ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* ================= PRE-SHOW READY GATE ================= */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#151114] px-6 text-center">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-radial from-[#81252D]/35 via-[#1a1317]/80 to-[#151114] pointer-events-none" />

          {/* Monogram Seal */}
          <div className="relative z-10 mb-8 w-24 h-24 rounded-full border-2 border-[#ecd28f] bg-[#81252D]/90 flex items-center justify-center shadow-[0_0_35px_rgba(212,172,89,0.4)]">
            <span className="font-serif italic text-3xl text-[#FFF4E4] font-semibold">H &amp; M</span>
          </div>

          <p className="relative z-10 text-xs md:text-sm tracking-[0.35em] uppercase text-[#ecd28f] font-serif-sc mb-3">
            WEDDING FILM PRESENTATION
          </p>

          <h1 className="relative z-10 font-serif-sc text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider text-[#FFF4E4] mb-4">
            <span className="gold-gradient-text">{project.groomName}</span>
            <span className="font-serif italic font-normal text-3xl md:text-5xl text-[#d4ac59] mx-4">
              &amp;
            </span>
            <span className="gold-gradient-text">{project.brideName}</span>
          </h1>

          <div className="relative z-10 flex items-center gap-3 text-sm md:text-base tracking-[0.25em] text-[#ecd28f] font-serif mb-8">
            <span>{project.weddingDate}</span>
            <span className="text-[#81252D]">•</span>
            <span>{project.lunarDate}</span>
          </div>

          {/* Start presentation button */}
          <button
            onClick={handleStartPresentation}
            className="relative z-10 inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4ac59] via-[#ecd28f] to-[#c6a477] text-[#151114] font-serif font-bold text-base md:text-lg tracking-widest hover:scale-105 shadow-[0_10px_35px_rgba(212,172,89,0.45)] transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#81252D]" />
            <span>BẮT ĐẦU TRÌNH CHIẾU</span>
          </button>

          {/* Return to Studio */}
          <button
            onClick={() => setViewMode('studio')}
            className="relative z-10 mt-6 text-xs text-[#ecd28f]/60 hover:text-[#ecd28f] underline font-serif tracking-wide"
          >
            Quay lại giao diện biên tập Studio
          </button>
        </div>
      )}

      {/* ================= STAGE 16:9 PROJECTION CANVAS ================= */}
      <div className="relative w-full h-full aspect-video max-h-screen max-w-[177.77vh] flex items-center justify-center overflow-hidden">
        <SceneRenderer
          currentScene={playback.currentScene}
          currentTime={playback.currentTime}
          isPlaying={playback.isPlaying}
          enableGrain={project.globalSettings.enableFilmGrain}
        />
      </div>

      {/* ================= FLOATING ON-DEMAND CONTROL BAR ================= */}
      {/* Hidden during active presentation, appears ONLY on mouse move */}
      <div
        className={`absolute bottom-6 z-40 px-6 py-3 rounded-2xl bg-[#151114]/85 border border-[#ecd28f]/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-4 transition-all duration-500 ${
          showControls && isStarted
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <button
          onClick={restart}
          className="p-2 text-[#ecd28f] hover:text-white transition-colors"
          title="Phát lại từ đầu (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={prevChapter}
          className="p-2 text-[#ecd28f] hover:text-white transition-colors"
          title="Chương trước (←)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#81252D] to-[#691014] border border-[#ecd28f] text-[#FFF4E4] flex items-center justify-center hover:scale-105 shadow transition-transform"
          title="Phát/Tạm dừng (Space)"
        >
          {playback.isPlaying ? (
            <Pause className="w-5 h-5 text-[#ecd28f]" />
          ) : (
            <Play className="w-5 h-5 text-[#ecd28f] ml-0.5" />
          )}
        </button>

        <button
          onClick={nextChapter}
          className="p-2 text-[#ecd28f] hover:text-white transition-colors"
          title="Chương tiếp theo (→)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Time display */}
        <div className="font-mono text-xs text-[#ecd28f] px-2">
          <span>{formatTime(playback.currentTime)}</span>
          <span className="text-[#ecd28f]/40 mx-1">/</span>
          <span className="text-[#FFF4E4]/60">{formatTime(playback.totalDuration)}</span>
        </div>

        <button
          onClick={toggleMute}
          className="p-2 text-[#ecd28f] hover:text-white transition-colors"
          title="Bật/Tắt âm thanh (M)"
        >
          {playback.isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 text-[#ecd28f] hover:text-white transition-colors"
          title="Toàn màn hình (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setViewMode('studio')}
          className="p-2 text-rose-300 hover:text-white transition-colors border-l border-[#ecd28f]/20 pl-3"
          title="Thoát chế độ trình chiếu (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
