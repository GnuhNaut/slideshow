import React, { useRef, useState } from 'react';
import {
  Sliders,
  Crosshair,
  Crop,
  Clock,
  Trash2,
  BookmarkCheck,
  Type,
  Film,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { EffectMode, CropMode, PhotoItem } from '../../types/project';
import { calculateChapterAutoDuration } from '../../timeline/compiler';

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

  const [isEndingPickerOpen, setIsEndingPickerOpen] = useState(false);
  const focalCanvasRef = useRef<HTMLDivElement>(null);

  if (!activeChapter) return null;

  const calculatedAutoDuration = calculateChapterAutoDuration(activeChapter, project);

  const allProjectPhotos = project.chapters.flatMap((c) =>
    (c.photos || []).map((p) => ({ ...p, chapterTitle: c.vietnameseTitle, chapterIndex: c.chapterIndex }))
  );
  const currentEndingPhoto =
    allProjectPhotos.find((p) => p.id === project.endingPhotoId) ||
    allProjectPhotos.find((p) => p.id === activeChapter.photos[0]?.id) ||
    allProjectPhotos[allProjectPhotos.length - 1];

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

              {/* Prominent Ending Photo Button */}
              <button
                type="button"
                onClick={() => setEndingPhoto({ endingPhotoId: selectedPhoto.id })}
                className={`w-full flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-serif cursor-pointer transition-all shadow-sm ${
                  project.endingPhotoId === selectedPhoto.id
                    ? 'bg-[#C93442] border-[#C93442] text-white font-bold ring-2 ring-[#C93442]/30'
                    : 'bg-white border-[#C5A16E]/40 text-[#40322F] hover:bg-[#FAF3EB] hover:border-[#C93442]'
                }`}
              >
                <BookmarkCheck className={`w-4 h-4 ${project.endingPhotoId === selectedPhoto.id ? 'text-white' : 'text-[#C93442]'}`} />
                <span>
                  {project.endingPhotoId === selectedPhoto.id
                    ? '✓ Đang là ảnh kết thúc phim (Chương 7)'
                    : 'CHỌN LÀM ẢNH KẾT THÚC (CHƯƠNG 7)'}
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

            {/* Chapter 7 Ending Photo Section */}
            {activeChapter.chapterIndex === 7 && (
              <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
                <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#C93442]" />
                  <span>Ảnh kết thúc phim (Our Forever)</span>
                </label>

                {currentEndingPhoto ? (
                  <div className="p-2.5 rounded bg-white border border-[#C5A16E]/30 space-y-2 shadow-sm">
                    <div className="flex gap-2.5 items-center">
                      <img
                        src={currentEndingPhoto.thumbnail || currentEndingPhoto.url}
                        alt="Ending photo"
                        className="w-16 h-12 object-cover rounded border border-[#C5A16E]/30 bg-[#FAF5EE]"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-serif font-bold text-[#40322F] truncate">
                          {currentEndingPhoto.title || 'Ảnh kết thúc phim'}
                        </div>
                        <div className="text-[11px] text-[#C5A16E] font-serif truncate">
                          {currentEndingPhoto.chapterTitle}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEndingPickerOpen(true)}
                      className="w-full py-1.5 rounded bg-[#FAF5EE] hover:bg-[#F0DFD5] border border-[#C5A16E]/30 text-xs font-serif text-[#C93442] font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      Đổi ảnh kết thúc từ toàn bộ thư viện
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 font-serif space-y-1.5">
                    <div>⚠️ Chưa chọn ảnh kết thúc hoặc ảnh đã bị xóa.</div>
                    <button
                      type="button"
                      onClick={() => setIsEndingPickerOpen(true)}
                      className="w-full py-1 rounded bg-white border border-amber-300 text-amber-900 font-semibold cursor-pointer"
                    >
                      Chọn ảnh kết thúc từ thư viện
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Duration Mode & Controls */}
            <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#C93442]" />
                <span>Thời lượng chương</span>
              </label>

              {/* Mode Toggle: AUTO vs CUSTOM */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAF5EE] rounded-lg border border-[#C5A16E]/30">
                <button
                  type="button"
                  onClick={() => updateChapter(activeChapterId, { mode: 'auto' })}
                  className={`py-1 text-xs font-serif rounded transition-all cursor-pointer ${
                    activeChapter.mode !== 'custom'
                      ? 'bg-[#C93442] text-white font-bold shadow-sm'
                      : 'text-[#40322F]/70 hover:text-[#40322F]'
                  }`}
                >
                  TỰ ĐỘNG (AUTO)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateChapter(activeChapterId, {
                      mode: 'custom',
                      durationOverride: activeChapter.durationOverride || calculatedAutoDuration,
                    })
                  }
                  className={`py-1 text-xs font-serif rounded transition-all cursor-pointer ${
                    activeChapter.mode === 'custom'
                      ? 'bg-[#C93442] text-white font-bold shadow-sm'
                      : 'text-[#40322F]/70 hover:text-[#40322F]'
                  }`}
                >
                  TÙY CHỈNH (CUSTOM)
                </button>
              </div>

              {activeChapter.mode !== 'custom' ? (
                /* Auto mode display */
                <div className="p-2.5 rounded bg-white border border-[#C5A16E]/20 text-xs">
                  <div className="flex items-center justify-between text-[#40322F]">
                    <span className="font-serif">Thời lượng thực tế:</span>
                    <span className="font-mono font-bold text-[#C93442] text-sm">
                      {calculatedAutoDuration} giây
                    </span>
                  </div>
                  <p className="text-[11px] text-[#40322F]/65 italic font-serif mt-1">
                    Tự động tính theo {activeChapter.photos.length} bức ảnh và bố cục từng cảnh.
                  </p>
                </div>
              ) : (
                /* Custom mode controls */
                <div className="p-2.5 rounded bg-white border border-[#C5A16E]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif text-[#40322F]">Số giây sử dụng:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="2"
                        max="300"
                        value={activeChapter.durationOverride || calculatedAutoDuration}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          updateChapter(activeChapterId, {
                            durationOverride: val,
                            mode: 'custom',
                          });
                        }}
                        className="w-16 px-2 py-1 rounded bg-white border border-[#C5A16E]/40 text-xs font-mono font-bold text-[#40322F] text-center shadow-inner"
                      />
                      <span className="text-xs font-mono text-[#40322F]/70">giây</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-serif text-[#40322F]/60">Nhanh:</span>
                    {[20, 30, 45, 60, 90].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() =>
                          updateChapter(activeChapterId, {
                            durationOverride: sec,
                            mode: 'custom',
                          })
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                          activeChapter.durationOverride === sec
                            ? 'bg-[#C93442] border-[#C93442] text-white font-bold'
                            : 'bg-[#FAF5EE] border-[#C5A16E]/30 text-[#40322F] hover:bg-[#FAF3EB]'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>

                  {/* Warning if duration is too short */}
                  {activeChapter.photos.length > 0 &&
                    (activeChapter.durationOverride || 0) < activeChapter.photos.length * 1.5 && (
                      <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 font-serif leading-tight">
                        ⚠️ Thời lượng khá ngắn cho {activeChapter.photos.length} ảnh. Khuyến nghị tối thiểu {Math.ceil(activeChapter.photos.length * 2)}s để khách xem trọn vẹn.
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Ending Photo Selection Modal */}
      {isEndingPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-2xl bg-[#FFF9F2] border border-[#C5A16E]/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#C5A16E]/20 flex items-center justify-between bg-white/70">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-[#C93442]" />
                <h3 className="text-sm font-serif font-bold text-[#40322F]">
                  CHỌN ẢNH KẾT THÚC CHO BỘ PHIM (CHƯƠNG 7)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEndingPickerOpen(false)}
                className="p-1 rounded-full text-[#40322F]/60 hover:text-[#C93442] hover:bg-[#FAF3EB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <p className="text-xs font-serif text-[#40322F]/80 italic">
                Nhấp vào bất kỳ bức ảnh nào từ 7 chương để đặt làm bức ảnh đóng băng vĩnh cửu kết thúc bộ phim:
              </p>

              {project.chapters.map((ch) => {
                if (ch.photos.length === 0) return null;
                return (
                  <div key={ch.id} className="space-y-1.5">
                    <div className="text-xs font-serif font-bold text-[#40322F] border-b border-[#C5A16E]/20 pb-0.5">
                      {ch.vietnameseTitle} ({ch.photos.length} ảnh)
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {ch.photos.map((p) => {
                        const isCurrent = project.endingPhotoId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setEndingPhoto({ endingPhotoId: p.id });
                              setIsEndingPickerOpen(false);
                            }}
                            className={`group relative aspect-square rounded overflow-hidden border cursor-pointer transition-all ${
                              isCurrent
                                ? 'border-[#C93442] ring-2 ring-[#C93442] shadow-md'
                                : 'border-[#C5A16E]/30 hover:border-[#C93442] hover:scale-105'
                            }`}
                          >
                            <img
                              src={p.thumbnail || p.url}
                              alt={p.title || 'Photo'}
                              className="w-full h-full object-cover"
                            />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-[#C93442]/30 flex items-center justify-center">
                                <div className="bg-[#C93442] text-white p-1 rounded-full shadow">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[9px] text-white px-1 py-0.5 truncate">
                              {p.title || `Ảnh ${p.order + 1}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#C5A16E]/20 flex justify-end bg-white/70">
              <button
                type="button"
                onClick={() => setIsEndingPickerOpen(false)}
                className="px-4 py-1.5 rounded-full border border-[#C5A16E]/30 text-xs font-serif text-[#40322F] hover:bg-[#FAF3EB]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
