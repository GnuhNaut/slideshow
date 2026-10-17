import React, { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX03Props {
  photo: PhotoItem;
  progress: number; // 0.0 to 1.0
  isPlaying: boolean;
  sceneId?: string;
  placement?: 'center' | 'right';
}

export const FX03_HeroFrameMorph: React.FC<FX03Props> = ({
  photo,
  progress,
  sceneId,
  placement = 'center',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const applyMorph = useCallback((p: number) => {
    if (!frameRef.current) return;

    if (p < 0.3) {
      const normP = p / 0.3;
      const ease = gsap.parseEase('power2.out')(normP);
      gsap.set(frameRef.current, {
        scale: 0.82 + ease * 0.18,
        rotationY: (1 - ease) * 12,
        rotationX: (1 - ease) * -6,
        z: (1 - ease) * -120,
        opacity: Math.min(1, ease * 1.5),
        force3D: true,
      });
    } else if (p <= 0.85) {
      const normP = (p - 0.3) / 0.55;
      gsap.set(frameRef.current, {
        scale: 1.0 + normP * 0.03, // Micro breathing
        rotationY: 0,
        rotationX: 0,
        z: 0,
        opacity: 1,
        force3D: true,
      });
    } else {
      const normP = (p - 0.85) / 0.15;
      gsap.set(frameRef.current, {
        scale: 1.03 - normP * 0.02,
        rotationY: 0,
        rotationX: 0,
        z: 0,
        opacity: 1 - normP * 0.2,
        force3D: true,
      });
    }
  }, []);

  // 60 FPS direct RAF motion
  useSceneMotion(sceneId || '', applyMorph, progress);

  if (!photo || !photo.url) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FDF8F3] to-[#F3E9DD] perspective-cinema ${
        placement === 'right'
          ? 'items-start justify-center pt-[5vh] sm:items-center sm:justify-end sm:pt-0 sm:pr-[8vw]'
          : 'items-center justify-center'
      }`}
    >
      <div className="absolute inset-0 bg-radial from-[#E8D9C9]/65 via-[#FFF9F2]/72 to-[#F3E9DD] pointer-events-none" />

      {/* Main Hero Card */}
      <div
        ref={frameRef}
        className={`relative z-10 max-w-[700px] p-3 md:p-4 bg-white/95 rounded-sm border border-[#E77A93]/45 shadow-[0_28px_90px_-28px_rgba(64,50,47,0.42)] preserve-3d will-change-transform flex flex-col ${
          placement === 'right'
            ? 'w-[min(76vw,42vh)] h-[56vh] sm:w-[min(42vw,62vh)] sm:h-[82vh]'
            : 'w-[82vw] aspect-[2/3] md:aspect-auto md:w-[min(42vw,68vh)] max-h-[88vh] md:h-[88vh] md:max-h-[920px]'
        }`}
      >
        <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative flex items-center justify-center">
          <img
            src={photo.displayUrl || photo.url}
            alt={photo.title || 'Proposal Hero'}
            decoding="async"
            className="w-full h-full object-cover mx-auto"
            style={{
              objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
            }}
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
