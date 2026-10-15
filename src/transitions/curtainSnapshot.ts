/**
 * Curtain Snapshot & Static Surface Manager
 * Creates high-performance 1080p snapshot textures for 3D curtain reveals
 * Eliminates duplicate React scene trees and duplicate GSAP subscriptions (TC-52, TC-53)
 */

import { TimelineScene } from '../types/timeline';

let cachedSnapshotUrl: string | null = null;
let cachedSceneId: string | null = null;

/**
 * Generates an offscreen 1080p canvas snapshot of the outgoing scene photos
 */
export async function generateCurtainSnapshot(scene: TimelineScene): Promise<string> {
  if (cachedSnapshotUrl && cachedSceneId === scene.id) {
    return cachedSnapshotUrl;
  }

  // Fallback for non-browser environments (e.g. unit tests)
  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Luxury Warm Ivory Background
  ctx.fillStyle = '#FFF9F2';
  ctx.fillRect(0, 0, 1920, 1080);

  // Subtle radial gradient
  const grad = ctx.createRadialGradient(960, 540, 100, 960, 540, 900);
  grad.addColorStop(0, 'rgba(197, 161, 110, 0.12)');
  grad.addColorStop(1, 'rgba(255, 249, 242, 0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  const photos = scene.photos || [];
  const count = photos.length;

  if (count > 0) {
    // Load and draw photo elements onto canvas
    const loadedImages: HTMLImageElement[] = [];

    await Promise.all(
      photos.slice(0, 4).map(
        (p) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              loadedImages.push(img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = p.url;
          })
      )
    );

    // Render photo arrangement based on count
    if (loadedImages.length === 1) {
      const img = loadedImages[0];
      const w = 900;
      const h = 600;
      const x = (1920 - w) / 2;
      const y = (1080 - h) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      ctx.drawImage(img, x, y, w, h);
    } else if (loadedImages.length >= 2) {
      const totalW = loadedImages.length * 480 + (loadedImages.length - 1) * 32;
      let startX = (1920 - totalW) / 2;
      for (const img of loadedImages) {
        const w = 480;
        const h = 580;
        const y = (1080 - h) / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(startX - 6, y - 6, w + 12, h + 12);
        ctx.drawImage(img, startX, y, w, h);
        startX += w + 32;
      }
    }
  }

  try {
    cachedSnapshotUrl = canvas.toDataURL('image/jpeg', 0.9);
    cachedSceneId = scene.id;
    return cachedSnapshotUrl;
  } catch {
    return '';
  }
}

/**
 * Releases temporary snapshot resources to prevent memory leaks (TC-53)
 */
export function releaseCurtainSnapshot(): void {
  cachedSnapshotUrl = null;
  cachedSceneId = null;
}
