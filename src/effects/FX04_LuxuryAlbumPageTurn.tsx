import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX04Props {
  leftPhoto?: PhotoItem;
  rightPhoto?: PhotoItem;
  nextPhoto?: PhotoItem;
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export const FX04_LuxuryAlbumPageTurn: React.FC<FX04Props> = ({
  leftPhoto,
  rightPhoto,
  nextPhoto,
  progress,
}) => {
  const turningPageRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!turningPageRef.current) return;

    // Flip transition happens between progress 0.6 to 0.95
    if (progress < 0.6) {
      gsap.set(turningPageRef.current, {
        rotationY: 0,
        force3D: true,
      });
      if (shadowRef.current) gsap.set(shadowRef.current, { opacity: 0 });
    } else {
      const p = Math.min(1, (progress - 0.6) / 0.35);
      const angle = -p * 180;
      gsap.set(turningPageRef.current, {
        rotationY: angle,
        force3D: true,
      });
      if (shadowRef.current) {
        // Shadow peaks at 90 deg
        const shadowOpacity = Math.sin(p * Math.PI) * 0.45;
        gsap.set(shadowRef.current, { opacity: shadowOpacity });
      }
    }
  }, [progress]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#F8F1E7] to-[#F3E9DD] perspective-wide">
      {/* Warm ambient radiance */}
      <div className="absolute inset-0 bg-radial from-[#E77A93]/12 via-[#FFF9F2]/35 to-transparent pointer-events-none" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-4 md:hidden">
        {[leftPhoto, rightPhoto].filter((photo): photo is PhotoItem => Boolean(photo)).map((photo) => (
          <div
            key={photo.id}
            className="h-[30vh] w-[min(82vw,20vh)] p-2.5 bg-white border border-[#E77A93]/35 rounded-sm luxury-shadow-md"
          >
            <img
              src={photo.displayUrl || photo.url}
              alt={photo.title || 'Family portrait'}
              className="h-full w-full rounded-sm bg-[#FAF5EE] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Luxury Wedding Album Book Container */}
      <div className="relative hidden w-[92%] max-w-[1240px] h-[84vh] max-h-[820px] rounded-md album-shadow bg-[#FFFDF9] border border-[#E77A93]/40 preserve-3d md:flex">
        {/* Book Spine Center Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -ml-[2px] w-[4px] bg-gradient-to-r from-[#D0BA9B] via-[#EADBCA] to-[#E77A93] z-30 shadow-inner" />

        {/* LEFT PAGE (Static) */}
        <div className="w-1/2 h-full p-1 md:p-4 flex items-center justify-center border-r border-[#EADBCA]/60 bg-[#FFFDF9]">
          <div className="w-full h-full rounded-sm overflow-hidden border border-[#E77A93]/20 bg-[#FAF5EE] relative shadow-sm">
            {leftPhoto && (
              <img
                src={leftPhoto.displayUrl || leftPhoto.url}
                alt={leftPhoto.title || 'Family'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${leftPhoto.focalPoint?.x ?? 50}% ${leftPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT UNDER-PAGE (Visible after turning) */}
        <div className="w-1/2 h-full p-1 md:p-4 flex flex-col items-center justify-center bg-[#FFFDF9] relative">
          <div className="w-full h-full rounded-sm overflow-hidden border border-[#E77A93]/20 bg-[#FAF5EE] shadow-sm">
            {nextPhoto ? (
              <img
                src={nextPhoto.displayUrl || nextPhoto.url}
                alt={nextPhoto.title || 'Next moment'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${nextPhoto.focalPoint?.x ?? 50}% ${nextPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
            ) : rightPhoto ? (
              <img
                src={rightPhoto.displayUrl || rightPhoto.url}
                alt={rightPhoto.title || 'Family right'}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${rightPhoto.focalPoint?.x ?? 50}% ${rightPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
            ) : null}
          </div>
        </div>

        {/* TURNING PAGE (3D Rotated from right to left) */}
        <div
          ref={turningPageRef}
          className="absolute right-0 top-0 bottom-0 w-1/2 h-full preserve-3d will-change-transform z-20 origin-left"
        >
          {/* Front side of turning page (rightPhoto) */}
          <div className="absolute inset-0 p-1 md:p-4 flex flex-col items-center justify-center bg-[#FFFDF9] backface-hidden border-l border-[#EADBCA]/40">
            <div className="w-full h-full rounded-sm overflow-hidden border border-[#E77A93]/20 bg-[#FAF5EE] shadow-sm">
              {rightPhoto && (
                <img
                  src={rightPhoto.displayUrl || rightPhoto.url}
                  alt={rightPhoto.title || 'Family right'}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${rightPhoto.focalPoint?.x ?? 50}% ${rightPhoto.focalPoint?.y ?? 50}%`,
                  }}
                />
              )}
            </div>
            {/* Dynamic page shadow */}
            <div
              ref={shadowRef}
              className="absolute inset-0 bg-black/40 pointer-events-none opacity-0 transition-opacity"
            />
          </div>

          {/* Back side of turning page */}
          <div
            className="absolute inset-0 p-1 md:p-4 flex items-center justify-center bg-[#FFFDF9] border-r border-[#EADBCA]/40 backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-full rounded-sm overflow-hidden border border-[#E77A93]/20 bg-[#FAF5EE] shadow-sm">
              {nextPhoto && (
                <img
                  src={nextPhoto.displayUrl || nextPhoto.url}
                  alt={nextPhoto.title || 'Next moment back'}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${nextPhoto.focalPoint?.x ?? 50}% ${nextPhoto.focalPoint?.y ?? 50}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
