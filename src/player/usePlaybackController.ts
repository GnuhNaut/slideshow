import { useEffect } from 'react';
import { useWeddingStore } from '../app/store';
import { audioEngine } from '../audio/AudioEngine';
import { audioDirector } from '../audio/AudioDirector';
import { remoteChannel } from './remoteChannel';
import { masterClock } from './PlaybackClock';

export function usePlaybackController(_isStageMode: boolean = false) {
  const isPlaying = useWeddingStore((s) => s.playback.isPlaying);
  const currentTime = useWeddingStore((s) => s.playback.currentTime);
  const isFinished = useWeddingStore((s) => s.playback.isFinished);
  const isMuted = useWeddingStore((s) => s.playback.isMuted);
  const totalDuration = useWeddingStore((s) => s.playback.totalDuration);
  const project = useWeddingStore((s) => s.project);
  const timeline = useWeddingStore((s) => s.timeline);

  // Synchronize Audio Director with project & timeline
  useEffect(() => {
    audioDirector.setProject(project, timeline);
  }, [project, timeline]);

  useEffect(() => {
    audioDirector.setMuted(isMuted);
  }, [isMuted]);

  // Synchronize Audio with masterClock
  useEffect(() => {
    const unsub = masterClock.onStatusChange((status) => {
      if (status === 'PLAYING') {
        audioEngine.unlock().then(() => {
          audioDirector.resume();
        });
      } else if (status === 'PAUSED') {
        audioDirector.pause();
      }
    });

    return () => unsub();
  }, []);

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
          audioDirector.setVolume(msg.volume);
          break;
        case 'TOGGLE_MUTE':
          store.toggleMute();
          audioDirector.setMuted(!store.playback.isMuted);
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
