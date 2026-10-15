import { describe, it, expect, vi, beforeEach } from 'vitest';
import { presentationWakeLock } from '../PresentationWakeLock';

describe('PresentationWakeLock', () => {
  beforeEach(() => {
    presentationWakeLock.release();
  });

  it('should initialize with a valid state object', () => {
    const state = presentationWakeLock.getState();
    expect(state).toHaveProperty('status');
    expect(state).toHaveProperty('isActive');
    expect(state).toHaveProperty('isSupported');
  });

  it('should notify subscribers when state changes', async () => {
    const listener = vi.fn();
    const unsub = presentationWakeLock.subscribe(listener);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(String),
      })
    );

    unsub();
  });

  it('should handle release cleanly even if not active', async () => {
    await presentationWakeLock.release();
    expect(presentationWakeLock.getState().isActive).toBe(false);
  });
});
