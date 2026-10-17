import React, { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX09Props {
  photo: PhotoItem;
  progress: number;
  isPlaying: boolean;
  sceneId?: string;
}

export const FX09_CinematicMaskReveal: React.FC<FX09Props> = ({
  photo,
  progress,
  sceneId,
}) => {
  const maskRef = useRef<HTMLDivElement>(null);

  const applyMaskReveal = useCallback((currentProgress: number) => {
    if (!maskRef.current) return;

    // Geometric mask expands from center vertical line (inset 0 45% 0 45%) to full (inset 0% 0% 0% 0%)
    const revealP = Math.min(1, currentProgress / 0.35);
    const ease = gsap.parseEase('power2.out')(revealP);
    const insetH = (1 - ease) * 45; // 45% to 0%

    gsap.set(maskRef.current, {
      clipPath: `inset(0% ${insetH}% 0% ${insetH}%)`,
      force3D: true,
    });

  }, []);

  useSceneMotion(sceneId || '', applyMaskReveal, progress);

  if (!photo) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD]">
      {/* Expanding Mask Window */}
      <div
        ref={maskRef}
        className="relative w-[76vw] aspect-[2/3] max-h-[86vh] md:w-[min(88vw,1280px)] md:h-[78vh] md:max-h-[760px] md:aspect-auto p-3 bg-white rounded-md border border-[#E77A93]/35 luxury-shadow-lg overflow-hidden will-change-[clip-path]"
      >
        <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative">
          <img
            src={photo.mediumUrl || photo.displayUrl || photo.url}
            alt={photo.title || 'Cinematic Moment'}
            className="w-full h-full object-contain"
            style={{
              objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
