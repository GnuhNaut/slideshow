import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TimelineScene } from '../types/timeline';
import { PhotoItem } from '../types/project';
import { masterClock } from '../player/PlaybackClock';
import {
  getTrackPosition,
  calculateItemDimensions,
  calculateCumulativeOffsets,
  getVisibleItems,
  VisibleFilmItem,
} from './filmstripMath';

interface FilmRollSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
  isDual?: boolean;
}

export const FilmRollScene: React.FC<FilmRollSceneProps> = ({
  scene,
  isDual = false,
}) => {
  const photos = scene.photos;
  const config = scene.config || {};

  const showCenterTitle = config.showCenterTitle !== false;
  const showCenterNames = config.showCenterNames === true; // Default FALSE (User directive)
  const showFrameNames = config.showFrameNames === true;   // Default FALSE (User directive)
  const showMetadata35mm = config.showMetadata35mm === true;// Default FALSE (User directive)
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

      {/* Chapter Kicker Pill */}
      <div className="absolute top-7 left-10 z-30 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-[#C5A16E]/30 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#40322F] font-serif font-semibold">
            {scene.chapterTitle || 'CHƯƠNG II • NHỮNG NGÀY BÊN NHAU'}
          </span>
        </div>
      </div>

      {isDual ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-between py-6">
          {/* Top Film Strip (Right to Left) */}
          <div className="relative w-full flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={topPhotos}
              direction="rtl"
              speedPxPerSec={config.speed || 48}
              sceneStartTime={scene.startTime}
              showFrameNames={showFrameNames}
              showMetadata35mm={showMetadata35mm}
              coupleNames={coupleNames}
            />
          </div>

          {/* Centerpiece Editorial Title & Quote Bridge */}
          {(showCenterTitle || showCenterNames || (showQuote && config.quote)) && (
            <div className="relative z-20 w-full flex flex-col items-center justify-center my-1 pointer-events-none px-6">
              <div className="flex flex-col items-center max-w-xl text-center py-2 px-6 rounded-xl bg-white/70 backdrop-blur-md border border-[#C5A16E]/25 shadow-sm">
                {showCenterTitle && (
                  <h2 className="text-base md:text-lg lg:text-xl font-serif font-medium text-[#40322F] tracking-wide">
                    {config.textTitle || 'Những Ngày Bên Nhau'}
                  </h2>
                )}

                {showCenterNames && (
                  <div className="text-[11px] font-sans font-bold tracking-[0.3em] text-[#C93442] uppercase mt-0.5">
                    {coupleNames}
                  </div>
                )}

                {showQuote && config.quote && (
                  <p className="text-xs md:text-sm text-[#40322F]/80 font-serif italic tracking-wide mt-1 line-clamp-2">
                    "{config.quote}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Film Strip (Left to Right) */}
          <div className="relative w-full flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={bottomPhotos.length > 0 ? bottomPhotos : topPhotos}
              direction="ltr"
              speedPxPerSec={(config.speed || 48) * 0.92}
              sceneStartTime={scene.startTime}
              showFrameNames={showFrameNames}
              showMetadata35mm={showMetadata35mm}
              coupleNames={coupleNames}
            />
          </div>
        </div>
      ) : (
        /* Single Continuous Film Ribbon */
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center overflow-hidden py-8">
          <VirtualizedFilmTrack
            photos={photos}
            direction="rtl"
            speedPxPerSec={config.speed || 55}
            sceneStartTime={scene.startTime}
            isSingleLarge={true}
            showFrameNames={showFrameNames}
            showMetadata35mm={showMetadata35mm}
            coupleNames={coupleNames}
          />

          {showQuote && config.quote && (
            <div className="absolute bottom-6 z-20 px-8 py-2 rounded-full bg-white/85 border border-[#C5A16E]/30 backdrop-blur-md shadow-md">
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

interface VirtualizedFilmTrackProps {
  photos: PhotoItem[];
  direction: 'rtl' | 'ltr';
  speedPxPerSec: number;
  sceneStartTime: number;
  isSingleLarge?: boolean;
  showFrameNames: boolean;
  showMetadata35mm: boolean;
  coupleNames: string;
}

const VirtualizedFilmTrack: React.FC<VirtualizedFilmTrackProps> = ({
  photos,
  direction,
  speedPxPerSec,
  sceneStartTime,
  isSingleLarge = false,
  showFrameNames,
  showMetadata35mm,
  coupleNames,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(1920);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  // ResizeObserver to accurately measure viewport width
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 1920);
      }
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute layout dimensions for each photo based on natural aspect ratio
  const frameHeight = isSingleLarge ? 320 : 210;
  const gap = 24;

  const itemDimensions = useMemo(() => {
    return calculateItemDimensions(photos, frameHeight);
  }, [photos, frameHeight]);

  // Compute cumulative offset table for O(1) positioning
  const { offsets, singleLoopWidth } = useMemo(() => {
    return calculateCumulativeOffsets(itemDimensions, gap);
  }, [itemDimensions, gap]);

  // Compute initial camera position synchronously for zero-delay first render
  const initialCameraX = useMemo(() => {
    if (singleLoopWidth <= 1) return 0;
    const initialElapsed = Math.max(0, masterClock.getCurrentTime() - sceneStartTime);
    const { cameraX } = getTrackPosition(initialElapsed, speedPxPerSec, singleLoopWidth, direction);
    return cameraX;
  }, [sceneStartTime, speedPxPerSec, singleLoopWidth, direction]);

  // State to hold the camera position for virtual DOM window slicing
  const [virtualCameraX, setVirtualCameraX] = useState(initialCameraX);
  const lastUpdateCameraXRef = useRef(initialCameraX);
  const lastTimeRef = useRef(masterClock.getCurrentTime());
  const decodedUrlsRef = useRef<Set<string>>(new Set());

  // Connect directly to masterClock frame tick (60 FPS without React re-render of tree!)
  useEffect(() => {
    const unsub = masterClock.onFrame((currentTime) => {
      if (!trackRef.current || singleLoopWidth <= 1) return;

      const elapsedInScene = Math.max(0, currentTime - sceneStartTime);
      const { translateX, cameraX } = getTrackPosition(
        elapsedInScene,
        speedPxPerSec,
        singleLoopWidth,
        direction
      );

      trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;

      // Detect wrap, seek, or continuous scroll beyond threshold
      const isWrapOrSeek =
        Math.abs(currentTime - lastTimeRef.current) > 0.2 ||
        Math.abs(cameraX - lastUpdateCameraXRef.current) > 100;

      lastTimeRef.current = currentTime;

      if (isWrapOrSeek) {
        lastUpdateCameraXRef.current = cameraX;
        setVirtualCameraX(cameraX);
      }
    });

    return () => unsub();
  }, [sceneStartTime, speedPxPerSec, singleLoopWidth, direction]);

  // Compute the bounded virtual window of items (covers viewport + lookahead buffer)
  const visibleItems: VisibleFilmItem[] = useMemo(() => {
    const bufferPx = Math.max(1200, Math.round(containerWidth * 0.7));
    return getVisibleItems(
      virtualCameraX,
      containerWidth,
      bufferPx,
      photos,
      offsets,
      itemDimensions,
      singleLoopWidth,
      direction
    );
  }, [photos, offsets, itemDimensions, singleLoopWidth, virtualCameraX, containerWidth, direction]);

  // Bounded image preloading and decoding cache
  useEffect(() => {
    if (visibleItems.length === 0) return;
    visibleItems.forEach((item) => {
      const url = item.photo.url;
      if (url && typeof Image !== 'undefined' && !decodedUrlsRef.current.has(url)) {
        decodedUrlsRef.current.add(url);
        if (decodedUrlsRef.current.size > 200) {
          const firstKey = decodedUrlsRef.current.values().next().value;
          if (firstKey) decodedUrlsRef.current.delete(firstKey);
        }
        const img = new Image();
        img.src = url;
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {});
        }
      }
    });
  }, [visibleItems]);

  const handleImageError = (id: string) => {
    setFailedImageIds((prev) => new Set(prev).add(id));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-[#C5A16E]/70 italic font-serif">
        Chưa có ảnh trong cuộn phim
      </div>
    );
  }

  const hasFooter = showFrameNames || showMetadata35mm;
  const cardExtraPadding = hasFooter ? 24 : 12;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col justify-center select-none overflow-hidden"
    >
      {/* 35mm Top Perforation Track */}
      <div className="w-full h-3 bg-[#F3E9DD] film-sprocket-track border-y border-[#C5A16E]/25" />

      {/* Film Strip Track with True DOM Windowing */}
      <div
        className="relative overflow-hidden"
        style={{ height: `${frameHeight + cardExtraPadding + 24}px` }}
      >
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 h-full will-change-transform"
          style={{ width: `${singleLoopWidth * 3}px` }}
        >
          {visibleItems.map((item) => {
            const isFailed = failedImageIds.has(item.photo.id);
            const photo = item.photo;

            // Intelligent crop resolution:
            // If cropMode is 'contain', or if aspect ratio is < 0.95 (portrait/standing/selfie) and not explicitly 'cover',
            // use 'contain' so neither heads nor feet are sliced off!
            const isPortrait = (photo.aspectRatio || 1) < 0.95;
            const useContain = photo.cropMode === 'contain' || (isPortrait && photo.cropMode !== 'cover');

            const focalX = photo.focalPoint ? `${photo.focalPoint.x}%` : '50%';
            const focalY = photo.focalPoint ? `${photo.focalPoint.y}%` : '50%';

            return (
              <div
                key={item.key}
                className="absolute top-2 p-2.5 bg-white border border-[#C5A16E]/30 rounded-[2px] luxury-shadow-md flex flex-col justify-between"
                style={{
                  left: `${item.absoluteX}px`,
                  width: `${item.width}px`,
                  height: `${frameHeight + cardExtraPadding}px`,
                }}
              >
                <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] flex items-center justify-center relative">
                  {!isFailed ? (
                    <img
                      src={photo.url}
                      alt={photo.title || 'Wedding Memory'}
                      className={`w-full h-full pointer-events-none ${
                        useContain ? 'object-contain' : 'object-cover'
                      }`}
                      style={{
                        objectPosition: `${focalX} ${focalY}`,
                      }}
                      loading="eager"
                      decoding="async"
                      onError={() => handleImageError(photo.id)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2 text-[#C5A16E]">
                      <span className="font-serif text-xs italic">
                        {photo.title || 'Kỷ niệm yêu thương'}
                      </span>
                    </div>
                  )}
                  {/* Subtle inner photo border */}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
                </div>

                {/* Optional Minimalist 35mm Film Footer Stamp (Default OFF) */}
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
      <div className="w-full h-3 bg-[#F3E9DD] film-sprocket-track border-y border-[#C5A16E]/25" />
    </div>
  );
};
