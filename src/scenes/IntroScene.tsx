import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { TimelineScene } from '../types/timeline';
import { useSceneMotion } from '../motion/useSceneMotion';

interface IntroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ scene, progress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);

  // 60 FPS Direct Motion Hook
  useSceneMotion(
    scene.id,
    (p) => {
      if (heroCardRef.current) {
        heroCardRef.current.style.transform = `scale(${1 + p * 0.03}) rotateY(${Math.sin(p * Math.PI) * 3}deg)`;
      }
    },
    progress
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        heroCardRef.current,
        { opacity: 0, scale: 0.9, y: 30, rotationY: -8 },
        { opacity: 1, scale: 1, y: 0, rotationY: 0, duration: 2.0, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EB] to-[#F5EDE1] select-none perspective-cinema"
    >
      {/* Radiant celebratory warm backdrop */}
      <div className="absolute inset-0 bg-radial from-[#C5A16E]/18 via-[#FFF9F2]/70 to-[#FFF9F2] pointer-events-none" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute inset-8 border border-[#C5A16E]/25 pointer-events-none rounded-sm">
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#C5A16E]" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#C5A16E]" />
      </div>

      {/* Main Split / Hero Composition */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 preserve-3d">
        <div
          ref={heroCardRef}
          className="w-[82vw] aspect-[2/3] md:aspect-auto md:w-[min(38vw,64vh)] max-w-[640px] max-h-[86vh] md:h-[86vh] md:max-h-[900px] p-3 bg-white border border-[#E77A93]/35 rounded-sm luxury-shadow-lg preserve-3d will-change-transform flex flex-col"
        >
          <div className="w-full h-full overflow-hidden rounded-[1px] bg-[#FAF5EE] relative flex items-center justify-center">
            {heroPhoto?.url && (
              <img
                src={heroPhoto.displayUrl || heroPhoto.url}
                alt={heroPhoto.title || 'Wedding Hero'}
                className="w-full h-full object-contain mx-auto"
              />
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Top & Bottom Champagne Perforation Ribbons */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-b border-[#C5A16E]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#F3E9DD] film-sprocket-track opacity-40 border-t border-[#C5A16E]/30" />
    </div>
  );
};
