// Service Worker for GitHV IDE Performance Optimization
const CACHE_NAME = 'githv-ide-v1';
const STATIC_CACHE = 'githv-static-v1';
const DYNAMIC_CACHE = 'githv-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add more static assets as needed
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // HTML: Network first, cache fallback
  html: 'network-first',
  // CSS/JS: Stale while revalidate
  assets: 'stale-while-revalidate',
  // Images: Cache first
  images: 'cache-first',
  // API: Network first with short cache
  api: 'network-first-short'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Determine cache strategy based on resource type
    if (pathname.endsWith('.html') || pathname === '/') {
      return await networkFirstStrategy(request, STATIC_CACHE);
    }
    
    if (pathname.match(/\.(css|js)$/)) {
      return await staleWhileRevalidateStrategy(request, STATIC_CACHE);
    }
    
    if (pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/)) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }
    
    if (pathname.startsWith('/api/')) {
      return await networkFirstShortStrategy(request);
    }
    
    // Default to network first
    return await networkFirstStrategy(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Return cached response if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response('Network error occurred', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache-first strategy (good for images, fonts)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network-first strategy (good for HTML, API with long cache)
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network-first with short cache (good for API calls)
async function networkFirstShortStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses for a short time
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header for cache expiration
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      // Return cached response if less than 5 minutes old
      if (cachedAt && (now - parseInt(cachedAt)) < fiveMinutes) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy (good for CSS, JS)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for this strategy
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  return await networkPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('Background sync triggered');
  
  // Implement background sync logic here
  // For example, sync pending file changes, user preferences, etc.
}

// Push notifications (if needed for real-time collaboration)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag || 'default',
      renotify: true,
      requireInteraction: false,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MARK') {
    console.log('Performance mark:', event.data.name, event.data.time);
  }
});