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
  Gauge,
  Eye,
  RotateCcw,
  Layers,
  ChevronRight,
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
  const timeline = useWeddingStore((s) => s.timeline);

  const [isEndingPickerOpen, setIsEndingPickerOpen] = useState(false);
  const focalCanvasRef = useRef<HTMLDivElement>(null);

  if (!activeChapter) return null;

  const calculatedAutoDuration = calculateChapterAutoDuration(activeChapter, project);
  const chapterScenes = timeline.scenes.filter((sc) => sc.chapterId === activeChapter.id);

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

  const handleSceneDurationChange = (sceneId: string, durationSec: number) => {
    const validDur = Math.max(1, Number(durationSec.toFixed(1)));
    const currentOverrides = { ...(activeChapter.sceneDurationOverrides || {}) };
    currentOverrides[sceneId] = validDur;
    updateChapter(activeChapterId, { sceneDurationOverrides: currentOverrides });
  };

  const handleResetSceneDuration = (sceneId: string) => {
    const currentOverrides = { ...(activeChapter.sceneDurationOverrides || {}) };
    delete currentOverrides[sceneId];
    updateChapter(activeChapterId, { sceneDurationOverrides: currentOverrides });
  };

  const getSceneDisplayName = (sceneType: string, sceneIndex: number): string => {
    switch (sceneType) {
      case 'intro':
        return 'Mở đầu & Tiêu đề điện ảnh';
      case 'film_roll':
      case 'dual_film_roll':
        return 'Cuộn phim ký ức 35mm';
      case 'film_to_hero':
        return 'Lời cầu hôn • Hero Moment';
      case 'hero_moment':
        return `Hero Photo ${sceneIndex}`;
      case 'family_gallery':
      case 'family_split':
        return `Khoảnh khắc gia đình ${sceneIndex}`;
      case 'living_collage':
        return `Bộ sưu tập ảnh cưới ${sceneIndex}`;
      case 'thank_you':
        return 'Lời tri ân & Lời cảm ơn';
      case 'final_freeze':
        return 'Khung hình kết thúc phim';
      default:
        return `Phân cảnh ${sceneIndex}`;
    }
  };

  // Chapter 2 Filmstrip Speed calculations
  const currentSpeedMode = activeChapter.filmstripSpeedMode || 'auto';
  let effectiveSpeed = activeChapter.speed || 48;
  if (currentSpeedMode === 'slow') effectiveSpeed = 34;
  else if (currentSpeedMode === 'medium') effectiveSpeed = 50;
  else if (currentSpeedMode === 'fast') effectiveSpeed = 72;
  else if (currentSpeedMode === 'custom') effectiveSpeed = activeChapter.filmstripSpeedCustom || 48;

  const estimatedPhotoObservationSec = Math.round((320 / Math.max(10, effectiveSpeed)) * 10) / 10;

  return (
    <aside className="w-80 sm:w-88 h-full bg-white border-l border-[#C5A16E]/20 flex flex-col shrink-0 select-none overflow-y-auto z-20">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-[#C5A16E]/20 flex items-center justify-between bg-[#FFF9F2]/60 shrink-0">
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
                {(['contain', 'cover', 'fill'] as CropMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updatePhoto(activeChapterId, selectedPhoto.id, { cropMode: mode })}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono capitalize border cursor-pointer transition-colors ${
                      (selectedPhoto.cropMode || 'contain') === mode
                        ? 'bg-[#C93442] border-[#C93442] text-white font-medium shadow-sm'
                        : 'bg-white border-[#C5A16E]/30 text-[#40322F]/70 hover:text-[#40322F]'
                    }`}
                  >
                    {mode === 'contain' ? 'Trọn vẹn (Contain)' : mode === 'cover' ? 'Lấp đầy (Cover)' : 'Gốc (Fill)'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#40322F]/65 font-serif italic mt-1">
                * Contain: giữ 100% người, không bị cắt mất đầu/chân. Cover: phóng to vừa khung.
              </p>
            </div>

            {/* PHOTO DURATION (THỜI GIAN HIỂN THỊ ẢNH) */}
            <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
              <label className="flex items-center justify-between text-xs font-serif text-[#40322F] font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C93442]" />
                  <span>Thời gian hiển thị ảnh</span>
                </div>
                {selectedPhoto.duration && (
                  <button
                    type="button"
                    onClick={() => updatePhoto(activeChapterId, selectedPhoto.id, { duration: undefined })}
                    className="text-[10px] text-[#C93442] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </label>

              <div className="p-2.5 rounded bg-white border border-[#C5A16E]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif text-[#40322F]">
                    {selectedPhoto.duration ? 'Tùy chỉnh riêng:' : 'Mặc định (Auto):'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={selectedPhoto.duration || 4}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        updatePhoto(activeChapterId, selectedPhoto.id, { duration: val });
                      }}
                      className="w-14 px-2 py-1 rounded bg-[#FAF5EE] border border-[#C5A16E]/40 text-xs font-mono font-bold text-[#40322F] text-center"
                    />
                    <span className="font-mono text-[#40322F]/70">giây</span>
                  </div>
                </div>

                {/* Preset duration buttons */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {[2, 3, 4, 5, 6, 8, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => updatePhoto(activeChapterId, selectedPhoto.id, { duration: sec })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                        selectedPhoto.duration === sec
                          ? 'bg-[#C93442] border-[#C93442] text-white font-bold'
                          : 'bg-[#FAF5EE] border-[#C5A16E]/30 text-[#40322F] hover:bg-[#FAF3EB]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
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
          <div className="space-y-5">
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

            {/* ================= CHAPTER DURATION SECTION ================= */}
            <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
              <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#C93442]" />
                <span>THỜI LƯỢNG CHƯƠNG</span>
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
                    <span className="font-serif">Thời lượng tự tính:</span>
                    <span className="font-mono font-bold text-[#C93442] text-sm">
                      {calculatedAutoDuration} giây
                    </span>
                  </div>
                  <p className="text-[11px] text-[#40322F]/65 italic font-serif mt-1">
                    Tự động tính theo {activeChapter.photos.length} bức ảnh và các phân cảnh.
                  </p>
                </div>
              ) : (
                /* Custom mode controls with presets [5, 10, 15, 20, 30, 45, 60, 90] */
                <div className="p-3 rounded bg-white border border-[#C5A16E]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif text-[#40322F]">Số giây mong muốn:</span>
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
                        className="w-16 px-2 py-1 rounded bg-[#FAF5EE] border border-[#C5A16E]/40 text-xs font-mono font-bold text-[#40322F] text-center shadow-inner"
                      />
                      <span className="text-xs font-mono text-[#40322F]/70">giây</span>
                    </div>
                  </div>

                  {/* 8 User-Requested Presets: 5s, 10s, 15s, 20s, 30s, 45s, 60s, 90s */}
                  <div>
                    <div className="text-[10px] font-serif text-[#40322F]/60 mb-1">Mức thời gian nhanh:</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[5, 10, 15, 20, 30, 45, 60, 90].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            updateChapter(activeChapterId, {
                              durationOverride: sec,
                              mode: 'custom',
                            })
                          }
                          className={`py-1 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                            activeChapter.durationOverride === sec
                              ? 'bg-[#C93442] border-[#C93442] text-white font-bold'
                              : 'bg-[#FAF5EE] border-[#C5A16E]/30 text-[#40322F] hover:bg-[#FAF3EB]'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= SCENE LIST IN CHAPTER (DANH SÁCH CẢNH TRONG CHƯƠNG) ================= */}
            <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
              <label className="flex items-center justify-between text-xs font-serif text-[#40322F] font-semibold">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#C93442]" />
                  <span>DANH SÁCH CẢNH TRONG CHƯƠNG</span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">{chapterScenes.length} cảnh</span>
              </label>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {chapterScenes.map((scene, idx) => {
                  const isOverridden = activeChapter.sceneDurationOverrides?.[scene.id] !== undefined;
                  const currentDur = scene.duration;

                  return (
                    <div
                      key={scene.id}
                      className="p-2.5 rounded bg-white border border-[#C5A16E]/25 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-serif font-bold text-[#40322F] truncate max-w-[170px]">
                          {getSceneDisplayName(scene.type, idx + 1)}
                        </span>
                        <span className="text-[10px] font-mono text-[#C5A16E] bg-[#FAF5EE] px-1.5 py-0.5 rounded">
                          {scene.photos.length} ảnh
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-serif text-[#40322F]/70">Thời lượng cảnh:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSceneDurationChange(scene.id, currentDur - 0.5)}
                            className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="60"
                            value={currentDur}
                            onChange={(e) =>
                              handleSceneDurationChange(scene.id, parseFloat(e.target.value) || 1)
                            }
                            className={`w-12 px-1 py-0.5 text-center text-[11px] font-mono font-bold rounded border ${
                              isOverridden
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-white border-[#C5A16E]/30 text-[#40322F]'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSceneDurationChange(scene.id, currentDur + 0.5)}
                            className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-[10px] font-mono text-stone-500">s</span>

                          {isOverridden && (
                            <button
                              type="button"
                              onClick={() => handleResetSceneDuration(scene.id)}
                              className="ml-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                              title="Khôi phục mặc định"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= CHAPTER 2 SPECIAL CONTROLS ================= */}
            {activeChapter.chapterIndex === 2 && (
              <div className="space-y-4 pt-2 border-t border-[#C5A16E]/20">
                {/* 1. Filmstrip Speed Control */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold">
                    <Gauge className="w-3.5 h-3.5 text-[#C93442]" />
                    <span>TỐC ĐỘ CUỘN PHIM</span>
                  </label>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'auto', label: 'TỰ ĐỘNG' },
                      { id: 'slow', label: 'CHẬM' },
                      { id: 'medium', label: 'VỪA' },
                      { id: 'fast', label: 'NHANH' },
                      { id: 'custom', label: 'TÙY CHỈNH' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() =>
                          updateChapter(activeChapterId, {
                            filmstripSpeedMode: sp.id as any,
                          })
                        }
                        className={`py-1 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                          currentSpeedMode === sp.id
                            ? 'bg-[#C93442] border-[#C93442] text-white font-bold shadow-sm'
                            : 'bg-white border-[#C5A16E]/30 text-[#40322F] hover:bg-[#FAF5EE]'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>

                  {currentSpeedMode === 'custom' && (
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#C5A16E]/30 text-xs">
                      <span className="font-serif text-[#40322F]">Tốc độ tùy chọn:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="20"
                          max="150"
                          value={activeChapter.filmstripSpeedCustom || 48}
                          onChange={(e) =>
                            updateChapter(activeChapterId, {
                              filmstripSpeedCustom: parseInt(e.target.value) || 48,
                            })
                          }
                          className="w-14 px-1.5 py-0.5 rounded bg-[#FAF5EE] border border-[#C5A16E]/40 text-xs font-mono font-bold text-center"
                        />
                        <span className="text-[10px] font-mono text-stone-500">px/s</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-[#40322F]/70 font-serif italic bg-white p-2 rounded border border-[#C5A16E]/20">
                    ⏱️ Thời gian quan sát ước tính: <strong>~{estimatedPhotoObservationSec}s</strong> / ảnh.
                  </div>
                </div>

                {/* 2. Visual Toggles (User explicit directive) */}
                <div className="space-y-2 p-3 rounded bg-white border border-[#C5A16E]/30 shadow-sm">
                  <label className="text-xs font-serif text-[#40322F] font-bold block mb-1">
                    TÙY CHỌN HIỂN THỊ CHƯƠNG 2
                  </label>

                  {/* Show Center Title */}
                  <label className="flex items-center justify-between text-xs font-serif text-[#40322F] cursor-pointer py-0.5">
                    <span>Hiện tiêu đề "Những ngày bên nhau"</span>
                    <input
                      type="checkbox"
                      checked={activeChapter.showCenterTitle !== false}
                      onChange={(e) =>
                        updateChapter(activeChapterId, { showCenterTitle: e.target.checked })
                      }
                      className="accent-[#C93442] w-4 h-4 rounded"
                    />
                  </label>

                  {/* Show Center Couple Names (DEFAULT OFF) */}
                  <label className="flex items-center justify-between text-xs font-serif text-[#40322F] cursor-pointer py-0.5">
                    <span>Hiện tên Tuấn Hùng &amp; Sao Mai ở giữa</span>
                    <input
                      type="checkbox"
                      checked={activeChapter.showCenterNames === true}
                      onChange={(e) =>
                        updateChapter(activeChapterId, { showCenterNames: e.target.checked })
                      }
                      className="accent-[#C93442] w-4 h-4 rounded"
                    />
                  </label>

                  {/* Show Frame Names (DEFAULT OFF) */}
                  <label className="flex items-center justify-between text-xs font-serif text-[#40322F] cursor-pointer py-0.5">
                    <span>Hiện tên trên từng khung ảnh 35mm</span>
                    <input
                      type="checkbox"
                      checked={activeChapter.showFrameNames === true}
                      onChange={(e) =>
                        updateChapter(activeChapterId, { showFrameNames: e.target.checked })
                      }
                      className="accent-[#C93442] w-4 h-4 rounded"
                    />
                  </label>

                  {/* Show Metadata 35mm (DEFAULT OFF) */}
                  <label className="flex items-center justify-between text-xs font-serif text-[#40322F] cursor-pointer py-0.5">
                    <span>Hiện metadata "35MM • #Frame"</span>
                    <input
                      type="checkbox"
                      checked={activeChapter.showMetadata35mm === true}
                      onChange={(e) =>
                        updateChapter(activeChapterId, { showMetadata35mm: e.target.checked })
                      }
                      className="accent-[#C93442] w-4 h-4 rounded"
                    />
                  </label>

                  {/* Show Quote */}
                  <label className="flex items-center justify-between text-xs font-serif text-[#40322F] cursor-pointer py-0.5">
                    <span>Hiện câu trích dẫn lãng mạn</span>
                    <input
                      type="checkbox"
                      checked={activeChapter.showQuote !== false}
                      onChange={(e) =>
                        updateChapter(activeChapterId, { showQuote: e.target.checked })
                      }
                      className="accent-[#C93442] w-4 h-4 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

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
                className="p-1 rounded-full hover:bg-black/5 text-[#40322F]/60 hover:text-[#40322F] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 flex-1 bg-[#FAF5EE]/40">
              {allProjectPhotos.map((photo) => {
                const isSelected = project.endingPhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setEndingPhoto({ endingPhotoId: photo.id });
                      setIsEndingPickerOpen(false);
                    }}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C93442] ring-2 ring-[#C93442]/40 shadow-lg scale-95'
                        : 'border-[#C5A16E]/30 hover:border-[#C93442] hover:shadow-md'
                    }`}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.title || 'Wedding moment'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] text-white font-serif truncate">
                      <div className="font-semibold truncate">{photo.title || 'Khoảnh khắc'}</div>
                      <div className="text-amber-200 text-[9px] truncate">{photo.chapterTitle}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C93442] text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#C5A16E]/20 bg-white/70 flex justify-end">
              <button
                type="button"
                onClick={() => setIsEndingPickerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#C93442] text-white text-xs font-serif font-semibold cursor-pointer"
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
