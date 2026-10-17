import React from 'react';
import { TimelineScene } from '../types/timeline';

interface FinalFreezeSceneProps {
  scene: TimelineScene;
  progress?: number;
  isPlaying?: boolean;
}

export const FinalFreezeScene: React.FC<FinalFreezeSceneProps> = ({ scene }) => {
  const photos = scene.photos || [];
  const config = scene.config || {};

  // The final folder is deliberately numbered. Restore that editorial order even
  // when endingPhotoId was promoted to the front by the timeline compiler.
  const displayPhotos = [...photos]
    .sort((a, b) => {
      const orderCompare = a.order - b.order;
      return (
        orderCompare ||
        (a.relativePath || '').localeCompare(b.relativePath || '', undefined, { numeric: true })
      );
    })
    .slice(0, 3);

  const coupleNames = config.coupleNames || 'TUẤN HÙNG & SAO MAI';
  const title = config.textTitle || scene.chapterTitle || 'Ngày mình chọn nhau';
  const subtitle =
    config.textSubtitle ||
    'Giữa muôn ánh nhìn, chúng mình chỉ thấy bàn tay đang nắm chặt.';
  const dateStr = config.weddingDate || config.quote || '19.10.2026';

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#5D0B1A] select-none">
      {/* Full-bleed triptych: exactly three adjacent panels, with no padding or gap. */}
      <div className="absolute inset-0 grid grid-cols-3 gap-0">
        {displayPhotos.map((photo, idx) => (
          <figure
            key={photo.id || `ending_${idx}`}
            className="relative min-w-0 h-full overflow-hidden bg-[#7A1022]"
          >
            <img
              src={photo.displayUrl || photo.url}
              alt={photo.title || `Our Forever ${idx + 1}`}
              draggable={false}
              className="block w-full h-full object-cover brightness-[0.92] saturate-[0.94]"
              style={{
                objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
              }}
            />
          </figure>
        ))}
      </div>

      {/* A single cinematic wash unifies all three photographs without creating seams. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2B050C]/28 via-transparent to-[#21040B]/78 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/20 pointer-events-none" />

      <div className="absolute inset-x-0 top-[5vh] z-10 flex items-center justify-center gap-4 px-5 text-white">
        <span className="h-px w-10 md:w-20 bg-white/55" />
        <span className="font-sans text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.32em] drop-shadow-lg">
          {coupleNames}
        </span>
        <span className="h-px w-10 md:w-20 bg-white/55" />
      </div>

      <div className="absolute inset-x-0 bottom-[5vh] z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center text-white">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-none tracking-[0.02em] drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-sm sm:text-base md:text-xl text-white/90 leading-relaxed drop-shadow-lg">
          {subtitle}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-px w-8 md:w-14 bg-[#F1D19A]/80" />
          <span className="font-sans text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.28em] text-[#FFE8BC] drop-shadow-lg">
            {dateStr}
          </span>
          <span className="h-px w-8 md:w-14 bg-[#F1D19A]/80" />
        </div>
      </div>
    </div>
  );
};
