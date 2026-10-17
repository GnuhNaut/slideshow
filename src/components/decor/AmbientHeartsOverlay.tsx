import React, { useEffect, useRef } from 'react';
import { motionRuntime, MotionFrameState } from '../../motion/MotionRuntime';

const HEART_COUNT = 6;

const CHAPTER_PALETTES: Record<number, string[]> = {
  1: ['#C93442', '#E77A93', '#C5A16E'],
  2: ['#C93442', '#E77A93', '#F3B8C5'],
  3: ['#9B222E', '#C93442', '#E77A93'],
  4: ['#C5A16E', '#E8B4BE', '#C93442'],
  5: ['#9B222E', '#C93442', '#D9B477'],
  6: ['#C5A16E', '#E77A93', '#F4D8DE'],
  7: ['#FFFFFF', '#E8C995', '#E77A93'],
};

interface HeartLayout {
  x: number;
  size: number;
  rise: number;
  drift: number;
  rotation: number;
  cycle: number;
  visibleDuration: number;
  phase: number;
  maxOpacity: number;
  baseBlur: number;
  color: string;
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createLayouts(sceneId: string, chapterIndex: number): HeartLayout[] {
  const sceneSeed = hashText(sceneId);
  const palette = CHAPTER_PALETTES[chapterIndex] || CHAPTER_PALETTES[5];
  // Hearts favour the edges so titles, faces and story captions stay legible.
  const horizontalZones = [5, 14, 24, 76, 87, 95];

  return Array.from({ length: HEART_COUNT }, (_, index) => {
    const seed = sceneSeed + index * 977 + chapterIndex * 131;
    const cycle = 5.4 + seededUnit(seed + 1) * 4.2;
    return {
      x: horizontalZones[index] + (seededUnit(seed + 2) - 0.5) * 5,
      size: 22 + seededUnit(seed + 3) * 42,
      rise: 62 + seededUnit(seed + 4) * 44,
      drift: (seededUnit(seed + 5) - 0.5) * 14,
      rotation: (seededUnit(seed + 6) - 0.5) * 42,
      cycle,
      visibleDuration: cycle * (0.48 + seededUnit(seed + 7) * 0.2),
      phase: seededUnit(seed + 8) * cycle,
      maxOpacity: 0.34 + seededUnit(seed + 9) * 0.3,
      baseBlur: seededUnit(seed + 10) * 1.8,
      color: palette[index % palette.length],
    };
  });
}

function applyHeartFrame(
  element: HTMLSpanElement,
  layout: HeartLayout,
  elapsed: number,
  index: number
) {
  const cycleTime = (elapsed + layout.phase) % layout.cycle;
  if (cycleTime >= layout.visibleDuration) {
    element.style.opacity = '0';
    return;
  }

  const progress = cycleTime / layout.visibleDuration;
  const fadeIn = Math.min(1, progress / 0.18);
  const fadeOut = Math.min(1, (1 - progress) / 0.28);
  const opacity = fadeIn * fadeOut * layout.maxOpacity;
  const entrance = 1 - Math.pow(1 - Math.min(1, progress / 0.42), 3);
  const pulse = 1 + Math.sin(progress * Math.PI * 6 + index * 0.9) * 0.14;
  const exitScale = progress > 0.78 ? 1 - ((progress - 0.78) / 0.22) * 0.2 : 1;
  const scale = (0.42 + entrance * 0.72) * pulse * exitScale;
  const vertical = -layout.rise * progress;
  const horizontal =
    layout.drift * (progress - 0.5) + Math.sin(progress * Math.PI * 2 + index) * 1.8;
  const rotation = layout.rotation + Math.sin(progress * Math.PI * 2) * 9;
  const edgeBlur = Math.pow(Math.abs(progress * 2 - 1), 1.5) * 4.5;

  element.style.opacity = opacity.toFixed(3);
  element.style.transform =
    `translate3d(${horizontal.toFixed(2)}vw, ${vertical.toFixed(2)}vh, 0) ` +
    `translate(-50%, 50%) scale(${scale.toFixed(3)}) rotate(${rotation.toFixed(2)}deg)`;
  element.style.filter = `blur(${(layout.baseBlur + edgeBlur).toFixed(2)}px)`;
}

function updateHearts(
  frame: MotionFrameState,
  elements: Array<HTMLSpanElement | null>,
  cache: { sceneId: string; layouts: HeartLayout[] }
) {
  const scene = frame.activeScene;
  if (!scene) return;

  if (cache.sceneId !== scene.id) {
    cache.sceneId = scene.id;
    cache.layouts = createLayouts(scene.id, scene.chapterIndex);
    cache.layouts.forEach((layout, index) => {
      const element = elements[index];
      if (!element) return;
      element.style.left = `${layout.x}%`;
      element.style.width = `${layout.size}px`;
      element.style.height = `${layout.size}px`;
      element.style.color = layout.color;
    });
  }

  cache.layouts.forEach((layout, index) => {
    const element = elements[index];
    if (element) applyHeartFrame(element, layout, frame.activeSceneElapsed, index);
  });
}

const AmbientHeartsOverlayComponent: React.FC = () => {
  const heartRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const layoutCache = useRef<{ sceneId: string; layouts: HeartLayout[] }>({
    sceneId: '',
    layouts: [],
  });

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    return motionRuntime.subscribe((frame) => {
      updateHearts(frame, heartRefs.current, layoutCache.current);
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
      data-ambient-hearts="true"
      style={{ contain: 'layout paint style' }}
    >
      {Array.from({ length: HEART_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            heartRefs.current[index] = element;
          }}
          data-ambient-heart={index}
          className={`absolute -bottom-[8vh] opacity-0 ${index >= 4 ? 'hidden sm:block' : ''}`}
          style={{
            willChange: 'transform, opacity, filter',
            transformOrigin: 'center',
          }}
        >
          <svg viewBox="0 0 32 29" className="block h-full w-full" focusable="false">
            <path
              fill="currentColor"
              d="M16 28.2C13.9 25.9 2 18.5 2 9.4 2 4.5 5.4 1.2 9.6 1.2c2.7 0 5.1 1.5 6.4 3.8 1.3-2.3 3.7-3.8 6.4-3.8C26.6 1.2 30 4.5 30 9.4c0 9.1-11.9 16.5-14 18.8Z"
            />
          </svg>
        </span>
      ))}
    </div>
  );
};

export const AmbientHeartsOverlay = React.memo(AmbientHeartsOverlayComponent);
