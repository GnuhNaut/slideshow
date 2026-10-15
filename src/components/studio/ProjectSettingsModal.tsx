import React, { useRef, useState } from 'react';
import { X, Music, Sliders, Heart, Sparkles, Volume2, Upload } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#181216] border border-[#ecd28f]/40 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#ecd28f]/20 flex items-center justify-between bg-[#151114]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#81252D]" />
            <h2 className="text-sm font-serif font-bold text-[#FFF4E4] tracking-wide">
              CÀI ĐẶT THÔNG TIN PHIM CƯỚI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#ecd28f]/70 hover:text-[#ecd28f] hover:bg-[#81252D]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium block mb-1">
                Tên Chú Rể
              </label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
                placeholder="Ví dụ: Tuấn Hùng"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium block mb-1">
                Tên Cô Dâu
              </label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
                placeholder="Ví dụ: Sao Mai"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium block mb-1">
                Ngày Cưới Dương Lịch
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
                placeholder="19.10.2026"
              />
            </div>
            <div>
              <label className="text-xs font-serif text-[#FFF4E4] font-medium block mb-1">
                Ngày Âm Lịch (Hiển thị thiệp)
              </label>
              <input
                type="text"
                value={lunarDate}
                onChange={(e) => setLunarDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f]"
                placeholder="10/09 Âm Lịch"
              />
            </div>
          </div>

          {/* Thank You Message */}
          <div>
            <label className="text-xs font-serif text-[#FFF4E4] font-medium block mb-1">
              Nội Dung Lời Cảm Ơn (Chương 6)
            </label>
            <textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded bg-[#120d10] border border-[#ecd28f]/30 text-xs text-[#FFF4E4] focus:outline-none focus:border-[#ecd28f] resize-none"
            />
          </div>

          {/* Background Audio Settings */}
          <div className="p-4 rounded-lg bg-[#120d10] border border-[#ecd28f]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#d4ac59]" />
                <span className="text-xs font-serif font-bold text-[#ecd28f]">
                  NHẠC NỀN TRÌNH CHIẾU
                </span>
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                onClick={() => audioInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#81252D] hover:bg-[#691014] text-xs text-[#FFF4E4] border border-[#ecd28f]/30 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#ecd28f]" />
                <span>Tải file MP3 riêng</span>
              </button>
            </div>

            {project.audioTracks.length > 0 ? (
              <div className="space-y-2">
                {project.audioTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded bg-[#1e151b] border border-[#ecd28f]/20 text-xs text-[#FFF4E4]"
                  >
                    <span className="truncate max-w-[280px]">🎵 {track.name}</span>
                    <button
                      onClick={() => removeAudioTrack(track.id)}
                      className="text-rose-400 hover:text-rose-200 text-xs"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#FFF4E4]/60 italic font-serif">
                Chưa có file MP3 tải lên. Hệ thống sẽ tự động kích hoạt giai điệu piano giao hưởng
                cưới lãng mạn (Web Audio Synthesizer) khi phát phim!
              </p>
            )}
          </div>

          {/* Cinematic Grain & Visual Settings */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-[#FFF4E4]">
              <input
                type="checkbox"
                checked={enableGrain}
                onChange={(e) => setEnableGrain(e.target.checked)}
                className="accent-[#d4ac59] rounded"
              />
              <span>Hiệu ứng hạt phim nhựa 35mm (Film Grain)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-[#FFF4E4]">
              <input
                type="checkbox"
                checked={enableVignette}
                onChange={(e) => setEnableVignette(e.target.checked)}
                className="accent-[#d4ac59] rounded"
              />
              <span>Bóng đổ điện ảnh (Cinematic Vignette)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ecd28f]/20 bg-[#151114] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#ecd28f]/20 text-xs font-serif text-[#FFF4E4] hover:bg-[#1e151b]"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d4ac59] to-[#c6a477] text-[#151114] text-xs font-serif font-bold shadow-md hover:brightness-105"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
