import { describe, it, expect, vi, beforeEach } from 'vitest';
import { masterClock } from '../PlaybackClock';

describe('MasterPlaybackClock V2', () => {
  beforeEach(() => {
    masterClock.init(100, 0);
  });

  it('should initialize with correct totalDuration and currentTime', () => {
    expect(masterClock.getTotalDuration()).toBe(100);
    expect(masterClock.getCurrentTime()).toBe(0);
    expect(masterClock.getStatus()).toBe('IDLE');
  });

  it('should seek accurately and clamp within range', () => {
    masterClock.seek(42.5);
    expect(masterClock.getCurrentTime()).toBe(42.5);

    masterClock.seek(150);
    expect(masterClock.getCurrentTime()).toBe(100);

    masterClock.seek(-10);
    expect(masterClock.getCurrentTime()).toBe(0);
  });

  it('notifies seek listeners with the clamped time and supports unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = masterClock.onSeek(listener);

    masterClock.seek(150);
    expect(listener).toHaveBeenLastCalledWith(100);

    unsubscribe();
    masterClock.seek(25);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should enter FINAL_HOLD cleanly and notify listeners', () => {
    let statusReceived = '';
    const unsub = masterClock.onStatusChange((status) => {
      statusReceived = status;
    });

    masterClock.enterFinalHold();
    expect(masterClock.getStatus()).toBe('FINAL_HOLD');
    expect(masterClock.isFinalHold()).toBe(true);
    expect(statusReceived).toBe('FINAL_HOLD');
    expect(masterClock.getCurrentTime()).toBe(100);

    unsub();
  });

  it('should set playback speed within valid bounds', () => {
    masterClock.setSpeed(1.5);
    expect(masterClock.getPlaybackSpeed()).toBe(1.5);

    masterClock.setSpeed(5.0);
    expect(masterClock.getPlaybackSpeed()).toBe(3.0);
  });
});
