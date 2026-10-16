import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX10Props {
  photo: PhotoItem;
  progress: number;
  isPlaying: boolean;
  accentQuote?: string;
  sceneId?: string;
}

export const FX10_ElegantParallax: React.FC<FX10Props> = ({
  photo,
  progress,
  accentQuote = 'Khi ánh mắt chạm nhau, thời gian như ngưng đọng.',
  sceneId,
}) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

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

    if (fgRef.current) {
      gsap.set(fgRef.current, {
        x: distance * 1.4,
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
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F3E9DD] p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border border-[#C5A16E]/40 flex items-center justify-center bg-white shadow-sm">
          <span className="font-serif text-2xl text-[#C93442] italic">V</span>
        </div>
        <h2 className="font-serif text-2xl font-medium text-[#40322F]">
          HẠNH PHÚC TRỌN VẸN
        </h2>
        <p className="text-xs text-[#C5A16E] italic font-serif max-w-md">
          "{accentQuote}"
        </p>
        <span className="text-[11px] text-[#40322F]/60 font-mono">
          (Thêm ảnh vào public/gallery/05-wedding/)
        </span>
      </div>
    );
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
        className="relative z-20 w-[84vw] max-w-[1150px] h-[76vh] max-h-[720px] p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
      >
        <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE] relative flex items-center justify-center">
          <img
            src={photo.displayUrl || photo.url}
            alt={photo.title || 'Parallax Hero'}
            className={`w-full h-full ${photo.cropMode === 'cover' ? 'object-cover' : 'object-contain'} mx-auto`}
            style={{
              objectPosition: `${photo.focalPoint?.x ?? 50}% ${photo.focalPoint?.y ?? 50}%`,
            }}
          />
        </div>
      </div>

      {/* Foreground Layer: Floating Champagne Accent Orbs */}
      <div
        ref={fgRef}
        className="absolute inset-0 z-30 pointer-events-none overflow-hidden will-change-transform"
      >
        <div className="absolute top-[18%] left-[12%] w-24 h-24 rounded-full bg-[#C5A16E]/20 blur-xl" />
        <div className="absolute bottom-[22%] right-[15%] w-32 h-32 rounded-full bg-[#C93442]/15 blur-2xl" />
      </div>

      {/* Narrative quote */}
      {accentQuote && (
        <div className="absolute bottom-8 z-40 px-8 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-[#C5A16E]/30 shadow-sm">
          <p className="text-sm font-serif italic text-[#40322F]">
            "{accentQuote}"
          </p>
        </div>
      )}
    </div>
  );
};
