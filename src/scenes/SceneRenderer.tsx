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
import { AmbientHeartsOverlay } from '../components/decor/AmbientHeartsOverlay';

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

  const transState = computeTransitionState(scenes, currentTime);
  const activeScene = transState.activeScene || currentScene;
  const upcomingScene = transState.upcomingScene;

  React.useEffect(() => {
    if (!upcomingScene?.photos.length) return;
    const preloadCount =
      upcomingScene.type === 'film_roll' || upcomingScene.type === 'dual_film_roll' ? 8 : 2;
    upcomingScene.photos.slice(0, preloadCount).forEach((photo) => {
      const imageUrl = photo.mediumUrl || photo.displayUrl || photo.url;
      if (!imageUrl) return;
      const img = new Image();
      img.src = imageUrl;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, [upcomingScene]);

  if (!currentScene && (!scenes || scenes.length === 0)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFF9F2] text-[#C5A16E] font-serif">
        Đang chuẩn bị thước phim cưới điện ảnh...
      </div>
    );
  }

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
    // Only instantiate heavy outgoing React node for non-curtain transitions; curtain uses CurtainSurface
    if (transState.transitionId !== 'GRAND_WEDDING_CURTAIN_REVEAL') {
      outgoingNode = renderSceneContent(transState.outgoingScene, transState.outgoingSceneProgress, false);
    }
    incomingNode = renderSceneContent(transState.incomingScene, transState.incomingSceneProgress, isPlaying);
  }

  // Pre-warm incoming scene during lookahead phase (300-400ms before transition boundary T)
  // Filmstrips are pre-decoded as images instead of mounting their entire DOM
  // tree twice (hidden here, then again inside the compositor).
  const upcomingIsFilmstrip =
    transState.upcomingScene?.type === 'film_roll' ||
    transState.upcomingScene?.type === 'dual_film_roll';
  const preparedNode =
    transState.isPrepared &&
    !transState.isTransitioning &&
    transState.upcomingScene &&
    !upcomingIsFilmstrip
      ? renderSceneContent(transState.upcomingScene, 0, false)
      : null;

  return (
    <div className="scene-photo-fit relative h-full w-full overflow-hidden select-none bg-[#FFF9F2]">
      <SceneCompositor
        isTransitioning={transState.isTransitioning}
        transitionId={transState.transitionId}
        transitionProgress={transState.transitionProgress}
        outgoingScene={transState.outgoingScene}
        outgoingSceneProgress={transState.outgoingSceneProgress}
        outgoingSceneNode={outgoingNode}
        incomingSceneNode={incomingNode}
        activeSceneNode={activeNode}
      />

      <AmbientHeartsOverlay />

      {preparedNode && (
        <div
          className="pointer-events-none absolute inset-0 -z-50 overflow-hidden opacity-0"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
        >
          {preparedNode}
        </div>
      )}

      {enableGrain && <div className="film-grain" />}
    </div>
  );
};
