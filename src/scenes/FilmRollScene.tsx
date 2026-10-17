import React, { useRef, useLayoutEffect, useMemo, useState } from 'react';
import { TimelineScene } from '../types/timeline';
import { PhotoItem } from '../types/project';
import { masterClock } from '../player/PlaybackClock';
import {
  getTrackPosition,
  calculateItemDimensions,
  calculateCumulativeOffsets,
  ItemDimension,
} from './filmstripMath';

interface FilmRollSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
  isDual?: boolean;
}

interface ViewportSize {
  width: number;
  height: number;
}

const readViewport = (): ViewportSize => ({
  width: typeof window === 'undefined' ? 1920 : Math.max(320, window.innerWidth),
  height: typeof window === 'undefined' ? 1080 : Math.max(320, window.innerHeight),
});

function usePresentationViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(readViewport);

  useLayoutEffect(() => {
    let frameId: number | null = null;

    const updateViewport = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const next = readViewport();
        setViewport((current) =>
          current.width === next.width && current.height === next.height ? current : next
        );
      });
    };

    window.addEventListener('resize', updateViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('resize', updateViewport);
    };
  }, []);

  return viewport;
}

const FilmRollSceneComponent: React.FC<FilmRollSceneProps> = ({
  scene,
  isDual = false,
}) => {
  const photos = scene.photos;
  const config = scene.config || {};
  const viewport = usePresentationViewport();
  const compactLayout = viewport.width < 640 || viewport.height < 560;

  const trackMetrics = useMemo(() => {
    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));
    const dualHeight = Math.round(
      clamp(viewport.height * (compactLayout ? 0.235 : 0.31), compactLayout ? 112 : 160, 400)
    );
    const singleHeight = Math.round(
      clamp(Math.min(viewport.height * 0.58, viewport.width * 0.72), 190, 520)
    );

    return {
      dualHeight,
      singleHeight,
      gap: compactLayout ? 8 : 14,
      padding: compactLayout ? 4 : 6,
    };
  }, [compactLayout, viewport.height, viewport.width]);

  const showCenterTitle = config.showCenterTitle !== false;
  const showCenterNames = config.showCenterNames === true;
  const showFrameNames = config.showFrameNames === true;
  const showMetadata35mm = config.showMetadata35mm === true;
  const showQuote = config.showQuote !== false;
  const coupleNames = config.coupleNames || 'TUẤN HÙNG & SAO MAI';

  // Split photos into top and bottom tracks if dual
  const { topPhotos, bottomPhotos } = useMemo(() => {
    if (!isDual || photos.length < 4) {
      return { topPhotos: photos, bottomPhotos: [] };
    }
    const half = Math.ceil(photos.length / 2);
    return {
      topPhotos: photos.slice(0, half),
      bottomPhotos: photos.slice(half),
    };
  }, [photos, isDual]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] perspective-cinema select-none">
      {/* Radiant warm luxury background atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-[#FFF9F2]/60 to-[#FFF9F2] pointer-events-none" />

      {/* Decorative Corner Accents */}
      <div className="absolute inset-6 border border-[#C5A16E]/20 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#C5A16E]/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#C5A16E]/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#C5A16E]/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#C5A16E]/60" />
      </div>

      {isDual ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-between py-2 sm:py-4 md:py-5">
          {/* Top Film Strip (Right to Left) */}
          <div className="relative w-full flex-1 flex items-center overflow-hidden">
            <ContinuousFilmTrack
              photos={topPhotos}
              direction="rtl"
              speedPxPerSec={config.speed || 48}
              sceneStartTime={scene.startTime}
              showFrameNames={showFrameNames}
              showMetadata35mm={showMetadata35mm}
              coupleNames={coupleNames}
              frameHeight={trackMetrics.dualHeight}
              gap={trackMetrics.gap}
              cardPadding={trackMetrics.padding}
              viewportWidth={viewport.width}
            />
          </div>

          {/* Centerpiece Editorial Title & Quote Bridge */}
          {(showCenterTitle || showCenterNames || (showQuote && config.quote)) && (
            <div className="relative z-20 w-full flex flex-col items-center justify-center my-0.5 sm:my-1 pointer-events-none px-3 sm:px-6">
              <div className="flex max-w-[min(92vw,780px)] flex-col items-center rounded-xl border border-[#C5A16E]/30 bg-white/95 px-4 py-2 text-center shadow-md sm:px-8 sm:py-2.5">
                {showCenterTitle && (
                  <h2 className="font-serif text-[clamp(1rem,1.25vw,1.6rem)] font-medium tracking-wide text-[#40322F]">
                    {config.textTitle || scene.chapterTitle || 'Những ngày mình đã có nhau'}
                  </h2>
                )}

                {showCenterNames && (
                  <div className="text-[11px] font-sans font-bold tracking-[0.3em] text-[#C93442] uppercase mt-0.5">
                    {coupleNames}
                  </div>
                )}

                {showQuote && config.quote && (
                  <p className={`mt-1 line-clamp-2 font-serif text-[clamp(0.7rem,0.7vw,1rem)] italic tracking-wide text-[#40322F]/85 ${viewport.height < 500 ? 'hidden' : ''}`}>
                    "{config.quote}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Film Strip (Left to Right) */}
          <div className="relative w-full flex-1 flex items-center overflow-hidden">
            <ContinuousFilmTrack
              photos={bottomPhotos}
              direction="ltr"
              speedPxPerSec={config.speed || 48}
              sceneStartTime={scene.startTime}
              showFrameNames={showFrameNames}
              showMetadata35mm={showMetadata35mm}
              coupleNames={coupleNames}
              frameHeight={trackMetrics.dualHeight}
              gap={trackMetrics.gap}
              cardPadding={trackMetrics.padding}
              viewportWidth={viewport.width}
            />
          </div>
        </div>
      ) : (
        /* Single Film Strip: Centered Large Viewport */
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
          {/* Top Minimalist Chapter Indicator */}
          {showCenterTitle && (
            <div className="absolute top-8 z-20 text-center pointer-events-none px-4">
              <h2 className="text-lg md:text-2xl font-serif font-medium text-[#40322F] tracking-wide drop-shadow-sm">
                {config.textTitle || scene.chapterTitle || 'Những ngày mình đã có nhau'}
              </h2>
              {showCenterNames && (
                <div className="text-xs font-sans font-bold tracking-[0.3em] text-[#C93442] uppercase mt-1">
                  {coupleNames}
                </div>
              )}
            </div>
          )}

          <ContinuousFilmTrack
            photos={photos}
            direction="rtl"
            speedPxPerSec={config.speed || 52}
            sceneStartTime={scene.startTime}
            showFrameNames={showFrameNames}
            showMetadata35mm={showMetadata35mm}
            coupleNames={coupleNames}
            frameHeight={trackMetrics.singleHeight}
            gap={trackMetrics.gap}
            cardPadding={trackMetrics.padding}
            viewportWidth={viewport.width}
          />

          {showQuote && config.quote && (
            <div className="absolute bottom-6 z-20 px-8 py-2.5 rounded-full bg-white/95 border border-[#C5A16E]/30 shadow-md">
              <p className="text-xs md:text-sm text-[#40322F] font-serif italic tracking-wide text-center">
                "{config.quote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filmstrip motion is driven directly by masterClock. Ignore the throttled
// React progress prop so the large strip tree is not reconciled at 10 Hz.
export const FilmRollScene = React.memo(
  FilmRollSceneComponent,
  (previous, next) =>
    previous.scene === next.scene &&
    (previous.isDual ?? false) === (next.isDual ?? false)
);

FilmRollScene.displayName = 'FilmRollScene';

interface ContinuousFilmTrackProps {
  photos: PhotoItem[];
  direction: 'rtl' | 'ltr';
  speedPxPerSec: number;
  sceneStartTime: number;
  showFrameNames: boolean;
  showMetadata35mm: boolean;
  coupleNames: string;
  frameHeight: number;
  gap: number;
  cardPadding: number;
  viewportWidth: number;
}

/**
 * 60 FPS Zero-Lag Film Track
 * Mounts fixed repeated items with object-cover and moves via hardware-accelerated translate3d.
 * Never calls setState during requestAnimationFrame, eliminating 100% of stutter and lag.
 */
const ContinuousFilmTrack: React.FC<ContinuousFilmTrackProps> = ({
  photos,
  direction,
  speedPxPerSec,
  sceneStartTime,
  showFrameNames,
  showMetadata35mm,
  coupleNames,
  frameHeight,
  gap,
  cardPadding,
  viewportWidth,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const minCardWidth = viewportWidth < 640 ? Math.max(112, Math.round(viewportWidth * 0.34)) : 180;
  const maxCardWidth = viewportWidth < 640 ? Math.max(220, Math.round(viewportWidth * 0.86)) : 560;

  const itemDimensions: ItemDimension[] = useMemo(() => {
    return calculateItemDimensions(photos, frameHeight, minCardWidth, maxCardWidth).map((dimension) => ({
      ...dimension,
      width: dimension.width + cardPadding * 2,
    }));
  }, [photos, frameHeight, minCardWidth, maxCardWidth, cardPadding]);

  const { offsets, singleLoopWidth } = useMemo(() => {
    return calculateCumulativeOffsets(itemDimensions, gap);
  }, [itemDimensions, gap]);

  // Two loops are sufficient whenever one loop is wider than the viewport.
  // Add only the repetitions needed by the current presentation viewport;
  // this avoids eagerly mounting an arbitrary 8000px strip on 1080p screens.
  const loopCount = useMemo(() => {
    if (singleLoopWidth <= 1) return 1;
    return Math.max(2, Math.ceil(viewportWidth / singleLoopWidth) + 1);
  }, [singleLoopWidth, viewportWidth]);

  // Flatten repeated items
  const renderedItems = useMemo(() => {
    if (!photos || photos.length === 0 || singleLoopWidth <= 1) return [];

    const items: Array<{
      key: string;
      photo: PhotoItem;
      width: number;
      left: number;
      frameIndex: number;
      loopIndex: number;
    }> = [];

    let globalIndex = 1;
    for (let loop = 0; loop < loopCount; loop++) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const dim = itemDimensions[i] || { width: 260, height: frameHeight };
        const left = loop * singleLoopWidth + (offsets[i] || 0);

        items.push({
          key: `loop_${loop}_photo_${photo.id || i}`,
          photo,
          width: dim.width,
          left,
          frameIndex: globalIndex++,
          loopIndex: loop,
        });
      }
    }

    return items;
  }, [photos, loopCount, singleLoopWidth, itemDimensions, offsets, frameHeight]);

  const initialTranslateX = useMemo(() => {
    if (singleLoopWidth <= 1) return 0;
    const elapsed = Math.max(0, masterClock.getCurrentTime() - sceneStartTime);
    return getTrackPosition(elapsed, speedPxPerSec, singleLoopWidth, direction).translateX;
  }, [sceneStartTime, speedPxPerSec, singleLoopWidth, direction]);

  // Connect directly to masterClock before paint. The last-value guard is
  // important during the Ch1 -> Ch2 overlap: elapsed time for Ch2 is still 0,
  // so we avoid writing an identical transform on every RAF frame.
  useLayoutEffect(() => {
    if (singleLoopWidth <= 1) return;

    let lastTranslateX = Number.NaN;

    const unsub = masterClock.onFrame((currentTime) => {
      if (!trackRef.current) return;

      const elapsedInScene = Math.max(0, currentTime - sceneStartTime);
      const { translateX } = getTrackPosition(
        elapsedInScene,
        speedPxPerSec,
        singleLoopWidth,
        direction
      );

      if (Number.isFinite(lastTranslateX) && Math.abs(translateX - lastTranslateX) < 0.01) {
        return;
      }

      lastTranslateX = translateX;
      trackRef.current.style.transform = `translate3d(${translateX.toFixed(3)}px, 0, 0)`;
    });

    return () => unsub();
  }, [sceneStartTime, speedPxPerSec, singleLoopWidth, direction]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-[#C5A16E]/70 italic font-serif">
        Chưa có ảnh trong cuộn phim
      </div>
    );
  }

  const hasFooter = showFrameNames || showMetadata35mm;
  const footerHeight = hasFooter ? 18 : 0;
  const cardHeight = frameHeight + cardPadding * 2 + footerHeight;

  return (
    <div
      className="relative w-full flex flex-col justify-center select-none overflow-hidden"
      style={{ contain: 'layout paint' }}
    >
      {/* 35mm Top Perforation Track */}
      <div className="w-full h-3 bg-[#FCE8ED] film-sprocket-track border-y border-[#E77A93]/40" />

      {/* Film Strip Track with GPU-accelerated translate3d */}
      <div
        className="relative overflow-hidden"
        style={{ height: `${cardHeight + 12}px`, contain: 'layout paint' }}
      >
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 h-full will-change-transform flex"
          style={{
            width: `${singleLoopWidth * loopCount}px`,
            transform: `translate3d(${initialTranslateX.toFixed(3)}px, 0, 0)`,
            backfaceVisibility: 'hidden',
            contain: 'layout paint',
          }}
        >
          {renderedItems.map((item) => {
            const photo = item.photo;

            return (
              <div
                key={item.key}
                className="absolute top-1.5 p-1.5 bg-white border border-[#E77A93]/40 rounded-[2px] shadow-sm flex flex-col justify-between"
                style={{
                  left: `${item.left}px`,
                  width: `${item.width}px`,
                  height: `${cardHeight}px`,
                  contain: 'layout paint',
                }}
              >
                <div
                  className="w-full shrink-0 overflow-hidden rounded-[1px] bg-[#FAF5EE] flex items-center justify-center relative"
                  style={{ height: `${frameHeight}px` }}
                >
                  <img
                    src={photo.mediumUrl || photo.displayUrl || photo.url}
                    alt={photo.title || 'Wedding Memory'}
                    className="w-full h-full object-contain pointer-events-none"
                    loading={item.loopIndex <= 1 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={item.loopIndex === 0 ? 'high' : 'low'}
                    draggable={false}
                    style={{
                      objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                    }}
                  />
                  {/* Subtle inner photo border */}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
                </div>

                {/* Optional Minimalist 35mm Film Footer Stamp */}
                {hasFooter && (
                  <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-[#40322F]/55 tracking-wider">
                    {showMetadata35mm ? (
                      <span>35MM • #{item.frameIndex}</span>
                    ) : <span />}
                    {showFrameNames ? (
                      <span className="font-semibold">{coupleNames}</span>
                    ) : <span />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 35mm Bottom Perforation Track */}
      <div className="w-full h-3 bg-[#FCE8ED] film-sprocket-track border-y border-[#E77A93]/40" />
    </div>
  );
};
