import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX10Props {
  photo: PhotoItem;
  progress: number;
  isPlaying: boolean;
  sceneId?: string;
}

export const FX10_ElegantParallax: React.FC<FX10Props> = ({
  photo,
  progress,
  sceneId,
}) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);

  const applyParallax = useCallback((p: number) => {
    const distance = (p - 0.5) * 60;

    if (bgRef.current) {
      gsap.set(bgRef.current, {
        x: -distance * 0.4,
        scale: 1.05 + p * 0.02,
        force3D: true,
      });
    }

    if (midRef.current) {
      gsap.set(midRef.current, {
        x: distance * 0.6,
        rotationY: (p - 0.5) * 4,
        force3D: true,
      });
    }

  }, []);

  // 60 FPS direct RAF motion
  useSceneMotion(sceneId || '', applyParallax, progress);

  useEffect(() => {
    applyParallax(progress);
  }, [progress, applyParallax]);

  if (!photo || !photo.url) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD] perspective-cinema">
      {/* Background Layer: Soft ambient glow & texture */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-radial from-[#C5A16E]/15 via-transparent to-transparent pointer-events-none will-change-transform"
      />

      {/* Midground Layer: Hero Card */}
      <div
        ref={midRef}
        className="relative z-20 w-[82vw] aspect-[2/3] md:aspect-auto md:w-[min(38vw,64vh)] max-w-[640px] max-h-[86vh] md:h-[86vh] md:max-h-[900px] p-3 bg-white rounded-md border border-[#E77A93]/35 luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
      >
        <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative flex items-center justify-center">
          <img
            src={photo.displayUrl || photo.url}
            alt={photo.title || 'Parallax Hero'}
            className="w-full h-full object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
};
