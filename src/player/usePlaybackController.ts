import { useEffect } from 'react';
import { useWeddingStore } from '../app/store';
import { audioEngine } from '../audio/AudioEngine';
import { remoteChannel } from './remoteChannel';
import { masterClock } from './PlaybackClock';

export function usePlaybackController(isStageMode: boolean = false) {
  const isPlaying = useWeddingStore((s) => s.playback.isPlaying);
  const currentTime = useWeddingStore((s) => s.playback.currentTime);
  const isFinished = useWeddingStore((s) => s.playback.isFinished);
  const totalDuration = useWeddingStore((s) => s.playback.totalDuration);
  const activeMusicTrack = useWeddingStore(
    (s) => s.project.audioTracks.find((t) => t.isGlobal) || s.project.audioTracks[0]
  );

  // Synchronize Audio with masterClock
  useEffect(() => {
    const unsub = masterClock.onStatusChange((status) => {
      if (status === 'PLAYING') {
        audioEngine.unlock().then(() => {
          audioEngine.play(activeMusicTrack?.url);
        });
      } else if (status === 'PAUSED') {
        audioEngine.pause();
      } else if (status === 'FINAL_HOLD') {
        // Soft audio fade out on final hold
        audioEngine.pause();
      }
    });

    return () => unsub();
  }, [activeMusicTrack]);

  // Handle Dual Screen Remote Messages
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

  return {
    isPlaying,
    currentTime,
    isFinished,
    totalDuration,
  };
}
