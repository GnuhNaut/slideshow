import React, { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';
import { useSceneMotion } from '../motion/useSceneMotion';

interface FX11Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  sceneId?: string;
}

export const FX11_PhotoMosaicTransformation: React.FC<FX11Props> = ({
  photos,
  progress,
  sceneId,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const sub1Ref = useRef<HTMLDivElement>(null);
  const sub2Ref = useRef<HTMLDivElement>(null);

  const applyMosaicMotion = useCallback((currentProgress: number) => {
    // Entrance reveal
    const revealP = Math.min(1, currentProgress / 0.3);
    const ease = gsap.parseEase('power2.out')(revealP);

    if (heroRef.current) {
      gsap.set(heroRef.current, {
        scale: 0.94 + ease * 0.06,
        opacity: ease,
        force3D: true,
      });
    }

    if (sub1Ref.current) {
      gsap.set(sub1Ref.current, {
        x: (1 - ease) * 30,
        opacity: ease,
        force3D: true,
      });
    }

    if (sub2Ref.current) {
      gsap.set(sub2Ref.current, {
        x: (1 - ease) * 30,
        opacity: ease,
        force3D: true,
      });
    }
  }, []);

  useSceneMotion(sceneId || '', applyMosaicMotion, progress);

  if (!photos || photos.length === 0) {
    return <div className="w-full h-full bg-[#FFF9F2]" />;
  }

  const heroPhoto = photos[0];
  const subPhoto1 = photos[1] || photos[0];
  const subPhoto2 = photos[2] || photos[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 md:p-12 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1]">
      <div className="flex w-full max-w-[1320px] flex-col items-center justify-center gap-3 md:grid md:grid-cols-3 md:items-center md:gap-5 md:px-4">
        <div
          ref={heroRef}
          className="h-[34vh] w-[72vw] p-2.5 bg-white rounded-md border border-[#E77A93]/35 luxury-shadow-lg flex flex-col md:h-auto md:max-h-[78vh] md:w-full md:p-3"
          style={{ aspectRatio: heroPhoto.aspectRatio || 0.8 }}
        >
          <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE]">
            <img
              src={heroPhoto.displayUrl || heroPhoto.url}
              alt={heroPhoto.title || 'Mosaic Hero'}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3 md:contents">
        {[subPhoto1, subPhoto2].map((photo, index) => (
          <div
            key={photo.id + index}
            ref={index === 0 ? sub1Ref : sub2Ref}
            className="h-[22vh] w-[31vw] p-2 bg-white rounded-md border border-[#E77A93]/35 luxury-shadow-md flex flex-col md:h-auto md:max-h-[78vh] md:w-full md:p-3"
            style={{ aspectRatio: photo.aspectRatio || 0.8 }}
          >
            <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE]">
              <img
                src={photo.displayUrl || photo.url}
                alt={photo.title || `Wedding detail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
