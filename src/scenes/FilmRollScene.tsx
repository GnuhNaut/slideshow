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
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-[#1C1718]">
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C1718] via-[#2A1E24]/40 to-[#1C1718] pointer-events-none" />

      {/* Chapter Kicker Pill */}
      <div className="absolute top-6 left-8 z-20 pointer-events-none">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#BFA47D] font-serif font-semibold">
          {scene.chapterTitle}
        </span>
      </div>

      {isDual ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-around py-4 gap-2">
          {/* Top Film Strip (Right to Left) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={topPhotos}
              direction="rtl"
              speedPxPerSec={scene.config.speed || 48}
              sceneStartTime={scene.startTime}
              rowLabel="35MM MEMORIES • STRIP A"
            />
          </div>

          {/* Bottom Film Strip (Left to Right) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <VirtualizedFilmTrack
              photos={bottomPhotos.length > 0 ? bottomPhotos : topPhotos}
              direction="ltr"
              speedPxPerSec={(scene.config.speed || 48) * 0.9}
              sceneStartTime={scene.startTime}
              rowLabel="35MM MEMORIES • STRIP B"
            />
          </div>
        </div>
      ) : (
        /* Single Giant Film Strip */
        <div className="relative z-10 w-full h-full flex items-center overflow-hidden py-6">
          <VirtualizedFilmTrack
            photos={photos}
            direction="rtl"
            speedPxPerSec={scene.config.speed || 48}
            sceneStartTime={scene.startTime}
            rowLabel="35MM CONTINUOUS FILM ROLL"
            isSingleLarge={true}
          />
        </div>
      )}

      {/* Chapter Editorial Quote */}
      {scene.config.quote && (
        <div className="absolute bottom-5 z-20 px-6 py-2 rounded-full bg-[#1C1718]/85 border border-[#BFA47D]/30 backdrop-blur-md shadow-xl">
          <p className="text-xs md:text-sm text-[#F5EDE1] font-serif italic tracking-wide text-center">
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

const VirtualizedFilmTrack: React.FC<VirtualizedFilmTrackProps> = ({
  photos,
  direction,
  speedPxPerSec,
  sceneStartTime,
  rowLabel,
  isSingleLarge = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(1920);

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
  // Landscape: ~340px (or 440px if single large), Portrait: ~230px (or 290px), Square: ~280px
  const frameHeight = isSingleLarge ? 300 : 220;
  const gap = 24;

  const itemDimensions = useMemo(() => {
    return photos.map((p) => {
      let width = Math.round(frameHeight * (p.aspectRatio || 1.33));
      // Clamp reasonable widths to prevent extreme horizontal stretching
      width = Math.max(180, Math.min(width, 480));
      return { width, height: frameHeight };
    });
  }, [photos, frameHeight]);

  // Total cumulative width of one complete set of photos + gaps
  const singleLoopWidth = useMemo(() => {
    if (itemDimensions.length === 0) return 1;
    return itemDimensions.reduce((acc, dim) => acc + dim.width + gap, 0);
  }, [itemDimensions, gap]);

  // Number of repeats needed to fill screen plus buffer for seamless continuous scrolling
  const repeatCount = useMemo(() => {
    if (singleLoopWidth <= 1) return 1;
    // We need at least (containerWidth + singleLoopWidth * 2) width of items
    return Math.max(3, Math.ceil((containerWidth * 2.5) / singleLoopWidth) + 1);
  }, [containerWidth, singleLoopWidth]);

  // Connect directly to masterClock frame tick (60 FPS without React re-render of tree!)
  useEffect(() => {
    const unsub = masterClock.onFrame((currentTime) => {
      if (!trackRef.current || singleLoopWidth <= 1) return;

      const elapsedInScene = Math.max(0, currentTime - sceneStartTime);
      const totalPixelsScrolled = elapsedInScene * speedPxPerSec;

      // Monotonic wrap calculation
      const wrappedOffset = totalPixelsScrolled % singleLoopWidth;

      const translateX =
        direction === 'rtl' ? -wrappedOffset : wrappedOffset - singleLoopWidth;

      trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;
    });

    return () => unsub();
  }, [sceneStartTime, speedPxPerSec, singleLoopWidth, direction]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-[#BFA47D]/50 italic">
        Chưa có ảnh trong cuộn phim
      </div>
    );
  }

  // Generate repeated list for continuous seamless window
  const repeatedItems: { photo: PhotoItem; width: number; key: string; frameIndex: number }[] = [];
  for (let r = 0; r < repeatCount; r++) {
    photos.forEach((photo, pIdx) => {
      repeatedItems.push({
        photo,
        width: itemDimensions[pIdx]?.width || 320,
        key: `strip_${r}_${photo.id}_${pIdx}`,
        frameIndex: pIdx + 1,
      });
    });
  }

  return (
    <div ref={containerRef} className="relative w-full flex flex-col justify-center select-none overflow-hidden">
      {/* 35mm Top Perforation Track */}
      <div className="w-full h-4 bg-[#140F11] film-sprocket-track border-y border-[#3A2933] flex items-center px-6 justify-between">
        <span className="text-[8px] tracking-[0.25em] text-[#BFA47D]/60 font-mono">
          {rowLabel}
        </span>
        <span className="text-[8px] tracking-[0.2em] text-[#BFA47D]/40 font-mono">
          35MM FILM EXP 36 • 400
        </span>
      </div>

      {/* Film Frames Track Container (Updated directly via style.transform in 60fps frame loop) */}
      <div
        ref={trackRef}
        className="flex items-center py-3 bg-[#181214] shadow-2xl will-change-transform"
        style={{
          gap: `${gap}px`,
          width: 'max-content',
        }}
      >
        {repeatedItems.map((item) => {
          const { photo, width, key, frameIndex } = item;

          return (
            <div
              key={key}
              className="relative shrink-0 flex flex-col items-center p-2 rounded-sm bg-[#1E1719] border border-[#BFA47D]/35 shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
              style={{
                width: `${width}px`,
                height: `${frameHeight + 36}px`,
              }}
            >
              {/* Photo Box with Contain/Cover Preserving Ratio */}
              <div
                className="relative w-full overflow-hidden rounded-sm bg-[#100B0D] border border-[#F5EDE1]/15"
                style={{ height: `${frameHeight}px` }}
              >
                <img
                  src={photo.url}
                  alt={photo.title || `Photo ${frameIndex}`}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                  }}
                  loading="lazy"
                />

                {/* Film Frame Vignette */}
                <div className="absolute inset-0 bg-radial from-transparent to-black/35 pointer-events-none" />

                {/* Hero Badge */}
                {photo.isHero && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#581E2C] border border-[#BFA47D] text-[9px] text-[#F5EDE1] font-serif tracking-wider shadow">
                    HERO
                  </div>
                )}
              </div>

              {/* Bottom Frame Details */}
              <div className="w-full mt-1.5 flex items-center justify-between px-1 text-[8px] text-[#BFA47D]/70 font-mono">
                <span>{`#${frameIndex < 10 ? `0${frameIndex}` : frameIndex}`}</span>
                <span className="truncate max-w-[140px] text-center font-sans opacity-80">
                  {photo.title || 'Khoảnh khắc kỷ niệm'}
                </span>
                <span>▶ 35MM</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 35mm Bottom Perforation Track */}
      <div className="w-full h-4 bg-[#140F11] film-sprocket-track border-y border-[#3A2933] flex items-center px-6 justify-between">
        <span className="text-[8px] tracking-[0.2em] text-[#BFA47D]/40 font-mono">
          SAFETY FILM • TUẤN HÙNG &amp; SAO MAI
        </span>
        <span className="text-[8px] tracking-[0.25em] text-[#BFA47D]/60 font-serif italic">
          19.10.2026
        </span>
      </div>
    </div>
  );
};
