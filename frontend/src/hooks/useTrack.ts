import { useCallback, useMemo, useRef } from 'react';
import { analyticsService, EventData } from '@/lib/api-client';

export function useTrack() {
  const timer = useRef<number | null>(null);
  const queue = useRef<EventData[]>([]);
  const enabled = useMemo(() => {
    try {
      const flag = (import.meta as any)?.env?.VITE_ENABLE_ANALYTICS;
      if (typeof flag === 'string') return flag === 'true' || flag === '1';
      return Boolean(flag ?? true);
    } catch {
      return true;
    }
  }, []);

  const flush = useCallback(async () => {
    if (queue.current.length === 0) return;
    const batch = queue.current.splice(0, queue.current.length);
    try {
      await Promise.all(
        batch.map(evt => analyticsService.trackEvent(evt))
      );
    } catch (_) {
      // ignore analytics failures
    }
  }, []);

  const track = useCallback((evt: EventData) => {
    if (!enabled) return;
    queue.current.push(evt);
    if (timer.current) return;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      flush();
    }, 500);
  }, [flush, enabled]);

  return { track };
}


