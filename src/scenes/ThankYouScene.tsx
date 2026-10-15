import React from 'react';
import { TimelineScene } from '../types/timeline';

interface ThankYouSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const ThankYouScene: React.FC<ThankYouSceneProps> = ({ scene, progress }) => {
  const photo = scene.heroPhoto || scene.photos[0];
  const panScale = 1 + progress * 0.06;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#151114]">
      {/* Background Wedding Photo with slow pan */}
      {photo && (
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-linear"
          style={{ transform: `scale(${panScale})` }}
        >
          <img
            src={photo.url}
            alt="Thank you background"
            className="w-full h-full object-cover filter brightness-[0.45] contrast-105"
          />
          {/* Deep royal burgundy / cinema black gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151114] via-[#691014]/40 to-[#151114]" />
        </div>
      )}

      {/* Decorative Traditional Border Box */}
      <div className="relative z-10 max-w-3xl mx-6 p-8 md:p-12 rounded-lg bg-[#151114]/80 border border-[#ecd28f]/40 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* Monogram Seal */}
        <div className="mb-6 w-16 h-16 rounded-full border border-[#ecd28f] bg-[#81252D]/80 flex items-center justify-center shadow-lg">
          <span className="font-serif italic text-xl text-[#FFF4E4] font-semibold">H &amp; M</span>
        </div>

        {/* Header Label */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-[1px] bg-[#ecd28f]/50" />
          <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#ecd28f] font-serif-sc font-semibold">
            {scene.config.textTitle || 'LỜI CẢM ƠN'}
          </h2>
          <div className="w-10 h-[1px] bg-[#ecd28f]/50" />
        </div>

        {/* Main Heartfelt Message */}
        <p className="font-serif text-lg md:text-2xl text-[#FFF4E4] leading-relaxed tracking-wide my-4 italic">
          "{scene.config.quote || 'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.'}"
        </p>

        {/* Signature */}
        <div className="mt-6 flex flex-col items-center gap-1 border-t border-[#ecd28f]/30 pt-4">
          <span className="font-serif italic text-xl md:text-2xl gold-gradient-text font-semibold">
            Tuấn Hùng &amp; Sao Mai
          </span>
          <span className="text-[10px] tracking-[0.2em] text-[#ecd28f]/70 font-mono">
            19.10.2026 • HÀ NỘI
          </span>
        </div>
      </div>
    </div>
  );
};
