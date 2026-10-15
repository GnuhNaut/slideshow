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
  Sun,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { SceneRenderer } from '../../scenes/SceneRenderer';
import { usePlaybackController } from '../../player/usePlaybackController';
import { presentationWakeLock, WakeLockState } from '../../player/PresentationWakeLock';

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
  const [wakeLockState, setWakeLockState] = useState<WakeLockState>(
    presentationWakeLock.getState()
  );

  const hideControlsTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to wake lock state changes
  useEffect(() => {
    const unsub = presentationWakeLock.subscribe(setWakeLockState);
    return () => {
      unsub();
      presentationWakeLock.release();
    };
  }, []);

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
            presentationWakeLock.release();
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

    // Request Screen Wake Lock so display never sleeps during the wedding
    await presentationWakeLock.request();

    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Theater fallback
    }
    seek(0);
    play();
  };

  const handleExitPresentation = async () => {
    await presentationWakeLock.release();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Exit fullscreen error:', err);
      }
    }
    setViewMode('studio');
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
      className={`relative w-screen h-screen bg-[#FFF9F2] overflow-hidden select-none flex items-center justify-center ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* ================= PRE-SHOW READY GATE ================= */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] px-6 text-center">
          <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/70 to-[#FFF9F2] pointer-events-none" />

          {/* Minimalist Header Tag */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <span className="w-8 h-[1.5px] bg-[#C5A16E]" />
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-[#C93442] font-sans font-semibold">
              WEDDING FILM PRESENTATION V3
            </p>
            <span className="w-8 h-[1.5px] bg-[#C5A16E]" />
          </div>

          <h1 className="relative z-10 font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#40322F] mb-6">
            <span>{project.groomName}</span>
            <span className="font-serif italic font-normal text-3xl sm:text-5xl text-[#C5A16E] mx-4 sm:mx-6">
              &amp;
            </span>
            <span>{project.brideName}</span>
          </h1>

          <div className="relative z-10 flex items-center gap-4 text-sm md:text-base tracking-[0.25em] text-[#40322F] font-serif mb-10 font-medium">
            <span>{project.weddingDate}</span>
            <span className="text-[#C93442]">•</span>
            <span>{project.lunarDate}</span>
          </div>

          {/* Readiness Checklist */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 mb-10 text-xs font-sans text-[#40322F]/80">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#C5A16E]/30 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full HD 1080p Cinema</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#C5A16E]/30 shadow-sm">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Screen Wake Lock Auto</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#C5A16E]/30 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>IndexedDB Zero Data Loss</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartPresentation}
            className="relative z-10 group px-10 py-4 bg-[#C93442] hover:bg-[#9B222E] text-white rounded-full font-serif text-lg tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BẮT ĐẦU TRÌNH CHIẾU</span>
          </button>

          <p className="relative z-10 mt-6 text-xs text-[#40322F]/60 font-serif tracking-widest">
            Nhấn ESC bất kỳ lúc nào để quay lại Studio
          </p>
        </div>
      )}

      {/* ================= MAIN SCENE RENDERER ================= */}
      <SceneRenderer
        currentScene={playback.currentScene}
        currentTime={playback.currentTime}
        isPlaying={playback.isPlaying}
        enableGrain={project.globalSettings.enableFilmGrain}
      />

      {/* ================= STAGE HUD CONTROLS ================= */}
      <div
        className={`absolute bottom-0 inset-x-0 z-40 bg-gradient-to-t from-[#40322F]/90 via-[#40322F]/40 to-transparent p-6 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* Timeline Bar */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              seek(clickPos * playback.totalDuration);
            }}
            className="w-full h-2 bg-white/30 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all"
          >
            <div
              className="h-full bg-gradient-to-r from-[#C5A16E] to-[#C93442] rounded-full transition-all duration-75"
              style={{
                width: `${
                  playback.totalDuration > 0
                    ? (playback.currentTime / playback.totalDuration) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title={playback.isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
              >
                {playback.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={prevChapter}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Chương trước (Mũi tên trái)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextChapter}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Chương sau (Mũi tên phải)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={restart}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Xem lại từ đầu (R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="text-xs font-mono text-white/80 ml-2">
                {formatTime(playback.currentTime)} / {formatTime(playback.totalDuration)}
              </div>
            </div>

            {/* Current Chapter & Wake Lock Badge */}
            <div className="flex items-center gap-4">
              {/* Wake Lock Active Indicator */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full text-[10px] font-sans"
                title={
                  wakeLockState.isActive
                    ? 'Screen Wake Lock đang hoạt động - Màn hình luôn sáng'
                    : 'Screen Wake Lock không hoạt động'
                }
              >
                <Sun
                  className={`w-3.5 h-3.5 ${
                    wakeLockState.isActive ? 'text-amber-400 animate-pulse' : 'text-gray-400'
                  }`}
                />
                <span className={wakeLockState.isActive ? 'text-amber-200' : 'text-gray-400'}>
                  {wakeLockState.isActive ? 'LUÔN SÁNG' : 'WAKE LOCK OFF'}
                </span>
              </div>

              {playback.currentChapter && (
                <div className="hidden md:block text-xs font-serif text-[#F3E9DD] tracking-wide">
                  {playback.currentChapter.title}
                </div>
              )}

              <button
                type="button"
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title={playback.isMuted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
              >
                {playback.isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Toàn màn hình (F)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleExitPresentation}
                className="p-2 hover:bg-red-500/40 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white"
                title="Thoát trình chiếu (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
