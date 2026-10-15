// Screen Wake Lock API controller for continuous wedding cinema playback
// Prevents screens from sleeping during the entire wedding ceremony presentation

export type WakeLockStatus =
  | 'unsupported'
  | 'idle'
  | 'requested'
  | 'active'
  | 'released'
  | 'denied'
  | 'error';

export interface WakeLockState {
  status: WakeLockStatus;
  isActive: boolean;
  isSupported: boolean;
  errorMessage?: string;
}

type WakeLockListener = (state: WakeLockState) => void;

class PresentationWakeLockManager {
  private sentinel: any = null;
  private state: WakeLockState = {
    status: 'idle',
    isActive: false,
    isSupported: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
  };
  private listeners: Set<WakeLockListener> = new Set();
  private isAutoReacquireEnabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public getState(): WakeLockState {
    return { ...this.state };
  }

  public subscribe(listener: WakeLockListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<WakeLockState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (err) {
        console.error('Error in WakeLock listener:', err);
      }
    });
  }

  public async request(): Promise<boolean> {
    if (!this.state.isSupported) {
      this.updateState({
        status: 'unsupported',
        isActive: false,
        errorMessage: 'Trình duyệt không hỗ trợ Screen Wake Lock API.',
      });
      return false;
    }

    try {
      this.isAutoReacquireEnabled = true;
      this.updateState({ status: 'requested' });

      // Request screen lock
      const wakeLock = (navigator as any).wakeLock;
      const sentinel = await wakeLock.request('screen');
      this.sentinel = sentinel;

      this.sentinel.addEventListener('release', () => {
        if (this.sentinel === sentinel) {
          this.sentinel = null;
          this.updateState({
            status: 'released',
            isActive: false,
          });
        }
      });

      this.updateState({
        status: 'active',
        isActive: true,
        errorMessage: undefined,
      });

      return true;
    } catch (err: any) {
      console.warn('Wake Lock request rejected:', err);
      this.sentinel = null;
      this.updateState({
        status: err.name === 'NotAllowedError' ? 'denied' : 'error',
        isActive: false,
        errorMessage: err.message || 'Không thể kích hoạt giữ sáng màn hình.',
      });
      return false;
    }
  }

  public async release(): Promise<void> {
    this.isAutoReacquireEnabled = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn('Error releasing wake lock:', err);
      }
      this.sentinel = null;
    }
    this.updateState({
      status: 'idle',
      isActive: false,
    });
  }

  private handleVisibilityChange = async () => {
    if (
      this.isAutoReacquireEnabled &&
      document.visibilityState === 'visible' &&
      !this.state.isActive
    ) {
      // Auto re-acquire wake lock when tab returns to focus
      await this.request();
    }
  };

  public destroy() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.release();
    this.listeners.clear();
  }
}

export const presentationWakeLock = new PresentationWakeLockManager();
