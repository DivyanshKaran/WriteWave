import { analyticsService } from '@/lib/api-client';

export function initClientObservability() {
  const enabled = (() => {
    try {
      const flag = (import.meta as any)?.env?.VITE_ENABLE_ANALYTICS;
      if (typeof flag === 'string') return flag === 'true' || flag === '1';
      return Boolean(flag ?? true);
    } catch {
      return true;
    }
  })();

  if (!enabled) return;

  const report = async (event: string, data: Record<string, any>) => {
    try {
      await analyticsService.trackEvent({ event, properties: data });
    } catch {
      // ignore
    }
  };

  window.addEventListener('error', (e) => {
    report('client_error', {
      message: e.message,
      filename: (e as any).filename,
      lineno: (e as any).lineno,
      colno: (e as any).colno,
      stack: e.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason: any = e.reason || {};
    report('unhandled_rejection', {
      message: reason?.message || String(reason),
      stack: reason?.stack,
    });
  });
}


