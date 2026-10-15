import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX10_ElegantParallax } from '../effects/FX10_ElegantParallax';
import { FX03_HeroFrameMorph } from '../effects/FX03_HeroFrameMorph';

interface HeroMomentSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const HeroMomentScene: React.FC<HeroMomentSceneProps> = ({ scene, progress, isPlaying }) => {
  const photo = scene.heroPhoto || scene.photos[0];

  // If Chapter 3 (Lời Cầu Hôn), use HeroFrameMorph
  if (scene.chapterIndex === 3) {
    return (
      <FX03_HeroFrameMorph
        photo={photo}
        progress={progress}
        isPlaying={isPlaying}
        title={scene.config.textTitle || 'LỜI CẦU HÔN'}
        subtitle="YES, I DO"
        quote={scene.config.quote || 'Khoảnh khắc thiêng liêng khi hai tâm hồn hòa vào làm một.'}
      />
    );
  }

  // Otherwise, use 3D optical Elegant Parallax with bright luxury framing
  return (
    <FX10_ElegantParallax
      photo={photo}
      progress={progress}
      isPlaying={isPlaying}
      accentQuote={scene.config.quote || photo?.title || 'Vẻ đẹp tinh khôi trong ngày hạnh phúc.'}
    />
  );
};
