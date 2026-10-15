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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-[#FFF9F2] border border-[#C5A16E]/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#C5A16E]/20 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C93442]" />
            <h2 className="text-sm font-serif font-bold text-[#40322F] tracking-wide">
              CÀI ĐẶT THÔNG TIN PHIM CƯỚI V3
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#40322F]/60 hover:text-[#C93442] hover:bg-[#FAF3EB] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 bg-[#FAF5EE]/30">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold block mb-1">
                Tên Chú Rể
              </label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold block mb-1">
                Tên Cô Dâu
              </label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold block mb-1">
                Ngày Cưới Dương Lịch
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#40322F] font-semibold block mb-1">
                Ngày Âm Lịch
              </label>
              <input
                type="text"
                value={lunarDate}
                onChange={(e) => setLunarDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] shadow-sm"
              />
            </div>
          </div>

          {/* Thank You Message */}
          <div>
            <label className="text-xs font-serif text-[#40322F] font-semibold block mb-1">
              Lời Cảm Ơn (Chương 6)
            </label>
            <textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              rows={3}
              className="w-full px-2.5 py-1.5 rounded bg-white border border-[#C5A16E]/30 text-xs text-[#40322F] focus:outline-none focus:border-[#C93442] resize-none shadow-sm"
            />
          </div>

          {/* Music Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-serif text-[#40322F] font-semibold mb-1">
              <Music className="w-3.5 h-3.5 text-[#C93442]" />
              <span>Nhạc nền tiệc cưới (Background Music MP3/WAV)</span>
            </label>
            <div className="flex items-center gap-2">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#C5A16E]/30 hover:border-[#C93442] text-xs font-serif text-[#40322F] cursor-pointer shadow-sm"
              >
                <Upload className="w-3 h-3 text-[#C5A16E]" />
                <span>Tải tệp âm thanh của bạn</span>
              </button>
            </div>

            {/* Current Audio Tracks List */}
            {project.audioTracks.length > 0 && (
              <div className="mt-2 space-y-1">
                {project.audioTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded bg-white border border-[#C5A16E]/20 text-xs font-mono"
                  >
                    <span className="truncate max-w-[320px] text-[#40322F]">{track.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAudioTrack(track.id)}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cinema Effects Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#C5A16E]/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableGrain}
                onChange={(e) => setEnableGrain(e.target.checked)}
                className="accent-[#C93442] rounded"
              />
              <span className="text-xs font-serif text-[#40322F]">
                Kích hoạt hạt phim 35mm (Authentic Film Grain)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableVignette}
                onChange={(e) => setEnableVignette(e.target.checked)}
                className="accent-[#C93442] rounded"
              />
              <span className="text-xs font-serif text-[#40322F]">
                Kích hoạt góc tối điện ảnh (Subtle Cinema Vignette)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#C5A16E]/20 flex items-center justify-end gap-2 bg-white/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-[#C5A16E]/30 text-xs font-serif text-[#40322F] hover:bg-[#FAF3EB] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-1.5 rounded-full bg-[#C93442] text-xs font-serif text-white hover:bg-[#9B222E] cursor-pointer shadow-sm"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
