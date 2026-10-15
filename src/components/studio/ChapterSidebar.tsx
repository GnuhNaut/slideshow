import React, { useState } from 'react';
import { Layers, Image, Clock, Eye, EyeOff, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWeddingStore } from '../../app/store';

export const ChapterSidebar: React.FC = () => {
  const chapters = useWeddingStore((s) => s.project.chapters);
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const setActiveChapter = useWeddingStore((s) => s.setActiveChapter);
  const seekToChapter = useWeddingStore((s) => s.seekToChapter);
  const updateChapter = useWeddingStore((s) => s.updateChapter);
  const timeline = useWeddingStore((s) => s.timeline);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <aside
      className={`h-full bg-[#181314] border-r border-[#BFA47D]/15 flex flex-col shrink-0 select-none z-20 transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-72 sm:w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-12 px-3 border-b border-[#BFA47D]/10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#BFA47D]" />
            <h2 className="text-xs tracking-[0.2em] uppercase font-serif font-bold text-[#BFA47D]">
              7 CHƯƠNG ĐIỆN ẢNH
            </h2>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-[#BFA47D]/70 hover:text-[#BFA47D] hover:bg-[#241C1E] mx-auto cursor-pointer transition-colors"
          title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {chapters.map((ch) => {
          const isActive = ch.id === activeChapterId;
          const chapterMeta = timeline.chaptersMeta.find((m) => m.chapterId === ch.id);
          const duration = chapterMeta ? chapterMeta.duration : ch.durationOverride || 20;

          if (isCollapsed) {
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChapter(ch.id)}
                className={`w-full py-2.5 flex flex-col items-center justify-center rounded cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#581E2C] text-[#F5EDE1] font-bold border border-[#BFA47D]/50'
                    : 'text-[#BFA47D]/70 hover:bg-[#241C1E]'
                }`}
                title={ch.vietnameseTitle}
              >
                <span className="text-xs font-mono font-bold">{`0${ch.chapterIndex}`}</span>
                <span className="text-[9px] font-mono mt-0.5">{ch.photos.length}</span>
              </button>
            );
          }

          return (
            <div
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`group relative p-2.5 rounded-lg cursor-pointer transition-all border ${
                isActive
                  ? 'bg-[#581E2C]/50 border-[#BFA47D]/60 shadow-[0_4px_16px_rgba(88,30,44,0.3)]'
                  : 'bg-[#20181A]/60 border-transparent hover:border-[#BFA47D]/25 hover:bg-[#241C1E]'
              }`}
            >
              {/* Active Highlight Bar */}
              {isActive && (
                <div className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-[#BFA47D]" />
              )}

              {/* Chapter Card Header */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#BFA47D] text-[#1C1718]'
                        : 'bg-[#140F11] text-[#BFA47D] border border-[#BFA47D]/30'
                    }`}
                  >
                    {`0${ch.chapterIndex}`}
                  </span>
                  <h3
                    className={`text-xs font-serif font-bold tracking-wide truncate max-w-[150px] ${
                      isActive ? 'text-[#F5EDE1]' : 'text-[#F5EDE1]/85'
                    }`}
                  >
                    {ch.title}
                  </h3>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekToChapter(ch.id);
                    }}
                    className="p-1 rounded text-[#BFA47D] hover:bg-[#140F11] cursor-pointer"
                    title="Phát thử chương này"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateChapter(ch.id, { enabled: !ch.enabled });
                    }}
                    className={`p-1 rounded cursor-pointer ${
                      ch.enabled ? 'text-[#BFA47D] hover:bg-[#140F11]' : 'text-stone-500'
                    }`}
                    title={ch.enabled ? 'Tắt chương' : 'Bật chương'}
                  >
                    {ch.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-[10px] text-[#F5EDE1]/60 line-clamp-1 italic font-serif mb-1.5">
                {ch.subtitle}
              </p>

              {/* Badges */}
              <div className="flex items-center justify-between text-[9px] text-[#BFA47D]/70 font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {ch.photos.length} ảnh
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatSeconds(duration)}
                  </span>
                </div>

                <span className="px-1.5 py-0.2 rounded bg-[#140F11] uppercase tracking-wider text-[8px] text-[#BFA47D]/60 border border-[#BFA47D]/15">
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
