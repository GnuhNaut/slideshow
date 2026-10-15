import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { mediaManager } from '../../media/mediaManager';

export const MediaLibrary: React.FC = () => {
  const activeChapterId = useWeddingStore((s) => s.activeChapterId);
  const activeChapter = useWeddingStore((s) =>
    s.project.chapters.find((ch) => ch.id === activeChapterId)
  );
  const selectedPhotoId = useWeddingStore((s) => s.selectedPhotoId);
  const setSelectedPhoto = useWeddingStore((s) => s.setSelectedPhoto);
  const addPhotosToChapter = useWeddingStore((s) => s.addPhotosToChapter);
  const removePhoto = useWeddingStore((s) => s.removePhoto);
  const updatePhoto = useWeddingStore((s) => s.updatePhoto);
  const reorderPhotos = useWeddingStore((s) => s.reorderPhotos);
  const chapters = useWeddingStore((s) => s.project.chapters);
  const movePhotoToChapter = useWeddingStore((s) => s.movePhotoToChapter);
  const projectId = useWeddingStore((s) => s.project.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  if (!activeChapter) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    e.target.value = '';
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadErrors([]);
    setUploadProgress({ done: 0, total: files.length });

    try {
      const startingOrder = activeChapter.photos.length;
      const { photos, errors } = await mediaManager.processBatchUpload(
        files,
        activeChapterId,
        projectId,
        startingOrder,
        (done, total) => {
          setUploadProgress({ done, total });
        }
      );

      if (photos.length > 0) {
        addPhotosToChapter(activeChapterId, photos);
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      }
    } catch (err) {
      console.error('Batch upload error:', err);
      setUploadErrors(['Đã xảy ra lỗi trong quá trình xử lý ảnh.']);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-44 border-t border-[#BFA47D]/15 bg-[#181314] flex flex-col p-2.5 shrink-0 select-none transition-colors ${
        isDragging ? 'bg-[#581E2C]/25 border-[#BFA47D]' : ''
      }`}
    >
      {/* Media Bar Header */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-[#F5EDE1] tracking-wide">
            ẢNH TRONG CHƯƠNG:
          </span>
          <span className="text-xs font-serif text-[#BFA47D] font-semibold">
            {activeChapter.vietnameseTitle}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#20181A] text-[#BFA47D]/80 border border-[#BFA47D]/20">
            {activeChapter.photos.length} ảnh
          </span>

          {/* Upload Progress Indicator */}
          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 ml-3 text-xs text-[#BFA47D] font-serif">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                Đang xử lý {uploadProgress.done}/{uploadProgress.total} ảnh (
                {Math.round((uploadProgress.done / uploadProgress.total) * 100)}%)...
              </span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#581E2C] hover:bg-[#722739] border border-[#BFA47D]/30 text-xs text-[#F5EDE1] font-medium cursor-pointer disabled:opacity-50 transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5 text-[#BFA47D]" />
            <span>Thêm ảnh vào chương</span>
          </button>
        </div>
      </div>

      {/* Upload Error Banner if any individual file had an issue */}
      {uploadErrors.length > 0 && (
        <div className="mb-2 px-3 py-1.5 rounded bg-rose-950/70 border border-rose-800 text-[11px] text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{uploadErrors.join(' ')}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadErrors([])}
            className="p-0.5 text-rose-300 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Photos Horizontal Filmstrip Grid */}
      <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1">
        {/* Upload Drop Target Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-28 h-28 rounded border border-dashed border-[#BFA47D]/40 hover:border-[#BFA47D] bg-[#20181A]/60 hover:bg-[#581E2C]/20 flex flex-col items-center justify-center p-2 cursor-pointer transition-colors text-center"
        >
          <UploadCloud className="w-5 h-5 text-[#BFA47D] mb-1 animate-pulse" />
          <span className="text-[10px] text-[#F5EDE1] font-medium">Thả ảnh vào đây</span>
          <span className="text-[8px] text-[#BFA47D]/50 mt-0.5">JPEG, PNG, WebP</span>
        </div>

        {/* Chapter Photo Cards */}
        {activeChapter.photos.map((photo, index) => {
          const isSelected = photo.id === selectedPhotoId;

          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              className={`group relative shrink-0 w-28 h-28 rounded overflow-hidden border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#BFA47D] ring-2 ring-[#BFA47D]/50 scale-[1.02] shadow-[0_4px_16px_rgba(191,164,125,0.3)]'
                  : 'border-[#BFA47D]/20 hover:border-[#BFA47D]/50 bg-[#20181A]'
              }`}
            >
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                }}
                loading="lazy"
              />

              {/* Order Badge */}
              <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/75 text-[9px] font-mono text-[#BFA47D]">
                #{index + 1}
              </div>

              {/* Hero Star Badge */}
              {photo.isHero && (
                <div className="absolute top-1 right-1 p-1 rounded-full bg-[#581E2C] border border-[#BFA47D] text-[#BFA47D] shadow">
                  <Star className="w-3 h-3 fill-[#BFA47D]" />
                </div>
              )}

              {/* Hover Control Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1.5 transition-opacity">
                {/* Top controls: Reorder arrows & hero toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index > 0) {
                          const prevPhoto = activeChapter.photos[index - 1];
                          reorderPhotos(activeChapterId, photo.id, prevPhoto.id);
                        }
                      }}
                      disabled={index === 0}
                      className="p-1 rounded bg-[#1C1718] text-[#BFA47D] hover:bg-[#581E2C] disabled:opacity-30 cursor-pointer"
                      title="Chuyển lên trước"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index < activeChapter.photos.length - 1) {
                          const nextPhoto = activeChapter.photos[index + 1];
                          reorderPhotos(activeChapterId, photo.id, nextPhoto.id);
                        }
                      }}
                      disabled={index === activeChapter.photos.length - 1}
                      className="p-1 rounded bg-[#1C1718] text-[#BFA47D] hover:bg-[#581E2C] disabled:opacity-30 cursor-pointer"
                      title="Chuyển xuống sau"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Toggle Hero */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePhoto(activeChapterId, photo.id, { isHero: !photo.isHero });
                    }}
                    className={`p-1 rounded cursor-pointer ${
                      photo.isHero ? 'bg-[#581E2C] text-[#BFA47D]' : 'bg-[#1C1718] text-[#BFA47D]/60'
                    }`}
                    title="Đặt làm ảnh nổi bật (Hero)"
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom controls: Move chapter & Delete */}
                <div className="flex items-center justify-between">
                  <select
                    value={activeChapterId}
                    onChange={(e) => {
                      e.stopPropagation();
                      movePhotoToChapter(activeChapterId, e.target.value, photo.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] bg-[#140F11] text-[#BFA47D] border border-[#BFA47D]/30 rounded px-1 py-0.5 max-w-[65px] truncate cursor-pointer"
                    title="Chuyển sang chương khác"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(activeChapterId, photo.id);
                    }}
                    className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
