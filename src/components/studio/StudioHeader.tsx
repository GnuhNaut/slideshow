import React from 'react';
import {
  Film,
  Play,
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
          <span className="flex items-center gap-1.5 text-xs text-[#ecd28f] font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Đang lưu...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Chờ lưu</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lỗi lưu DB</span>
          </span>
        );
    }
  };

  const handleOpenStage = () => {
    setViewMode('player');
  };

  const handleOpenDualWindow = () => {
    remoteChannel.openStageWindow();
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-[#181216] border-b border-[#ecd28f]/20 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setViewMode('home')}
          className="flex items-center gap-2 p-1.5 rounded-lg text-[#ecd28f] hover:bg-[#81252D]/40 transition-colors"
          title="Về Trang Chủ"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#81252D] to-[#4d090d] border border-[#ecd28f]/40 flex items-center justify-center shadow">
            <Film className="w-5 h-5 text-[#ecd28f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-serif font-bold text-[#FFF4E4] tracking-wide">
                WEDDING FILM STUDIO
              </h1>
              {renderSaveBadge(saveStatus)}
            </div>
            <p className="text-[11px] text-[#ecd28f]/80 font-serif italic">
              {project.groomName} &amp; {project.brideName} • {project.weddingDate}
            </p>
          </div>
        </div>
      </div>

      {/* Undo / Redo & Center Tools */}
      <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-[#120d10] border border-[#ecd28f]/20 rounded-lg">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1.5 rounded text-[#FFF4E4] hover:bg-[#81252D]/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1.5 rounded text-[#FFF4E4] hover:bg-[#81252D]/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Dual Screen Remote Trigger */}
        <button
          onClick={handleOpenDualWindow}
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ecd28f]/30 bg-[#251720] hover:bg-[#81252D]/40 text-[#ecd28f] text-xs font-serif tracking-wider transition-colors"
          title="Mở cửa sổ trình chiếu thứ hai trên màn hình TV/LED"
        >
          <MonitorPlay className="w-4 h-4 text-[#d4ac59]" />
          <span>Màn Hình 2 (Remote)</span>
        </button>

        {/* Project Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg border border-[#ecd28f]/20 text-[#FFF4E4] hover:bg-[#81252D]/40 hover:text-[#ecd28f] transition-colors"
          title="Cài đặt thông tin dự án"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Import & Export */}
        <button
          onClick={onImportZip}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ecd28f]/30 bg-[#1e151b] text-[#FFF4E4] hover:bg-[#81252D]/40 text-xs font-medium transition-colors"
          title="Nhập file dự án ZIP đã lưu"
        >
          <Upload className="w-3.5 h-3.5 text-[#ecd28f]" />
          <span>Nhập ZIP</span>
        </button>

        <button
          onClick={onExportZip}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4ac59]/50 bg-gradient-to-r from-[#81252D] to-[#691014] text-[#FFF4E4] hover:brightness-110 text-xs font-medium shadow-md transition-all"
          title="Xuất trọn gói file ZIP để trình chiếu hoặc lưu trữ"
        >
          <Download className="w-3.5 h-3.5 text-[#ecd28f]" />
          <span className="hidden md:inline">Xuất Trọn Gói</span>
          <span className="md:hidden">Xuất</span>
        </button>

        {/* Stage Presentation Mode (Full Screen) */}
        <button
          onClick={handleOpenStage}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4ac59] via-[#ecd28f] to-[#c6a477] text-[#151114] hover:brightness-105 text-xs font-serif font-bold tracking-wider shadow-[0_4px_16px_rgba(212,172,89,0.3)] transition-all"
        >
          <Maximize2 className="w-4 h-4" />
          <span>TRÌNH CHIẾU</span>
        </button>
      </div>
    </header>
  );
};
