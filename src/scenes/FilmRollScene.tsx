import React, { useMemo } from 'react';
import { TimelineScene } from '../types/timeline';
import { PhotoItem } from '../types/project';

interface FilmRollSceneProps {
  scene: TimelineScene;
  progress: number; // 0 to 1
  isPlaying: boolean;
  isDual?: boolean;
}

export const FilmRollScene: React.FC<FilmRollSceneProps> = ({
  scene,
  progress,
  isDual = false,
}) => {
  const photos = scene.photos;

  // Split photos into two sets if dual roll
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
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-[#151114]">
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#151114] via-[#1f171d]/60 to-[#151114] pointer-events-none" />
      <div className="absolute top-6 left-10 z-20 pointer-events-none">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#ecd28f]/70 font-serif-sc">
          {scene.chapterTitle}
        </span>
      </div>

      {isDual ? (
        <div className="relative z-10 w-full h-full flex flex-col justify-around py-6 gap-4">
          {/* Top Film Strip (Right to Left) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <FilmStripTrack
              photos={topPhotos}
              direction="rtl"
              progress={progress}
              speedFactor={1.0}
              rowLabel="STRIP A • 35MM MEMORIES"
            />
          </div>

          {/* Bottom Film Strip (Left to Right) */}
          <div className="relative flex-1 flex items-center overflow-hidden">
            <FilmStripTrack
              photos={bottomPhotos.length > 0 ? bottomPhotos : topPhotos}
              direction="ltr"
              progress={progress}
              speedFactor={0.88}
              rowLabel="STRIP B • FOREVER JOURNEY"
            />
          </div>
        </div>
      ) : (
        /* Single Continuous Film Strip */
        <div className="relative z-10 w-full h-full flex items-center overflow-hidden py-10">
          <FilmStripTrack
            photos={photos}
            direction="rtl"
            progress={progress}
            speedFactor={1.0}
            rowLabel="35MM CONTINUOUS FILM ROLL"
          />
        </div>
      )}

      {/* Chapter Quote Overlay at bottom */}
      {scene.config.quote && (
        <div className="absolute bottom-6 z-20 px-8 py-2 bg-[#151114]/85 border border-[#ecd28f]/30 rounded-full backdrop-blur-md shadow-2xl">
          <p className="text-xs md:text-sm text-[#FFF4E4] font-serif italic tracking-wide text-center">
            "{scene.config.quote}"
          </p>
        </div>
      )}
    </div>
  );
};

interface FilmStripTrackProps {
  photos: PhotoItem[];
  direction: 'rtl' | 'ltr';
  progress: number;
  speedFactor: number;
  rowLabel: string;
}

const FilmStripTrack: React.FC<FilmStripTrackProps> = ({
  photos,
  direction,
  progress,
  speedFactor,
  rowLabel,
}) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-[#ecd28f]/50 italic">
        Chưa có ảnh trong cuộn phim
      </div>
    );
  }

  // Duplicate items 3 times to ensure infinite seamless scrolling loop without empty gaps
  const displayPhotos = useMemo(() => {
    return [...photos, ...photos, ...photos];
  }, [photos]);

  // Approximate width per frame: ~340px + 32px gap = 372px
  const frameWidthWithGap = 360;
  const loopWidth = photos.length * frameWidthWithGap;

  // Calculate smooth translation based on progress
  const totalShift = progress * loopWidth * speedFactor * 1.5;
  const normalizedShift = totalShift % loopWidth;
  const translateX = direction === 'rtl' ? -normalizedShift : normalizedShift - loopWidth;

  return (
    <div className="relative w-full flex flex-col justify-center select-none">
      {/* 35mm Top Perforation Track */}
      <div className="w-full h-5 bg-[#0b080a] film-sprocket-track border-y border-[#3a2933] flex items-center px-4 justify-between">
        <span className="text-[8px] tracking-[0.25em] text-[#ecd28f]/40 font-mono">
          {rowLabel}
        </span>
        <span className="text-[8px] tracking-[0.2em] text-[#ecd28f]/30 font-mono">
          ISO 400 • COLOR PLUS
        </span>
      </div>

      {/* Film Frames Container */}
      <div
        className="flex items-center gap-6 py-4 bg-[#120d11]/90 shadow-2xl will-change-transform"
        style={{
          transform: `translate3d(${translateX}px, 0, 0)`,
          width: 'max-content',
        }}
      >
        {displayPhotos.map((photo, idx) => {
          const frameIndex = (idx % photos.length) + 1;
          const isPortrait = photo.aspectRatio < 1;

          return (
            <div
              key={`${photo.id}_strip_${idx}`}
              className="relative group shrink-0 flex flex-col items-center p-2.5 rounded bg-[#1e151b] border border-[#ecd28f]/35 shadow-[0_12px_28px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-[1.02]"
              style={{
                width: isPortrait ? '230px' : '330px',
                height: '240px',
              }}
            >
              {/* Photo Frame Container with 35mm crop and shadow */}
              <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#0d090b] border border-[#fff4e4]/15">
                <img
                  src={photo.url}
                  alt={photo.title || `Photo ${frameIndex}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
                  }}
                  loading="lazy"
                />

                {/* Subtle vignette inside photo frame */}
                <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />

                {/* Hero indicator pin if marked */}
                {photo.isHero && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#81252D]/90 border border-[#ecd28f] text-[9px] text-[#FFF4E4] font-serif tracking-wider shadow">
                    HERO
                  </div>
                )}
              </div>

              {/* Bottom Frame Details (Frame number, Kodak marking) */}
              <div className="w-full mt-1.5 flex items-center justify-between px-1 text-[8px] text-[#ecd28f]/60 font-mono">
                <span>{`#${frameIndex < 10 ? `0${frameIndex}` : frameIndex}`}</span>
                <span className="truncate max-w-[150px] text-center font-sans opacity-70">
                  {photo.title || 'Khoảnh khắc kỷ niệm'}
                </span>
                <span>▶ 24A</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 35mm Bottom Perforation Track */}
      <div className="w-full h-5 bg-[#0b080a] film-sprocket-track border-y border-[#3a2933] flex items-center px-4 justify-between">
        <span className="text-[8px] tracking-[0.2em] text-[#ecd28f]/30 font-mono">
          SAFETY FILM • 2026
        </span>
        <span className="text-[8px] tracking-[0.25em] text-[#d4ac59]/50 font-serif italic">
          Tuấn Hùng &amp; Sao Mai
        </span>
      </div>
    </div>
  );
};
