import React, { useRef } from 'react';
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

  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#120d11] overflow-hidden select-none">
      {/* 16:9 Letterbox Presentation Monitor */}
      <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-[#151114] border-2 border-[#ecd28f]/35 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center">
        {/* Render Scene */}
        <SceneRenderer
          currentScene={playback.currentScene}
          currentTime={playback.currentTime}
          isPlaying={playback.isPlaying}
          enableGrain={enableGrain}
        />

        {/* Current Chapter Tag Pill on Top Right */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#151114]/80 border border-[#ecd28f]/30 backdrop-blur-md">
          <Film className="w-3.5 h-3.5 text-[#ecd28f]" />
          <span className="text-[11px] font-serif text-[#FFF4E4] tracking-wide">
            {playback.currentChapter?.title || 'Đang chuẩn bị'}
          </span>
        </div>

        {/* Big Center Play Icon overlay when paused */}
        {!playback.isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute z-20 w-16 h-16 rounded-full bg-[#81252D]/85 border-2 border-[#ecd28f] text-[#FFF4E4] flex items-center justify-center shadow-2xl backdrop-blur-sm hover:scale-110 transition-transform"
          >
            <Play className="w-7 h-7 text-[#ecd28f] ml-1" />
          </button>
        )}
      </div>

      {/* Floating Transport Control Bar Below Canvas */}
      <div className="w-full max-w-5xl mt-3 px-4 py-2.5 rounded-xl bg-[#181216] border border-[#ecd28f]/20 flex items-center justify-between shadow-lg">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="p-2 rounded-lg text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
            title="Phát lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={prevChapter}
            className="p-2 rounded-lg text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
            title="Chương trước"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#81252D] to-[#691014] border border-[#ecd28f]/50 text-[#FFF4E4] flex items-center justify-center hover:scale-105 shadow transition-transform"
            title={playback.isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'}
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4 text-[#ecd28f]" />
            ) : (
              <Play className="w-4 h-4 text-[#ecd28f] ml-0.5" />
            )}
          </button>
          <button
            onClick={nextChapter}
            className="p-2 rounded-lg text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
            title="Chương tiếp theo"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Timecode */}
          <div className="ml-3 px-2.5 py-1 rounded bg-[#120d10] border border-[#ecd28f]/20 font-mono text-xs text-[#ecd28f]">
            <span>{formatTime(playback.currentTime)}</span>
            <span className="text-[#ecd28f]/40 mx-1">/</span>
            <span className="text-[#FFF4E4]/60">{formatTime(playback.totalDuration)}</span>
          </div>
        </div>

        {/* Volume & Speed & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Playback Speed selector */}
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  playback.playbackSpeed === speed
                    ? 'bg-[#ecd28f] text-[#151114] font-bold'
                    : 'text-[#ecd28f]/60 hover:text-[#ecd28f]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
              title={playback.isMuted ? 'Bật tiếng (M)' : 'Tắt tiếng (M)'}
            >
              {playback.isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
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
              className="w-16 h-1 accent-[#d4ac59] bg-[#3a2933] rounded cursor-pointer"
            />
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setViewMode('player')}
            className="p-2 rounded-lg border border-[#ecd28f]/30 text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
            title="Mở toàn màn hình trình chiếu (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
