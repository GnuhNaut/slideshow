import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX11Props {
  photos: PhotoItem[];
  progress: number;
  isPlaying: boolean;
  accentQuote?: string;
}

export const FX11_PhotoMosaicTransformation: React.FC<FX11Props> = ({
  photos,
  progress,
  accentQuote = 'Từng khoảnh khắc đong đầy dư vị ngọt ngào.',
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const sub1Ref = useRef<HTMLDivElement>(null);
  const sub2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance reveal
    const revealP = Math.min(1, progress / 0.3);
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
  }, [progress]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Chưa có ảnh cho Photo Mosaic
      </div>
    );
  }

  const heroPhoto = photos[0];
  const subPhoto1 = photos[1] || photos[0];
  const subPhoto2 = photos[2] || photos[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1]">
      <div className="w-full max-w-[1300px] h-[78vh] flex flex-col md:flex-row gap-6">
        {/* Left: Large Hero (62%) */}
        <div
          ref={heroRef}
          className="w-full md:w-[62%] h-full p-4 bg-white rounded-md border border-[#C5A16E]/40 luxury-shadow-lg flex flex-col"
        >
          <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE]">
            <img
              src={heroPhoto.url}
              alt={heroPhoto.title || 'Mosaic Hero'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Stacked Sub Photos (38%) */}
        <div className="w-full md:w-[38%] h-full flex flex-col gap-6">
          <div
            ref={sub1Ref}
            className="w-full h-1/2 p-3 bg-white rounded-md border border-[#C5A16E]/30 luxury-shadow-md flex flex-col"
          >
            <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE]">
              <img
                src={subPhoto1.url}
                alt={subPhoto1.title || 'Mosaic Detail 1'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            ref={sub2Ref}
            className="w-full h-1/2 p-3 bg-white rounded-md border border-[#C5A16E]/30 luxury-shadow-md flex flex-col"
          >
            <div className="w-full h-full overflow-hidden rounded-sm bg-[#FAF5EE]">
              <img
                src={subPhoto2.url}
                alt={subPhoto2.title || 'Mosaic Detail 2'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {accentQuote && (
        <div className="absolute bottom-6 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#C5A16E]/20">
          <p className="text-sm font-serif italic text-[#40322F]">
            "{accentQuote}"
          </p>
        </div>
      )}
    </div>
  );
};
