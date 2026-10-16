import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TimelineScene } from '../types/timeline';
import { PhotoItem } from '../types/project';
import { masterClock } from '../player/PlaybackClock';

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
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] perspective-cinema">
      {/* Radiant warm background atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-[#FFF9F2]/60 to-[#FFF9F2] pointer-events-none" />

      {/* Chapter Kicker Pill */}
      <div className="absolute top-6 left-8 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-[#C5A16E]/30 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C93442]" />
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#40322F] font-serif font-semibold">
            {scene.chapterTitle}
          </span>
        </div>
      </div>

      {isDual ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-around py-4 gap-4">
          {/* Top Film Strip (Right to Left) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={topPhotos}
              direction="rtl"
              speedPxPerSec={scene.config.speed || 55}
              sceneStartTime={scene.startTime}
              rowLabel="35MM MEMORIES • REEL A"
            />
          </div>

          {/* Bottom Film Strip (Left to Right) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={bottomPhotos.length > 0 ? bottomPhotos : topPhotos}
              direction="ltr"
              speedPxPerSec={(scene.config.speed || 55) * 0.9}
              sceneStartTime={scene.startTime}
              rowLabel="35MM MEMORIES • REEL B"
            />
          </div>
        </div>
      ) : (
        /* Single Film Ribbon */
        <div className="relative z-10 w-full h-full flex items-center overflow-hidden py-6">
          <VirtualizedFilmTrack
            photos={photos}
            direction="rtl"
            speedPxPerSec={scene.config.speed || 60}
            sceneStartTime={scene.startTime}
            rowLabel="35MM CONTINUOUS FILM ROLL"
            isSingleLarge={true}
          />
        </div>
      )}

      {/* Chapter Editorial Quote */}
      {scene.config.quote && (
        <div className="absolute bottom-6 z-20 px-8 py-2.5 rounded-full bg-white/85 border border-[#C5A16E]/30 backdrop-blur-md shadow-md">
          <p className="text-xs md:text-sm text-[#40322F] font-serif italic tracking-wide text-center">
            "{scene.config.quote}"
          </p>
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
  rowLabel: string;
  isSingleLarge?: boolean;
}

import {
  getTrackPosition,
  calculateItemDimensions,
  calculateCumulativeOffsets,
  getVisibleItems,
  getRequiredMediaIds,
  VisibleFilmItem,
} from './filmstripMath';

interface VirtualizedFilmTrackProps {
  photos: PhotoItem[];
  direction: 'rtl' | 'ltr';
  speedPxPerSec: number;
  sceneStartTime: number;
  rowLabel: string;
  isSingleLarge?: boolean;
}

const VirtualizedFilmTrack: React.FC<VirtualizedFilmTrackProps> = ({
  photos,
  direction,
  speedPxPerSec,
  sceneStartTime,
  isSingleLarge = false,
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
  const frameHeight = isSingleLarge ? 320 : 230;
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

  // Bounded image preloading and decoding cache (prevents duplicate new Image() allocations)
  useEffect(() => {
    if (visibleItems.length === 0) return;
    visibleItems.forEach((item) => {
      const url = item.photo.url;
      if (url && typeof Image !== 'undefined' && !decodedUrlsRef.current.has(url)) {
        decodedUrlsRef.current.add(url);
        if (decodedUrlsRef.current.size > 200) {
          // Keep cache bounded
          const firstKey = decodedUrlsRef.current.values().next().value;
          if (firstKey) decodedUrlsRef.current.delete(firstKey);
        }
        const img = new Image();
        img.src = url;
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {
            // Non-fatal: browser will render normally on mount
          });
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

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col justify-center select-none overflow-hidden"
    >
      {/* 35mm Top Perforation Track */}
      <div className="w-full h-3.5 bg-[#F3E9DD] film-sprocket-track border-y border-[#C5A16E]/30" />

      {/* Film Strip Track with True DOM Windowing */}
      <div
        className="relative overflow-hidden"
        style={{ height: `${frameHeight + 48}px` }}
      >
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 h-full will-change-transform"
          style={{ width: `${singleLoopWidth * 3}px` }}
        >
          {visibleItems.map((item) => {
            const isFailed = failedImageIds.has(item.photo.id);
            return (
              <div
                key={item.key}
                className="absolute top-2 p-3 bg-white border border-[#C5A16E]/35 rounded-sm luxury-shadow-md flex flex-col justify-between"
                style={{
                  left: `${item.absoluteX}px`,
                  width: `${item.width}px`,
                  height: `${frameHeight + 24}px`,
                }}
              >
                <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] flex items-center justify-center">
                  {!isFailed ? (
                    <img
                      src={item.photo.url}
                      alt={item.photo.title || 'Wedding Memory'}
                      className="w-full h-full object-cover pointer-events-none"
                      loading="eager"
                      decoding="async"
                      onError={() => handleImageError(item.photo.id)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2 text-[#C5A16E]">
                      <span className="font-serif text-xs italic">
                        {item.photo.title || 'Kỷ niệm yêu thương'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Minimalist 35mm Film Footer Stamp */}
                <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-[#40322F]/50">
                  <span>35MM • #{item.frameIndex}</span>
                  <span>TUẤN HÙNG &amp; SAO MAI</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 35mm Bottom Perforation Track */}
      <div className="w-full h-3.5 bg-[#F3E9DD] film-sprocket-track border-y border-[#C5A16E]/30" />
    </div>
  );
};
