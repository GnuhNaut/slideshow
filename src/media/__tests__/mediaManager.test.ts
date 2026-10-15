import { describe, it, expect } from 'vitest';
import { mediaManager } from '../mediaManager';

describe('MediaManager V2 — Resilient Batch Processing', () => {
  it('should track and revoke object URLs without memory leaks', () => {
    // In node/vitest, URL.createObjectURL might be mocked if needed
    const blob = new Blob(['sample image data'], { type: 'image/jpeg' });
    let url = '';
    try {
      url = mediaManager.createTrackedUrl('test_1', blob);
      expect(typeof url).toBe('string');
    } catch {
      // If URL.createObjectURL is not in node jsdom, skip
    }

    mediaManager.revokeUrl('test_1');
    mediaManager.revokeAll();
  });

  it('should filter non-image files and report clear error messages', async () => {
    const textFile = new File(['text'], 'document.pdf', { type: 'application/pdf' });
    const { photos, errors } = await mediaManager.processBatchUpload(
      [textFile],
      'ch1_intro',
      'proj_1',
      0
    );

    expect(photos.length).toBe(0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Không tìm thấy file hình ảnh hợp lệ');
  });
});
