import React, { useRef } from 'react';
import {
  Sliders,
  Crosshair,
  Sparkles,
  Crop,
  Clock,
  Trash2,
  BookmarkCheck,
  Type,
  Gauge,
  Film,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { EffectMode, CropMode } from '../../types/project';

export const InspectorPanel: React.FC = () => {
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const activeChapter = useWeddingStore((s) =>
    s.project.chapters.find((ch) => ch.id === activeChapterId)
  );
  const selectedPhotoId = useWeddingStore((s) => s.selectedPhotoId);
  const selectedPhoto = activeChapter?.photos.find((p) => p.id === selectedPhotoId);
  const updatePhoto = useWeddingStore((s) => s.updatePhoto);
  const removePhoto = useWeddingStore((s) => s.removePhoto);
  const updateChapter = useWeddingStore((s) => s.updateChapter);
  const setEndingPhoto = useWeddingStore((s) => s.updateProjectMeta);
  const project = useWeddingStore((s) => s.project);

  const focalCanvasRef = useRef<HTMLDivElement>(null);

  if (!activeChapter) return null;

  // Click on interactive thumbnail to set focal point
  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!focalCanvasRef.current || !selectedPhoto) return;
    const rect = focalCanvasRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));

    updatePhoto(activeChapterId, selectedPhoto.id, {
      focalPoint: { x, y },
    });
  };

  return (
    <aside className="w-80 h-full bg-[#181216] border-l border-[#ecd28f]/20 flex flex-col shrink-0 select-none overflow-y-auto z-20">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#ecd28f]/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#d4ac59]" />
          <h2 className="text-xs tracking-[0.2em] uppercase font-serif-sc font-bold text-[#ecd28f]">
            {selectedPhoto ? 'THUỘC TÍNH ẢNH' : 'THUỘC TÍNH CHƯƠNG'}
          </h2>
        </div>
        {selectedPhoto && (
          <button
            onClick={() => useWeddingStore.getState().setSelectedPhoto(null)}
            className="text-[10px] text-[#ecd28f]/60 hover:text-[#ecd28f] underline"
          >
            Về chương
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {selectedPhoto ? (
          /* ================= PHOTO INSPECTOR ================= */
          <div className="space-y-5">
            {/* Interactive Focal Point Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#FFF4E4] font-medium mb-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Trọng tâm ống kính (Focal Point)</span>
              </label>
              <p className="text-[10px] text-[#FFF4E4]/60 italic font-serif mb-2">
                Nhấp chuột lên ảnh để chọn tâm điểm camera khi zoom &amp; lia máy
              </p>

              <div
                ref={focalCanvasRef}
                onClick={handleFocalPointClick}
                className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#ecd28f]/40 cursor-crosshair bg-[#0d090b] shadow-inner"
              >
                <img
                  src={selectedPhoto.url}
                  alt="Focal Preview"
                  className="w-full h-full object-cover"
                />

                {/* Crosshair Target Marker */}
                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${selectedPhoto.focalPoint?.x ?? 50}%`,
                    top: `${selectedPhoto.focalPoint?.y ?? 50}%`,
                  }}
                >
                  <div className="w-full h-full rounded-full border-2 border-[#ecd28f] bg-[#81252D]/60 shadow-[0_0_8px_#ecd28f] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              <div className="mt-1 flex justify-between text-[10px] font-mono text-[#ecd28f]/70">
                <span>X: {selectedPhoto.focalPoint?.x ?? 50}%</span>
                <span>Y: {selectedPhoto.focalPoint?.y ?? 50}%</span>
              </div>
            </div>

            {/* Title / Caption */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#FFF4E4] font-medium mb-1">
                <Type className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Tên / Chú thích ảnh</span>
              </label>
              <input
                type="text"
                value={selectedPhoto.title || ''}
                onChange={(e) =>
                  updatePhoto(activeChapterId, selectedPhoto.id, { title: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
                placeholder="Nhập tên khoảnh khắc..."
              />
            </div>

            {/* Crop Mode */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#FFF4E4] font-medium mb-1">
                <Crop className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Chế độ hiển thị (Crop Mode)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cover', 'contain', 'fill'] as CropMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updatePhoto(activeChapterId, selectedPhoto.id, { cropMode: mode })}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono capitalize border transition-colors ${
                      selectedPhoto.cropMode === mode
                        ? 'bg-[#81252D] border-[#ecd28f] text-[#FFF4E4]'
                        : 'bg-[#120d10] border-[#ecd28f]/20 text-[#ecd28f]/60 hover:text-[#ecd28f]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero & Ending Marks */}
            <div className="space-y-2 pt-2 border-t border-[#ecd28f]/15">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-[#1e151b] border border-[#ecd28f]/20 hover:border-[#ecd28f]/50">
                <input
                  type="checkbox"
                  checked={selectedPhoto.isHero || false}
                  onChange={(e) =>
                    updatePhoto(activeChapterId, selectedPhoto.id, { isHero: e.target.checked })
                  }
                  className="accent-[#d4ac59] rounded"
                />
                <span className="text-xs font-serif text-[#FFF4E4]">
                  Đặt làm ảnh nổi bật (Hero Moment)
                </span>
              </label>

              <button
                onClick={() => setEndingPhoto({ endingPhotoId: selectedPhoto.id })}
                className={`w-full flex items-center justify-center gap-2 p-2 rounded border text-xs font-serif transition-colors ${
                  project.endingPhotoId === selectedPhoto.id
                    ? 'bg-[#81252D] border-[#ecd28f] text-[#ecd28f] font-bold'
                    : 'bg-[#120d10] border-[#ecd28f]/20 text-[#FFF4E4] hover:bg-[#81252D]/40'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>
                  {project.endingPhotoId === selectedPhoto.id
                    ? '✓ Đang là ảnh kết thúc phim'
                    : 'Chọn làm ảnh kết thúc (Chương 7)'}
                </span>
              </button>
            </div>

            {/* Delete photo button */}
            <div className="pt-2">
              <button
                onClick={() => removePhoto(activeChapterId, selectedPhoto.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-serif transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bức ảnh này khỏi dự án</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHAPTER INSPECTOR ================= */
          <div className="space-y-5">
            {/* Chapter Title */}
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium mb-1 block">
                Tiêu đề chương
              </label>
              <input
                type="text"
                value={activeChapter.vietnameseTitle}
                onChange={(e) =>
                  updateChapter(activeChapterId, { vietnameseTitle: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
              />
            </div>

            {/* Chapter Subtitle */}
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium mb-1 block">
                Mô tả ngắn / Chú thích
              </label>
              <textarea
                value={activeChapter.subtitle}
                onChange={(e) => updateChapter(activeChapterId, { subtitle: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f] resize-none"
              />
            </div>

            {/* Effect Mode Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#FFF4E4] font-medium mb-1.5">
                <Film className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Hiệu ứng cuộn phim (Film Engine)</span>
              </label>
              <select
                value={activeChapter.effectMode}
                onChange={(e) =>
                  updateChapter(activeChapterId, { effectMode: e.target.value as EffectMode })
                }
                className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#ecd28f] focus:outline-none focus:border-[#ecd28f]"
              >
                <option value="f01_continuous_roll">F01 — Dải phim chạy ngang liên tục</option>
                <option value="f02_dual_roll">F02 — Hai dải phim chạy ngược chiều</option>
                <option value="f04_film_to_hero">F04 — Cuộn phim chậm lại &amp; phóng lớn Hero</option>
                <option value="f05_pan_zoom">F05 — Camera điện ảnh (Pan &amp; Ken Burns)</option>
                <option value="f06_living_collage">F06 — Living Collage nghệ thuật</option>
                <option value="f07_soft_light">F07 — Ánh sáng dịu (Soft Light Reveal)</option>
                <option value="f08_final_freeze">F08 — Đóng băng vĩnh cửu (Final Freeze)</option>
              </select>
            </div>

            {/* Quote / Subtitle Editor */}
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium mb-1 block">
                Câu nói lãng mạn chương
              </label>
              <textarea
                value={activeChapter.accentQuote || ''}
                onChange={(e) => updateChapter(activeChapterId, { accentQuote: e.target.value })}
                rows={2}
                className="w-full px-3 py-1.5 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f] resize-none"
                placeholder="Nhập câu trích dẫn..."
              />
            </div>

            {/* Chapter Duration Override */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#FFF4E4] font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Thời lượng chương (giây)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={activeChapter.durationOverride || 20}
                  onChange={(e) =>
                    updateChapter(activeChapterId, {
                      durationOverride: parseInt(e.target.value) || 20,
                    })
                  }
                  className="w-24 px-3 py-1.5 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs font-mono text-[#ecd28f] focus:outline-none focus:border-[#ecd28f]"
                />
                <span className="text-xs text-[#FFF4E4]/60 font-mono">giây</span>
              </div>
            </div>

            {/* Quick Auto-Director Status */}
            <div className="p-3 rounded-lg bg-[#120d10] border border-[#ecd28f]/20">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#ecd28f] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#d4ac59]" />
                <span>Auto Director Đang Kích Hoạt</span>
              </div>
              <p className="text-[11px] text-[#FFF4E4]/70 font-serif italic">
                Hệ thống tự động biên dịch timeline và phân bổ hiệu ứng tối ưu theo số lượng{' '}
                {activeChapter.photos.length} ảnh.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
