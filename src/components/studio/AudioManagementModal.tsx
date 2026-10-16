import React, { useState, useRef } from 'react';
import {
  Music,
  Upload,
  Play,
  Pause,
  Volume2,
  Trash2,
  Check,
  X,
  Sliders,
  Repeat,
  Radio,
} from 'lucide-react';
import { useWeddingStore } from '../../app/store';
import { AudioTrack } from '../../types/project';
import { db } from '../../storage/db';

interface AudioManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioManagementModal: React.FC<AudioManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const project = useWeddingStore((s) => s.project);
  const updateProjectMeta = useWeddingStore((s) => s.updateProjectMeta);
  const updateGlobalSettings = useWeddingStore((s) => s.updateGlobalSettings);
  const updateChapter = useWeddingStore((s) => s.updateChapter);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetChapterIdForUpload, setTargetChapterIdForUpload] = useState<string | null>(null);
  const [previewTrackUrl, setPreviewTrackUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const audioMode = project.globalSettings.audioMode || 'global';
  const crossfadeDuration = project.globalSettings.crossfadeDuration ?? 0.8;
  const loopGlobalAudio = project.globalSettings.loopGlobalAudio ?? true;
  const tracks = project.audioTracks || [];

  const globalTrack = tracks.find((t) => t.isGlobal) || tracks[0] || null;

  const togglePreview = (url: string) => {
    if (previewTrackUrl === url && isPlayingPreview) {
      previewAudioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio();
      }
      previewAudioRef.current.src = url;
      previewAudioRef.current.play().catch(() => {});
      setPreviewTrackUrl(url);
      setIsPlayingPreview(true);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const audioId = `audio_${Date.now()}`;
      const mediaId = `media_audio_${Date.now()}`;
      const objectUrl = URL.createObjectURL(file);

      // Persist binary into IndexedDB db.audio
      await db.audio.put({
        id: mediaId,
        projectId: project.id,
        blob: file,
        name: file.name,
        mimeType: file.type || 'audio/mpeg',
        duration: 0,
        createdAt: Date.now(),
      });

      const newTrack: AudioTrack = {
        id: audioId,
        mediaId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: objectUrl,
        blob: file,
        duration: 0,
        startTime: 0,
        endTime: 0,
        volume: 0.85,
        fadeInDuration: 1.0,
        fadeOutDuration: 1.5,
        isGlobal: audioMode === 'global' && !targetChapterIdForUpload,
      };

      const updatedTracks = [...tracks, newTrack];

      if (targetChapterIdForUpload) {
        updateChapter(targetChapterIdForUpload, {
          musicTrackId: audioId,
        });
      }

      updateProjectMeta({ audioTracks: updatedTracks });
      setTargetChapterIdForUpload(null);
    } catch (err) {
      console.error('Failed to upload audio:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeTrack = async (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track?.mediaId) {
      try {
        await db.audio.delete(track.mediaId);
      } catch (e) {
        console.warn('Error deleting stored audio:', e);
      }
    }
    const remaining = tracks.filter((t) => t.id !== trackId);
    updateProjectMeta({ audioTracks: remaining });
  };

  const setGlobalTrack = (trackId: string) => {
    const updated = tracks.map((t) => ({
      ...t,
      isGlobal: t.id === trackId,
    }));
    updateProjectMeta({ audioTracks: updated });
  };

  const triggerUploadForChapter = (chapterId: string | null) => {
    setTargetChapterIdForUpload(chapterId);
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FFF9F2] border border-[#C5A16E]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hidden Audio File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#C5A16E]/20 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C93442]/10 flex items-center justify-center text-[#C93442]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#40322F]">
                QUẢN LÝ NHẠC NỀN ĐIỆN ẢNH (AUDIO DIRECTOR)
              </h2>
              <p className="text-xs text-[#40322F]/70 font-serif">
                Chọn phát một bài xuyên suốt hoặc gán nhạc riêng cho từng chương
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              previewAudioRef.current?.pause();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#40322F]/60 hover:text-[#40322F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 bg-[#FAF5EE] border-b border-[#C5A16E]/20">
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => updateGlobalSettings({ audioMode: 'global' })}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                audioMode === 'global'
                  ? 'bg-white border-[#C93442] shadow-md ring-2 ring-[#C93442]/20'
                  : 'bg-white/60 border-[#C5A16E]/30 hover:bg-white text-[#40322F]/70'
              }`}
            >
              <Radio className={`w-4 h-4 ${audioMode === 'global' ? 'text-[#C93442]' : 'text-stone-400'}`} />
              <div className="text-left">
                <div className="text-xs font-serif font-bold text-[#40322F]">
                  Một bài nhạc xuyên suốt (Global)
                </div>
                <div className="text-[10px] text-[#40322F]/65 font-serif">
                  Nhạc phát êm dịu, liền mạch qua tất cả 7 chương
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateGlobalSettings({ audioMode: 'per_chapter' })}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                audioMode === 'per_chapter'
                  ? 'bg-white border-[#C93442] shadow-md ring-2 ring-[#C93442]/20'
                  : 'bg-white/60 border-[#C5A16E]/30 hover:bg-white text-[#40322F]/70'
              }`}
            >
              <Radio className={`w-4 h-4 ${audioMode === 'per_chapter' ? 'text-[#C93442]' : 'text-stone-400'}`} />
              <div className="text-left">
                <div className="text-xs font-serif font-bold text-[#40322F]">
                  Nhạc riêng từng chương (Per-Chapter)
                </div>
                <div className="text-[10px] text-[#40322F]/65 font-serif">
                  Mỗi chương một giai điệu, hòa âm crossfade mượt mà
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {audioMode === 'global' ? (
            /* ================= MODE A: GLOBAL MUSIC ================= */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-sans font-bold tracking-[0.15em] uppercase text-[#40322F]">
                    BÀI NHẠC TOÀN BỘ PHIM
                  </h3>
                  <p className="text-xs text-[#40322F]/70 font-serif">
                    {globalTrack ? `Đang dùng: ${globalTrack.name}` : 'Chưa chọn bài nhạc'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerUploadForChapter(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C93442] hover:bg-[#B02A37] text-white text-xs font-serif font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải bài mới (.MP3 / .WAV)</span>
                </button>
              </div>

              {/* Loop and Volume Controls */}
              <div className="p-4 rounded-xl bg-white border border-[#C5A16E]/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-[#40322F]">
                    <Repeat className="w-4 h-4 text-[#C5A16E]" />
                    <span>Lặp lại bài hát nếu ngắn hơn tổng thời lượng phim</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={loopGlobalAudio}
                    onChange={(e) => updateGlobalSettings({ loopGlobalAudio: e.target.checked })}
                    className="accent-[#C93442] w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Library Track List */}
              <div className="space-y-2">
                <div className="text-xs font-serif font-bold text-[#40322F]">
                  Thư viện nhạc đã lưu ({tracks.length} bài)
                </div>
                {tracks.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-[#C5A16E]/40 bg-white/50 text-[#C5A16E] font-serif text-xs">
                    Chưa có bài nhạc nào trong thư viện. Nhấn "Tải bài mới" để bắt đầu!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tracks.map((t) => {
                      const isSelected = globalTrack?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#FAF3EB] border-[#C93442] shadow-sm ring-1 ring-[#C93442]/30'
                              : 'bg-white border-[#C5A16E]/25 hover:border-[#C5A16E]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => togglePreview(t.url)}
                              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#C93442] text-stone-700 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                            >
                              {previewTrackUrl === t.url && isPlayingPreview ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                            <div className="min-w-0">
                              <div className="text-xs font-serif font-bold text-[#40322F] truncate">
                                {t.name}
                              </div>
                              <div className="text-[10px] text-stone-500 font-mono">
                                {isSelected ? '✓ Đang dùng cho toàn phim' : 'Trong thư viện'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isSelected ? (
                              <button
                                type="button"
                                onClick={() => setGlobalTrack(t.id)}
                                className="px-3 py-1 rounded bg-white hover:bg-stone-50 border border-[#C5A16E]/30 text-xs font-serif text-[#C93442] font-semibold cursor-pointer"
                              >
                                Chọn bài này
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C93442]/10 text-[#C93442] text-[11px] font-serif font-bold">
                                <Check className="w-3.5 h-3.5" />
                                Đang chọn
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => removeTrack(t.id)}
                              className="p-1.5 rounded text-stone-400 hover:text-rose-600 cursor-pointer"
                              title="Xóa bài khỏi thư viện"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= MODE B: PER-CHAPTER MUSIC ================= */
            <div className="space-y-5">
              {/* Crossfade Duration Slider */}
              <div className="p-4 rounded-xl bg-white border border-[#C5A16E]/30 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-serif font-bold text-[#40322F]">
                    Thời gian hòa âm chuyển chương (Crossfade)
                  </div>
                  <div className="text-[11px] text-[#40322F]/65 font-serif">
                    Bài trước nhỏ dần, bài sau to dần khi chuyển cảnh
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.4"
                    max="1.5"
                    step="0.1"
                    value={crossfadeDuration}
                    onChange={(e) =>
                      updateGlobalSettings({ crossfadeDuration: parseFloat(e.target.value) })
                    }
                    className="accent-[#C93442] w-28 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-[#C93442] w-10 text-right">
                    {crossfadeDuration.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* 7 Chapter Music Assign Rows */}
              <div className="space-y-3">
                <div className="text-xs font-sans font-bold tracking-[0.15em] uppercase text-[#40322F]">
                  GÁN NHẠC CHO TỪNG CHƯƠNG (7 CHƯƠNG)
                </div>

                {project.chapters.map((ch) => {
                  const assignedTrack = tracks.find(
                    (t) => t.id === ch.musicTrackId || t.chapterId === ch.id
                  );

                  return (
                    <div
                      key={ch.id}
                      className="p-3.5 rounded-xl bg-white border border-[#C5A16E]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FAF3EB] border border-[#C5A16E]/30 text-[10px] font-mono font-bold text-[#C93442] flex items-center justify-center shrink-0">
                            {ch.chapterIndex}
                          </span>
                          <span className="text-xs font-serif font-bold text-[#40322F] truncate">
                            {ch.vietnameseTitle}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#40322F]/70 font-serif mt-0.5 truncate">
                          {assignedTrack ? (
                            <span className="text-emerald-700 font-semibold">
                              🎵 {assignedTrack.name}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">
                              Chưa chọn nhạc (phát im lặng)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {assignedTrack && (
                          <button
                            type="button"
                            onClick={() => togglePreview(assignedTrack.url)}
                            className="p-1.5 rounded-full bg-stone-100 hover:bg-[#C93442] text-stone-700 hover:text-white cursor-pointer transition-colors"
                            title="Nghe thử bài"
                          >
                            {previewTrackUrl === assignedTrack.url && isPlayingPreview ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Dropdown selector for existing library tracks */}
                        <select
                          value={ch.musicTrackId || ''}
                          onChange={(e) => updateChapter(ch.id, { musicTrackId: e.target.value })}
                          className="px-2 py-1 rounded bg-[#FAF5EE] border border-[#C5A16E]/30 text-xs font-serif text-[#40322F] cursor-pointer"
                        >
                          <option value="">-- Không phát nhạc --</option>
                          {tracks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>

                        {/* Upload new track directly for this chapter */}
                        <button
                          type="button"
                          onClick={() => triggerUploadForChapter(ch.id)}
                          className="p-1.5 rounded bg-white hover:bg-[#FAF3EB] border border-[#C5A16E]/40 text-[#C93442] cursor-pointer"
                          title="Tải bài mới gán ngay cho chương này"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#C5A16E]/20 bg-white/70 flex justify-end">
          <button
            type="button"
            onClick={() => {
              previewAudioRef.current?.pause();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-[#C93442] hover:bg-[#B02A37] text-white text-xs font-serif font-bold cursor-pointer shadow-md transition-colors"
          >
            Hoàn tất &amp; Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};
