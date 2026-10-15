import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChapterTransitionId } from './TransitionRegistry';
import { motionRuntime, MotionFrameState } from '../motion/MotionRuntime';

interface SceneCompositorProps {
  isTransitioning: boolean;
  transitionId: ChapterTransitionId;
  transitionProgress?: number;
  outgoingSceneNode?: React.ReactNode;
  incomingSceneNode?: React.ReactNode;
  activeSceneNode: React.ReactNode;
}

export const SceneCompositor: React.FC<SceneCompositorProps> = ({
  isTransitioning,
  transitionId,
  outgoingSceneNode,
  incomingSceneNode,
  activeSceneNode,
}) => {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);

  // High-performance 60 FPS Motion Loop directly from MotionRuntime
  // Applies GSAP 3D transforms on every single frame without React re-render lag!
  useEffect(() => {
    const applyTransitionTransforms = (state: MotionFrameState) => {
      if (!state.isTransitioning || !outgoingRef.current || !incomingRef.current) return;

      const p = state.transitionProgress;
      const tId = state.transitionId;

      switch (tId) {
        case 'FILM_PORTAL_OPENING': {
          // Ch 1 -> 2: Intro typography recedes as 35mm film portal streaks across
          const ease = gsap.parseEase('power2.inOut')(p);
          gsap.set(outgoingRef.current, {
            scale: 1 - ease * 0.1,
            opacity: Math.max(0, 1 - ease * 1.3),
            z: -ease * 220,
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            scale: 0.88 + ease * 0.12,
            opacity: Math.min(1, ease * 1.6),
            z: (1 - ease) * 160,
            force3D: true,
          });
          break;
        }

        case 'TRUE_FILM_TO_HERO_MORPH': {
          // Ch 2 -> 3: Filmstrip track tilts back into depth, Hero zooms and de-tilts to center
          const ease = gsap.parseEase('power3.out')(p);
          gsap.set(outgoingRef.current, {
            rotationX: ease * 14,
            scale: 1 - ease * 0.15,
            z: -ease * 320,
            opacity: Math.max(0, 1 - ease * 1.4),
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            rotationX: (1 - ease) * -12,
            scale: 0.82 + ease * 0.18,
            opacity: Math.min(1, ease * 1.6),
            z: (1 - ease) * 220,
            force3D: true,
          });
          break;
        }

        case 'PREMIUM_3D_ALBUM_TURN': {
          // Ch 3 -> 4: True 3D album page flip with hinge at left edge
          const ease = gsap.parseEase('power2.inOut')(p);
          gsap.set(outgoingRef.current, {
            transformOrigin: '0% 50%',
            rotationY: -ease * 140,
            opacity: Math.max(0, 1 - ease * 1.25),
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            transformOrigin: '100% 50%',
            rotationY: (1 - ease) * 30,
            opacity: Math.min(1, ease * 1.4),
            scale: 0.94 + ease * 0.06,
            force3D: true,
          });
          break;
        }

        case 'GALLERY_SPACE_TRANSFORMATION': {
          // Ch 4 -> 5: Family album recedes into 3D Z-space, wedding photos surge forward
          const ease = gsap.parseEase('power2.inOut')(p);
          gsap.set(outgoingRef.current, {
            scale: 1 - ease * 0.15,
            z: -ease * 280,
            opacity: Math.max(0, 1 - ease * 1.3),
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            scale: 0.92 + ease * 0.08,
            z: (1 - ease) * 200,
            opacity: Math.min(1, ease * 1.5),
            force3D: true,
          });
          break;
        }

        case 'GRAND_WEDDING_CURTAIN_REVEAL': {
          // Ch 5 -> 6: Wedding photos part left/right, revealing majestic central Lời Cảm Ơn
          const ease = gsap.parseEase('power2.out')(p);
          gsap.set(outgoingRef.current, {
            scale: 1 + ease * 0.05,
            opacity: Math.max(0, 1 - ease * 1.3),
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            scale: 0.9 + ease * 0.1,
            y: (1 - ease) * 35,
            opacity: Math.min(1, ease * 1.6),
            force3D: true,
          });
          break;
        }

        case 'FOREVER_FINAL_REVEAL': {
          // Ch 6 -> 7: Thank you softly fades, Final Photo expands to permanent hold
          const ease = gsap.parseEase('power2.inOut')(p);
          gsap.set(outgoingRef.current, {
            opacity: Math.max(0, 1 - ease * 1.4),
            scale: 1 - ease * 0.05,
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            opacity: Math.min(1, ease * 1.5),
            scale: 0.96 + ease * 0.04,
            force3D: true,
          });
          break;
        }

        default: {
          // Default smooth spatial crossfade
          const ease = gsap.parseEase('power1.inOut')(p);
          gsap.set(outgoingRef.current, {
            opacity: Math.max(0, 1 - ease * 1.2),
            scale: 1 - ease * 0.04,
            force3D: true,
          });
          gsap.set(incomingRef.current, {
            opacity: Math.min(1, ease * 1.3),
            scale: 0.96 + ease * 0.04,
            force3D: true,
          });
          break;
        }
      }
    };

    const unsub = motionRuntime.subscribe(applyTransitionTransforms);
    return () => unsub();
  }, [isTransitioning, transitionId]);

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
