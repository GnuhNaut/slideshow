import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX03_HeroFrameMorph } from '../effects/FX03_HeroFrameMorph';
import { ChapterStoryOverlay } from '../components/story/ChapterStoryOverlay';

interface FilmToHeroSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const FilmToHeroScene: React.FC<FilmToHeroSceneProps> = ({ scene, progress, isPlaying }) => {
  const heroPhoto = scene.heroPhoto || scene.photos[0];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FX03_HeroFrameMorph
        photo={heroPhoto}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
        placement="right"
      />
      <ChapterStoryOverlay
        scene={scene}
        chapterLabel="• LỜI HẸN ƯỚC"
        variant="side"
      />
    </div>
  );
};
