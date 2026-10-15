import React, { useState } from 'react';
import { X, Sparkles, Check, Film, Layers, PlaySquare, Compass } from 'lucide-react';
import { useWeddingStore } from '../../app/store';

interface EffectLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
}

interface EffectOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  tag: string;
}

const AVAILABLE_EFFECTS: EffectOption[] = [
  {
    id: 'f01_continuous_roll',
    name: 'Cinematic Film Ribbon (FX01)',
    description: 'Cuộn phim 35mm trôi trong không gian 3D với góc nghiêng phối cảnh nhẹ.',
    icon: Film,
    tag: 'Chương 2 • Kỷ Niệm',
  },
  {
    id: 'f02_dual_roll',
    name: '3D Arc Carousel (FX02)',
    description: 'Bố trí ảnh trên hình trụ cong 3D, ảnh trung tâm nổi bật, chuyển động mềm mại.',
    icon: Compass,
    tag: 'Chương 2, 5 • Đa Ảnh',
  },
  {
    id: 'f04_film_to_hero',
    name: 'Hero Frame Morph (FX03)',
    description: 'Biến hình từ khung ảnh không gian 3D phóng lớn vào trung tâm kèm lời tựa.',
    icon: PlaySquare,
    tag: 'Chương 3 • Cầu Hôn',
  },
  {
    id: 'f03_multi_layer',
    name: 'Luxury Album Page Turn (FX04)',
    description: 'Lật trang album cưới bìa cứng 3D sang trang màu ivory với bóng đổ chân thực.',
    icon: Layers,
    tag: 'Chương 4 • Dạm Ngõ',
  },
  {
    id: 'f06_living_collage',
    name: 'Editorial Split & Mosaic (FX06 / FX11)',
    description: 'Bố cục tạp chí thời trang 60/40 và ghép ảnh bất đối xứng đa chiều.',
    icon: Sparkles,
    tag: 'Chương 5 • Ảnh Cưới',
  },
  {
    id: 'f08_final_freeze',
    name: 'Grand Thank You & Final Hold (FX12)',
    description: 'Sân khấu tri ân sang trọng với hai ảnh cưới bao bọc và đóng băng ảnh kết.',
    icon: Sparkles,
    tag: 'Chương 6, 7 • Kết Phim',
  },
];

export const EffectLibraryModal: React.FC<EffectLibraryModalProps> = ({
  isOpen,
  onClose,
  chapterId,
}) => {
  const project = useWeddingStore((s) => s.project);
  const updateChapter = useWeddingStore((s) => s.updateChapter);
  const currentChapter = project.chapters.find((c) => c.id === chapterId);

  const [motionIntensity, setMotionIntensity] = useState<'elegant' | 'cinematic' | 'dynamic'>(
    'cinematic'
  );

  if (!isOpen || !currentChapter) return null;

  const handleSelectEffect = (effectId: any) => {
    updateChapter(chapterId, {
      effectMode: effectId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-3xl bg-[#FFF9F2] rounded-xl border border-[#C5A16E]/40 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#C5A16E]/20 flex items-center justify-between bg-white/70">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-[#C93442] font-semibold block">
              THƯ VIỆN HIỆU ỨNG ĐIỆN ẢNH V3
            </span>
            <h3 className="text-xl font-serif text-[#40322F]">
              Chọn Hiệu Ứng Cho {currentChapter.vietnameseTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#40322F]/60 hover:text-[#C93442] hover:bg-[#FAF3EB] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Motion Intensity Selector */}
          <div>
            <label className="text-xs font-sans font-semibold text-[#40322F] uppercase tracking-wider block mb-2">
              Cường độ chuyển động (Motion Intensity)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { id: 'elegant', label: 'ELEGANT', desc: 'Nhẹ nhàng, tối giản, sang trọng' },
                  { id: 'cinematic', label: 'CINEMATIC', desc: 'Điện ảnh 3D, chiều sâu không gian (Mặc định)' },
                  { id: 'dynamic', label: 'DYNAMIC', desc: 'Sôi nổi, tiết tấu nhanh, hiệu ứng mạnh' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setMotionIntensity(lvl.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    motionIntensity === lvl.id
                      ? 'border-[#C93442] bg-[#F0DFD5]/50 ring-1 ring-[#C93442]'
                      : 'border-[#C5A16E]/30 bg-white hover:border-[#C5A16E]'
                  }`}
                >
                  <div className="font-serif text-sm font-semibold text-[#40322F]">
                    {lvl.label}
                  </div>
                  <div className="text-[11px] text-[#40322F]/70 font-sans mt-0.5">
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Effects Grid */}
          <div>
            <label className="text-xs font-sans font-semibold text-[#40322F] uppercase tracking-wider block mb-2">
              Danh sách hiệu ứng GSAP 3D
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_EFFECTS.map((fx) => {
                const isSelected = currentChapter.effectMode === fx.id;
                const Icon = fx.icon;

                return (
                  <div
                    key={fx.id}
                    onClick={() => handleSelectEffect(fx.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C93442] bg-[#F0DFD5]/40 shadow-md ring-1 ring-[#C93442]'
                        : 'border-[#C5A16E]/30 bg-white hover:border-[#C5A16E] hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-sans font-medium text-[#C5A16E] bg-[#FAF5EE] px-2 py-0.5 rounded">
                          {fx.tag}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#C93442] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-[#C93442]" />
                        <h4 className="font-serif text-base font-semibold text-[#40322F]">
                          {fx.name}
                        </h4>
                      </div>
                      <p className="text-xs font-serif italic text-[#40322F]/75 leading-relaxed">
                        {fx.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#C5A16E]/20 bg-white/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-[#C93442] text-white rounded-full font-serif text-xs uppercase tracking-widest hover:bg-[#9B222E] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
