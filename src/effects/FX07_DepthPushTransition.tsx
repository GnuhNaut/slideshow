import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface FX07Props {
  progress: number; // 0.0 to 1.0
  outgoingContent?: React.ReactNode;
  incomingContent?: React.ReactNode;
}

export const FX07_DepthPushTransition: React.FC<FX07Props> = ({
  progress,
  outgoingContent,
  incomingContent,
}) => {
  const outgoingRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ease transition across 0.0 to 1.0
    const ease = gsap.parseEase('power2.inOut')(progress);

    if (outgoingRef.current) {
      gsap.set(outgoingRef.current, {
        z: -ease * 300,
        scale: 1 - ease * 0.15,
        opacity: Math.max(0, 1 - ease * 1.4),
        force3D: true,
      });
    }

    if (incomingRef.current) {
      gsap.set(incomingRef.current, {
        z: (1 - ease) * 200,
        scale: 0.92 + ease * 0.08,
        opacity: Math.min(1, ease * 1.5),
        force3D: true,
      });
    }
  }, [progress]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#FFF9F2] perspective-cinema">
      {outgoingContent && (
        <div
          ref={outgoingRef}
          className="absolute inset-0 w-full h-full preserve-3d will-change-transform z-10"
        >
          {outgoingContent}
        </div>
      )}

      {incomingContent && (
        <div
          ref={incomingRef}
          className="absolute inset-0 w-full h-full preserve-3d will-change-transform z-20"
        >
          {incomingContent}
        </div>
      )}
    </div>
  );
};
