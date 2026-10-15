/**
 * StaticCurtainSurface: Pure static presentation for 3D curtain split halves
 * Ensures 0 GSAP listeners, 0 animation loops, and minimal DOM overhead.
 */

import React from 'react';
import { TimelineScene } from '../types/timeline';

interface StaticCurtainSurfaceProps {
  scene?: TimelineScene | null;
  side: 'left' | 'right';
  snapshotUrl?: string | null;
}

export const StaticCurtainSurface: React.FC<StaticCurtainSurfaceProps> = ({
  scene,
  side,
  snapshotUrl,
}) => {
  // If snapshot texture is available, render pure high-res texture
  if (snapshotUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#FFF9F2]">
        <img
          src={snapshotUrl}
          alt="Curtain Outgoing Scene"
          className="absolute top-0 h-full max-w-none pointer-events-none"
          style={{
            width: '200%',
            left: side === 'left' ? '0%' : '-100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Pure static fallback: render photos with CSS-only styling (0 GSAP listeners!)
  const photos = scene?.photos || [];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#FFF9F2]">
      <div
        className="absolute top-0 h-full flex items-center justify-center gap-6 px-12 bg-gradient-to-b from-[#FFF9F2] via-[#FAF3EC] to-[#F5EDE1]"
        style={{
          width: '200%',
          left: side === 'left' ? '0%' : '-100%',
        }}
      >
        {photos.slice(0, 3).map((p, idx) => (
          <div
            key={`curtain_static_${p.id || idx}`}
            className="p-3 bg-white border border-[#C5A16E]/40 rounded-sm shadow-xl flex-shrink-0"
            style={{ width: '420px', height: '540px' }}
          >
            <img
              src={p.url}
              alt={p.title || 'Wedding Memory'}
              className="w-full h-full object-cover rounded-[1px]"
              loading="eager"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
