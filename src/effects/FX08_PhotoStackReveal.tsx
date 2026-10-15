import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX08Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  accentQuote?: string;
}

export const FX08_PhotoStackReveal: React.FC<FX08Props> = ({
  photos,
  progress,
  accentQuote = 'Những khoảnh khắc giản dị mà đong đầy yêu thương.',
}) => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa có ảnh trong Photo Stack
      </div>
    );
  }

  const stack = photos.slice(0, 4);
  const cardCount = stack.length;

  useEffect(() => {
    // Current active card index based on progress
    const activeIndex = Math.min(cardCount - 1, Math.floor(progress * cardCount));
    const subProgress = (progress * cardCount) % 1;

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
  }, [progress, cardCount]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD] perspective-cinema">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/12 via-transparent to-transparent pointer-events-none" />

      {/* Photo Stack Container */}
      <div className="relative w-[480px] h-[580px] flex items-center justify-center preserve-3d">
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
                src={photo.url}
                alt={photo.title || 'Stack Moment'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quote Banner */}
      {accentQuote && (
        <div className="mt-8 px-6 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-[#C5A16E]/20">
          <p className="text-sm font-serif italic text-[#40322F]">
            "{accentQuote}"
          </p>
        </div>
      )}
    </div>
  );
};
