import { db } from '../storage/db';
import { PhotoItem, WeddingProject, AudioTrack } from '../types/project';

class MediaManager {
  private activeUrls: Map<string, string> = new Map();

  // Create an object URL and track it for cleanup
  public createTrackedUrl(id: string, blob: Blob): string {
    if (this.activeUrls.has(id)) {
      URL.revokeObjectURL(this.activeUrls.get(id)!);
    }
    const url = URL.createObjectURL(blob);
    this.activeUrls.set(id, url);
    return url;
  }

  // Revoke a specific tracked URL
  public revokeUrl(id: string) {
    const url = this.activeUrls.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(id);
    }
  }

  // Revoke all tracked URLs on unmount / clear
  public revokeAll() {
    this.activeUrls.forEach((url) => URL.revokeObjectURL(url));
    this.activeUrls.clear();
  }

  // Save an uploaded image file into Dexie IndexedDB and return a PhotoItem
  public async saveImageFile(
    file: File,
    chapterId: string,
    projectId: string,
    orderIndex: number
  ): Promise<PhotoItem> {
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Read image dimensions & generate thumbnail
    const { width, height, thumbnailBlob } = await this.createThumbnailAndMeta(file, 480);

    // Save into Dexie db.media
    await db.media.put({
      id: mediaId,
      projectId,
      blob: file,
      mimeType: file.type || 'image/jpeg',
      filename: file.name,
      originalWidth: width,
      originalHeight: height,
      createdAt: Date.now(),
    });

    const liveUrl = this.createTrackedUrl(mediaId, file);
    const thumbnailUrl = thumbnailBlob
      ? this.createTrackedUrl(`${mediaId}_thumb`, thumbnailBlob)
      : liveUrl;

    return {
      id: `photo_${mediaId}`,
      chapterId,
      mediaId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      url: liveUrl,
      thumbnail: thumbnailUrl,
      originalWidth: width,
      originalHeight: height,
      aspectRatio: width / height,
      cropMode: 'cover',
      focalPoint: { x: 50, y: 50 },
      isHero: false,
      order: orderIndex,
      createdAt: Date.now(),
    };
  }

  // Resilient batch upload processor: individual errors do not break entire batch
  public async processBatchUpload(
    files: File[],
    chapterId: string,
    projectId: string,
    startingOrder: number,
    onProgress?: (processed: number, total: number) => void
  ): Promise<{ photos: PhotoItem[]; errors: string[] }> {
    const photos: PhotoItem[] = [];
    const errors: string[] = [];
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      return { photos: [], errors: ['Không tìm thấy file hình ảnh hợp lệ (JPEG, PNG, WebP).'] };
    }

    let processedCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      try {
        const photo = await this.saveImageFile(file, chapterId, projectId, startingOrder + i);
        photos.push(photo);
      } catch (err) {
        console.warn(`Không thể xử lý file ${file.name}:`, err);
        errors.push(`File ${file.name} bị lỗi hoặc định dạng không hỗ trợ.`);
      } finally {
        processedCount++;
        if (onProgress) {
          onProgress(processedCount, imageFiles.length);
        }
      }
    }

    return { photos, errors };
  }

  // Reloads project media blobs and audio from Dexie on application boot / reload
  public async restoreProjectMedia(project: WeddingProject): Promise<WeddingProject> {
    const updated = JSON.parse(JSON.stringify(project)) as WeddingProject;

    // 1. Restore photos from Dexie db.media
    if (updated.chapters && Array.isArray(updated.chapters)) {
      for (const chapter of updated.chapters) {
        if (chapter.photos && Array.isArray(chapter.photos)) {
          for (const photo of chapter.photos) {
            if (photo.mediaId) {
              try {
                const stored = await db.media.get(photo.mediaId);
                if (stored && stored.blob) {
                  photo.url = this.createTrackedUrl(photo.mediaId, stored.blob);
                }
              } catch (err) {
                console.warn(`Lỗi phục hồi media ID ${photo.mediaId}:`, err);
              }
            }
          }
        }
      }
    }

    // 2. Restore audio tracks from Dexie db.audio
    if (updated.audioTracks && Array.isArray(updated.audioTracks)) {
      for (const track of updated.audioTracks) {
        const audioKey = track.mediaId || track.id;
        if (audioKey) {
          try {
            const storedAudio = await db.audio.get(audioKey);
            if (storedAudio && storedAudio.blob) {
              track.url = this.createTrackedUrl(audioKey, storedAudio.blob);
              track.mediaId = audioKey;
              if (storedAudio.duration && (!track.duration || track.duration <= 0)) {
                track.duration = storedAudio.duration;
              }
            }
          } catch (err) {
            console.warn(`Lỗi phục hồi audio ID ${audioKey}:`, err);
          }
        }
      }
    }

    return updated;
  }

  // Save an uploaded audio file into Dexie IndexedDB and return an AudioTrack
  public async saveAudioFile(
    file: File,
    projectId: string,
    trackName?: string
  ): Promise<AudioTrack> {
    const mediaId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const duration = await this.detectAudioDuration(file);

    await db.audio.put({
      id: mediaId,
      projectId,
      blob: file,
      name: trackName || file.name,
      mimeType: file.type || 'audio/mpeg',
      duration,
      createdAt: Date.now(),
    });

    const liveUrl = this.createTrackedUrl(mediaId, file);

    return {
      id: `track_${mediaId}`,
      mediaId,
      name: trackName || file.name.replace(/\.[^/.]+$/, ''),
      url: liveUrl,
      duration,
      startTime: 0,
      endTime: duration,
      volume: 0.85,
      fadeInDuration: 1.5,
      fadeOutDuration: 2.0,
      isGlobal: true,
    };
  }

  private detectAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      if (typeof Audio === 'undefined') return resolve(180);
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const dur = audio.duration || 180;
        URL.revokeObjectURL(objectUrl);
        resolve(dur);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(180);
      };
      audio.src = objectUrl;
    });
  }

  // Generate thumbnail and get dimensions
  private createThumbnailAndMeta(
    file: File,
    maxThumbWidth: number
  ): Promise<{ width: number; height: number; thumbnailBlob: Blob | null }> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const naturalWidth = img.naturalWidth || 1920;
        const naturalHeight = img.naturalHeight || 1080;

        try {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxThumbWidth / naturalWidth);
          canvas.width = Math.round(naturalWidth * scale);
          canvas.height = Math.round(naturalHeight * scale);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(objectUrl);
                resolve({
                  width: naturalWidth,
                  height: naturalHeight,
                  thumbnailBlob: blob,
                });
              },
              'image/jpeg',
              0.82
            );
            return;
          }
        } catch {
          // Fallback if canvas fails
        }

        URL.revokeObjectURL(objectUrl);
        resolve({
          width: naturalWidth,
          height: naturalHeight,
          thumbnailBlob: null,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: 1920,
          height: 1080,
          thumbnailBlob: null,
        });
      };

      img.src = objectUrl;
    });
  }
}

export const mediaManager = new MediaManager();
