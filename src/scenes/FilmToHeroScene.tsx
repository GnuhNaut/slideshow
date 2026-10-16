import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX03_HeroFrameMorph } from '../effects/FX03_HeroFrameMorph';

interface FilmToHeroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FilmToHeroScene: React.FC<FilmToHeroSceneProps> = ({ scene, progress, isPlaying }) => {
  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <FX03_HeroFrameMorph
      photo={heroPhoto}
      progress={progress}
      isPlaying={isPlaying}
      title={scene.config.textTitle || 'LỜI CẦU HÔN'}
      subtitle={scene.chapterTitle || 'KHOẢNH KHẮC MÃI MÃI'}
      quote={scene.config.quote || 'Khoảnh khắc em nói "Em đồng ý", cả thế giới như ngừng lại.'}
      sceneId={scene.id}
    />
  );
};
