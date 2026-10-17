import React, { useLayoutEffect, useSyncExternalStore } from 'react';
import { TimelineScene } from '../types/timeline';
import { useWeddingStore } from '../app/store';
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
import { AmbientHeartsOverlay } from '../components/decor/AmbientHeartsOverlay';

interface SceneRendererProps {
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

// Scene identity is stable through preparation, overlap and active playback.
const SceneContent = React.memo(({ scene }: { scene: TimelineScene }) => {
  const frame = motionRuntime.getState();
  const progress = scene.duration > 0
    ? Math.max(0, Math.min(1, (frame.currentTime - scene.startTime) / scene.duration))
    : 0;
  return renderSceneContent(scene, progress, frame.isPlaying);
});

const renderScene = (scene: TimelineScene) => <SceneContent scene={scene} />;

export const SceneRenderer = React.memo(function SceneRenderer({
  enableGrain = true,
  scenes: propsScenes,
}: SceneRendererProps) {
  const storeScenes = useWeddingStore((s) => s.timeline.scenes);
  const performanceMode = useWeddingStore((s) => s.project.globalSettings.performanceMode);
  const scenes = propsScenes || storeScenes;
  const layout = useSyncExternalStore(
    motionRuntime.subscribeLayout,
    motionRuntime.getLayoutState,
    motionRuntime.getLayoutState
  );

  useLayoutEffect(() => {
    motionRuntime.setScenes(scenes);
  }, [scenes]);

  if (!layout.activeScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Đang chuẩn bị thước phim cưới điện ảnh...
      </div>
    );
  }

  const highPerformance = performanceMode === 'high_performance';
  return (
    <div className="scene-photo-fit relative h-full w-full overflow-hidden select-none bg-[#FFF9F2]">
      <SceneCompositor layout={layout} renderScene={renderScene} />
      {!highPerformance && <AmbientHeartsOverlay />}
      {enableGrain && !highPerformance && <div className="film-grain" />}
    </div>
  );
});
