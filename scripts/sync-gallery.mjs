// scripts/sync-gallery.mjs
// Project Folder Gallery System — Auto Photo & Audio Scanner with Sharp Image Optimization
// Scans public/gallery and public/audio, generates optimized derivatives, merges wedding.config.json,
// and outputs src/generated/galleryManifest.json & src/generated/galleryManifest.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const GALLERY_DIR = path.join(rootDir, 'public', 'gallery');
const OPTIMIZED_DIR = path.join(GALLERY_DIR, '_optimized');
const AUDIO_DIR = path.join(rootDir, 'public', 'audio');
const CONFIG_FILE = path.join(rootDir, 'config', 'wedding.config.json');
const OUTPUT_DIR = path.join(rootDir, 'src', 'generated');
const CACHE_DIR = path.join(rootDir, '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'gallery-opt-cache.json');
const MANIFEST_JSON = path.join(OUTPUT_DIR, 'galleryManifest.json');
const MANIFEST_TS = path.join(OUTPUT_DIR, 'galleryManifest.ts');

export const CHAPTER_MAPPING = [
  { folder: '01-intro', id: 'ch1_intro', index: 1, title: 'Mở Đầu', defaultVietTitle: 'Chương I: Lời Mở Đầu' },
  { folder: '02-memories', id: 'ch2_memories', index: 2, title: 'Kỷ Niệm', defaultVietTitle: 'Chương II: Những Ngày Bên Nhau' },
  { folder: '03-proposal', id: 'ch3_proposal', index: 3, title: 'Cầu Hôn', defaultVietTitle: 'Chương III: Lời Cầu Hôn' },
  { folder: '04-family', id: 'ch4_family', index: 4, title: 'Gia Đình', defaultVietTitle: 'Chương IV: Hai Gia Đình, Một Hạnh Phúc' },
  { folder: '05-wedding', id: 'ch5_wedding', index: 5, title: 'Ảnh Cưới', defaultVietTitle: 'Chương V: Ngày Chung Đôi' },
  { folder: '06-thanks', id: 'ch6_thanks', index: 6, title: 'Cảm Ơn', defaultVietTitle: 'Chương VI: Lời Cảm Ơn' },
  { folder: '07-final', id: 'ch7_forever', index: 7, title: 'Kết Thúc', defaultVietTitle: 'Chương VII: Khép Lại & Mãi Mãi' },
];

const VALID_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif']);
const VALID_AUDIO_EXTS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg']);

// Dynamically load sharp if present
let sharpModule = null;
try {
  const mod = await import('sharp');
  sharpModule = mod.default || mod;
} catch {
  // sharp not available, fall back to pure-Node parser
}

/**
 * Natural numeric comparison for file sorting:
 * 1.jpg, 2.jpg, 10.jpg -> sorted numerically
 */
export function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Pure Node.js fallback image dimension parser
 */
function getPureNodeDimensions(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(32768);
    const bytesRead = fs.readSync(fd, buffer, 0, 32768, 0);
    fs.closeSync(fd);

    if (bytesRead < 16) return { width: 1920, height: 1080 };

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < bytesRead - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) return { width, height };
        }
        const len = buffer.readUInt16BE(offset + 2);
        offset += 2 + len;
      }
    }

    // WebP
    if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      const format = buffer.toString('ascii', 12, 16);
      if (format === 'VP8 ') {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      } else if (format === 'VP8L') {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      } else if (format === 'VP8X') {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        if (width > 0 && height > 0) return { width, height };
      }
    }
  } catch (err) {
    // Ignore read error, return standard 16:9
  }

  return { width: 1920, height: 1080 };
}

/**
 * Load optimization cache from disk
 */
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Save optimization cache to disk
 */
function saveCache(cache) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Process a single image: extract dimensions (respecting EXIF), generate WebP derivatives
 */
async function processImage(fullPath, relPath, cache) {
  const stat = fs.statSync(fullPath);
  const cacheKey = relPath.replace(/\\/g, '/');
  const cached = cache[cacheKey];

  const safeBaseName = relPath.replace(/[\\/]/g, '_').replace(/\.[^/.]+$/, '');
  const thumbFileName = `${safeBaseName}_thumb.webp`;
  const mediumFileName = `${safeBaseName}_medium.webp`;
  const displayFileName = `${safeBaseName}_display.webp`;

  const thumbRelUrl = `/gallery/_optimized/${thumbFileName}`;
  const mediumRelUrl = `/gallery/_optimized/${mediumFileName}`;
  const displayRelUrl = `/gallery/_optimized/${displayFileName}`;

  const thumbDiskPath = path.join(OPTIMIZED_DIR, thumbFileName);
  const mediumDiskPath = path.join(OPTIMIZED_DIR, mediumFileName);
  const displayDiskPath = path.join(OPTIMIZED_DIR, displayFileName);

  // Check if cache entry is valid and derivative files exist
  if (
    cached &&
    cached.mtime === stat.mtimeMs &&
    cached.size === stat.size &&
    fs.existsSync(thumbDiskPath) &&
    fs.existsSync(mediumDiskPath) &&
    fs.existsSync(displayDiskPath)
  ) {
    return {
      width: cached.width,
      height: cached.height,
      thumbnail: thumbRelUrl,
      mediumUrl: mediumRelUrl,
      displayUrl: displayRelUrl,
      originalUrl: `/gallery/${cacheKey}`,
    };
  }

  // Generate with sharp if available
  if (sharpModule) {
    try {
      if (!fs.existsSync(OPTIMIZED_DIR)) {
        fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
      }

      const instance = sharpModule(fullPath);
      const metadata = await instance.metadata();

      let width = metadata.width || 1920;
      let height = metadata.height || 1080;

      // Handle EXIF orientation: values 5, 6, 7, 8 swap width and height
      if (metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8) {
        const tmp = width;
        width = height;
        height = tmp;
      }

      // 1. Thumbnail (max 240px, webp q75)
      await sharpModule(fullPath)
        .rotate()
        .resize({ width: 240, height: 240, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbDiskPath);

      // 2. Medium (max 960px, webp q82)
      await sharpModule(fullPath)
        .rotate()
        .resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(mediumDiskPath);

      // 3. Display / Full-Screen Presentation (max 1920px, webp q85)
      await sharpModule(fullPath)
        .rotate()
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(displayDiskPath);

      cache[cacheKey] = {
        mtime: stat.mtimeMs,
        size: stat.size,
        width,
        height,
      };

      return {
        width,
        height,
        thumbnail: thumbRelUrl,
        mediumUrl: mediumRelUrl,
        displayUrl: displayRelUrl,
        originalUrl: `/gallery/${cacheKey}`,
      };
    } catch (err) {
      console.warn(`[CẢNH BÁO] Không thể tối ưu bằng sharp cho "${relPath}":`, err.message);
    }
  }

  // Fallback if sharp unavailable or failed
  const dims = getPureNodeDimensions(fullPath);
  const fallbackUrl = `/gallery/${cacheKey}`;
  return {
    width: dims.width,
    height: dims.height,
    thumbnail: fallbackUrl,
    mediumUrl: fallbackUrl,
    displayUrl: fallbackUrl,
    originalUrl: fallbackUrl,
  };
}

/**
 * Main synchronizer function
 */
export async function syncGallery() {
  console.log('--------------------------------------------------');
  console.log('[GALLERY SYNC] Bắt đầu đồng bộ thư viện ảnh & nhạc...');

  // Ensure directories exist
  if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(OPTIMIZED_DIR)) fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });

  const cache = loadCache();

  // 1. Read & Validate wedding.config.json
  let config = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      config = JSON.parse(raw);
    } catch (err) {
      console.error(`[LỖI] File config/wedding.config.json bị sai cú pháp JSON:`, err.message);
      process.exit(1);
    }
  } else {
    console.warn(`[CẢNH BÁO] Không tìm thấy config/wedding.config.json. Sử dụng cấu hình mặc định.`);
  }

  const projConfig = config.project || {};
  const displayConfig = config.display || {};
  const audioConfig = config.audio || {};
  const chaptersConfig = config.chapters || {};
  const photoOverrides = config.photoOverrides || {};
  const defaultCropMode = displayConfig.defaultCropMode || 'contain';

  // 2. Scan each Chapter Folder
  const scannedChapters = [];
  const allScannedPhotos = [];
  let totalPhotoCount = 0;

  for (const mapping of CHAPTER_MAPPING) {
    const chapterDir = path.join(GALLERY_DIR, mapping.folder);
    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir, { recursive: true });
      fs.writeFileSync(path.join(chapterDir, '.gitkeep'), '');
    }

    const chapterCustomConfig = chaptersConfig[mapping.folder] || {};
    const chapterCropMode = chapterCustomConfig.cropMode || defaultCropMode;

    const files = fs.readdirSync(chapterDir);
    const validImageFiles = files
      .filter((file) => {
        if (file.startsWith('.')) return false; // Ignore .gitkeep, hidden files
        const ext = path.extname(file).toLowerCase();
        return VALID_IMAGE_EXTS.has(ext);
      })
      .sort(naturalSort);

    const chapterPhotos = [];
    let orderIndex = 0;

    for (const file of validImageFiles) {
      const fullPath = path.join(chapterDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.size === 0) {
        console.warn(`[CẢNH BÁO] Bỏ qua file 0 byte: ${mapping.folder}/${file}`);
        continue;
      }

      const ext = path.extname(file).toLowerCase();
      if ((ext === '.heic' || ext === '.heif') && !sharpModule) {
        console.warn(
          `[CẢNH BÁO] File ${mapping.folder}/${file} là định dạng HEIC/HEIF. Vui lòng chuyển sang JPEG/WebP để bảo đảm hiển thị trên mọi trình duyệt.`
        );
      }

      const relPath = `${mapping.folder}/${file}`.replace(/\\/g, '/');
      const photoId = `photo_${mapping.id}_${file.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      // Process dimensions and derivatives
      const processed = await processImage(fullPath, relPath, cache);
      const aspectRatio = Number((processed.width / processed.height).toFixed(4));

      // Check overrides
      const override = photoOverrides[relPath] || {};
      const cropMode = override.cropMode || chapterCropMode;
      const focalPoint = override.focalPoint || { x: 50, y: 50 };
      const isHero = override.isHero ?? (orderIndex === 0 && (mapping.index === 1 || mapping.index === 3));
      const duration = typeof override.durationSeconds === 'number' ? override.durationSeconds : undefined;

      const photoItem = {
        id: photoId,
        chapterId: mapping.id,
        title: path.basename(file, path.extname(file)),
        url: processed.displayUrl,
        thumbnail: processed.thumbnail,
        mediumUrl: processed.mediumUrl,
        displayUrl: processed.displayUrl,
        originalUrl: processed.originalUrl,
        originalWidth: processed.width,
        originalHeight: processed.height,
        aspectRatio,
        cropMode,
        focalPoint,
        isHero,
        duration,
        order: orderIndex++,
        createdAt: 0, // deterministic
        relativePath: relPath,
      };

      chapterPhotos.push(photoItem);
      allScannedPhotos.push(photoItem);
    }

    totalPhotoCount += chapterPhotos.length;

    // Build ChapterConfig
    const isCustomDuration =
      typeof chapterCustomConfig.durationSeconds === 'number' && chapterCustomConfig.durationSeconds > 0;
    const defaultDuration = mapping.index === 1 ? 14 : (mapping.index === 2 ? 60 : (mapping.index === 7 ? 2 : 15));

    const chapterObj = {
      id: mapping.id,
      chapterIndex: mapping.index,
      folderName: mapping.folder,
      title: mapping.title,
      vietnameseTitle: chapterCustomConfig.vietnameseTitle || mapping.defaultVietTitle,
      subtitle: chapterCustomConfig.subtitle || '',
      description: chapterCustomConfig.description || '',
      enabled: chapterCustomConfig.enabled !== false,
      mode: isCustomDuration ? 'custom' : 'auto',
      effectMode: chapterCustomConfig.effectMode || (mapping.index === 2 ? 'f02_dual_roll' : 'custom'),
      speed: chapterCustomConfig.speed || 48,
      durationOverride: isCustomDuration ? chapterCustomConfig.durationSeconds : defaultDuration,
      transitionType: chapterCustomConfig.transitionType || 'soft_light',
      photos: chapterPhotos,
      cropMode: chapterCropMode,
      musicTrackId: undefined,
      accentQuote: chapterCustomConfig.accentQuote || undefined,
      showCenterTitle: chapterCustomConfig.showCenterTitle ?? true,
      showCenterNames: chapterCustomConfig.showCenterNames ?? false,
      showFrameNames: chapterCustomConfig.showFrameNames ?? false,
      showMetadata35mm: chapterCustomConfig.showMetadata35mm ?? false,
      showQuote: chapterCustomConfig.showQuote ?? true,
      filmstripSpeedMode: chapterCustomConfig.filmstripSpeedMode || 'auto',
      filmstripSpeedCustom: chapterCustomConfig.filmstripSpeedCustom || 48,
    };

    scannedChapters.push(chapterObj);
  }

  saveCache(cache);

  // 3. Scan Audio Files
  const audioTracks = [];
  const globalAudioDir = path.join(AUDIO_DIR, 'global');
  if (!fs.existsSync(globalAudioDir)) {
    fs.mkdirSync(globalAudioDir, { recursive: true });
    fs.writeFileSync(path.join(globalAudioDir, '.gitkeep'), '');
  }

  // Global Audio Track
  let globalTrackFile = null;
  if (audioConfig.globalFile) {
    const candidatePath = path.join(AUDIO_DIR, audioConfig.globalFile);
    if (fs.existsSync(candidatePath)) {
      globalTrackFile = audioConfig.globalFile;
    }
  }

  if (!globalTrackFile && fs.existsSync(globalAudioDir)) {
    const globalFiles = fs.readdirSync(globalAudioDir).filter((f) => {
      return !f.startsWith('.') && VALID_AUDIO_EXTS.has(path.extname(f).toLowerCase());
    });
    if (globalFiles.length > 0) {
      globalTrackFile = `global/${globalFiles[0]}`;
    }
  }

  if (globalTrackFile) {
    audioTracks.push({
      id: 'track_global_fs',
      name: path.basename(globalTrackFile, path.extname(globalTrackFile)),
      url: `/audio/${globalTrackFile}`,
      duration: 0,
      startTime: 0,
      endTime: 0,
      volume: audioConfig.globalVolume ?? 0.85,
      fadeInDuration: 1.2,
      fadeOutDuration: 2.0,
      isGlobal: true,
    });
  }

  // Per-Chapter Audio Tracks
  const perChapterConfig = audioConfig.perChapter || {};
  for (const mapping of CHAPTER_MAPPING) {
    const chapterAudioDir = path.join(AUDIO_DIR, mapping.folder);
    if (!fs.existsSync(chapterAudioDir)) {
      fs.mkdirSync(chapterAudioDir, { recursive: true });
      fs.writeFileSync(path.join(chapterAudioDir, '.gitkeep'), '');
    }

    let chapterAudioFile = perChapterConfig[mapping.folder];
    if (chapterAudioFile) {
      const fullP = path.join(AUDIO_DIR, chapterAudioFile);
      if (!fs.existsSync(fullP)) chapterAudioFile = null;
    }

    if (!chapterAudioFile && fs.existsSync(chapterAudioDir)) {
      const chFiles = fs.readdirSync(chapterAudioDir).filter((f) => {
        return !f.startsWith('.') && VALID_AUDIO_EXTS.has(path.extname(f).toLowerCase());
      });
      if (chFiles.length > 0) {
        chapterAudioFile = `${mapping.folder}/${chFiles[0]}`;
      }
    }

    if (chapterAudioFile) {
      const trackId = `track_${mapping.id}_fs`;
      audioTracks.push({
        id: trackId,
        chapterId: mapping.id,
        name: path.basename(chapterAudioFile, path.extname(chapterAudioFile)),
        url: `/audio/${chapterAudioFile}`,
        duration: 0,
        startTime: 0,
        endTime: 0,
        volume: 0.85,
        fadeInDuration: 1.0,
        fadeOutDuration: 1.5,
        isGlobal: false,
      });

      const ch = scannedChapters.find((c) => c.id === mapping.id);
      if (ch) ch.musicTrackId = trackId;
    }
  }

  // 4. Resolve Opening & Ending Photos
  let openingPhotoId = undefined;
  if (projConfig.openingPhoto) {
    const match = allScannedPhotos.find((p) => p.relativePath === projConfig.openingPhoto);
    if (match) openingPhotoId = match.id;
  }
  if (!openingPhotoId && allScannedPhotos.length > 0) {
    openingPhotoId = allScannedPhotos[0].id;
  }

  let endingPhotoId = undefined;
  if (projConfig.endingPhoto) {
    const match = allScannedPhotos.find((p) => p.relativePath === projConfig.endingPhoto);
    if (match) endingPhotoId = match.id;
  }
  if (!endingPhotoId && allScannedPhotos.length > 0) {
    endingPhotoId = allScannedPhotos[allScannedPhotos.length - 1].id;
  }

  // 5. Build Project Object
  const project = {
    id: 'wedding_project_fs',
    version: '3.3.0',
    contentSource: 'filesystem',
    title: 'WEDDING FILM STORY',
    groomName: projConfig.groomName || 'Tuấn Hùng',
    brideName: projConfig.brideName || 'Sao Mai',
    weddingDate: projConfig.weddingDate || '19.10.2026',
    lunarDate: projConfig.lunarDate || '09.09 Bính Ngọ',
    venueName: projConfig.venueName || 'Trung tâm tiệc cưới Trống Đồng Palace',
    thankYouMessage:
      projConfig.thankYouMessage ||
      'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.',
    openingPhotoId,
    endingPhotoId,
    chapters: scannedChapters,
    audioTracks,
    globalSettings: {
      aspectRatio: displayConfig.aspectRatio || '16:9',
      cinemaPace: 'cinematic',
      quality: 'presentation',
      enableFilmGrain: true,
      enableVignette: true,
      enableSprockets: true,
      filmColorTone: 'warm_classic',
      performanceMode: displayConfig.performanceMode || 'balanced',
      audioMode: audioConfig.mode || 'global',
      crossfadeDuration: audioConfig.crossfadeSeconds ?? 0.8,
      loopGlobalAudio: audioConfig.loopGlobal !== false,
    },
    createdAt: 1792151963046,
    updatedAt: 1792151963046,
  };

  // 6. Write Manifest Files
  const manifestData = {
    generatedAt: new Date().toISOString(),
    totalPhotos: totalPhotoCount,
    totalAudioTracks: audioTracks.length,
    project,
  };

  fs.writeFileSync(MANIFEST_JSON, JSON.stringify(manifestData, null, 2), 'utf-8');

  const tsContent = `// Auto-generated by scripts/sync-gallery.mjs
// Do not edit manually.

import { WeddingProject } from '../types/project';

export const filesystemProject: WeddingProject = ${JSON.stringify(project, null, 2)};
export const totalPhotosFound: number = ${totalPhotoCount};
export const totalAudioFound: number = ${audioTracks.length};
`;

  fs.writeFileSync(MANIFEST_TS, tsContent, 'utf-8');

  console.log(`[GALLERY SYNC] Thành công! Tìm thấy: ${totalPhotoCount} ảnh, ${audioTracks.length} track nhạc.`);
  console.log(`[GALLERY SYNC] Đã ghi: ${path.relative(rootDir, MANIFEST_JSON)}`);
  console.log(`[GALLERY SYNC] Đã ghi: ${path.relative(rootDir, MANIFEST_TS)}`);
  console.log('--------------------------------------------------');

  return manifestData;
}

// Auto-run if executed directly
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('sync-gallery.mjs') || process.argv[1].includes('sync-gallery'));

if (isDirectRun) {
  syncGallery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[GALLERY SYNC] Lỗi trong quá trình quét gallery:', err);
      process.exit(1);
    });
}
