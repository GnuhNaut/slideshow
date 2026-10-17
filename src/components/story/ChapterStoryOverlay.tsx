import React from 'react';
import { TimelineScene } from '../../types/timeline';

interface ChapterStoryOverlayProps {
  scene: TimelineScene;
  chapterLabel: string;
  variant: 'side' | 'banner';
}

export const ChapterStoryOverlay: React.FC<ChapterStoryOverlayProps> = ({
  scene,
  chapterLabel,
  variant,
}) => {
  const title = scene.config.textTitle || scene.chapterTitle;
  const description = scene.config.textSubtitle;
  const quote = scene.config.quote;

  const placement =
    variant === 'side'
      ? 'left-4 right-4 bottom-24 sm:left-[5vw] sm:right-auto sm:top-1/2 sm:bottom-auto sm:w-[min(34vw,470px)] sm:-translate-y-1/2'
      : 'left-4 right-4 top-4 sm:left-1/2 sm:right-auto sm:top-[4.5vh] sm:w-[min(78vw,860px)] sm:-translate-x-1/2';

  return (
    <section
      className={`pointer-events-none absolute z-30 ${placement}`}
      aria-label={`${chapterLabel}: ${title}`}
    >
      <div
        className={`border border-[#C5A16E]/45 bg-[#FFFDF9]/95 shadow-[0_18px_60px_-28px_rgba(64,50,47,0.45)] ${
          variant === 'side'
            ? 'rounded-sm px-5 py-5 text-left sm:px-7 sm:py-7'
            : 'rounded-sm px-5 py-3.5 text-center sm:px-9 sm:py-5'
        }`}
      >
        <div
          className={`mb-2 flex items-center gap-3 ${variant === 'banner' ? 'justify-center' : ''}`}
        >
          <span className="h-px w-7 bg-[#C93442] sm:w-10" />
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.28em] text-[#C93442] sm:text-[11px]">
            {chapterLabel}
          </span>
        </div>

        <h2
          className={`font-serif font-medium leading-[1.05] tracking-[-0.01em] text-[#40322F] ${
            variant === 'side'
              ? 'text-3xl sm:text-4xl lg:text-5xl'
              : 'text-2xl sm:text-3xl lg:text-4xl'
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-2 font-serif leading-relaxed text-[#5F4943] ${
              variant === 'side'
                ? 'text-sm sm:mt-3 sm:text-base lg:text-lg'
                : 'text-xs sm:mt-2.5 sm:text-base'
            }`}
          >
            {description}
          </p>
        )}

        {quote && quote !== description && (
          <p className="mt-2 hidden font-serif text-xs italic tracking-wide text-[#9B7069] sm:mt-3 sm:block sm:text-sm">
            “{quote}”
          </p>
        )}
      </div>
    </section>
  );
};
