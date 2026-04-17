// Basic service worker for Web Push
self.addEventListener('push', (event) => {
  let data = { title: 'Notification', body: '', icon: undefined, url: undefined };
  try {
    if (event.data) {
      const json = event.data.json();
      data = { ...data, ...json };
    }
  } catch (_) {
    data.body = event.data?.text?.() || '';
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      try {
        const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        let client = null;
        for (const c of allClients) {
          if ('focus' in c) {
            client = c;
            break;
          }
        }
        if (client) {
          if (typeof client.focus === 'function') {
            await client.focus();
          }
          if (typeof client.navigate === 'function') {
            await client.navigate(targetUrl);
          } else if (typeof clients.openWindow === 'function') {
            await clients.openWindow(targetUrl);
          }
        } else if (typeof clients.openWindow === 'function') {
          await clients.openWindow(targetUrl);
        }
      } catch (e) {
        if (typeof clients.openWindow === 'function') {
          await clients.openWindow(targetUrl);
        }
      }
    })()
  );
});
