import React, { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX06Props {
  primaryPhoto?: PhotoItem;
  secondaryPhoto?: PhotoItem;
  progress: number;
  isPlaying: boolean;
  sceneId?: string;
}

export const FX06_EditorialSplitReveal: React.FC<FX06Props> = ({
  primaryPhoto,
  secondaryPhoto,
  progress,
  sceneId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const applySplitMotion = useCallback((currentProgress: number) => {
    // Reveal entrance: 0.0 to 0.3
    if (currentProgress < 0.3) {
      const p = currentProgress / 0.3;
      const ease = gsap.parseEase('power2.out')(p);
      if (leftPanelRef.current) {
        gsap.set(leftPanelRef.current, {
          x: (1 - ease) * -60,
          opacity: ease,
          force3D: true,
        });
      }
      if (rightPanelRef.current) {
        gsap.set(rightPanelRef.current, {
          x: (1 - ease) * 60,
          opacity: ease,
          force3D: true,
        });
      }
    } else {
      // Steady drift
      const steadyProgress = (currentProgress - 0.3) / 0.7;
      if (leftPanelRef.current) {
        gsap.set(leftPanelRef.current, {
          x: steadyProgress * 15,
          opacity: 1,
          force3D: true,
        });
      }
      if (rightPanelRef.current) {
        gsap.set(rightPanelRef.current, {
          x: steadyProgress * -15,
          opacity: 1,
          force3D: true,
        });
      }
    }
  }, []);

  useSceneMotion(sceneId || '', applySplitMotion, progress);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-8 md:p-14 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1]"
    >
      <div className="w-full max-w-[1160px] h-full flex flex-row items-center justify-center gap-2 md:gap-6 px-1">
        {primaryPhoto && (
          <div
            ref={leftPanelRef}
            className="w-[min(44vw,180px)] aspect-[2/3] md:w-[min(38vw,480px)] md:h-auto md:max-h-[82vh] p-2 md:p-3 bg-white border border-[#E77A93]/35 rounded-sm luxury-shadow-lg flex flex-col will-change-transform"
            style={{ aspectRatio: primaryPhoto.aspectRatio || 0.8 }}
          >
            <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
              <img
                src={primaryPhoto.displayUrl || primaryPhoto.url}
                alt={primaryPhoto.title || 'Wedding moment'}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {secondaryPhoto && (
          <div
            ref={rightPanelRef}
            className="w-[min(44vw,180px)] aspect-[2/3] md:w-[min(38vw,480px)] md:h-auto md:max-h-[82vh] p-2 md:p-3 bg-white border border-[#E77A93]/35 rounded-sm luxury-shadow-lg flex flex-col will-change-transform"
            style={{ aspectRatio: secondaryPhoto.aspectRatio || 0.8 }}
          >
            <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
              <img
                src={secondaryPhoto.displayUrl || secondaryPhoto.url}
                alt={secondaryPhoto.title || 'Wedding detail'}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
