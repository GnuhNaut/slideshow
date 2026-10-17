import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX10_ElegantParallax } from '../effects/FX10_ElegantParallax';
import { FX03_HeroFrameMorph } from '../effects/FX03_HeroFrameMorph';
import { WeddingStoryOverlay } from '../components/story/WeddingStoryOverlay';

interface HeroMomentSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

const HeroMomentSceneComponent: React.FC<HeroMomentSceneProps> = ({ scene, progress, isPlaying }) => {
  const photo = scene.heroPhoto || scene.photos[0];

  // If Chapter 3 (Lời Cầu Hôn), use HeroFrameMorph
  if (scene.chapterIndex === 3) {
    return (
      <FX03_HeroFrameMorph
        photo={photo}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
    );
  }

  // Otherwise, use 3D optical Elegant Parallax with bright luxury framing
  return (
    <div className="relative h-full w-full overflow-hidden">
      <FX10_ElegantParallax
        photo={photo}
        progress={progress}
        isPlaying={isPlaying}
        sceneId={scene.id}
      />
      {scene.chapterIndex === 5 && (
        <WeddingStoryOverlay
          scene={scene}
          featured={scene.config.showChapterIntro === true}
        />
      )}
    </div>
  );
};

export const HeroMomentScene = React.memo(
  HeroMomentSceneComponent,
  (previous, next) => previous.scene === next.scene && previous.isPlaying === next.isPlaying
);

HeroMomentScene.displayName = 'HeroMomentScene';
