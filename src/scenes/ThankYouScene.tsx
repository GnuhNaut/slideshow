import React from 'react';
import { TimelineScene } from '../types/timeline';
import { FX12_GrandThankYouReveal } from '../effects/FX12_GrandThankYouReveal';

interface ThankYouSceneProps {
  scene: TimelineScene;
  progress: number;
  isPlaying: boolean;
}

export const ThankYouScene: React.FC<ThankYouSceneProps> = ({ scene, progress, isPlaying }) => {
  return (
    <FX12_GrandThankYouReveal
      photos={scene.photos}
      progress={progress}
      isPlaying={isPlaying}
    />
  );
};
