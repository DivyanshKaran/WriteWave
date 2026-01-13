self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'WriteWave Notification';
    const options = {
      body: data.body || data.content || '',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || undefined,
      renotify: !!data.renotify,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // no-op
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-click', data: event.notification.data });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});


