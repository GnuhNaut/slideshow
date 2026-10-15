import React, { useEffect, useRef, useState } from 'react';
import { useWeddingStore } from './app/store';
import { ProjectHome } from './pages/ProjectHome';
import { WeddingStudio } from './pages/WeddingStudio';
import { StagePlayer } from './components/player/StagePlayer';
import { exportProjectZip, importProjectZip, downloadBlob } from './project/exportImport';
import { Check, AlertTriangle, X } from 'lucide-react';

export const App: React.FC = () => {
  const viewMode = useWeddingStore((s) => s.viewMode);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const initStore = useWeddingStore((s) => s.initStore);
  const project = useWeddingStore((s) => s.project);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Initialize store and sync hash routes
  useEffect(() => {
    initStore();

    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#stage' || hash === '#player' || params.get('mode') === 'stage') {
        setViewMode('player');
      } else if (hash === '#studio') {
        setViewMode('studio');
      } else if (hash === '#home') {
        setViewMode('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [initStore, setViewMode]);

  // Keep hash synced with viewMode
  useEffect(() => {
    if (viewMode === 'studio' && window.location.hash !== '#studio') {
      window.location.hash = '#studio';
    } else if (viewMode === 'player' && window.location.hash !== '#stage') {
      window.location.hash = '#stage';
    } else if (viewMode === 'home' && window.location.hash !== '#home' && window.location.hash !== '') {
      window.location.hash = '#home';
    }
  }, [viewMode]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle Export ZIP
  const handleExportZip = async () => {
    try {
      showToast('Đang đóng gói file ZIP dự án...');
      const zipBlob = await exportProjectZip(project);
      const filename = `WeddingFilm_${project.groomName}_${project.brideName}_2026.zip`.replace(
        /\s+/g,
        '_'
      );
      downloadBlob(zipBlob, filename);
      showToast('Xuất dự án ZIP thành công! Bạn có thể lưu trữ hoặc chuyển sang máy khác.');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Lỗi khi xuất gói ZIP. Vui lòng thử lại.', 'error');
    }
  };

  // Trigger Import ZIP
  const handleImportZipClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Đang giải nén và kiểm tra file dự án...');
      const importedProject = await importProjectZip(file);
      // Put in Dexie and update Zustand store
      useWeddingStore.setState({
        project: importedProject,
        activeChapterId: importedProject.chapters[0]?.id || 'ch1_intro',
        selectedPhotoId: importedProject.chapters[0]?.photos[0]?.id || null,
      });
      await useWeddingStore.getState().saveProjectToDb();
      showToast(`Đã khôi phục thành công dự án: ${importedProject.title}`);
    } catch (err: unknown) {
      console.error('Import failed:', err);
      const msg = err instanceof Error ? err.message : 'File ZIP không hợp lệ';
      showToast(`Nhập dự án thất bại: ${msg}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#151114] text-[#FFF4E4]">
      {/* Hidden file input for project import */}
      <input
        ref={importInputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={handleImportFileChange}
        className="hidden"
      />

      {/* Main View Mode Switcher */}
      {viewMode === 'home' && (
        <ProjectHome
          onOpenSettings={() => {
            setViewMode('studio');
          }}
          onExportZip={handleExportZip}
          onImportZip={handleImportZipClick}
        />
      )}

      {viewMode === 'studio' && (
        <WeddingStudio
          onExportZip={handleExportZip}
          onImportZip={handleImportZipClick}
        />
      )}

      {viewMode === 'player' && <StagePlayer />}

      {/* User Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1e151b] border border-[#ecd28f]/50 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-xs text-[#FFF4E4] font-serif tracking-wide backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-[#ecd28f]/60 hover:text-[#ecd28f]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
