import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig, type Plugin } from 'vite'

function galleryWatchPlugin(): Plugin {
  let timer: NodeJS.Timeout | null = null;
  return {
    name: 'gallery-watch-plugin',
    configureServer(server) {
      const handleFileChange = (filePath: string) => {
        const normalized = filePath.replace(/\\/g, '/');
        const isGallery = normalized.includes('/public/gallery/') && !normalized.includes('/_optimized/');
        const isAudio = normalized.includes('/public/audio/');
        const isConfig = normalized.endsWith('/config/wedding.config.json');

        if (isGallery || isAudio || isConfig) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(async () => {
            try {
              console.log('\n[VITE WATCHER] Phát hiện thay đổi gallery/audio/config -> Đang đồng bộ...');
              // Dynamically import sync-gallery to keep build cleanly separated
              const { syncGallery } = await import('./scripts/sync-gallery.mjs');
              await syncGallery();
              server.ws.send({ type: 'full-reload' });
            } catch (err: any) {
              console.error('[VITE WATCHER] Lỗi khi đồng bộ gallery:', err.message);
            }
          }, 350);
        }
      };

      server.watcher.on('add', handleFileChange);
      server.watcher.on('unlink', handleFileChange);
      server.watcher.on('change', handleFileChange);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), galleryWatchPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
