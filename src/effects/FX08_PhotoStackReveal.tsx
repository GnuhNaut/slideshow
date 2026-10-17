import React, { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX08Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  sceneId?: string;
}

export const FX08_PhotoStackReveal: React.FC<FX08Props> = ({
  photos,
  progress,
  sceneId,
}) => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stack = photos?.slice(0, 4) || [];
  const cardCount = stack.length;

  const applyStackMotion = useCallback((currentProgress: number) => {
    if (cardCount === 0) return;
    // Current active card index based on progress
    const activeIndex = Math.min(cardCount - 1, Math.floor(currentProgress * cardCount));
    const subProgress = (currentProgress * cardCount) % 1;

    cardsRef.current.forEach((card, idx) => {
      if (!card) return;
      if (idx < activeIndex) {
        // Discarded card (flown to the side)
        gsap.set(card, {
          x: idx % 2 === 0 ? -500 : 500,
          y: -120,
          rotation: idx % 2 === 0 ? -25 : 25,
          opacity: 0,
          force3D: true,
        });
      } else if (idx === activeIndex) {
        // Active top card sliding out towards the end of its subProgress
        if (subProgress > 0.75 && idx < cardCount - 1) {
          const slideOut = (subProgress - 0.75) / 0.25;
          gsap.set(card, {
            x: (idx % 2 === 0 ? -380 : 380) * slideOut,
            y: -50 * slideOut,
            rotation: (idx % 2 === 0 ? -12 : 12) * slideOut,
            opacity: 1 - slideOut * 0.4,
            force3D: true,
          });
        } else {
          gsap.set(card, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            scale: 1,
            force3D: true,
          });
        }
      } else {
        // Cards remaining in stack below
        const depth = idx - activeIndex;
        gsap.set(card, {
          x: depth * (idx % 2 === 0 ? 8 : -8),
          y: depth * 10,
          rotation: depth * (idx % 2 === 0 ? 3 : -3),
          scale: 1 - depth * 0.04,
          opacity: 1 - depth * 0.15,
          force3D: true,
        });
      }
    });
  }, [cardCount]);

  useSceneMotion(sceneId || '', applyStackMotion, progress);

  if (!photos || photos.length === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD] perspective-cinema">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-transparent to-transparent pointer-events-none" />

      {/* Photo Stack Container */}
      <div className="relative w-[76vw] aspect-[2/3] max-h-[62vh] md:w-[480px] md:h-[580px] md:aspect-auto flex items-center justify-center preserve-3d">
        {stack.map((photo, idx) => (
          <div
            key={photo.id}
            ref={(el) => {
              cardsRef.current[idx] = el;
            }}
            className="absolute inset-0 p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
            style={{ zIndex: cardCount - idx }}
          >
            <div className="w-full h-full overflow-hidden rounded-[2px] bg-[#FAF5EE]">
              <img
                src={photo.displayUrl || photo.url}
                alt={photo.title || 'Stack Moment'}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
