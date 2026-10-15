import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Plus,
  Trash2,
  Star,
  MoveRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { PhotoItem } from '../../types/project';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!activeChapter) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    e.target.value = '';
  };

  const processFiles = (files: File[]) => {
    const newPhotos: PhotoItem[] = [];

    files.forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newPhotos.push({
          id: `upload_${Date.now()}_${index}`,
          chapterId: activeChapterId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          url,
          originalWidth: img.naturalWidth || 1920,
          originalHeight: img.naturalHeight || 1080,
          aspectRatio: (img.naturalWidth || 1920) / (img.naturalHeight || 1080),
          cropMode: 'cover',
          focalPoint: { x: 50, y: 50 },
          isHero: activeChapter.photos.length === 0 && index === 0,
          order: activeChapter.photos.length + index,
          createdAt: Date.now() + index,
        });

        if (newPhotos.length === files.length) {
          addPhotosToChapter(activeChapterId, newPhotos);
        }
      };
      img.src = url;
    });
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
      className={`h-48 border-t border-[#ecd28f]/20 bg-[#151114] flex flex-col p-3 shrink-0 select-none transition-colors ${
        isDragging ? 'bg-[#81252D]/30 border-[#ecd28f]' : ''
      }`}
    >
      {/* Media Bar Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-[#FFF4E4] tracking-wide">
            ẢNH TRONG CHƯƠNG:
          </span>
          <span className="text-xs font-serif text-[#ecd28f] font-semibold">
            {activeChapter.vietnameseTitle}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e151b] text-[#ecd28f]/70 border border-[#ecd28f]/20">
            {activeChapter.photos.length} ảnh
          </span>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#81252D] hover:bg-[#691014] border border-[#ecd28f]/40 text-xs text-[#FFF4E4] font-medium transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5 text-[#ecd28f]" />
            <span>Thêm ảnh vào chương</span>
          </button>
        </div>
      </div>

      {/* Photos Horizontal Filmstrip Grid */}
      <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1">
        {/* Upload Drop Target Card */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-32 h-32 rounded-lg border-2 border-dashed border-[#ecd28f]/40 hover:border-[#ecd28f] bg-[#1a1317]/60 hover:bg-[#81252D]/20 flex flex-col items-center justify-center p-2 cursor-pointer transition-colors text-center"
        >
          <UploadCloud className="w-6 h-6 text-[#ecd28f] mb-1 animate-pulse" />
          <span className="text-[10px] text-[#FFF4E4] font-medium">Thả ảnh vào đây</span>
          <span className="text-[8px] text-[#ecd28f]/50 mt-0.5">JPEG, PNG, WebP</span>
        </div>

        {/* Chapter Photo Cards */}
        {activeChapter.photos.map((photo, index) => {
          const isSelected = photo.id === selectedPhotoId;

          return (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.id)}
              className={`group relative shrink-0 w-32 h-32 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#ecd28f] ring-2 ring-[#ecd28f]/50 scale-[1.02] shadow-[0_6px_20px_rgba(212,172,89,0.3)]'
                  : 'border-[#ecd28f]/20 hover:border-[#ecd28f]/60 bg-[#1e151b]'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                }}
              />

              {/* Order Number Badge */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-[#ecd28f]">
                #{index + 1}
              </div>

              {/* Hero Star Badge */}
              {photo.isHero && (
                <div className="absolute top-1 right-1 p-1 rounded-full bg-[#81252D] border border-[#ecd28f] text-[#ecd28f] shadow">
                  <Star className="w-3 h-3 fill-[#ecd28f]" />
                </div>
              )}

              {/* Hover Control Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-1.5 transition-opacity">
                {/* Top controls: Reorder arrows */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index > 0) {
                          const prevPhoto = activeChapter.photos[index - 1];
                          reorderPhotos(activeChapterId, photo.id, prevPhoto.id);
                        }
                      }}
                      disabled={index === 0}
                      className="p-1 rounded bg-[#1e151b] text-[#ecd28f] hover:bg-[#81252D] disabled:opacity-30"
                      title="Chuyển lên trước"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index < activeChapter.photos.length - 1) {
                          const nextPhoto = activeChapter.photos[index + 1];
                          reorderPhotos(activeChapterId, photo.id, nextPhoto.id);
                        }
                      }}
                      disabled={index === activeChapter.photos.length - 1}
                      className="p-1 rounded bg-[#1e151b] text-[#ecd28f] hover:bg-[#81252D] disabled:opacity-30"
                      title="Chuyển xuống sau"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Toggle Hero */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePhoto(activeChapterId, photo.id, { isHero: !photo.isHero });
                    }}
                    className={`p-1 rounded ${
                      photo.isHero ? 'bg-[#81252D] text-[#ecd28f]' : 'bg-[#1e151b] text-[#ecd28f]/60'
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
                    className="text-[9px] bg-[#120d10] text-[#ecd28f] border border-[#ecd28f]/30 rounded px-1 py-0.5 max-w-[70px] truncate"
                    title="Chuyển sang chương khác"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(activeChapterId, photo.id);
                    }}
                    className="p-1 rounded bg-rose-900/80 hover:bg-rose-700 text-white"
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
