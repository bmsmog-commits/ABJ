/**
 * ABJ Foundation Service Worker
 * Handles caching, offline functionality, and push notifications
 */

const CACHE_NAME = 'abj-foundation-v1.0.0';
const STATIC_CACHE = 'abj-static-v1.0.0';
const DYNAMIC_CACHE = 'abj-dynamic-v1.0.0';
const API_CACHE = 'abj-api-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/donate.html',
  '/login.html',
  '/signup.html',
  '/dashboard.html',
  '/profile.html',
  '/request-help.html',
  '/notifications.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/donate.js',
  '/js/request.js',
  '/js/profile.js',
  '/js/notifications.js',
  '/components/navbar.html',
  '/components/footer.html',
  '/images/logo.png',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/pwa/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user/profile',
  '/api/donations',
  '/api/requests',
  '/api/notifications'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle HTML pages
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Default network-first for other requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(request);
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      const responseClone = response.clone();
      caches.open(API_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }

    return response;
  } catch (error) {
    // Return cached version for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Please check your internet connection.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  } catch (error) {
    // Return offline fallback for critical assets
    if (request.url.includes('logo') || request.url.includes('icon')) {
      return caches.match('/images/logo.png');
    }
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  } catch (error) {
    // Return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/index.html');
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ABJ Foundation',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/dashboard.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open dashboard
    event.waitUntil(
      clients.openWindow('/dashboard.html')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'background-sync-donations') {
    event.waitUntil(syncPendingDonations());
  }

  if (event.tag === 'background-sync-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Sync pending donations
async function syncPendingDonations() {
  try {
    const pendingDonations = await getPendingData('pending-donations');

    for (const donation of pendingDonations) {
      try {
        await fetch('/api/donations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${donation.token}`
          },
          body: JSON.stringify(donation.data)
        });

        // Remove from pending
        await removePendingData('pending-donations', donation.id);
      } catch (error) {
        console.error('Failed to sync donation:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync pending requests
async function syncPendingRequests() {
  try {
    const pendingRequests = await getPendingData('pending-requests');

    for (const request of pendingRequests) {
      try {
        const formData = new FormData();
        Object.keys(request.data).forEach(key => {
          formData.append(key, request.data[key]);
        });

        await fetch('/api/requests', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${request.token}`
          },
          body: formData
        });

        // Remove from pending
        await removePendingData('pending-requests', request.id);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers for offline data
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('abj-foundation-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores for pending data
      if (!db.objectStoreNames.contains('pending-donations')) {
        db.createObjectStore('pending-donations', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingData(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingData(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];

  for (const cacheName of cacheNames) {
    if (!validCaches.includes(cacheName)) {
      await caches.delete(cacheName);
    }
  }

  // Clean up old API cache entries (older than 1 hour)
  const apiCache = await caches.open(API_CACHE);
  const keys = await apiCache.keys();
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  for (const request of keys) {
    const response = await apiCache.match(request);
    if (response) {
      const date = response.headers.get('date');
      if (date && new Date(date).getTime() < oneHourAgo) {
        await apiCache.delete(request);
      }
    }
  }
}