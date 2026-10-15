import React, { useRef } from 'react';
import { useWeddingStore } from '../../app/store';

export const TimelineBar: React.FC = () => {
  const timeline = useWeddingStore((s) => s.timeline);
  const currentTime = useWeddingStore((s) => s.playback.currentTime);
  const totalDuration = useWeddingStore((s) => s.playback.totalDuration);
  const seek = useWeddingStore((s) => s.seek);
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const setActiveChapter = useWeddingStore((s) => s.setActiveChapter);

  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || totalDuration <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * totalDuration);
  };

  const playheadPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="h-16 bg-[#161213] border-t border-[#BFA47D]/15 flex flex-col justify-between px-4 py-1.5 shrink-0 select-none z-20">
      {/* Time ruler */}
      <div className="flex items-center justify-between text-[9px] font-mono text-[#BFA47D]/50 px-1">
        <span>00:00</span>
        <span>Khởi đầu</span>
        <span>Kỷ niệm</span>
        <span>Cầu hôn</span>
        <span>Gia đình</span>
        <span>Ảnh cưới</span>
        <span>Lời cảm ơn</span>
        <span>Kết thúc</span>
      </div>

      {/* Main Multi-Chapter Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-8 w-full bg-[#1C1718] rounded border border-[#BFA47D]/25 cursor-pointer overflow-hidden flex items-center shadow-inner"
      >
        {/* Chapter Segments */}
        {timeline.chaptersMeta.map((meta, index) => {
          const widthPercent =
            totalDuration > 0 ? (meta.duration / totalDuration) * 100 : 100 / 7;
          const isCurrentActive = meta.chapterId === activeChapterId;

          return (
            <div
              key={meta.chapterId}
              onClick={(e) => {
                e.stopPropagation();
                setActiveChapter(meta.chapterId);
                seek(meta.startTime);
              }}
              style={{ width: `${widthPercent}%` }}
              className={`h-full border-r border-[#BFA47D]/15 px-2 flex items-center justify-between transition-colors ${
                isCurrentActive
                  ? 'bg-[#581E2C]/70 text-[#F5EDE1]'
                  : index % 2 === 0
                  ? 'bg-[#181214]/90 hover:bg-[#581E2C]/30 text-[#BFA47D]/70'
                  : 'bg-[#221A1D]/90 hover:bg-[#581E2C]/30 text-[#BFA47D]/70'
              }`}
            >
              <span className="text-[10px] font-mono font-bold truncate">
                {`0${meta.chapterIndex}`}
              </span>
              <span className="text-[9px] font-serif truncate hidden md:inline">
                {meta.title.split(':')[1] || meta.title}
              </span>
            </div>
          );
        })}

        {/* Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#BFA47D] shadow-[0_0_8px_#BFA47D] pointer-events-none z-30"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#BFA47D] border border-[#1C1718] shadow" />
        </div>
      </div>
    </div>
  );
};
