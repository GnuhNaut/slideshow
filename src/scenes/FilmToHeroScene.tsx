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
      sceneId={scene.id}
    />
  );
};
