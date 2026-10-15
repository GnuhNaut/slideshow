import JSZip from 'jszip';
import { WeddingProject, PhotoItem, AudioTrack } from '../types/project';
import { db } from '../storage/db';
import { mediaManager } from '../media/mediaManager';

export interface ProjectManifest {
  manifestVersion: string;
  app: string;
  exportDate: number;
  projectTitle: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  totalPhotos: number;
}

// Converts data URL to Blob
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Export complete project as ZIP pulling binaries from IndexedDB
export async function exportProjectZip(project: WeddingProject): Promise<Blob> {
  const zip = new JSZip();

  const totalPhotos = project.chapters.reduce((acc, ch) => acc + ch.photos.length, 0);

  const manifest: ProjectManifest = {
    manifestVersion: '2.0.0',
    app: 'Wedding Film Story — Tuấn Hùng & Sao Mai (V2)',
    exportDate: Date.now(),
    projectTitle: project.title,
    groomName: project.groomName,
    brideName: project.brideName,
    weddingDate: project.weddingDate,
    totalPhotos,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const mediaFolder = zip.folder('media');
  const projectToExport: WeddingProject = JSON.parse(JSON.stringify(project));

  // Process photos and write real binary blobs into zip
  for (const chapter of projectToExport.chapters) {
    for (const photo of chapter.photos) {
      let photoBlob: Blob | null = null;
      let ext = 'jpg';

      if (photo.mediaId) {
        try {
          const stored = await db.media.get(photo.mediaId);
          if (stored && stored.blob) {
            photoBlob = stored.blob;
            ext = stored.mimeType.includes('png') ? 'png' : 'jpg';
          }
        } catch (e) {
          console.warn('Could not read from db.media:', e);
        }
      }

      if (!photoBlob && photo.url) {
        if (photo.url.startsWith('data:')) {
          photoBlob = dataUrlToBlob(photo.url);
          ext = photoBlob.type.includes('png') ? 'png' : 'jpg';
        } else if (photo.url.startsWith('blob:')) {
          try {
            const resp = await fetch(photo.url);
            photoBlob = await resp.blob();
            ext = photoBlob.type.includes('png') ? 'png' : 'jpg';
          } catch {
            // Skip if fetch fails
          }
        }
      }

      if (photoBlob) {
        const filename = `${photo.id}.${ext}`;
        mediaFolder?.file(filename, photoBlob);
        photo.url = `media/${filename}`;
      }
    }
  }

  // Audio folder
  const audioFolder = zip.folder('audio');
  for (const track of projectToExport.audioTracks) {
    if (track.url.startsWith('blob:')) {
      try {
        const resp = await fetch(track.url);
        const blob = await resp.blob();
        const filename = `${track.id}.mp3`;
        audioFolder?.file(filename, blob);
        track.url = `audio/${filename}`;
      } catch {
        // Continue
      }
    }
  }

  zip.file('project.json', JSON.stringify(projectToExport, null, 2));

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

import { compileProjectTimeline } from '../timeline/compiler';

/**
 * Validates project JSON against WeddingProject schema
 */
export function validateProjectSchema(data: unknown): data is WeddingProject {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  if (typeof p.id !== 'string' || typeof p.title !== 'string') return false;
  if (!Array.isArray(p.chapters) || p.chapters.length === 0) return false;
  if (!Array.isArray(p.audioTracks)) return false;
  return true;
}

interface StagedMediaRecord {
  id: string;
  projectId: string;
  blob: Blob;
  mimeType: string;
  filename: string;
  originalWidth: number;
  originalHeight: number;
  createdAt: number;
}

// Atomic Import with Prepare, Stage, Commit, Activate & Rollback (TC-54, TC-55, TC-56)
export async function importProjectZip(zipFile: File): Promise<WeddingProject> {
  // 1. Phase: PREPARE (Validate ZIP & Files without touching storage)
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipFile);
  } catch (err) {
    throw new Error(`File ZIP bị hỏng hoặc không đúng định dạng: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Validate manifest
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('File ZIP không hợp lệ: Thiếu manifest.json');
  }

  let manifest: ProjectManifest;
  try {
    const manifestStr = await manifestFile.async('string');
    manifest = JSON.parse(manifestStr) as ProjectManifest;
  } catch {
    throw new Error('File manifest.json bị lỗi cú pháp');
  }

  if (!manifest.manifestVersion) {
    throw new Error('Version manifest không được hỗ trợ');
  }

  // Read and validate project.json
  const projectFile = zip.file('project.json');
  if (!projectFile) {
    throw new Error('File ZIP không hợp lệ: Thiếu file cấu hình project.json');
  }

  let rawProject: unknown;
  try {
    const projectStr = await projectFile.async('string');
    rawProject = JSON.parse(projectStr);
  } catch {
    throw new Error('File project.json bị lỗi cú pháp');
  }

  if (!validateProjectSchema(rawProject)) {
    throw new Error('Cấu trúc file project.json không đúng định dạng WeddingProject hợp lệ');
  }

  const stagedProject: WeddingProject = JSON.parse(JSON.stringify(rawProject));

  // 2. Phase: STAGE (Extract binaries into memory, compile timeline for verification)
  const stagedMediaRecords: StagedMediaRecord[] = [];
  const stagedAudioBlobs: { track: AudioTrack; blob: Blob }[] = [];

  for (const chapter of stagedProject.chapters) {
    for (const photo of chapter.photos) {
      if (photo.url && photo.url.startsWith('media/')) {
        const fileInZip = zip.file(photo.url);
        if (fileInZip) {
          const blob = await fileInZip.async('blob');
          const newMediaId = `media_import_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          stagedMediaRecords.push({
            id: newMediaId,
            projectId: stagedProject.id,
            blob,
            mimeType: blob.type || 'image/jpeg',
            filename: photo.title || 'imported_photo',
            originalWidth: photo.originalWidth || 1920,
            originalHeight: photo.originalHeight || 1080,
            createdAt: Date.now(),
          });
          photo.mediaId = newMediaId;
        } else {
          // Graceful fallback if a single photo file is missing in zip
          console.warn(`Media file missing in ZIP: ${photo.url}`);
        }
      }
    }
  }

  for (const track of stagedProject.audioTracks) {
    if (track.url && track.url.startsWith('audio/')) {
      const fileInZip = zip.file(track.url);
      if (fileInZip) {
        const blob = await fileInZip.async('blob');
        stagedAudioBlobs.push({ track, blob });
      }
    }
  }

  // Pre-compile timeline to verify scenes are completely valid
  const verifiedTimeline = compileProjectTimeline(stagedProject);
  if (!verifiedTimeline || verifiedTimeline.scenes.length === 0 || verifiedTimeline.totalDuration <= 0) {
    throw new Error('Không thể tạo dòng thời gian từ dữ liệu dự án đã nhập');
  }

  // 3. Phase: COMMIT (Atomic IndexedDB transaction with zero tolerance for partial writes)
  try {
    if (typeof db.transaction === 'function') {
      await db.transaction('rw', [db.projects, db.media], async () => {
        for (const item of stagedMediaRecords) {
          await db.media.put(item);
        }
        stagedProject.updatedAt = Date.now();
        await db.projects.put(stagedProject);
      });
    } else {
      // Fallback for non-Dexie transaction environments
      for (const item of stagedMediaRecords) {
        await db.media.put(item);
      }
      stagedProject.updatedAt = Date.now();
      await db.projects.put(stagedProject);
    }
  } catch (storageErr) {
    console.error('IndexedDB transaction failed during import:', storageErr);
    throw new Error(
      `Lỗi khi ghi dữ liệu vào bộ nhớ máy: ${storageErr instanceof Error ? storageErr.message : 'QuotaExceededError hoặc Transaction Aborted'}`
    );
  }

  // 4. Phase: ACTIVATE (Create tracked URLs for photos and audio)
  for (const m of stagedMediaRecords) {
    for (const chapter of stagedProject.chapters) {
      for (const photo of chapter.photos) {
        if (photo.mediaId === m.id) {
          photo.url = mediaManager.createTrackedUrl(m.id, m.blob);
        }
      }
    }
  }

  for (const item of stagedAudioBlobs) {
    item.track.url = URL.createObjectURL(item.blob);
  }

  return stagedProject;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
