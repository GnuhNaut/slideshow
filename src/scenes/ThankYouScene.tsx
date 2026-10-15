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
      groomName="Tuấn Hùng"
      brideName="Sao Mai"
      weddingDate="19.10.2026"
      message={
        scene.config.quote ||
        'Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.'
      }
    />
  );
};
