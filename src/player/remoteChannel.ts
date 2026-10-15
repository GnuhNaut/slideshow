// Dual-screen multi-window synchronization via BroadcastChannel

export type RemoteMessage =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SEEK'; time: number }
  | { type: 'SEEK_CHAPTER'; chapterId: string }
  | { type: 'NEXT_CHAPTER' }
  | { type: 'PREV_CHAPTER' }
  | { type: 'RESTART' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TIME_SYNC'; currentTime: number };

class RemoteChannelService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: RemoteMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('wedding_film_remote_channel');
      this.channel.onmessage = (event) => {
        const msg = event.data as RemoteMessage;
        this.listeners.forEach((listener) => listener(msg));
      };
    }
  }

  public send(msg: RemoteMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel postMessage failed:', err);
      }
    }
  }

  public subscribe(callback: (msg: RemoteMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public openStageWindow(): Window | null {
    const url = `${window.location.origin}${window.location.pathname}?mode=stage`;
    return window.open(
      url,
      'WeddingFilmStageWindow',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
    );
  }
}

export const remoteChannel = new RemoteChannelService();
