import React, { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { TimelineScene } from '../types/timeline';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX12Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  scene?: TimelineScene;
}

export const FX12_GrandThankYouReveal: React.FC<FX12Props> = ({
  photos,
  progress,
  scene,
}) => {
  const leftPhotoRef = useRef<HTMLDivElement>(null);
  const rightPhotoRef = useRef<HTMLDivElement>(null);
  const textCenterRef = useRef<HTMLDivElement>(null);

  const applyTransforms = useCallback((prog: number) => {
    // The message is the hero. Photos enter softly and stay visually subordinate.
    if (prog < 0.4) {
      const p = prog / 0.4;
      const ease = gsap.parseEase('power2.out')(p);

      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: (1 - ease) * -96,
          rotationY: (1 - ease) * 10,
          opacity: ease * 0.58,
          scale: 0.9 + ease * 0.1,
          force3D: true,
        });
      }

      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: (1 - ease) * 96,
          rotationY: (1 - ease) * -10,
          opacity: ease * 0.58,
          scale: 0.9 + ease * 0.1,
          force3D: true,
        });
      }

      if (textCenterRef.current) {
        gsap.set(textCenterRef.current, {
          y: (1 - ease) * 40,
          opacity: ease,
          scale: 0.94 + ease * 0.06,
          force3D: true,
        });
      }
    } else {
      const drift = (prog - 0.4) / 0.6;
      if (leftPhotoRef.current) {
        gsap.set(leftPhotoRef.current, {
          x: drift * -8,
          rotationY: 3,
          opacity: 0.58,
          scale: 1 + drift * 0.012,
          force3D: true,
        });
      }
      if (rightPhotoRef.current) {
        gsap.set(rightPhotoRef.current, {
          x: drift * 8,
          rotationY: -3,
          opacity: 0.58,
          scale: 1 + drift * 0.012,
          force3D: true,
        });
      }
      if (textCenterRef.current) {
        gsap.set(textCenterRef.current, {
          y: -drift * 5,
          opacity: 1,
          scale: 1 + drift * 0.008,
          force3D: true,
        });
      }
    }
  }, []);

  useSceneMotion(scene?.id || '', applyTransforms, progress);

  const leftPhoto = photos[0];
  const rightPhoto = photos[1] || photos[0];

  const chapterTitle = scene?.config.textTitle || scene?.chapterTitle || 'Gửi những người thương';
  const coupleNames = scene?.config.coupleNames || 'TUẤN HÙNG & SAO MAI';
  const weddingDate = scene?.config.weddingDate || '19.10.2026';
  const message =
    scene?.config.quote ||
    scene?.config.textSubtitle ||
    'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1] perspective-wide select-none">
      {/* Radiant celebratory warm backdrop glow */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/80 to-[#FFF9F2] pointer-events-none" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute inset-6 md:inset-10 border border-[#C5A16E]/20 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C5A16E]/70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C5A16E]/70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C5A16E]/70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C5A16E]/70" />
      </div>

      {/* Decorative photos stay at the edges so typography owns the visual hierarchy. */}
      {leftPhoto?.url && (
        <div
          ref={leftPhotoRef}
          className="absolute left-[2.5vw] top-[17vh] hidden lg:flex w-[18vw] max-w-[300px] h-[66vh] max-h-[700px] p-1.5 bg-white/80 border border-[#E77A93]/25 rounded-sm luxury-shadow-md preserve-3d will-change-transform"
          aria-hidden="true"
        >
            <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative">
              <img
                src={leftPhoto.displayUrl || leftPhoto.url}
                alt={leftPhoto.title || 'Wedding portrait left'}
                className="w-full h-full object-cover saturate-[0.88]"
                style={{
                  objectPosition: `${leftPhoto.focalPoint?.x ?? 50}% ${leftPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F2]/35 via-transparent to-[#FFF9F2]/75 pointer-events-none" />
            </div>
        </div>
      )}

      {rightPhoto?.url && (
        <div
          ref={rightPhotoRef}
          className="absolute right-[2.5vw] top-[17vh] hidden lg:flex w-[18vw] max-w-[300px] h-[66vh] max-h-[700px] p-1.5 bg-white/80 border border-[#E77A93]/25 rounded-sm luxury-shadow-md preserve-3d will-change-transform"
          aria-hidden="true"
        >
            <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative">
              <img
                src={rightPhoto.displayUrl || rightPhoto.url}
                alt={rightPhoto.title || 'Wedding portrait right'}
                className="w-full h-full object-cover saturate-[0.88]"
                style={{
                  objectPosition: `${rightPhoto.focalPoint?.x ?? 50}% ${rightPhoto.focalPoint?.y ?? 50}%`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#FFF9F2]/35 via-transparent to-[#FFF9F2]/75 pointer-events-none" />
            </div>
        </div>
      )}

      {/* Centerpiece typography — intentionally much larger than the photo accents. */}
      <div
        ref={textCenterRef}
        className="relative z-20 mx-auto flex w-[92vw] max-w-[1120px] flex-col items-center justify-center px-5 py-8 text-center will-change-transform sm:px-10 md:py-12"
      >
        <div className="flex items-center gap-3 mb-3 md:mb-5">
          <span className="h-px w-8 md:w-14 bg-[#C93442]" />
          <span className="font-sans text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.3em] text-[#C93442] uppercase">
            {coupleNames}
          </span>
          <span className="h-px w-8 md:w-14 bg-[#C93442]" />
        </div>

        <p className="mb-2 font-serif text-sm sm:text-base md:text-lg italic tracking-[0.08em] text-[#8E716C]">
          {chapterTitle}
        </p>

        <h1 className="font-serif text-[clamp(3.8rem,8.5vw,9rem)] font-medium text-[#40322F] tracking-[0.06em] leading-[0.92] drop-shadow-[0_4px_20px_rgba(197,161,110,0.18)]">
          LỜI CẢM ƠN
        </h1>

        <div className="my-5 md:my-7 flex items-center gap-4">
          <span className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[#C5A16E]" />
          <span className="text-[#C5A16E] text-lg">✦</span>
          <span className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[#C5A16E]" />
        </div>

        <p className="max-w-3xl font-serif text-base sm:text-xl md:text-2xl lg:text-[1.7rem] text-[#55403B] leading-relaxed">
          {message}
        </p>

        <p className="mt-4 md:mt-5 max-w-2xl font-serif text-sm sm:text-base md:text-lg italic text-[#8E716C]">
          Sự hiện diện và lời chúc phúc của quý vị là món quà vô giá đối với chúng tôi.
        </p>

        <div className="mt-6 md:mt-8 flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/90 border border-[#C5A16E]/35 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C93442]" />
          <span className="font-sans text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-[#6D5751]">
            {weddingDate} • Trống Đồng Palace
          </span>
        </div>
      </div>
    </div>
  );
};
