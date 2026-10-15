import JSZip from 'jszip';
import { WeddingProject, PhotoItem, AudioTrack } from '../types/project';

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

// Export complete project as ZIP
export async function exportProjectZip(project: WeddingProject): Promise<Blob> {
  const zip = new JSZip();

  const totalPhotos = project.chapters.reduce((acc, ch) => acc + ch.photos.length, 0);

  const manifest: ProjectManifest = {
    manifestVersion: '1.0.0',
    app: 'Wedding Film Story — Tuấn Hùng & Sao Mai',
    exportDate: Date.now(),
    projectTitle: project.title,
    groomName: project.groomName,
    brideName: project.brideName,
    weddingDate: project.weddingDate,
    totalPhotos,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Create media folder
  const mediaFolder = zip.folder('media');
  const projectToExport: WeddingProject = JSON.parse(JSON.stringify(project));

  // Process photos and save binaries
  for (const chapter of projectToExport.chapters) {
    for (let i = 0; i < chapter.photos.length; i++) {
      const photo = chapter.photos[i];
      if (photo.url.startsWith('data:')) {
        const blob = dataUrlToBlob(photo.url);
        const filename = `${photo.id}.png`;
        mediaFolder?.file(filename, blob);
        photo.url = `media/${filename}`;
      } else if (photo.url.startsWith('blob:')) {
        try {
          const resp = await fetch(photo.url);
          const blob = await resp.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          const filename = `${photo.id}.${ext}`;
          mediaFolder?.file(filename, blob);
          photo.url = `media/${filename}`;
        } catch {
          // If fetch fails, retain url
        }
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

// Import project from ZIP
export async function importProjectZip(zipFile: File): Promise<WeddingProject> {
  const zip = await JSZip.loadAsync(zipFile);

  // Validate manifest
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('File ZIP không hợp lệ: Thiếu manifest.json');
  }

  const manifestStr = await manifestFile.async('string');
  const manifest = JSON.parse(manifestStr) as ProjectManifest;
  if (!manifest.manifestVersion) {
    throw new Error('Version manifest không được hỗ trợ');
  }

  // Read project.json
  const projectFile = zip.file('project.json');
  if (!projectFile) {
    throw new Error('Thiếu file cấu hình project.json');
  }

  const projectStr = await projectFile.async('string');
  const project = JSON.parse(projectStr) as WeddingProject;

  // Restore media URLs
  for (const chapter of project.chapters) {
    for (const photo of chapter.photos) {
      if (photo.url.startsWith('media/')) {
        const fileInZip = zip.file(photo.url);
        if (fileInZip) {
          const blob = await fileInZip.async('blob');
          photo.url = URL.createObjectURL(blob);
        }
      }
    }
  }

  // Restore audio URLs
  for (const track of project.audioTracks) {
    if (track.url.startsWith('audio/')) {
      const fileInZip = zip.file(track.url);
      if (fileInZip) {
        const blob = await fileInZip.async('blob');
        track.url = URL.createObjectURL(blob);
      }
    }
  }

  project.updatedAt = Date.now();
  return project;
}

// Utility to trigger browser file download
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
