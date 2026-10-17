import React, { useCallback, useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { SceneRenderer } from '../../scenes/SceneRenderer';
import { usePlaybackController } from '../../player/usePlaybackController';
import { presentationWakeLock, WakeLockState } from '../../player/PresentationWakeLock';
import { audioEngine } from '../../audio/AudioEngine';
import { audioDirector } from '../../audio/AudioDirector';

export const StagePlayer: React.FC = () => {
  const project = useWeddingStore((s) => s.project);
  const playback = useWeddingStore((s) => s.playback);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const play = useWeddingStore((s) => s.play);
  const pause = useWeddingStore((s) => s.pause);
  const togglePlay = useWeddingStore((s) => s.togglePlay);
  const restart = useWeddingStore((s) => s.restart);
  const prevChapter = useWeddingStore((s) => s.prevChapter);
  const nextChapter = useWeddingStore((s) => s.nextChapter);
  const toggleMute = useWeddingStore((s) => s.toggleMute);
  const seek = useWeddingStore((s) => s.seek);

  usePlaybackController(true);

  const [isStarted, setIsStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLockState, setWakeLockState] = useState<WakeLockState>(
    presentationWakeLock.getState()
  );

  const hideControlsTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const preloadedChapterTwoImages = useRef<HTMLImageElement[]>([]);

  useEffect(() => () => {
    if (hideControlsTimer.current !== null) window.clearTimeout(hideControlsTimer.current);
  }, []);

  // Subscribe to wake lock state changes
  useEffect(() => {
    const unsub = presentationWakeLock.subscribe(setWakeLockState);
    return () => {
      unsub();
      presentationWakeLock.release();
    };
  }, []);

  // Warm only the first viewport of each Chapter 2 film track while the
  // operator is still on the ready gate. Keeping these Image objects alive
  // avoids a decode/upload spike exactly when the first transition begins.
  useEffect(() => {
    const memories = project.chapters.find((chapter) => chapter.chapterIndex === 2);
    const photos = memories?.photos || [];
    const splitIndex = Math.ceil(photos.length / 2);
    const preloadPhotos = [
      ...photos.slice(0, 6),
      ...photos.slice(splitIndex, splitIndex + 6),
    ];
    const urls = Array.from(
      new Set(preloadPhotos.map((photo) => photo.mediumUrl || photo.displayUrl || photo.url).filter(Boolean))
    );

    const timer = window.setTimeout(() => {
      preloadedChapterTwoImages.current = urls.map((url, index) => {
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = index < 4 ? 'high' : 'low';
        img.src = url;
        if (typeof img.decode === 'function') {
          void img.decode().catch(() => {});
        }
        return img;
      });
    }, 80);

    return () => {
      window.clearTimeout(timer);
      preloadedChapterTwoImages.current = [];
    };
  }, [project]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  const handleExitPresentation = useCallback(async () => {
    pause();
    audioDirector.pause();
    audioEngine.stop();
    await presentationWakeLock.release();
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Exit fullscreen error:', err);
      }
    }
    setIsFullscreen(false);

    // A remote-stage URL uses `?mode=stage`. Remove it before returning home;
    // otherwise App's hash listener immediately forces the player open again.
    const url = new URL(window.location.href);
    if (url.searchParams.has('mode')) {
      url.searchParams.delete('mode');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
    setViewMode('home');
  }, [pause, setViewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Do not start the clock behind the ready gate. Starting presentation
      // must remain a real user gesture so fullscreen/audio/wake lock unlock.
      if (!isStarted) {
        if (e.code === 'Escape') void handleExitPresentation();
        return;
      }

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
          void handleExitPresentation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, togglePlay, nextChapter, prevChapter, toggleMute, restart, handleExitPresentation]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  async function toggleFullscreen() {
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
  }

  const isStartingRef = useRef(false);

  const handleStartPresentation = () => {
    // Double-click protection: prevent starting multiple times
    if (isStarted || isStartingRef.current) return;
    isStartingRef.current = true;
    setIsStarted(true);

    // 1. Direct user gesture request for Fullscreen (non-blocking)
    if (containerRef.current?.requestFullscreen) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.info('Theater window fallback:', err));
    }

    // 2. Direct user gesture unlock for Web Audio (non-blocking in same tick!)
    audioEngine
      .unlock()
      .catch((err) => console.warn('Audio unlock warning:', err));

    // 3. Request Screen Wake Lock so display never sleeps during the wedding
    presentationWakeLock
      .request()
      .catch((err) => console.warn('Wake Lock request warning:', err));

    // 4. Reset clock to 0 and begin master playback
    pause();
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
      className={`relative w-screen h-screen bg-[#FFF9F2] overflow-hidden select-none flex items-center justify-center ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* ================= PRE-SHOW READY GATE ================= */}
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] px-6 text-center">
          <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/70 to-[#FFF9F2] pointer-events-none" />

          {/* Discreet Operator Diagnostics Button in Corner */}
          <div className="absolute top-6 right-8 z-30">
            <button
              type="button"
              onClick={() => setShowOperatorModal(!showOperatorModal)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-serif text-[#40322F]/70 bg-white/70 hover:bg-white border border-[#C5A16E]/30 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A16E]" />
              <span>Bảng kỹ thuật</span>
            </button>

            {/* Operator Diagnostics Popover */}
            {showOperatorModal && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-white/95 backdrop-blur-md border border-[#C5A16E]/40 rounded-xl luxury-shadow-lg text-left text-xs font-sans text-[#40322F] z-50">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#C5A16E]/20 font-semibold font-serif text-[#C93442]">
                  <span>THÔNG SỐ VẬN HÀNH</span>
                  <button
                    type="button"
                    onClick={() => setShowOperatorModal(false)}
                    className="text-[#40322F]/50 hover:text-[#40322F]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#40322F]/70">Độ phân giải:</span>
                    <span className="font-mono text-emerald-600 font-medium">1080p Cinema</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#40322F]/70">Wake Lock:</span>
                    <span className="font-mono text-amber-600 font-medium">
                      {wakeLockState.isActive ? 'Active' : 'Chờ bắt đầu'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#40322F]/70">Dữ liệu IndexedDB:</span>
                    <span className="font-mono text-emerald-600 font-medium">Đồng bộ project</span>
                  </div>
                  <div className="pt-2 border-t border-[#C5A16E]/20 text-[10px] text-[#40322F]/60">
                    Phím tắt: Space (Phát/Dừng), F (Toàn màn hình), M (Bật/Tắt tiếng), Esc (Trang đầu)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Header Tag */}
          <div className="relative z-10 flex items-center gap-3 mb-4">
            <span className="w-8 h-[1.5px] bg-[#C5A16E]" />
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-[#C93442] font-sans font-semibold">
              WEDDING FILM PRESENTATION V3.1
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

          <div className="relative z-10 flex items-center gap-4 text-sm md:text-base tracking-[0.25em] text-[#40322F] font-serif mb-12 font-medium">
            <span>{project.weddingDate}</span>
            <span className="text-[#C93442]">•</span>
            <span>{project.lunarDate}</span>
          </div>

          {/* Pure Luxury Start Button */}
          <button
            type="button"
            onClick={handleStartPresentation}
            className="relative z-10 group px-10 py-4 bg-[#C93442] hover:bg-[#9B222E] text-white rounded-full font-serif text-lg tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>BẮT ĐẦU TRÌNH CHIẾU</span>
          </button>

          <p className="relative z-10 mt-6 text-xs text-[#40322F]/60 font-serif tracking-widest">
            Nhấn ESC bất kỳ lúc nào để quay lại trang đầu
          </p>
        </div>
      )}

      {/* ================= MAIN SCENE RENDERER ================= */}
      <SceneRenderer
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
