// Service Worker pour MediSuivi PWA
const CACHE_NAME = 'medisuivi-v1';
const urlsToCache = [
  './Médhi.html',
  './manifest.json'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourner la ressource depuis le cache si disponible
        if (response) {
          return response;
        }
        // Sinon, la récupérer depuis le réseau
        return fetch(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Rappel de médicament',
    icon: '💊',
    badge: '💊',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'confirm',
        title: 'Pris'
      },
      {
        action: 'snooze',
        title: 'Reporter 10 min'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MediSuivi', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'confirm') {
    // Marquer comme pris
    console.log('Médicament marqué comme pris');
  } else if (event.action === 'snooze') {
    // Reporter de 10 minutes
    console.log('Rappel reporté de 10 minutes');
  } else {
    // Ouvrir l'application
    event.waitUntil(
      clients.openWindow('./Médhi.html')
    );
  }
});
