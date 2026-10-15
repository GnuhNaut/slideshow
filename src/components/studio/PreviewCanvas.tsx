import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { SceneRenderer } from '../../scenes/SceneRenderer';

export const PreviewCanvas: React.FC = () => {
  const playback = useWeddingStore((s) => s.playback);
  const togglePlay = useWeddingStore((s) => s.togglePlay);
  const restart = useWeddingStore((s) => s.restart);
  const prevChapter = useWeddingStore((s) => s.prevChapter);
  const nextChapter = useWeddingStore((s) => s.nextChapter);
  const setVolume = useWeddingStore((s) => s.setVolume);
  const toggleMute = useWeddingStore((s) => s.toggleMute);
  const setPlaybackSpeed = useWeddingStore((s) => s.setPlaybackSpeed);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const enableGrain = useWeddingStore((s) => s.project.globalSettings.enableFilmGrain);

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 bg-[#FAF5EE] overflow-hidden select-none border-x border-[#C5A16E]/20">
      {/* 16:9 Letterbox Presentation Monitor */}
      <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden bg-white border border-[#C5A16E]/30 luxury-shadow-lg flex items-center justify-center">
        {/* Render Scene */}
        <SceneRenderer
          currentScene={playback.currentScene}
          currentTime={playback.currentTime}
          isPlaying={playback.isPlaying}
          enableGrain={enableGrain}
        />

        {/* Current Chapter Pill on Top Right */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#C5A16E]/30 backdrop-blur-md shadow-sm">
          <Film className="w-3.5 h-3.5 text-[#C93442]" />
          <span className="text-[11px] font-serif text-[#40322F] tracking-wide font-medium">
            {playback.currentChapter?.title || 'Đang chuẩn bị'}
          </span>
        </div>

        {/* Big Center Play Icon overlay when paused */}
        {!playback.isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute z-20 w-14 h-14 rounded-full bg-[#C93442]/90 border border-white text-white flex items-center justify-center shadow-xl backdrop-blur-sm hover:scale-105 cursor-pointer transition-transform"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Transport Control Bar Below Canvas */}
      <div className="w-full max-w-5xl mt-3 px-4 py-2 rounded-lg bg-white border border-[#C5A16E]/30 flex items-center justify-between shadow-sm">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={restart}
            className="p-1.5 rounded text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer transition-colors"
            title="Phát lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={prevChapter}
            className="p-1.5 rounded text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer transition-colors"
            title="Chương trước"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded bg-[#C93442] text-white flex items-center justify-center hover:scale-105 cursor-pointer transition-transform shadow-sm"
            title={playback.isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={nextChapter}
            className="p-1.5 rounded text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer transition-colors"
            title="Chương tiếp theo"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Timecode */}
          <div className="ml-2 px-2.5 py-0.5 rounded bg-[#FAF3EC] border border-[#C5A16E]/30 font-mono text-xs text-[#40322F]">
            <span>{formatTime(playback.currentTime)}</span>
            <span className="text-[#C5A16E] mx-1">/</span>
            <span className="text-[#40322F]/60">{formatTime(playback.totalDuration)}</span>
          </div>
        </div>

        {/* Volume & Speed & Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Playback Speed */}
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                  playback.playbackSpeed === speed
                    ? 'bg-[#C5A16E] text-white font-bold'
                    : 'text-[#40322F]/70 hover:text-[#C93442]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer transition-colors"
              title={playback.isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {playback.isMuted ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playback.isMuted ? 0 : playback.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 bg-[#FAF3EC] rounded-lg appearance-none cursor-pointer accent-[#C93442]"
            />
          </div>

          {/* Stage Mode Button */}
          <button
            type="button"
            onClick={() => setViewMode('player')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#C93442] text-white text-xs font-serif hover:bg-[#9B222E] cursor-pointer transition-colors shadow-sm"
            title="Mở chế độ trình chiếu (Stage Mode)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trình Chiếu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
