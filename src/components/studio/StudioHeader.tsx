import React from 'react';
import {
  Film,
  Maximize2,
  Download,
  Upload,
  Undo2,
  Redo2,
  Settings,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MonitorPlay,
  Music,
} from 'lucide-react';
import { useWeddingStore, SaveStatus } from '../../app/store';
import { remoteChannel } from '../../player/remoteChannel';

interface StudioHeaderProps {
  onOpenSettings: () => void;
  onOpenAudio?: () => void;
  onExportZip: () => void;
  onImportZip: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onOpenSettings,
  onOpenAudio,
  onExportZip,
  onImportZip,
}) => {
  const project = useWeddingStore((s) => s.project);
  const saveStatus = useWeddingStore((s) => s.saveStatus);
  const setViewMode = useWeddingStore((s) => s.setViewMode);
  const undo = useWeddingStore((s) => s.undo);
  const redo = useWeddingStore((s) => s.redo);
  const undoStack = useWeddingStore((s) => s.undoStack);
  const redoStack = useWeddingStore((s) => s.redoStack);

  const isFilesystemMode = project.contentSource === 'filesystem';

  const renderSaveBadge = (status: SaveStatus) => {
    if (isFilesystemMode) {
      if (status === 'local_preview') {
        return (
          <span
            className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-medium cursor-help"
            title="Đang xem trước thay đổi trên trình duyệt này. Để lưu vĩnh viễn trên mọi máy, hãy sửa file config/wedding.config.json và đẩy lên GitHub."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Xem trước cục bộ</span>
          </span>
        );
      }
      return (
        <span
          className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-medium cursor-help"
          title="Nguồn dữ liệu từ thư mục dự án (Repository / Filesystem). Đồng bộ trên mọi máy tính."
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Đồng bộ từ Repository</span>
        </span>
      );
    }

    switch (status) {
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đã lưu tự động</span>
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-xs text-[#C5A16E] font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Đang lưu...</span>
          </span>
        );
      case 'unsaved':
      case 'local_preview':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Chờ lưu</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lỗi lưu</span>
          </span>
        );
    }
  };

  return (
    <header className="h-14 px-4 md:px-6 bg-white border-b border-[#C5A16E]/20 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode('home')}
          className="p-1.5 rounded text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer transition-colors"
          title="Về Trang Chủ"
        >
          <Home className="w-4 h-4 text-[#C93442]" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#C93442] flex items-center justify-center shadow-sm">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs md:text-sm font-serif font-bold text-[#40322F] tracking-wide">
                STUDIO DỰNG PHIM
              </h1>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                isFilesystemMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-[#FAF5EE] text-[#C93442] border-[#C5A16E]/30'
              }`} title={isFilesystemMode ? 'Chế độ Repository (Filesystem)' : 'Chế độ Trình duyệt (Browser Edit)'}>
                {isFilesystemMode ? 'FILESYSTEM' : 'BROWSER EDIT'}
              </span>
              {renderSaveBadge(saveStatus)}
            </div>
            <p className="text-[10px] text-[#40322F]/70 font-serif italic truncate max-w-[200px] sm:max-w-none">
              {project.groomName} &amp; {project.brideName} • {project.weddingDate}
            </p>
          </div>
        </div>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FAF5EE] border border-[#C5A16E]/25 rounded">
        <button
          type="button"
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1.5 rounded text-[#40322F] hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1.5 rounded text-[#40322F] hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Dual Screen Remote Trigger */}
        <button
          type="button"
          onClick={() => remoteChannel.openStageWindow()}
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#C5A16E]/30 bg-white hover:bg-[#FAF3EB] text-[#40322F] text-xs font-serif cursor-pointer transition-colors shadow-sm"
          title="Mở cửa sổ trình chiếu thứ hai trên màn hình LED/TV"
        >
          <MonitorPlay className="w-3.5 h-3.5 text-[#C5A16E]" />
          <span>Màn Hình 2</span>
        </button>

        {/* Audio Director */}
        {onOpenAudio && (
          <button
            type="button"
            onClick={onOpenAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#C5A16E]/35 text-[#40322F] bg-white hover:bg-[#FAF3EB] hover:text-[#C93442] text-xs font-serif cursor-pointer transition-colors shadow-sm"
            title="Quản lý nhạc nền (Audio Director)"
          >
            <Music className="w-3.5 h-3.5 text-[#C93442]" />
            <span className="hidden md:inline">Nhạc Nền</span>
          </button>
        )}

        {/* Project Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded border border-[#C5A16E]/30 text-[#40322F] bg-white hover:bg-[#FAF3EB] hover:text-[#C93442] cursor-pointer transition-colors shadow-sm"
          title="Cài đặt thông tin dự án"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Import & Export */}
        <button
          type="button"
          onClick={onImportZip}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#C5A16E]/30 bg-white text-[#40322F] hover:bg-[#FAF3EB] text-xs font-serif cursor-pointer transition-colors shadow-sm"
          title="Nhập file dự án ZIP"
        >
          <Upload className="w-3.5 h-3.5 text-[#C5A16E]" />
          <span>Nhập ZIP</span>
        </button>

        <button
          type="button"
          onClick={onExportZip}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#C5A16E]/30 bg-white text-[#40322F] hover:bg-[#FAF3EB] text-xs font-serif cursor-pointer transition-colors shadow-sm"
          title="Xuất trọn gói file ZIP"
        >
          <Download className="w-3.5 h-3.5 text-[#C5A16E]" />
          <span>Xuất ZIP</span>
        </button>

        {/* Stage Presentation Mode */}
        <button
          type="button"
          onClick={() => setViewMode('player')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C93442] text-white hover:bg-[#9B222E] text-xs font-serif font-bold tracking-wider cursor-pointer shadow-md transition-all hover:scale-105"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>TRÌNH CHIẾU</span>
        </button>
      </div>
    </header>
  );
};
