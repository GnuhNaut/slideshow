import React from 'react';
import { TimelineScene } from '../../types/timeline';

interface WeddingStoryOverlayProps {
  scene: TimelineScene;
  featured?: boolean;
}

export const WeddingStoryOverlay: React.FC<WeddingStoryOverlayProps> = ({
  scene,
  featured = false,
}) => {
  const title = scene.config.textTitle || scene.chapterTitle;
  const description = scene.config.textSubtitle;
  const quote = scene.config.quote;

  if (!featured) {
    if (!quote) return null;

    return (
      <aside className="pointer-events-none absolute bottom-28 left-4 z-30 max-w-[calc(100vw-2rem)] sm:bottom-[10vh] sm:left-[4vw] sm:max-w-xl">
        <div className="border-l-2 border-[#F1D19A] bg-[#4A0914]/90 px-4 py-2.5 text-left text-white shadow-[0_14px_40px_-24px_rgba(0,0,0,0.8)] sm:px-5 sm:py-3">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.28em] text-[#F6D9A7] sm:text-[10px]">
            NGÀY MÌNH CHỌN NHAU
          </span>
          <p className="mt-1 font-serif text-sm italic leading-relaxed text-white/92 sm:text-base">
            “{quote}”
          </p>
        </div>
      </aside>
    );
  }

  return (
    <section className="pointer-events-none absolute bottom-28 left-1/2 z-30 w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 sm:bottom-[10vh] sm:w-[min(86vw,900px)]">
      <div className="relative overflow-hidden border border-[#F1D19A]/55 bg-[#560B18]/94 px-5 py-4 text-center text-white shadow-[0_22px_70px_-32px_rgba(51,4,12,0.9)] sm:px-10 sm:py-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFE7B5] to-transparent" />

        <div className="mb-1.5 flex items-center justify-center gap-3">
          <span className="h-px w-7 bg-[#F1D19A]/80 sm:w-12" />
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-[#F6D9A7] sm:text-[11px]">
             • NGÀY TRỌNG ĐẠI
          </span>
          <span className="h-px w-7 bg-[#F1D19A]/80 sm:w-12" />
        </div>

        <h2 className="font-serif text-2xl font-medium leading-tight tracking-[0.01em] sm:text-4xl lg:text-5xl">
          {title}
        </h2>

        {description && (
          <p className="mx-auto mt-1.5 max-w-3xl font-serif text-xs leading-relaxed text-white/88 sm:mt-2 sm:text-base lg:text-lg">
            {description}
          </p>
        )}

        {quote && quote !== description && (
          <p className="mx-auto mt-1.5 hidden max-w-2xl font-serif text-sm italic text-[#F6D9A7] sm:block">
            “{quote}”
          </p>
        )}
      </div>
    </section>
  );
};
