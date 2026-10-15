import React, { useRef } from 'react';
import {
  Sliders,
  Crosshair,
  Crop,
  Clock,
  Trash2,
  BookmarkCheck,
  Type,
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
    <aside className="w-72 sm:w-80 h-full bg-white border-l border-[#C5A16E]/20 flex flex-col shrink-0 select-none overflow-y-auto z-20">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-[#C5A16E]/20 flex items-center justify-between bg-[#FFF9F2]/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#C93442]" />
          <h2 className="text-xs tracking-[0.2em] uppercase font-sans font-bold text-[#40322F]">
            {selectedPhoto ? 'THUỘC TÍNH ẢNH' : 'THUỘC TÍNH CHƯƠNG'}
          </h2>
        </div>
        {selectedPhoto && (
          <button
            type="button"
            onClick={() => useWeddingStore.getState().setSelectedPhoto(null)}
            className="text-[11px] text-[#C93442] hover:underline cursor-pointer font-serif font-medium"
          >
            Về chương
          </button>
        )}
      </div>

      <div className="p-4 space-y-5 bg-[#FAF5EE]/30 flex-1">
        {selectedPhoto ? (
          /* ================= PHOTO INSPECTOR ================= */
          <div className="space-y-4">
            {/* Interactive Focal Point Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
                <Crosshair className="w-3.5 h-3.5 text-[#C93442]" />
                <span>Trọng tâm ống kính (Focal Point)</span>
              </label>
              <p className="text-[11px] text-[#40322F]/70 italic font-serif mb-2">
                Nhấp lên ảnh để chọn tâm điểm camera khi zoom &amp; lia máy
              </p>

              <div
                ref={focalCanvasRef}
                onClick={handleFocalPointClick}
                className="relative w-full aspect-video rounded overflow-hidden border border-[#C5A16E]/40 cursor-crosshair bg-[#FAF5EE] shadow-inner"
              >
                <img
                  src={selectedPhoto.url}
                  alt="Focal Preview"
                  className="w-full h-full object-cover"
                />

                {/* Crosshair Target Marker */}
                <div
                  className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${selectedPhoto.focalPoint?.x ?? 50}%`,
                    top: `${selectedPhoto.focalPoint?.y ?? 50}%`,
                  }}
                >
                  <div className="w-full h-full rounded-full border-2 border-[#C93442] bg-[#F0DFD5]/80 shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
                  </div>
                </div>
              </div>

              <div className="mt-1 flex justify-between text-[10px] font-mono text-[#40322F]/70">
                <span>X: {selectedPhoto.focalPoint?.x ?? 50}%</span>
                <span>Y: {selectedPhoto.focalPoint?.y ?? 50}%</span>
              </div>
            </div>

            {/* Title / Caption */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
                <Type className="w-3.5 h-3.5 text-[#C5A16E]" />
                <span>Tên / Chú thích ảnh</span>
              </label>
              <input
                type="text"
                value={selectedPhoto.title || ''}
                onChange={(e) =>
                  updatePhoto(activeChapterId, selectedPhoto.id, { title: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
                placeholder="Nhập tên khoảnh khắc..."
              />
            </div>

            {/* Crop Mode */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
                <Crop className="w-3.5 h-3.5 text-[#C5A16E]" />
                <span>Chế độ hiển thị (Crop Mode)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cover', 'contain', 'fill'] as CropMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updatePhoto(activeChapterId, selectedPhoto.id, { cropMode: mode })}
                    className={`py-1 px-2 rounded text-[11px] font-mono capitalize border cursor-pointer transition-colors ${
                      selectedPhoto.cropMode === mode
                        ? 'bg-[#C93442] border-[#C93442] text-white font-medium shadow-sm'
                        : 'bg-white border-[#C5A16E]/30 text-[#40322F]/70 hover:text-[#40322F]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero & Ending Marks */}
            <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white border border-[#C5A16E]/30 hover:border-[#C5A16E] shadow-sm">
                <input
                  type="checkbox"
                  checked={selectedPhoto.isHero || false}
                  onChange={(e) =>
                    updatePhoto(activeChapterId, selectedPhoto.id, { isHero: e.target.checked })
                  }
                  className="accent-[#C93442] rounded"
                />
                <span className="text-xs font-serif text-[#40322F]">
                  Đặt làm ảnh nổi bật (Hero Moment)
                </span>
              </label>

              <button
                type="button"
                onClick={() => setEndingPhoto({ endingPhotoId: selectedPhoto.id })}
                className={`w-full flex items-center justify-center gap-2 p-2 rounded border text-xs font-serif cursor-pointer transition-colors shadow-sm ${
                  project.endingPhotoId === selectedPhoto.id
                    ? 'bg-[#C93442] border-[#C93442] text-white font-bold'
                    : 'bg-white border-[#C5A16E]/30 text-[#40322F] hover:bg-[#FAF3EB]'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-[#C5A16E]" />
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
                type="button"
                onClick={() => removePhoto(activeChapterId, selectedPhoto.id)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-serif cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bức ảnh này</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHAPTER INSPECTOR ================= */
          <div className="space-y-4">
            {/* Chapter Title */}
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold mb-1 block">
                Tiêu đề chương
              </label>
              <input
                type="text"
                value={activeChapter.vietnameseTitle}
                onChange={(e) =>
                  updateChapter(activeChapterId, { vietnameseTitle: e.target.value })
                }
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
              />
            </div>

            {/* Chapter Subtitle */}
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold mb-1 block">
                Mô tả ngắn
              </label>
              <textarea
                value={activeChapter.subtitle}
                onChange={(e) => updateChapter(activeChapterId, { subtitle: e.target.value })}
                rows={2}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] resize-none shadow-sm"
              />
            </div>

            {/* Effect Mode Picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
                <Film className="w-3.5 h-3.5 text-[#C93442]" />
                <span>Hiệu ứng cuộn phim (Film Engine)</span>
              </label>
              <select
                value={activeChapter.effectMode}
                onChange={(e) =>
                  updateChapter(activeChapterId, { effectMode: e.target.value as EffectMode })
                }
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] cursor-pointer shadow-sm"
              >
                <option value="f01_continuous_roll">FX01 — Dải phim chạy ngang liên tục</option>
                <option value="f02_dual_roll">FX02 — 3D Arc Carousel hình trụ</option>
                <option value="f04_film_to_hero">FX03 — Hero Frame Morph điện ảnh</option>
                <option value="f03_multi_layer">FX04 — Luxury Album Page Turn 3D</option>
                <option value="f06_living_collage">FX06 / FX11 — Editorial Split &amp; Mosaic</option>
                <option value="f08_final_freeze">FX12 — Grand Thank You &amp; Final Hold</option>
              </select>
            </div>

            {/* Quote Editor */}
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold mb-1 block">
                Câu nói lãng mạn
              </label>
              <textarea
                value={activeChapter.accentQuote || ''}
                onChange={(e) => updateChapter(activeChapterId, { accentQuote: e.target.value })}
                rows={2}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] resize-none shadow-sm"
                placeholder="Nhập câu trích dẫn..."
              />
            </div>

            {/* Duration override */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#C5A16E]" />
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
                  className="w-20 px-2.5 py-1 rounded bg-white border border-[#C5A16E]/30 text-xs font-mono text-[#40322F] shadow-sm"
                />
                <span className="text-xs text-[#40322F]/60 font-mono">giây</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
