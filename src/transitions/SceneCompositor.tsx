import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChapterTransitionId } from './TransitionRegistry';
import { motionRuntime, MotionFrameState } from '../motion/MotionRuntime';
import { TimelineScene } from '../types/timeline';
import { CurtainSurface } from './CurtainSurface';

interface SceneCompositorProps {
  isTransitioning: boolean;
  transitionId: ChapterTransitionId;
  transitionProgress?: number;
  outgoingScene?: TimelineScene | null;
  outgoingSceneProgress?: number;
  outgoingSceneNode?: React.ReactNode;
  incomingSceneNode?: React.ReactNode;
  activeSceneNode: React.ReactNode;
}

export const SceneCompositor: React.FC<SceneCompositorProps> = ({
  isTransitioning,
  transitionId,
  outgoingScene,
  outgoingSceneProgress,
  outgoingSceneNode,
  incomingSceneNode,
  activeSceneNode,
}) => {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);

  // High-performance 60 FPS Motion Loop directly from MotionRuntime
  // Applies GSAP 3D transforms on every single frame without React re-render lag!
  useEffect(() => {
    const applyTransitionTransforms = (state: MotionFrameState) => {
      if (!state.isTransitioning) return;

      const p = state.transitionProgress;
      const tId = state.transitionId;

      switch (tId) {
        case 'FILM_PORTAL_OPENING': {
          // Ch 1 -> 2 intentionally uses an opacity-only dissolve. Applying a
          // 3D transform to the complete two-track filmstrip promotes dozens of
          // photographs into one oversized GPU layer and causes a visible hitch.
          const ease = gsap.parseEase('power1.inOut')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              opacity: Math.max(0, 1 - ease * 1.35),
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              opacity: Math.max(0, Math.min(1, (ease - 0.08) / 0.92)),
            });
          }
          break;
        }

        case 'TRUE_FILM_TO_HERO_MORPH': {
          // Ch 2 -> 3: Filmstrip track tilts back into depth, Hero photo zooms to center
          const ease = gsap.parseEase('power3.out')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              rotationX: ease * 16,
              rotationZ: ease * -3,
              scale: 1 - ease * 0.18,
              z: -ease * 340,
              opacity: Math.max(0, 1 - ease * 1.4),
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              rotationX: (1 - ease) * -14,
              rotationZ: (1 - ease) * 3,
              scale: 0.78 + ease * 0.22,
              opacity: Math.min(1, ease * 1.7),
              z: (1 - ease) * 200,
              force3D: true,
            });
          }
          break;
        }

        case 'PREMIUM_3D_ALBUM_TURN': {
          // Ch 3 -> 4: True 3D album page flip with hinge at left edge (0% 50%)
          const ease = gsap.parseEase('power2.inOut')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              transformOrigin: '0% 50%',
              rotationY: -ease * 160,
              opacity: Math.max(0, 1 - ease * 1.25),
              z: (1 - Math.abs(ease - 0.5) * 2) * 80,
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              transformOrigin: '100% 50%',
              rotationY: (1 - ease) * 25,
              opacity: Math.min(1, ease * 1.5),
              scale: 0.94 + ease * 0.06,
              force3D: true,
            });
          }
          break;
        }

        case 'GALLERY_SPACE_TRANSFORMATION': {
          // Ch 4 -> 5: Family album recedes into 3D Z-space, wedding photos surge forward
          const ease = gsap.parseEase('power2.inOut')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              scale: 1 - ease * 0.16,
              z: -ease * 300,
              opacity: Math.max(0, 1 - ease * 1.3),
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              scale: 0.91 + ease * 0.09,
              z: (1 - ease) * 220,
              opacity: Math.min(1, ease * 1.5),
              force3D: true,
            });
          }
          break;
        }

        case 'GRAND_WEDDING_CURTAIN_REVEAL': {
          // Ch 5 -> 6: True 3D Grand Wedding Curtain Reveal: parting left and right in 3D
          const ease = gsap.parseEase('power2.inOut')(p);
          if (leftCurtainRef.current) {
            gsap.set(leftCurtainRef.current, {
              xPercent: -ease * 105,
              rotationY: -ease * 18,
              transformOrigin: 'left center',
              force3D: true,
            });
          }
          if (rightCurtainRef.current) {
            gsap.set(rightCurtainRef.current, {
              xPercent: ease * 105,
              rotationY: ease * 18,
              transformOrigin: 'right center',
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              scale: 0.92 + ease * 0.08,
              opacity: Math.min(1, ease * 1.6),
              force3D: true,
            });
          }
          break;
        }

        case 'FOREVER_FINAL_REVEAL': {
          // Ch 6 -> 7: Thank you softly fades, Final Photo expands to permanent hold
          const ease = gsap.parseEase('power2.inOut')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              opacity: Math.max(0, 1 - ease * 1.4),
              scale: 1 - ease * 0.05,
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              opacity: Math.min(1, ease * 1.5),
              scale: 0.96 + ease * 0.04,
              force3D: true,
            });
          }
          break;
        }

        default: {
          // Default smooth spatial crossfade
          const ease = gsap.parseEase('power1.inOut')(p);
          if (outgoingRef.current) {
            gsap.set(outgoingRef.current, {
              opacity: Math.max(0, 1 - ease * 1.2),
              scale: 1 - ease * 0.04,
              force3D: true,
            });
          }
          if (incomingRef.current) {
            gsap.set(incomingRef.current, {
              opacity: Math.min(1, ease * 1.3),
              scale: 0.96 + ease * 0.04,
              force3D: true,
            });
          }
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

  // Ch 5 -> 6: True 3D Grand Wedding Curtain Reveal using lightweight CurtainSurface
  if (transitionId === 'GRAND_WEDDING_CURTAIN_REVEAL') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#FFF9F2] perspective-cinema">
        {/* Incoming Scene (Grand Thank You Stage centered underneath) */}
        <div
          ref={incomingRef}
          className="absolute inset-0 w-full h-full preserve-3d will-change-transform z-10 pointer-events-none"
        >
          {incomingSceneNode}
        </div>

        {/* Left Curtain Half parting to the left */}
        <div
          ref={leftCurtainRef}
          className="absolute inset-y-0 left-0 w-1/2 overflow-hidden preserve-3d will-change-transform z-20 pointer-events-none shadow-2xl border-r border-[#C5A16E]/40"
        >
          <CurtainSurface
            scene={outgoingScene}
            progress={outgoingSceneProgress}
            side="left"
          />
        </div>

        {/* Right Curtain Half parting to the right */}
        <div
          ref={rightCurtainRef}
          className="absolute inset-y-0 left-1/2 w-1/2 overflow-hidden preserve-3d will-change-transform z-20 pointer-events-none shadow-2xl border-l border-[#C5A16E]/40"
        >
          <CurtainSurface
            scene={outgoingScene}
            progress={outgoingSceneProgress}
            side="right"
          />
        </div>
      </div>
    );
  }

  // Active transition for all other 3D transitions
  const isLightweightFilmOpening = transitionId === 'FILM_PORTAL_OPENING';

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#FFF9F2] ${
        isLightweightFilmOpening ? '' : 'perspective-cinema'
      }`}
    >
      {/* Outgoing Scene */}
      <div
        ref={outgoingRef}
        className={`absolute inset-0 w-full h-full z-10 pointer-events-none ${
          isLightweightFilmOpening ? '' : 'preserve-3d will-change-transform'
        }`}
        style={isLightweightFilmOpening ? { willChange: 'opacity' } : undefined}
      >
        {outgoingSceneNode || activeSceneNode}
      </div>

      {/* Incoming Scene */}
      <div
        ref={incomingRef}
        className={`absolute inset-0 w-full h-full z-20 pointer-events-none ${
          isLightweightFilmOpening ? '' : 'preserve-3d will-change-transform'
        }`}
        style={isLightweightFilmOpening ? { willChange: 'opacity' } : undefined}
      >
        {incomingSceneNode}
      </div>
    </div>
  );
};
