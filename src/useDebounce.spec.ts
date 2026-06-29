import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from './useDebounce';
import * as vue from 'vue';

describe('useDebounce', () => {
  let unmountHandler: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock onUnmounted to capture the callback
    vi.spyOn(vue, 'onUnmounted').mockImplementation((fn) => {
      unmountHandler = fn as () => void;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    unmountHandler = undefined;
  });

  it('should execute the function after the specified delay', () => {
    const callback = vi.fn();
    const { run } = useDebounce(callback, 1000);

    run();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support a dynamic delay function', () => {
    const callback = vi.fn();
    let delayValue = 1000;
    const { run } = useDebounce(callback, () => delayValue);

    run();
    delayValue = 5000; // Change value, but run() captured the 1000ms delay for this call
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer if called multiple times within the delay', () => {
    const callback = vi.fn();
    const { run } = useDebounce(callback, 1000);

    run();
    vi.advanceTimersByTime(500);
    run(); // Call again before first timer finishes

    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled(); // Should not have fired yet

    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1); // Should fire 1000ms after the second call
  });

  it('should cancel the execution when cancel is called', () => {
    const callback = vi.fn();
    const { run, cancel } = useDebounce(callback, 1000);

    run();
    cancel();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should register an unmount handler that cancels the timer', () => {
    const callback = vi.fn();
    const { run } = useDebounce(callback, 1000);

    expect(vue.onUnmounted).toHaveBeenCalled();
    
    run();
    // Simulate component unmount
    if (unmountHandler) unmountHandler();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });
});