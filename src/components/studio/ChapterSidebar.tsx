import React, { useState } from 'react';
import { Layers, Image, Clock, Eye, EyeOff, Play, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { EffectLibraryModal } from './EffectLibraryModal';

export const ChapterSidebar: React.FC = () => {
  const chapters = useWeddingStore((s) => s.project.chapters);
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const setActiveChapter = useWeddingStore((s) => s.setActiveChapter);
  const seekToChapter = useWeddingStore((s) => s.seekToChapter);
  const updateChapter = useWeddingStore((s) => s.updateChapter);
  const timeline = useWeddingStore((s) => s.timeline);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [effectModalChapterId, setEffectModalChapterId] = useState<string | null>(null);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      <aside
        className={`h-full bg-white border-r border-[#C5A16E]/20 flex flex-col shrink-0 select-none z-20 transition-all duration-300 ${
          isCollapsed ? 'w-14' : 'w-72 sm:w-80'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-12 px-3 border-b border-[#C5A16E]/20 flex items-center justify-between bg-[#FFF9F2]/60">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C93442]" />
              <h2 className="text-xs tracking-[0.2em] uppercase font-sans font-bold text-[#40322F]">
                7 CHƯƠNG ĐIỆN ẢNH
              </h2>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-[#40322F]/60 hover:text-[#C93442] hover:bg-[#FAF3EB] mx-auto cursor-pointer transition-colors"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#FAF5EE]/40">
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
                      ? 'bg-[#C93442] text-white font-bold shadow-sm'
                      : 'text-[#40322F]/70 hover:bg-[#FAF3EB]'
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
                className={`group relative p-3 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-[#F0DFD5]/70 border-[#C93442] shadow-sm ring-1 ring-[#C93442]/30'
                    : 'bg-white border-[#C5A16E]/20 hover:border-[#C5A16E]/50 hover:bg-[#FFF9F2]'
                }`}
              >
                {/* Active Highlight Bar */}
                {isActive && (
                  <div className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-[#C93442]" />
                )}

                {/* Chapter Card Header */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-mono font-bold ${
                        isActive
                          ? 'bg-[#C93442] text-white'
                          : 'bg-[#FAF3EB] text-[#40322F] border border-[#C5A16E]/30'
                      }`}
                    >
                      {`0${ch.chapterIndex}`}
                    </span>
                    <h3
                      className={`text-xs font-serif font-bold tracking-wide truncate max-w-[150px] ${
                        isActive ? 'text-[#C93442]' : 'text-[#40322F]'
                      }`}
                    >
                      {ch.vietnameseTitle}
                    </h3>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEffectModalChapterId(ch.id);
                      }}
                      className="p-1 rounded text-[#C5A16E] hover:text-[#C93442] hover:bg-[#FAF3EB] cursor-pointer"
                      title="Chọn hiệu ứng chuyển động GSAP 3D"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToChapter(ch.id);
                      }}
                      className="p-1 rounded text-[#40322F] hover:text-[#C93442] hover:bg-[#FAF3EB] cursor-pointer"
                      title="Phát thử chương này"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateChapter(ch.id, { enabled: !ch.enabled });
                      }}
                      className={`p-1 rounded cursor-pointer ${
                        ch.enabled ? 'text-[#40322F] hover:bg-[#FAF3EB]' : 'text-stone-400'
                      }`}
                      title={ch.enabled ? 'Tắt chương' : 'Bật chương'}
                    >
                      {ch.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-[11px] text-[#40322F]/70 line-clamp-1 italic font-serif mb-2">
                  {ch.subtitle}
                </p>

                {/* Badges */}
                <div className="flex items-center justify-between text-[10px] text-[#40322F]/70 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1">
                      <Image className="w-3 h-3 text-[#C5A16E]" />
                      {ch.photos.length} ảnh
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C5A16E]" />
                      {formatSeconds(duration)}
                    </span>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-white uppercase tracking-wider text-[9px] text-[#C93442] font-semibold border border-[#C5A16E]/30">
                    {ch.effectMode.replace('f0', 'FX0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Effect Library Modal */}
      {effectModalChapterId && (
        <EffectLibraryModal
          isOpen={true}
          chapterId={effectModalChapterId}
          onClose={() => setEffectModalChapterId(null)}
        />
      )}
    </>
  );
};
