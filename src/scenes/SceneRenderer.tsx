import React from 'react';
import { TimelineScene } from '../types/timeline';
import { useWeddingStore } from '../app/store';
import { computeTransitionState } from '../transitions/TransitionDirector';
import { SceneCompositor } from '../transitions/SceneCompositor';
import { motionRuntime } from '../motion/MotionRuntime';
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
  scenes?: TimelineScene[];
}

function renderSceneContent(scene: TimelineScene, progress: number, isPlaying: boolean) {
  switch (scene.type) {
    case 'intro':
      return <IntroScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'film_roll':
      return <FilmRollScene scene={scene} progress={progress} isPlaying={isPlaying} isDual={false} />;
    case 'dual_film_roll':
      return <FilmRollScene scene={scene} progress={progress} isPlaying={isPlaying} isDual={true} />;
    case 'film_to_hero':
      return <FilmToHeroScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'hero_moment':
    case 'climax_wipe':
      return <HeroMomentScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'family_gallery':
    case 'family_split':
      return <FamilyGalleryScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'living_collage':
      return <LivingCollageScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'thank_you':
      return <ThankYouScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    case 'final_freeze':
      return <FinalFreezeScene scene={scene} progress={progress} isPlaying={isPlaying} />;
    default:
      return <HeroMomentScene scene={scene} progress={progress} isPlaying={isPlaying} />;
  }
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  currentScene,
  currentTime,
  isPlaying,
  enableGrain = true,
  scenes: propsScenes,
}) => {
  const storeScenes = useWeddingStore((s) => s.timeline.scenes);
  const scenes = propsScenes || storeScenes;

  // Sync scenes to motionRuntime for high-speed 60 FPS coordinate calculations
  React.useEffect(() => {
    if (scenes && scenes.length > 0) {
      motionRuntime.setScenes(scenes);
    }
  }, [scenes]);

  if (!currentScene && (!scenes || scenes.length === 0)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Đang chuẩn bị thước phim cưới điện ảnh...
      </div>
    );
  }

  // Calculate transition state across chapters and scenes
  const transState = computeTransitionState(scenes, currentTime);
  const activeScene = transState.activeScene || currentScene;

  if (!activeScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Đang chuẩn bị thước phim...
      </div>
    );
  }

  const activeProgress = transState.sceneProgress;
  const activeNode = renderSceneContent(activeScene, activeProgress, isPlaying);

  let outgoingNode: React.ReactNode = undefined;
  let incomingNode: React.ReactNode = undefined;

  if (transState.isTransitioning && transState.outgoingScene && transState.incomingScene) {
    // Preserve true continuous progress for outgoing and incoming scenes
    outgoingNode = renderSceneContent(transState.outgoingScene, transState.outgoingSceneProgress, isPlaying);
    incomingNode = renderSceneContent(transState.incomingScene, transState.incomingSceneProgress, isPlaying);
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#FFF9F2]">
      {/* 3D Scene Compositor handling seamless transitions */}
      <SceneCompositor
        isTransitioning={transState.isTransitioning}
        transitionId={transState.transitionId}
        transitionProgress={transState.transitionProgress}
        outgoingSceneNode={outgoingNode}
        incomingSceneNode={incomingNode}
        activeSceneNode={activeNode}
      />

      {/* Optional Authentic 35mm Film Grain */}
      {enableGrain && <div className="film-grain" />}
    </div>
  );
};
