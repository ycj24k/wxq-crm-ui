/**
 * 节流Hook
 */
import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  const lastRunRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        fn(...args);
        lastRunRef.current = now;
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        timerRef.current = setTimeout(() => {
          fn(...args);
          lastRunRef.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [fn, delay]
  ) as T;

  return throttledFn;
}