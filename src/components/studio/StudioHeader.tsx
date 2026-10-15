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
} from 'lucide-react';
import { useWeddingStore, SaveStatus } from '../../app/store';
import { remoteChannel } from '../../player/remoteChannel';

interface StudioHeaderProps {
  onOpenSettings: () => void;
  onExportZip: () => void;
  onImportZip: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onOpenSettings,
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

  const renderSaveBadge = (status: SaveStatus) => {
    switch (status) {
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đã lưu tự động</span>
          </span>
        );
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-xs text-[#BFA47D] font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Đang lưu...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Chờ lưu</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lỗi lưu</span>
          </span>
        );
    }
  };

  return (
    <header className="h-14 px-4 md:px-6 bg-[#161213] border-b border-[#BFA47D]/15 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setViewMode('home')}
          className="p-1.5 rounded text-[#BFA47D] hover:bg-[#241C1E] cursor-pointer transition-colors"
          title="Về Trang Chủ"
        >
          <Home className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#581E2C] border border-[#BFA47D]/30 flex items-center justify-center">
            <Film className="w-4 h-4 text-[#BFA47D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs md:text-sm font-serif font-bold text-[#F5EDE1] tracking-wide">
                STUDIO DỰNG PHIM
              </h1>
              {renderSaveBadge(saveStatus)}
            </div>
            <p className="text-[10px] text-[#BFA47D]/75 font-serif italic truncate max-w-[200px] sm:max-w-none">
              {project.groomName} &amp; {project.brideName} • {project.weddingDate}
            </p>
          </div>
        </div>
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1C1718] border border-[#BFA47D]/15 rounded">
        <button
          type="button"
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1.5 rounded text-[#F5EDE1] hover:bg-[#581E2C]/50 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1.5 rounded text-[#F5EDE1] hover:bg-[#581E2C]/50 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition-colors"
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
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#BFA47D]/25 bg-[#241C1E] hover:bg-[#581E2C]/40 text-[#BFA47D] text-xs font-serif cursor-pointer transition-colors"
          title="Mở cửa sổ trình chiếu thứ hai trên màn hình LED/TV"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span>Màn Hình 2</span>
        </button>

        {/* Project Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded border border-[#BFA47D]/20 text-[#F5EDE1] hover:bg-[#241C1E] hover:text-[#BFA47D] cursor-pointer transition-colors"
          title="Cài đặt thông tin dự án"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Import & Export */}
        <button
          type="button"
          onClick={onImportZip}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#BFA47D]/25 bg-[#241C1E] text-[#F5EDE1] hover:bg-[#581E2C]/40 text-xs font-serif cursor-pointer transition-colors"
          title="Nhập file dự án ZIP"
        >
          <Upload className="w-3 h-3 text-[#BFA47D]" />
          <span>Nhập ZIP</span>
        </button>

        <button
          type="button"
          onClick={onExportZip}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#BFA47D]/40 bg-[#581E2C] text-[#F5EDE1] hover:brightness-110 text-xs font-serif cursor-pointer transition-colors"
          title="Xuất trọn gói file ZIP"
        >
          <Download className="w-3 h-3 text-[#BFA47D]" />
          <span>Xuất ZIP</span>
        </button>

        {/* Stage Presentation Mode */}
        <button
          type="button"
          onClick={() => setViewMode('player')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded bg-[#BFA47D] text-[#1C1718] hover:brightness-105 text-xs font-serif font-bold tracking-wider cursor-pointer shadow transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>TRÌNH CHIẾU</span>
        </button>
      </div>
    </header>
  );
};
