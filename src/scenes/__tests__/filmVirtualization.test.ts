import { describe, it, expect } from 'vitest';
import { PhotoItem } from '../../types/project';

// Testable Virtualization Math Engine
export function computeVirtualWindow(
  photos: PhotoItem[],
  frameHeight: number,
  gap: number,
  containerWidth: number,
  currentScrollOffset: number
) {
  if (photos.length === 0) return { singleLoopWidth: 0, visibleItems: [] };

  const itemDimensions = photos.map((p) => {
    let width = Math.round(frameHeight * (p.aspectRatio || 1.33));
    width = Math.max(200, Math.min(width, 500));
    return { width, height: frameHeight };
  });

  const offsets: number[] = [];
  let accum = 0;
  for (let i = 0; i < itemDimensions.length; i++) {
    offsets.push(accum);
    accum += itemDimensions[i].width + gap;
  }
  const singleLoopWidth = accum;

  const buffer = 800; // px buffer left and right
  const minX = currentScrollOffset - buffer;
  const maxX = currentScrollOffset + containerWidth + buffer;

  const minLoop = Math.floor(minX / singleLoopWidth);
  const maxLoop = Math.ceil(maxX / singleLoopWidth);

  interface VisibleItem {
    photoId: string;
    photoIndex: number;
    absoluteX: number;
    loop: number;
    width: number;
  }

  const visibleItems: VisibleItem[] = [];

  for (let loop = minLoop; loop <= maxLoop; loop++) {
    const loopBase = loop * singleLoopWidth;
    for (let i = 0; i < photos.length; i++) {
      const itemX = loopBase + offsets[i];
      const itemW = itemDimensions[i].width;
      if (itemX + itemW >= minX && itemX <= maxX) {
        visibleItems.push({
          photoId: photos[i].id,
          photoIndex: i,
          absoluteX: itemX,
          loop,
          width: itemW,
        });
      }
    }
  }

  return { singleLoopWidth, visibleItems };
}

describe('Filmstrip True Virtualization Engine', () => {
  const createMockPhotos = (count: number): PhotoItem[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `photo_${i + 1}`,
      url: `/photos/img_${i + 1}.jpg`,
      aspectRatio: 1.33,
      title: `Memory ${i + 1}`,
    })) as unknown as PhotoItem[];

  it('TEST 1: With 100 photos, DOM nodes must be strictly bounded under 16 nodes (not 300!)', () => {
    const photos = createMockPhotos(100);
    const containerWidth = 1920;
    const { singleLoopWidth, visibleItems } = computeVirtualWindow(
      photos,
      320,
      24,
      containerWidth,
      5000 // midway through track
    );

    expect(singleLoopWidth).toBeGreaterThan(40000);
    // Mounted nodes must be bounded to the visible window + buffer (~8-12 nodes)
    expect(visibleItems.length).toBeGreaterThan(6);
    expect(visibleItems.length).toBeLessThanOrEqual(16);
  });

  it('TEST 2: Photo order is maintained continuously', () => {
    const photos = createMockPhotos(20);
    const containerWidth = 1920;
    const { visibleItems } = computeVirtualWindow(
      photos,
      320,
      24,
      containerWidth,
      1200
    );

    for (let i = 0; i < visibleItems.length - 1; i++) {
      expect(visibleItems[i].absoluteX).toBeLessThan(visibleItems[i + 1].absoluteX);
    }
  });

  it('TEST 3: Seamless wrap around loop boundary', () => {
    const photos = createMockPhotos(10);
    const containerWidth = 1920;
    const { singleLoopWidth } = computeVirtualWindow(photos, 320, 24, containerWidth, 0);

    // Test right at the wrap point (singleLoopWidth - 50px)
    const { visibleItems } = computeVirtualWindow(
      photos,
      320,
      24,
      containerWidth,
      singleLoopWidth - 50
    );

    // Should include items from both loop 0 and loop 1 seamlessly without any gap!
    const loops = new Set(visibleItems.map((item) => item.loop));
    expect(loops.size).toBeGreaterThanOrEqual(2);
  });
});
