import React from 'react';
import { TimelineScene } from '../types/timeline';
import { IntroScene } from './IntroScene';
import { FilmRollScene } from './FilmRollScene';
import { FilmToHeroScene } from './FilmToHeroScene';
import { HeroMomentScene } from './HeroMomentScene';
import { FamilyGalleryScene } from './FamilyGalleryScene';
import { LivingCollageScene } from './LivingCollageScene';
import { ThankYouScene } from './ThankYouScene';
import { FinalFreezeScene } from './FinalFreezeScene';

interface SceneRendererProps {
  currentScene: TimelineScene | null;
  currentTime: number;
  isPlaying: boolean;
  enableGrain?: boolean;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  currentScene,
  currentTime,
  isPlaying,
  enableGrain = true,
}) => {
  if (!currentScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1C1718] text-[#BFA47D]/60 font-serif">
        Đang chuẩn bị thước phim...
      </div>
    );
  }

  // Calculate normalized progress within the scene: 0.0 to 1.0
  const elapsed = Math.max(0, currentTime - currentScene.startTime);
  const progress = currentScene.duration > 0 ? Math.min(1, elapsed / currentScene.duration) : 0;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#1C1718]">
      {/* Dynamic Scene Component */}
      {(() => {
        switch (currentScene.type) {
          case 'intro':
            return <IntroScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
          case 'film_roll':
            return (
              <FilmRollScene
                scene={currentScene}
                progress={progress}
                isPlaying={isPlaying}
                isDual={false}
              />
            );
          case 'dual_film_roll':
            return (
              <FilmRollScene
                scene={currentScene}
                progress={progress}
                isPlaying={isPlaying}
                isDual={true}
              />
            );
          case 'film_to_hero':
            return <FilmToHeroScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
          case 'hero_moment':
          case 'climax_wipe':
            return <HeroMomentScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
          case 'family_gallery':
          case 'family_split':
            return (
              <FamilyGalleryScene scene={currentScene} progress={progress} isPlaying={isPlaying} />
            );
          case 'living_collage':
            return (
              <LivingCollageScene scene={currentScene} progress={progress} isPlaying={isPlaying} />
            );
          case 'thank_you':
            return <ThankYouScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
          case 'final_freeze':
            return <FinalFreezeScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
          default:
            return <HeroMomentScene scene={currentScene} progress={progress} isPlaying={isPlaying} />;
        }
      })()}

      {/* Optional Authentic 35mm Film Grain Texture */}
      {enableGrain && <div className="film-grain" />}
    </div>
  );
};
