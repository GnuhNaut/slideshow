import React from 'react';
import { TimelineScene } from '../types/timeline';

interface ThankYouSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const ThankYouScene: React.FC<ThankYouSceneProps> = ({ scene, progress }) => {
  const photo = scene.heroPhoto || scene.photos[0];
  const panScale = 1 + progress * 0.05;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#1C1718] select-none">
      {/* Background Wedding Photo with slow pan */}
      {photo && (
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-linear"
          style={{ transform: `scale(${panScale})` }}
        >
          <img
            src={photo.url}
            alt="Thank you background"
            className="w-full h-full object-cover filter brightness-[0.4] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1718] via-[#581E2C]/35 to-[#1C1718]" />
        </div>
      )}

      {/* Editorial Thank You Card */}
      <div className="relative z-10 max-w-3xl mx-6 p-8 md:p-12 rounded-xl bg-[#1C1718]/85 border border-[#BFA47D]/35 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
        {/* Subtle Eyebrow Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-[1px] bg-[#BFA47D]/50" />
          <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#BFA47D] font-serif font-semibold">
            {scene.config.textTitle || 'LỜI CẢM ƠN'}
          </h2>
          <div className="w-10 h-[1px] bg-[#BFA47D]/50" />
        </div>

        {/* Heartfelt Message */}
        <p className="font-serif text-lg md:text-2xl text-[#F5EDE1] leading-relaxed tracking-wide my-4 italic">
          "{scene.config.quote || 'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.'}"
        </p>

        {/* Signature */}
        <div className="mt-6 flex flex-col items-center gap-1 border-t border-[#BFA47D]/25 pt-4">
          <span className="font-serif italic text-xl md:text-2xl text-[#F5EDE1] font-semibold">
            Tuấn Hùng &amp; Sao Mai
          </span>
          <span className="text-[10px] tracking-[0.25em] text-[#BFA47D] font-mono">
            19.10.2026 • HÀ NỘI
          </span>
        </div>
      </div>
    </div>
  );
};
