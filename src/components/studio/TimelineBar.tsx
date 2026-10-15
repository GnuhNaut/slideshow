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
    <div className="h-20 bg-[#161014] border-t border-[#ecd28f]/20 flex flex-col justify-between px-4 py-2 shrink-0 select-none z-20">
      {/* Time ruler */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#ecd28f]/50 px-1">
        <span>00:00</span>
        <span>{timeline.chaptersMeta[0]?.title || 'Intro'}</span>
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
        className="relative h-9 w-full bg-[#1e151b] rounded-lg border border-[#ecd28f]/30 cursor-pointer overflow-hidden flex items-center shadow-inner"
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
              className={`h-full border-r border-[#ecd28f]/20 px-2 flex items-center justify-between transition-colors ${
                isCurrentActive
                  ? 'bg-[#81252D]/60'
                  : index % 2 === 0
                  ? 'bg-[#181115]/80 hover:bg-[#81252D]/30'
                  : 'bg-[#22181f]/80 hover:bg-[#81252D]/30'
              }`}
            >
              <span className="text-[10px] font-serif text-[#FFF4E4] font-bold truncate">
                {`0${meta.chapterIndex}`}
              </span>
              <span className="text-[9px] font-mono text-[#ecd28f]/70 truncate hidden md:inline">
                {meta.title.split(':')[1] || meta.title}
              </span>
            </div>
          );
        })}

        {/* Playhead Scrubber Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#ecd28f] shadow-[0_0_10px_#ecd28f] pointer-events-none z-30"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#ecd28f] border-2 border-[#151114] shadow" />
        </div>
      </div>
    </div>
  );
};
