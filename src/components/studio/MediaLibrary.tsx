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
    } catch (err: any) {
      setUploadErrors([err.message || 'Lỗi khi tải ảnh']);
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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-40 bg-white border-t border-[#C5A16E]/20 px-4 py-2 flex flex-col justify-between shrink-0 select-none z-20 transition-colors ${
        isDragging ? 'bg-[#FFF9F2] ring-2 ring-[#C93442] ring-inset' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-[#40322F]">
            KHO ẢNH {activeChapter.vietnameseTitle.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#40322F]/60">
            ({activeChapter.photos.length} bức ảnh)
          </span>

          {/* Upload Progress Indicator */}
          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 ml-3 text-xs text-[#C93442] font-serif">
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C93442] hover:bg-[#9B222E] text-xs text-white font-medium cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ảnh vào chương</span>
          </button>
        </div>
      </div>

      {/* Upload Error Banner if any individual file had an issue */}
      {uploadErrors.length > 0 && (
        <div className="mb-2 px-3 py-1.5 rounded bg-rose-50 border border-rose-300 text-[11px] text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{uploadErrors.join(' ')}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadErrors([])}
            className="p-0.5 text-rose-600 hover:text-rose-900"
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
          className="shrink-0 w-24 h-24 rounded border border-dashed border-[#C5A16E]/50 hover:border-[#C93442] bg-[#FAF5EE] hover:bg-[#FFF9F2] flex flex-col items-center justify-center p-2 cursor-pointer transition-colors text-center"
        >
          <UploadCloud className="w-5 h-5 text-[#C93442] mb-1" />
          <span className="text-[10px] text-[#40322F] font-medium">Thả ảnh vào</span>
          <span className="text-[8px] text-[#40322F]/50 mt-0.5">JPEG, PNG, WebP</span>
        </div>

        {/* Empty Chapter Helper Note */}
        {activeChapter.photos.length === 0 && (
          <div className="flex flex-col justify-center px-3 py-2 text-left">
            <span className="text-xs font-serif font-medium text-[#40322F]">
              Chưa có ảnh trong chương này
            </span>
            <span className="text-[10px] text-[#40322F]/70 font-mono mt-0.5">
              Chép ảnh vào thư mục: <strong className="text-[#C93442]">public/gallery/{activeChapter.folderName || '...'}/</strong>
            </span>
            <span className="text-[10px] text-[#C5A16E] italic mt-0.5">
              (Gợi ý: đặt tên 001.jpg, 002.jpg... Hệ thống sẽ tự nhận dạng theo thứ tự số tự nhiên)
            </span>
          </div>
        )}

        {/* Chapter Photo Cards */}
        {activeChapter.photos.map((photo, index) => {
          const isSelected = photo.id === selectedPhotoId;

          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              className={`group relative shrink-0 w-24 h-24 rounded overflow-hidden border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#C93442] ring-2 ring-[#C93442]/50 scale-[1.02] shadow-md'
                  : 'border-[#C5A16E]/30 hover:border-[#C5A16E] bg-white'
              }`}
            >
              <img
                src={photo.thumbnail || photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                }}
                onError={(e) => {
                  if (photo.url && e.currentTarget.src !== photo.url) {
                    e.currentTarget.src = photo.url;
                  }
                }}
                loading="lazy"
              />

              {/* Order Badge */}
              <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono text-white">
                #{index + 1}
              </div>

              {/* Hero Star Badge */}
              {photo.isHero && (
                <div className="absolute top-1 right-1 p-1 rounded-full bg-[#C93442] text-white shadow">
                  <Star className="w-2.5 h-2.5 fill-white" />
                </div>
              )}

              {/* Hover Control Overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1.5 transition-opacity">
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
                      className="p-1 rounded bg-black/60 text-white hover:bg-[#C93442] disabled:opacity-30 cursor-pointer"
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
                      className="p-1 rounded bg-black/60 text-white hover:bg-[#C93442] disabled:opacity-30 cursor-pointer"
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
                      photo.isHero ? 'bg-[#C93442] text-white' : 'bg-black/60 text-white/70'
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
                    className="text-[9px] bg-black/80 text-white border border-white/20 rounded px-1 py-0.5 max-w-[55px] truncate cursor-pointer"
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
                    className="p-1 rounded bg-rose-600/90 hover:bg-rose-700 text-white cursor-pointer"
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
