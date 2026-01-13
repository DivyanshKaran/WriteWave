import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const userId = useAuthStore((s) => s.user?.id || (s.user as any)?.userId);
  const [supported, setSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!supported) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    const push = await reg?.pushManager.getSubscription();
    const isSub = !!push;
    setSubscribed(isSub);
    return isSub;
  }, [supported]);

  const registerSW = useCallback(async () => {
    if (!supported) throw new Error('Push not supported');
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    return reg;
  }, [supported]);

  const subscribe = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      if (!userId) throw new Error('Missing user');
      if (!supported) throw new Error('Push not supported');
      if (permission === 'denied') throw new Error('Notifications are blocked');
      if (permission !== 'granted') {
        const p = await Notification.requestPermission();
        setPermission(p);
        if (p !== 'granted') throw new Error('Permission not granted');
      }
      const reg = await registerSW();
      const { data } = await notificationService.getVapidKey();
      const vapidKey = (data && (data.publicKey || data.vapidKey)) || data || '';
      if (!vapidKey) throw new Error('Missing VAPID key');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const body = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: (sub.toJSON() as any).keys.p256dh,
          auth: (sub.toJSON() as any).keys.auth,
        },
      };
      await notificationService.subscribeToPush(userId as any, body as any);
      setSubscribed(true);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Failed to subscribe');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [userId, supported, permission, registerSW]);

  const unsubscribe = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      if (!supported) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      await sub?.unsubscribe();
      if (userId) {
        await notificationService.unsubscribeFromPush(userId as any);
      }
      setSubscribed(false);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Failed to unsubscribe');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [supported, userId]);

  return { supported, permission, subscribed, loading, error, checkSubscription, subscribe, unsubscribe };
}


