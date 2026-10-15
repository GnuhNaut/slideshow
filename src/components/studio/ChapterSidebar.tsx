import React from 'react';
import { Layers, Image, Clock, Eye, EyeOff, Play } from 'lucide-react';
import { useWeddingStore } from '../../app/store';

export const ChapterSidebar: React.FC = () => {
  const chapters = useWeddingStore((s) => s.project.chapters);
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const setActiveChapter = useWeddingStore((s) => s.setActiveChapter);
  const seekToChapter = useWeddingStore((s) => s.seekToChapter);
  const updateChapter = useWeddingStore((s) => s.updateChapter);
  const timeline = useWeddingStore((s) => s.timeline);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside className="w-80 h-full bg-[#181216] border-r border-[#ecd28f]/20 flex flex-col shrink-0 select-none z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#ecd28f]/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#d4ac59]" />
          <h2 className="text-xs tracking-[0.2em] uppercase font-serif-sc font-bold text-[#ecd28f]">
            CẤU TRÚC 7 CHƯƠNG
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#FFF4E4]/60">
          Tổng: {formatSeconds(timeline.totalDuration)}
        </span>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          const chapterMeta = timeline.chaptersMeta.find((m) => m.chapterId === ch.id);
          const duration = chapterMeta ? chapterMeta.duration : ch.durationOverride || 20;

          return (
            <div
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-[#81252D]/70 to-[#3b1219]/60 border-[#ecd28f] shadow-[0_4px_16px_rgba(129,37,45,0.4)]'
                  : 'bg-[#1e151b]/80 border-[#ecd28f]/10 hover:border-[#ecd28f]/40 hover:bg-[#251720]'
              }`}
            >
              {/* Active Marker Indicator */}
              {isActive && (
                <div className="absolute -left-1 top-3 bottom-3 w-1.5 rounded-full bg-gradient-to-b from-[#ecd28f] to-[#d4ac59]" />
              )}

              {/* Chapter Card Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold ${
                      isActive
                        ? 'bg-[#ecd28f] text-[#151114]'
                        : 'bg-[#151114] text-[#ecd28f] border border-[#ecd28f]/30'
                    }`}
                  >
                    {`0${ch.chapterIndex}`}
                  </span>
                  <h3
                    className={`text-xs font-serif font-bold tracking-wide truncate max-w-[160px] ${
                      isActive ? 'text-[#FFF4E4]' : 'text-[#FFF4E4]/90'
                    }`}
                  >
                    {ch.title}
                  </h3>
                </div>

                {/* Visibility Toggle & Quick Preview */}
                <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      seekToChapter(ch.id);
                    }}
                    className="p-1 rounded text-[#ecd28f] hover:bg-[#151114] transition-colors"
                    title="Phát thử chương này"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateChapter(ch.id, { enabled: !ch.enabled });
                    }}
                    className={`p-1 rounded transition-colors ${
                      ch.enabled ? 'text-[#ecd28f] hover:bg-[#151114]' : 'text-stone-500'
                    }`}
                    title={ch.enabled ? 'Tắt chương' : 'Bật chương'}
                  >
                    {ch.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Subtitle / Description */}
              <p className="text-[11px] text-[#FFF4E4]/65 line-clamp-1 italic font-serif mb-2">
                {ch.subtitle}
              </p>

              {/* Badges: Photo Count, Duration, Mode */}
              <div className="flex items-center justify-between text-[10px] text-[#ecd28f]/70 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3 text-[#d4ac59]" />
                    {ch.photos.length} ảnh
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#d4ac59]" />
                    {formatSeconds(duration)}
                  </span>
                </div>

                <span className="px-1.5 py-0.5 rounded bg-[#151114] border border-[#ecd28f]/20 uppercase tracking-wider text-[9px]">
                  {ch.effectMode.replace('f0', 'F')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
