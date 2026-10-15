import { useEffect, useRef } from 'react';
import { useWeddingStore } from '../app/store';
import { audioEngine } from '../audio/AudioEngine';
import { remoteChannel } from './remoteChannel';

export function usePlaybackController(isStageMode: boolean = false) {
  const isPlaying = useWeddingStore((s) => s.playback.isPlaying);
  const currentTime = useWeddingStore((s) => s.playback.currentTime);
  const playbackSpeed = useWeddingStore((s) => s.playback.playbackSpeed);
  const totalDuration = useWeddingStore((s) => s.playback.totalDuration);
  const currentScene = useWeddingStore((s) => s.playback.currentScene);
  const isFinished = useWeddingStore((s) => s.playback.isFinished);
  const updateCurrentTime = useWeddingStore((s) => s.updateCurrentTime);
  const pause = useWeddingStore((s) => s.pause);
  const activeMusicTrack = useWeddingStore(
    (s) => s.project.audioTracks.find((t) => t.isGlobal) || s.project.audioTracks[0]
  );

  const lastTickTime = useRef<number>(performance.now());
  const rafId = useRef<number | null>(null);

  // Audio synchronization
  useEffect(() => {
    if (isPlaying) {
      audioEngine.unlock().then(() => {
        audioEngine.play(activeMusicTrack?.url);
      });
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, activeMusicTrack]);

  // Handle Remote Messages (Dual screen remote control)
  useEffect(() => {
    const unsubscribe = remoteChannel.subscribe((msg) => {
      const store = useWeddingStore.getState();
      switch (msg.type) {
        case 'PLAY':
          store.play();
          break;
        case 'PAUSE':
          store.pause();
          break;
        case 'TOGGLE_PLAY':
          store.togglePlay();
          break;
        case 'SEEK':
          store.seek(msg.time);
          audioEngine.seek(msg.time);
          break;
        case 'SEEK_CHAPTER':
          store.seekToChapter(msg.chapterId);
          break;
        case 'NEXT_CHAPTER':
          store.nextChapter();
          break;
        case 'PREV_CHAPTER':
          store.prevChapter();
          break;
        case 'RESTART':
          store.restart();
          break;
        case 'SET_VOLUME':
          store.setVolume(msg.volume);
          audioEngine.setVolume(msg.volume);
          break;
        case 'TOGGLE_MUTE':
          store.toggleMute();
          audioEngine.setMuted(!store.playback.isMuted);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  // Main playback tick loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      return;
    }

    lastTickTime.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTickTime.current) / 1000;
      lastTickTime.current = now;

      // Check if scene is final_freeze
      const scene = useWeddingStore.getState().playback.currentScene;
      if (scene && scene.type === 'final_freeze') {
        // Freeze at start of final freeze + 1s, do not increment further, do not loop
        if (currentTime < scene.startTime) {
          updateCurrentTime(scene.startTime);
        }
        return;
      }

      if (currentTime >= totalDuration) {
        pause();
        return;
      }

      const nextTime = currentTime + deltaSec * playbackSpeed;
      updateCurrentTime(nextTime);

      if (isStageMode && Math.floor(nextTime * 2) !== Math.floor(currentTime * 2)) {
        remoteChannel.send({ type: 'TIME_SYNC', currentTime: nextTime });
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying, currentTime, playbackSpeed, totalDuration, isStageMode, updateCurrentTime, pause]);

  return {
    isPlaying,
    currentTime,
    currentScene,
    isFinished,
    totalDuration,
  };
}
