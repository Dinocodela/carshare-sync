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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      let client = allClients.find((c) => 'focus' in c);
      if (client) {
        client.focus();
        (client as WindowClient).navigate(targetUrl);
      } else if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});
