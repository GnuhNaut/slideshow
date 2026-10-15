import React, { useRef, useState } from 'react';
import { X, Music, Heart, Upload } from 'lucide-react';
import { useWeddingStore } from '../../app/store';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose }) => {
  const project = useWeddingStore((s) => s.project);
  const updateProjectMeta = useWeddingStore((s) => s.updateProjectMeta);
  const addAudioTrack = useWeddingStore((s) => s.addAudioTrack);
  const removeAudioTrack = useWeddingStore((s) => s.removeAudioTrack);

  const [groom, setGroom] = useState(project.groomName);
  const [bride, setBride] = useState(project.brideName);
  const [date, setDate] = useState(project.weddingDate);
  const [lunarDate, setLunarDate] = useState(project.lunarDate);
  const [thankYou, setThankYou] = useState(project.thankYouMessage);
  const [enableGrain, setEnableGrain] = useState(project.globalSettings.enableFilmGrain);
  const [enableVignette, setEnableVignette] = useState(project.globalSettings.enableVignette);

  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProjectMeta({
      groomName: groom,
      brideName: bride,
      weddingDate: date,
      lunarDate: lunarDate,
      thankYouMessage: thankYou,
      globalSettings: {
        ...project.globalSettings,
        enableFilmGrain: enableGrain,
        enableVignette: enableVignette,
      },
    });
    onClose();
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    addAudioTrack({
      id: `audio_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
      duration: 180,
      startTime: 0,
      endTime: 180,
      volume: 0.85,
      fadeInDuration: 3,
      fadeOutDuration: 4,
      isGlobal: true,
    });
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#1C1718] border border-[#BFA47D]/35 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#BFA47D]/15 flex items-center justify-between bg-[#161213]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#581E2C]" />
            <h2 className="text-sm font-serif font-bold text-[#F5EDE1] tracking-wide">
              CÀI ĐẶT THÔNG TIN PHIM CƯỚI
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#BFA47D]/70 hover:text-[#BFA47D] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-serif text-[#F5EDE1] font-medium block mb-1">
                Tên Chú Rể
              </label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#100B0D] border border-[#BFA47D]/25 text-xs text-[#F5EDE1] focus:outline-none focus:border-[#BFA47D]"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#F5EDE1] font-medium block mb-1">
                Tên Cô Dâu
              </label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#100B0D] border border-[#BFA47D]/25 text-xs text-[#F5EDE1] focus:outline-none focus:border-[#BFA47D]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-serif text-[#F5EDE1] font-medium block mb-1">
                Ngày Cưới Dương Lịch
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#100B0D] border border-[#BFA47D]/25 text-xs text-[#F5EDE1] focus:outline-none focus:border-[#BFA47D]"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#F5EDE1] font-medium block mb-1">
                Ngày Âm Lịch
              </label>
              <input
                type="text"
                value={lunarDate}
                onChange={(e) => setLunarDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#100B0D] border border-[#BFA47D]/25 text-xs text-[#F5EDE1] focus:outline-none focus:border-[#BFA47D]"
              />
            </div>
          </div>

          {/* Thank You Message */}
          <div>
            <label className="text-xs font-serif text-[#F5EDE1] font-medium block mb-1">
              Lời Cảm Ơn (Chương 6)
            </label>
            <textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              rows={3}
              className="w-full px-2.5 py-1.5 rounded bg-[#100B0D] border border-[#BFA47D]/25 text-xs text-[#F5EDE1] focus:outline-none focus:border-[#BFA47D] resize-none"
            />
          </div>

          {/* Audio Settings */}
          <div className="p-3.5 rounded bg-[#100B0D] border border-[#BFA47D]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#BFA47D]" />
                <span className="text-xs font-serif font-bold text-[#BFA47D]">
                  NHẠC NỀN TRÌNH CHIẾU
                </span>
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#581E2C] hover:bg-[#722739] text-xs text-[#F5EDE1] border border-[#BFA47D]/30 cursor-pointer transition-colors"
              >
                <Upload className="w-3 h-3 text-[#BFA47D]" />
                <span>Tải file MP3</span>
              </button>
            </div>

            {project.audioTracks.length > 0 ? (
              <div className="space-y-1.5">
                {project.audioTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded bg-[#1C1718] border border-[#BFA47D]/20 text-xs text-[#F5EDE1]"
                  >
                    <span className="truncate max-w-[260px]">🎵 {track.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAudioTrack(track.id)}
                      className="text-rose-400 hover:text-rose-200 text-xs cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#F5EDE1]/60 italic font-serif">
                Hệ thống tự động phát giai điệu piano giao hưởng cưới lãng mạn khi phát phim. Bạn có
                thể tải bài hát riêng ở trên.
              </p>
            )}
          </div>

          {/* Visual Toggles */}
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-[#F5EDE1]">
              <input
                type="checkbox"
                checked={enableGrain}
                onChange={(e) => setEnableGrain(e.target.checked)}
                className="accent-[#BFA47D] rounded"
              />
              <span>Hạt phim nhựa 35mm (Film Grain)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-[#F5EDE1]">
              <input
                type="checkbox"
                checked={enableVignette}
                onChange={(e) => setEnableVignette(e.target.checked)}
                className="accent-[#BFA47D] rounded"
              />
              <span>Bóng đổ góc (Vignette)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#BFA47D]/15 bg-[#161213] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-[#BFA47D]/20 text-xs font-serif text-[#F5EDE1] hover:bg-[#20181A] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-[#BFA47D] text-[#1C1718] text-xs font-serif font-bold cursor-pointer hover:brightness-105"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
