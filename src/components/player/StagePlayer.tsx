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

  usePlaybackController(true);

  const [isStarted, setIsStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideControlsTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      console.warn('Fullscreen blocked:', err);
    }
  };

  const handleStartPresentation = async () => {
    setIsStarted(true);
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Fallback: theater window
    }
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
      className={`relative w-screen h-screen bg-[#1C1718] overflow-hidden select-none flex items-center justify-center ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* ================= PRE-SHOW READY GATE ================= */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1C1718] px-6 text-center">
          <div className="absolute inset-0 bg-radial from-[#581E2C]/30 via-[#1C1718]/90 to-[#1C1718] pointer-events-none" />

          {/* Minimalist Header */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#BFA47D]" />
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-[#BFA47D] font-serif font-semibold">
              WEDDING FILM PRESENTATION
            </p>
            <span className="w-8 h-[1px] bg-[#BFA47D]" />
          </div>

          <h1 className="relative z-10 font-serif-sc text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#F5EDE1] mb-6">
            <span>{project.groomName}</span>
            <span className="font-serif italic font-normal text-3xl sm:text-5xl text-[#BFA47D] mx-4 sm:mx-6">
              &amp;
            </span>
            <span>{project.brideName}</span>
          </h1>

          <div className="relative z-10 flex items-center gap-4 text-sm md:text-base tracking-[0.25em] text-[#BFA47D] font-serif mb-10">
            <span>{project.weddingDate}</span>
            <span className="text-[#581E2C]">•</span>
            <span className="text-[#F5EDE1]/75 italic">{project.lunarDate}</span>
          </div>

          {/* Start presentation button */}
          <button
            type="button"
            onClick={handleStartPresentation}
            className="relative z-10 inline-flex items-center gap-3 px-9 py-4 rounded bg-[#BFA47D] text-[#1C1718] font-serif font-bold text-base md:text-lg tracking-widest hover:scale-105 shadow-[0_10px_35px_rgba(191,164,125,0.35)] cursor-pointer transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#581E2C]" />
            <span>BẮT ĐẦU TRÌNH CHIẾU</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('studio')}
            className="relative z-10 mt-6 text-xs text-[#BFA47D]/70 hover:text-[#BFA47D] underline font-serif tracking-wide cursor-pointer"
          >
            Quay lại Studio
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
      <div
        className={`absolute bottom-6 z-40 px-5 py-2.5 rounded-xl bg-[#1C1718]/90 border border-[#BFA47D]/25 backdrop-blur-md shadow-2xl flex items-center gap-3.5 transition-all duration-500 ${
          showControls && isStarted
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={restart}
          className="p-1.5 text-[#BFA47D] hover:text-[#F5EDE1] cursor-pointer"
          title="Phát lại từ đầu (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={prevChapter}
          className="p-1.5 text-[#BFA47D] hover:text-[#F5EDE1] cursor-pointer"
          title="Chương trước (←)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded bg-[#581E2C] border border-[#BFA47D] text-[#F5EDE1] flex items-center justify-center hover:scale-105 cursor-pointer shadow transition-transform"
          title="Phát/Tạm dừng (Space)"
        >
          {playback.isPlaying ? (
            <Pause className="w-4 h-4 text-[#BFA47D]" />
          ) : (
            <Play className="w-4 h-4 text-[#BFA47D] ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={nextChapter}
          className="p-1.5 text-[#BFA47D] hover:text-[#F5EDE1] cursor-pointer"
          title="Chương tiếp theo (→)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Time display */}
        <div className="font-mono text-xs text-[#BFA47D] px-2">
          <span>{formatTime(playback.currentTime)}</span>
          <span className="text-[#BFA47D]/40 mx-1">/</span>
          <span className="text-[#F5EDE1]/60">{formatTime(playback.totalDuration)}</span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 text-[#BFA47D] hover:text-[#F5EDE1] cursor-pointer"
          title="Bật/Tắt âm thanh (M)"
        >
          {playback.isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 text-[#BFA47D] hover:text-[#F5EDE1] cursor-pointer"
          title="Toàn màn hình (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('studio')}
          className="p-1.5 text-rose-300 hover:text-white cursor-pointer border-l border-[#BFA47D]/20 pl-2.5"
          title="Thoát chế độ trình chiếu (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
