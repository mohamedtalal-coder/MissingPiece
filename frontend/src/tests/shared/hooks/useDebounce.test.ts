import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../../shared/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('puzzle', 300));
    expect(result.current).toBe('puzzle');
  });

  it('updates only after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'atelier', delay: 300 });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('atelier');
  });

  it('resets the timer when the value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'm' } },
    );

    rerender({ value: 'mi' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender({ value: 'missing' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('m');

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe('missing');
  });
});
