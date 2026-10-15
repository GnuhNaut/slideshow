import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { TimelineScene } from '../types/timeline';
import { ChapterTransitionId } from './TransitionRegistry';

interface SceneCompositorProps {
  isTransitioning: boolean;
  transitionId: ChapterTransitionId;
  transitionProgress: number; // 0.0 to 1.0
  outgoingSceneNode?: React.ReactNode;
  incomingSceneNode?: React.ReactNode;
  activeSceneNode: React.ReactNode;
}

export const SceneCompositor: React.FC<SceneCompositorProps> = ({
  isTransitioning,
  transitionId,
  transitionProgress,
  outgoingSceneNode,
  incomingSceneNode,
  activeSceneNode,
}) => {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTransitioning) return;
    const p = transitionProgress;

    switch (transitionId) {
      case 'CINEMATIC_FILM_OPENING': {
        // Ch 1 -> 2: Intro shrinks back, Film Strip slides in
        const ease = gsap.parseEase('power2.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            scale: 1 - ease * 0.08,
            opacity: Math.max(0, 1 - ease * 1.2),
            z: -ease * 150,
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            scale: 0.92 + ease * 0.08,
            opacity: Math.min(1, ease * 1.5),
            z: (1 - ease) * 100,
            force3D: true,
          });
        }
        break;
      }

      case 'FILM_TO_HERO_3D_MORPH': {
        // Ch 2 -> 3: Film tilts back, Hero emerges forward
        const ease = gsap.parseEase('power2.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            rotationX: ease * 10,
            z: -ease * 250,
            opacity: Math.max(0, 1 - ease * 1.3),
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            scale: 0.88 + ease * 0.12,
            opacity: Math.min(1, ease * 1.4),
            z: (1 - ease) * 150,
            force3D: true,
          });
        }
        break;
      }

      case 'ALBUM_PAGE_TURN_3D': {
        // Ch 3 -> 4: 3D Album Page Turn
        const ease = gsap.parseEase('power2.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            rotationY: -ease * 45,
            x: -ease * 80,
            opacity: Math.max(0, 1 - ease * 1.2),
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            rotationY: (1 - ease) * 35,
            x: (1 - ease) * 60,
            opacity: Math.min(1, ease * 1.3),
            force3D: true,
          });
        }
        break;
      }

      case 'PREMIUM_GALLERY_REVEAL': {
        // Ch 4 -> 5: Family album recedes, Wedding montage surges forward
        const ease = gsap.parseEase('power2.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            scale: 1 - ease * 0.12,
            z: -ease * 200,
            opacity: Math.max(0, 1 - ease * 1.2),
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            scale: 0.94 + ease * 0.06,
            opacity: Math.min(1, ease * 1.4),
            force3D: true,
          });
        }
        break;
      }

      case 'GRAND_THANK_YOU_TRANSITION': {
        // Ch 5 -> 6: Wedding photos part to flanking sides, Thank You emerges center
        const ease = gsap.parseEase('power2.out')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            scale: 1 + ease * 0.04,
            opacity: Math.max(0, 1 - ease * 1.2),
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            scale: 0.9 + ease * 0.1,
            opacity: Math.min(1, ease * 1.5),
            force3D: true,
          });
        }
        break;
      }

      case 'FINAL_PHOTO_REVEAL': {
        // Ch 6 -> 7: Thank you softly fades, Final Photo takes full stage
        const ease = gsap.parseEase('power2.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            opacity: Math.max(0, 1 - ease * 1.4),
            scale: 1 - ease * 0.04,
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            opacity: Math.min(1, ease * 1.5),
            scale: 0.98 + ease * 0.02,
            force3D: true,
          });
        }
        break;
      }

      default: {
        // Default gentle 3D dissolve
        const ease = gsap.parseEase('power1.inOut')(p);
        if (outgoingRef.current) {
          gsap.set(outgoingRef.current, {
            opacity: Math.max(0, 1 - ease * 1.2),
            scale: 1 - ease * 0.03,
            force3D: true,
          });
        }
        if (incomingRef.current) {
          gsap.set(incomingRef.current, {
            opacity: Math.min(1, ease * 1.3),
            scale: 0.97 + ease * 0.03,
            force3D: true,
          });
        }
        break;
      }
    }
  }, [isTransitioning, transitionId, transitionProgress]);

  // If not currently transitioning, render just the active scene
  if (!isTransitioning || !incomingSceneNode) {
    return <div className="w-full h-full relative">{activeSceneNode}</div>;
  }

  // Active transition: render both outgoing and incoming scenes inside 3D stage
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#FFF9F2] perspective-cinema">
      {/* Outgoing Scene */}
      <div
        ref={outgoingRef}
        className="absolute inset-0 w-full h-full preserve-3d will-change-transform z-10 pointer-events-none"
      >
        {outgoingSceneNode || activeSceneNode}
      </div>

      {/* Incoming Scene */}
      <div
        ref={incomingRef}
        className="absolute inset-0 w-full h-full preserve-3d will-change-transform z-20 pointer-events-none"
      >
        {incomingSceneNode}
      </div>
    </div>
  );
};
