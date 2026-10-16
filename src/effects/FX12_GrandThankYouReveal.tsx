import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { motionRuntime } from '../motion/MotionRuntime';

interface FX12Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
}

export const FX12_GrandThankYouReveal: React.FC<FX12Props> = ({
  photos,
  progress,
}) => {
  const leftPhotoRef = useRef<HTMLDivElement>(null);
  const rightPhotoRef = useRef<HTMLDivElement>(null);

  const applyTransforms = (prog: number) => {
    // 0.0 -> 0.35: Grand 3D curtain opening
    if (prog < 0.35) {
      const p = prog / 0.35;
      const ease = gsap.parseEase('power2.out')(p);

      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: (1 - ease) * -120,
          rotationY: (1 - ease) * 18,
          opacity: ease,
          force3D: true,
        });
      }

      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: (1 - ease) * 120,
          rotationY: (1 - ease) * -18,
          opacity: ease,
          force3D: true,
        });
      }

    } else {
      // Steady breathing state
      const drift = (prog - 0.35) / 0.65;
      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: drift * -8,
          rotationY: 4,
          opacity: 1,
          force3D: true,
        });
      }
      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: drift * 8,
          rotationY: -4,
          opacity: 1,
          force3D: true,
        });
      }
    }
  };

  // Immediate update on progress prop change (for scrubbing / seek)
  useEffect(() => {
    applyTransforms(progress);
  }, [progress]);

  // High-frequency 60 FPS motion loop directly from masterClock via MotionRuntime
  useEffect(() => {
    const unsub = motionRuntime.subscribe((state) => {
      let currentP = progress;
      if (state.activeScene?.type === 'thank_you') {
        currentP = state.activeSceneProgress;
      } else if (state.incomingScene?.type === 'thank_you') {
        currentP = state.incomingSceneProgress;
      } else if (state.outgoingScene?.type === 'thank_you') {
        currentP = state.outgoingSceneProgress;
      }
      applyTransforms(currentP);
    });

    return () => unsub();
  }, []);

  const leftPhoto = photos[0];
  const rightPhoto = photos[1] || photos[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-14 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] perspective-wide">
      {/* Radiant celebratory warm backdrop glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/80 to-[#FFF9F2] pointer-events-none" />

      {/* Main Grand Stage */}
      <div className="relative z-10 w-full max-w-[1100px] h-full flex flex-row items-center justify-center gap-2 md:gap-8 preserve-3d">
        {[leftPhoto, rightPhoto].map((photo, index) => (
          <div
            key={`${photo?.id || 'photo'}_${index}`}
            ref={index === 0 ? leftPhotoRef : rightPhotoRef}
            className="w-[42vw] md:w-[min(31vw,420px)] h-[30vh] md:h-[82vh] max-h-[780px] p-2 md:p-3 bg-white border border-[#E77A93]/35 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
          >
            <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] flex items-center justify-center">
              {photo?.url && (
                <img
                  src={photo.displayUrl || photo.url}
                  alt={photo.title || 'Wedding portrait'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
