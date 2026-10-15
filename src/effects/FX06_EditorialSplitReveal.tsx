import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { PhotoItem } from '../types/project';

interface FX06Props {
  primaryPhoto?: PhotoItem;
  secondaryPhoto?: PhotoItem;
  progress: number;
  isPlaying: boolean;
  title?: string;
  subtitle?: string;
  quote?: string;
}

export const FX06_EditorialSplitReveal: React.FC<FX06Props> = ({
  primaryPhoto,
  secondaryPhoto,
  progress,
  title = 'FOREVER TOGETHER',
  subtitle = 'THE WEDDING STORY',
  quote = 'Khoảnh khắc thiêng liêng khi hai trái tim hòa cùng một nhịp đập.',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal entrance: 0.0 to 0.3
    if (progress < 0.3) {
      const p = progress / 0.3;
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
      const steadyProgress = (progress - 0.3) / 0.7;
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
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-8 md:p-14 overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1]"
    >
      <div className="w-full max-w-[1360px] h-full flex flex-col md:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side: Large Hero Portrait (60%) */}
        <div
          ref={leftPanelRef}
          className="w-full md:w-[58%] h-[68vh] md:h-[82vh] bg-white p-4 border border-[#C5A16E]/40 rounded-sm luxury-shadow-lg flex flex-col will-change-transform"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative">
            {primaryPhoto && (
              <img
                src={primaryPhoto.url}
                alt={primaryPhoto.title || 'Wedding Climax'}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Right Side: Editorial Narrative & Secondary Photo (40%) */}
        <div
          ref={rightPanelRef}
          className="w-full md:w-[42%] h-auto md:h-[82vh] flex flex-col justify-between py-2 will-change-transform"
        >
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 text-xs uppercase tracking-[0.25em] font-sans font-medium text-[#C93442] bg-[#F0DFD5]/80 rounded-full">
              {subtitle}
            </span>
            <h2 className="text-3xl lg:text-5xl font-serif text-[#40322F] tracking-wide leading-tight">
              {title}
            </h2>
            <div className="w-14 h-[1.5px] bg-[#C5A16E]" />
            <p className="text-base lg:text-lg font-serif italic text-[#40322F]/85 leading-relaxed">
              "{quote}"
            </p>
          </div>

          {/* Supporting Portrait */}
          {secondaryPhoto && (
            <div className="mt-6 w-full max-w-[340px] h-[240px] p-2.5 bg-white border border-[#C5A16E]/30 rounded-sm luxury-shadow-md">
              <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE]">
                <img
                  src={secondaryPhoto.url}
                  alt={secondaryPhoto.title || 'Wedding Detail'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
