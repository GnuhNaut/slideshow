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

  const transState = computeTransitionState(scenes, currentTime);
  const activeScene = transState.activeScene || currentScene;
  const upcomingScene = transState.upcomingScene;
  const hasNarration = Boolean(activeScene && activeScene.chapterIndex !== 2 && activeScene.chapterIndex !== 7);
  const heading = hasNarration && activeScene
    ? activeScene.config.textTitle || activeScene.chapterTitle
    : undefined;
  const narration = hasNarration && activeScene ? activeScene.config.textSubtitle : undefined;

  React.useEffect(() => {
    if (!upcomingScene?.photos.length) return;
    upcomingScene.photos.slice(0, 2).forEach((photo) => {
      const imageUrl = photo.displayUrl || photo.url;
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
  const preparedNode =
    transState.isPrepared && !transState.isTransitioning && transState.upcomingScene
      ? renderSceneContent(transState.upcomingScene, 0, false)
      : null;

  return (
    <div className="scene-photo-fit relative flex h-full w-full flex-col overflow-hidden select-none bg-[#FFF9F2] md:flex-row">
      {heading && (
        <aside className="order-2 flex min-h-[27vh] max-h-[34vh] w-full shrink-0 flex-col justify-center overflow-y-auto border-t border-[#E7C9C5] bg-[#F7ECE8] px-7 py-5 md:order-1 md:min-h-0 md:max-h-none md:w-[31%] md:max-w-[460px] md:min-w-[300px] md:border-r md:border-t-0 md:px-10 md:py-10">
          <div className="mb-4 flex items-center gap-3 md:mb-7">
            <span className="h-px w-8 bg-[#C93442]" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B222E]">
              Tuấn Hùng &amp; Sao Mai
            </span>
          </div>
          <h2 className="max-w-[14ch] font-serif text-[2rem] font-medium leading-[1.08] text-[#40322F] md:text-[2.6rem]">
            {heading}
          </h2>
          {narration && (
            <p className="mt-4 max-w-[34ch] font-serif text-sm leading-relaxed text-[#6D5751] md:mt-6 md:text-base">
              {narration}
            </p>
          )}
          <div className="mt-5 hidden items-center gap-3 md:mt-9 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C93442]" />
            <span className="font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-[#8E716C]">
              19.10.2026
            </span>
          </div>
        </aside>
      )}

      <div className={`relative order-1 min-h-0 min-w-0 flex-1 overflow-hidden md:order-2 ${heading ? 'h-[66vh] md:h-full' : 'h-full'}`}>
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
    </div>
  );
};
