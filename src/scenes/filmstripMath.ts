/**
 * Filmstrip Pure Coordinate Mathematics & Virtual Window Engine
 * Guarantees monotonic wrapping, RTL/LTR symmetry, and 0-delay virtual windowing.
 */

import { PhotoItem } from '../types/project';

export interface ItemDimension {
  width: number;
  height: number;
}

export interface TrackPositionResult {
  translateX: number;
  wrappedOffset: number;
  cameraX: number;
}

export interface VisibleFilmItem {
  photo: PhotoItem;
  width: number;
  absoluteX: number;
  key: string;
  frameIndex: number;
  loopIndex: number;
}

/**
 * Computes exact track translate and camera coordinate with wrap modulo invariant.
 * @param elapsedSeconds Time in seconds elapsed within the scene
 * @param speedPxPerSec Movement speed in pixels per second
 * @param singleLoopWidth Total width of one complete loop iteration
 * @param direction 'rtl' (right to left) or 'ltr' (left to right)
 */
export function getTrackPosition(
  elapsedSeconds: number,
  speedPxPerSec: number,
  singleLoopWidth: number,
  direction: 'rtl' | 'ltr'
): TrackPositionResult {
  if (singleLoopWidth <= 1) {
    return { translateX: 0, wrappedOffset: 0, cameraX: 0 };
  }

  const safeElapsed = Math.max(0, elapsedSeconds);
  const totalPixels = safeElapsed * speedPxPerSec;
  const wrappedOffset = ((totalPixels % singleLoopWidth) + singleLoopWidth) % singleLoopWidth;

  const translateX =
    direction === 'rtl' ? -wrappedOffset : wrappedOffset - singleLoopWidth;

  // Unified camera coordinate: world coordinate corresponding to the left edge of viewport
  const cameraX =
    direction === 'rtl' ? wrappedOffset : singleLoopWidth - wrappedOffset;

  return {
    translateX,
    wrappedOffset,
    cameraX,
  };
}

/**
 * Calculates item layout dimensions preserving aspect ratios.
 */
export function calculateItemDimensions(
  photos: PhotoItem[],
  frameHeight: number
): ItemDimension[] {
  return photos.map((p) => {
    let width = Math.round(frameHeight * (p.aspectRatio || 1.33));
    width = Math.max(180, Math.min(width, 560));
    return { width, height: frameHeight };
  });
}

/**
 * Builds cumulative offset table for O(1) positioning.
 */
export function calculateCumulativeOffsets(
  itemDimensions: ItemDimension[],
  gap: number
): { offsets: number[]; singleLoopWidth: number } {
  if (itemDimensions.length === 0) {
    return { offsets: [], singleLoopWidth: 1 };
  }
  const offsets: number[] = [];
  let accum = 0;
  for (let i = 0; i < itemDimensions.length; i++) {
    offsets.push(accum);
    accum += itemDimensions[i].width + gap;
  }
  return { offsets, singleLoopWidth: Math.max(1, accum) };
}

/**
 * Calculates absolute world position for an item at a specific loop repetition.
 */
export function getWrappedItemPosition(
  index: number,
  loopIndex: number,
  offsets: number[],
  singleLoopWidth: number
): number {
  const baseOffset = offsets[index] || 0;
  return loopIndex * singleLoopWidth + baseOffset;
}

/**
 * Slices visible items inside the camera viewport + buffer window.
 * Ensures complete coverage across 1366, 1080p, 4K, and boundary wraps.
 */
export function getVisibleItems(
  cameraX: number,
  viewportWidth: number,
  bufferPx: number,
  photos: PhotoItem[],
  offsets: number[],
  itemDimensions: ItemDimension[],
  singleLoopWidth: number,
  direction: 'rtl' | 'ltr'
): VisibleFilmItem[] {
  if (!photos || photos.length === 0 || singleLoopWidth <= 1) {
    return [];
  }

  // Safety buffer proportional to viewport and scrolling velocity
  const effectiveBuffer = Math.max(bufferPx, Math.round(viewportWidth * 0.4));
  const minX = cameraX - effectiveBuffer;
  const maxX = cameraX + viewportWidth + effectiveBuffer;

  const minLoop = Math.floor(minX / singleLoopWidth);
  const maxLoop = Math.ceil(maxX / singleLoopWidth);

  const items: VisibleFilmItem[] = [];

  for (let loop = minLoop; loop <= maxLoop; loop++) {
    const loopBase = loop * singleLoopWidth;
    for (let i = 0; i < photos.length; i++) {
      const itemW = itemDimensions[i]?.width || 320;
      const itemX = loopBase + (offsets[i] || 0);

      // Intersection test with buffered camera window
      if (itemX + itemW >= minX && itemX <= maxX) {
        items.push({
          photo: photos[i],
          width: itemW,
          absoluteX: itemX,
          key: `vfilm_${direction}_${loop}_${photos[i].id}_${i}`,
          frameIndex: i + 1,
          loopIndex: loop,
        });
      }
    }
  }

  return items;
}

/**
 * Extracts unique media IDs needed for lookahead prefetching.
 */
export function getRequiredMediaIds(visibleItems: VisibleFilmItem[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const item of visibleItems) {
    const id = item.photo.mediaId || item.photo.id;
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}
