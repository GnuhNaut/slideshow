import { describe, it, expect, beforeEach, vi } from 'vitest';
import JSZip from 'jszip';
import { validateProjectSchema, importProjectZip } from '../../project/exportImport';
import { WeddingProject } from '../../types/project';
import { computeTransitionState } from '../../transitions/TransitionDirector';
import { TimelineScene } from '../../types/timeline';
import { db } from '../../storage/db';

describe('P0 Hotfix Regression Tests: Media Integrity, Audio Persistence & Visual Continuity', () => {
  const baseValidProject: WeddingProject = {
    id: 'proj_hotfix_test',
    version: '3.2.1',
    title: 'Tuấn Hùng & Sao Mai - Hotfix Test',
    groomName: 'Tuấn Hùng',
    brideName: 'Sao Mai',
    weddingDate: '19/10/2026',
    lunarDate: '09/09 Bính Ngọ',
    thankYouMessage: 'Cảm ơn quý khách đã đến chung vui',
    globalSettings: {
      aspectRatio: '16:9',
      cinemaPace: 'cinematic',
      quality: 'presentation',
      enableFilmGrain: true,
      enableVignette: true,
      enableSprockets: true,
      filmColorTone: 'warm_classic',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [
      {
        id: 'ch1',
        chapterIndex: 1,
        title: 'Lời Mở Đầu',
        vietnameseTitle: 'Lời Mở Đầu',
        subtitle: 'The Beginning',
        description: 'Mở đầu câu chuyện tình yêu',
        enabled: true,
        mode: 'auto',
        effectMode: 'f05_pan_zoom',
        speed: 60,
        transitionType: 'film_wipe',
        photos: [
          {
            id: 'ph1',
            chapterId: 'ch1',
            url: 'media/ph1.jpg',
            aspectRatio: 1.5,
            originalWidth: 1920,
            originalHeight: 1080,
            cropMode: 'cover',
            focalPoint: { x: 50, y: 50 },
            order: 0,
            createdAt: Date.now(),
            title: 'Ảnh 1',
          },
        ],
      },
      {
        id: 'ch2',
        chapterIndex: 2,
        title: 'Cuộn Phim',
        vietnameseTitle: 'Cuộn Phim Kỷ Niệm',
        subtitle: 'Memories',
        description: 'Những kỷ niệm đẹp',
        enabled: true,
        mode: 'auto',
        effectMode: 'f05_pan_zoom',
        speed: 60,
        transitionType: 'film_wipe',
        photos: [
          {
            id: 'ph2',
            chapterId: 'ch2',
            url: 'media/ph2.jpg',
            aspectRatio: 1.5,
            originalWidth: 1920,
            originalHeight: 1080,
            cropMode: 'cover',
            focalPoint: { x: 50, y: 50 },
            order: 0,
            createdAt: Date.now(),
            title: 'Ảnh 2',
          },
        ],
      },
    ],
    audioTracks: [
      {
        id: 'audio_1',
        name: 'Ánh Nắng Của Anh',
        url: 'audio/audio_1.mp3',
        duration: 180,
        startTime: 0,
        endTime: 180,
        volume: 0.8,
        fadeInDuration: 2,
        fadeOutDuration: 2,
        isGlobal: true,
      },
    ],
  };

  // Helper to create a test ZIP File from parts
  async function createTestZip(options: {
    manifest?: any;
    project?: any;
    photos?: Record<string, string | Uint8Array>;
    audio?: Record<string, string | Uint8Array>;
    omitManifest?: boolean;
    omitProject?: boolean;
  }): Promise<File> {
    const zip = new JSZip();

    if (!options.omitManifest) {
      const manifest = options.manifest ?? {
        manifestVersion: '3.2.1',
        app: 'Wedding Film Story — Tuấn Hùng & Sao Mai',
        exportDate: Date.now(),
        projectTitle: 'Tuấn Hùng & Sao Mai',
        groomName: 'Tuấn Hùng',
        brideName: 'Sao Mai',
        weddingDate: '19/10/2026',
        totalPhotos: 2,
      };
      zip.file('manifest.json', typeof manifest === 'string' ? manifest : JSON.stringify(manifest, null, 2));
    }

    if (!options.omitProject) {
      const project = options.project ?? baseValidProject;
      zip.file('project.json', typeof project === 'string' ? project : JSON.stringify(project, null, 2));
    }

    const photos = options.photos ?? {
      'ph1.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
      'ph2.jpg': new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
    };
    for (const [filename, content] of Object.entries(photos)) {
      zip.folder('media')?.file(filename, content);
    }

    const audio = options.audio ?? {
      'audio_1.mp3': new Uint8Array([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]),
    };
    for (const [filename, content] of Object.entries(audio)) {
      zip.folder('audio')?.file(filename, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return new File([blob], 'test_project.zip', { type: 'application/zip' });
  }

  // --- P0-03: Strict Project Schema & Media Validation ---
  describe('P0-03: Strict ZIP and Schema Validation', () => {
    it('TC-HOTFIX-01: Rejects missing manifest.json with explicit error', async () => {
      const zipFile = await createTestZip({ omitManifest: true });
      await expect(importProjectZip(zipFile)).rejects.toThrow('Thiếu manifest.json');
    });

    it('TC-HOTFIX-02: Rejects unsupported manifest version', async () => {
      const zipFile = await createTestZip({
        manifest: { manifestVersion: 'invalid_version_999' },
      });
      await expect(importProjectZip(zipFile)).rejects.toThrow('Version manifest không được hỗ trợ');
    });

    it('TC-HOTFIX-03: Rejects missing project.json with explicit error', async () => {
      const zipFile = await createTestZip({ omitProject: true });
      await expect(importProjectZip(zipFile)).rejects.toThrow('Thiếu file cấu hình project.json');
    });

    it('TC-HOTFIX-04: Rejects project.json missing required chapters or photos structure', async () => {
      const brokenProject = {
        id: 'broken',
        title: 'Broken Project',
        // missing chapters array
      };
      const zipFile = await createTestZip({ project: brokenProject });
      await expect(importProjectZip(zipFile)).rejects.toThrow('WeddingProject');
    });

    it('TC-HOTFIX-05: Rejects ZIP missing a referenced photo binary', async () => {
      // Photo ph2.jpg is referenced in project but missing from media folder
      const zipFile = await createTestZip({
        photos: {
          'ph1.jpg': new Uint8Array([0xff, 0xd8, 0xff]),
        },
      });
      await expect(importProjectZip(zipFile)).rejects.toThrow('File ZIP bị thiếu 1 tệp phương tiện bắt buộc: media/ph2.jpg');
    });

    it('TC-HOTFIX-06: Rejects ZIP missing a referenced audio binary', async () => {
      // Audio audio_1.mp3 is referenced in project but missing from audio folder
      const zipFile = await createTestZip({
        audio: {},
      });
      await expect(importProjectZip(zipFile)).rejects.toThrow('File ZIP bị thiếu 1 tệp phương tiện bắt buộc: audio/audio_1.mp3');
    });

    it('TC-HOTFIX-07: Rejects ZIP containing empty 0-byte photo binary', async () => {
      const zipFile = await createTestZip({
        photos: {
          'ph1.jpg': new Uint8Array(0), // 0-byte corrupt photo
          'ph2.jpg': new Uint8Array([0xff, 0xd8]),
        },
      });
      await expect(importProjectZip(zipFile)).rejects.toThrow('Tệp ảnh bị rỗng hoặc lỗi: media/ph1.jpg');
    });

    it('TC-HOTFIX-08: Rejects ZIP containing empty 0-byte audio binary', async () => {
      const zipFile = await createTestZip({
        audio: {
          'audio_1.mp3': new Uint8Array(0), // 0-byte corrupt audio
        },
      });
      await expect(importProjectZip(zipFile)).rejects.toThrow('Tệp âm thanh bị rỗng hoặc lỗi: audio/audio_1.mp3');
    });
  });

  // --- P0-02: Audio Persistence in IndexedDB ---
  describe('P0-02: Persistent Audio Storage', () => {
    it('TC-HOTFIX-09: Assigns mediaId to imported audio tracks and stages audio records', async () => {
      const audioPutSpy = vi.fn().mockResolvedValue('ok');
      const mediaPutSpy = vi.fn().mockResolvedValue('ok');
      const projectsPutSpy = vi.fn().mockResolvedValue('ok');
      const originalAudioPut = db.audio.put;
      const originalMediaPut = db.media.put;
      const originalProjectsPut = db.projects.put;
      const originalTransaction = db.transaction;

      // Mock db methods and transaction for node environment
      (db.audio as any).put = audioPutSpy;
      (db.media as any).put = mediaPutSpy;
      (db.projects as any).put = projectsPutSpy;
      (db as any).transaction = vi.fn(async (_mode: any, _tables: any, fn: any) => {
        await fn();
      });

      try {
        const zipFile = await createTestZip({});
        const importedProject = await importProjectZip(zipFile);

        expect(importedProject).toBeDefined();
        expect(importedProject.audioTracks.length).toBe(1);
        expect(importedProject.audioTracks[0].mediaId).toBeDefined();
        expect(importedProject.audioTracks[0].mediaId).toContain('audio_import_');

        // Confirm db.audio.put was called with binary blob and correct metadata
        expect(audioPutSpy).toHaveBeenCalled();
        const storedAudio = audioPutSpy.mock.calls[0][0];
        expect(storedAudio.id).toBe(importedProject.audioTracks[0].mediaId);
        expect(storedAudio.blob).toBeInstanceOf(Blob);
        expect(storedAudio.blob.size).toBeGreaterThan(0);
      } finally {
        (db.audio as any).put = originalAudioPut;
        (db.media as any).put = originalMediaPut;
        (db.projects as any).put = originalProjectsPut;
        (db as any).transaction = originalTransaction;
      }
    });
  });

  // --- P0-01: Visual Continuity for Grand Wedding Curtain ---
  describe('P0-01: Grand Wedding Curtain Visual Continuity', () => {
    it('TC-HOTFIX-10: Outgoing scene is preserved at 0% transition with exact geometry and time', () => {
      const ch5Scene: TimelineScene = {
        id: 'scene_ch5',
        chapterId: 'ch5',
        chapterIndex: 5,
        chapterTitle: 'Album Ảnh Cưới',
        type: 'living_collage',
        startTime: 10,
        duration: 10,
        endTime: 20,
        transitionIn: 'film_wipe',
        transitionOut: 'film_wipe',
        photos: baseValidProject.chapters[0].photos,
        config: {},
      };
      const ch6Scene: TimelineScene = {
        id: 'scene_ch6',
        chapterId: 'ch6',
        chapterIndex: 6,
        chapterTitle: 'Lời Cảm Ơn',
        type: 'thank_you',
        startTime: 20,
        duration: 8,
        endTime: 28,
        transitionIn: 'film_wipe',
        transitionOut: 'fade',
        photos: baseValidProject.chapters[1].photos,
        config: {},
      };

      // Chapter 5 -> 6 transition duration is 1.3s -> transStartTime = 20.0 - 1.3 = 18.7s
      const stateAt0 = computeTransitionState([ch5Scene, ch6Scene], 18.7);
      expect(stateAt0.isTransitioning).toBe(true);
      expect(stateAt0.transitionId).toBe('GRAND_WEDDING_CURTAIN_REVEAL');
      expect(stateAt0.outgoingScene).not.toBeNull();
      expect(stateAt0.outgoingScene?.id).toBe('scene_ch5');
      expect(stateAt0.incomingScene?.id).toBe('scene_ch6');
      expect(stateAt0.transitionProgress).toBeCloseTo(0.0, 3);

      // Verify that at 25%, 50%, 75% transition progresses smoothly
      const stateAt25 = computeTransitionState([ch5Scene, ch6Scene], 18.7 + 1.3 * 0.25);
      expect(stateAt25.transitionProgress).toBeCloseTo(0.25, 2);
      expect(stateAt25.outgoingScene?.id).toBe('scene_ch5');

      const stateAt50 = computeTransitionState([ch5Scene, ch6Scene], 18.7 + 1.3 * 0.5);
      expect(stateAt50.transitionProgress).toBeCloseTo(0.5, 2);
      expect(stateAt50.outgoingScene?.id).toBe('scene_ch5');

      const stateAt75 = computeTransitionState([ch5Scene, ch6Scene], 18.7 + 1.3 * 0.75);
      expect(stateAt75.transitionProgress).toBeCloseTo(0.75, 2);
      expect(stateAt75.outgoingScene?.id).toBe('scene_ch5');

      // At end of transition (20.0s), active scene seamlessly becomes ch6
      const stateAt100 = computeTransitionState([ch5Scene, ch6Scene], 20.0);
      expect(stateAt100.isTransitioning).toBe(false);
      expect(stateAt100.activeScene?.id).toBe('scene_ch6');
    });
  });
});
